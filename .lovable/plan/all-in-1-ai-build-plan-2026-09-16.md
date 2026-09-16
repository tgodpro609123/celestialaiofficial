# ALL-IN-1 AI — Build Plan

**LIMITLESS. LEGENDARY. / ONE AI. EVERYTHING.**
A free-for-everyone AI super-app: dark galaxy aesthetic, one account, every tool.

This is a very large build, so it ships in phases. Each phase leaves the app working and usable.

---

## Phase 1 — Brand, landing page, foundation
- Dark-first galaxy visual system: deep space background, subtle drifting particles, nebula gradients, glassmorphic cards, futuristic display font + clean body font. Fully responsive.
- Landing page: hero with product preview, "Free forever — no credits, no tokens, no paywalls" badge, feature breakdown for the 9 tools (Chat, Image, Code, Game, Files, Research, Voice, Agents, Projects), Ecosystem section (ALL-IN-1 Studios, Nexora Market, ALL-IN-1 Community), FAQ, footer.
- Legal pages: Terms, Privacy.

## Phase 2 — Accounts and roles
- Turn on Lovable Cloud (database + accounts + storage + server code).
- Sign up (username, display name, email, password), login, password reset, sign out.
- Profiles with avatar/display name; protected app area; separate admin area at `/admin` visible only to admins.

## Phase 3 — App shell
- Left sidebar navigation with collapsible mobile drawer.
- Search modal (Cmd+K / Cmd+/), notifications center, profile menu, quick-action launcher.

## Phase 4 — Chat, Image, Code, Game
- **AI Chat**: streaming replies, markdown, code blocks with syntax highlighting + copy, prompt suggestions, history grouped Today / Yesterday / 7 Days / Older, rename, delete, search.
- **Image AI**: prompt, aspect ratios, style presets, gallery grid, full-size preview, download, add to project.
- **Code AI**: editor/viewer for Lua, JS, TS, Python, HTML/CSS, C++, SQL; Generate, Explain, Debug, Fix, Optimize; Luau/Roblox support.
- **Game AI**: templates (Roblox Simulator, Obby, RPG, Tycoon, Survival) producing mechanics, gameplay loop, Lua scripts, economy design.

## Phase 5 — Files, Research, Voice, Agents, Projects
- **File AI**: upload PDF/TXT/DOCX/CSV/images, viewer, processing status, Q&A and summaries.
- **Research AI**: query input, structured findings, cited sources, notes.
- **Voice AI**: recording state with audio visualizer, speech-to-text, text-to-speech playback, back-and-forth voice conversation.
- **AI Agents**: multi-step planner/executor with visual pipeline (Researching → Planning → Creating → Reviewing → Complete).
- **Projects**: bundle chats, scripts, files, images, notes.
- **File Library**: storage manager with metadata, status, download, delete.

## Phase 6 — Settings, help, admin
- Settings: theme (dark default), chat preferences, AI memory controls, account, privacy, accessibility (reduced motion, font scaling).
- Help Center, support ticket form, report modal.
- Admin dashboard: platform metrics (users, chats, generations, tasks), user management, ticket workflow, report resolution.

---

## Free-for-everyone policy
No credits, tokens, subscriptions, or paywalls anywhere in the product or copy. Abuse protection is fair-use rate limiting only, applied per account on the server: a rolling per-minute and per-day request allowance per tool, with a friendly "slow down for a moment" message rather than an upsell.

## Technical notes
- TanStack Start + React + Tailwind; Lovable Cloud (Supabase) for auth, database, storage.
- Tables: `profiles`, `conversations`, `messages`, `projects`, `files`, `generated_images`, `research_sessions`, `agent_tasks`, `support_tickets`, `reports`, plus a separate `user_roles` table for admin rights (never a role column on profiles). Row-level security on every table: users reach only their own rows; admins reach moderation tables through a security-definer role check.
- All AI calls run server-side through Lovable AI, behind one modular AI router module (`src/lib/ai/`) with per-capability handlers (chat, image, code, research, voice, agents) so extra providers can be added later without touching UI code.
- Rate limiting enforced in the server layer, keyed by user id and capability.
- Every page gets its own title/description/social metadata.

## What I need from you eventually
- Real support contact email and company details for Terms/Privacy (placeholders used until then).
- Links for ALL-IN-1 Studios, Nexora Market, and the Community (placeholders until then).
