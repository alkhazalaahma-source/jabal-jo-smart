// i18n — bilingual AR/EN with full translation dictionary
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const T: Dict = {
  brand_tagline: { ar: "سوق البناء الذكي", en: "Smart Construction Marketplace" },
  hero_title_1: { ar: "نبني الثقة،", en: "We build trust" },
  hero_title_2: { ar: "قبل أن نبني الجدران", en: "before we build walls" },
  hero_sub: {
    ar: "منصة JABAL تربط الموردين والمقاولين والمهندسين والعملاء في الأردن داخل نظام رقمي ذكي واحد. اطلب مواد البناء والخدمات الهندسية بأقل من 30 ثانية.",
    en: "JABAL connects suppliers, contractors, engineers and customers in Jordan in one smart digital ecosystem. Order materials & engineering services in under 30 seconds.",
  },
  cta_browse: { ar: "تصفح السوق", en: "Browse Marketplace" },
  cta_ai: { ar: "اسأل جبل AI", en: "Ask JABAL AI" },
  stat_suppliers: { ar: "مورد موثق", en: "Verified Suppliers" },
  stat_products: { ar: "منتج", en: "Products" },
  stat_cities: { ar: "محافظة", en: "Governorates" },
  stat_satisfaction: { ar: "رضا العملاء", en: "Customer Satisfaction" },
  nav_home: { ar: "الرئيسية", en: "Home" },
  nav_market: { ar: "السوق", en: "Marketplace" },
  nav_services: { ar: "الخدمات", en: "Services" },
  nav_companies: { ar: "الشركات", en: "Companies" },
  nav_about: { ar: "عن جبل", en: "About" },
  nav_contact: { ar: "تواصل", en: "Contact" },
  nav_ai: { ar: "جبل AI", en: "JABAL AI" },
  nav_orders: { ar: "طلباتي", en: "My Orders" },
  nav_profile: { ar: "حسابي", en: "Profile" },
  login: { ar: "تسجيل الدخول", en: "Sign In" },
  register: { ar: "إنشاء حساب", en: "Sign Up" },
  logout: { ar: "تسجيل الخروج", en: "Sign Out" },
  email: { ar: "البريد الإلكتروني", en: "Email" },
  password: { ar: "كلمة المرور", en: "Password" },
  full_name: { ar: "الاسم الكامل", en: "Full Name" },
  phone: { ar: "رقم الهاتف", en: "Phone" },
  google_signin: { ar: "المتابعة بحساب Google", en: "Continue with Google" },
  or: { ar: "أو", en: "or" },
  cart: { ar: "السلة", en: "Cart" },
  cart_empty: { ar: "سلتك فارغة", en: "Your cart is empty" },
  cart_subtotal: { ar: "المجموع الفرعي", en: "Subtotal" },
  delivery: { ar: "التوصيل", en: "Delivery" },
  tax: { ar: "الضريبة", en: "Tax" },
  total: { ar: "الإجمالي", en: "Total" },
  checkout: { ar: "إتمام الطلب", en: "Checkout" },
  add_to_cart: { ar: "أضف للسلة", en: "Add to Cart" },
  buy_now: { ar: "اشتر الآن", en: "Buy Now" },
  quick_view: { ar: "نظرة سريعة", en: "Quick View" },
  details: { ar: "التفاصيل", en: "Details" },
  in_stock: { ar: "متوفر", en: "In Stock" },
  out_of_stock: { ar: "غير متوفر", en: "Out of Stock" },
  verified: { ar: "موثق", en: "Verified" },
  featured: { ar: "مميز", en: "Featured" },
  rating: { ar: "تقييم", en: "Rating" },
  search_placeholder: { ar: "ابحث عن منتجات، شركات، تصنيفات...", en: "Search products, brands, categories..." },
  filter_all: { ar: "الكل", en: "All" },
  filter_featured: { ar: "المميز", en: "Featured" },
  filter_in_stock: { ar: "متوفر فقط", en: "In Stock Only" },
  sort_newest: { ar: "الأحدث", en: "Newest" },
  sort_price_low: { ar: "السعر: الأقل", en: "Price: Low to High" },
  sort_price_high: { ar: "السعر: الأعلى", en: "Price: High to Low" },
  sort_popular: { ar: "الأكثر طلباً", en: "Most Popular" },
  quantity: { ar: "الكمية", en: "Quantity" },
  remove: { ar: "حذف", en: "Remove" },
  shipping_to: { ar: "التوصيل إلى", en: "Shipping To" },
  city: { ar: "المدينة", en: "City" },
  address: { ar: "العنوان التفصيلي", en: "Detailed Address" },
  notes: { ar: "ملاحظات", en: "Notes" },
  payment_method: { ar: "طريقة الدفع", en: "Payment Method" },
  pay_cash: { ar: "نقداً عند الاستلام", en: "Cash on Delivery" },
  pay_cliq: { ar: "تحويل CliQ", en: "CliQ Transfer" },
  pay_bank: { ar: "تحويل بنكي", en: "Bank Transfer" },
  place_order: { ar: "تأكيد الطلب", en: "Place Order" },
  order_summary: { ar: "ملخص الطلب", en: "Order Summary" },
  order_success: { ar: "تم استلام طلبك بنجاح!", en: "Order placed successfully!" },
  order_number: { ar: "رقم الطلب", en: "Order Number" },
  ai_welcome: {
    ar: "أهلاً! أنا جبل AI، مساعدك الذكي للبناء. اسألني عن أي شيء — تقدير المواد، اختيار الموردين، نصائح الإنشاء، أو حتى السلام عليكم 👷",
    en: "Hi! I'm JABAL AI, your smart construction assistant. Ask me anything — material estimation, supplier selection, build tips, or just say hi 👷",
  },
  ai_input: { ar: "اكتب رسالتك...", en: "Type a message..." },
  ai_thinking: { ar: "جبل يفكر...", en: "JABAL is thinking..." },
  footer_rights: { ar: "جميع الحقوق محفوظة", en: "All rights reserved" },
  footer_built: { ar: "بُنيت بفخر في الأردن", en: "Built with pride in Jordan" },
  privacy: { ar: "سياسة الخصوصية", en: "Privacy Policy" },
  terms: { ar: "الشروط والأحكام", en: "Terms & Conditions" },
  faq: { ar: "الأسئلة الشائعة", en: "FAQ" },
  complaints: { ar: "الشكاوى", en: "Complaints" },
  support: { ar: "الدعم الفني", en: "Support" },
  about_title: { ar: "حول جبل", en: "About JABAL" },
  vision: { ar: "رؤيتنا", en: "Our Vision" },
  mission: { ar: "رسالتنا", en: "Our Mission" },
  team: { ar: "فريق جبل", en: "JABAL Team" },
  contact_us: { ar: "تواصل معنا", en: "Contact Us" },
  send: { ar: "إرسال", en: "Send" },
  subject: { ar: "الموضوع", en: "Subject" },
  message: { ar: "الرسالة", en: "Message" },
  whatsapp: { ar: "واتساب", en: "WhatsApp" },
  back: { ar: "رجوع", en: "Back" },
  categories: { ar: "التصنيفات", en: "Categories" },
  featured_products: { ar: "منتجات مميزة", en: "Featured Products" },
  view_all: { ar: "عرض الكل", en: "View All" },
  why_jabal: { ar: "لماذا جبل؟", en: "Why JABAL?" },
  feat_speed_t: { ar: "سرعة قياسية", en: "Lightning Fast" },
  feat_speed_d: { ar: "اطلب موادك في أقل من 30 ثانية بتدفق Checkout ذكي.", en: "Order materials in under 30 seconds with smart checkout." },
  feat_trust_t: { ar: "موردون موثقون", en: "Verified Suppliers" },
  feat_trust_d: { ar: "كل شركة على المنصة مرت بتحقق Trust Score يدوي وآلي.", en: "Every brand passes manual + automated Trust Score verification." },
  feat_ai_t: { ar: "ذكاء جبل", en: "JABAL Intelligence" },
  feat_ai_d: { ar: "مساعد AI يقدّر كميات مواد البناء ويقترح موردين بناءً على مشروعك.", en: "An AI assistant estimates quantities and suggests suppliers for your project." },
  feat_delivery_t: { ar: "توصيل احترافي", en: "Pro Delivery" },
  feat_delivery_d: { ar: "تتبع شحناتك لحظياً عبر شبكة سائقين متخصصين بمواد البناء.", en: "Track shipments live via a driver network specialized in construction materials." },
  loading: { ar: "جاري التحميل...", en: "Loading..." },
  no_results: { ar: "لا توجد نتائج", en: "No results found" },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
  dir: "rtl" | "ltr";
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("jabal_lang")) as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("jabal_lang", l);
  };

  const t = (key: keyof typeof T) => T[key]?.[lang] ?? String(key);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be inside I18nProvider");
  return ctx;
}
