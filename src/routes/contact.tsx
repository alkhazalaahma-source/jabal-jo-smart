import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "تواصل معنا — JABAL" }] }),
  component: Contact,
});

function Contact() {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [f, setF] = useState({ full_name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({ ...f, user_id: user?.id ?? null, type: "contact" });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم استلام رسالتك، سنتواصل معك قريباً" : "Message sent! We'll get back to you.");
    setF({ full_name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2 text-center">{t("contact_us")}</h1>
        <p className="text-center text-muted-foreground mb-10">{lang === "ar" ? "نحن هنا لمساعدتك — أرسل رسالتك وسنرد خلال 24 ساعة." : "We're here to help — send a message, we'll reply within 24 hours."}</p>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="space-y-4">
            {[
              { i: Phone, l: "+962 79 293 1516", t: lang === "ar" ? "اتصل بنا" : "Call us", href: "tel:+962792931516" },
              { i: Mail, l: "jabaljo42@gmail.com", t: lang === "ar" ? "راسلنا" : "Email", href: "mailto:jabaljo42@gmail.com" },
              { i: MessageCircle, l: "+962 79 293 1516", t: "WhatsApp", href: "https://wa.me/962792931516" },
              { i: MapPin, l: lang === "ar" ? "عمّان، الأردن" : "Amman, Jordan", t: lang === "ar" ? "المقر" : "HQ", href: "https://maps.google.com/?q=Amman,Jordan" },
            ].map((c) => (
              <a key={c.l} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="bg-card border rounded-xl p-4 flex items-center gap-3 hover:border-accent transition">
                <div className="w-11 h-11 rounded-lg bg-orange-grad flex items-center justify-center"><c.i className="h-5 w-5 text-accent-foreground" /></div>
                <div><div className="text-xs text-muted-foreground">{c.t}</div><div className="font-bold" dir="ltr">{c.l}</div></div>
              </a>
            ))}
          </div>

          <form onSubmit={submit} className="lg:col-span-2 bg-card border rounded-xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>{t("full_name")}</Label><Input required minLength={2} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></div>
              <div><Label>{t("email")}</Label><Input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
              <div><Label>{t("phone")}</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
              <div><Label>{t("subject")}</Label><Input required minLength={2} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
            </div>
            <div><Label>{t("message")}</Label><Textarea required minLength={5} rows={6} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
            <Button type="submit" disabled={loading} className="bg-orange-grad text-accent-foreground hover:opacity-90" size="lg">{loading ? t("loading") : t("send")}</Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
