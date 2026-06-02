// Catalog of project types users can build via "ابنِ مشروعك"
export type ProjectTypeDef = {
  value: string;
  ar: string;
  en: string;
  icon: string;
  // Base price per m² (JOD) at "standard" finish — used in instant estimator
  ratePerM2: number;
};

export const PROJECT_TYPES: ProjectTypeDef[] = [
  { value: "residential", ar: "منزل سكني", en: "Residential house", icon: "🏠", ratePerM2: 320 },
  { value: "villa", ar: "فيلا فاخرة", en: "Luxury villa", icon: "🏡", ratePerM2: 480 },
  { value: "building", ar: "عمارة سكنية", en: "Residential building", icon: "🏢", ratePerM2: 280 },
  { value: "apartment", ar: "شقة سكنية", en: "Apartment", icon: "🏬", ratePerM2: 260 },
  { value: "commercial", ar: "محل تجاري", en: "Commercial shop", icon: "🏪", ratePerM2: 220 },
  { value: "office", ar: "مكتب / إداري", en: "Office", icon: "🏛️", ratePerM2: 240 },
  { value: "warehouse", ar: "مستودع / مخزن", en: "Warehouse", icon: "🏭", ratePerM2: 170 },
  { value: "factory", ar: "مصنع", en: "Factory", icon: "⚙️", ratePerM2: 200 },
  { value: "restaurant", ar: "مطعم / كافيه", en: "Restaurant / Café", icon: "🍽️", ratePerM2: 350 },
  { value: "hotel", ar: "فندق / شقق فندقية", en: "Hotel", icon: "🏨", ratePerM2: 520 },
  { value: "school", ar: "مدرسة / حضانة", en: "School / Nursery", icon: "🏫", ratePerM2: 300 },
  { value: "mosque", ar: "مسجد", en: "Mosque", icon: "🕌", ratePerM2: 290 },
  { value: "clinic", ar: "عيادة / مركز طبي", en: "Clinic", icon: "🏥", ratePerM2: 360 },
  { value: "farm", ar: "مزرعة / استراحة", en: "Farm / Chalet", icon: "🌾", ratePerM2: 230 },
  { value: "pool", ar: "بركة سباحة", en: "Swimming pool", icon: "🏊", ratePerM2: 410 },
  { value: "landscape", ar: "حدائق وتنسيق", en: "Landscaping", icon: "🌳", ratePerM2: 95 },
  { value: "fence", ar: "سور / تسوير أرض", en: "Fencing", icon: "🧱", ratePerM2: 65 },
  { value: "demolition", ar: "هدم وإزالة", en: "Demolition", icon: "🔨", ratePerM2: 35 },
  { value: "water_tank", ar: "خزان مياه أرضي", en: "Water tank", icon: "💧", ratePerM2: 180 },
  { value: "solar", ar: "نظام طاقة شمسية", en: "Solar system", icon: "☀️", ratePerM2: 140 },
  { value: "kitchen", ar: "تجديد مطبخ", en: "Kitchen renovation", icon: "🍳", ratePerM2: 260 },
  { value: "bathroom", ar: "تجديد حمامات", en: "Bathroom renovation", icon: "🚿", ratePerM2: 240 },
  { value: "finishing", ar: "تشطيب كامل", en: "Full finishing", icon: "🎨", ratePerM2: 180 },
  { value: "renovation", ar: "ترميم وصيانة", en: "Renovation & Repair", icon: "🔧", ratePerM2: 130 },
  { value: "interior", ar: "تصميم داخلي", en: "Interior design", icon: "🛋️", ratePerM2: 150 },
  { value: "roof", ar: "أعمال أسطح / عزل", en: "Roofing & Insulation", icon: "🏗️", ratePerM2: 85 },
  { value: "other", ar: "مشروع آخر", en: "Other project", icon: "✨", ratePerM2: 250 },
];

// Multiplier applied based on finish level
export const FINISH_MULTIPLIER: Record<string, number> = {
  economy: 0.75,
  standard: 1,
  deluxe: 1.35,
  luxury: 1.8,
};

export function estimateCost(
  projectType: string,
  areaM2: number,
  floors: number,
  finishLevel: string,
): number {
  const def = PROJECT_TYPES.find((p) => p.value === projectType) ?? PROJECT_TYPES[PROJECT_TYPES.length - 1];
  const mult = FINISH_MULTIPLIER[finishLevel] ?? 1;
  const base = def.ratePerM2 * Math.max(areaM2, 0) * Math.max(floors, 1);
  return Math.round(base * mult);
}

export function getProjectTypeLabel(value: string, lang: "ar" | "en"): string {
  const def = PROJECT_TYPES.find((p) => p.value === value);
  if (!def) return value;
  return lang === "ar" ? def.ar : def.en;
}
