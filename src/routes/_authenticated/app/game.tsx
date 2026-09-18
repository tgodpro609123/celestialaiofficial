import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Gamepad2, Save } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/app/Markdown";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiGame } from "@/lib/ai/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/game")({
  component: GamePage,
  head: () => ({
    meta: [
      { title: "Game AI | ALL-IN-1 AI" },
      {
        name: "description",
        content:
          "Turn a game idea into mechanics, gameplay loops, economy design and ready-to-paste Lua scripts.",
      },
      { property: "og:title", content: "Game AI | ALL-IN-1 AI" },
      { property: "og:description", content: "Roblox game design and Luau scripts, free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TEMPLATES = [
  { key: "Roblox Simulator", blurb: "Clicks, upgrades, rebirths" },
  { key: "Obby", blurb: "Stages, checkpoints, traps" },
  { key: "RPG", blurb: "Quests, combat, loot" },
  { key: "Tycoon", blurb: "Droppers, plots, income" },
  { key: "Survival", blurb: "Resources, hunger, waves" },
];

function GamePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const build = useServerFn(aiGame);
  const [template, setTemplate] = useState(TEMPLATES[0]!.key);
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState("");

  const { data: saved = [] } = useQuery({
    queryKey: ["game-designs", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("code_snippets")
        .select("id, title, code")
        .eq("action", "game")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      const { text } = await build({ data: { template, idea: idea.trim() } });
      return text;
    },
    onSuccess: (text) => setResult(text),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "The game design failed to generate."),
  });

  async function save() {
    if (!user || !result) return;
    const { error } = await supabase.from("code_snippets").insert({
      user_id: user.id,
      title: `${template}: ${idea.slice(0, 40) || "design"}`,
      language: "lua",
      action: "game",
      code: result,
    });
    if (error) return toast.error("Couldn't save that design.");
    toast.success("Design saved.");
    void queryClient.invalidateQueries({ queryKey: ["game-designs", user.id] });
  }

  return (
    <div>
      <PageHeader title="Game AI" subtitle="Pick a template, describe the idea, get a buildable design." />
      <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-[380px_1fr]">
        <div className="glass-panel space-y-3 rounded-2xl p-4 sm:p-5">
          <div className="grid gap-2">
            {TEMPLATES.map((item) => (
              <button
                key={item.key}
                onClick={() => setTemplate(item.key)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition-colors",
                  template === item.key
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-glass-border bg-background/40 text-muted-foreground hover:text-foreground",
                )}
              >
                <p className="text-sm font-medium">{item.key}</p>
                <p className="text-xs text-muted-foreground">{item.blurb}</p>
              </button>
            ))}
          </div>
          <Textarea
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            rows={4}
            placeholder="A pet-collecting simulator set in space…"
          />
          <Button className="w-full" disabled={!idea.trim() || run.isPending} onClick={() => run.mutate()}>
            <Gamepad2 className="mr-2 size-4" />
            {run.isPending ? "Designing…" : "Design the game"}
          </Button>

          {saved.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Saved designs</p>
              {saved.map((item) => (
                <button
                  key={item.id}
                  className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  onClick={() => setResult(item.code)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel min-h-[50vh] rounded-2xl p-4 sm:p-5">
          {result ? (
            <>
              <Markdown content={result} />
              <Button className="mt-4" variant="secondary" onClick={() => void save()}>
                <Save className="mr-2 size-4" /> Save design
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              You'll get the core loop, mechanics, progression, economy and complete Luau scripts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
