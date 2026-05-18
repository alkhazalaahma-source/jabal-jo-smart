import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/subscription")({
  head: () => ({ meta: [
    { title: "اشتراكات JABAL — Plans & Pricing" },
    { name: "description", content: "اختر خطة اشتراك جبل المناسبة لك: مجانية، محترف، أو مقاول. خصومات، معاينات مجانية، ودعم مميز." },
  ]}),
  component: SubscriptionPage,
});

type Plan = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  price_monthly: number;
  price_yearly: number;
  features_ar: string[];
  features_en: string[];
  popular: boolean;
};

function SubscriptionPage() {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("subscription_plans").select("*").order("sort_order").then(({ data }) => {
      setPlans((data ?? []) as unknown as Plan[]);
      setLoading(false);
    });
  }, []);

  const subscribe = async (plan: Plan) => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول أولاً" : "Please sign in first");
      nav({ to: "/auth" });
      return;
    }
    if (plan.slug === "basic") {
      toast.success(lang === "ar" ? "أنت على الخطة المجانية بالفعل!" : "You're already on the free plan!");
      return;
    }
    const ends = new Date();
    ends.setMonth(ends.getMonth() + (cycle === "yearly" ? 12 : 1));
    const { error } = await supabase.from("user_subscriptions").insert({
      user_id: user.id, plan_id: plan.id, billing_cycle: cycle, status: "pending", ends_at: ends.toISOString(),
    });
    if (error) toast.error(error.message);
    else toast.success(lang === "ar" ? "تم تسجيل اشتراكك! سنتواصل معك لإتمام الدفع." : "Subscription registered! We'll contact you for payment.");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Crown className="h-4 w-4" /> {lang === "ar" ? "خطط الاشتراك" : "Subscription Plans"}
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            {lang === "ar" ? "اختر خطتك ووفّر أكثر" : "Pick your plan, save more"}
          </h1>
          <p className="text-muted-foreground">
            {lang === "ar" ? "خصومات، معاينات مجانية، دعم 24/7، وعروض حصرية من الموردين." : "Discounts, free inspections, 24/7 support, and exclusive supplier deals."}
          </p>

          <div className="inline-flex mt-6 bg-muted rounded-full p-1">
            <button onClick={() => setCycle("monthly")} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${cycle === "monthly" ? "bg-card shadow-card" : ""}`}>
              {lang === "ar" ? "شهري" : "Monthly"}
            </button>
            <button onClick={() => setCycle("yearly")} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${cycle === "yearly" ? "bg-card shadow-card" : ""}`}>
              {lang === "ar" ? "سنوي (وفّر 17%)" : "Yearly (save 17%)"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">{t("loading")}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((p) => {
              const price = cycle === "yearly" ? p.price_yearly : p.price_monthly;
              const features = lang === "ar" ? p.features_ar : p.features_en;
              return (
                <div
                  key={p.id}
                  className={`relative bg-card border-2 rounded-2xl p-6 shadow-card flex flex-col ${p.popular ? "border-accent shadow-elegant scale-[1.02]" : "border-border"}`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 start-1/2 -translate-x-1/2 bg-orange-grad text-accent-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {lang === "ar" ? "الأكثر شعبية" : "Most Popular"}
                    </div>
                  )}
                  <div className="text-xl font-bold mb-2">{lang === "ar" ? p.name_ar : p.name_en}</div>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-4xl font-black text-orange-grad">{price === 0 ? (lang === "ar" ? "مجاناً" : "Free") : price}</span>
                    {price > 0 && <span className="text-sm text-muted-foreground">{lang === "ar" ? "د.أ" : "JOD"} / {cycle === "yearly" ? (lang === "ar" ? "سنة" : "yr") : (lang === "ar" ? "شهر" : "mo")}</span>}
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-success mt-0.5 shrink-0" /> <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => subscribe(p)}
                    className={`w-full ${p.popular ? "bg-orange-grad text-accent-foreground" : ""}`}
                    variant={p.popular ? "default" : "outline"}
                  >
                    {p.slug === "basic" ? (lang === "ar" ? "ابدأ مجاناً" : "Start Free") : (lang === "ar" ? "اشترك الآن" : "Subscribe Now")}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
