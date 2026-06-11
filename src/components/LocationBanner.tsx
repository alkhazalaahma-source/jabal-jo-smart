import { MapPin, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useI18n } from "@/lib/i18n";

export function LocationBanner() {
  const { lang } = useI18n();
  const { status, coords, request } = useGeolocation(true);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (status === "granted" && coords) {
    return (
      <div className="container mx-auto px-4">
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2 text-sm text-foreground animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span className="truncate text-muted-foreground">
              {lang === "ar" ? "تم تفعيل الموقع — سنعرض أقرب الموردين" : "Location enabled — showing nearest suppliers"}
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            aria-label="dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (status === "denied" || status === "unavailable") return null;

  return (
    <div className="container mx-auto px-4">
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm animate-fade-in">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-accent shrink-0" />
          <span className="text-muted-foreground">
            {lang === "ar"
              ? "فعّل موقعك لعرض أقرب الموردين والعروض في منطقتك"
              : "Enable your location to see the nearest suppliers and offers"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={request}
            disabled={status === "loading"}
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-8"
          >
            {status === "loading"
              ? lang === "ar"
                ? "جارٍ التحديد..."
                : "Locating..."
              : lang === "ar"
                ? "تفعيل الموقع"
                : "Enable location"}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
