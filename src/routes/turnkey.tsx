import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, MapPin, Ruler, Star, Plus, ArrowLeft, ArrowRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { PROJECT_TYPES } from "@/lib/project-types";

export const Route = createFileRoute("/turnkey")({
  head: () => ({
    meta: [
      { title: "ابنِ مشروعك الآن — JABAL Build Your Project" },
      { name: "description", content: "ابدأ مشروعك الإنشائي بثقة عبر JABAL — من الفكرة إلى التسليم، بإدارة احترافية وشفافية كاملة." },
    ],
  }),
  component: TurnkeyPage,
});

type Contractor = {
  id: string; name: string; name_ar: string | null; logo_url: string | null;
  bio: string | null; bio_ar: string | null; specialties: string[]; regions: string[];
  experience_years: number; completed_projects: number; rating: number; rating_count: number;
  featured: boolean; verified: boolean;
};

function TurnkeyPage() {
  const { lang } = useI18n();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("contractors" as never).select("*").order("featured", { ascending: false }).order("rating", { ascending: false });
      setContractors((data as Contractor[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = contractors.filter((c) => {
    const s = q.toLowerCase();
    return !s || c.name.toLowerCase().includes(s) || (c.name_ar ?? "").includes(s) || c.specialties.some((sp) => sp.toLowerCase().includes(s)) || c.regions.some((r) => r.toLowerCase().includes(s));
  });

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
        <div className="container mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-grad text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Building2 className="h-4 w-4" /> {lang === "ar" ? "ابنِ مشروعك الآن" : "Build Your Project Now"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {lang === "ar" ? "أخبرنا بما تريد بناءه… ونحن ننفّذه باحترافية" : "Tell us what to build — we deliver it professionally"}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {lang === "ar"
              ? "من الفكرة إلى التنفيذ، فريق JABAL يدير مشروعك بأعلى معايير الجودة والشفافية والمصداقية، مع متابعة لحظية وتقارير دورية حتى الاستلام."
              : "From idea to delivery, JABAL manages your project with top quality, transparency and trust — live tracking and periodic reports until handover."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link to="/turnkey/new">
              <Button size="lg" className="bg-orange-grad text-accent-foreground hover:opacity-90">
                <Plus className="h-5 w-5 me-2" /> {lang === "ar" ? "اطلب مشروعك الآن" : "Request a project"}
              </Button>
            </Link>
            <Link to="/turnkey/projects">
              <Button size="lg" variant="outline">
                {lang === "ar" ? "مشاريعي" : "My Projects"} <Arrow className="h-4 w-4 ms-2" />
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
            {(lang === "ar"
              ? ["✓ شفافية كاملة", "✓ أسعار واضحة", "✓ مقاولون معتمدون", "✓ التزام بالمواعيد", "✓ ضمانات تنفيذ"]
              : ["✓ Full transparency", "✓ Clear pricing", "✓ Verified contractors", "✓ On-time delivery", "✓ Execution warranty"]
            ).map((b) => (
              <span key={b} className="bg-card border rounded-full px-3 py-1 font-semibold">{b}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { n: "1", ar: "أرسل تفاصيل مشروعك", en: "Submit project details" },
            { n: "2", ar: "استقبل عروض المقاولين", en: "Receive contractor bids" },
            { n: "3", ar: "اختر العرض الأنسب", en: "Pick the best offer" },
            { n: "4", ar: "تابع التنفيذ حتى التسليم", en: "Track until handover" },
          ].map((s) => (
            <div key={s.n} className="bg-card border rounded-2xl p-5 shadow-card">
              <div className="w-10 h-10 rounded-full bg-orange-grad text-accent-foreground font-black flex items-center justify-center mb-3">{s.n}</div>
              <div className="font-bold">{lang === "ar" ? s.ar : s.en}</div>
            </div>
          ))}
        </div>

        {/* Visual catalog — what can I build? */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-black">{lang === "ar" ? "ماذا تريد أن تبني؟" : "What do you want to build?"}</h2>
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "اختر نوع مشروعك وابدأ فوراً — أي شيء ممكن" : "Pick any project type and start instantly — anything is possible"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2.5">
            {PROJECT_TYPES.map((pt) => (
              <Link
                key={pt.value}
                to="/turnkey/new"
                className="group bg-card border rounded-xl p-3 text-center hover:shadow-elegant hover:border-accent hover:-translate-y-0.5 transition-all"
              >
                <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">{pt.icon}</div>
                <div className="text-[11px] font-semibold leading-tight line-clamp-2">{lang === "ar" ? pt.ar : pt.en}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="text-2xl font-black">{lang === "ar" ? "مقاولون معتمدون" : "Verified Contractors"}</h2>
            <p className="text-sm text-muted-foreground">{lang === "ar" ? "مقاولون موثوقون ومقيّمون من العملاء" : "Trusted contractors rated by clients"}</p>
          </div>
          <Input className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === "ar" ? "ابحث عن مقاول/تخصص/منطقة" : "Search contractor / specialty / region"} />
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground py-20">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <div key={c.id} className="bg-card border rounded-2xl overflow-hidden shadow-card hover:shadow-elegant transition-all">
                <div className="p-5 flex gap-4">
                  <img src={c.logo_url ?? ""} alt={c.name} className="w-16 h-16 rounded-xl object-cover bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{lang === "ar" && c.name_ar ? c.name_ar : c.name}</h3>
                      {c.featured && <span className="text-[10px] bg-orange-grad text-accent-foreground px-2 py-0.5 rounded-full font-bold">★</span>}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" /> {Number(c.rating).toFixed(1)} <span className="text-muted-foreground">({c.rating_count})</span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-3 text-sm text-muted-foreground line-clamp-2">{lang === "ar" && c.bio_ar ? c.bio_ar : c.bio}</div>
                <div className="px-5 pb-3 flex flex-wrap gap-1.5">
                  {c.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="text-[11px] bg-muted px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="px-5 pb-4 grid grid-cols-3 gap-2 text-xs text-center border-t pt-3">
                  <div><div className="font-bold text-foreground">{c.experience_years}+</div><div className="text-muted-foreground">{lang === "ar" ? "سنة خبرة" : "Years"}</div></div>
                  <div><div className="font-bold text-foreground">{c.completed_projects}</div><div className="text-muted-foreground">{lang === "ar" ? "مشروع" : "Projects"}</div></div>
                  <div className="flex items-center justify-center gap-1"><MapPin className="h-3 w-3" /><span className="text-muted-foreground truncate">{c.regions[0] ?? "—"}</span></div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">{lang === "ar" ? "لا توجد نتائج" : "No results"}</div>
            )}
          </div>
        )}

        <div className="bg-card border rounded-2xl p-6 mt-10 grid md:grid-cols-3 gap-4 text-center">
          {[
            { icon: Ruler, ar: "حساب التكلفة بدقة", en: "Accurate cost estimation" },
            { icon: Building2, ar: "متابعة لحظية للتنفيذ", en: "Live progress tracking" },
            { icon: Star, ar: "ضمانات على التنفيذ", en: "Execution guarantees" },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-3">
                <Icon className="h-8 w-8 text-orange-grad mx-auto mb-2" />
                <div className="font-bold">{lang === "ar" ? f.ar : f.en}</div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
