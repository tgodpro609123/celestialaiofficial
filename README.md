# Celestial AI Suite

Build the complete production-ready web application for ALL-IN-1 AI (company: ALL-IN-1, slogans: "LIMITLESS. LEGENDARY." and "ONE AI. EVERYTHING."). 

Key specifications:
1. Brand & Aesthetic: Dark-first, galaxy-inspired futuristic atmosphere with subtle space particles/gradients, glassmorphic cards, modern typography, responsive for desktop, tablet, and mobile. Strictly FREE for everyone with zero credits, tokens, subscriptions, or paywalls (only fair-use rate limiting).
2. Public Landing Page: Hero section with preview, feature breakdowns (Chat, Image, Code, Game, Files, Research, Voice, Agents, Projects), Ecosystem section (ALL-IN-1 Studios, Nexora Market, ALL-IN-1 Community), FAQ, and footer with Legal (Terms, Privacy).
3. Authentication & RBAC: Supabase auth integration with Sign Up (username, display name, email, password), Login, Password Reset, and protected routes. Role-based access control with an isolated Admin Dashboard (/admin).
4. Application Dashboard & Navigation: Left sidebar with collapsible mobile drawer, search modal (Cmd+K / Cmd+/), notifications center, user profile menu, and quick action launcher.
5. Core Tool Modules:
   - AI Chat: Streaming-ready chat interface with markdown, code blocks with syntax highlighting & copy, prompt suggestions, conversation history grouped by Today/Yesterday/7 Days/Older, conversation rename/delete/search.
   - Image AI: Prompt input, aspect ratios, style presets, gallery grid with preview, full-size modal, download, and add to project.
   - Code AI: Multi-language editor/viewer (Lua, JS, TS, Python, HTML/CSS, C++, SQL), actions for Generate, Explain, Debug, Fix, Optimize, and Luau/Roblox game dev support.
   - Game AI: Specialized game builder mode with templates (Roblox Simulator, Obby, RPG, Tycoon, Survival) generating mechanics, gameplay loops, Lua scripts, and economy design.
   - File AI: Upload hub (PDF, TXT, DOCX, CSV, images), document viewer, processing status, and document Q&A/summary.
   - Research AI: Web research mode with query input, structured findings, verified source citations, and notes.
   - Voice AI: Audio visualizer, speech-to-text recording state, text-to-speech player, conversation flow.
   - AI Agents: Multi-step task planner and executor with visual progress pipeline (Researching -> Planning -> Creating -> Reviewing -> Complete).
   - Projects Workspace: Create and manage projects bundling chats, scripts, files, images, and notes.
   - Personal File Library: Storage manager with file metadata, status, download, and delete.
   - Settings: Theme toggles (Dark default), chat preferences, AI memory controls, account management, privacy options, accessibility controls (reduced motion, font scaling).
   - Help & Report System: Help Center knowledge base, Contact Support ticket form, and issue/content reporting modal.
   - Admin Dashboard: Platform metrics (users, chats, generations, tasks), user management, support ticket workflow, and report resolution.
6. Backend & Database: Configure complete Supabase schema (profiles, conversations, messages, projects, files, generated_images, research_sessions, agent_tasks, support_tickets, reports, admin_users) with RLS security policies. Include a modular server-side AI router architecture prepared for multi-provider expansion.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://celestialaiofficial.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d3247316-59e6-4dac-b8d5-562f742c19f1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitLab and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
