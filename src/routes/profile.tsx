import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Crown, Package, Gift, Lock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "حسابي — JABAL" }] }),
  component: Profile,
});

function Profile() {
  const { lang, t } = useI18n();
  const { user, loading, signOut } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ full_name: "", phone: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [loyalty, setLoyalty] = useState(0);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth", search: { redirect: "/profile" } as never }); }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,phone,city,loyalty_points").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setF({ full_name: data.full_name ?? "", phone: data.phone ?? "", city: data.city ?? "" });
        setLoyalty(data.loyalty_points ?? 0);
      }
    });
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      setRoles((data ?? []).map((r) => r.role as string));
    });
    supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "admin").then(({ count }) => {
      setAdminExists((count ?? 0) > 0);
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(f).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
  };

  const claimAdmin = async () => {
    if (!user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم منحك صلاحيات المدير" : "Admin role granted");
    setRoles((r) => [...r, "admin"]);
    setAdminExists(true);
  };

  const roleLabel = (r: string) => {
    if (lang === "ar") return r === "admin" ? "مدير" : r === "contractor" ? "مقاول" : r === "supplier" ? "مورد" : "عميل";
    return r;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <h1 className="text-3xl font-black">{t("nav_profile")}</h1>

        {/* Roles & Loyalty card */}
        <div className="bg-card border rounded-xl p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> {lang === "ar" ? "صلاحياتي" : "My Roles"}</div>
            <div className="flex flex-wrap gap-1.5">
              {roles.length === 0 ? <span className="text-sm text-muted-foreground">—</span> : roles.map((r) => (
                <Badge key={r} className={r === "admin" ? "bg-orange-grad text-accent-foreground" : ""}>
                  {r === "admin" && <Crown className="h-3 w-3 me-1" />}{roleLabel(r)}
                </Badge>
              ))}
            </div>
            {adminExists === false && !roles.includes("admin") && (
              <Button onClick={claimAdmin} size="sm" className="mt-3 bg-orange-grad text-accent-foreground">
                <Crown className="h-4 w-4 me-1.5" /> {lang === "ar" ? "تفعيل حساب المدير الأول" : "Claim first admin"}
              </Button>
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Gift className="h-3.5 w-3.5" /> {lang === "ar" ? "نقاط الولاء" : "Loyalty Points"}</div>
            <div className="text-2xl font-black text-orange-grad">{loyalty}</div>
            <Link to="/referral" className="text-xs text-accent hover:underline">{lang === "ar" ? "ادعُ أصدقاء واربح" : "Refer & earn →"}</Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Link to="/orders"><Button variant="outline" className="w-full"><Package className="h-4 w-4 me-1.5" />{t("nav_orders")}</Button></Link>
          <Link to="/turnkey/projects"><Button variant="outline" className="w-full">{lang === "ar" ? "مشاريعي" : "Projects"}</Button></Link>
          <Link to="/security"><Button variant="outline" className="w-full"><Lock className="h-4 w-4 me-1.5" />2FA</Button></Link>
          <Link to="/subscription"><Button variant="outline" className="w-full">{lang === "ar" ? "اشتراكي" : "Plan"}</Button></Link>
        </div>

        <form onSubmit={save} className="bg-card border rounded-xl p-6 space-y-4">
          <div><Label>{t("email")}</Label><Input value={user?.email ?? ""} disabled /></div>
          <div><Label>{t("full_name")}</Label><Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
          <div><Label>{t("phone")}</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>{t("city")}</Label><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="bg-orange-grad text-accent-foreground hover:opacity-90">{saving ? t("loading") : (lang === "ar" ? "حفظ" : "Save")}</Button>
            <Button type="button" variant="outline" onClick={() => signOut()}>{t("logout")}</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
