import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Projects | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Bundle chats, code, files, images and notes into one workspace per idea or client.",
      },
      { property: "og:title", content: "Projects | ALL-IN-1 AI" },
      { property: "og:description", content: "Keep every AI output for an idea in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: contents } = useQuery({
    queryKey: ["project-contents", activeId],
    enabled: Boolean(activeId),
    queryFn: async () => {
      const [conversations, snippets, files, images, notes] = await Promise.all([
        supabase.from("conversations").select("id, title").eq("project_id", activeId!),
        supabase.from("code_snippets").select("id, title").eq("project_id", activeId!),
        supabase.from("files").select("id, name").eq("project_id", activeId!),
        supabase.from("generated_images").select("id, prompt, image_url").eq("project_id", activeId!),
        supabase
          .from("project_notes")
          .select("id, title, body")
          .eq("project_id", activeId!)
          .order("created_at", { ascending: false }),
      ]);
      return {
        conversations: conversations.data ?? [],
        snippets: snippets.data ?? [],
        files: files.data ?? [],
        images: images.data ?? [],
        notes: notes.data ?? [],
      };
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in again.");
      const { data, error } = await supabase
        .from("projects")
        .insert({ user_id: user.id, name: name.trim() })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      setName("");
      setActiveId(id);
      void queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
    },
    onError: () => toast.error("Couldn't create that project."),
  });

  async function addNote() {
    if (!user || !activeId || !noteBody.trim()) return;
    const { error } = await supabase.from("project_notes").insert({
      user_id: user.id,
      project_id: activeId,
      title: noteTitle.trim() || "Note",
      body: noteBody.trim(),
    });
    if (error) return toast.error("Couldn't save that note.");
    setNoteTitle("");
    setNoteBody("");
    void queryClient.invalidateQueries({ queryKey: ["project-contents", activeId] });
  }

  async function removeProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete that project.");
    if (activeId === id) setActiveId(null);
    void queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
  }

  const active = projects.find((project) => project.id === activeId) ?? null;

  return (
    <div>
      <PageHeader title="Projects" subtitle="One workspace per idea, client or game." />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[300px_1fr]">
        <div className="glass-panel space-y-3 rounded-2xl p-3">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New project name"
            />
            <Button
              size="icon"
              aria-label="Create project"
              disabled={!name.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {projects.length === 0 ? (
            <p className="px-2 text-xs text-muted-foreground">No projects yet.</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                  activeId === project.id ? "bg-primary/15" : "hover:bg-background/60",
                )}
              >
                <FolderKanban className="size-4 text-muted-foreground" />
                <button
                  className="min-w-0 flex-1 truncate text-left text-foreground"
                  onClick={() => setActiveId(project.id)}
                >
                  {project.name}
                </button>
                <button
                  aria-label={`Delete ${project.name}`}
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => void removeProject(project.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="glass-panel min-h-[50vh] rounded-2xl p-4 sm:p-5">
          {!active ? (
            <p className="text-sm text-muted-foreground">
              Pick or create a project to see everything bundled inside it.
            </p>
          ) : (
            <div className="space-y-5">
              <p className="font-display text-xl text-foreground">{active.name}</p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Bundle title="Chats" items={(contents?.conversations ?? []).map((c) => c.title)} />
                <Bundle title="Code" items={(contents?.snippets ?? []).map((c) => c.title)} />
                <Bundle title="Files" items={(contents?.files ?? []).map((f) => f.name)} />
                <Bundle title="Images" items={(contents?.images ?? []).map((i) => i.prompt)} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Notes</p>
                <div className="mt-2 space-y-2">
                  <Input
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Note title"
                  />
                  <Textarea
                    value={noteBody}
                    onChange={(event) => setNoteBody(event.target.value)}
                    rows={3}
                    placeholder="Write anything you want to keep with this project…"
                  />
                  <Button variant="secondary" onClick={() => void addNote()} disabled={!noteBody.trim()}>
                    Add note
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  {(contents?.notes ?? []).map((note) => (
                    <div key={note.id} className="rounded-xl border border-glass-border bg-background/40 p-3">
                      <p className="text-sm font-medium text-foreground">{note.title}</p>
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Bundle({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-glass-border bg-background/40 p-3">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
      {items.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {items.slice(0, 5).map((item, index) => (
            <li key={index} className="truncate text-sm text-foreground/90">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
