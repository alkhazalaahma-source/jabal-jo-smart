import { createServerFn } from "@tanstack/react-start";

export type ReportPayload = {
  kind: "error" | "perf" | "event";
  message?: string;
  stack?: string;
  url?: string;
  ua?: string;
  metric?: string;
  value?: number;
  extra?: Record<string, unknown>;
  ts?: number;
};

export const reportClientEvent = createServerFn({ method: "POST" })
  .inputValidator((input: ReportPayload) => input)
  .handler(async ({ data }) => {
    const tag = `[client/${data.kind}]`;
    if (data.kind === "error") {
      console.error(tag, data.message, {
        url: data.url,
        ua: data.ua,
        stack: data.stack,
        extra: data.extra,
      });
    } else {
      console.log(tag, data.metric ?? data.message, {
        value: data.value,
        url: data.url,
        extra: data.extra,
      });
    }
    return { ok: true as const };
  });
