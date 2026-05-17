import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "سياسة الخصوصية — JABAL" }] }),
  component: Privacy,
});

function Privacy() {
  const { lang } = useI18n();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl prose dark:prose-invert">
        <h1 className="text-4xl font-black mb-6">{lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        {lang === "ar" ? (
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>تحترم منصة جبل (JABAL.jo) خصوصية مستخدميها وتلتزم بحماية بياناتهم الشخصية.</p>
            <h2 className="text-xl font-bold text-foreground">1. البيانات التي نجمعها</h2>
            <p>نجمع: الاسم، البريد، الهاتف، العنوان، وبيانات الطلبات لتقديم الخدمة.</p>
            <h2 className="text-xl font-bold text-foreground">2. استخدام البيانات</h2>
            <p>تستخدم البيانات لمعالجة الطلبات، التواصل، تحسين الخدمة، والامتثال للقوانين.</p>
            <h2 className="text-xl font-bold text-foreground">3. حماية البيانات</h2>
            <p>نطبّق إجراءات أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح.</p>
            <h2 className="text-xl font-bold text-foreground">4. حقوقك</h2>
            <p>يحق لك الوصول لبياناتك، تعديلها، أو حذفها بمراسلتنا على info@jabal.jo.</p>
          </div>
        ) : (
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>JABAL respects user privacy and is committed to protecting personal data.</p>
            <h2 className="text-xl font-bold text-foreground">1. Data we collect</h2>
            <p>Name, email, phone, address, and order data to deliver the service.</p>
            <h2 className="text-xl font-bold text-foreground">2. How we use data</h2>
            <p>To process orders, communicate, improve service, and comply with law.</p>
            <h2 className="text-xl font-bold text-foreground">3. Protection</h2>
            <p>We apply technical and organizational measures to protect your data.</p>
            <h2 className="text-xl font-bold text-foreground">4. Your rights</h2>
            <p>You may access, edit or delete your data — email info@jabal.jo.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
