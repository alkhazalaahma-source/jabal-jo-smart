import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Product = {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  image_url: string | null;
  unit_ar: string | null;
  unit_en: string | null;
  rating: number | null;
  rating_count: number | null;
  verified: boolean | null;
  in_stock: boolean | null;
  featured?: boolean | null;
};

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useI18n();
  const { add } = useCart();
  const name = lang === "ar" ? product.name_ar : product.name_en;
  const unit = lang === "ar" ? product.unit_ar : product.unit_en;

  // Optimize Unsplash images for fast mobile loading (webp + responsive sizes)
  const optimize = (url: string, w: number) => {
    if (!url.includes("unsplash.com")) return url;
    const base = url.split("?")[0];
    return `${base}?auto=format&fit=crop&q=70&w=${w}`;
  };
  const imgSrc = product.image_url ? optimize(product.image_url, 400) : null;
  const imgSrcSet = product.image_url
    ? `${optimize(product.image_url, 300)} 300w, ${optimize(product.image_url, 500)} 500w, ${optimize(product.image_url, 800)} 800w`
    : undefined;

  return (
    <div className="group bg-card rounded-xl border shadow-card overflow-hidden hover:shadow-elegant transition-all hover:-translate-y-1">
      <Link to="/product/$id" params={{ id: product.id }} className="block relative aspect-square bg-muted overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            srcSet={imgSrcSet}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            alt={name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-steel" />
        )}
        {product.featured && (
          <span className="absolute top-2 start-2 bg-orange-grad text-accent-foreground text-xs font-bold px-2 py-1 rounded-md">{t("featured")}</span>
        )}
        {product.verified && (
          <span className="absolute top-2 end-2 bg-success text-success-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
          </span>
        )}
      </Link>
      <div className="p-3 space-y-2">
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-semibold text-sm line-clamp-2 min-h-10 hover:text-accent transition-colors">{name}</h3>
        </Link>
        <div className="flex items-center gap-1 text-xs">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="font-semibold">{Number(product.rating ?? 0).toFixed(1)}</span>
          <span className="text-muted-foreground">({product.rating_count ?? 0})</span>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xl font-bold text-orange-grad">{Number(product.price).toFixed(2)}</span>
            <span className="text-xs text-muted-foreground ms-1">{lang === "ar" ? "د.أ" : "JOD"}</span>
          </div>
          <span className="text-xs text-muted-foreground">/ {unit}</span>
        </div>
        <Button
          className="w-full bg-primary hover:opacity-90"
          size="sm"
          onClick={async (e) => {
            e.preventDefault();
            await add(product.id, 1);
            toast.success(lang === "ar" ? "تمت الإضافة للسلة" : "Added to cart");
          }}
        >
          <ShoppingCart className="h-4 w-4 me-1.5" /> {t("add_to_cart")}
        </Button>
      </div>
    </div>
  );
}
