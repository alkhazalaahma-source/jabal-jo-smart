import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Zap, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JABAL — سوق البناء الذكي في الأردن" },
      { name: "description", content: "اطلب مواد البناء والخدمات الهندسية في الأردن من JABAL. موردون موثقون، توصيل سريع، ودعم AI." },
    ],
  }),
  component: Home,
});

type Category = { id: string; name_ar: string; name_en: string; slug: string; icon: string | null };

function Home() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase.from("products").select("*").eq("featured", true).limit(8).then(({ data }) => setProducts((data ?? []) as Product[]));
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  const features = [
    { icon: Zap, t: t("feat_speed_t"), d: t("feat_speed_d") },
    { icon: ShieldCheck, t: t("feat_trust_t"), d: t("feat_trust_d") },
    { icon: Sparkles, t: t("feat_ai_t"), d: t("feat_ai_d") },
    { icon: Truck, t: t("feat_delivery_t"), d: t("feat_delivery_d") },
  ];

  return (
    <Layout>
      {/* HERO */}
      <section className="relative bg-hero text-white overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-block bg-orange-grad text-accent-foreground text-xs font-bold px-3 py-1.5 rounded-full mb-5">
              {t("brand_tagline")}
            </span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight">
              {t("hero_title_1")} <span className="text-orange-grad">{t("hero_title_2")}</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl">{t("hero_sub")}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/marketplace?q=${encodeURIComponent(q)}`;
              }}
              className="mt-8 flex max-w-xl bg-white/10 backdrop-blur rounded-xl p-1.5 gap-1"
            >
              <Search className="h-5 w-5 self-center ms-2 text-white/70" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_placeholder")}
                className="bg-transparent border-0 text-white placeholder:text-white/60 focus-visible:ring-0"
              />
              <Button type="submit" className="bg-orange-grad text-accent-foreground hover:opacity-90">
                {lang === "ar" ? "بحث" : "Search"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button size="lg" className="bg-orange-grad text-accent-foreground hover:opacity-90">
                  {t("cta_browse")} <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link to="/ai-chat">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Sparkles className="me-2 h-5 w-5" /> {t("cta_ai")}
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { n: "500+", l: t("stat_suppliers") },
                { n: "10K+", l: t("stat_products") },
                { n: "12", l: t("stat_cities") },
                { n: "98%", l: t("stat_satisfaction") },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl md:text-4xl font-black text-orange-grad">{s.n}</div>
                  <div className="text-sm text-white/70 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-black mb-8">{t("categories")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/marketplace"
              search={{ category: c.slug } as never}
              className="group bg-card border rounded-xl p-6 text-center hover:shadow-elegant transition-all hover:-translate-y-1 hover:border-accent"
            >
              <div className="text-5xl mb-3">{c.icon ?? "📦"}</div>
              <div className="font-bold">{lang === "ar" ? c.name_ar : c.name_en}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-3xl font-black">{t("featured_products")}</h2>
          <Link to="/marketplace" className="text-accent font-semibold hover:underline">
            {t("view_all")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* WHY JABAL */}
      <section className="bg-steel py-16 mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12">{t("why_jabal")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.t} className="bg-card rounded-xl p-6 border shadow-card text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-orange-grad flex items-center justify-center">
                  <f.icon className="h-7 w-7 text-accent-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.t}</h3>
                <p className="text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-hero rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="relative">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-orange-grad" />
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              {lang === "ar" ? "ابدأ مشروعك مع جبل اليوم" : "Start your project with JABAL today"}
            </h2>
            <p className="text-white/85 max-w-xl mx-auto mb-8">
              {lang === "ar" ? "انضم لآلاف المقاولين والمهندسين الذين يثقون بجبل لتوفير الوقت والمال." : "Join thousands of contractors and engineers who trust JABAL to save time and money."}
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-orange-grad text-accent-foreground hover:opacity-90">
                {t("register")} <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
