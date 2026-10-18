import { APICallError } from "ai";

export function aiFailure(error: unknown): { status: number; message: string } {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? 502;
    let safeMessage: string | undefined;
    try {
      const body = JSON.parse(error.responseBody ?? "{}") as { message?: string; error?: { message?: string } };
      safeMessage = body.message ?? body.error?.message;
    } catch { /* invalid upstream error body */ }
    const fallback: Record<number, string> = {
      400: "تعذّر معالجة الرسالة. راجع طول المحادثة ومحتواها.",
      401: "اتصال المساعد غير مهيأ. يرجى التواصل مع إدارة جبل.",
      402: "رصيد المساعد غير كافٍ. يلزم أن تعيد إدارة المنصة شحن الرصيد.",
      403: "خدمة المساعد غير مسموحة حالياً. يلزم تدخل إدارة المنصة.",
      404: "نموذج المساعد غير متاح حالياً.",
      429: "المساعد مشغول حالياً. انتظر قليلاً قبل إرسال رسالة جديدة.",
    };
    return { status, message: safeMessage || fallback[status] || "خدمة المساعد غير متاحة مؤقتاً. حاول لاحقاً." };
  }
  if (error instanceof Error && error.name === "AbortError") return { status: 499, message: "تم إيقاف الإجابة." };
  return { status: 502, message: "انقطع الاتصال بالمساعد. حاول لاحقاً." };
}