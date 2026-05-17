import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Star, MapPin } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/companies")({
  head: () => ({ meta: [{ title: "الشركات الموثقة — JABAL" }] }),
  component: Companies,
});

type Co = { id: string; name: string; name_ar: string | null; description: string | null; city: string | null; rating: number | null; verified: boolean | null };

function Companies() {
  const { lang, t } = useI18n();
  const [cos, setCos] = useState<Co[]>([]);
  useEffect(() => { supabase.from("companies").select("*").order("rating", { ascending: false }).then(({ data }) => setCos((data ?? []) as Co[])); }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">{t("nav_companies")}</h1>
        <p className="text-muted-foreground mb-8">{lang === "ar" ? "شركات موثقة على منصة جبل، اختيرت بناءً على الجودة والثقة." : "Verified suppliers on JABAL, picked for quality and trust."}</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cos.map((c) => (
            <div key={c.id} className="bg-card border rounded-xl p-6 hover:shadow-elegant transition">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-14 h-14 rounded-xl bg-orange-grad flex items-center justify-center text-accent-foreground font-black text-xl">{c.name[0]}</div>
                {c.verified && <ShieldCheck className="h-5 w-5 text-success" />}
              </div>
              <h3 className="font-bold text-lg">{lang === "ar" ? (c.name_ar ?? c.name) : c.name}</h3>
              {c.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" /><span className="font-bold">{Number(c.rating ?? 0).toFixed(1)}</span></span>
                {c.city && <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{c.city}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
