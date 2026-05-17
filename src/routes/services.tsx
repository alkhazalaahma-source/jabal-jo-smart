import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Ruler, Hammer, Truck, Wrench, PaintBucket, Zap, Droplets } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "الخدمات الهندسية — JABAL Services" }] }),
  component: Services,
});

const SERVICES = [
  { icon: HardHat, ar: "مقاولات عامة", en: "General Contracting", dar: "تنفيذ مشاريع البناء من الأساس للتسليم", den: "Build from foundation to delivery" },
  { icon: Ruler, ar: "تصميم معماري", en: "Architectural Design", dar: "مخططات معمارية وتصاميم 3D", den: "Architectural plans & 3D designs" },
  { icon: Hammer, ar: "تشطيبات داخلية", en: "Interior Finishing", dar: "دهان، سيراميك، جبس وأرضيات", den: "Paint, tiles, gypsum & flooring" },
  { icon: Zap, ar: "أعمال كهربائية", en: "Electrical Works", dar: "تأسيس وصيانة الأنظمة الكهربائية", den: "Wiring & electrical maintenance" },
  { icon: Droplets, ar: "أعمال صحية", en: "Plumbing", dar: "تأسيس وصيانة الصرف والمياه", den: "Plumbing installation & repair" },
  { icon: PaintBucket, ar: "ديكور", en: "Decoration", dar: "تصاميم داخلية فاخرة", den: "Premium interior decoration" },
  { icon: Wrench, ar: "صيانة شاملة", en: "Maintenance", dar: "صيانة دورية وطارئة للمباني", den: "Routine & emergency building maintenance" },
  { icon: Truck, ar: "نقل وتوصيل مواد", en: "Material Delivery", dar: "شبكة سائقين متخصصة في مواد البناء", den: "Driver network for construction materials" },
];

function Services() {
  const { lang, t } = useI18n();
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

      <div className="container mx-auto px-4 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((s) => (
            <div key={s.en} className="bg-card border rounded-xl p-6 hover:shadow-elegant hover:-translate-y-1 transition group">
              <div className="w-14 h-14 rounded-xl bg-orange-grad flex items-center justify-center mb-4 group-hover:scale-110 transition"><s.icon className="h-7 w-7 text-accent-foreground" /></div>
              <h3 className="font-bold text-lg mb-1">{lang === "ar" ? s.ar : s.en}</h3>
              <p className="text-sm text-muted-foreground">{lang === "ar" ? s.dar : s.den}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/contact"><Button size="lg" className="bg-orange-grad text-accent-foreground hover:opacity-90">{lang === "ar" ? "اطلب عرض سعر" : "Request a Quote"}</Button></Link>
        </div>
      </div>
    </Layout>
  );
}
