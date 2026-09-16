// Modular server-side AI router for ALL-IN-1 AI.
// Every capability goes through here so extra providers can be added later
// without touching UI code.

export const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export type Capability =
  | "chat"
  | "code"
  | "game"
  | "files"
  | "research"
  | "agents"
  | "voice"
  | "image";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const TEXT_MODEL = "google/gemini-3.8-flash";
const IMAGE_MODEL = "google/gemini-3-pro-image";
const TTS_MODEL = "openai/gpt-4o-mini-tts";

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function apiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("The AI service is not configured yet.", 500);
  return key;
}

function friendly(status: number, message: string) {
  if (status === 429) return "The AI is busy right now. Give it a few seconds and try again.";
  if (status === 402 || status === 403)
    return "AI access is temporarily unavailable for this app. The owner has been notified.";
  if (status === 400) return `The request couldn't be processed: ${message}`;
  return "The AI couldn't finish that request. Please try again.";
}

export async function generateText(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const response = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages,
      ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
      ...(options.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AiError(friendly(response.status, body.slice(0, 300)), response.status);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = payload.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiError("The AI returned an empty answer. Try rephrasing.", 502);
  return text;
}

export async function generateJson<T>(messages: ChatMessage[], fallback: T): Promise<T> {
  const raw = await generateText(messages, { temperature: 0.4 });
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const arrayStart = cleaned.indexOf("[");
  const from =
    start === -1 ? arrayStart : arrayStart === -1 ? start : Math.min(start, arrayStart);
  try {
    return JSON.parse(from > 0 ? cleaned.slice(from) : cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function generateImage(prompt: string, aspectRatio: string): Promise<string> {
  const sizes: Record<string, string> = {
    "1:1": "1024x1024",
    "16:9": "1536x864",
    "9:16": "864x1536",
    "4:3": "1200x900",
    "3:4": "900x1200",
  };

  const response = await fetch(`${GATEWAY_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: sizes[aspectRatio] ?? "1024x1024",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AiError(friendly(response.status, body.slice(0, 300)), response.status);
  }

  const payload = (await response.json()) as {
    data?: { b64_json?: string; url?: string }[];
  };
  const item = payload.data?.[0];
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item?.url) return item.url;
  throw new AiError("No image came back. Try a different prompt.", 502);
}

export async function synthesizeSpeech(text: string, voice = "alloy"): Promise<string> {
  const response = await fetch(`${GATEWAY_URL}/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey(),
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: TTS_MODEL,
      input: text.slice(0, 4000),
      voice,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AiError(friendly(response.status, body.slice(0, 300)), response.status);
  }

  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return `data:audio/mpeg;base64,${btoa(binary)}`;
}
