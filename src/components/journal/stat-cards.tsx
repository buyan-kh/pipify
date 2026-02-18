import type { Trade } from "@/lib/types";

interface StatCardsProps {
  closedTrades: Trade[];
  totalPnL: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  winCount: number;
  lossCount: number;
  breakEvenCount: number;
}

export function StatCards({
  closedTrades,
  totalPnL,
  winRate,
  profitFactor,
  avgWin,
  avgLoss,
  winCount,
  lossCount,
  breakEvenCount,
}: StatCardsProps) {
  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Build cumulative equity curve for sparkline
  const sorted = [...closedTrades].sort(
    (a, b) =>
      new Date(a.closed_at ?? a.opened_at).getTime() -
      new Date(b.closed_at ?? b.opened_at).getTime()
  );
  const equityPoints: number[] = [];
  let cumulative = 0;
  for (const t of sorted) {
    cumulative += Number(t.profit) || 0;
    equityPoints.push(cumulative);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Net Cumulative P&L */}
      <div
        className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-green animate-card-in"
        style={{ animationDelay: "0ms" }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">
          Net Cumulative P&L
        </p>
        <p
          className={`text-2xl font-bold tabular ${
            totalPnL >= 0
              ? "text-[var(--color-success)]"
              : "text-[var(--color-danger)]"
          }`}
        >
          {totalPnL >= 0 ? "+" : ""}${fmt(totalPnL)}
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          {closedTrades.length} closed trade
          {closedTrades.length !== 1 ? "s" : ""}
        </p>
        {/* Sparkline */}
        <div className="mt-3">
          <Sparkline points={equityPoints} />
        </div>
      </div>

      {/* Profit Factor */}
      <div
        className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-blue animate-card-in"
        style={{ animationDelay: "60ms" }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">
          Profit Factor
        </p>
        <p className="text-2xl font-bold tabular text-[var(--color-foreground)]">
          {profitFactor === Infinity ? "\u221e" : profitFactor.toFixed(2)}
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          Gross win / gross loss
        </p>
        {/* Ring chart */}
        <div className="mt-3 flex justify-center">
          <RingChart value={profitFactor} />
        </div>
      </div>

      {/* Trade Win % */}
      <div
        className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-amber animate-card-in"
        style={{ animationDelay: "120ms" }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">
          Trade Win %
        </p>
        <p className="text-2xl font-bold tabular text-[var(--color-foreground)]">
          {winRate.toFixed(1)}%
        </p>
        <div className="mt-3 flex items-center gap-3">
          <DonutChart
            winCount={winCount}
            lossCount={lossCount}
            breakEvenCount={breakEvenCount}
          />
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
              <span className="text-[var(--color-muted)]">{winCount}W</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
              <span className="text-[var(--color-muted)]">{lossCount}L</span>
            </div>
            {breakEvenCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-[var(--color-muted)]">
                  {breakEvenCount}BE
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avg Win / Loss */}
      <div
        className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-accent-purple animate-card-in"
        style={{ animationDelay: "180ms" }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">
          Avg Win / Loss
        </p>
        <p className="text-2xl font-bold tabular text-[var(--color-foreground)]">
          {avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : avgWin > 0 ? "\u221e" : "0.00"}
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-1">Reward : Risk</p>
        {/* Comparison bars */}
        <div className="mt-3 space-y-2">
          <WinLossBars avgWin={avgWin} avgLoss={avgLoss} />
        </div>
      </div>
    </div>
  );
}

/* ---------- SVG Mini-Charts ---------- */

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) {
    return (
      <div className="h-10 flex items-center justify-center text-[10px] text-[var(--color-muted)]">
        Not enough data
      </div>
    );
  }

  const w = 200;
  const h = 40;
  const padding = 2;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const pathPoints = points.map((val, i) => {
    const x = padding + (i / (points.length - 1)) * (w - padding * 2);
    const y = h - padding - ((val - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });

  const linePath = `M${pathPoints.join(" L")}`;
  const areaPath = `${linePath} L${w - padding},${h} L${padding},${h} Z`;
  const lastVal = points[points.length - 1];
  const color = lastVal >= 0 ? "var(--color-success)" : "var(--color-danger)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

function RingChart({ value }: { value: number }) {
  const size = 56;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cap at 5 for display, normalize to 0-1
  const capped = value === Infinity ? 5 : Math.min(value, 5);
  const ratio = capped / 5;
  const dashOffset = circumference * (1 - ratio);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold"
        fill="var(--color-foreground)"
      >
        {value === Infinity ? "\u221e" : value.toFixed(1)}
      </text>
    </svg>
  );
}

function DonutChart({
  winCount,
  lossCount,
  breakEvenCount,
}: {
  winCount: number;
  lossCount: number;
  breakEvenCount: number;
}) {
  const total = winCount + lossCount + breakEvenCount;
  if (total === 0) {
    return (
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={22} fill="none" stroke="#e2e8f0" strokeWidth={6} />
      </svg>
    );
  }

  const size = 56;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { count: winCount, color: "var(--color-success)" },
    { count: lossCount, color: "var(--color-danger)" },
    { count: breakEvenCount, color: "#cbd5e1" },
  ].filter((s) => s.count > 0);

  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const segLen = (seg.count / total) * circumference;
        const dashOffset = -offset;
        offset += segLen;
        return (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segLen} ${circumference - segLen}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px] font-bold"
        fill="var(--color-foreground)"
      >
        {total}
      </text>
    </svg>
  );
}

function WinLossBars({ avgWin, avgLoss }: { avgWin: number; avgLoss: number }) {
  const maxVal = Math.max(avgWin, avgLoss) || 1;
  const winPct = (avgWin / maxVal) * 100;
  const lossPct = (avgLoss / maxVal) * 100;

  const fmt = (n: number) => n.toFixed(2);

  return (
    <>
      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-[var(--color-success)] font-semibold">Avg Win</span>
          <span className="text-[var(--color-success)] font-semibold tabular">
            +${fmt(avgWin)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-success)]"
            style={{ width: `${winPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-[var(--color-danger)] font-semibold">Avg Loss</span>
          <span className="text-[var(--color-danger)] font-semibold tabular">
            -${fmt(avgLoss)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-danger)]"
            style={{ width: `${lossPct}%` }}
          />
        </div>
      </div>
    </>
  );
}
