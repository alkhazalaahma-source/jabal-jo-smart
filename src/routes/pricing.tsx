import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator, Send, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [
    { title: "التسعير الذكي — JABAL Smart Pricing" },
    { name: "description", content: "احسب تكلفة مشروعك الإنشائي خلال ثوانٍ بمحرك التسعير الذكي من جبل: إسمنت، حديد، بلوك، تشطيبات." },
  ]}),
  component: PricingPage,
});

// JOD per m² assumptions (Jordan market averages 2025–2026)
const BASE_RATES: Record<string, number> = { residential: 280, villa: 360, commercial: 320, warehouse: 180, renovation: 140 };
const FINISH_MULT: Record<string, number> = { economy: 0.85, standard: 1.0, premium: 1.35, luxury: 1.75 };

type Breakdown = { label_ar: string; label_en: string; qty: string; cost: number };

function PricingPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [projectType, setProjectType] = useState("residential");
  const [area, setArea] = useState(150);
  const [floors, setFloors] = useState(1);
  const [finish, setFinish] = useState("standard");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const result = useMemo(() => {
    const total_area = area * floors;
    const base = BASE_RATES[projectType] ?? 280;
    const mult = FINISH_MULT[finish] ?? 1;
    const ratePerM2 = base * mult;
    const total = total_area * ratePerM2;
    // Breakdown shares
    const cement = total * 0.18;
    const steel = total * 0.22;
    const blocks = total * 0.12;
    const aggregates = total * 0.08;
    const finishing = total * 0.20;
    const labor = total * 0.15;
    const other = total - (cement + steel + blocks + aggregates + finishing + labor);

    const cementBags = Math.round(total_area * 7); // ~7 bags / m²
    const steelKg = Math.round(total_area * 55); // ~55 kg / m²
    const blocksQty = Math.round(total_area * 13);
    const concM3 = Math.round(total_area * 0.35);

    const breakdown: Breakdown[] = [
      { label_ar: "إسمنت", label_en: "Cement", qty: `${cementBags} ${lang === "ar" ? "كيس" : "bags"}`, cost: cement },
      { label_ar: "حديد تسليح", label_en: "Rebar Steel", qty: `${steelKg} ${lang === "ar" ? "كغ" : "kg"}`, cost: steel },
      { label_ar: "بلوك", label_en: "Blocks", qty: `${blocksQty} ${lang === "ar" ? "حبة" : "pcs"}`, cost: blocks },
      { label_ar: "رمل وبحص", label_en: "Sand & Gravel", qty: `${concM3} m³`, cost: aggregates },
      { label_ar: "تشطيبات ودهانات", label_en: "Finishing & Paint", qty: `${total_area} m²`, cost: finishing },
      { label_ar: "أجور عمالة", label_en: "Labor", qty: "—", cost: labor },
      { label_ar: "أخرى ومتفرقات", label_en: "Other & misc", qty: "—", cost: other },
    ];
    return { total_area, ratePerM2, total, breakdown };
  }, [projectType, area, floors, finish, lang]);

  const submit = async () => {
    if (!fullName || phone.length < 6) {
      toast.error(lang === "ar" ? "أدخل اسمك ورقم هاتفك" : "Enter name and phone");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("price_quotes").insert({
      user_id: user?.id ?? null,
      full_name: fullName,
      phone,
      project_type: projectType,
      area_m2: area,
      floors,
      finish_level: finish,
      estimated_total: result.total,
      breakdown: result.breakdown as never,
      notes: notes || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(lang === "ar" ? "تم استلام طلبك! سنتواصل معك خلال 24 ساعة." : "Quote saved! We'll contact you within 24h.");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" /> {lang === "ar" ? "محرك التسعير الذكي" : "Smart Pricing Engine"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {lang === "ar" ? "احسب تكلفة مشروعك في 30 ثانية" : "Estimate your project in 30 seconds"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "أرقام تقديرية بناءً على أسعار السوق الأردني الحقيقية لمواد البناء والعمالة."
              : "Live estimates based on real Jordanian market prices for materials & labor."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-card border rounded-2xl p-6 space-y-5 shadow-card">
            <div className="flex items-center gap-2 font-bold text-lg">
              <Calculator className="h-5 w-5 text-accent" />
              {lang === "ar" ? "تفاصيل المشروع" : "Project details"}
            </div>

            <div>
              <Label>{lang === "ar" ? "نوع المشروع" : "Project type"}</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">{lang === "ar" ? "بناء سكني" : "Residential"}</SelectItem>
                  <SelectItem value="villa">{lang === "ar" ? "فيلا فاخرة" : "Luxury villa"}</SelectItem>
                  <SelectItem value="commercial">{lang === "ar" ? "تجاري" : "Commercial"}</SelectItem>
                  <SelectItem value="warehouse">{lang === "ar" ? "مستودع" : "Warehouse"}</SelectItem>
                  <SelectItem value="renovation">{lang === "ar" ? "تجديد / ترميم" : "Renovation"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{lang === "ar" ? "المساحة (م²)" : "Area (m²)"}</Label>
                <Input type="number" min={20} max={20000} value={area} onChange={(e) => setArea(Number(e.target.value) || 0)} />
              </div>
              <div>
                <Label>{lang === "ar" ? "عدد الطوابق" : "Floors"}</Label>
                <Input type="number" min={1} max={20} value={floors} onChange={(e) => setFloors(Number(e.target.value) || 1)} />
              </div>
            </div>

            <div>
              <Label>{lang === "ar" ? "مستوى التشطيب" : "Finish level"}</Label>
              <Select value={finish} onValueChange={setFinish}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">{lang === "ar" ? "اقتصادي" : "Economy"}</SelectItem>
                  <SelectItem value="standard">{lang === "ar" ? "قياسي" : "Standard"}</SelectItem>
                  <SelectItem value="premium">{lang === "ar" ? "ممتاز" : "Premium"}</SelectItem>
                  <SelectItem value="luxury">{lang === "ar" ? "فاخر" : "Luxury"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="font-semibold">{lang === "ar" ? "احصل على عرض رسمي" : "Get a formal quote"}</div>
              <Input placeholder={t("full_name")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input placeholder={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Textarea placeholder={t("notes")} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              <Button onClick={submit} disabled={saving} className="w-full bg-orange-grad text-accent-foreground">
                <Send className="h-4 w-4 me-2" />
                {saving ? t("loading") : (lang === "ar" ? "إرسال طلب عرض السعر" : "Request formal quote")}
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-card border rounded-2xl p-6 shadow-card">
            <div className="text-sm text-muted-foreground">{lang === "ar" ? "التكلفة التقديرية الإجمالية" : "Estimated total cost"}</div>
            <div className="text-4xl md:text-5xl font-black text-orange-grad mt-2 mb-1">
              {result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-lg text-muted-foreground ms-2">{lang === "ar" ? "د.أ" : "JOD"}</span>
            </div>
            <div className="text-sm text-muted-foreground mb-6">
              ≈ {result.ratePerM2.toFixed(0)} {lang === "ar" ? "د.أ/م²" : "JOD/m²"} · {result.total_area} m²
            </div>

            <div className="space-y-2">
              {result.breakdown.map((b) => (
                <div key={b.label_en} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <div>
                    <div className="font-semibold">{lang === "ar" ? b.label_ar : b.label_en}</div>
                    <div className="text-xs text-muted-foreground">{b.qty}</div>
                  </div>
                  <div className="font-bold">{b.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })} {lang === "ar" ? "د.أ" : "JOD"}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              ⚠️ {lang === "ar"
                ? "الأرقام تقديرية ±15% وتشمل المواد والعمالة الأساسية. تواصل معنا لعرض رسمي مفصّل."
                : "Estimates are ±15% and include core materials & labor. Contact us for a detailed formal quote."}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
