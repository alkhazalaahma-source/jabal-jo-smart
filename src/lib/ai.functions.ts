// JABAL AI chat — server function calling Lovable AI Gateway
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM_PROMPT = `أنت "جبل AI" — مساعد ذكي لمنصة JABAL، أكبر سوق رقمي لمواد البناء والخدمات الهندسية في الأردن.
مهمتك:
- ترحب بالعملاء وتجيب عن أي سؤال بود واحترافية (حتى لو قالوا فقط "السلام عليكم").
- تساعد بتقدير كميات مواد البناء (إسمنت، حديد، بلوك، رمل، بحص) لأي مشروع.
- تقترح موردين وشركات (Lafarge, Manaseer, Jordan Steel, Sika, Weber, Mapei).
- تحسب التكاليف التقديرية بالدينار الأردني.
- تنصح بأفضل الممارسات الهندسية.
- إذا سُئلت عن شيء خارج البناء، أجب بلطف باختصار ثم وجّه المحادثة لاهتمامات JABAL.

أجب دائماً باللغة التي يكتب بها المستخدم (عربية أو إنجليزية). كن مختصراً، عملياً، وودوداً.`;

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
