import type { SupabaseClient } from "@supabase/supabase-js";
import { AiError, type Capability } from "./gateway.server";

// Fair use only — no credits, tokens or paywalls anywhere in ALL-IN-1 AI.
const PER_MINUTE = 20;
const PER_DAY = 400;

export async function enforceFairUse(
  supabase: SupabaseClient,
  userId: string,
  capability: Capability,
) {
  const now = Date.now();
  const minuteAgo = new Date(now - 60_000).toISOString();
  const dayAgo = new Date(now - 86_400_000).toISOString();

  const [{ count: minuteCount }, { count: dayCount }] = await Promise.all([
    supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", minuteAgo),
    supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", dayAgo),
  ]);

  if ((minuteCount ?? 0) >= PER_MINUTE) {
    throw new AiError(
      "You're going fast! Fair-use limit reached — wait about a minute and keep going. Still completely free.",
      429,
    );
  }
  if ((dayCount ?? 0) >= PER_DAY) {
    throw new AiError(
      "You've hit today's fair-use allowance. It resets on a rolling 24-hour basis — no payment needed, ever.",
      429,
    );
  }

  await supabase.from("usage_events").insert({ user_id: userId, capability });
}
