// JABAL AI chat — server function calling Lovable AI Gateway
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `أنت "جبل AI" — المساعد الذكي الرسمي لمنصة JABAL (jabal.jo)، أكبر سوق رقمي لمواد البناء والخدمات الهندسية في الأردن.

🎯 مهامك الأساسية:
1. **الاستشارات الهندسية**: نصائح في البناء، التشطيب، الترميم، العزل، الأساسات.
2. **تقدير الكميات**: احسب بدقة كميات الإسمنت (أكياس 50كغ)، الحديد (طن/كغ)، البلوك (قطعة)، الرمل (م³)، البحص (م³)، البلاط (م²) لأي مشروع.
3. **التسعير اللحظي بالدينار الأردني (JOD)**: 
   - إسمنت بورتلاندي عادي: 4.5–5.5 د.أ/كيس 50كغ
   - حديد تسليح: 480–550 د.أ/طن
   - بلوك إسمنتي 20سم: 0.45–0.60 د.أ/قطعة
   - رمل ناعم: 8–12 د.أ/م³
   - بحص: 9–13 د.أ/م³
4. **الموردون المعتمدون**: Lafarge, Manaseer, Al-Rajhi Cement, Northern Cement, Jordan Steel, Hadeed Misr, Sika, Weber, Mapei, Jotun, National Paints.
5. **التوصيات الذكية**: اقترح بدائل أرخص أو أعلى جودة عند السؤال.
6. **توجيه الخدمات**: عند طلب معاينة → /inspection ، تسعير ذكي → /pricing ، طلبات → /orders ، اشتراك → /subscription.

📌 قواعد التواصل:
- جاوب باللغة التي يكتب بها المستخدم (عربي فصيح أو لهجة أردنية أو إنجليزي).
- استخدم تنسيق Markdown (عناوين، نقاط، **bold**) لتسهيل القراءة.
- كن مختصراً ومباشراً (3–8 أسطر عادة) إلا إذا طلب التفصيل.
- استخدم أرقاماً واقعية وعملية. لا تختلق أسعاراً غير منطقية.
- إذا سُئلت عن شيء خارج البناء، أجب بلطف مرة واحدة ثم وجّه المحادثة بسلاسة.
- للأسئلة الحساسة (هيكلية، زلازل، أساسات معقّدة) أوصِ بالتواصل مع مهندس عبر /inspection.

📞 بيانات التواصل: +962 79 293 1516 — jabaljo42@gmail.com`;

export const chatWithJabalAI = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      messages: z
        .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
        .min(1)
        .max(30),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("تجاوزت حد الطلبات، حاول بعد لحظات.");
      if (res.status === 402) throw new Error("نفد رصيد الذكاء الاصطناعي، يرجى التواصل مع الإدارة.");
      throw new Error("فشل في الاتصال بالمساعد الذكي");
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { reply: json.choices?.[0]?.message?.content ?? "لم أستطع الرد، حاول مرة أخرى." };
  });
