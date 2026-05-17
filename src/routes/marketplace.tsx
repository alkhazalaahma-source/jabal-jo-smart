import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard, type Product } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/marketplace")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    category: typeof s.category === "string" ? s.category : "",
  }),
  head: () => ({ meta: [{ title: "السوق — JABAL Marketplace" }, { name: "description", content: "تصفح آلاف منتجات البناء بأفضل الأسعار من موردين موثقين في الأردن." }] }),
  component: Marketplace,
});

type Cat = { id: string; slug: string; name_ar: string; name_en: string; icon: string | null };

function Marketplace() {
  const { lang, t } = useI18n();
  const { q: initQ, category: initCat } = Route.useSearch();
  const [q, setQ] = useState(initQ);
  const [cat, setCat] = useState(initCat);
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => setCategories((data ?? []) as Cat[]));
  }, []);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products").select("*, category:categories!inner(slug)");
    if (cat) query = query.eq("category.slug", cat);
    query.then(({ data }) => {
      setProducts((data ?? []) as unknown as Product[]);
      setLoading(false);
    });
  }, [cat]);

  const filtered = useMemo(() => {
    let r = products;
    if (q) {
      const ql = q.toLowerCase();
      r = r.filter((p) => p.name_ar.toLowerCase().includes(ql) || p.name_en.toLowerCase().includes(ql));
    }
    if (sort === "price_low") r = [...r].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price_high") r = [...r].sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "popular") r = [...r].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    return r;
  }, [products, q, sort]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-black mb-6">{t("nav_market")}</h1>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search_placeholder")} className="ps-9" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sort_newest")}</SelectItem>
              <SelectItem value="popular">{t("sort_popular")}</SelectItem>
              <SelectItem value="price_low">{t("sort_price_low")}</SelectItem>
              <SelectItem value="price_high">{t("sort_price_high")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant={cat === "" ? "default" : "outline"} className="cursor-pointer text-sm px-3 py-1" onClick={() => setCat("")}>
            {t("filter_all")}
          </Badge>
          {categories.map((c) => (
            <Badge
              key={c.id}
              variant={cat === c.slug ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1"
              onClick={() => setCat(c.slug)}
            >
              {c.icon} {lang === "ar" ? c.name_ar : c.name_en}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">{t("loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{t("no_results")}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
