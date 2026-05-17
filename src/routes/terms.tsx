import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "الشروط والأحكام — JABAL" }] }),
  component: Terms,
});

function Terms() {
  const { lang } = useI18n();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-black mb-6">{lang === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {lang === "ar" ? (
            <>
              <p>باستخدامك منصة جبل، أنت توافق على هذه الشروط.</p>
              <h2 className="text-xl font-bold text-foreground">1. الخدمة</h2>
              <p>توفر جبل منصة لربط العملاء بالموردين وخدمات البناء في الأردن.</p>
              <h2 className="text-xl font-bold text-foreground">2. الطلبات والدفع</h2>
              <p>الدفع نقداً عند الاستلام أو عبر CliQ أو التحويل البنكي. الأسعار بالدينار الأردني.</p>
              <h2 className="text-xl font-bold text-foreground">3. الإرجاع</h2>
              <p>يحق إرجاع المنتجات غير المستخدمة خلال 7 أيام.</p>
              <h2 className="text-xl font-bold text-foreground">4. المسؤولية</h2>
              <p>جبل وسيط بين الموردين والعملاء؛ جودة المنتج مسؤولية المورد.</p>
            </>
          ) : (
            <>
              <p>By using JABAL, you agree to these terms.</p>
              <h2 className="text-xl font-bold text-foreground">1. Service</h2>
              <p>JABAL provides a platform connecting customers with construction suppliers and services in Jordan.</p>
              <h2 className="text-xl font-bold text-foreground">2. Orders & Payment</h2>
              <p>Pay via Cash on Delivery, CliQ, or bank transfer. Prices in Jordanian Dinar.</p>
              <h2 className="text-xl font-bold text-foreground">3. Returns</h2>
              <p>Unused products may be returned within 7 days.</p>
              <h2 className="text-xl font-bold text-foreground">4. Liability</h2>
              <p>JABAL is an intermediary; product quality is the supplier's responsibility.</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
