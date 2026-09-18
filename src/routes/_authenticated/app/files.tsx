import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/app/Markdown";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiFileQuestion } from "@/lib/ai/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/files")({
  component: FilesPage,
  head: () => ({
    meta: [
      { title: "File AI | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Upload documents and get summaries plus answers grounded in the content.",
      },
      { property: "og:title", content: "File AI | ALL-IN-1 AI" },
      { property: "og:description", content: "Ask your documents anything, free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const TEXTY = [".txt", ".md", ".csv", ".json", ".log", ".lua", ".js", ".ts", ".py", ".html", ".css"];

function FilesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const ask = useServerFn(aiFileQuestion);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const { data: files = [] } = useQuery({
    queryKey: ["files", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("id, name, size_bytes, status, summary, extracted_text, mime_type")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const active = files.find((file) => file.id === activeId) ?? null;

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Please sign in again.");
      const readable = TEXTY.some((extension) => file.name.toLowerCase().endsWith(extension));
      const text = readable ? await file.text() : "";
      const { data, error } = await supabase
        .from("files")
        .insert({
          user_id: user.id,
          name: file.name,
          size_bytes: file.size,
          mime_type: file.type || null,
          storage_path: `inline/${crypto.randomUUID()}`,
          extracted_text: text.slice(0, 200_000) || null,
          status: readable ? "ready" : "unsupported",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      setActiveId(id);
      void queryClient.invalidateQueries({ queryKey: ["files", user?.id] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "That file couldn't be added."),
  });

  const run = useMutation({
    mutationFn: async (mode: "summary" | "question") => {
      if (!active?.extracted_text) throw new Error("Pick a readable document first.");
      const { text } = await ask({
        data: { documentText: active.extracted_text, question, mode },
      });
      if (mode === "summary") {
        await supabase.from("files").update({ summary: text }).eq("id", active.id);
        void queryClient.invalidateQueries({ queryKey: ["files", user?.id] });
      }
      return text;
    },
    onSuccess: (text) => setAnswer(text),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "That request didn't work."),
  });

  async function remove(id: string) {
    const { error } = await supabase.from("files").delete().eq("id", id);
    if (error) return toast.error("Couldn't remove that file.");
    if (activeId === id) setActiveId(null);
    void queryClient.invalidateQueries({ queryKey: ["files", user?.id] });
  }

  return (
    <div>
      <PageHeader
        title="File AI"
        subtitle="Add a document, then ask questions or get a summary."
        actions={
          <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            <Upload className="mr-2 size-4" /> {upload.isPending ? "Adding…" : "Add file"}
          </Button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) upload.mutate(file);
        }}
      />

      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
        <div className="glass-panel rounded-2xl p-3">
          {files.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No files yet. Text documents (TXT, MD, CSV, JSON, code) can be read straight away.
            </p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                  activeId === file.id ? "bg-primary/15" : "hover:bg-background/60",
                )}
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <button
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setActiveId(file.id);
                    setAnswer("");
                  }}
                >
                  <p className="truncate text-foreground">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {(file.size_bytes / 1024).toFixed(0)} KB
                  </p>
                </button>
                <Badge variant={file.status === "ready" ? "secondary" : "outline"}>
                  {file.status}
                </Badge>
                <button
                  aria-label={`Delete ${file.name}`}
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => void remove(file.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="glass-panel min-h-[50vh] rounded-2xl p-4 sm:p-5">
          {!active ? (
            <p className="text-sm text-muted-foreground">Select a file to work with it.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-display text-lg text-foreground">{active.name}</p>
                <p className="text-xs text-muted-foreground">
                  {active.status === "ready"
                    ? "Ready for questions and summaries."
                    : "This format can't be read as text yet — try a TXT, MD, CSV or code file."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={run.isPending || active.status !== "ready"}
                  onClick={() => run.mutate("summary")}
                >
                  Summarise
                </Button>
                <Input
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about this document…"
                  className="max-w-sm"
                />
                <Button
                  disabled={run.isPending || !question.trim() || active.status !== "ready"}
                  onClick={() => run.mutate("question")}
                >
                  Ask
                </Button>
              </div>

              {run.isPending && <p className="text-sm text-muted-foreground">Reading…</p>}
              {(answer || active.summary) && <Markdown content={answer || active.summary || ""} />}

              {active.extracted_text && (
                <pre className="max-h-64 overflow-auto rounded-xl border border-glass-border bg-background/60 p-3 font-mono text-[11px] text-muted-foreground">
                  {active.extracted_text.slice(0, 4000)}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
