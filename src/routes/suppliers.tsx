import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Factory, Truck, Star, Phone, MapPin, BadgeCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "الموردين والمصانع — JABAL" },
      { name: "description", content: "دليل موردين ومصانع مواد البناء في الأردن" },
    ],
  }),
  component: Suppliers,
});

type S = { id: string; name: string; name_ar: string | null; type: string; category: string | null; city: string | null; phone: string | null; description_ar: string | null; rating: number; verified: boolean; featured: boolean };

function Suppliers() {
  const { lang } = useI18n();
  const [items, setItems] = useState<S[]>([]);
  const [filter, setFilter] = useState<"all" | "factory" | "supplier">("all");

  useEffect(() => {
    supabase.from("suppliers").select("*").order("featured", { ascending: false }).then(({ data }) => setItems((data ?? []) as S[]));
  }, []);

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-black mb-3">{lang === "ar" ? "الموردين والمصانع" : "Suppliers & Factories"}</h1>
          <p className="text-muted-foreground max-w-2xl">{lang === "ar" ? "أكبر شبكة موردين ومصانع موثوقة لمواد البناء في الأردن. اطلب عرض سعر مباشر." : "Largest network of verified suppliers and factories in Jordan. Request a quote directly."}</p>
          <Link to="/rfq" className="inline-block mt-5">
            <Button size="lg" className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "اطلب عرض سعر" : "Request Quote"}</Button>
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "factory", "supplier"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-sm font-medium border ${filter === f ? "bg-accent text-accent-foreground border-accent" : "hover:bg-accent/10"}`}>
              {f === "all" ? (lang === "ar" ? "الكل" : "All") : f === "factory" ? (lang === "ar" ? "مصانع" : "Factories") : (lang === "ar" ? "موردين" : "Suppliers")}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-card border rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {s.type === "factory" ? <Factory className="h-6 w-6 text-accent" /> : <Truck className="h-6 w-6 text-accent" />}
                  <h3 className="font-bold">{lang === "ar" ? (s.name_ar || s.name) : s.name}</h3>
                </div>
                {s.verified && <BadgeCheck className="h-5 w-5 text-green-500" />}
              </div>
              {s.description_ar && <p className="text-sm text-muted-foreground mb-3">{s.description_ar}</p>}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                {s.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.city}</span>}
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> {s.rating}</span>
                {s.category && <Badge variant="outline" className="text-[10px]">{s.category}</Badge>}
              </div>
              <div className="flex gap-2">
                {s.phone && <a href={`tel:${s.phone}`}><Button size="sm" variant="outline"><Phone className="h-3 w-3 mr-1" /> {lang === "ar" ? "اتصال" : "Call"}</Button></a>}
                <Link to="/rfq" search={{ supplier: s.id } as never}><Button size="sm" className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "اطلب عرض" : "Get Quote"}</Button></Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
