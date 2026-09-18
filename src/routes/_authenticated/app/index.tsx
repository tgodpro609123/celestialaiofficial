import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, TOOLS } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Your ALL-IN-1 AI workspace: chat, images, code, games, files, research, voice and agents.",
      },
      { property: "og:title", content: "Dashboard | ALL-IN-1 AI" },
      { property: "og:description", content: "One free AI workspace for everything you build." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Dashboard() {
  const { profile, user } = useAuth();
  const name = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "there";

  return (
    <div>
      <PageHeader title={`Welcome back, ${name}`} subtitle={`${BRAND.slogan} Pick a tool and go.`} />
      <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.key}
            to={tool.to}
            className="glass-panel group rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
          >
            <tool.icon className="size-6 text-primary" />
            <h2 className="mt-3 font-display text-lg font-semibold text-foreground">{tool.name}</h2>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{tool.tagline}</p>
            <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
