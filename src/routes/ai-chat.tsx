import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User as UserIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { chatWithJabalAI } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-chat")({
  head: () => ({ meta: [{ title: "جبل AI — Smart Construction Assistant" }] }),
  component: AIChat,
});

type Msg = { role: "user" | "assistant"; content: string };

function AIChat() {
  const { lang, t } = useI18n();
  const chat = useServerFn(chatWithJabalAI);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: t("ai_welcome") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const { reply } = await chat({ data: { messages: next.map((m) => ({ role: m.role, content: m.content })) } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI error");
    } finally { setLoading(false); }
  };

  const suggestions = lang === "ar"
    ? ["كم طن إسمنت أحتاج لبيت 200م²؟", "اقترح أفضل مورد حديد في عمّان", "ما الفرق بين إسمنت Lafarge و Manaseer؟", "نصائح لعزل السطح ضد الحرارة", "احسب تكلفة تشطيب فيلا 300م²", "أنواع البلوك وأسعارها"]
    : ["Cement needed for a 200m² house?", "Best steel supplier in Amman?", "Lafarge vs Manaseer cement?", "Heat insulation tips", "Cost to finish a 300m² villa", "Block types & prices"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-grad text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold mb-3">
            <Sparkles className="h-4 w-4" /> JABAL AI
          </div>
          <h1 className="text-3xl font-black">{t("nav_ai")}</h1>
        </div>

        <div className="bg-card border rounded-2xl shadow-elegant flex flex-col h-[70vh]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary" : "bg-orange-grad"}`}>
                  {m.role === "user" ? <UserIcon className="h-5 w-5 text-primary-foreground" /> : <Bot className="h-5 w-5 text-accent-foreground" />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-grad flex items-center justify-center"><Bot className="h-5 w-5 text-accent-foreground animate-pulse" /></div>
                <div className="px-4 py-3 rounded-2xl bg-muted text-sm text-muted-foreground">{t("ai_thinking")}</div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-muted hover:bg-accent/10 hover:text-accent px-3 py-1.5 rounded-full border transition">{s}</button>
              ))}
            </div>
          )}

          <div className="border-t p-3 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={t("ai_input")}
              rows={1}
              className="resize-none min-h-10 max-h-32"
            />
            <Button onClick={send} disabled={loading || !input.trim()} className="bg-orange-grad text-accent-foreground hover:opacity-90 shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
