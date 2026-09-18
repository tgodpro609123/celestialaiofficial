import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/app/Markdown";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiChat, aiTitle } from "@/lib/ai/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/chat")({
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "AI Chat | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Chat with ALL-IN-1 AI: markdown answers, code blocks and searchable history.",
      },
      { property: "og:title", content: "AI Chat | ALL-IN-1 AI" },
      { property: "og:description", content: "Free AI chat with full conversation history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const SUGGESTIONS = [
  "Explain quantum computing like I'm twelve",
  "Draft a launch post for my Roblox game",
  "Plan a 7-day study schedule for exams",
  "Turn these notes into a clear summary",
];

type Msg = { id: string; role: string; content: string };

function bucketOf(iso: string) {
  const days = (Date.now() - new Date(iso).getTime()) / 86_400_000;
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  if (days < 7) return "Previous 7 days";
  return "Older";
}

function ChatPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const chat = useServerFn(aiChat);
  const title = useServerFn(aiTitle);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");
  const [pending, setPending] = useState<Msg[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", "chat", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .eq("tool", "chat")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeId],
    enabled: Boolean(activeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content")
        .eq("conversation_id", activeId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Msg[];
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending.length]);

  const send = useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Please sign in again.");
      let conversationId = activeId;

      if (!conversationId) {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, tool: "chat", title: text.slice(0, 40) })
          .select("id")
          .single();
        if (error) throw error;
        conversationId = data.id;
        setActiveId(conversationId);
        void title({ data: { firstMessage: text } }).then(async (res) => {
          await supabase.from("conversations").update({ title: res.title }).eq("id", conversationId!);
          void queryClient.invalidateQueries({ queryKey: ["conversations", "chat", user.id] });
        });
      }

      const history = [...messages, ...pending]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      const { error: userError } = await supabase
        .from("messages")
        .insert({ user_id: user.id, conversation_id: conversationId, role: "user", content: text });
      if (userError) throw userError;

      const { text: reply } = await chat({
        data: { capability: "chat", messages: [...history, { role: "user", content: text }] },
      });

      const { error: replyError } = await supabase
        .from("messages")
        .insert({ user_id: user.id, conversation_id: conversationId, role: "assistant", content: reply });
      if (replyError) throw replyError;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return conversationId;
    },
    onSuccess: (conversationId) => {
      setPending([]);
      void queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      void queryClient.invalidateQueries({ queryKey: ["conversations", "chat", user?.id] });
      inputRef.current?.focus();
    },
    onError: (error) => {
      setPending([]);
      toast.error(error instanceof Error ? error.message : "That didn't go through.");
    },
  });

  function submit(text: string) {
    const value = text.trim();
    if (!value || send.isPending) return;
    setDraft("");
    setPending([{ id: `local-${Date.now()}`, role: "user", content: value }]);
    send.mutate(value);
  }

  async function removeConversation(id: string) {
    await supabase.from("messages").delete().eq("conversation_id", id);
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete that chat.");
    if (activeId === id) setActiveId(null);
    void queryClient.invalidateQueries({ queryKey: ["conversations", "chat", user?.id] });
  }

  const visible = conversations.filter((c) =>
    c.title.toLowerCase().includes(filter.trim().toLowerCase()),
  );
  const groups = ["Today", "Yesterday", "Previous 7 days", "Older"].map((label) => ({
    label,
    items: visible.filter((c) => bucketOf(c.updated_at) === label),
  }));

  const thread = [...messages, ...pending];

  return (
    <div>
      <PageHeader
        title="AI Chat"
        subtitle="Ask anything. Answers come back in rich markdown with copyable code."
        actions={
          <Button variant="secondary" onClick={() => setActiveId(null)}>
            <Plus className="mr-2 size-4" /> New chat
          </Button>
        }
      />
      <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-panel hidden rounded-2xl p-3 lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Search chats"
              className="pl-8"
            />
          </div>
          <ScrollArea className="mt-3 h-[60vh]">
            {groups.map(
              (group) =>
                group.items.length > 0 && (
                  <div key={group.label} className="mb-3">
                    <p className="px-2 pb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </p>
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm",
                          activeId === item.id
                            ? "bg-primary/15 text-foreground"
                            : "text-muted-foreground hover:bg-background/60",
                        )}
                      >
                        <button
                          className="min-w-0 flex-1 truncate text-left"
                          onClick={() => setActiveId(item.id)}
                        >
                          {item.title}
                        </button>
                        <button
                          aria-label={`Delete ${item.title}`}
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => void removeConversation(item.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ),
            )}
            {visible.length === 0 && (
              <p className="px-2 py-4 text-xs text-muted-foreground">No chats yet.</p>
            )}
          </ScrollArea>
        </aside>

        <section className="glass-panel flex min-h-[70vh] flex-col rounded-2xl">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {thread.length === 0 ? (
              <div className="mx-auto max-w-lg py-10 text-center">
                <p className="font-display text-xl text-foreground">What are we working on?</p>
                <p className="mt-1 text-sm text-muted-foreground">Try one of these to start.</p>
                <div className="mt-5 grid gap-2">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      className="rounded-xl border border-glass-border bg-background/40 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => submit(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {thread.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <Markdown key={message.id} content={message.content} />
                  ),
                )}
                {send.isPending && <p className="text-sm text-muted-foreground">Thinking…</p>}
                <div ref={endRef} />
              </div>
            )}
          </div>

          <form
            className="flex items-end gap-2 border-t border-glass-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              submit(draft);
            }}
          >
            <Textarea
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submit(draft);
                }
              }}
              rows={2}
              placeholder="Message ALL-IN-1 AI…"
              className="min-h-[52px] resize-none"
            />
            <Button type="submit" size="icon" disabled={send.isPending} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
