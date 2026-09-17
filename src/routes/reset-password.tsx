import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { StarField } from "@/components/site/StarField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — ALL-IN-1 AI" },
      { name: "description", content: "Set a new password for your ALL-IN-1 AI account." },
      { property: "og:title", content: "Choose a new password — ALL-IN-1 AI" },
      { property: "og:description", content: "Set a new password for your account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      toast.error("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      void navigate({ to: "/app", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="galaxy-backdrop relative flex min-h-screen items-center justify-center px-4 py-12">
      <StarField />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className="glass-panel rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Choose a new password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Open this page from the link in your reset email, then pick a new password.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
