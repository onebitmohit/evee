import type { CSSProperties } from "react";

export function MiniBars({ values, label = "Recent activity" }: { values: number[]; label?: string }) {
  const safeValues = values.length ? values : [0, 0, 0, 0, 0, 0];
  const maximum = Math.max(...safeValues, 1);

  return (
    <div className="flex h-10 items-end gap-1" role="img" aria-label={`${label}: ${safeValues.join(", ")}`}>
      {safeValues.map((value, index) => (
        <span
          key={`${index}-${value}`}
          className="w-1.5 rounded-[2px] bg-[var(--text-faint)] transition-colors group-hover:bg-[var(--text-muted)]"
          style={{ height: `${Math.max(10, Math.round((value / maximum) * 100))}%`, opacity: value ? 0.9 : 0.25 }}
        />
      ))}
    </div>
  );
}

export function ScoreRing({ value, size = 72, label = "Score" }: { value: number; size?: number; label?: string }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  const style = {
    width: size,
    height: size,
    background: `conic-gradient(var(--text) ${normalized}%, var(--surface-strong) 0)`,
  } satisfies CSSProperties;

  return (
    <div className="relative grid shrink-0 place-items-center rounded-full" style={style} role="img" aria-label={`${label}: ${normalized} out of 100`}>
      <div className="absolute inset-[5px] rounded-full bg-[var(--surface)]" />
      <span className="relative font-mono text-base font-semibold tracking-[-0.04em]">{normalized}</span>
    </div>
  );
}

export function HorizontalMeter({ value, maximum, label }: { value: number; maximum: number; label: string }) {
  const width = maximum > 0 ? Math.max(value > 0 ? 4 : 0, Math.round((value / maximum) * 100)) : 0;
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-strong)]" role="img" aria-label={`${label}: ${value}`}>
      <div className="h-full rounded-full bg-[var(--text-muted)]" style={{ width: `${width}%` }} />
    </div>
  );
}
