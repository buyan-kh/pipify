interface PnLCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  accent?: "blue" | "green" | "red" | "amber" | "purple" | "slate";
  delay?: number;
}

export function PnLCard({
  title,
  value,
  subtitle,
  trend,
  accent = "blue",
  delay = 0,
}: PnLCardProps) {
  const trendColor =
    trend === "up"
      ? "text-[var(--color-success)]"
      : trend === "down"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-foreground)]";

  return (
    <div
      className={`bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-${accent} animate-card-in`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">
        {title}
      </p>
      <p className={`text-2xl font-bold tabular ${trendColor}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-[var(--color-muted)] mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}
