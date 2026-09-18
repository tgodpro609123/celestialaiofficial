import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bot, Check } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/app/Markdown";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiAgent, type AgentPlan } from "@/lib/ai/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/agents")({
  component: AgentsPage,
  head: () => ({
    meta: [
      { title: "AI Agents | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Give a goal and watch an agent research, plan, create and review to a finished result.",
      },
      { property: "og:title", content: "AI Agents | ALL-IN-1 AI" },
      { property: "og:description", content: "Delegate whole tasks to a free AI agent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const STAGES = ["researching", "planning", "creating", "reviewing", "complete"] as const;

function AgentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const runAgent = useServerFn(aiAgent);
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);
  const [stage, setStage] = useState<string>("");

  const { data: tasks = [] } = useQuery({
    queryKey: ["agent-tasks", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_tasks")
        .select("id, goal, stage, status, steps, result")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in again.");
      setPlan(null);
      setStage("researching");
      const timers = STAGES.slice(1, 4).map((next, index) =>
        setTimeout(() => setStage(next), (index + 1) * 2500),
      );
      try {
        const data = await runAgent({ data: { goal: goal.trim() } });
        const { error } = await supabase.from("agent_tasks").insert({
          user_id: user.id,
          goal: goal.trim(),
          stage: "complete",
          status: "complete",
          steps: data.steps,
          result: data.result,
        });
        if (error) throw error;
        return data;
      } finally {
        timers.forEach(clearTimeout);
      }
    },
    onSuccess: (data) => {
      setPlan(data);
      setStage("complete");
      void queryClient.invalidateQueries({ queryKey: ["agent-tasks", user?.id] });
    },
    onError: (error) => {
      setStage("");
      toast.error(error instanceof Error ? error.message : "The agent couldn't finish that.");
    },
  });

  const stageIndex = STAGES.indexOf(stage as (typeof STAGES)[number]);

  return (
    <div>
      <PageHeader title="AI Agents" subtitle="Hand over a goal and get a finished deliverable." />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="glass-panel space-y-3 rounded-2xl p-4 sm:p-5">
            <Textarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
              placeholder="Plan and write a launch announcement for my new Roblox tycoon game…"
            />
            <Button disabled={!goal.trim() || run.isPending} onClick={() => run.mutate()}>
              <Bot className="mr-2 size-4" /> {run.isPending ? "Working…" : "Run agent"}
            </Button>
          </div>

          {(run.isPending || plan) && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {STAGES.map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs capitalize",
                        index <= stageIndex
                          ? "bg-primary/20 text-foreground"
                          : "bg-background/50 text-muted-foreground",
                      )}
                    >
                      {index < stageIndex && <Check className="size-3" />} {item}
                    </span>
                    {index < STAGES.length - 1 && (
                      <span className="hidden h-px w-5 bg-glass-border sm:block" />
                    )}
                  </div>
                ))}
              </div>

              {plan && (
                <div className="mt-4 space-y-3">
                  {plan.steps.map((step, index) => (
                    <div key={index} className="rounded-xl border border-glass-border bg-background/40 p-3">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                        {step.stage}
                      </p>
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {plan?.result && (
            <div className="glass-panel rounded-2xl p-4 sm:p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Result</p>
              <Markdown content={plan.result} />
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-3">
          <p className="px-2 pb-2 text-xs uppercase tracking-widest text-muted-foreground">
            Past tasks
          </p>
          {tasks.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <button
                key={task.id}
                className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-background/60 hover:text-foreground"
                onClick={() => {
                  setStage("complete");
                  setPlan({
                    steps: (task.steps ?? []) as AgentPlan["steps"],
                    result: task.result ?? "",
                  });
                }}
              >
                {task.goal}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
