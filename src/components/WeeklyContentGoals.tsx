import React, { useState } from "react";
import { CheckCircle2, Minus, Plus, Target, Trash2, X } from "lucide-react";
import { ChannelFilter, ContentCard, PlatformKey, WeeklyGoal } from "../types";
import { WindowFrame } from "./WindowFrame";

interface WeeklyContentGoalsProps {
  goals: WeeklyGoal[];
  cards: ContentCard[];
  selectedChannel: ChannelFilter;
  onUpdateGoal: (updated: WeeklyGoal) => void;
  onAddGoal: (goal: WeeklyGoal) => void;
  onDeleteGoal: (id: string) => void;
}

const PLATFORMS: PlatformKey[] = [
  "YouTube",
  "Instagram",
  "LinkedIn",
  "Substack",
  "Reddit",
];

export const WeeklyContentGoals: React.FC<WeeklyContentGoalsProps> = ({
  goals,
  cards,
  selectedChannel,
  onUpdateGoal,
  onAddGoal,
  onDeleteGoal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatform, setNewPlatform] = useState<PlatformKey>(
    selectedChannel === "All Channels" ? "YouTube" : selectedChannel
  );
  const [newLabel, setNewLabel] = useState("");
  const [newTarget, setNewTarget] = useState(2);

  const visibleGoals =
    selectedChannel === "All Channels"
      ? goals
      : goals.filter((g) => g.platform === selectedChannel);

  const goalStats = visibleGoals.map((goal) => {
    const platformCards = cards.filter((c) => c.platform === goal.platform);
    const publishedCount = platformCards.filter(
      (c) => c.status === "Published"
    ).length;
    const plannedCount = platformCards.length;
    const pct =
      goal.targetCount > 0
        ? Math.min(100, Math.round((publishedCount / goal.targetCount) * 100))
        : 0;
    const met = goal.targetCount > 0 && publishedCount >= goal.targetCount;
    return { goal, publishedCount, plannedCount, pct, met };
  });

  const totalPublished = goalStats.reduce(
    (sum, s) => sum + s.publishedCount,
    0
  );
  const totalTarget = goalStats.reduce(
    (sum, s) => sum + s.goal.targetCount,
    0
  );
  const overallPct =
    totalTarget > 0
      ? Math.min(100, Math.round((totalPublished / totalTarget) * 100))
      : 0;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeTarget = Math.max(1, Number(newTarget) || 1);
    const label = newLabel.trim() || `${newPlatform} Posts`;
    onAddGoal({
      id: `goal-${Date.now()}`,
      platform: newPlatform,
      label,
      targetCount: safeTarget,
    });
    setNewLabel("");
    setNewTarget(2);
    setShowAddForm(false);
  };

  return (
    <WindowFrame
      title={`Weekly Content Goals // ${selectedChannel}`}
      badge={`${totalPublished}/${totalTarget} PUBLISHED (${overallPct}%)`}
      headerRight={
        <button
          onClick={() => {
            setNewPlatform(
              selectedChannel === "All Channels" ? "YouTube" : selectedChannel
            );
            setShowAddForm((v) => !v);
          }}
          className="px-2 py-0.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border border-[#111111] shadow-[1px_1px_0px_#111111] font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
        >
          {showAddForm ? (
            <>
              <X className="w-3 h-3" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Plus className="w-3 h-3" />
              <span>Add Goal</span>
            </>
          )}
        </button>
      }
    >
      <div className="p-3 bg-[#F9F6F0] space-y-2.5">
        {/* Overall Weekly Target Progress Bar */}
        <div className="border-2 border-[#111111] bg-white p-2.5 shadow-[2px_2px_0px_#111111] space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <span className="font-extrabold text-[#111111] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#03AA5C]" />
              <span>OVERALL WEEKLY PUBLISHING TARGET</span>
            </span>
            <span className="font-black tabular-nums text-[#111111]">
              {totalPublished} / {totalTarget} PUBLISHED{" "}
              <span className="text-[#03AA5C]">({overallPct}%)</span>
            </span>
          </div>
          <div className="w-full h-3 bg-[#F9F6F0] border border-[#111111] p-[1px]">
            <div
              className={`h-full transition-all duration-200 ${
                totalTarget > 0 && totalPublished >= totalTarget
                  ? "bg-[#03AA5C]"
                  : "bg-[#111111]"
              }`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="font-mono text-[10px] text-[#111111]/70">
            Progress updates automatically whenever any planner card&apos;s
            status is moved to <strong>Published</strong>.
          </div>
        </div>

        {/* Add New Goal Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="border-2 border-[#111111] bg-[#FFC0D0]/40 p-2.5 flex flex-wrap items-end gap-2 font-mono text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold mb-1">
                Platform
              </label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as PlatformKey)}
                className="bg-white border border-[#111111] px-2 py-1 text-xs font-bold text-[#111111] outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-bold mb-1">
                Goal Label
              </label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., 3 YouTube Videos"
                className="w-full bg-white border border-[#111111] px-2 py-1 text-xs text-[#111111] outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1">Target</label>
              <input
                type="number"
                min={1}
                max={99}
                value={newTarget}
                onChange={(e) =>
                  setNewTarget(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-16 bg-white border border-[#111111] px-2 py-1 text-xs font-bold text-[#111111] outline-none tabular-nums"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-[#03AA5C] hover:bg-[#028f4d] text-white border border-[#111111] font-bold text-xs cursor-pointer shadow-[1px_1px_0px_#111111]"
            >
              Save Goal
            </button>
          </form>
        )}

        {/* Per-Platform Target Rows */}
        {goalStats.length === 0 ? (
          <div className="border-2 border-dashed border-[#111111] bg-white p-4 text-center font-mono text-xs text-[#111111]/75">
            No weekly goal configured for {selectedChannel}. Click &ldquo;Add
            Goal&rdquo; to set a numerical target.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {goalStats.map(({ goal, publishedCount, plannedCount, pct, met }) => (
              <div
                key={goal.id}
                className={`border-2 border-[#111111] p-2.5 space-y-2 shadow-[2px_2px_0px_#111111] ${
                  met ? "bg-[#77FCA4]/45" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="bg-[#111111] text-[#F78DA7] px-1.5 py-0.5 font-bold shrink-0">
                      {goal.platform.toUpperCase()}
                    </span>
                    {met && (
                      <span className="bg-[#03AA5C] text-white px-1 py-0.5 border border-[#111111] font-bold flex items-center gap-0.5 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>MET</span>
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    title="Remove goal"
                    className="text-[#111111]/50 hover:text-red-600 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Editable Label + Target Stepper */}
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={goal.label}
                    onChange={(e) =>
                      onUpdateGoal({ ...goal, label: e.target.value })
                    }
                    className="flex-1 min-w-0 bg-transparent text-xs font-extrabold text-[#111111] border-b border-transparent focus:border-[#111111] outline-none truncate"
                  />
                  <div className="flex items-center border border-[#111111] bg-[#F9F6F0] shrink-0 font-mono">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateGoal({
                          ...goal,
                          targetCount: Math.max(1, goal.targetCount - 1),
                        })
                      }
                      aria-label={`Decrease ${goal.label} target`}
                      className="px-1.5 py-0.5 hover:bg-[#FFC0D0] border-r border-[#111111] cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={goal.targetCount}
                      onChange={(e) =>
                        onUpdateGoal({
                          ...goal,
                          targetCount: Math.max(
                            1,
                            Number(e.target.value) || 1
                          ),
                        })
                      }
                      className="w-9 text-center bg-white text-xs font-black text-[#111111] outline-none tabular-nums py-0.5"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateGoal({
                          ...goal,
                          targetCount: goal.targetCount + 1,
                        })
                      }
                      aria-label={`Increase ${goal.label} target`}
                      className="px-1.5 py-0.5 hover:bg-[#77FCA4] border-l border-[#111111] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-[#F9F6F0] border border-[#111111] p-[1px]">
                    <div
                      className={`h-full transition-all duration-200 ${
                        met ? "bg-[#03AA5C]" : "bg-[#111111]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] font-bold tabular-nums">
                    <span className={met ? "text-[#03AA5C]" : "text-[#111111]"}>
                      {publishedCount} / {goal.targetCount} published ({pct}%)
                    </span>
                    <span className="text-[#111111]/65">
                      {plannedCount} in pipeline
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WindowFrame>
  );
};
