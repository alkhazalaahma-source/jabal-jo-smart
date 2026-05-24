import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, Ruler, Hammer, Truck, Wrench, PaintBucket, Zap, Droplets, Star, Phone, BadgeCheck, MapPin } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "الخدمات الهندسية ومقدمي الخدمة — JABAL Services" },
    { name: "description", content: "مهندسون وفنيون موثقون في الأردن — مقاولات، تصميم، كهرباء، صحية، تشطيبات، صيانة" },
  ] }),
  component: Services,
});

const SERVICES = [
  { slug: "general-contracting", icon: HardHat, ar: "مقاولات عامة", en: "General Contracting", dar: "تنفيذ مشاريع البناء من الأساس للتسليم", den: "Build from foundation to delivery" },
  { slug: "architectural-design", icon: Ruler, ar: "تصميم معماري", en: "Architectural Design", dar: "مخططات معمارية وتصاميم 3D", den: "Architectural plans & 3D designs" },
  { slug: "interior-finishing", icon: Hammer, ar: "تشطيبات داخلية", en: "Interior Finishing", dar: "دهان، سيراميك، جبس وأرضيات", den: "Paint, tiles, gypsum & flooring" },
  { slug: "electrical-works", icon: Zap, ar: "أعمال كهربائية", en: "Electrical Works", dar: "تأسيس وصيانة الأنظمة الكهربائية", den: "Wiring & electrical maintenance" },
  { slug: "plumbing", icon: Droplets, ar: "أعمال صحية", en: "Plumbing", dar: "تأسيس وصيانة الصرف والمياه", den: "Plumbing installation & repair" },
  { slug: "decoration", icon: PaintBucket, ar: "ديكور", en: "Decoration", dar: "تصاميم داخلية فاخرة", den: "Premium interior decoration" },
  { slug: "maintenance", icon: Wrench, ar: "صيانة شاملة", en: "Maintenance", dar: "صيانة دورية وطارئة للمباني", den: "Routine & emergency building maintenance" },
  { slug: "material-delivery", icon: Truck, ar: "نقل وتوصيل مواد", en: "Material Delivery", dar: "شبكة سائقين متخصصة في مواد البناء", den: "Driver network for construction materials" },
];

type Provider = {
  id: string; name: string; name_ar: string | null; specialty: string; specialty_ar: string | null;
  bio_ar: string | null; city: string | null; phone: string | null; rating: number; experience_years: number;
  featured: boolean; verified: boolean; hourly_rate: number | null; service_slug: string | null;
};

function Services() {
  const { lang, t } = useI18n();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase.from("service_providers").select("*").order("featured", { ascending: false }).order("rating", { ascending: false })
      .then(({ data }) => setProviders((data ?? []) as Provider[]));
  }, []);

  const filtered = filter === "all" ? providers : providers.filter((p) => p.service_slug === filter);

  return (
    <Layout>
      <section className="bg-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black">{t("nav_services")}</h1>
          <p className="mt-4 text-white/85 max-w-2xl mx-auto">
            {lang === "ar" ? "خدمات هندسية احترافية بأيدي مختصين موثقين على منصة جبل." : "Professional engineering services delivered by verified specialists on JABAL."}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-black mb-5">{lang === "ar" ? "اختر الخدمة" : "Choose a Service"}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setFilter("all")} className={`bg-card border rounded-xl p-5 text-start hover:shadow-elegant transition ${filter === "all" ? "ring-2 ring-accent" : ""}`}>
            <div className="font-bold">{lang === "ar" ? "كل الخدمات" : "All Services"}</div>
            <div className="text-xs text-muted-foreground mt-1">{providers.length} {lang === "ar" ? "مقدّم" : "providers"}</div>
          </button>
          {SERVICES.map((s) => (
            <button key={s.slug} onClick={() => setFilter(s.slug)} className={`bg-card border rounded-xl p-5 text-start hover:shadow-elegant hover:-translate-y-0.5 transition group ${filter === s.slug ? "ring-2 ring-accent" : ""}`}>
              <div className="w-12 h-12 rounded-xl bg-orange-grad flex items-center justify-center mb-3 group-hover:scale-110 transition"><s.icon className="h-6 w-6 text-accent-foreground" /></div>
              <h3 className="font-bold">{lang === "ar" ? s.ar : s.en}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lang === "ar" ? s.dar : s.den}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black mb-5">{lang === "ar" ? "مقدمو الخدمة الموثقون" : "Verified Service Providers"}</h2>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">{lang === "ar" ? "لا يوجد مقدمو خدمة لهذه الفئة بعد." : "No providers in this category yet."}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div key={p.id} className="bg-card border rounded-xl p-5 hover:shadow-elegant transition">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold flex items-center gap-1.5">
                      {lang === "ar" ? (p.name_ar ?? p.name) : p.name}
                      {p.verified && <BadgeCheck className="h-4 w-4 text-accent" />}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{lang === "ar" ? (p.specialty_ar ?? p.specialty) : p.specialty}</p>
                  </div>
                  {p.featured && <Badge className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "مميّز" : "Featured"}</Badge>}
                </div>
                {p.bio_ar && lang === "ar" && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.bio_ar}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" /> {Number(p.rating).toFixed(1)}</span>
                  {p.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {p.city}</span>}
                  {p.experience_years > 0 && <span>{p.experience_years} {lang === "ar" ? "سنة خبرة" : "yrs"}</span>}
                  {p.hourly_rate && <span className="text-orange-grad font-bold">{p.hourly_rate} {lang === "ar" ? "د.أ/س" : "JOD/h"}</span>}
                </div>
                <div className="flex gap-2">
                  {p.phone && (
                    <a href={`tel:${p.phone}`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><Phone className="h-4 w-4 me-1.5" /> {lang === "ar" ? "اتصال" : "Call"}</Button></a>
                  )}
                  <Link to="/contact" className="flex-1">
                    <Button size="sm" className="w-full bg-orange-grad text-accent-foreground hover:opacity-90">{lang === "ar" ? "طلب عرض" : "Quote"}</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/contact"><Button size="lg" className="bg-orange-grad text-accent-foreground hover:opacity-90">{lang === "ar" ? "اطلب عرض سعر مخصص" : "Request a Custom Quote"}</Button></Link>
        </div>
      </div>
    </Layout>
  );
}
