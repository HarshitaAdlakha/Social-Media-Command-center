import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Sliders,
  Zap,
} from "lucide-react";
import {
  ChannelFilter,
  ContentCard,
  PlatformKey,
  VoiceStudioResult,
} from "../types";
import { VOICE_CONSTRAINTS_LIST } from "../data/seedData";
import { WindowFrame } from "./WindowFrame";

interface VoiceStudioPanelProps {
  selectedChannel: ChannelFilter;
  voiceDna: string;
  onChangeVoiceDna: (dna: string) => void;
  cards: ContentCard[];
  externalIdeaSeed?: string;
  onInsertIntoCard: (
    cardId: string,
    payload: {
      hook?: string;
      script: string;
      caption?: string;
      shotList?: string[];
    }
  ) => void;
  onCreateCardFromOutput: (
    platform: PlatformKey,
    title: string,
    script: string,
    hook: string,
    caption: string,
    shotList: string[]
  ) => void;
  onOpenNotionModal?: () => void;
  compact?: boolean;
}

const TARGET_PLATFORMS: PlatformKey[] = [
  "YouTube",
  "Instagram",
  "LinkedIn",
  "Substack",
  "Reddit",
];

export const VoiceStudioPanel: React.FC<VoiceStudioPanelProps> = ({
  selectedChannel,
  voiceDna,
  onChangeVoiceDna,
  cards,
  externalIdeaSeed,
  onInsertIntoCard,
  onCreateCardFromOutput,
  onOpenNotionModal,
  compact = false,
}) => {
  const [targetPlatform, setTargetPlatform] = useState<PlatformKey>(
    selectedChannel === "All Channels" ? "LinkedIn" : selectedChannel
  );
  const [activeConstraints, setActiveConstraints] = useState<string[]>([
    "Strict No-Hype",
    "Stock-and-Flow Framing",
    "Contrarian Opening",
  ]);
  const [showDnaEditor, setShowDnaEditor] = useState(false);
  const [idea, setIdea] = useState(
    "Orbital launch cadence scales faster by cutting booster refurbishment turnaround from 21 days to 4 days than by doubling payload-to-LEO mass fraction."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceStudioResult | null>(null);
  const [targetCardId, setTargetCardId] = useState<string>(cards[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const [insertedMsg, setInsertedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChannel !== "All Channels") {
      setTargetPlatform(selectedChannel);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (externalIdeaSeed) {
      setIdea(externalIdeaSeed);
    }
  }, [externalIdeaSeed]);

  useEffect(() => {
    if (!targetCardId && cards.length > 0) {
      setTargetCardId(cards[0].id);
    }
  }, [cards, targetCardId]);

  const toggleConstraint = (c: string) => {
    setActiveConstraints((prev) =>
      prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]
    );
  };

  const handleGenerate = async (refineInstruction?: string) => {
    if (!idea.trim()) {
      setError("Enter a rough idea or research note first.");
      return;
    }
    setLoading(true);
    setError(null);
    setInsertedMsg(null);
    try {
      const res = await fetch("/api/ai/voice-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          targetPlatform,
          voiceDna,
          constraints: activeConstraints,
          refineInstruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice Engine error.");
    } finally {
      setLoading(false);
    }
  };

  const formatResultAsText = (r: VoiceStudioResult) => {
    return [
      r.headline ? `TITLE: ${r.headline}` : "",
      r.visualHudHook ? `VISUAL HUD HOOK (0-3s): ${r.visualHudHook}` : "",
      r.spokenHook ? `HOOK: ${r.spokenHook}` : "",
      r.primaryBody,
      r.shotList?.length
        ? `\nSHOT LIST:\n${r.shotList.map((s) => `- ${s}`).join("\n")}`
        : "",
      r.caption ? `\nCAPTION: ${r.caption}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(formatResultAsText(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleInsertToSelectedCard = (overrideHook?: string) => {
    if (!result || !targetCardId) return;
    onInsertIntoCard(targetCardId, {
      hook: overrideHook || result.spokenHook || result.candidates?.[0]?.text,
      script: formatResultAsText(result),
      caption: result.caption,
      shotList: result.shotList,
    });
    const card = cards.find((c) => c.id === targetCardId);
    setInsertedMsg(`Inserted into ${card?.code || "planner card"}`);
    setTimeout(() => setInsertedMsg(null), 2500);
  };

  const formatRuleLabel =
    targetPlatform === "YouTube" || targetPlatform === "Instagram"
      ? "Visual HUD Hook (0–3s) + Spoken Hook + Paced Script + Shot List"
      : targetPlatform === "Reddit"
        ? "Deep-Dive Technical Post · Zero Marketing Tone"
        : "Systems-Breakdown Essay + Analytical Bullet Points";

  return (
    <WindowFrame
      title="Copilot 1.1 // Voice Engine"
      badge={
        result
          ? `${targetPlatform.toUpperCase()} · ${
              result.source === "fallback" ? "SIMULATED" : "GEMINI"
            }`
          : targetPlatform.toUpperCase()
      }
      headerRight={
        <button
          onClick={() => setShowDnaEditor((v) => !v)}
          className={`px-2 py-0.5 text-[10px] font-mono font-bold border border-[#111111] cursor-pointer flex items-center gap-1 ${
            showDnaEditor
              ? "bg-[#111111] text-[#77FCA4]"
              : "bg-white text-[#111111] hover:bg-[#77FCA4]"
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>Voice DNA</span>
        </button>
      }
    >
      <div className="p-3 space-y-2.5 bg-white">
        {/* Editable Brand Voice DNA Drawer */}
        {showDnaEditor && (
          <div className="border-2 border-[#111111] bg-[#FFC0D0]/30 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-[#111111] font-extrabold uppercase">
                Brand Voice DNA Profile (Persisted)
              </span>
              <span className="bg-[#03AA5C] text-white px-1 font-bold border border-[#111111]">
                ACTIVE
              </span>
            </div>
            <textarea
              rows={3}
              value={voiceDna}
              onChange={(e) => onChangeVoiceDna(e.target.value)}
              className="w-full bg-white border border-[#111111] p-2 font-mono text-xs text-[#111111] outline-none"
            />
          </div>
        )}

        {/* Channel Calibrator Buttons */}
        <div className="border border-[#111111] bg-[#F9F6F0] p-2 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="font-mono text-[10px] font-extrabold text-[#111111]">
              CALIBRATION CHANNEL:
            </span>
            <div className="flex flex-wrap gap-1">
              {TARGET_PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setTargetPlatform(p)}
                  className={`px-1.5 py-0.5 font-mono text-[10px] border border-[#111111] cursor-pointer font-bold ${
                    targetPlatform === p
                      ? "bg-[#111111] text-[#F78DA7] shadow-[1px_1px_0px_#111111]"
                      : "bg-white text-[#111111] hover:bg-[#FFC0D0]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="font-mono text-[10px] font-bold text-[#03AA5C]">
            Rule: {formatRuleLabel}
          </div>
        </div>

        {/* Voice Constraints */}
        <div className="flex flex-wrap gap-1 text-[10px] font-mono">
          {VOICE_CONSTRAINTS_LIST.map((c) => {
            const active = activeConstraints.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleConstraint(c)}
                className={`px-1.5 py-0.5 border border-[#111111] cursor-pointer ${
                  active
                    ? "bg-[#77FCA4] text-[#111111] font-bold shadow-[1px_1px_0px_#111111]"
                    : "bg-white text-[#111111] hover:bg-[#FFC0D0]"
                }`}
              >
                {active ? "+ " : ""}
                {c}
              </button>
            );
          })}
        </div>

        {/* Raw Idea / Research Note Input */}
        <div className="space-y-1">
          <div className="flex justify-between font-mono text-[10px] font-bold text-[#111111]">
            <span>RAW ARCHITECTURAL INGESTION</span>
            <span className="text-[#111111]/70 tabular-nums">
              {idea.trim() ? idea.trim().split(/\s+/).length : 0} WORDS
            </span>
          </div>
          <div className="border-2 border-[#111111] bg-white p-2 shadow-[2px_2px_0px_#111111]">
            <textarea
              rows={compact ? 3 : 4}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Enter a technical observation, aerospace failure mode, or geopolitical supply bottleneck..."
              className="w-full bg-transparent font-mono text-[11px] text-[#111111] focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {error && (
          <div className="border-2 border-[#111111] bg-[#FFC0D0] p-2 text-xs font-mono font-bold text-[#111111]">
            {error}
          </div>
        )}

        {/* Primary Generate CTA */}
        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className="w-full py-2 bg-[#111111] hover:bg-[#222222] disabled:opacity-60 text-[#F78DA7] text-xs font-mono font-black uppercase tracking-wider border-2 border-[#111111] shadow-[3px_3px_0px_#03AA5C] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Synthesizing {targetPlatform} Spec...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Synthesize Voice-Matched Output</span>
            </>
          )}
        </button>

        {/* Generated Output */}
        {result && (
          <div className="border-2 border-[#111111] bg-[#FFC0D0]/20 p-2.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#111111]/30">
              <div className="font-mono text-[11px] font-black text-[#111111] truncate">
                {result.headline}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="px-2 py-0.5 bg-white hover:bg-[#77FCA4] border border-[#111111] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-[#03AA5C]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() =>
                    handleGenerate(
                      "Make the opening hook sharper, cut 20% word count, increase systems contrast."
                    )
                  }
                  disabled={loading}
                  className="px-2 py-0.5 bg-white hover:bg-[#FFC0D0] border border-[#111111] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tighten</span>
                </button>
              </div>
            </div>

            {result.visualHudHook && (
              <div className="border-2 border-[#111111] bg-[#FFC0D0]/50 p-2 text-xs">
                <span className="font-mono text-[10px] font-black bg-[#111111] text-[#F78DA7] px-1 inline-block mb-1">
                  VISUAL HUD HOOK (0–3s)
                </span>
                <p className="text-[#111111] font-mono text-[11px]">
                  {result.visualHudHook}
                </p>
              </div>
            )}

            {result.spokenHook && (
              <div className="border border-[#111111] bg-[#77FCA4]/40 p-2 text-xs">
                <span className="font-mono text-[10px] font-black text-[#111111] block mb-0.5">
                  OPENING HOOK
                </span>
                <p className="text-[#111111] font-bold">
                  &ldquo;{result.spokenHook}&rdquo;
                </p>
              </div>
            )}

            <div className="text-[11px] text-[#111111] whitespace-pre-wrap leading-relaxed font-mono bg-white border-2 border-[#111111] p-2.5 max-h-56 overflow-y-auto shadow-[2px_2px_0px_#111111]">
              {result.primaryBody}
            </div>

            {result.shotList && result.shotList.length > 0 && (
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-black text-[#111111] uppercase">
                  Generated Shot List
                </div>
                <ul className="space-y-1 text-[10px] font-mono text-[#111111]">
                  {result.shotList.map((s, idx) => (
                    <li
                      key={idx}
                      className="border border-[#111111] bg-white px-2 py-1"
                    >
                      {idx + 1}. {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hook Candidates */}
            {result.candidates && result.candidates.length > 0 && (
              <div className="space-y-1.5">
                {result.candidates.map((cand, i) => (
                  <div
                    key={i}
                    className="border-2 border-[#111111] bg-white p-2 space-y-1 shadow-[2px_2px_0px_#111111]"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="font-black bg-[#111111] text-[#F78DA7] px-1">
                        {cand.angle}
                      </span>
                      <span className="bg-[#77FCA4] border border-[#111111] px-1 font-bold tabular-nums">
                        {cand.confidence}% · {cand.dwellEstimate}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-[#111111]">
                      {cand.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Cadence Check */}
            {result.cadenceCheck && (
              <div className="grid grid-cols-3 gap-1 font-mono text-[10px] font-bold text-center tabular-nums">
                <div className="border border-[#111111] bg-[#F9F6F0] py-1">
                  PACING{" "}
                  <span className="text-[#03AA5C]">
                    {result.cadenceCheck.pacing}%
                  </span>
                </div>
                <div className="border border-[#111111] bg-[#F9F6F0] py-1">
                  CLARITY{" "}
                  <span className="text-[#03AA5C]">
                    {result.cadenceCheck.clarity}%
                  </span>
                </div>
                <div className="border border-[#111111] bg-[#F9F6F0] py-1">
                  FLUFF{" "}
                  <span className="text-[#03AA5C]">
                    {result.cadenceCheck.fluffPercent}%
                  </span>
                </div>
              </div>
            )}

            {/* Insert Into Planner / Create Card */}
            <div className="pt-2 border-t border-[#111111]/30 flex flex-wrap items-center gap-1.5">
              {cards.length > 0 && (
                <>
                  <select
                    value={targetCardId}
                    onChange={(e) => setTargetCardId(e.target.value)}
                    className="flex-1 min-w-[140px] bg-white border border-[#111111] px-2 py-1 font-mono text-[10px] font-bold text-[#111111] outline-none"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.title.slice(0, 32)}...
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleInsertToSelectedCard()}
                    className="px-2.5 py-1 bg-[#03AA5C] hover:bg-[#028f4d] text-white border border-[#111111] shadow-[1px_1px_0px_#111111] font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>Insert</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onCreateCardFromOutput(
                    targetPlatform,
                    result.headline || idea.slice(0, 60),
                    formatResultAsText(result),
                    result.spokenHook || "",
                    result.caption || "",
                    result.shotList || []
                  );
                  setInsertedMsg("Created new Planner Card");
                  setTimeout(() => setInsertedMsg(null), 2500);
                }}
                className="px-2 py-1 bg-white hover:bg-[#FFC0D0] border border-[#111111] font-mono text-[10px] font-bold uppercase cursor-pointer"
              >
                + New Card
              </button>
              {onOpenNotionModal && (
                <button
                  onClick={onOpenNotionModal}
                  className="px-2 py-1 bg-[#111111] text-[#77FCA4] border border-[#111111] font-mono text-[10px] font-bold uppercase cursor-pointer"
                >
                  Push Notion
                </button>
              )}
            </div>
            {insertedMsg && (
              <div className="text-[11px] font-mono font-bold text-[#03AA5C]">
                ✓ {insertedMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </WindowFrame>
  );
};
