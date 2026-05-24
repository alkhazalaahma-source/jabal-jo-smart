import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldOff, Smartphone, KeyRound, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "الأمان والتحقق بخطوتين — JABAL" }] }),
  component: SecurityPage,
});

type Factor = { id: string; friendly_name?: string; factor_type: string; status: string };

function SecurityPage() {
  const { lang } = useI18n();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [friendly, setFriendly] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth", search: { redirect: "/security" } as never }); }, [user, loading, nav]);

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const startEnroll = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: friendly || `JABAL ${new Date().toLocaleDateString()}`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnroll = async () => {
    if (!enroll) return;
    setBusy(true);
    const { data: ch, error: ce } = await supabase.auth.mfa.challenge({ factorId: enroll.id });
    if (ce || !ch) { setBusy(false); return toast.error(ce?.message || "Challenge failed"); }
    const { error } = await supabase.auth.mfa.verify({ factorId: enroll.id, challengeId: ch.id, code });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم تفعيل التحقق بخطوتين ✓" : "2FA enabled ✓");
    setEnroll(null); setCode(""); setFriendly(""); load();
  };

  const removeFactor = async (id: string) => {
    if (!confirm(lang === "ar" ? "إزالة هذا الجهاز؟" : "Remove this device?")) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تمت الإزالة" : "Removed");
    load();
  };

  const verified = factors.filter((f) => f.status === "verified");
  const isEnabled = verified.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <Shield className="h-7 w-7 text-accent" /> {lang === "ar" ? "الأمان" : "Security"}
        </h1>
        <p className="text-muted-foreground mb-6">{lang === "ar" ? "احمِ حسابك بطبقة تحقق إضافية." : "Protect your account with an extra verification layer."}</p>

        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                {isEnabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <ShieldOff className="h-5 w-5 text-muted-foreground" />}
                {lang === "ar" ? "التحقق بخطوتين (TOTP)" : "Two-Factor Auth (TOTP)"}
              </h2>
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "استخدم Google Authenticator أو Authy" : "Use Google Authenticator or Authy"}</p>
            </div>
            <Badge variant={isEnabled ? "default" : "secondary"}>{isEnabled ? (lang === "ar" ? "مفعّل" : "Enabled") : (lang === "ar" ? "غير مفعّل" : "Disabled")}</Badge>
          </div>

          {verified.length > 0 && (
            <div className="space-y-2 mb-4">
              {verified.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-accent" />
                    <span>{f.friendly_name || "TOTP Device"}</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeFactor(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}

          {!enroll ? (
            <div className="space-y-3">
              <div>
                <Label>{lang === "ar" ? "اسم الجهاز" : "Device name"}</Label>
                <Input placeholder={lang === "ar" ? "مثلاً: هاتفي" : "e.g. My phone"} value={friendly} onChange={(e) => setFriendly(e.target.value)} />
              </div>
              <Button onClick={startEnroll} disabled={busy} className="bg-orange-grad text-accent-foreground hover:opacity-90">
                <KeyRound className="h-4 w-4 me-2" /> {lang === "ar" ? "إضافة جهاز جديد" : "Add new device"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 border-t pt-4 mt-4">
              <p className="text-sm">{lang === "ar" ? "1) امسح رمز QR في تطبيق المصادقة:" : "1) Scan this QR in your authenticator app:"}</p>
              <div className="bg-white p-4 rounded-lg flex justify-center" dangerouslySetInnerHTML={{ __html: enroll.qr }} />
              <p className="text-xs text-muted-foreground break-all">{lang === "ar" ? "أو أدخل الكود يدوياً:" : "Or enter manually:"} <code className="bg-muted px-1.5 py-0.5 rounded">{enroll.secret}</code></p>
              <div>
                <Label>{lang === "ar" ? "2) أدخل الرمز المكوّن من 6 أرقام" : "2) Enter the 6-digit code"}</Label>
                <Input maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="text-center text-2xl tracking-widest font-mono" />
              </div>
              <div className="flex gap-2">
                <Button onClick={verifyEnroll} disabled={busy || code.length !== 6} className="flex-1 bg-orange-grad text-accent-foreground hover:opacity-90">{lang === "ar" ? "تأكيد التفعيل" : "Verify & Enable"}</Button>
                <Button variant="outline" onClick={() => { setEnroll(null); setCode(""); }}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-5 mt-4 text-sm text-muted-foreground">
          <p>{lang === "ar" ? "💡 بعد التفعيل، سيُطلب منك إدخال رمز عند كل تسجيل دخول. يعمل التحقق بخطوتين لجميع المستخدمين بكافة الأدوار (عميل، مقاول، إدارة)." : "After enabling, you'll be asked for a code at every login. 2FA works for all user roles (customer, contractor, admin)."}</p>
        </div>
      </div>
    </Layout>
  );
}
