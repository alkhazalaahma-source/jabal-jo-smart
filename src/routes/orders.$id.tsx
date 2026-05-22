import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, CheckCircle2, Truck, Home, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({ meta: [{ title: "تتبع الطلب — JABAL" }] }),
  component: OrderDetail,
});

type Order = { id: string; order_number: string; created_at: string; total: number; status: string; payment_method: string; city: string; address: string; full_name: string; phone: string; subtotal: number; tax: number; delivery_fee: number; discount_amount: number };
type Item = { id: string; product_name: string; quantity: number; unit_price: number; subtotal: number };
type Track = { id: string; status: string; note: string | null; created_at: string };

const STAGES = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"] as const;
const STAGE_LABEL: Record<string, { ar: string; en: string; icon: typeof Package }> = {
  pending: { ar: "بانتظار التأكيد", en: "Pending", icon: Clock },
  confirmed: { ar: "تم التأكيد", en: "Confirmed", icon: CheckCircle2 },
  preparing: { ar: "قيد التجهيز", en: "Preparing", icon: Package },
  out_for_delivery: { ar: "خرج للتوصيل", en: "Out for Delivery", icon: Truck },
  delivered: { ar: "تم التسليم", en: "Delivered", icon: Home },
};

function OrderDetail() {
  const { id } = useParams({ from: "/orders/$id" });
  const { lang } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [tracking, setTracking] = useState<Track[]>([]);

  useEffect(() => {
    supabase.from("orders").select("*").eq("id", id).maybeSingle().then(({ data }) => setOrder(data as Order));
    supabase.from("order_items").select("*").eq("order_id", id).then(({ data }) => setItems((data ?? []) as Item[]));
    supabase.from("order_tracking").select("*").eq("order_id", id).order("created_at", { ascending: true }).then(({ data }) => setTracking((data ?? []) as Track[]));
  }, [id]);

  if (!order) return <Layout><div className="container mx-auto px-4 py-20 text-center">{lang === "ar" ? "جاري التحميل..." : "Loading..."}</div></Layout>;

  const currentIdx = STAGES.indexOf(order.status as never);
  const j = lang === "ar" ? "د.أ" : "JOD";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/orders" className="text-sm text-accent hover:underline">← {lang === "ar" ? "كل الطلبات" : "All orders"}</Link>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-6">
          <div>
            <h1 className="text-2xl font-black">{order.order_number}</h1>
            <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</p>
          </div>
          <Badge className="text-base px-3 py-1">{STAGE_LABEL[order.status]?.[lang] || order.status}</Badge>
        </div>

        {/* Timeline */}
        <div className="bg-card border rounded-xl p-6 mb-6">
          <h2 className="font-bold mb-5">{lang === "ar" ? "مراحل التوصيل" : "Delivery Timeline"}</h2>
          <div className="flex justify-between items-start relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted" />
            <div className="absolute top-5 left-5 h-0.5 bg-accent transition-all" style={{ width: `${(Math.max(currentIdx, 0) / (STAGES.length - 1)) * 95}%` }} />
            {STAGES.map((s, i) => {
              const Icon = STAGE_LABEL[s].icon;
              const done = i <= currentIdx;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center text-center" style={{ width: `${100 / STAGES.length}%` }}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${done ? "bg-orange-grad text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-2 ${done ? "font-semibold" : "text-muted-foreground"}`}>{STAGE_LABEL[s][lang]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-bold mb-3">{lang === "ar" ? "تفاصيل الشحن" : "Shipping"}</h3>
            <div className="text-sm space-y-1">
              <div>{order.full_name}</div>
              <div>{order.phone}</div>
              <div className="text-muted-foreground">{order.city} — {order.address}</div>
              <div className="text-muted-foreground">{lang === "ar" ? "الدفع:" : "Payment:"} {order.payment_method}</div>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <h3 className="font-bold mb-3">{lang === "ar" ? "ملخص" : "Summary"}</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span>{lang === "ar" ? "المجموع" : "Subtotal"}</span><span>{Number(order.subtotal).toFixed(2)} {j}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>{lang === "ar" ? "خصم" : "Discount"}</span><span>-{Number(order.discount_amount).toFixed(2)} {j}</span></div>}
              <div className="flex justify-between"><span>{lang === "ar" ? "توصيل" : "Delivery"}</span><span>{Number(order.delivery_fee).toFixed(2)} {j}</span></div>
              <div className="flex justify-between font-black text-base pt-2 border-t mt-2"><span>{lang === "ar" ? "الإجمالي" : "Total"}</span><span className="text-orange-grad">{Number(order.total).toFixed(2)} {j}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-5 mt-4">
          <h3 className="font-bold mb-3">{lang === "ar" ? "المنتجات" : "Items"}</h3>
          <div className="space-y-2 text-sm">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between py-2 border-b last:border-0">
                <span>{it.product_name} × {it.quantity}</span>
                <span className="font-semibold">{Number(it.subtotal).toFixed(2)} {j}</span>
              </div>
            ))}
          </div>
        </div>

        {tracking.length > 0 && (
          <div className="bg-card border rounded-xl p-5 mt-4">
            <h3 className="font-bold mb-3">{lang === "ar" ? "السجل" : "History"}</h3>
            <div className="space-y-3 text-sm">
              {tracking.map((t) => (
                <div key={t.id} className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent mt-2" />
                  <div>
                    <div className="font-medium">{STAGE_LABEL[t.status]?.[lang] || t.status}</div>
                    {t.note && <div className="text-muted-foreground text-xs">{t.note}</div>}
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
