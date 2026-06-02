import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, Send, Calculator } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_TYPES, estimateCost } from "@/lib/project-types";
import { toast } from "sonner";

export const Route = createFileRoute("/turnkey/new")({
  head: () => ({ meta: [{ title: "ابدأ مشروعك — JABAL Build Your Project" }] }),
  component: NewProjectPage,
});

function NewProjectPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    full_name: "", phone: "", email: "",
    project_type: "residential", custom_type: "", area_m2: "", floors: "1",
    city: "", address: "",
    budget_min: "", budget_max: "",
    finish_level: "standard",
    description: "",
    plans_urls: "",
  });

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const estimate = useMemo(() => {
    const a = Number(f.area_m2);
    if (!a || a <= 0) return 0;
    return estimateCost(f.project_type, a, Number(f.floors) || 1, f.finish_level);
  }, [f.project_type, f.area_m2, f.floors, f.finish_level]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(lang === "ar" ? "سجّل الدخول أولاً لإرسال المشروع" : "Please sign in to submit");
      nav({ to: "/auth", search: { redirect: "/turnkey/new" } });
      return;
    }
    if (!f.full_name || f.phone.length < 6 || !f.city || !f.area_m2) {
      toast.error(lang === "ar" ? "أكمل الحقول المطلوبة" : "Complete required fields");
      return;
    }
    setSaving(true);
    const photos = f.plans_urls.split(/[\s,]+/).filter(Boolean);
    const finalType = f.project_type === "other" && f.custom_type.trim()
      ? f.custom_type.trim().slice(0, 80)
      : f.project_type;
    const { data, error } = await supabase
      .from("turnkey_projects" as never)
      .insert({
        user_id: user.id,
        full_name: f.full_name,
        phone: f.phone,
        email: f.email || null,
        project_type: finalType,
        area_m2: Number(f.area_m2),
        floors: Number(f.floors || "1"),
        city: f.city,
        address: f.address || null,
        budget_min: f.budget_min ? Number(f.budget_min) : null,
        budget_max: f.budget_max ? Number(f.budget_max) : null,
        finish_level: f.finish_level,
        description: f.description || null,
        plans_urls: photos,
      } as never)
      .select("id, project_number")
      .single();
    setSaving(false);
    if (error) return toast.error(error.message);
    const row = data as { id: string; project_number: string };
    toast.success(lang === "ar" ? `تم إنشاء المشروع رقم ${row.project_number}` : `Project ${row.project_number} created`);
    nav({ to: "/turnkey/$id", params: { id: row.id } });
  };


  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-grad text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-3">
            <Building2 className="h-4 w-4" /> {lang === "ar" ? "ابنِ مشروعك الآن" : "Build Your Project Now"}
          </div>
          <h1 className="text-3xl font-black">{lang === "ar" ? "أخبرنا بتفاصيل مشروعك" : "Tell us about your project"}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{lang === "ar" ? "ندرس طلبك ونعود إليك بعرض تفصيلي خلال 24 ساعة" : "We'll review and reply with a detailed proposal within 24h"}</p>
        </div>

        <form onSubmit={submit} className="bg-card border rounded-2xl p-6 shadow-card space-y-5">
          <div className="grid md:grid-cols-2 gap-3">
            <div><Label>{lang === "ar" ? "الاسم الكامل *" : "Full name *"}</Label><Input value={f.full_name} onChange={(e) => set("full_name", e.target.value)} /></div>
            <div><Label>{lang === "ar" ? "الهاتف *" : "Phone *"}</Label><Input dir="ltr" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><Label>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</Label><Input type="email" dir="ltr" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div>
              <Label>{lang === "ar" ? "نوع المشروع *" : "Project type *"}</Label>
              <Select value={f.project_type} onValueChange={(v) => set("project_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {PROJECT_TYPES.map((pt) => (
                    <SelectItem key={pt.value} value={pt.value}>
                      <span className="me-2">{pt.icon}</span>{lang === "ar" ? pt.ar : pt.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {f.project_type === "other" && (
              <div className="md:col-span-2">
                <Label>{lang === "ar" ? "اكتب نوع مشروعك *" : "Describe your project type *"}</Label>
                <Input
                  value={f.custom_type}
                  onChange={(e) => set("custom_type", e.target.value)}
                  placeholder={lang === "ar" ? "مثال: حظيرة دواجن، مرسم..." : "e.g. Poultry farm, art studio..."}
                />
              </div>
            )}
            <div><Label>{lang === "ar" ? "المساحة (م²) *" : "Area (m²) *"}</Label><Input type="number" value={f.area_m2} onChange={(e) => set("area_m2", e.target.value)} /></div>
            <div><Label>{lang === "ar" ? "عدد الطوابق" : "Floors"}</Label><Input type="number" min="1" value={f.floors} onChange={(e) => set("floors", e.target.value)} /></div>
            <div><Label>{lang === "ar" ? "المدينة *" : "City *"}</Label><Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder={lang === "ar" ? "عمّان، إربد..." : "Amman, Irbid..."} /></div>
            <div><Label>{lang === "ar" ? "العنوان" : "Address"}</Label><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div><Label>{lang === "ar" ? "الميزانية من (د.أ)" : "Budget from (JOD)"}</Label><Input type="number" value={f.budget_min} onChange={(e) => set("budget_min", e.target.value)} /></div>
            <div><Label>{lang === "ar" ? "الميزانية إلى (د.أ)" : "Budget to (JOD)"}</Label><Input type="number" value={f.budget_max} onChange={(e) => set("budget_max", e.target.value)} /></div>
            <div>
              <Label>{lang === "ar" ? "مستوى التشطيب" : "Finish level"}</Label>
              <Select value={f.finish_level} onValueChange={(v) => set("finish_level", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">{lang === "ar" ? "اقتصادي" : "Economy"}</SelectItem>
                  <SelectItem value="standard">{lang === "ar" ? "قياسي" : "Standard"}</SelectItem>
                  <SelectItem value="deluxe">{lang === "ar" ? "ديلوكس" : "Deluxe"}</SelectItem>
                  <SelectItem value="luxury">{lang === "ar" ? "فاخر" : "Luxury"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{lang === "ar" ? "وصف المشروع" : "Project description"}</Label>
            <Textarea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder={lang === "ar" ? "تفاصيل عن المشروع، عدد الغرف، المتطلبات الخاصة..." : "Project details, rooms, special requirements..."} />
          </div>

          <div>
            <Label>{lang === "ar" ? "روابط المخططات/الصور (مفصولة بفاصلة)" : "Plans/photos URLs (comma separated)"}</Label>
            <Textarea rows={2} value={f.plans_urls} onChange={(e) => set("plans_urls", e.target.value)} placeholder="https://..." dir="ltr" />
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-orange-grad text-accent-foreground" size="lg">
            <Send className="h-4 w-4 me-2" /> {saving ? (lang === "ar" ? "جارٍ الإرسال..." : "Submitting...") : (lang === "ar" ? "إرسال المشروع" : "Submit project")}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {lang === "ar" ? "بإرسالك للمشروع توافق على " : "By submitting you agree to our "}
            <Link to="/terms" className="text-accent hover:underline">{lang === "ar" ? "الشروط" : "Terms"}</Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
