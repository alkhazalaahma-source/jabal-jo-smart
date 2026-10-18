import { convertToModelMessages, streamText, validateUIMessages } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, withLovableAiGatewayRunIdHeader } from "./gateway-helpers.server.ts";
import { jabalSystemPrompt } from "./prompt.server";
import { aiFailure } from "./errors";

const requestSchema = z.object({ messages: z.array(z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.object({ type: z.enum(["text", "reasoning"]), text: z.string() })),
})) });

export async function handleJabalChat(request: Request): Promise<Response> {
  let messages;
  try {
    const body = await request.text();
    if (body.length > 300_000) return Response.json({ message: "المحادثة طويلة جداً؛ ابدأ محادثة جديدة أو اختصر الرسالة." }, { status: 413 });
    const input = requestSchema.parse(JSON.parse(body));
    if (!input.messages.length || input.messages.at(-1)?.role !== "user") {
      return Response.json({ message: "أرسل سؤالاً لبدء الإجابة." }, { status: 400 });
    }
    messages = await validateUIMessages({ messages: input.messages });
  } catch {
    return Response.json({ message: "بيانات المحادثة غير صالحة." }, { status: 400 });
  }
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return Response.json({ message: "اتصال المساعد غير مهيأ. يرجى التواصل مع إدارة جبل." }, { status: 401 });

  const gateway = createLovableAiGatewayProvider(apiKey, undefined, { baseURL: "https://ai.gateway.lovable.dev/v1" });
  const result = streamText({
    model: gateway("google/gemini-2.5-pro"),
    system: jabalSystemPrompt(),
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    maxRetries: 0,
  });

  // Observe the first upstream content/error before committing HTTP status, without buffering the answer.
  const probe = result.fullStream[Symbol.asyncIterator]();
  try {
    while (true) {
      const next = await probe.next();
      if (next.done) break;
      if (next.value.type === "error") {
        const failure = aiFailure(next.value.error);
        return Response.json({ message: failure.message }, { status: failure.status });
      }
      if (next.value.type === "text-start" || next.value.type === "reasoning-start") break;
      if (next.value.type === "abort") return new Response(null, { status: 499 });
    }
    return withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (error) => aiFailure(error).message,
      // Browser-owned history is saved by useChat's onFinish after the completed UI stream arrives.
      onFinish: () => {},
      headers: { "Cache-Control": "no-store, no-transform" },
    }), gateway);
  } catch (error) {
    const failure = aiFailure(error);
    return Response.json({ message: failure.message }, { status: failure.status });
  } finally {
    void probe.return?.();
  }
}