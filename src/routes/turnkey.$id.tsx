import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Building2, Clock, MapPin, Star, Check, Send, Camera, CreditCard } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/turnkey/$id")({
  head: () => ({ meta: [{ title: "تفاصيل المشروع — JABAL" }] }),
  component: ProjectDetail,
});

type Project = {
  id: string; project_number: string; user_id: string;
  full_name: string; phone: string; project_type: string;
  area_m2: number; floors: number; city: string; address: string | null;
  budget_min: number | null; budget_max: number | null;
  finish_level: string; description: string | null; status: string;
  progress_percent: number; accepted_bid_id: string | null;
  assigned_contractor_id: string | null; created_at: string;
};
type Bid = {
  id: string; project_id: string; contractor_id: string; user_id: string;
  price: number; duration_days: number; details: string | null; materials: string | null;
  warranty_months: number; status: string; created_at: string;
  contractor?: { name: string; name_ar: string | null; logo_url: string | null; rating: number; completed_projects: number };
};
type Update = { id: string; title: string; description: string | null; progress_percent: number | null; stage: string | null; created_at: string; photos: string[] };
type Payment = { id: string; label: string; amount: number; due_date: string | null; status: string; paid_at: string | null };

function ProjectDetail() {
  const { id } = Route.useParams();
  const { lang } = useI18n();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ price: "", duration_days: "", details: "", warranty_months: "12", contractor_id: "" });
  const [updForm, setUpdForm] = useState({ title: "", description: "", progress_percent: "", stage: "" });
  const [payForm, setPayForm] = useState({ label: "", amount: "", due_date: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: p }, { data: b }, { data: u }, { data: pay }] = await Promise.all([
      supabase.from("turnkey_projects" as never).select("*").eq("id", id).maybeSingle(),
      supabase.from("contractor_bids" as never).select("*, contractor:contractors(name, name_ar, logo_url, rating, completed_projects)").eq("project_id", id).order("price", { ascending: true }),
      supabase.from("project_updates" as never).select("*").eq("project_id", id).order("created_at", { ascending: false }),
      supabase.from("project_payments" as never).select("*").eq("project_id", id).order("due_date", { ascending: true }),
    ]);
    setProject(p as Project | null);
    setBids((b as Bid[]) ?? []);
    setUpdates((u as Update[]) ?? []);
    setPayments((pay as Payment[]) ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <Layout><div className="container mx-auto py-20 text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</div></Layout>;
  if (!project) return <Layout><div className="container mx-auto py-20 text-center">{lang === "ar" ? "المشروع غير موجود" : "Project not found"}</div></Layout>;

  const isOwner = user?.id === project.user_id;
  const acceptedBid = bids.find((b) => b.id === project.accepted_bid_id);

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error(lang === "ar" ? "سجّل الدخول أولاً" : "Sign in first");
    if (!bidForm.contractor_id) return toast.error(lang === "ar" ? "اختر شركة المقاولات" : "Pick a contractor");
    const { error } = await supabase.from("contractor_bids" as never).insert({
      project_id: id, contractor_id: bidForm.contractor_id, user_id: user.id,
      price: Number(bidForm.price), duration_days: Number(bidForm.duration_days),
      details: bidForm.details, warranty_months: Number(bidForm.warranty_months),
    } as never);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم إرسال العرض" : "Bid submitted");
    setBidForm({ price: "", duration_days: "", details: "", warranty_months: "12", contractor_id: "" });
    load();
  };

  const acceptBid = async (bid: Bid) => {
    if (!confirm(lang === "ar" ? "تأكيد قبول هذا العرض؟" : "Accept this bid?")) return;
    const { error: e1 } = await supabase.from("turnkey_projects" as never).update({
      accepted_bid_id: bid.id, assigned_contractor_id: bid.contractor_id, status: "in_progress",
    } as never).eq("id", id);
    if (e1) return toast.error(e1.message);
    await supabase.from("contractor_bids" as never).update({ status: "accepted" } as never).eq("id", bid.id);
    toast.success(lang === "ar" ? "تم قبول العرض!" : "Bid accepted!");
    load();
  };

  const addUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("project_updates" as never).insert({
      project_id: id, user_id: user.id,
      title: updForm.title, description: updForm.description,
      progress_percent: updForm.progress_percent ? Number(updForm.progress_percent) : null,
      stage: updForm.stage || null,
    } as never);
    if (error) return toast.error(error.message);
    if (updForm.progress_percent) {
      await supabase.from("turnkey_projects" as never).update({ progress_percent: Number(updForm.progress_percent) } as never).eq("id", id);
    }
    setUpdForm({ title: "", description: "", progress_percent: "", stage: "" });
    toast.success(lang === "ar" ? "تم إضافة التحديث" : "Update added");
    load();
  };

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("project_payments" as never).insert({
      project_id: id, label: payForm.label, amount: Number(payForm.amount),
      due_date: payForm.due_date || null,
    } as never);
    if (error) return toast.error(error.message);
    setPayForm({ label: "", amount: "", due_date: "" });
    toast.success(lang === "ar" ? "تم إضافة الدفعة" : "Payment added");
    load();
  };

  const markPaid = async (p: Payment) => {
    const { error } = await supabase.from("project_payments" as never).update({ status: "paid", paid_at: new Date().toISOString() } as never).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم تسجيل الدفعة" : "Payment recorded");
    load();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/turnkey/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 me-1" /> {lang === "ar" ? "العودة" : "Back"}
        </Link>

        <div className="bg-card border rounded-2xl p-6 mb-6 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-xs text-muted-foreground">{project.project_number}</div>
              <h1 className="text-2xl font-black flex items-center gap-2"><Building2 className="h-6 w-6 text-orange-grad" />{project.project_type}</h1>
            </div>
            <span className="bg-orange-grad text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">{project.status}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
            <div><div className="text-muted-foreground">{lang === "ar" ? "المساحة" : "Area"}</div><div className="font-bold">{project.area_m2} m²</div></div>
            <div><div className="text-muted-foreground">{lang === "ar" ? "الطوابق" : "Floors"}</div><div className="font-bold">{project.floors}</div></div>
            <div><div className="text-muted-foreground"><MapPin className="h-3 w-3 inline" /> {lang === "ar" ? "المدينة" : "City"}</div><div className="font-bold">{project.city}</div></div>
            <div><div className="text-muted-foreground">{lang === "ar" ? "الميزانية" : "Budget"}</div><div className="font-bold">{project.budget_min ?? "—"}–{project.budget_max ?? "—"} JOD</div></div>
          </div>

          {project.description && <p className="text-sm text-muted-foreground border-t pt-3">{project.description}</p>}

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1"><span>{lang === "ar" ? "نسبة الإنجاز" : "Progress"}</span><span className="font-bold">{project.progress_percent ?? 0}%</span></div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className="bg-orange-grad h-full transition-all" style={{ width: `${project.progress_percent ?? 0}%` }} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="bids" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="bids">{lang === "ar" ? `العروض (${bids.length})` : `Bids (${bids.length})`}</TabsTrigger>
            <TabsTrigger value="updates">{lang === "ar" ? `التحديثات (${updates.length})` : `Updates (${updates.length})`}</TabsTrigger>
            <TabsTrigger value="payments">{lang === "ar" ? `الدفعات (${payments.length})` : `Payments (${payments.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="bids" className="space-y-3 mt-4">
            {acceptedBid && (
              <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-4">
                <div className="text-green-600 font-bold mb-1">✓ {lang === "ar" ? "العرض المعتمد" : "Accepted bid"}</div>
                <div className="text-sm">{acceptedBid.price} JOD · {acceptedBid.duration_days} {lang === "ar" ? "يوم" : "days"}</div>
              </div>
            )}
            {bids.map((b) => (
              <div key={b.id} className="bg-card border rounded-2xl p-4 flex flex-wrap items-center gap-4">
                <img src={b.contractor?.logo_url ?? ""} alt="" className="w-14 h-14 rounded-xl object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-[180px]">
                  <div className="font-bold">{lang === "ar" && b.contractor?.name_ar ? b.contractor.name_ar : b.contractor?.name}</div>
                  <div className="flex items-center gap-1 text-xs text-amber-500"><Star className="h-3 w-3 fill-current" /> {Number(b.contractor?.rating ?? 0).toFixed(1)} · {b.contractor?.completed_projects} {lang === "ar" ? "مشروع" : "projects"}</div>
                  {b.details && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{b.details}</p>}
                </div>
                <div className="text-end">
                  <div className="text-xl font-black text-orange-grad">{b.price.toLocaleString()} JOD</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="h-3 w-3" /> {b.duration_days} {lang === "ar" ? "يوم" : "d"} · ⚙ {b.warranty_months}m</div>
                </div>
                {isOwner && !project.accepted_bid_id && (
                  <Button onClick={() => acceptBid(b)} className="bg-orange-grad text-accent-foreground"><Check className="h-4 w-4 me-1" />{lang === "ar" ? "قبول" : "Accept"}</Button>
                )}
              </div>
            ))}
            {bids.length === 0 && <div className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد عروض بعد" : "No bids yet"}</div>}

            {!isOwner && user && !project.accepted_bid_id && (
              <form onSubmit={submitBid} className="bg-card border rounded-2xl p-5 mt-4 space-y-3">
                <div className="font-bold">{lang === "ar" ? "تقديم عرض كمقاول" : "Submit a bid (contractor)"}</div>
                <ContractorPicker value={bidForm.contractor_id} onChange={(v) => setBidForm({ ...bidForm, contractor_id: v })} lang={lang} />
                <div className="grid md:grid-cols-3 gap-3">
                  <Input type="number" required placeholder={lang === "ar" ? "السعر JOD" : "Price JOD"} value={bidForm.price} onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })} />
                  <Input type="number" required placeholder={lang === "ar" ? "المدة (يوم)" : "Days"} value={bidForm.duration_days} onChange={(e) => setBidForm({ ...bidForm, duration_days: e.target.value })} />
                  <Input type="number" placeholder={lang === "ar" ? "ضمان (شهر)" : "Warranty months"} value={bidForm.warranty_months} onChange={(e) => setBidForm({ ...bidForm, warranty_months: e.target.value })} />
                </div>
                <Textarea rows={3} placeholder={lang === "ar" ? "تفاصيل العرض والمواد" : "Bid details & materials"} value={bidForm.details} onChange={(e) => setBidForm({ ...bidForm, details: e.target.value })} />
                <Button type="submit" className="bg-orange-grad text-accent-foreground"><Send className="h-4 w-4 me-2" />{lang === "ar" ? "إرسال العرض" : "Submit bid"}</Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="updates" className="space-y-3 mt-4">
            {updates.map((u) => (
              <div key={u.id} className="bg-card border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold flex items-center gap-2"><Camera className="h-4 w-4 text-accent" />{u.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>
                {u.stage && <div className="text-xs text-muted-foreground mb-1">{u.stage}</div>}
                {u.description && <p className="text-sm">{u.description}</p>}
                {u.progress_percent != null && <div className="text-xs text-orange-grad font-bold mt-1">{u.progress_percent}%</div>}
              </div>
            ))}
            {updates.length === 0 && <div className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد تحديثات" : "No updates yet"}</div>}

            {(isOwner || (user && user.id !== project.user_id)) && (
              <form onSubmit={addUpdate} className="bg-card border rounded-2xl p-5 space-y-3">
                <div className="font-bold">{lang === "ar" ? "إضافة تحديث" : "Add update"}</div>
                <Input required placeholder={lang === "ar" ? "العنوان" : "Title"} value={updForm.title} onChange={(e) => setUpdForm({ ...updForm, title: e.target.value })} />
                <div className="grid md:grid-cols-2 gap-3">
                  <Input placeholder={lang === "ar" ? "المرحلة (أساسات، هيكل...)" : "Stage"} value={updForm.stage} onChange={(e) => setUpdForm({ ...updForm, stage: e.target.value })} />
                  <Input type="number" min="0" max="100" placeholder={lang === "ar" ? "نسبة الإنجاز %" : "Progress %"} value={updForm.progress_percent} onChange={(e) => setUpdForm({ ...updForm, progress_percent: e.target.value })} />
                </div>
                <Textarea rows={3} placeholder={lang === "ar" ? "وصف العمل المنجز" : "Description"} value={updForm.description} onChange={(e) => setUpdForm({ ...updForm, description: e.target.value })} />
                <Button type="submit" className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "نشر التحديث" : "Post update"}</Button>
              </form>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-3 mt-4">
            {payments.map((p) => (
              <div key={p.id} className="bg-card border rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <CreditCard className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <div className="font-bold">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.due_date ?? "—"}</div>
                </div>
                <div className="text-end">
                  <div className="font-black text-orange-grad">{p.amount.toLocaleString()} JOD</div>
                  <div className={`text-xs font-bold ${p.status === "paid" ? "text-green-600" : "text-amber-600"}`}>{p.status}</div>
                </div>
                {p.status !== "paid" && isOwner && <Button size="sm" variant="outline" onClick={() => markPaid(p)}>{lang === "ar" ? "تسجيل دفع" : "Mark paid"}</Button>}
              </div>
            ))}
            {payments.length === 0 && <div className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا توجد دفعات" : "No payments"}</div>}

            {(isOwner || (user && user.id !== project.user_id)) && (
              <form onSubmit={addPayment} className="bg-card border rounded-2xl p-5 space-y-3">
                <div className="font-bold">{lang === "ar" ? "إضافة دفعة" : "Add payment"}</div>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input required placeholder={lang === "ar" ? "وصف (دفعة أولى...)" : "Label"} value={payForm.label} onChange={(e) => setPayForm({ ...payForm, label: e.target.value })} />
                  <Input required type="number" placeholder="JOD" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
                  <Input type="date" value={payForm.due_date} onChange={(e) => setPayForm({ ...payForm, due_date: e.target.value })} />
                </div>
                <Button type="submit" className="bg-orange-grad text-accent-foreground">{lang === "ar" ? "إضافة" : "Add"}</Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function ContractorPicker({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: "ar" | "en" }) {
  const [items, setItems] = useState<{ id: string; name: string; name_ar: string | null }[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("contractors" as never).select("id, name, name_ar").order("name");
      setItems((data as { id: string; name: string; name_ar: string | null }[]) ?? []);
    })();
  }, []);
  return (
    <div>
      <Label>{lang === "ar" ? "شركة المقاولات" : "Contractor"}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
        <option value="">{lang === "ar" ? "اختر..." : "Select..."}</option>
        {items.map((c) => (<option key={c.id} value={c.id}>{lang === "ar" && c.name_ar ? c.name_ar : c.name}</option>))}
      </select>
    </div>
  );
}
