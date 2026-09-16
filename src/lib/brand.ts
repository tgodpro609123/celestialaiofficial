import {
  Bot,
  Braces,
  FileText,
  FolderKanban,
  Gamepad2,
  ImageIcon,
  MessagesSquare,
  Mic,
  Telescope,
  type LucideIcon,
} from "lucide-react";

export const BRAND = {
  company: "ALL-IN-1",
  product: "ALL-IN-1 AI",
  slogan: "LIMITLESS. LEGENDARY.",
  subSlogan: "ONE AI. EVERYTHING.",
  supportEmail: "support@all-in-1.ai",
  description:
    "One free AI workspace for chat, images, code, games, files, research, voice and autonomous agents. No credits, no tokens, no paywalls.",
};

export type ToolKey =
  | "chat"
  | "image"
  | "code"
  | "game"
  | "files"
  | "research"
  | "voice"
  | "agents"
  | "projects";

export type Tool = {
  key: ToolKey;
  name: string;
  tagline: string;
  description: string;
  to: string;
  icon: LucideIcon;
  bullets: string[];
};

export const TOOLS: Tool[] = [
  {
    key: "chat",
    name: "AI Chat",
    tagline: "Think out loud, get answers",
    description:
      "A fast conversational assistant with rich markdown, highlighted code blocks and full searchable history.",
    to: "/app/chat",
    icon: MessagesSquare,
    bullets: ["Markdown + code blocks", "History by day", "Rename, search, delete"],
  },
  {
    key: "image",
    name: "Image AI",
    tagline: "Picture anything",
    description:
      "Describe an image, pick a ratio and style preset, then download it or drop it into a project.",
    to: "/app/image",
    icon: ImageIcon,
    bullets: ["Style presets", "Aspect ratios", "Gallery + download"],
  },
  {
    key: "code",
    name: "Code AI",
    tagline: "Write, explain, repair",
    description:
      "Generate, explain, debug, fix and optimise code across Lua, JavaScript, TypeScript, Python, HTML/CSS, C++ and SQL.",
    to: "/app/code",
    icon: Braces,
    bullets: ["7+ languages", "Explain & debug", "Luau / Roblox ready"],
  },
  {
    key: "game",
    name: "Game AI",
    tagline: "Build worlds faster",
    description:
      "Turn an idea into mechanics, gameplay loops, economy design and ready-to-paste Lua scripts.",
    to: "/app/game",
    icon: Gamepad2,
    bullets: ["Simulator, Obby, RPG", "Tycoon & Survival", "Economy design"],
  },
  {
    key: "files",
    name: "File AI",
    tagline: "Ask your documents",
    description:
      "Upload PDFs, docs, spreadsheets and images, then get summaries and answers grounded in the content.",
    to: "/app/files",
    icon: FileText,
    bullets: ["PDF, TXT, DOCX, CSV", "Instant summaries", "Document Q&A"],
  },
  {
    key: "research",
    name: "Research AI",
    tagline: "Findings you can trust",
    description:
      "Deep-dive a topic and get structured findings with cited sources plus a place for your own notes.",
    to: "/app/research",
    icon: Telescope,
    bullets: ["Structured findings", "Cited sources", "Personal notes"],
  },
  {
    key: "voice",
    name: "Voice AI",
    tagline: "Talk, listen, continue",
    description:
      "Speak your prompt, watch the live visualiser, and hear replies read back to you naturally.",
    to: "/app/voice",
    icon: Mic,
    bullets: ["Speech to text", "Text to speech", "Hands-free flow"],
  },
  {
    key: "agents",
    name: "AI Agents",
    tagline: "Delegate the whole task",
    description:
      "Give a goal and watch it move through researching, planning, creating and reviewing to a finished result.",
    to: "/app/agents",
    icon: Bot,
    bullets: ["Multi-step plans", "Live pipeline", "Saved results"],
  },
  {
    key: "projects",
    name: "Projects",
    tagline: "Everything in one place",
    description:
      "Bundle chats, scripts, files, images and notes into a workspace per idea, client or game.",
    to: "/app/projects",
    icon: FolderKanban,
    bullets: ["Unified workspace", "Cross-tool bundles", "Notes included"],
  },
];

export const ECOSYSTEM = [
  {
    name: "ALL-IN-1 Studios",
    blurb:
      "Our in-house creative lab shipping games, tools and experiments built entirely on ALL-IN-1 AI.",
    tag: "Creative lab",
  },
  {
    name: "Nexora Market",
    blurb:
      "A marketplace of community assets, prompt packs, scripts and templates you can drop into any project.",
    tag: "Marketplace",
  },
  {
    name: "ALL-IN-1 Community",
    blurb:
      "Builders, students and studios sharing workflows, showcases and support around the clock.",
    tag: "Community",
  },
];

export const FAQ = [
  {
    q: "Is ALL-IN-1 AI really free?",
    a: "Yes. Every tool is free for everyone. There are no credits, no tokens, no subscriptions and no paywalls anywhere in the product.",
  },
  {
    q: "If there is no payment, what are the limits?",
    a: "Only fair-use limits. Each account gets a generous rolling allowance per tool so a small number of heavy users can't slow the platform down for everyone else. If you hit it, you simply wait a moment and continue.",
  },
  {
    q: "Do I need an account?",
    a: "You can browse this page freely. An account is needed to use the tools so your chats, files, images and projects stay private to you.",
  },
  {
    q: "Which languages does Code AI support?",
    a: "Lua and Luau, JavaScript, TypeScript, Python, HTML/CSS, C++ and SQL, with dedicated Roblox game development support.",
  },
  {
    q: "Who can see my data?",
    a: "Only you. Every chat, file, image, project and note is locked to your account at the database level. You can delete anything at any time.",
  },
  {
    q: "What can AI Agents actually do?",
    a: "You give a goal in plain language. The agent researches, plans, creates and reviews, showing each stage as it goes, then hands you the finished output.",
  },
];
