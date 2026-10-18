import { createFileRoute } from "@tanstack/react-router";
import { handleJabalChat } from "@/lib/ai/chat.server";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleJabalChat(request) } },
});