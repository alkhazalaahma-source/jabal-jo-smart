import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Send } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/rfq")({
  head: () => ({ meta: [{ title: "طلب عرض سعر — JABAL" }] }),
  component: RFQ,
});

function RFQ() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", city: "عمان",
    material: "إسمنت", quantity: "10", unit: "ton", delivery_date: "", notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from("rfq_requests").insert({
      ...form,
      quantity: Number(form.quantity),
      delivery_date: form.delivery_date || null,
      user_id: user?.id || null,
    }).select("ticket_number").single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setTicket(data?.ticket_number || null);
    toast.success(lang === "ar" ? "تم استلام طلبك! سنتواصل معك" : "Request received!");
  };

  if (ticket) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <div className="bg-card border-2 border-accent rounded-2xl p-10">
            <FileText className="h-16 w-16 mx-auto text-accent mb-4" />
            <h1 className="text-3xl font-black mb-3">{lang === "ar" ? "تم إرسال طلبك" : "Request Sent"}</h1>
            <p className="text-muted-foreground mb-4">{lang === "ar" ? "رقم الطلب:" : "Ticket #:"}</p>
            <div className="text-3xl font-black text-orange-grad mb-6">{ticket}</div>
            <p className="text-sm text-muted-foreground mb-6">{lang === "ar" ? "سيتم تواصل الموردين معك خلال 24 ساعة بعروض الأسعار" : "Suppliers will contact you within 24 hours"}</p>
            <Button onClick={() => nav({ to: "/suppliers" })} className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "تصفح الموردين" : "Browse Suppliers"}</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl font-black mb-2">{lang === "ar" ? "طلب عرض سعر (RFQ)" : "Request a Quote"}</h1>
        <p className="text-muted-foreground mb-6">{lang === "ar" ? "املأ الطلب واستقبل عروض من أفضل الموردين" : "Submit and receive offers from top suppliers"}</p>
        <form onSubmit={submit} className="space-y-4 bg-card border rounded-xl p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>{lang === "ar" ? "الاسم" : "Name"}</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>{lang === "ar" ? "الهاتف" : "Phone"}</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>{lang === "ar" ? "البريد" : "Email"}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>{lang === "ar" ? "المدينة" : "City"}</Label><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
            <div><Label>{lang === "ar" ? "المادة" : "Material"}</Label><Input required value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder={lang === "ar" ? "إسمنت، حديد، بحص..." : "Cement, Steel..."} /></div>
            <div><Label>{lang === "ar" ? "الكمية" : "Quantity"}</Label><Input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
            <div><Label>{lang === "ar" ? "الوحدة" : "Unit"}</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="ton">{lang === "ar" ? "طن" : "Ton"}</option>
                <option value="bag">{lang === "ar" ? "كيس" : "Bag"}</option>
                <option value="m3">{lang === "ar" ? "م³" : "m³"}</option>
                <option value="piece">{lang === "ar" ? "قطعة" : "Piece"}</option>
              </select>
            </div>
            <div><Label>{lang === "ar" ? "تاريخ التسليم" : "Delivery Date"}</Label><Input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} /></div>
          </div>
          <div><Label>{lang === "ar" ? "ملاحظات" : "Notes"}</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-orange-grad text-accent-foreground">
            <Send className="h-4 w-4 mr-2" /> {loading ? "..." : (lang === "ar" ? "إرسال الطلب" : "Send Request")}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
