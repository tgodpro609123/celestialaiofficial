import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Play, Save } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/app/Markdown";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiCode } from "@/lib/ai/ai.functions";

export const Route = createFileRoute("/_authenticated/app/code")({
  component: CodePage,
  head: () => ({
    meta: [
      { title: "Code AI | ALL-IN-1 AI" },
      {
        name: "description",
        content:
          "Generate, explain, debug, fix and optimise code across Lua, JavaScript, TypeScript, Python, C++ and SQL.",
      },
      { property: "og:title", content: "Code AI | ALL-IN-1 AI" },
      { property: "og:description", content: "Free coding help, including Roblox Luau." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const LANGUAGES = ["lua", "javascript", "typescript", "python", "html", "css", "cpp", "sql"];
const ACTIONS = ["generate", "explain", "debug", "fix", "optimize"] as const;

function CodePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const runCode = useServerFn(aiCode);
  const [language, setLanguage] = useState("lua");
  const [action, setAction] = useState<(typeof ACTIONS)[number]>("generate");
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [roblox, setRoblox] = useState(true);
  const [result, setResult] = useState("");
  const [title, setTitle] = useState("");

  const { data: snippets = [] } = useQuery({
    queryKey: ["code-snippets", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("code_snippets")
        .select("id, title, language, action, code")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      const { text } = await runCode({
        data: { language, action, prompt: prompt.trim(), code, robloxMode: language === "lua" && roblox },
      });
      return text;
    },
    onSuccess: (text) => setResult(text),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "The code request failed."),
  });

  async function save() {
    if (!user || !result) return;
    const { error } = await supabase.from("code_snippets").insert({
      user_id: user.id,
      title: title.trim() || prompt.slice(0, 50) || `${action} ${language}`,
      language,
      action,
      code: result,
    });
    if (error) return toast.error("Couldn't save that snippet.");
    setTitle("");
    toast.success("Saved to your snippets.");
    void queryClient.invalidateQueries({ queryKey: ["code-snippets", user.id] });
  }

  return (
    <div>
      <PageHeader title="Code AI" subtitle="Write, explain, debug, fix and optimise — Luau included." />
      <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-2">
        <div className="glass-panel space-y-3 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={action} onValueChange={(value) => setAction(value as typeof action)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {language === "lua" && (
              <div className="flex items-center gap-2">
                <Switch id="roblox" checked={roblox} onCheckedChange={setRoblox} />
                <Label htmlFor="roblox" className="text-xs text-muted-foreground">
                  Roblox mode
                </Label>
              </div>
            )}
          </div>

          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            placeholder="What should this code do?"
          />
          <Textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            rows={12}
            placeholder="Paste existing code here (optional)"
            className="font-mono text-xs"
          />
          <Button
            className="w-full"
            disabled={run.isPending || (!prompt.trim() && !code.trim())}
            onClick={() => run.mutate()}
          >
            <Play className="mr-2 size-4" />
            {run.isPending ? "Working…" : `Run ${action}`}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="glass-panel min-h-[40vh] rounded-2xl p-4 sm:p-5">
            {result ? (
              <>
                <Markdown content={result} />
                <div className="mt-4 flex gap-2">
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Snippet name"
                  />
                  <Button variant="secondary" onClick={() => void save()}>
                    <Save className="mr-2 size-4" /> Save
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Results appear here with copyable code blocks.
              </p>
            )}
          </div>

          {snippets.length > 0 && (
            <div className="glass-panel rounded-2xl p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Saved snippets
              </p>
              <div className="space-y-1">
                {snippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    className="block w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    onClick={() => setResult(snippet.code)}
                  >
                    {snippet.title}
                    <span className="ml-2 font-mono text-[10px] uppercase">{snippet.language}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
