import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function ProductReviews({ productId }: { productId: string }) {
  const { lang } = useI18n();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = () =>
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data ?? []) as Review[]));

  useEffect(() => { load(); }, [productId]);

  const submit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "سجّل الدخول لإضافة تقييم" : "Sign in to add a review");
      return;
    }
    if (rating < 1) return;
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId, user_id: user.id, rating, comment: comment || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(lang === "ar" ? "شكراً على تقييمك!" : "Thanks for your review!");
      setComment(""); setRating(5); load();
    }
  };

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black">{lang === "ar" ? "تقييمات العملاء" : "Customer Reviews"}</h2>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className={`h-5 w-5 ${i <= Math.round(avg) ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            ))}
          </div>
          <span className="font-bold">{avg.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviews.length})</span>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4 mb-6">
        <div className="font-semibold mb-2">{lang === "ar" ? "أضف تقييمك" : "Add your review"}</div>
        <div className="flex gap-1 mb-3">
          {[1,2,3,4,5].map((i) => (
            <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)}>
              <Star className={`h-7 w-7 transition ${i <= (hover || rating) ? "fill-warning text-warning" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={lang === "ar" ? "شاركنا تجربتك مع هذا المنتج..." : "Share your experience with this product..."}
          rows={3}
        />
        <Button onClick={submit} disabled={saving} className="mt-3 bg-orange-grad text-accent-foreground">
          {saving ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : (lang === "ar" ? "نشر التقييم" : "Submit review")}
        </Button>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {lang === "ar" ? "لا توجد تقييمات بعد. كن أول من يقيّم!" : "No reviews yet. Be the first!"}
          </div>
        ) : reviews.map((r) => (
          <div key={r.id} className="bg-muted/30 border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`h-4 w-4 ${i <= r.rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar-JO" : "en-US")}</span>
            </div>
            {r.comment && <p className="text-sm leading-relaxed">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
