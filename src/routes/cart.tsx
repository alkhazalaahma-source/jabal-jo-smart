import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "السلة — JABAL" }] }),
  component: CartPage,
});

function CartPage() {
  const { lang, t } = useI18n();
  const { items, subtotal, update, remove } = useCart();
  const delivery = items.length ? 5 : 0;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-20 w-20 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t("cart_empty")}</h2>
          <Link to="/marketplace"><Button className="mt-4 bg-orange-grad text-accent-foreground">{t("cta_browse")}</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black mb-6">{t("cart")}</h1>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((i) => {
              const name = lang === "ar" ? i.product?.name_ar : i.product?.name_en;
              return (
                <div key={i.product_id} className="bg-card border rounded-xl p-4 flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                    {i.product?.image_url && <img src={i.product.image_url} alt={name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to="/product/$id" params={{ id: i.product_id }} className="font-bold hover:text-accent line-clamp-2">{name}</Link>
                    <div className="text-orange-grad font-bold mt-1">{Number(i.product?.price ?? 0).toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}</div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border rounded-lg">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => update(i.product_id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-10 text-center font-bold">{i.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => update(i.product_id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => remove(i.product_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-card border rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4">{t("order_summary")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>{t("cart_subtotal")}</span><span className="font-semibold">{subtotal.toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}</span></div>
              <div className="flex justify-between"><span>{t("delivery")}</span><span className="font-semibold">{delivery.toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}</span></div>
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-black"><span>{t("total")}</span><span className="text-orange-grad">{total.toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}</span></div>
            </div>
            <Link to="/checkout"><Button className="w-full mt-4 bg-orange-grad text-accent-foreground hover:opacity-90" size="lg">{t("checkout")}</Button></Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
