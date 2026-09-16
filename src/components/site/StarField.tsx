import { useMemo } from "react";

type StarFieldProps = {
  density?: number;
  className?: string;
};

// Deterministic pseudo-random so SSR and client markup match exactly.
function seeded(index: number, salt: number) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function StarField({ density = 70, className = "" }: StarFieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: density }, (_, i) => ({
        left: seeded(i, 1) * 100,
        top: seeded(i, 2) * 100,
        size: 1 + seeded(i, 3) * 2,
        delay: seeded(i, 4) * 6,
        opacity: 0.25 + seeded(i, 5) * 0.6,
      })),
    [density],
  );

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 animate-drift">
        {stars.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-foreground animate-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute -left-32 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute -right-24 top-1/4 h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-15%] left-1/3 h-[26rem] w-[26rem] rounded-full bg-nebula/20 blur-[130px] animate-pulse-glow" />
    </div>
  );
}
