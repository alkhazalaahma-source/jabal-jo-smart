import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Gift, Copy, Share2, Trophy } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/referral")({
  head: () => ({ meta: [{ title: "ادعُ صديق — JABAL" }] }),
  component: Referral,
});

function Referral() {
  const { lang } = useI18n();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth", search: { redirect: "/referral" } as never });
  }, [user, loading, nav]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("referral_code, loyalty_points").eq("id", user.id).maybeSingle().then(({ data }) => {
      setCode(data?.referral_code || "");
      setPoints(data?.loyalty_points || 0);
    });
  }, [user]);

  const url = typeof window !== "undefined" ? `${window.location.origin}/auth?ref=${code}` : "";

  const copy = () => { navigator.clipboard.writeText(url); toast.success(lang === "ar" ? "تم النسخ" : "Copied"); };
  const share = async () => {
    if (navigator.share) await navigator.share({ title: "JABAL", text: lang === "ar" ? "انضم لـ JABAL واحصل على خصومات!" : "Join JABAL!", url });
    else copy();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="text-center mb-8">
          <Gift className="h-16 w-16 mx-auto text-accent mb-3" />
          <h1 className="text-3xl font-black mb-2">{lang === "ar" ? "ادعُ صديقاً، اربح معاً" : "Invite a Friend, Earn Together"}</h1>
          <p className="text-muted-foreground">{lang === "ar" ? "احصل على 100 نقطة لكل صديق ينضم، وصديقك يحصل على خصم 10%" : "Earn 100 points per friend, they get 10% off"}</p>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-accent rounded-2xl p-6 mb-6 text-center">
          <Trophy className="h-10 w-10 mx-auto text-accent mb-2" />
          <div className="text-sm text-muted-foreground mb-1">{lang === "ar" ? "نقاطك" : "Your Points"}</div>
          <div className="text-5xl font-black text-orange-grad">{points}</div>
          <div className="text-xs text-muted-foreground mt-2">{lang === "ar" ? "كل 100 نقطة = 1 د.أ خصم" : "100 points = 1 JOD discount"}</div>
        </div>

        <div className="bg-card border rounded-xl p-6 mb-4">
          <label className="text-sm font-semibold mb-2 block">{lang === "ar" ? "كود الإحالة" : "Referral Code"}</label>
          <div className="flex gap-2">
            <Input value={code} readOnly className="font-mono font-bold text-lg" />
            <Button onClick={copy} variant="outline"><Copy className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6">
          <label className="text-sm font-semibold mb-2 block">{lang === "ar" ? "رابط الدعوة" : "Invite Link"}</label>
          <div className="flex gap-2">
            <Input value={url} readOnly className="text-xs" />
            <Button onClick={share} className="bg-orange-grad text-accent-foreground"><Share2 className="h-4 w-4 mr-1" /> {lang === "ar" ? "شارك" : "Share"}</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
