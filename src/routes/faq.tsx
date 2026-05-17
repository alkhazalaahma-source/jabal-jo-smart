import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "الأسئلة الشائعة — JABAL FAQ" }] }),
  component: FAQ,
});

const FAQS = [
  { qar: "كيف أطلب من جبل؟", qen: "How do I order from JABAL?", aar: "تصفح السوق، أضف للسلة، أكمل الـ Checkout، واختر الدفع.", aen: "Browse the marketplace, add to cart, complete checkout, choose payment." },
  { qar: "ما طرق الدفع المتاحة؟", qen: "What payment methods are available?", aar: "نقداً عند الاستلام، CliQ، تحويل بنكي.", aen: "Cash on Delivery, CliQ, Bank Transfer." },
  { qar: "كم تستغرق مدة التوصيل؟", qen: "How long does delivery take?", aar: "1-3 أيام عمل داخل عمّان، 2-5 أيام لباقي المحافظات.", aen: "1-3 business days in Amman, 2-5 days elsewhere." },
  { qar: "هل يمكنني إرجاع المنتج؟", qen: "Can I return a product?", aar: "نعم، خلال 7 أيام من الاستلام، بشرط أن يكون غير مستعمل.", aen: "Yes, within 7 days, if unused." },
  { qar: "هل الموردون موثقون؟", qen: "Are suppliers verified?", aar: "كل مورد على جبل يمر بفحص يدوي وآلي للجودة.", aen: "Every supplier passes manual + automated verification." },
  { qar: "كيف أتواصل مع الدعم؟", qen: "How do I contact support?", aar: "صفحة التواصل، أو واتساب 962790000000+.", aen: "Use the contact page or WhatsApp +962790000000." },
];

function FAQ() {
  const { lang, t } = useI18n();
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-black mb-8 text-center">{t("faq")}</h1>
        <Accordion type="single" collapsible className="bg-card border rounded-xl px-4">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`}>
              <AccordionTrigger className="text-start font-bold">{lang === "ar" ? f.qar : f.qen}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{lang === "ar" ? f.aar : f.aen}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
