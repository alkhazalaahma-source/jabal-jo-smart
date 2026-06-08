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
      {/* HERO — calm & light */}
      <section className="relative bg-hero overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 grid-bg opacity-[0.06]" />
        <div className="container relative mx-auto px-4 py-14 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
              {t("brand_tagline")}
            </span>
            <h1 className="text-3xl md:text-6xl font-bold leading-[1.2] text-foreground tracking-tight animate-fade-in-up delay-75">
              {t("hero_title_1")} <span className="text-accent">{t("hero_title_2")}</span>
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed animate-fade-in-up delay-150">{t("hero_sub")}</p>


            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/marketplace?q=${encodeURIComponent(q)}`;
              }}
              className="mt-8 flex max-w-xl bg-card border border-border rounded-2xl shadow-card p-1.5 gap-1"
            >
              <Search className="h-5 w-5 self-center ms-2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search_placeholder")}
                className="bg-transparent border-0 focus-visible:ring-0 shadow-none"
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                {lang === "ar" ? "بحث" : "Search"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/marketplace">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-card">
                  {t("cta_browse")} <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link to="/turnkey/new">
                <Button size="lg" variant="outline" className="rounded-xl border-border bg-card hover:bg-muted">
                  {lang === "ar" ? "ابنِ مشروعك الآن" : "Build Your Project"} <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
                </Button>
              </Link>
              <Link to="/ai-chat">
                <Button size="lg" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
                  <Sparkles className="me-2 h-5 w-5" /> {t("cta_ai")}
                </Button>
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { n: "500+", l: t("stat_suppliers") },
                { n: "10K+", l: t("stat_products") },
                { n: "12", l: t("stat_cities") },
                { n: "98%", l: t("stat_satisfaction"), accent: true },
              ].map((s) => (
                <div key={s.l} className="bg-card/70 border border-border/60 rounded-2xl p-4">
                  <div className={`text-2xl md:text-3xl font-bold ${s.accent ? "text-accent" : "text-foreground"}`}>{s.n}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">{t("categories")}</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t("featured_products")}</h2>
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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-12">{t("why_jabal")}</h2>
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
        <div className="bg-card border border-border rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-card">
          <div className="absolute inset-0 grid-bg opacity-[0.05]" />
          <div className="relative">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-accent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {lang === "ar" ? "ابدأ مشروعك مع جبل اليوم" : "Start your project with JABAL today"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              {lang === "ar" ? "انضم لآلاف المقاولين والمهندسين الذين يثقون بجبل لتوفير الوقت والمال." : "Join thousands of contractors and engineers who trust JABAL to save time and money."}
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-card">
                {t("register")} <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
