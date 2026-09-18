import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiChat, aiSpeak } from "@/lib/ai/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/voice")({
  component: VoicePage,
  head: () => ({
    meta: [
      { title: "Voice AI | ALL-IN-1 AI" },
      {
        name: "description",
        content: "Speak your prompt and hear ALL-IN-1 AI reply out loud, hands free.",
      },
      { property: "og:title", content: "Voice AI | ALL-IN-1 AI" },
      { property: "og:description", content: "Talk to AI and listen back, free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Turn = { role: "user" | "assistant"; content: string };

function VoicePage() {
  const chat = useServerFn(aiChat);
  const speak = useServerFn(aiSpeak);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [levels, setLevels] = useState<number[]>(Array.from({ length: 28 }, () => 4));
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recognitionRef = useRef<unknown>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startVisualiser() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 64;
      context.createMediaStreamSource(stream).connect(analyser);
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(buffer);
        setLevels(Array.from({ length: 28 }, (_, i) => 4 + (buffer[i % buffer.length] ?? 0) / 4));
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* visualiser is optional */
    }
  }

  function stopVisualiser() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setLevels(Array.from({ length: 28 }, () => 4));
  }

  function toggleListening() {
    if (listening) {
      (recognitionRef.current as { stop?: () => void } | null)?.stop?.();
      setListening(false);
      stopVisualiser();
      return;
    }

    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => unknown }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (!Ctor) {
      toast.error("This browser can't record speech. Type your message instead.");
      return;
    }

    const recognition = new Ctor() as {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    };
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i += 1) {
        text += event.results[i]?.[0]?.transcript ?? "";
      }
      setDraft(text);
    };
    recognition.onerror = () => {
      setListening(false);
      stopVisualiser();
    };
    recognition.onend = () => {
      setListening(false);
      stopVisualiser();
    };
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    void startVisualiser();
  }

  const send = useMutation({
    mutationFn: async (text: string) => {
      const history = [...turns, { role: "user" as const, content: text }];
      const { text: reply } = await chat({ data: { capability: "voice", messages: history } });
      const { audioUrl: url } = await speak({ data: { text: reply } });
      return { reply, url };
    },
    onSuccess: ({ reply, url }) => {
      setTurns((prev) => [...prev, { role: "assistant", content: reply }]);
      setAudioUrl(url);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "The voice reply failed.");
    },
  });

  function submit() {
    const value = draft.trim();
    if (!value || send.isPending) return;
    setTurns((prev) => [...prev, { role: "user", content: value }]);
    setDraft("");
    send.mutate(value);
  }

  return (
    <div>
      <PageHeader title="Voice AI" subtitle="Speak or type, then hear the answer read back to you." />
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex h-24 items-end justify-center gap-1">
            {levels.map((level, index) => (
              <span
                key={index}
                className={cn(
                  "w-2 rounded-full bg-primary/70 transition-[height] duration-75",
                  listening ? "opacity-100" : "opacity-40",
                )}
                style={{ height: `${Math.min(level, 96)}px` }}
              />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Button size="lg" variant={listening ? "destructive" : "default"} onClick={toggleListening}>
              {listening ? <MicOff className="mr-2 size-4" /> : <Mic className="mr-2 size-4" />}
              {listening ? "Stop listening" : "Start talking"}
            </Button>
          </div>
        </div>

        <div className="glass-panel space-y-3 rounded-2xl p-4">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={2}
            placeholder="Your words appear here as you speak…"
          />
          <Button className="w-full" disabled={!draft.trim() || send.isPending} onClick={submit}>
            <Send className="mr-2 size-4" /> {send.isPending ? "Replying…" : "Send"}
          </Button>
        </div>

        {audioUrl && (
          <div className="glass-panel flex items-center gap-3 rounded-2xl p-4">
            <Volume2 className="size-4 text-primary" />
            <audio controls autoPlay src={audioUrl} className="w-full" />
          </div>
        )}

        <div className="space-y-3">
          {turns.map((turn, index) => (
            <div
              key={index}
              className={cn("flex", turn.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  turn.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-glass-border bg-background/50 text-foreground",
                )}
              >
                {turn.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
