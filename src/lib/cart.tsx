// Cart context — syncs with DB when logged in, localStorage when guest
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type CartItem = {
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    image_url: string | null;
    unit_ar: string | null;
    unit_en: string | null;
  };
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  update: (productId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
};

const CartContext = createContext<Ctx | null>(null);
const LS_KEY = "jabal_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const loadGuest = useCallback(async () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(LS_KEY);
    const guest: { product_id: string; quantity: number }[] = raw ? JSON.parse(raw) : [];
    if (guest.length === 0) return setItems([]);
    const { data } = await supabase
      .from("products")
      .select("id,name_ar,name_en,price,image_url,unit_ar,unit_en")
      .in("id", guest.map((g) => g.product_id));
    setItems(
      guest.map((g) => ({
        product_id: g.product_id,
        quantity: g.quantity,
        product: data?.find((p) => p.id === g.product_id) as CartItem["product"],
      })),
    );
  }, []);

  const loadUser = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("cart_items")
      .select("product_id,quantity,product:products(id,name_ar,name_en,price,image_url,unit_ar,unit_en)")
      .eq("user_id", uid);
    setItems((data ?? []) as unknown as CartItem[]);
  }, []);

  const reload = useCallback(async () => {
    if (user) await loadUser(user.id);
    else await loadGuest();
  }, [user, loadUser, loadGuest]);

  useEffect(() => { reload(); }, [reload]);

  const saveGuest = (next: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, JSON.stringify(next.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))));
    }
  };

  const add = async (productId: string, qty = 1) => {
    if (user) {
      const existing = items.find((i) => i.product_id === productId);
      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("user_id", user.id).eq("product_id", productId);
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: qty });
      }
      await loadUser(user.id);
    } else {
      const existing = items.find((i) => i.product_id === productId);
      let next: CartItem[];
      if (existing) {
        next = items.map((i) => (i.product_id === productId ? { ...i, quantity: i.quantity + qty } : i));
      } else {
        const { data: p } = await supabase.from("products").select("id,name_ar,name_en,price,image_url,unit_ar,unit_en").eq("id", productId).single();
        next = [...items, { product_id: productId, quantity: qty, product: p as CartItem["product"] }];
      }
      setItems(next);
      saveGuest(next);
    }
  };

  const remove = async (productId: string) => {
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
      await loadUser(user.id);
    } else {
      const next = items.filter((i) => i.product_id !== productId);
      setItems(next);
      saveGuest(next);
    }
  };

  const update = async (productId: string, qty: number) => {
    if (qty <= 0) return remove(productId);
    if (user) {
      await supabase.from("cart_items").update({ quantity: qty }).eq("user_id", user.id).eq("product_id", productId);
      await loadUser(user.id);
    } else {
      const next = items.map((i) => (i.product_id === productId ? { ...i, quantity: qty } : i));
      setItems(next);
      saveGuest(next);
    }
  };

  const clear = async () => {
    if (user) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    }
    setItems([]);
    if (typeof window !== "undefined") localStorage.removeItem(LS_KEY);
  };

  const count = items.reduce((a, i) => a + i.quantity, 0);
  const subtotal = items.reduce((a, i) => a + i.quantity * Number(i.product?.price ?? 0), 0);

  return <CartContext.Provider value={{ items, count, subtotal, add, remove, update, clear, reload }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
