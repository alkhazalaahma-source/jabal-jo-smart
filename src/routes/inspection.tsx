import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardCheck, MapPin, Video, Home, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/inspection")({
  head: () => ({ meta: [
    { title: "خدمة المعاينة — JABAL Inspection" },
    { name: "description", content: "احجز معاينة موقع، أو معاينة افتراضية بالفيديو، أو معاينة سريعة عن بُعد لمشروعك مع مهندسي جبل." },
  ]}),
  component: InspectionPage,
});

const TYPES = [
  { key: "site", icon: MapPin, ar: "معاينة موقع ميدانية", en: "On-site Inspection", desc_ar: "يزور مهندسنا موقع المشروع لقياس ودراسة كاملة.", desc_en: "Our engineer visits your site for full assessment.", price: "35 JOD" },
  { key: "video", icon: Video, ar: "معاينة بالفيديو", en: "Video Inspection", desc_ar: "مكالمة فيديو حية مع مهندس لتقييم سريع.", desc_en: "Live video call with an engineer for quick assessment.", price: "15 JOD" },
  { key: "remote", icon: ClipboardCheck, ar: "معاينة عن بعد بالصور", en: "Remote Photo Inspection", desc_ar: "أرسل الصور والمخططات ويعود إليك التقرير خلال 24 ساعة.", desc_en: "Send photos & plans, receive a report within 24h.", price: "Free" },
  { key: "vr", icon: Home, ar: "جولة افتراضية 360°", en: "Virtual 360° Tour", desc_ar: "جولة افتراضية كاملة للمشروع بتقنية 360°.", desc_en: "Full virtual 360° tour of the project.", price: "60 JOD" },
];

function InspectionPage() {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [type, setType] = useState("site");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState("residential");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!fullName || phone.length < 6 || !city || !address) {
      toast.error(lang === "ar" ? "أكمل جميع الحقول المطلوبة" : "Please complete all required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("inspection_requests").insert({
      user_id: user?.id ?? null,
      full_name: fullName,
      phone,
      city,
      address,
      inspection_type: type,
      project_type: projectType,
      area_m2: area ? Number(area) : null,
      preferred_date: date || null,
      notes: notes || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(lang === "ar" ? "تم تأكيد طلب المعاينة! سنتواصل معك قريباً." : "Inspection booked! We'll contact you shortly.");
      setFullName(""); setPhone(""); setCity(""); setAddress(""); setArea(""); setDate(""); setNotes("");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {lang === "ar" ? "احجز معاينة لمشروعك" : "Book a project inspection"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar"
              ? "اختر طريقة المعاينة المناسبة لك: ميدانية، فيديو مباشر، صور، أو جولة 360°."
              : "Pick how you want your inspection: on-site, live video, photos, or 360° tour."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {TYPES.map((tp) => {
            const Icon = tp.icon;
            const active = type === tp.key;
            return (
              <button
                key={tp.key}
                onClick={() => setType(tp.key)}
                className={`text-start p-4 rounded-2xl border-2 transition-all ${active ? "border-accent bg-accent/10 shadow-elegant" : "border-border bg-card hover:border-accent/50"}`}
              >
                <Icon className={`h-7 w-7 mb-2 ${active ? "text-accent" : "text-muted-foreground"}`} />
                <div className="font-bold text-sm">{lang === "ar" ? tp.ar : tp.en}</div>
                <div className="text-xs text-muted-foreground mt-1 mb-2 leading-relaxed">{lang === "ar" ? tp.desc_ar : tp.desc_en}</div>
                <div className="text-xs font-bold text-orange-grad">{tp.price}</div>
              </button>
            );
          })}
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-card max-w-3xl mx-auto space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>{t("full_name")} *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label>{t("phone")} *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>{t("city")} *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={lang === "ar" ? "عمّان، إربد..." : "Amman, Irbid..."} />
            </div>
            <div>
              <Label>{lang === "ar" ? "نوع المشروع" : "Project type"}</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">{lang === "ar" ? "سكني" : "Residential"}</SelectItem>
                  <SelectItem value="villa">{lang === "ar" ? "فيلا" : "Villa"}</SelectItem>
                  <SelectItem value="commercial">{lang === "ar" ? "تجاري" : "Commercial"}</SelectItem>
                  <SelectItem value="renovation">{lang === "ar" ? "ترميم" : "Renovation"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>{t("address")} *</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label>{lang === "ar" ? "المساحة (م²)" : "Area (m²)"}</Label>
              <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div>
              <Label>{lang === "ar" ? "التاريخ المفضّل" : "Preferred date"}</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>{t("notes")}</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
          <Button onClick={submit} disabled={saving} className="w-full bg-orange-grad text-accent-foreground" size="lg">
            <Send className="h-4 w-4 me-2" />
            {saving ? t("loading") : (lang === "ar" ? "تأكيد حجز المعاينة" : "Confirm inspection booking")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
