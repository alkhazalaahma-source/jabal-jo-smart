import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export function MiniCart() {
  const { items, count, subtotal, update, remove } = useCart();
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;
  const currency = lang === "ar" ? "د.أ" : "JOD";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="cart">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-grad text-[10px] font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center text-accent-foreground">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side={lang === "ar" ? "left" : "right"} className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> {t("cart")} ({count})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">{t("cart_empty")}</p>
            <Link to="/marketplace" onClick={() => setOpen(false)}>
              <Button className="bg-orange-grad text-accent-foreground">{t("cta_browse")}</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {items.map((i) => {
                const name = lang === "ar" ? i.product?.name_ar : i.product?.name_en;
                const price = Number(i.product?.price ?? 0);
                return (
                  <div key={i.product_id} className="flex gap-3 pb-3 border-b last:border-0">
                    <Link to="/product/$id" params={{ id: i.product_id }} onClick={() => setOpen(false)} className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {i.product?.image_url && <img src={i.product.image_url} alt={name ?? ""} className="w-full h-full object-cover" />}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to="/product/$id" params={{ id: i.product_id }} onClick={() => setOpen(false)} className="text-sm font-semibold line-clamp-2 hover:text-accent">
                        {name}
                      </Link>
                      <div className="text-orange-grad font-bold text-sm mt-0.5">{price.toFixed(2)} {currency}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center border rounded-md">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update(i.product_id, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-8 text-center text-sm font-bold">{i.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update(i.product_id, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 ms-auto" onClick={() => remove(i.product_id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <SheetFooter className="border-t p-5 flex-col gap-3 sm:flex-col">
              <div className="flex items-center justify-between w-full text-sm">
                <span className="text-muted-foreground">{t("cart_subtotal")}</span>
                <span className="text-xl font-black text-orange-grad">{subtotal.toFixed(2)} {currency}</span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 w-full">
                <Link to="/cart" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">{t("cart")}</Button>
                </Link>
                <Link to="/checkout" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-orange-grad text-accent-foreground">
                    {t("checkout")} <Arrow className="h-4 w-4 ms-1.5" />
                  </Button>
                </Link>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
