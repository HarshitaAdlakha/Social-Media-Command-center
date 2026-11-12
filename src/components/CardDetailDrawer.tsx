import React, { useState } from "react";
import {
  CheckSquare,
  FileText,
  Film,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  Square,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  ContentCard,
  ContentStatus,
  DayOfWeek,
  HookVariation,
  PlatformKey,
  ResearchNote,
  ShotItem,
} from "../types";

interface CardDetailDrawerProps {
  card: ContentCard;
  voiceDna: string;
  vaultNotes: ResearchNote[];
  onClose: () => void;
  onUpdateCard: (updated: ContentCard) => void;
  onDeleteCard: (id: string) => void;
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

type DrawerSection = "research" | "shots" | "hooks" | "script";

export const CardDetailDrawer: React.FC<CardDetailDrawerProps> = ({
  card,
  voiceDna,
  vaultNotes,
  onClose,
  onUpdateCard,
  onDeleteCard,
}) => {
  const [section, setSection] = useState<DrawerSection>("research");
  const [newLink, setNewLink] = useState("");
  const [newShotDesc, setNewShotDesc] = useState("");
  const [newShotCat, setNewShotCat] = useState("Camera A-Roll");
  const [loadingShots, setLoadingShots] = useState(false);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [loadingScript, setLoadingScript] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (fields: Partial<ContentCard>) => {
    onUpdateCard({ ...card, ...fields });
  };

  const handleAddLink = () => {
    if (!newLink.trim()) return;
    patch({ referenceLinks: [...card.referenceLinks, newLink.trim()] });
    setNewLink("");
  };

  const handleAttachVaultNote = (note: ResearchNote) => {
    const appendedNotes = card.researchNotes
      ? `${card.researchNotes}\n\n[${note.domain}] ${note.title}: ${note.summary}`
      : `[${note.domain}] ${note.title}: ${note.summary}`;
    const links =
      note.sourceUrl && !card.referenceLinks.includes(note.sourceUrl)
        ? [...card.referenceLinks, note.sourceUrl]
        : card.referenceLinks;
    patch({ researchNotes: appendedNotes, referenceLinks: links });
  };

  const handleToggleShot = (shotId: string) => {
    patch({
      shotList: card.shotList.map((s) =>
        s.id === shotId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const handleAddManualShot = () => {
    if (!newShotDesc.trim()) return;
    const item: ShotItem = {
      id: `shot-${Date.now()}`,
      category: newShotCat,
      description: newShotDesc.trim(),
      durationSec: 6,
      visualNote: "Custom production note",
      completed: false,
    };
    patch({ shotList: [...card.shotList, item] });
    setNewShotDesc("");
  };

  const handleGenerateShotList = async () => {
    setLoadingShots(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/shotlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: card.title,
          platform: card.platform,
          researchNotes: card.researchNotes,
          script: card.script,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate shot list");
      const generated: ShotItem[] = (data.shots || []).map(
        (
          s: {
            category?: string;
            description?: string;
            durationSec?: number;
            visualNote?: string;
          },
          i: number
        ) => ({
          id: `shot-ai-${Date.now()}-${i}`,
          category: s.category || "HUD Animation",
          description: s.description || "",
          durationSec: s.durationSec || 5,
          visualNote: s.visualNote || "",
          completed: false,
        })
      );
      patch({ shotList: generated });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Shot list generation failed"
      );
    } finally {
      setLoadingShots(false);
    }
  };

  const handleGenerateHooks = async () => {
    setLoadingHooks(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: card.title,
          platform: card.platform,
          researchNotes: card.researchNotes,
          voiceDna,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate hooks");
      const hooks: HookVariation[] = (data.hooks || []).map(
        (
          h: {
            angleType?: string;
            hookText?: string;
            retentionRationale?: string;
            estimatedHoldRate?: number;
          },
          i: number
        ) => ({
          id: `hk-ai-${Date.now()}-${i}`,
          angleType: h.angleType || "Systems Angle",
          hookText: h.hookText || "",
          retentionRationale: h.retentionRationale || "",
          estimatedHoldRate: h.estimatedHoldRate || 90,
        })
      );
      patch({
        hooks,
        selectedHook: card.selectedHook || hooks[0]?.hookText || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hook generation failed");
    } finally {
      setLoadingHooks(false);
    }
  };

  const handleDraftScript = async () => {
    setLoadingScript(true);
    setError(null);
    try {
      const ideaContext = `Title: ${card.title}\nPrimary Hook: ${
        card.selectedHook || card.hooks[0]?.hookText || "None"
      }\nResearch Notes: ${card.researchNotes}`;
      const res = await fetch("/api/ai/voice-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaContext,
          targetPlatform: card.platform,
          voiceDna,
          constraints: ["Strict No-Hype", "Stock-and-Flow Framing"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Script drafting failed");
      const fullScript = [
        data.visualHudHook ? `VISUAL HUD (0-3s): ${data.visualHudHook}` : "",
        data.spokenHook ? `OPENING HOOK: ${data.spokenHook}` : "",
        data.primaryBody || "",
      ]
        .filter(Boolean)
        .join("\n\n");
      patch({
        script: fullScript,
        caption: data.caption || card.caption,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Script drafting failed");
    } finally {
      setLoadingScript(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/60 flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l-2 border-[#111111] h-full flex flex-col shadow-[-4px_0px_0px_#111111]">
        {/* Drawer Header */}
        <div className="px-4 py-2.5 border-b-2 border-[#111111] bg-[#FFC0D0] flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 bg-[#111111] text-[#F78DA7] font-mono text-xs font-extrabold">
              [{card.code}]
            </span>
            <select
              value={card.platform}
              onChange={(e) =>
                patch({ platform: e.target.value as PlatformKey })
              }
              className="bg-white border border-[#111111] px-2 py-1 font-mono text-xs font-bold text-[#111111] outline-none"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={card.day}
              onChange={(e) => patch({ day: e.target.value as DayOfWeek })}
              className="bg-white border border-[#111111] px-2 py-1 font-mono text-xs font-bold text-[#111111] outline-none"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={card.status}
              onChange={(e) =>
                patch({ status: e.target.value as ContentStatus })
              }
              className="bg-[#77FCA4] border border-[#111111] px-2 py-1 font-mono text-xs font-bold text-[#111111] outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                onDeleteCard(card.id);
                onClose();
              }}
              title="Delete Card"
              className="p-1.5 border border-[#111111] bg-white hover:bg-[#F78DA7] text-[#111111] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border border-[#111111] bg-white hover:bg-[#111111] hover:text-white text-[#111111] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title Editor */}
        <div className="px-4 py-3 border-b-2 border-[#111111] bg-[#F9F6F0]">
          <input
            value={card.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="w-full bg-transparent text-base font-extrabold text-[#111111] focus:outline-none"
          />
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#111111]">
            <input
              value={card.topicTag}
              onChange={(e) => patch({ topicTag: e.target.value })}
              className="bg-white border border-[#111111] px-1.5 py-0.5 font-bold outline-none w-36"
            />
            <input
              value={card.scheduledTime}
              onChange={(e) => patch({ scheduledTime: e.target.value })}
              className="bg-white border border-[#111111] px-1.5 py-0.5 outline-none w-24"
            />
            <label className="flex items-center gap-1 font-bold">
              <span>Est. Reach:</span>
              <input
                value={card.estReach}
                onChange={(e) => patch({ estReach: e.target.value })}
                placeholder="e.g. 120K views"
                className="bg-[#77FCA4] border border-[#111111] px-1.5 py-0.5 font-extrabold text-[#111111] outline-none w-32"
              />
            </label>
          </div>
        </div>

        {/* 4 Linked Section Tabs */}
        <div className="grid grid-cols-4 border-b-2 border-[#111111] bg-white font-mono text-[11px]">
          <button
            onClick={() => setSection("research")}
            className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-r border-[#111111] cursor-pointer font-bold transition-colors ${
              section === "research"
                ? "bg-[#111111] text-[#F78DA7]"
                : "text-[#111111] hover:bg-[#FFC0D0]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>A. Research</span>
          </button>
          <button
            onClick={() => setSection("shots")}
            className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-r border-[#111111] cursor-pointer font-bold transition-colors ${
              section === "shots"
                ? "bg-[#111111] text-[#F78DA7]"
                : "text-[#111111] hover:bg-[#FFC0D0]"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>B. Shots ({card.shotList.length})</span>
          </button>
          <button
            onClick={() => setSection("hooks")}
            className={`py-2.5 px-2 flex items-center justify-center gap-1.5 border-r border-[#111111] cursor-pointer font-bold transition-colors ${
              section === "hooks"
                ? "bg-[#111111] text-[#F78DA7]"
                : "text-[#111111] hover:bg-[#FFC0D0]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>C. Hooks ({card.hooks.length})</span>
          </button>
          <button
            onClick={() => setSection("script")}
            className={`py-2.5 px-2 flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-colors ${
              section === "script"
                ? "bg-[#111111] text-[#F78DA7]"
                : "text-[#111111] hover:bg-[#FFC0D0]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>D. Script</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F6F0]">
          {error && (
            <div className="border-2 border-[#111111] bg-[#FFC0D0] p-2.5 text-xs font-mono font-bold text-[#111111]">
              {error}
            </div>
          )}

          {/* Section A: Research & Links */}
          {section === "research" && (
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-black uppercase text-[#111111] mb-1.5">
                  Raw Research Notes / Merlin AI Summaries
                </label>
                <textarea
                  rows={8}
                  value={card.researchNotes}
                  onChange={(e) => patch({ researchNotes: e.target.value })}
                  placeholder="Drop raw equations, system dynamics links, or Merlin AI research summaries..."
                  className="w-full bg-white border-2 border-[#111111] p-3 font-mono text-xs text-[#111111] leading-relaxed outline-none shadow-[2px_2px_0px_#111111]"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[11px] font-black uppercase text-[#111111]">
                  Reference Links ({card.referenceLinks.length})
                </label>
                <div className="flex gap-2">
                  <input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="https://ntrs.nasa.gov/..."
                    className="flex-1 bg-white border-2 border-[#111111] px-3 py-1.5 font-mono text-xs text-[#111111] outline-none"
                  />
                  <button
                    onClick={handleAddLink}
                    className="px-3 py-1.5 bg-[#03AA5C] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold cursor-pointer"
                  >
                    Add Link
                  </button>
                </div>
                {card.referenceLinks.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border border-[#111111] bg-white px-3 py-1.5 font-mono text-xs"
                  >
                    <span className="text-[#03AA5C] font-bold truncate pr-2">
                      {url}
                    </span>
                    <button
                      onClick={() =>
                        patch({
                          referenceLinks: card.referenceLinks.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                      className="text-[#111111] hover:text-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {vaultNotes.length > 0 && (
                <div className="space-y-2 pt-2 border-t-2 border-[#111111]">
                  <div className="font-mono text-[11px] font-black uppercase text-[#111111]">
                    Quick-Attach From Research Vault
                  </div>
                  <div className="space-y-1.5">
                    {vaultNotes.slice(0, 4).map((note) => (
                      <div
                        key={note.id}
                        className="border border-[#111111] bg-white p-2.5 flex items-center justify-between gap-2 shadow-[1px_1px_0px_#111111]"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#111111] truncate">
                            {note.title}
                          </div>
                          <div className="font-mono text-[10px] text-[#111111]/70">
                            {note.domain} · {note.createdAt}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAttachVaultNote(note)}
                          className="px-2 py-1 border border-[#111111] bg-[#FFC0D0] hover:bg-[#77FCA4] text-[#111111] font-mono text-[10px] font-bold shrink-0 cursor-pointer"
                        >
                          + Attach
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section B: Visual Shot List & B-Roll */}
          {section === "shots" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#111111]">
                  Camera shots, HUD animations & diagram overlays
                </span>
                <button
                  onClick={handleGenerateShotList}
                  disabled={loadingShots}
                  className="px-3 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loadingShots ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Generate Shot List</span>
                </button>
              </div>

              <div className="flex gap-2">
                <select
                  value={newShotCat}
                  onChange={(e) => setNewShotCat(e.target.value)}
                  className="bg-white border-2 border-[#111111] px-2 py-1.5 font-mono text-xs text-[#111111] outline-none"
                >
                  <option>Camera A-Roll</option>
                  <option>HUD Animation</option>
                  <option>Diagram Overlay</option>
                  <option>B-Roll</option>
                </select>
                <input
                  value={newShotDesc}
                  onChange={(e) => setNewShotDesc(e.target.value)}
                  placeholder="Add custom shot or overlay..."
                  className="flex-1 bg-white border-2 border-[#111111] px-3 py-1.5 font-mono text-xs text-[#111111] outline-none"
                />
                <button
                  onClick={handleAddManualShot}
                  className="px-3 py-1.5 border-2 border-[#111111] bg-white hover:bg-[#FFC0D0] font-mono text-xs font-bold cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {card.shotList.length === 0 ? (
                <div className="border-2 border-dashed border-[#111111] bg-white p-6 text-center text-xs text-[#111111] font-mono">
                  No shots planned yet. Click &ldquo;AI Generate Shot List&rdquo;
                  to build a production checklist from your research notes.
                </div>
              ) : (
                <div className="space-y-2">
                  {card.shotList.map((shot) => (
                    <div
                      key={shot.id}
                      className={`border-2 border-[#111111] p-3 flex items-start gap-3 shadow-[2px_2px_0px_#111111] ${
                        shot.completed ? "bg-[#77FCA4]/40" : "bg-white"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleShot(shot.id)}
                        className="mt-0.5 text-[#111111] cursor-pointer"
                      >
                        {shot.completed ? (
                          <CheckSquare className="w-4 h-4 text-[#03AA5C]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                          <span className="font-extrabold bg-[#FFC0D0] px-1 border border-[#111111]">
                            {shot.category}
                          </span>
                          <span className="font-bold tabular-nums">
                            {shot.durationSec}s
                          </span>
                        </div>
                        <div
                          className={`text-xs mt-1 font-medium ${
                            shot.completed
                              ? "line-through text-[#111111]/50"
                              : "text-[#111111]"
                          }`}
                        >
                          {shot.description}
                        </div>
                        {shot.visualNote && (
                          <div className="text-[11px] font-mono text-[#111111]/70 mt-1">
                            Visual: {shot.visualNote}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          patch({
                            shotList: card.shotList.filter(
                              (s) => s.id !== shot.id
                            ),
                          })
                        }
                        className="text-[#111111]/60 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section C: Hook Variations */}
          {section === "hooks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#111111]">
                  Calibrated high-retention hooks for {card.platform}
                </span>
                <button
                  onClick={handleGenerateHooks}
                  disabled={loadingHooks}
                  className="px-3 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loadingHooks ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Generate 5 Hooks</span>
                </button>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                  Active Primary Hook
                </label>
                <textarea
                  rows={2}
                  value={card.selectedHook}
                  onChange={(e) => patch({ selectedHook: e.target.value })}
                  placeholder="Select a generated hook below or write your own..."
                  className="w-full bg-white border-2 border-[#111111] p-2.5 text-xs text-[#111111] outline-none shadow-[2px_2px_0px_#111111]"
                />
              </div>

              <div className="space-y-2.5">
                {card.hooks.map((hk) => {
                  const isActive = card.selectedHook === hk.hookText;
                  return (
                    <div
                      key={hk.id}
                      className={`border-2 border-[#111111] p-3 space-y-1.5 shadow-[2px_2px_0px_#111111] ${
                        isActive ? "bg-[#77FCA4]/50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="bg-[#111111] text-[#F78DA7] px-1.5 font-bold">
                          {hk.angleType}
                        </span>
                        <span className="bg-[#77FCA4] border border-[#111111] px-1.5 font-bold tabular-nums">
                          Hold: {hk.estimatedHoldRate}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#111111] leading-snug">
                        &ldquo;{hk.hookText}&rdquo;
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#111111]/20">
                        <span className="text-[11px] text-[#111111]/75">
                          {hk.retentionRationale}
                        </span>
                        <button
                          onClick={() => patch({ selectedHook: hk.hookText })}
                          className="px-2.5 py-1 bg-[#111111] text-white hover:bg-[#03AA5C] font-mono text-[10px] font-bold shrink-0 cursor-pointer"
                        >
                          {isActive ? "Selected" : "Use Hook"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section D: Final Script & Caption */}
          {section === "script" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#111111] tabular-nums">
                  {card.script ? card.script.split(/\s+/).length : 0} words
                </span>
                <button
                  onClick={handleDraftScript}
                  disabled={loadingScript}
                  className="px-3 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loadingScript ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>AI Draft Script From Notes & Hook</span>
                </button>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-black uppercase text-[#111111] mb-1">
                  Final Script / Post Body
                </label>
                <textarea
                  rows={12}
                  value={card.script}
                  onChange={(e) => patch({ script: e.target.value })}
                  placeholder="Write or generate the complete paced script or technical post..."
                  className="w-full bg-white border-2 border-[#111111] p-3 font-mono text-xs text-[#111111] leading-relaxed outline-none shadow-[2px_2px_0px_#111111]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] font-black uppercase text-[#111111] mb-1">
                  Caption / Subtext
                </label>
                <textarea
                  rows={3}
                  value={card.caption}
                  onChange={(e) => patch({ caption: e.target.value })}
                  placeholder="Platform caption or thread summary..."
                  className="w-full bg-white border-2 border-[#111111] p-3 font-mono text-xs text-[#111111] outline-none shadow-[2px_2px_0px_#111111]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
