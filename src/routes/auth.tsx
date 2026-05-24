import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import logo from "@/assets/jabal-logo.png";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s.redirect === "string" ? s.redirect : "/" }),
  head: () => ({ meta: [{ title: "تسجيل الدخول — JABAL" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const { redirect } = Route.useSearch();
  const nav = useNavigate();
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ full_name: "", email: "", phone: "", password: "" });

  const [mfa, setMfa] = useState<{ factorId: string; challengeId: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => { if (user && !mfa) nav({ to: redirect as never }); }, [user, redirect, nav, mfa]);

  const checkMfa = async () => {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel === "aal1") {
      const { data: list } = await supabase.auth.mfa.listFactors();
      const totp = list?.totp?.[0];
      if (totp) {
        const { data: ch, error } = await supabase.auth.mfa.challenge({ factorId: totp.id });
        if (error || !ch) return toast.error(error?.message || "MFA challenge failed");
        setMfa({ factorId: totp.id, challengeId: ch.id });
        return true;
      }
    }
    return false;
  };

  const verifyMfa = async () => {
    if (!mfa) return;
    setLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: mfa.factorId, challengeId: mfa.challengeId, code: mfaCode });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تم التحقق ✓" : "Verified ✓");
    setMfa(null); setMfaCode("");
  };

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(login);
    if (error) { setLoading(false); return toast.error(error.message); }
    const needsMfa = await checkMfa();
    setLoading(false);
    if (!needsMfa) toast.success(lang === "ar" ? "تم تسجيل الدخول" : "Signed in");
  };


  const doSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: signup.full_name, phone: signup.phone } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success(lang === "ar" ? "تفقّد بريدك لتأكيد الحساب" : "Check your email to confirm");
  };

  const doGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message);
  };
  const doApple = async () => {
    const result = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-card border rounded-2xl p-8 shadow-elegant">
          <div className="text-center mb-6">
            <img src={logo} alt="JABAL" className="h-14 mx-auto mb-3" />
            <h1 className="text-2xl font-black">JABAL</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("brand_tagline")}</p>
          </div>

          {mfa ? (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-bold">{lang === "ar" ? "التحقق بخطوتين" : "Two-Factor Verification"}</h2>
                <p className="text-sm text-muted-foreground mt-1">{lang === "ar" ? "أدخل الرمز من تطبيق المصادقة" : "Enter the code from your authenticator app"}</p>
              </div>
              <Input maxLength={6} value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="text-center text-2xl tracking-widest font-mono" autoFocus />
              <Button onClick={verifyMfa} disabled={loading || mfaCode.length !== 6} className="w-full bg-orange-grad text-accent-foreground hover:opacity-90">{loading ? t("loading") : (lang === "ar" ? "تحقق" : "Verify")}</Button>
              <Button variant="ghost" className="w-full" onClick={() => { setMfa(null); setMfaCode(""); supabase.auth.signOut(); }}>{lang === "ar" ? "إلغاء" : "Cancel"}</Button>
            </div>
          ) : (
            <>


          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={doGoogle}>
              <svg className="h-5 w-5 me-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
              {t("google_signin")}
            </Button>
            <Button variant="outline" className="w-full" onClick={doApple}>
              <svg className="h-5 w-5 me-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              {lang === "ar" ? "المتابعة بـ Apple" : "Continue with Apple"}
            </Button>
          </div>

          <div className="relative my-5"><Separator /><span className="absolute inset-0 -top-3 text-center"><span className="bg-card px-3 text-xs text-muted-foreground">{t("or")}</span></span></div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full"><TabsTrigger value="login">{t("login")}</TabsTrigger><TabsTrigger value="signup">{t("register")}</TabsTrigger></TabsList>

            <TabsContent value="login">
              <form onSubmit={doLogin} className="space-y-3 mt-4">
                <div><Label>{t("email")}</Label><Input type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></div>
                <div><Label>{t("password")}</Label><Input type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></div>
                <Button type="submit" disabled={loading} className="w-full bg-orange-grad text-accent-foreground hover:opacity-90">{loading ? t("loading") : t("login")}</Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={doSignup} className="space-y-3 mt-4">
                <div><Label>{t("full_name")}</Label><Input required value={signup.full_name} onChange={(e) => setSignup({ ...signup, full_name: e.target.value })} /></div>
                <div><Label>{t("email")}</Label><Input type="email" required value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} /></div>
                <div><Label>{t("phone")}</Label><Input value={signup.phone} onChange={(e) => setSignup({ ...signup, phone: e.target.value })} /></div>
                <div><Label>{t("password")}</Label><Input type="password" minLength={6} required value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} /></div>
                <Button type="submit" disabled={loading} className="w-full bg-orange-grad text-accent-foreground hover:opacity-90">{loading ? t("loading") : t("register")}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center mt-5">
            <Link to="/terms" className="hover:text-foreground">{t("terms")}</Link> · <Link to="/privacy" className="hover:text-foreground">{t("privacy")}</Link>
          </p>
            </>
          )}
        </div>

      </div>
    </Layout>
  );
}
