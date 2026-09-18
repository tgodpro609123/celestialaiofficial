import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { aiImage } from "@/lib/ai/ai.functions";

export const Route = createFileRoute("/_authenticated/app/image")({
  component: ImagePage,
  head: () => ({
    meta: [
      { title: "Image AI | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Generate images free with ALL-IN-1 AI: style presets, aspect ratios and a gallery.",
      },
      { property: "og:title", content: "Image AI | ALL-IN-1 AI" },
      { property: "og:description", content: "Describe anything and get an image, free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const STYLES = [
  "None",
  "Cinematic",
  "Photoreal",
  "Anime",
  "3D render",
  "Watercolour",
  "Pixel art",
  "Neon cyberpunk",
];
const RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];

function ImagePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const generate = useServerFn(aiImage);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Cinematic");
  const [ratio, setRatio] = useState("1:1");
  const [preview, setPreview] = useState<string | null>(null);

  const { data: images = [] } = useQuery({
    queryKey: ["generated-images", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_images")
        .select("id, prompt, image_url, aspect_ratio, style")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in again.");
      const { imageUrl } = await generate({
        data: { prompt: prompt.trim(), style, aspectRatio: ratio },
      });
      const { error } = await supabase.from("generated_images").insert({
        user_id: user.id,
        prompt: prompt.trim(),
        image_url: imageUrl,
        aspect_ratio: ratio,
        style,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["generated-images", user?.id] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "The image didn't come through."),
  });

  async function remove(id: string) {
    const { error } = await supabase.from("generated_images").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete that image.");
    void queryClient.invalidateQueries({ queryKey: ["generated-images", user?.id] });
  }

  return (
    <div>
      <PageHeader title="Image AI" subtitle="Describe it, pick a look, and download the result." />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="glass-panel rounded-2xl p-4 sm:p-5">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            placeholder="A neon skyline above a quiet ocean, long exposure…"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ratio} onValueChange={setRatio}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATIOS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="ml-auto"
              disabled={!prompt.trim() || run.isPending}
              onClick={() => run.mutate()}
            >
              <Sparkles className="mr-2 size-4" />
              {run.isPending ? "Creating…" : "Generate"}
            </Button>
          </div>
        </div>

        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your gallery is empty. Generate your first image above.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <div key={image.id} className="glass-panel overflow-hidden rounded-2xl">
                <button className="block w-full" onClick={() => setPreview(image.image_url)}>
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                </button>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-xs text-muted-foreground">{image.prompt}</p>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <a href={image.image_url} download={`all-in-1-${image.id}.png`}>
                        <Download className="mr-2 size-3.5" /> Download
                      </a>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete image"
                      onClick={() => void remove(image.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(preview)} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl border-glass-border bg-background/95">
          {preview && <img src={preview} alt="Full size preview" className="w-full rounded-xl" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
