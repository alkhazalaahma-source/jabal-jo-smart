import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints")({
  head: () => ({ meta: [{ title: "الشكاوى — JABAL Complaints" }] }),
  component: Complaints,
});

function Complaints() {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [f, setF] = useState({ full_name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.from("contact_messages").insert({ ...f, user_id: user?.id ?? null, type: "complaint" }).select("ticket_number").single();
    setLoading(false);
    if (error) return toast.error(error.message);
    setTicket(data?.ticket_number ?? null);
    toast.success(lang === "ar" ? "تم استلام شكواك" : "Complaint received");
  };

  if (ticket) return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <AlertCircle className="h-20 w-20 mx-auto text-success mb-4" />
        <h2 className="text-2xl font-black mb-2">{lang === "ar" ? "تم استلام شكواك" : "Complaint received"}</h2>
        <p className="text-muted-foreground">{lang === "ar" ? "رقم التذكرة" : "Ticket #"}</p>
        <p className="text-2xl font-bold text-orange-grad">{ticket}</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-3xl font-black mb-2">{t("complaints")}</h1>
        <p className="text-muted-foreground mb-6">{lang === "ar" ? "نأخذ شكواك بجدية. سنرد خلال 24 ساعة." : "We take complaints seriously. Reply within 24h."}</p>
        <form onSubmit={submit} className="bg-card border rounded-xl p-6 space-y-4">
          <div><Label>{t("full_name")}</Label><Input required minLength={2} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
          <div><Label>{t("email")}</Label><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><Label>{t("phone")}</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>{t("subject")}</Label><Input required minLength={2} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div><Label>{t("message")}</Label><Textarea required minLength={5} rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-orange-grad text-accent-foreground hover:opacity-90">{loading ? t("loading") : t("send")}</Button>
        </form>
      </div>
    </Layout>
  );
}
