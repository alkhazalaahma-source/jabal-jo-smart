// Server-side order lifecycle: pricing, coupons, stock and cancellation.
// All money math happens here so the client can never tamper with totals.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DELIVERY_FEE = 5;

const placeOrderSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(1000).optional().nullable(),
  payment_method: z.enum(["cash", "cliq", "bank_transfer"]),
  discount_code: z.string().trim().max(40).optional().nullable(),
  items: z
    .array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(9999) }))
    .min(1)
    .max(60),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => placeOrderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Anti-fraud: cap orders per user per hour
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recent } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if ((recent ?? 0) >= 5) {
      throw new Error("too_many_orders");
    }

    // Authoritative prices from the database
    const ids = data.items.map((i) => i.product_id);
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id,name_ar,name_en,price,stock_quantity,in_stock")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);
    if (!products || products.length !== ids.length) throw new Error("product_missing");

    let subtotal = 0;
    const lines = data.items.map((i) => {
      const p = products.find((x) => x.id === i.product_id)!;
      if (p.in_stock === false) throw new Error(`out_of_stock:${p.name_ar}`);
      if (p.stock_quantity != null && p.stock_quantity > 0 && i.quantity > p.stock_quantity) {
        throw new Error(`insufficient_stock:${p.name_ar}`);
      }
      const unit = Number(p.price);
      subtotal += unit * i.quantity;
      return { product: p, quantity: i.quantity, unit };
    });

    // Coupon validated server-side
    let discount = 0;
    let appliedCode: string | null = null;
    const code = data.discount_code?.trim().toUpperCase();
    if (code) {
      const { data: dc } = await supabase
        .from("discount_codes")
        .select("*")
        .eq("code", code)
        .eq("active", true)
        .maybeSingle();
      if (!dc) throw new Error("invalid_code");
      if (dc.expires_at && new Date(dc.expires_at) < new Date()) throw new Error("code_expired");
      if (dc.max_uses && dc.used_count >= dc.max_uses) throw new Error("code_exhausted");
      if (subtotal < Number(dc.min_order)) throw new Error("code_min_order");
      discount =
        dc.discount_type === "percent"
          ? (subtotal * Number(dc.discount_value)) / 100
          : Number(dc.discount_value);
      discount = Math.min(discount, subtotal);
      appliedCode = dc.code;
    }

    const total = Math.max(0, subtotal + DELIVERY_FEE - discount);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        full_name: data.full_name,
        phone: data.phone,
        city: data.city,
        address: data.address,
        notes: data.notes || null,
        subtotal,
        delivery_fee: DELIVERY_FEE,
        discount_code: appliedCode,
        discount_amount: discount,
        total,
        payment_method: data.payment_method,
      })
      .select("id,order_number")
      .single();
    if (error || !order) throw new Error(error?.message ?? "order_failed");

    const { error: iErr } = await supabase.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        product_name: l.product.name_ar,
        unit_price: l.unit,
        quantity: l.quantity,
        subtotal: l.unit * l.quantity,
      })),
    );
    if (iErr) throw new Error(iErr.message);

    for (const l of lines) {
      await supabase.rpc("decrement_stock", { _product_id: l.product.id, _qty: l.quantity });
    }
    if (appliedCode) await supabase.rpc("consume_discount_code", { _code: appliedCode });

    await supabase.from("cart_items").delete().eq("user_id", userId);

    return { id: order.id, order_number: order.order_number, total, discount };
  });

export const cancelOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ order_id: z.string().uuid(), reason: z.string().trim().max(300).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: order } = await supabase
      .from("orders")
      .select("id,status,user_id")
      .eq("id", data.order_id)
      .maybeSingle();
    if (!order || order.user_id !== userId) throw new Error("not_found");
    if (!["pending", "confirmed"].includes(order.status)) throw new Error("not_cancellable");

    const { error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: data.reason ?? null,
      })
      .eq("id", data.order_id);
    if (error) throw new Error(error.message);

    await supabase.from("order_tracking").insert({
      order_id: data.order_id,
      status: "cancelled",
      note: data.reason ?? null,
    });
    return { ok: true as const };
  });
