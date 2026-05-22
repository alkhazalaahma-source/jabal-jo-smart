import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orders")({
  head: () => ({ meta: [{ title: "طلباتي — JABAL" }] }),
  component: Orders,
});

type Order = { id: string; order_number: string; created_at: string; total: number; status: string; payment_method: string; city: string };

function Orders() {
  const { lang, t } = useI18n();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth", search: { redirect: "/orders" } as never });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => setOrders((data ?? []) as Order[]));
  }, [user]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-6">{t("nav_orders")}</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20"><Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{lang === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}</p></div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link key={o.id} to="/orders/$id" params={{ id: o.id }} className="block bg-card border rounded-xl p-5 hover:border-accent transition-colors">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <div className="font-bold">{o.order_number}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(o.created_at).toLocaleString(lang === "ar" ? "ar-JO" : "en-US")}</div>
                    <div className="text-xs text-muted-foreground">{o.city}</div>
                  </div>
                  <div className="text-end">
                    <div className="text-xl font-black text-orange-grad">{Number(o.total).toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}</div>
                    <Badge className="mt-1">{o.status}</Badge>
                    <div className="text-xs text-accent mt-1">{lang === "ar" ? "تتبع الطلب ←" : "Track →"}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link to="/marketplace" className="block text-center mt-6 text-accent font-semibold hover:underline">{t("cta_browse")}</Link>
      </div>
    </Layout>
  );
}
