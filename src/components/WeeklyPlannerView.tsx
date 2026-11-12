import React, { useState } from "react";
import { Calendar, Film, Layers, Plus, Sparkles, X } from "lucide-react";
import {
  ChannelFilter,
  ContentCard,
  ContentStatus,
  DayOfWeek,
  PlatformKey,
} from "../types";
import { WindowFrame } from "./WindowFrame";

interface WeeklyPlannerViewProps {
  cards: ContentCard[];
  selectedChannel: ChannelFilter;
  defaultView?: "weave" | "grid";
  onSelectCard: (card: ContentCard) => void;
  onAddCard: (card: ContentCard) => void;
  onChangeStatus?: (cardId: string, status: ContentStatus) => void;
}

const DAYS: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PLATFORMS: PlatformKey[] = [
  "YouTube",
  "Instagram",
  "LinkedIn",
  "Substack",
  "Reddit",
];
const STATUSES: ContentStatus[] = [
  "Idea",
  "Researching",
  "Scripting",
  "Recording",
  "Ready",
  "Published",
];

function platformCodePrefix(p: PlatformKey): string {
  switch (p) {
    case "YouTube":
      return "YT";
    case "Instagram":
      return "IG";
    case "LinkedIn":
      return "LI";
    case "Substack":
      return "SB";
    case "Reddit":
      return "RD";
  }
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  cards,
  selectedChannel,
  defaultView = "weave",
  onSelectCard,
  onAddCard,
  onChangeStatus,
}) => {
  const [viewMode, setViewMode] = useState<"weave" | "grid">(defaultView);
  const [showNewModal, setShowNewModal] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newPlatform, setNewPlatform] = useState<PlatformKey>(
    selectedChannel === "All Channels" ? "YouTube" : selectedChannel
  );
  const [newDay, setNewDay] = useState<DayOfWeek>("Wed");
  const [newTime, setNewTime] = useState("14:00 UTC");
  const [newStatus, setNewStatus] = useState<ContentStatus>("Idea");
  const [newTopic, setNewTopic] = useState("#system-dynamics");
  const [newEstReach, setNewEstReach] = useState("65K views");
  const [newNotes, setNewNotes] = useState("");

  const filteredCards =
    selectedChannel === "All Channels"
      ? cards
      : cards.filter((c) => c.platform === selectedChannel);

  const handleOpenNewModal = () => {
    setNewPlatform(
      selectedChannel === "All Channels" ? "YouTube" : selectedChannel
    );
    setShowNewModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const prefix = platformCodePrefix(newPlatform);
    const num = Math.floor(100 + Math.random() * 899);
    const card: ContentCard = {
      id: `card-${Date.now()}`,
      code: `${prefix}-${num}`,
      platform: newPlatform,
      day: newDay,
      scheduledTime: newTime || "12:00 UTC",
      status: newStatus,
      title: newTitle.trim(),
      topicTag: newTopic.trim() || "#systems",
      researchNotes: newNotes.trim(),
      referenceLinks: [],
      shotList: [],
      hooks: [],
      selectedHook: "",
      script: "",
      caption: "",
      estReach: newEstReach.trim() || "TBD",
    };
    onAddCard(card);
    setNewTitle("");
    setNewNotes("");
    setNewEstReach("65K views");
    setShowNewModal(false);
    onSelectCard(card);
  };

  return (
    <>
      <WindowFrame
        title={`Weekly Planner // ${selectedChannel}`}
        badge={`${filteredCards.length} NODES`}
        headerRight={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("weave")}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold border border-[#111111] cursor-pointer flex items-center gap-1 ${
                viewMode === "weave"
                  ? "bg-[#111111] text-[#F78DA7]"
                  : "bg-white text-[#111111] hover:bg-[#FFC0D0]"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>WEAVE</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold border border-[#111111] cursor-pointer flex items-center gap-1 ${
                viewMode === "grid"
                  ? "bg-[#111111] text-[#F78DA7]"
                  : "bg-white text-[#111111] hover:bg-[#FFC0D0]"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>7-DAY</span>
            </button>
            <button
              onClick={handleOpenNewModal}
              className="px-2 py-0.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border border-[#111111] font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-[1px_1px_0px_#111111]"
            >
              <Plus className="w-3 h-3" />
              <span>NEW NODE</span>
            </button>
          </div>
        }
      >
        {filteredCards.length === 0 ? (
          <div className="p-8 text-center space-y-3 bg-[#F9F6F0]">
            <div className="font-mono text-sm font-black text-[#111111]">
              No scheduled content for {selectedChannel}
            </div>
            <p className="text-xs text-[#111111]/75">
              Create a new content node to populate research notes, shot lists,
              hooks, and scripts.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2 bg-[#03AA5C] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
            >
              + Create {selectedChannel} Card
            </button>
          </div>
        ) : viewMode === "weave" ? (
          <div className="divide-y-2 divide-[#111111]">
            {filteredCards.map((card, index) => {
              const completedShots = card.shotList.filter(
                (s) => s.completed
              ).length;
              const isZebra = index % 2 === 0;
              return (
                <div
                  key={card.id}
                  onClick={() => onSelectCard(card)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelectCard(card);
                  }}
                  className={`p-3 transition-colors cursor-pointer group ${
                    isZebra
                      ? "bg-[#F9F6F0] hover:bg-[#FFC0D0]/30"
                      : "bg-white hover:bg-[#FFC0D0]/30"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1.5 border-b border-[#111111]/25 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="bg-[#111111] text-white font-bold px-1.5 py-0.5">
                        [{card.code}]
                      </span>
                      {onChangeStatus ? (
                        <select
                          aria-label={`Status for ${card.code}`}
                          value={card.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onChangeStatus(
                              card.id,
                              e.target.value as ContentStatus
                            );
                          }}
                          className={`px-1.5 py-0.5 border border-[#111111] text-[9px] font-bold uppercase cursor-pointer outline-none ${
                            card.status === "Published"
                              ? "bg-[#03AA5C] text-white"
                              : card.status === "Ready"
                                ? "bg-[#77FCA4] text-[#111111]"
                                : "bg-[#FFC0D0] text-[#111111]"
                          }`}
                        >
                          {STATUSES.map((s) => (
                            <option
                              key={s}
                              value={s}
                              className="bg-white text-[#111111]"
                            >
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`px-1.5 py-0.5 border border-[#111111] text-[9px] font-bold ${
                            card.status === "Ready" ||
                            card.status === "Published"
                              ? "bg-[#77FCA4] text-[#111111]"
                              : "bg-[#FFC0D0] text-[#111111]"
                          }`}
                        >
                          ● {card.status.toUpperCase()}
                        </span>
                      )}
                      <span className="font-bold text-[#111111]">
                        {card.platform}
                      </span>
                      <span className="text-[#111111]/70 font-bold">
                        {card.day.toUpperCase()} {card.scheduledTime}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold bg-white border border-[#111111] px-1.5 py-0.5 tabular-nums">
                      EST: <span className="text-[#03AA5C]">{card.estReach}</span>
                    </span>
                  </div>

                  <h3 className="mt-1.5 font-sans text-sm font-bold text-[#111111] leading-snug group-hover:underline">
                    {card.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-mono font-bold">
                    <span className="px-1.5 py-0.5 bg-[#111111] text-[#F78DA7] border border-[#111111]">
                      SHOTLIST ({completedShots}/{card.shotList.length})
                    </span>
                    <span className="px-1.5 py-0.5 bg-white border border-[#111111]">
                      HOOKS ({card.hooks.length})
                    </span>
                    <span className="px-1.5 py-0.5 bg-white border border-[#111111]">
                      SCRIPT:{" "}
                      {card.script
                        ? `${card.script.split(/\s+/).length}W`
                        : "EMPTY"}
                    </span>
                    <span className="ml-auto text-[#03AA5C] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>OPEN DRAWER →</span>
                    </span>
                  </div>

                  {card.selectedHook && (
                    <div className="mt-1.5 border border-[#111111] bg-white px-2 py-1 text-[10px] font-mono text-[#111111] truncate">
                      <span className="font-extrabold text-[#03AA5C] mr-1.5">
                        Hook:
                      </span>
                      &ldquo;{card.selectedHook}&rdquo;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#111111] bg-[#F9F6F0]">
            {DAYS.map((day) => {
              const dayCards = filteredCards.filter((c) => c.day === day);
              return (
                <div key={day} className="min-h-[260px] flex flex-col">
                  <div className="px-2.5 py-2 border-b-2 border-[#111111] bg-[#FFC0D0] flex items-center justify-between font-mono text-xs">
                    <span className="font-black text-[#111111] uppercase">
                      {day}
                    </span>
                    <span className="text-[10px] font-bold bg-white border border-[#111111] px-1 tabular-nums">
                      {dayCards.length}
                    </span>
                  </div>
                  <div className="p-2 space-y-2 flex-1">
                    {dayCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => onSelectCard(card)}
                        className="w-full text-left border-2 border-[#111111] bg-white hover:bg-[#FFC0D0]/40 p-2 space-y-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#111111]"
                      >
                        <div className="flex items-center justify-between gap-1 font-mono text-[10px]">
                          <span className="bg-[#111111] text-[#F78DA7] px-1 font-bold">
                            {card.code}
                          </span>
                          <span className="font-bold text-[#111111] truncate">
                            {card.platform}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#111111] line-clamp-3 leading-snug">
                          {card.title}
                        </div>
                        <div className="pt-1 border-t border-[#111111]/25 flex items-center justify-between font-mono text-[10px]">
                          <span className="flex items-center gap-1 font-bold">
                            <Film className="w-3 h-3" />
                            {card.shotList.length}
                          </span>
                          <span className="font-extrabold text-[#03AA5C]">
                            {card.status}
                          </span>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setNewDay(day);
                        handleOpenNewModal();
                      }}
                      className="w-full py-1.5 border border-dashed border-[#111111] bg-white/70 hover:bg-[#77FCA4] text-[10px] font-mono font-bold text-[#111111] cursor-pointer"
                    >
                      + Add {day}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </WindowFrame>

      {/* New Content Card Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111]"
          >
            <div className="px-4 py-2.5 border-b-2 border-[#111111] bg-[#FFC0D0] flex items-center justify-between">
              <span className="font-mono text-xs font-black uppercase text-[#111111]">
                Create Weekly Content Node
              </span>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-0.5 border border-[#111111] bg-white text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3 text-xs bg-[#F9F6F0]">
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                  Working Title
                </label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Thermal Limits of Closed-Cycle LOX Turbopumps"
                  className="w-full bg-white border-2 border-[#111111] px-3 py-2 text-sm text-[#111111] outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) =>
                      setNewPlatform(e.target.value as PlatformKey)
                    }
                    className="w-full bg-white border-2 border-[#111111] px-2 py-2 font-mono text-xs text-[#111111] outline-none"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                    Day
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                    className="w-full bg-white border-2 border-[#111111] px-2 py-2 font-mono text-xs text-[#111111] outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) =>
                      setNewStatus(e.target.value as ContentStatus)
                    }
                    className="w-full bg-white border-2 border-[#111111] px-2 py-2 font-mono text-xs text-[#111111] outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                    Scheduled Time
                  </label>
                  <input
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white border-2 border-[#111111] px-2.5 py-1.5 font-mono text-xs text-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                    Topic Tag
                  </label>
                  <input
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full bg-white border-2 border-[#111111] px-2.5 py-1.5 font-mono text-xs text-[#111111] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                    Est. Reach
                  </label>
                  <input
                    value={newEstReach}
                    onChange={(e) => setNewEstReach(e.target.value)}
                    placeholder="e.g. 90K views"
                    className="w-full bg-white border-2 border-[#111111] px-2.5 py-1.5 font-mono text-xs font-bold text-[#03AA5C] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                  Initial Research Notes / Merlin Summary
                </label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Drop raw notes, equations, or research links..."
                  className="w-full bg-white border-2 border-[#111111] p-2.5 font-mono text-xs text-[#111111] outline-none"
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t-2 border-[#111111] bg-white flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 border border-[#111111] bg-white hover:bg-[#FFC0D0] text-xs font-mono font-bold text-[#111111] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
              >
                Create & Open Drawer
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
