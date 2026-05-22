import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Ruler, Calendar } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "أعمالنا — JABAL" },
      { name: "description", content: "معرض أعمال ومشاريع منفذة من قبل JABAL وشركاؤها" },
    ],
  }),
  component: Projects,
});

type P = { id: string; title: string; title_ar: string | null; description_ar: string | null; city: string | null; category: string | null; image_url: string | null; area_m2: number | null; year: number | null; featured: boolean };

function Projects() {
  const { lang } = useI18n();
  const [items, setItems] = useState<P[]>([]);

  useEffect(() => {
    supabase.from("completed_projects").select("*").order("featured", { ascending: false }).then(({ data }) => setItems((data ?? []) as P[]));
  }, []);

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-black mb-3">{lang === "ar" ? "أعمالنا المنجزة" : "Our Completed Projects"}</h1>
          <p className="text-muted-foreground max-w-2xl">{lang === "ar" ? "اطلع على مجموعة من المشاريع التي نفذتها JABAL في الأردن" : "Explore a selection of projects delivered by JABAL across Jordan"}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((p) => (
            <article key={p.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-xl transition-shadow group">
              {p.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img src={p.image_url} alt={lang === "ar" ? (p.title_ar || p.title) : p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{lang === "ar" ? (p.title_ar || p.title) : p.title}</h3>
                  {p.featured && <Badge className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "مميز" : "Featured"}</Badge>}
                </div>
                {p.description_ar && <p className="text-sm text-muted-foreground mb-3">{p.description_ar}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {p.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.city}</span>}
                  {p.area_m2 && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {p.area_m2} م²</span>}
                  {p.year && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {p.year}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
}
