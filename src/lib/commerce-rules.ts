import { z } from "zod";

export const DELIVERY_FEE = 5;
export const orderInputSchema = z.object({
  request_id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^(?:\+962|00962|0)7[789]\d{7}$/),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(1000).optional().nullable(),
  payment_method: z.enum(["cash", "cliq", "bank_transfer"]),
  discount_code: z.string().trim().max(40).optional().nullable(),
  items: z.array(z.object({ product_id: z.string().uuid(), quantity: z.number().int().min(1).max(9999), expected_price: z.number().nonnegative() })).min(1).max(60),
}).superRefine((input, ctx) => {
  if (new Set(input.items.map((item) => item.product_id)).size !== input.items.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["items"], message: "duplicate_product" });
  }
});

export function availableStock(physical: number | null | undefined, reserved = 0) {
  return Math.max(0, (physical ?? 0) - reserved);
}

export function commerceError(error: unknown, ar: boolean) {
  const message = error instanceof Error ? error.message : String(error);
  const errors: Record<string, [string, string]> = {
    insufficient_stock: ["الكمية المطلوبة لم تعد متوفرة. حدّث السلة وقلّل الكمية.", "The requested quantity is unavailable. Refresh your cart and reduce the quantity."],
    price_changed: ["تغيّر سعر أحد المنتجات. حدّث السلة وراجع الإجمالي قبل التأكيد.", "A product price changed. Refresh your cart and review the total before confirming."],
    product_missing: ["أحد المنتجات لم يعد متاحاً. حدّث السلة قبل المتابعة.", "A product is no longer available. Refresh your cart before continuing."],
    invalid_code: ["كود الخصم غير صالح أو انتهى. أزله وحاول مجدداً.", "The discount code is invalid or expired. Remove it and try again."],
    too_many_orders: ["وصلت للحد المسموح للطلبات خلال الساعة. حاول لاحقاً.", "You reached the hourly order limit. Please try later."],
    not_cancellable: ["لم يعد إلغاء هذا الطلب متاحاً. تواصل مع جبل.", "This order can no longer be cancelled. Contact JABAL."],
    operation_pending: ["انتظر اكتمال تعديل السلة الحالي.", "Wait for the current cart update to finish."],
  };
  for (const [key, translations] of Object.entries(errors)) if (message.includes(key)) return translations[ar ? 0 : 1];
  if (/quantity|stock|unavailable/.test(message)) return errors.insufficient_stock[ar ? 0 : 1];
  return ar ? "لم تُحفظ العملية. تحقق من الاتصال وحاول مجدداً؛ بياناتك ما زالت محفوظة." : "The operation was not saved. Check your connection and retry; your input is preserved.";
}