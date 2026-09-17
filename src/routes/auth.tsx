import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { StarField } from "@/components/site/StarField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BRAND } from "@/lib/brand";

type Mode = "login" | "signup" | "reset";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode } => {
    const raw = search["mode"];
    return { mode: raw === "signup" || raw === "reset" ? (raw as Mode) : "login" };
  },
  head: () => ({
    meta: [
      { title: "Sign in or create an account — ALL-IN-1 AI" },
      {
        name: "description",
        content:
          "Create your free ALL-IN-1 AI account to use chat, images, code, games, files, research, voice and agents. No credits, no paywalls.",
      },
      { property: "og:title", content: "Sign in — ALL-IN-1 AI" },
      {
        property: "og:description",
        content: "One free account for every ALL-IN-1 AI tool.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  useEffect(() => {
    if (session) void navigate({ to: "/app", replace: true });
  }, [session, navigate]);

  const setMode = (next: Mode) => {
    setSent(null);
    void navigate({ to: "/auth", search: { mode: next } });
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3) {
          toast.error("Pick a username with at least 3 characters.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: cleanUsername,
              display_name: displayName.trim() || cleanUsername,
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent("confirm");
          return;
        }
        toast.success("Welcome to ALL-IN-1 AI.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="galaxy-backdrop relative flex min-h-screen items-center justify-center px-4 py-12">
      <StarField />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link to="/" aria-label={`${BRAND.product} home`}>
            <Logo />
          </Link>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {BRAND.subSlogan}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {mode === "signup"
              ? "Create your free account"
              : mode === "login"
                ? "Log in"
                : "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Every tool, free for everyone. No credits, no paywalls."
              : mode === "login"
                ? "Pick up exactly where you left off."
                : "We'll email you a link to choose a new password."}
          </p>

          {sent ? (
            <div className="mt-6 rounded-xl border border-glass-border bg-background/40 p-4 text-sm text-muted-foreground">
              {sent === "confirm"
                ? `Check ${email} for a confirmation link to finish creating your account.`
                : `Check ${email} for your password reset link.`}
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="nova"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Nova Carter"
                      autoComplete="name"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              {mode !== "reset" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={8}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "Working…"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "login"
                      ? "Log in"
                      : "Send reset link"}
              </Button>
            </form>
          )}

          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            {mode === "login" && (
              <>
                <button className="hover:text-foreground" onClick={() => setMode("reset")}>
                  Forgot your password?
                </button>
                <p>
                  New here?{" "}
                  <button
                    className="text-foreground underline underline-offset-4"
                    onClick={() => setMode("signup")}
                  >
                    Create a free account
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p>
                Already have an account?{" "}
                <button
                  className="text-foreground underline underline-offset-4"
                  onClick={() => setMode("login")}
                >
                  Log in
                </button>
              </p>
            )}
            {mode === "reset" && (
              <button className="hover:text-foreground" onClick={() => setMode("login")}>
                Back to log in
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-4">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
