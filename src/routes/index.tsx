import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Infinity as InfinityIcon, ShieldCheck, Sparkle, Zap } from "lucide-react";
import { StarField } from "@/components/site/StarField";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND, ECOSYSTEM, FAQ, TOOLS } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALL-IN-1 AI — LIMITLESS. LEGENDARY. One AI. Everything." },
      {
        name: "description",
        content:
          "Chat, images, code, games, documents, research, voice and autonomous agents in one free AI workspace. No credits, no tokens, no subscriptions.",
      },
      { property: "og:title", content: "ALL-IN-1 AI — One AI. Everything." },
      {
        property: "og:description",
        content:
          "Nine AI tools, one free workspace. Chat, images, code, games, files, research, voice and agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="galaxy-backdrop min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <StarField density={90} />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="glass-panel gap-2 rounded-full px-4 py-1.5 text-xs tracking-wide"
            >
              <InfinityIcon className="size-3.5 text-accent" />
              Free for everyone — no credits, no tokens, no paywalls
            </Badge>

            <h1 className="mt-7 font-display text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              <span className="text-gradient">LIMITLESS.</span>{" "}
              <span className="text-gradient">LEGENDARY.</span>
            </h1>
            <p className="mt-5 text-lg font-medium tracking-[0.2em] text-muted-foreground sm:text-xl">
              ONE AI. EVERYTHING.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {BRAND.description}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Start free — no card, ever
                  <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <a href="#tools">Explore the tools</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["Zero subscriptions", "Private by default", "9 tools, 1 account"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check className="size-3.5 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Workspace preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="glass-panel glow-ring overflow-hidden rounded-2xl">
              <div className="flex items-center gap-2 border-b border-glass-border px-4 py-3">
                <span className="size-2.5 rounded-full bg-destructive/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground">
                  ALL-IN-1 AI · workspace preview
                </span>
              </div>
              <div className="grid gap-0 md:grid-cols-[200px_1fr]">
                <div className="hidden border-r border-glass-border p-4 md:block">
                  <ul className="space-y-1.5">
                    {TOOLS.slice(0, 7).map((tool, i) => (
                      <li
                        key={tool.key}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                          i === 0 ? "bg-primary/15 text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <tool.icon className="size-3.5" />
                        {tool.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4 p-5 sm:p-7">
                  <div className="ml-auto max-w-sm rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                    Design a Roblox tycoon economy and give me the Lua for it.
                  </div>
                  <div className="max-w-xl space-y-3 text-sm text-foreground/90">
                    <p className="inline-flex items-center gap-2 text-xs text-accent">
                      <Sparkle className="size-3.5" /> ALL-IN-1 AI
                    </p>
                    <p>
                      Here&apos;s a three-tier progression loop with soft-currency drip, a rebirth
                      multiplier and anti-inflation caps:
                    </p>
                    <pre className="overflow-x-auto rounded-xl border border-glass-border bg-cosmos/80 p-4 text-xs leading-relaxed text-foreground/85">
                      <code>{`local Economy = {}
Economy.BaseIncome = 12
Economy.RebirthBonus = 0.35

function Economy:tick(player, tier)
  local mult = 1 + (Economy.RebirthBonus * tier)
  return math.floor(Economy.BaseIncome * mult)
end

return Economy`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="relative border-t border-glass-border py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent">THE TOOLKIT</p>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Nine tools. One account. Zero cost.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every module shares your projects, history and files, so work started in one tool
              continues in another without copy-paste.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <article
                key={tool.key}
                className="glass-panel group rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <tool.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{tool.name}</h3>
                <p className="mt-1 text-xs font-medium tracking-wide text-accent">{tool.tagline}</p>
                <p className="mt-3 text-sm text-muted-foreground">{tool.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {tool.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Zap className="size-3 text-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Free promise */}
      <section className="border-t border-glass-border py-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="glass-panel glow-ring rounded-2xl p-8 text-center sm:p-12">
            <ShieldCheck className="mx-auto size-10 text-success" />
            <h2 className="mt-5 font-display text-2xl font-bold sm:text-3xl">
              Strictly free. Strictly forever.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              No credits. No tokens. No subscriptions. No trials that expire. The only limit is
              gentle fair use so one heavy user can never slow the platform down for everybody
              else.
            </p>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="border-t border-glass-border py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">THE ECOSYSTEM</p>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Bigger than a single app
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {ECOSYSTEM.map((item) => (
              <article key={item.name} className="glass-panel rounded-2xl p-6">
                <Badge variant="secondary" className="rounded-full text-[0.65rem]">
                  {item.tag}
                </Badge>
                <h3 className="mt-4 font-display text-lg font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-glass-border py-20 sm:py-24">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Questions, answered
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-glass-border">
                <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-14 text-center">
            <h3 className="font-display text-2xl font-bold">Ready when you are.</h3>
            <p className="mt-3 text-muted-foreground">
              Create an account and every tool unlocks instantly.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Create your free account
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
