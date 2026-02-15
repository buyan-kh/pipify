interface PnLCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
}

export function PnLCard({ title, value, subtitle, trend }: PnLCardProps) {
  const trendColor =
    trend === "up"
      ? "text-[var(--color-success)]"
      : trend === "down"
        ? "text-[var(--color-danger)]"
        : "text-[var(--color-foreground)]";

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
      <p className="text-sm text-[var(--color-muted)] font-medium">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${trendColor}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-[var(--color-muted)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}
