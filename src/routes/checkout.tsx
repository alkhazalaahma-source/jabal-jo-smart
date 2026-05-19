import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "إتمام الطلب — JABAL" }] }),
  component: Checkout,
});

const CITIES = ["عمّان", "إربد", "الزرقاء", "العقبة", "السلط", "الكرك", "معان", "الطفيلة", "جرش", "عجلون", "المفرق", "مادبا"];

function Checkout() {
  const { lang, t } = useI18n();
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState({ full_name: "", phone: "", city: "عمّان", address: "", notes: "", payment: "cash" });
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("full_name,phone,city").eq("id", user.id).single().then(({ data }) => {
        if (data) setF((s) => ({ ...s, full_name: data.full_name ?? "", phone: data.phone ?? "", city: data.city ?? "عمّان" }));
      });
    }
  }, [user]);

  const delivery = 5;
  const discount = applied?.amount ?? 0;
  const total = Math.max(0, subtotal + delivery - discount);

  const applyCode = async () => {
    if (!code.trim()) return;
    setCodeLoading(true);
    const { data, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();
    setCodeLoading(false);
    if (error || !data) { toast.error(lang === "ar" ? "كود غير صالح" : "Invalid code"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error(lang === "ar" ? "انتهت صلاحية الكود" : "Code expired"); return; }
    if (data.max_uses && data.used_count >= data.max_uses) { toast.error(lang === "ar" ? "استُنفد الكود" : "Code limit reached"); return; }
    if (subtotal < Number(data.min_order)) { toast.error(lang === "ar" ? `الحد الأدنى للطلب ${data.min_order} د.أ` : `Min order ${data.min_order} JOD`); return; }
    const amount = data.discount_type === "percent" ? (subtotal * Number(data.discount_value)) / 100 : Number(data.discount_value);
    setApplied({ code: data.code, amount: Math.min(amount, subtotal) });
    toast.success(lang === "ar" ? `تم تطبيق خصم ${amount.toFixed(2)} د.أ` : `Discount ${amount.toFixed(2)} JOD applied`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error(lang === "ar" ? "سجّل الدخول أولاً" : "Sign in first"); nav({ to: "/auth", search: { redirect: "/checkout" } as never }); return; }
    if (items.length === 0) return;
    setLoading(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      full_name: f.full_name,
      phone: f.phone,
      city: f.city,
      address: f.address,
      notes: f.notes || null,
      subtotal,
      delivery_fee: delivery,
      total,
      discount_code: applied?.code ?? null,
      discount_amount: discount,
      payment_method: (f.payment === "bank" ? "bank_transfer" : f.payment) as "cash" | "cliq" | "bank_transfer",
    }).select("id,order_number").single();
    if (error || !order) { setLoading(false); toast.error(error?.message ?? "Error"); return; }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: lang === "ar" ? i.product?.name_ar ?? "" : i.product?.name_en ?? "",
      unit_price: i.product?.price ?? 0,
      quantity: i.quantity,
      subtotal: (i.product?.price ?? 0) * i.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    await clear();
    setDone(order.order_number);
    setLoading(false);
  };

  if (done) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 max-w-md text-center">
          <CheckCircle2 className="h-20 w-20 mx-auto text-success mb-4" />
          <h2 className="text-3xl font-black mb-2">{t("order_success")}</h2>
          <p className="text-muted-foreground mb-2">{t("order_number")}</p>
          <p className="text-2xl font-bold text-orange-grad mb-6">{done}</p>
          {f.payment === "cliq" && (
            <div className="bg-muted rounded-xl p-4 mb-6 text-sm">
              {lang === "ar" ? "حوّل المبلغ عبر CliQ إلى: " : "Transfer via CliQ to: "}
              <span className="font-bold" dir="ltr">+962 79 293 1516</span>
              <div className="text-xs text-muted-foreground mt-1">jabaljo42@gmail.com</div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link to="/orders"><Button>{t("nav_orders")}</Button></Link>
            <Link to="/marketplace"><Button variant="outline">{t("cta_browse")}</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">{t("cart_empty")}</h2>
          <Link to="/marketplace"><Button className="mt-4">{t("cta_browse")}</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-6">{t("checkout")}</h1>
        <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-lg">{t("shipping_to")}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>{t("full_name")}</Label><Input required value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
                <div><Label>{t("phone")}</Label><Input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
                <div>
                  <Label>{t("city")}</Label>
                  <Select value={f.city} onValueChange={(v) => setF({ ...f, city: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>{t("address")}</Label><Input required value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>{t("notes")}</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4">{t("payment_method")}</h3>
              <RadioGroup value={f.payment} onValueChange={(v) => setF({ ...f, payment: v })} className="space-y-2">
                {[
                  { v: "cash", l: t("pay_cash"), d: lang === "ar" ? "ادفع عند استلام الشحنة" : "Pay upon delivery" },
                  { v: "cliq", l: t("pay_cliq"), d: lang === "ar" ? "حوّل عبر CliQ إلى +962 79 293 1516" : "Transfer via CliQ to +962 79 293 1516" },
                  { v: "bank", l: t("pay_bank"), d: lang === "ar" ? "تحويل بنكي مباشر" : "Direct bank transfer" },
                ].map((p) => (
                  <label key={p.v} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                    <RadioGroupItem value={p.v} />
                    <div><div className="font-semibold">{p.l}</div><div className="text-xs text-muted-foreground">{p.d}</div></div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4">{t("order_summary")}</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {items.map((i) => (
                <div key={i.product_id} className="flex justify-between text-sm">
                  <span className="line-clamp-1">{lang === "ar" ? i.product?.name_ar : i.product?.name_en} ×{i.quantity}</span>
                  <span className="font-semibold shrink-0 ms-2">{(Number(i.product?.price ?? 0) * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-2 text-sm mt-3">
              <div className="flex justify-between"><span>{t("cart_subtotal")}</span><span>{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>{t("delivery")}</span><span>{delivery.toFixed(2)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-black"><span>{t("total")}</span><span className="text-orange-grad">{total.toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}</span></div>
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-4 bg-orange-grad text-accent-foreground hover:opacity-90" size="lg">
              {loading ? t("loading") : t("place_order")}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
