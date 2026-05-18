import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, ShieldCheck, Truck, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductReviews } from "@/components/ProductReviews";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetail,
});

type P = {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  image_url: string | null;
  unit_ar: string | null;
  unit_en: string | null;
  rating: number | null;
  rating_count: number | null;
  in_stock: boolean | null;
  verified: boolean | null;
  stock_quantity: number | null;
};

function ProductDetail() {
  const { id } = Route.useParams();
  const { lang, t } = useI18n();
  const { add } = useCart();
  const nav = useNavigate();
  const [p, setP] = useState<P | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => setP(data as P));
  }, [id]);

  if (!p) return <Layout><div className="container py-20 text-center text-muted-foreground">{t("loading")}</div></Layout>;

  const name = lang === "ar" ? p.name_ar : p.name_en;
  const desc = lang === "ar" ? p.description_ar : p.description_en;
  const unit = lang === "ar" ? p.unit_ar : p.unit_en;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("back")}
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-muted rounded-2xl aspect-square overflow-hidden">
            {p.image_url ? (
              <img src={p.image_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-steel" />
            )}
          </div>

          <div className="space-y-5">
            <div className="flex gap-2">
              {p.verified && <Badge className="bg-success"><ShieldCheck className="h-3 w-3 me-1" />{t("verified")}</Badge>}
              {p.in_stock ? <Badge variant="outline" className="border-success text-success">{t("in_stock")}</Badge> : <Badge variant="destructive">{t("out_of_stock")}</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-black">{name}</h1>

            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-bold">{Number(p.rating ?? 0).toFixed(1)}</span>
              <span className="text-muted-foreground">({p.rating_count ?? 0} {lang === "ar" ? "تقييم" : "reviews"})</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-orange-grad">{Number(p.price).toFixed(2)}</span>
              <span className="text-lg text-muted-foreground">{lang === "ar" ? "د.أ" : "JOD"} / {unit}</span>
            </div>

            {desc && <p className="text-muted-foreground leading-relaxed">{desc}</p>}

            <div className="flex items-center gap-4">
              <span className="font-semibold">{t("quantity")}:</span>
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-12 text-center font-bold">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 bg-primary"
                onClick={async () => {
                  await add(p.id, qty);
                  toast.success(lang === "ar" ? "تمت الإضافة للسلة" : "Added to cart");
                }}
              >
                <ShoppingCart className="h-5 w-5 me-2" /> {t("add_to_cart")}
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-orange-grad text-accent-foreground hover:opacity-90"
                onClick={async () => {
                  await add(p.id, qty);
                  nav({ to: "/checkout" });
                }}
              >
                {t("buy_now")}
              </Button>
            </div>

            <div className="bg-muted rounded-xl p-4 flex items-center gap-3">
              <Truck className="h-5 w-5 text-accent" />
              <span className="text-sm">{lang === "ar" ? "توصيل سريع لكل محافظات الأردن" : "Fast delivery across all Jordan governorates"}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
