import { createFileRoute } from "@tanstack/react-router";
import { Target, Eye, Award, Users } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/jabal-logo.png";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "عن جبل — About JABAL" }, { name: "description", content: "تعرّف على جبل، فريقها ورؤيتها في تحويل قطاع البناء في الأردن." }] }),
  component: About,
});

const TEAM = [
  { name_ar: "أحمد كمال", name_en: "Ahmad Kamal", role_ar: "المدير التنفيذي والمؤسس", role_en: "CEO & Founder", bio_ar: "خريج تسويق رقمي 2026 — جامعة آل البيت", bio_en: "Digital Marketing Graduate 2026 — Al al-Bayt University" },
];

function About() {
  const { lang, t } = useI18n();
  return (
    <Layout>
      <section className="bg-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <img src={logo} alt="JABAL" className="h-20 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black">{t("about_title")}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/85">
            {lang === "ar"
              ? "جبل هي منصة أردنية رائدة تربط الموردين، المقاولين، المهندسين والعملاء داخل سوق رقمي ذكي واحد لمواد البناء والخدمات الهندسية."
              : "JABAL is a Jordan-born platform connecting suppliers, contractors, engineers and customers in one smart digital marketplace for construction materials & engineering services."}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-6">
          <Eye className="h-10 w-10 text-accent mb-3" />
          <h2 className="text-2xl font-bold mb-2">{t("vision")}</h2>
          <p className="text-muted-foreground">{lang === "ar" ? "أن نصبح المنصة الأولى في الشرق الأوسط لتوريد مواد البناء والخدمات الهندسية بثقة وكفاءة." : "To become the leading Middle East platform for construction materials & engineering services."}</p>
        </div>
        <div className="bg-card border rounded-xl p-6">
          <Target className="h-10 w-10 text-accent mb-3" />
          <h2 className="text-2xl font-bold mb-2">{t("mission")}</h2>
          <p className="text-muted-foreground">{lang === "ar" ? "تمكين كل صاحب مشروع في الأردن من بناء أحلامه بثقة، شفافية، وأسعار عادلة عبر منصة رقمية ذكية." : "Empower every project owner in Jordan to build with trust, transparency and fair pricing via a smart digital platform."}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="text-center mb-10">
          <Users className="h-10 w-10 text-accent mx-auto mb-2" />
          <h2 className="text-3xl font-black">{t("team")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TEAM.map((m) => (
            <div key={m.name_en} className="bg-card border rounded-xl p-6 text-center hover:shadow-elegant transition">
              <div className="w-20 h-20 bg-orange-grad rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black text-accent-foreground">
                {(lang === "ar" ? m.name_ar : m.name_en).split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </div>
              <h3 className="font-bold">{lang === "ar" ? m.name_ar : m.name_en}</h3>
              <p className="text-sm text-accent font-semibold mt-1">{lang === "ar" ? m.role_ar : m.role_en}</p>
              <p className="text-xs text-muted-foreground mt-2">{lang === "ar" ? m.bio_ar : m.bio_en}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-steel py-12">
        <div className="container mx-auto px-4 text-center">
          <Award className="h-12 w-12 text-accent mx-auto mb-3" />
          <h3 className="text-2xl font-bold">{lang === "ar" ? "بُنيت بفخر في الأردن 🇯🇴" : "Built with pride in Jordan 🇯🇴"}</h3>
        </div>
      </section>
    </Layout>
  );
}
