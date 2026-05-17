import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  useEffect(() => { if (!loading && !user) nav({ to: "/auth", search: { redirect: "/profile" } as never }); }, [user, loading, nav]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name,phone,city").eq("id", user.id).single().then(({ data }) => {
      if (data) setF({ full_name: data.full_name ?? "", phone: data.phone ?? "", city: data.city ?? "" });
    });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(f).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success(lang === "ar" ? "تم الحفظ" : "Saved");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-3xl font-black mb-6">{t("nav_profile")}</h1>
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
