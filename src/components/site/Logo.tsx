import { cn } from "@/lib/utils";

export function Logo({
  className,
  withWordmark = true,
  size = "md",
}: {
  className?: string;
  withWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-xl bg-gradient-to-br from-accent/80 via-primary to-nebula font-display font-bold text-primary-foreground",
          box,
          text,
        )}
      >
        <span className="absolute inset-0 rounded-xl blur-md bg-primary/50" aria-hidden="true" />
        <span className="relative">A1</span>
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-semibold tracking-tight", text)}>ALL-IN-1 AI</span>
          <span className="mt-0.5 text-[0.6rem] font-medium tracking-[0.18em] text-muted-foreground">
            ONE AI. EVERYTHING.
          </span>
        </span>
      ) : null}
    </span>
  );
}
