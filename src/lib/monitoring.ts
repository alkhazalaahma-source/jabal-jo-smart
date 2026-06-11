/**
 * Client-side error + performance monitoring.
 * Captures: window errors, unhandled rejections, Web Vitals (LCP/INP/CLS/TTFB),
 * and slow fetches. Sends structured reports to the server via a server fn,
 * which surfaces them in Server Logs for crash analysis.
 */
import { reportClientEvent, type ReportPayload } from "./monitoring.functions";

let initialized = false;
const recentKeys = new Map<string, number>();
const DEDUP_MS = 10_000;

function shouldSend(key: string) {
  const now = Date.now();
  const last = recentKeys.get(key) ?? 0;
  if (now - last < DEDUP_MS) return false;
  recentKeys.set(key, now);
  return true;
}

function send(payload: ReportPayload) {
  try {
    const enriched: ReportPayload = {
      ...payload,
      url: payload.url ?? (typeof location !== "undefined" ? location.href : undefined),
      ua: payload.ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
      ts: Date.now(),
    };
    void reportClientEvent({ data: enriched }).catch(() => {
      /* silent — never let monitoring break the app */
    });
  } catch {
    /* ignore */
  }
}

export function reportError(error: unknown, extra?: Record<string, unknown>) {
  const err = error instanceof Error ? error : new Error(String(error));
  const key = `${err.name}:${err.message}`;
  if (!shouldSend(key)) return;
  send({
    kind: "error",
    message: `${err.name}: ${err.message}`,
    stack: err.stack,
    extra,
  });
}

export function reportMetric(metric: string, value: number, extra?: Record<string, unknown>) {
  send({ kind: "perf", metric, value, extra });
}

export function initMonitoring() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  window.addEventListener("error", (e) => {
    reportError(e.error ?? new Error(e.message), {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    reportError(e.reason ?? new Error("unhandledrejection"), { kind: "promise" });
  });

  // Web Vitals via PerformanceObserver (no external dependency)
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        reportMetric("LCP", Math.round(entry.startTime));
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch { /* not supported */ }

  try {
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!e.hadRecentInput && typeof e.value === "number") cls += e.value;
      }
      reportMetric("CLS", Math.round(cls * 1000) / 1000);
    }).observe({ type: "layout-shift", buffered: true });
  } catch { /* not supported */ }

  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[]) {
        const e = entry as PerformanceEntry & { processingStart?: number; duration: number };
        const inp = e.duration;
        if (inp > 200) reportMetric("INP_slow", Math.round(inp));
      }
    }).observe({ type: "event", buffered: true, durationThreshold: 200 } as PerformanceObserverInit);
  } catch { /* not supported */ }

  // TTFB
  try {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav) reportMetric("TTFB", Math.round(nav.responseStart));
  } catch { /* ignore */ }

  // Slow fetch wrapper
  const origFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const start = performance.now();
    const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
    try {
      const res = await origFetch(...args);
      const dur = performance.now() - start;
      if (dur > 1500) reportMetric("slow_fetch", Math.round(dur), { url, status: res.status });
      if (!res.ok && res.status >= 500) {
        reportError(new Error(`fetch_${res.status}`), { url });
      }
      return res;
    } catch (err) {
      reportError(err, { url, kind: "fetch_failed" });
      throw err;
    }
  };
}
