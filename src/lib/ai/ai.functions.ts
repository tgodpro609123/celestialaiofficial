import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ChatInput = {
  capability: "chat" | "voice";
  messages: { role: "user" | "assistant"; content: string }[];
  memory?: string | null;
};

async function run<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Something went wrong.");
  }
}

export const aiChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ChatInput) => input)
  .handler(async ({ data, context }) => {
    const { generateText } = await import("./gateway.server");
    const { SYSTEM_PROMPTS } = await import("./prompts.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, data.capability);

    return run(async () => ({
      text: await generateText([
        {
          role: "system",
          content:
            SYSTEM_PROMPTS[data.capability] +
            (data.memory ? `\n\nRemember about this user: ${data.memory}` : ""),
        },
        ...data.messages.slice(-24),
      ]),
    }));
  });

export const aiCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      language: string;
      action: "generate" | "explain" | "debug" | "fix" | "optimize";
      prompt: string;
      code?: string;
      robloxMode?: boolean;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { generateText } = await import("./gateway.server");
    const { SYSTEM_PROMPTS, CODE_ACTION_PROMPTS } = await import("./prompts.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "code");

    return run(async () => ({
      text: await generateText([
        {
          role: "system",
          content:
            SYSTEM_PROMPTS.code +
            (data.robloxMode
              ? "\nTarget Roblox Luau specifically: use Roblox services, RemoteEvents and Instance APIs correctly."
              : ""),
        },
        {
          role: "user",
          content: `Language: ${data.language}\nTask: ${CODE_ACTION_PROMPTS[data.action]}\n\nRequest: ${data.prompt || "(see code below)"}${
            data.code ? `\n\nCode:\n\`\`\`${data.language}\n${data.code}\n\`\`\`` : ""
          }`,
        },
      ]),
    }));
  });

export const aiGame = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { template: string; idea: string }) => input)
  .handler(async ({ data, context }) => {
    const { generateText } = await import("./gateway.server");
    const { SYSTEM_PROMPTS } = await import("./prompts.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "game");

    return run(async () => ({
      text: await generateText([
        { role: "system", content: SYSTEM_PROMPTS.game },
        {
          role: "user",
          content: `Game type: ${data.template}\nIdea: ${data.idea}\nDesign the full game with mechanics, gameplay loop, economy and Luau scripts.`,
        },
      ]),
    }));
  });

export const aiFileQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { documentText: string; question: string; mode: "summary" | "question" }) => input,
  )
  .handler(async ({ data, context }) => {
    const { generateText } = await import("./gateway.server");
    const { SYSTEM_PROMPTS } = await import("./prompts.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "files");

    const task =
      data.mode === "summary"
        ? "Summarise this document: a two-sentence overview, then the key points as bullets."
        : `Answer this question about the document: ${data.question}`;

    return run(async () => ({
      text: await generateText([
        { role: "system", content: SYSTEM_PROMPTS.files },
        {
          role: "user",
          content: `${task}\n\nDocument content:\n"""\n${data.documentText.slice(0, 60_000)}\n"""`,
        },
      ]),
    }));
  });

export type ResearchResult = {
  summary: string;
  findings: { heading: string; detail: string; confidence: string }[];
  sources: { title: string; url: string; note: string }[];
};

export const aiResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { query: string }) => input)
  .handler(async ({ data, context }) => {
    const { generateJson } = await import("./gateway.server");
    const { SYSTEM_PROMPTS } = await import("./prompts.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "research");

    return run(() =>
      generateJson<ResearchResult>(
        [
          { role: "system", content: SYSTEM_PROMPTS.research },
          {
            role: "user",
            content: `Research: "${data.query}".
Respond with JSON only, shape:
{"summary":"...","findings":[{"heading":"...","detail":"...","confidence":"high|medium|low"}],"sources":[{"title":"...","url":"https://...","note":"why this source matters or 'unverified'"}]}
Give 4-6 findings and 3-5 sources.`,
          },
        ],
        { summary: "", findings: [], sources: [] },
      ),
    );
  });

export type AgentPlan = {
  steps: { stage: string; title: string; detail: string }[];
  result: string;
};

export const aiAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { goal: string }) => input)
  .handler(async ({ data, context }) => {
    const { generateJson } = await import("./gateway.server");
    const { SYSTEM_PROMPTS } = await import("./prompts.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "agents");

    return run(() =>
      generateJson<AgentPlan>(
        [
          { role: "system", content: SYSTEM_PROMPTS.agents },
          {
            role: "user",
            content: `Goal: "${data.goal}".
Respond with JSON only, shape:
{"steps":[{"stage":"researching|planning|creating|reviewing","title":"...","detail":"..."}],"result":"the complete final deliverable in markdown"}
Include at least one step per stage, in order.`,
          },
        ],
        { steps: [], result: "" },
      ),
    );
  });

export const aiImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prompt: string; style: string; aspectRatio: string }) => input)
  .handler(async ({ data, context }) => {
    const { generateImage } = await import("./gateway.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "image");

    const styled =
      data.style && data.style !== "None" ? `${data.prompt}. Style: ${data.style}.` : data.prompt;

    return run(async () => ({
      imageUrl: await generateImage(styled, data.aspectRatio),
    }));
  });

export const aiSpeak = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string; voice?: string }) => input)
  .handler(async ({ data, context }) => {
    const { synthesizeSpeech } = await import("./gateway.server");
    const { enforceFairUse } = await import("./rate-limit.server");
    await enforceFairUse(context.supabase, context.userId, "voice");

    return run(async () => ({
      audioUrl: await synthesizeSpeech(data.text, data.voice ?? "alloy"),
    }));
  });

export const aiTitle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { firstMessage: string }) => input)
  .handler(async ({ data }) => {
    const { generateText } = await import("./gateway.server");
    try {
      const text = await generateText([
        {
          role: "system",
          content: "Reply with a 2-5 word title only. No quotes, no punctuation at the end.",
        },
        { role: "user", content: data.firstMessage.slice(0, 500) },
      ]);
      return { title: text.replace(/["']/g, "").slice(0, 60) };
    } catch {
      return { title: data.firstMessage.slice(0, 40) };
    }
  });
