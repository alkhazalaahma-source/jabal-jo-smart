import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useRoles, roleLabel } from "@/lib/roles";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحتي — JABAL" },
      { name: "description", content: "لوحة تحكم حسب دورك في منصة جبل: مدير، مورد، سائق أو عميل." },
      { property: "og:title", content: "لوحتي — JABAL" },
      { property: "og:description", content: "لوحة تحكم حسب الدور في منصة جبل." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type Order = { id: string; order_number: string; full_name: string; city: string; total: number; status: string; driver_id: string | null; created_at: string | null };

const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

function Dashboard() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user, loading: aLoading } = useAuth();
  const { roles, loading, isAdmin, isSupplier, has } = useRoles();

  if (aLoading || loading) return <Layout><div className="container mx-auto p-8">…</div></Layout>;
  if (!user)
    return (
      <Layout>
        <div className="container mx-auto p-8 text-center">
          <p className="mb-4">{ar ? "سجّل الدخول لعرض لوحتك" : "Sign in to view your dashboard"}</p>
          <Link to="/auth" search={{ redirect: "/dashboard" }}><Button>{ar ? "تسجيل الدخول" : "Sign in"}</Button></Link>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black">{ar ? "لوحتي" : "My dashboard"}</h1>
          <p className="text-sm text-muted-foreground">{ar ? "دورك: " : "Role: "}{roles.map((r) => roleLabel(r, lang)).join("، ") || roleLabel("customer", lang)}</p>
        </div>
        {isAdmin && <AdminPanel ar={ar} />}
        {isSupplier && <SupplierPanel ar={ar} />}
        {has("driver") && <DriverPanel ar={ar} />}
        {!isAdmin && !isSupplier && !has("driver") && (
          <div className="bg-card border rounded-2xl p-6">
            <p className="mb-3">{ar ? "تابع طلباتك ومشاريعك من هنا." : "Track your orders and projects."}</p>
            <div className="flex gap-2 flex-wrap">
              <Link to="/orders"><Button>{ar ? "طلباتي" : "My orders"}</Button></Link>
              <Link to="/turnkey/projects"><Button variant="outline">{ar ? "مشاريعي" : "My projects"}</Button></Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function AdminPanel({ ar }: { ar: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<string[]>([]);
  const load = async () => {
    const { data } = await supabase.from("orders").select("id,order_number,full_name,city,total,status,driver_id,created_at").order("created_at", { ascending: false }).limit(50);
    setOrders((data ?? []) as Order[]);
    const { data: d } = await supabase.from("user_roles").select("user_id").eq("role", "driver");
    setDrivers((d ?? []).map((x) => x.user_id));
  };
  useEffect(() => { load(); }, []);
  const update = async (id: string, patch: Partial<Order>) => {
    const { error } = await supabase.from("orders").update(patch as never).eq("id", id);
    if (error) return toast.error(error.message);
    if (patch.status) await supabase.from("order_tracking").insert({ order_id: id, status: patch.status });
    toast.success(ar ? "تم التحديث" : "Updated");
    load();
  };
  return (
    <section className="bg-card border rounded-2xl p-6">
      <h2 className="font-bold text-lg mb-4">{ar ? "إدارة كل الطلبات" : "All orders"}</h2>
      {orders.length === 0 && <p className="text-sm text-muted-foreground">{ar ? "لا توجد طلبات بعد" : "No orders yet"}</p>}
      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-2 border rounded-xl p-3 text-sm">
            <span className="font-mono">{o.order_number}</span>
            <span>{o.full_name} · {o.city}</span>
            <span className="font-bold">{Number(o.total).toFixed(2)} JD</span>
            <select className="border rounded-md px-2 py-1 bg-background" value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="border rounded-md px-2 py-1 bg-background" value={o.driver_id ?? ""} onChange={(e) => update(o.id, { driver_id: e.target.value || null })}>
              <option value="">{ar ? "بدون سائق" : "No driver"}</option>
              {drivers.map((d) => <option key={d} value={d}>{ar ? "سائق " : "Driver "}{d.slice(0, 6)}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

type Prod = { id: string; name_ar: string; price: number; stock_quantity: number | null; in_stock: boolean | null };

function SupplierPanel({ ar }: { ar: boolean }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Prod[]>([]);
  const [company, setCompany] = useState<string | null>(null);
  const load = async () => {
    if (!user) return;
    const { data: c } = await supabase.from("companies").select("id,name_ar,name").eq("owner_id" as never, user.id).maybeSingle();
    const comp = c as { id: string; name_ar: string | null; name: string } | null;
    setCompany(comp ? comp.name_ar ?? comp.name : null);
    if (!comp) return;
    const { data } = await supabase.from("products").select("id,name_ar,price,stock_quantity,in_stock").eq("company_id", comp.id).order("name_ar");
    setProducts((data ?? []) as Prod[]);
  };
  useEffect(() => { load(); }, [user]);
  const save = async (p: Prod) => {
    const { error } = await supabase.from("products").update({ price: p.price, stock_quantity: p.stock_quantity, in_stock: (p.stock_quantity ?? 0) > 0 }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(ar ? "تم الحفظ" : "Saved");
  };
  return (
    <section className="bg-card border rounded-2xl p-6">
      <h2 className="font-bold text-lg mb-1">{ar ? "منتجات شركتي" : "My company products"}</h2>
      <p className="text-sm text-muted-foreground mb-4">{company ?? (ar ? "لم تُربط بشركة بعد" : "No company linked yet")}</p>
      <div className="space-y-2">
        {products.map((p, i) => (
          <div key={p.id} className="flex flex-wrap items-center gap-2 border rounded-xl p-3 text-sm">
            <span className="flex-1 min-w-40">{p.name_ar}</span>
            <Input type="number" className="w-24" value={p.price} onChange={(e) => setProducts(products.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
            <Input type="number" className="w-24" value={p.stock_quantity ?? 0} onChange={(e) => setProducts(products.map((x, j) => j === i ? { ...x, stock_quantity: Number(e.target.value) } : x))} />
            <Button size="sm" onClick={() => save(products[i])}>{ar ? "حفظ" : "Save"}</Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DriverPanel({ ar }: { ar: boolean }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("orders").select("id,order_number,full_name,city,total,status,driver_id,created_at").eq("driver_id" as never, user.id);
    setOrders((data ?? []) as Order[]);
  };
  useEffect(() => { load(); }, [user]);
  const mark = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status } as never).eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("order_tracking").insert({ order_id: id, status });
    load();
  };
  return (
    <section className="bg-card border rounded-2xl p-6">
      <h2 className="font-bold text-lg mb-4">{ar ? "طلبات التوصيل المسندة لي" : "My deliveries"}</h2>
      {orders.length === 0 && <p className="text-sm text-muted-foreground">{ar ? "لا توجد طلبات مسندة" : "No assigned orders"}</p>}
      {orders.map((o) => (
        <div key={o.id} className="flex flex-wrap items-center gap-2 border rounded-xl p-3 text-sm mb-2">
          <span className="font-mono">{o.order_number}</span><span>{o.full_name} · {o.city}</span><span>{o.status}</span>
          <Button size="sm" variant="outline" onClick={() => mark(o.id, "shipped")}>{ar ? "بالطريق" : "On the way"}</Button>
          <Button size="sm" onClick={() => mark(o.id, "delivered")}>{ar ? "تم التسليم" : "Delivered"}</Button>
        </div>
      ))}
    </section>
  );
}
