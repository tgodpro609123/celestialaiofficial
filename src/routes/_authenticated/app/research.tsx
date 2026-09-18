import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Telescope } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiResearch, type ResearchResult } from "@/lib/ai/ai.functions";

export const Route = createFileRoute("/_authenticated/app/research")({
  component: ResearchPage,
  head: () => ({
    meta: [
      { title: "Research AI | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Deep-dive any topic and get structured findings, cited sources and your own notes.",
      },
      { property: "og:title", content: "Research AI | ALL-IN-1 AI" },
      { property: "og:description", content: "Structured research with sources, free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ResearchPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const research = useServerFn(aiResearch);
  const [query, setQuery] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [notes, setNotes] = useState("");

  const { data: sessions = [] } = useQuery({
    queryKey: ["research-sessions", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_sessions")
        .select("id, query, summary, findings, sources, notes")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in again.");
      const data = await research({ data: { query: query.trim() } });
      const { data: row, error } = await supabase
        .from("research_sessions")
        .insert({
          user_id: user.id,
          query: query.trim(),
          summary: data.summary,
          findings: data.findings,
          sources: data.sources,
        })
        .select("id")
        .single();
      if (error) throw error;
      return { data, id: row.id };
    },
    onSuccess: ({ data, id }) => {
      setResult(data);
      setSessionId(id);
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["research-sessions", user?.id] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "The research request failed."),
  });

  async function saveNotes() {
    if (!sessionId) return;
    const { error } = await supabase.from("research_sessions").update({ notes }).eq("id", sessionId);
    if (error) return toast.error("Couldn't save your notes.");
    toast.success("Notes saved.");
    void queryClient.invalidateQueries({ queryKey: ["research-sessions", user?.id] });
  }

  return (
    <div>
      <PageHeader title="Research AI" subtitle="Structured findings with sources you can check." />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="glass-panel flex flex-wrap gap-3 rounded-2xl p-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What should I research?"
            className="min-w-[220px] flex-1"
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) run.mutate();
            }}
          />
          <Button disabled={!query.trim() || run.isPending} onClick={() => run.mutate()}>
            <Telescope className="mr-2 size-4" />
            {run.isPending ? "Researching…" : "Research"}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {result ? (
              <>
                <div className="glass-panel rounded-2xl p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Summary</p>
                  <p className="mt-2 text-sm text-foreground/90">{result.summary}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {result.findings.map((finding, index) => (
                    <div key={index} className="glass-panel rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground">{finding.heading}</p>
                        <Badge variant="secondary">{finding.confidence}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{finding.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Sources</p>
                  <ul className="mt-2 space-y-2">
                    {result.sources.map((source, index) => (
                      <li key={index} className="text-sm">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {source.title} <ExternalLink className="size-3" />
                        </a>
                        <p className="text-xs text-muted-foreground">{source.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Your notes</p>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={4}
                    className="mt-2"
                    placeholder="Anything you want to remember about this topic…"
                  />
                  <Button className="mt-3" variant="secondary" onClick={() => void saveNotes()}>
                    Save notes
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ask a question above to get findings, confidence levels and sources.
              </p>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-3">
            <p className="px-2 pb-2 text-xs uppercase tracking-widest text-muted-foreground">
              Past research
            </p>
            {sessions.length === 0 ? (
              <p className="px-2 text-xs text-muted-foreground">Nothing saved yet.</p>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-background/60 hover:text-foreground"
                  onClick={() => {
                    setSessionId(session.id);
                    setNotes(session.notes ?? "");
                    setResult({
                      summary: session.summary ?? "",
                      findings: (session.findings ?? []) as ResearchResult["findings"],
                      sources: (session.sources ?? []) as ResearchResult["sources"],
                    });
                  }}
                >
                  {session.query}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
