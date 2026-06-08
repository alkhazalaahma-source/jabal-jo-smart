import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot, User as UserIcon, Copy, Check, RotateCcw } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

const STORAGE_KEY = "jabal_ai_chat_v1";

function AIChat() {
  const { lang, t } = useI18n();
  const chat = useServerFn(chatWithJabalAI);
  const welcome: Msg = { role: "assistant", content: t("ai_welcome") };
  const [messages, setMessages] = useState<Msg[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // restore conversation
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed);
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      // send last 20 messages for context (drop welcome if it's the first system-style msg)
      const history = next.slice(-20).map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await chat({ data: { messages: history } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI error");
    } finally { setLoading(false); }
  };

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(i);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch { toast.error("Copy failed"); }
  };

  const reset = () => {
    setMessages([welcome]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const suggestions = lang === "ar"
    ? ["كم طن إسمنت أحتاج لبيت 200م²؟", "أفضل حي للسكن في عمّان بميزانية 80 ألف", "ما الفرق بين إسمنت Lafarge و Manaseer؟", "احسب تكلفة تشطيب فيلا 300م²", "نصائح لاختيار سيارة مستعملة في الأردن", "كيف أحسب ضريبة الدخل الأردنية؟"]
    : ["Cement needed for a 200m² house?", "Best Amman neighborhood under 80k JOD?", "Lafarge vs Manaseer cement?", "Cost to finish a 300m² villa", "Tips for buying used cars in Jordan", "How to calculate Jordanian income tax?"];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl animate-fade-in">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            <Sparkles className="h-4 w-4" /> JABAL AI
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("nav_ai")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "ar" ? "مساعد ذكي شامل — يجيب عن أي سؤال بخبرة عميقة بالسوق الأردني" : "Smart assistant with deep Jordanian market expertise"}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-card flex flex-col h-[72vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
            <div className="text-xs text-muted-foreground">{messages.length - 1} {lang === "ar" ? "رسالة" : "messages"}</div>
            <Button variant="ghost" size="sm" onClick={reset} className="text-xs h-7">
              <RotateCcw className="h-3.5 w-3.5 me-1" /> {lang === "ar" ? "محادثة جديدة" : "New chat"}
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 animate-fade-in-up ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary" : "bg-accent"}`}>
                  {m.role === "user" ? <UserIcon className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4 text-accent-foreground" />}
                </div>
                <div className={`group relative px-4 py-2.5 rounded-2xl max-w-[85%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.role === "assistant" ? (
                    <div className="prose-chat text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                  )}
                  {m.role === "assistant" && i > 0 && (
                    <button
                      onClick={() => copy(m.content, i)}
                      className="absolute -bottom-2 end-2 opacity-0 group-hover:opacity-100 transition bg-card border border-border rounded-md p-1 shadow-card"
                      aria-label="copy"
                    >
                      {copiedIdx === i ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <Bot className="h-4 w-4 text-accent-foreground animate-pulse-soft" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-soft" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-soft delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-soft delay-300" />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs bg-muted hover:bg-accent/10 hover:text-accent hover:border-accent/30 px-3 py-1.5 rounded-full border border-border transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border p-3 flex gap-2 bg-card">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={t("ai_input")}
              rows={1}
              className="resize-none min-h-10 max-h-32 bg-muted/40 border-border focus-visible:ring-1 focus-visible:ring-accent"
            />
            <Button onClick={send} disabled={loading || !input.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-3">
          {lang === "ar" ? "قد يخطئ الذكاء الاصطناعي — راجع المعلومات الحساسة مع مختص." : "AI can make mistakes — verify sensitive info with a specialist."}
        </p>
      </div>
    </Layout>
  );
}
