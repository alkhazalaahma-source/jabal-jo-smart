# Architecture rules
- JABAL AI uses a TanStack HTTP server route and AI SDK UI-message streams; raw streaming responses cannot cross server-function RPC boundaries.
- Keep AI provider helpers and prompts in server-only modules; model credentials and instructions must never enter the browser bundle.
- Store the single JABAL AI conversation as UIMessage records in browser storage, migrating the legacy transcript on hydration; preserve complete history rather than silently truncating it.
- Compose the chat surface with installed AI Elements and existing semantic design tokens; this preserves streaming markdown and consistent controls.