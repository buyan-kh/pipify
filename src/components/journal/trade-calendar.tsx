"use client";

import { useState } from "react";
import type { Trade } from "@/lib/types";

interface TradeCalendarProps {
  trades: Trade[];
}

interface DayData {
  pnl: number;
  count: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function groupTradesByDay(trades: Trade[]): Map<string, DayData> {
  const map = new Map<string, DayData>();
  for (const t of trades) {
    if (!t.closed_at) continue;
    const dateKey = t.closed_at.slice(0, 10); // YYYY-MM-DD
    const existing = map.get(dateKey) || { pnl: 0, count: 0 };
    existing.pnl += Number(t.profit) || 0;
    existing.count += 1;
    map.set(dateKey, existing);
  }
  return map;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function TradeCalendar({ trades }: TradeCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const dayMap = groupTradesByDay(trades);
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Previous month days for padding
  const prevMonthDays = getDaysInMonth(year, month - 1);

  function prevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  }

  const fmt = (n: number) => {
    if (Math.abs(n) >= 1000) {
      return `${n >= 0 ? "+" : ""}$${(n / 1000).toFixed(1)}k`;
    }
    return `${n >= 0 ? "+" : ""}$${n.toFixed(0)}`;
  };

  // Build calendar grid cells
  const cells: Array<{
    day: number;
    isCurrentMonth: boolean;
    dateKey: string;
    data: DayData | null;
  }> = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, isCurrentMonth: false, dateKey, data: dayMap.get(dateKey) || null });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, isCurrentMonth: true, dateKey, data: dayMap.get(dateKey) || null });
  }

  // Next month padding to fill the last row
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, isCurrentMonth: false, dateKey, data: dayMap.get(dateKey) || null });
    }
  }

  const isToday = (dateKey: string) => {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return dateKey === today;
  };

  return (
    <div
      className="bg-white rounded-xl border border-[var(--color-border)] p-6 shadow-sm animate-card-in mb-8"
      style={{ animationDelay: "240ms" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Trade Calendar
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-slate-50 text-[var(--color-muted)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-[var(--color-foreground)] min-w-[140px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg border border-[var(--color-border)] flex items-center justify-center hover:bg-slate-50 text-[var(--color-muted)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] py-1.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const hasTrades = cell.data && cell.data.count > 0;
          const isProfit = hasTrades && cell.data!.pnl > 0;
          const isLoss = hasTrades && cell.data!.pnl < 0;

          let bgClass = "";
          if (!cell.isCurrentMonth) {
            bgClass = "bg-slate-50/50";
          } else if (isProfit) {
            bgClass = "bg-emerald-50 border-emerald-100";
          } else if (isLoss) {
            bgClass = "bg-red-50 border-red-100";
          }

          return (
            <div
              key={i}
              className={`min-h-[72px] rounded-lg border border-transparent p-1.5 ${bgClass} ${
                !cell.isCurrentMonth ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`text-[11px] font-medium ${
                    isToday(cell.dateKey)
                      ? "w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px]"
                      : cell.isCurrentMonth
                        ? "text-[var(--color-foreground)]"
                        : "text-[var(--color-muted)]"
                  }`}
                >
                  {cell.day}
                </span>
                {hasTrades && (
                  <span className="text-[9px] text-[var(--color-muted)]">
                    {cell.data!.count} trade{cell.data!.count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              {hasTrades && (
                <p
                  className={`text-[11px] font-bold tabular ${
                    isProfit
                      ? "text-[var(--color-success)]"
                      : isLoss
                        ? "text-[var(--color-danger)]"
                        : "text-[var(--color-muted)]"
                  }`}
                >
                  {fmt(cell.data!.pnl)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
