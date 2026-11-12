import React, { useMemo } from "react";
import { ArrowUpRight, Flame, Plus, Radio, TrendingUp } from "lucide-react";
import { ContentCard, DayOfWeek } from "../types";
import { WindowFrame } from "./WindowFrame";

interface DailyPulseProps {
  cards: ContentCard[];
  onSelectCard: (card: ContentCard) => void;
  onScheduleToday?: (today: DayOfWeek) => void;
}

const JS_DAY_TO_KEY: DayOfWeek[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export function parseEstimatedReach(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.trim().toLowerCase().replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*([km])?/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  if (Number.isNaN(value)) return 0;
  const suffix = match[2];
  if (suffix === "m") return Math.round(value * 1_000_000);
  if (suffix === "k") return Math.round(value * 1_000);
  return Math.round(value);
}

function formatCompactReach(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export const DailyPulse: React.FC<DailyPulseProps> = ({
  cards,
  onSelectCard,
  onScheduleToday,
}) => {
  const now = new Date();
  const todayKey: DayOfWeek = JS_DAY_TO_KEY[now.getDay()];
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const rankedTodayCards = useMemo(() => {
    return cards
      .filter((c) => c.day === todayKey)
      .map((card) => ({
        card,
        numericReach: parseEstimatedReach(card.estReach),
      }))
      .sort((a, b) => b.numericReach - a.numericReach);
  }, [cards, todayKey]);

  const totalTodayReach = useMemo(
    () => rankedTodayCards.reduce((sum, item) => sum + item.numericReach, 0),
    [rankedTodayCards]
  );

  const topEntry = rankedTodayCards[0] || null;
  const readyCount = rankedTodayCards.filter(
    ({ card }) => card.status === "Ready" || card.status === "Published"
  ).length;

  return (
    <WindowFrame
      title={`Daily Pulse // Today (${todayKey.toUpperCase()} · ${formattedDate.toUpperCase()})`}
      badge={`${rankedTodayCards.length} SCHEDULED`}
      headerRight={
        onScheduleToday ? (
          <button
            onClick={() => onScheduleToday(todayKey)}
            className="px-2 py-0.5 border border-[#111111] bg-[#03AA5C] hover:bg-[#028f4d] text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-[1px_1px_0px_#111111]"
          >
            <Plus className="w-3 h-3" />
            <span>Add Today</span>
          </button>
        ) : undefined
      }
    >
      {rankedTodayCards.length === 0 ? (
        <div className="p-4 bg-[#F9F6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-mono text-xs font-bold text-[#111111] flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#03AA5C]" />
              <span>No content cards scheduled for {todayKey}</span>
            </div>
            <p className="text-xs text-[#111111]/75">
              Assign a card&apos;s day to {todayKey} or schedule one now to rank
              cross-platform reach priority.
            </p>
          </div>
          {onScheduleToday && (
            <button
              onClick={() => onScheduleToday(todayKey)}
              className="px-3 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-extrabold uppercase shrink-0 cursor-pointer"
            >
              + Schedule {todayKey} Card
            </button>
          )}
        </div>
      ) : (
        <div className="p-3 bg-[#F9F6F0] space-y-2.5">
          {/* Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs tabular-nums">
            <div className="border-2 border-[#111111] bg-white p-2.5 flex items-center justify-between shadow-[2px_2px_0px_#111111]">
              <div>
                <div className="text-[10px] text-[#111111]/70 font-bold uppercase">
                  Today Est. Reach (All Platforms)
                </div>
                <div className="text-xl font-black text-[#03AA5C] mt-0.5">
                  {formatCompactReach(totalTodayReach)}
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-[#03AA5C]" />
            </div>

            <div className="border-2 border-[#111111] bg-white p-2.5 flex items-center justify-between shadow-[2px_2px_0px_#111111]">
              <div className="min-w-0 pr-2">
                <div className="text-[10px] text-[#111111]/70 font-bold uppercase">
                  Lead Platform Today
                </div>
                <div className="text-sm font-black text-[#111111] mt-0.5 truncate">
                  {topEntry.card.platform} ({topEntry.card.code})
                </div>
              </div>
              <Flame className="w-4 h-4 text-[#111111] shrink-0" />
            </div>

            <div className="border-2 border-[#111111] bg-[#77FCA4] p-2.5 flex items-center justify-between shadow-[2px_2px_0px_#111111]">
              <div>
                <div className="text-[10px] text-[#111111] font-bold uppercase">
                  Dispatch Readiness
                </div>
                <div className="text-sm font-black text-[#111111] mt-0.5">
                  {readyCount}/{rankedTodayCards.length} Ready
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white border border-[#111111] px-1.5 py-0.5">
                {rankedTodayCards[0].card.scheduledTime}
              </span>
            </div>
          </div>

          {/* Ranked Cards for Today */}
          <div className="space-y-2">
            {rankedTodayCards.map(({ card, numericReach }, idx) => {
              const sharePct =
                totalTodayReach > 0
                  ? Math.round((numericReach / totalTodayReach) * 100)
                  : 0;
              const isLeader = idx === 0;
              const completedShots = card.shotList.filter(
                (s) => s.completed
              ).length;
              const wordCount = card.script
                ? card.script.trim().split(/\s+/).length
                : 0;

              return (
                <button
                  key={card.id}
                  onClick={() => onSelectCard(card)}
                  className={`w-full text-left border-2 border-[#111111] p-2.5 transition-colors cursor-pointer group shadow-[2px_2px_0px_#111111] ${
                    isLeader
                      ? "bg-white hover:bg-[#FFC0D0]/40"
                      : "bg-white hover:bg-[#FFC0D0]/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 font-extrabold tabular-nums border border-[#111111] ${
                          isLeader
                            ? "bg-[#111111] text-[#77FCA4]"
                            : "bg-[#FFC0D0] text-[#111111]"
                        }`}
                      >
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="bg-[#111111] text-white text-[10px] font-bold px-1.5 py-0.5">
                        [{card.code}]
                      </span>
                      <span className="text-[#111111] font-extrabold">
                        {card.platform}
                      </span>
                      <span className="text-[#111111]/40">·</span>
                      <span className="text-[#111111]/80 font-bold">
                        {card.scheduledTime}
                      </span>
                      <span className="text-[#111111]/40">·</span>
                      <span
                        className={`px-1.5 py-0.2 border border-[#111111] text-[9px] font-bold ${
                          card.status === "Ready" || card.status === "Published"
                            ? "bg-[#77FCA4] text-[#111111]"
                            : "bg-[#FFC0D0] text-[#111111]"
                        }`}
                      >
                        {card.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 tabular-nums">
                      <span className="font-extrabold text-[#111111]">
                        {card.estReach || "TBD"}
                      </span>
                      {sharePct > 0 && (
                        <span className="text-[10px] font-bold bg-[#03AA5C] text-white px-1 border border-[#111111]">
                          {sharePct}%
                        </span>
                      )}
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#111111]" />
                    </div>
                  </div>

                  <div className="mt-1.5 text-sm font-bold text-[#111111] group-hover:underline">
                    {card.title}
                  </div>

                  {card.selectedHook && (
                    <p className="mt-1 text-xs font-mono text-[#111111]/80 truncate">
                      Hook: &ldquo;{card.selectedHook}&rdquo;
                    </p>
                  )}

                  {/* Reach Proportion Bar + Readiness Metadata */}
                  <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-[#111111]/80 font-bold">
                    <div className="flex-1 h-2 bg-[#F9F6F0] border border-[#111111] p-[1px]">
                      <div
                        className={`h-full ${
                          isLeader ? "bg-[#03AA5C]" : "bg-[#111111]"
                        }`}
                        style={{ width: `${Math.max(sharePct, 4)}%` }}
                      />
                    </div>
                    <span className="tabular-nums shrink-0">
                      Shots {completedShots}/{card.shotList.length} · Script{" "}
                      {wordCount}w
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </WindowFrame>
  );
};
