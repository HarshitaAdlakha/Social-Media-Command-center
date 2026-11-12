import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Play,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { AuditResult, ChannelFilter, ChannelMetric, ContentCard } from "../types";
import { WindowFrame } from "./WindowFrame";

interface ContentAuditViewProps {
  selectedChannel: ChannelFilter;
  metrics: ChannelMetric[];
  auditInputText: string;
  onChangeAuditInput: (val: string) => void;
  auditHistory: AuditResult[];
  onSaveAudit: (result: AuditResult) => void;
  voiceDna: string;
  cards: ContentCard[];
  onOpenEditMetrics: () => void;
  onOpenCsvImport: () => void;
}

export const ContentAuditView: React.FC<ContentAuditViewProps> = ({
  selectedChannel,
  metrics,
  auditInputText,
  onChangeAuditInput,
  auditHistory,
  onSaveAudit,
  voiceDna,
  cards,
  onOpenEditMetrics,
  onOpenCsvImport,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAuditId, setActiveAuditId] = useState<string | null>(
    auditHistory[0]?.id ?? null
  );

  const visibleMetrics =
    selectedChannel === "All Channels"
      ? metrics
      : metrics.filter((m) => m.platform === selectedChannel);

  const activeAudit =
    auditHistory.find((a) => a.id === activeAuditId) || auditHistory[0] || null;

  const handleLoadFromPlanner = () => {
    const filtered =
      selectedChannel === "All Channels"
        ? cards
        : cards.filter((c) => c.platform === selectedChannel);
    const lines = filtered.slice(0, 8).map((c, idx) => {
      const hook = c.selectedHook || c.hooks[0]?.hookText || "No hook drafted yet";
      return `${idx + 1}. [${c.platform}] "${c.title}" | Status: ${c.status} | Est. Reach: ${c.estReach || "TBD"} | Hook: "${hook}"`;
    });
    if (lines.length > 0) {
      onChangeAuditInput(lines.join("\n"));
    }
  };

  const handleRunAudit = async () => {
    if (!auditInputText.trim()) {
      setError("Paste at least 3–5 recent post titles, scripts, or metrics.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postsText: auditInputText,
          platformFilter: selectedChannel,
          voiceDna,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Audit request failed.");
      }
      const newAudit: AuditResult = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        platformScope: selectedChannel,
        overallScore: data.overallScore ?? 85,
        hookStrengthScore: data.hookStrengthScore ?? 88,
        retentionScore: data.retentionScore ?? 82,
        executiveSummary: data.executiveSummary ?? "",
        whatWorked: data.whatWorked ?? [],
        dropOffDiagnostics: data.dropOffDiagnostics ?? [],
        tacticalAdjustments: data.tacticalAdjustments ?? [],
        source: data.source,
      };
      onSaveAudit(newAudit);
      setActiveAuditId(newAudit.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run content audit."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cross-Platform Channel Breakdown Table */}
      <WindowFrame
        title={`Cross-Platform Telemetry // ${selectedChannel}`}
        badge={`${visibleMetrics.length} ACTIVE`}
        headerRight={
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCsvImport}
              className="px-2 py-0.5 text-[10px] font-mono font-bold border border-[#111111] bg-white text-[#111111] hover:bg-[#77FCA4] flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Paste CSV</span>
            </button>
            <button
              onClick={onOpenEditMetrics}
              className="px-2 py-0.5 text-[10px] font-mono font-bold border border-[#111111] bg-white text-[#111111] hover:bg-[#77FCA4] flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Edit Metrics</span>
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto bg-white">
          <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F9F6F0] text-[#111111] text-[11px]">
                <th className="py-2 px-3">Channel</th>
                <th className="py-2 px-3">Handle</th>
                <th className="py-2 px-3 text-right">Followers</th>
                <th className="py-2 px-3 text-right">7d Delta</th>
                <th className="py-2 px-3 text-right">7d Impressions</th>
                <th className="py-2 px-3 text-right">Growth</th>
                <th className="py-2 px-3 text-right">Eng Rate</th>
                <th className="py-2 px-3 text-right">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/20">
              {visibleMetrics.map((m) => (
                <tr key={m.platform} className="hover:bg-[#FFC0D0]/25">
                  <td className="py-2 px-3 font-extrabold text-[#111111]">
                    {m.platform}
                  </td>
                  <td className="py-2 px-3 text-[#111111]/75">{m.handle}</td>
                  <td className="py-2 px-3 text-right text-[#111111]">
                    {m.followers.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-[#03AA5C] font-bold">
                    +{m.followerDelta7d.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-[#111111]">
                    {m.impressions7d.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right text-[#03AA5C] font-bold">
                    +{m.impressionsDeltaPct.toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-right font-extrabold text-[#111111]">
                    {m.engagementRate.toFixed(2)}%
                  </td>
                  <td className="py-2 px-3 text-right text-[#111111]">
                    {m.retentionOrReadRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WindowFrame>

      {/* AI Content Audit Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        <div className="lg:col-span-5 space-y-3">
          <WindowFrame
            title="Full Content Audit Input"
            badge="5–10 POSTS"
            headerRight={
              <button
                onClick={handleLoadFromPlanner}
                className="px-2 py-0.5 text-[10px] font-mono font-bold border border-[#111111] bg-white text-[#111111] hover:bg-[#77FCA4] cursor-pointer"
              >
                Pull From Planner
              </button>
            }
          >
            <div className="p-3.5 space-y-3 bg-[#F9F6F0]">
              <p className="text-xs text-[#111111]/85 leading-relaxed">
                Paste your last 5–10 post titles, hooks, scripts, or metrics.
                Gemini diagnoses drop-off points, scores hook strength, and
                outputs 3 concrete adjustments for next week.
              </p>
              <textarea
                rows={11}
                value={auditInputText}
                onChange={(e) => onChangeAuditInput(e.target.value)}
                placeholder="Paste post titles, hooks, scripts, and metrics..."
                className="w-full bg-white border-2 border-[#111111] p-2.5 font-mono text-xs text-[#111111] leading-relaxed outline-none shadow-[2px_2px_0px_#111111]"
              />
              {error && (
                <div className="border-2 border-[#111111] bg-[#FFC0D0] p-2.5 text-xs font-mono font-bold text-[#111111]">
                  {error}
                </div>
              )}
              <button
                onClick={handleRunAudit}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#03AA5C] hover:bg-[#028f4d] disabled:opacity-60 text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running Systems Audit...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Full Content Audit</span>
                  </>
                )}
              </button>
            </div>
          </WindowFrame>

          {auditHistory.length > 0 && (
            <WindowFrame title="Audit History" badge={`${auditHistory.length} RUNS`}>
              <div className="divide-y divide-[#111111]/20 max-h-56 overflow-y-auto bg-white">
                {auditHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveAuditId(item.id)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs font-mono cursor-pointer transition-colors ${
                      activeAudit?.id === item.id
                        ? "bg-[#77FCA4] text-[#111111] font-bold"
                        : "hover:bg-[#FFC0D0]/40 text-[#111111]"
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold truncate">
                        {item.platformScope}
                      </div>
                      <div className="text-[10px] text-[#111111]/70">
                        {item.timestamp}
                      </div>
                    </div>
                    <span className="shrink-0 font-extrabold bg-[#111111] text-[#77FCA4] px-1.5 py-0.5 tabular-nums">
                      {item.hookStrengthScore}/100
                    </span>
                  </button>
                ))}
              </div>
            </WindowFrame>
          )}
        </div>

        {/* Audit Output Diagnostics */}
        <div className="lg:col-span-7">
          <WindowFrame
            title="Audit Diagnostics & Next-Week Adjustments"
            badge={
              activeAudit
                ? `${activeAudit.platformScope.toUpperCase()} · ${
                    activeAudit.source === "fallback" ? "SIMULATED" : "GEMINI"
                  }`
                : "AWAITING RUN"
            }
          >
            {!activeAudit ? (
              <div className="p-8 text-center space-y-3 bg-[#F9F6F0]">
                <Activity className="w-8 h-8 text-[#03AA5C] mx-auto" />
                <div className="font-mono text-sm font-black text-[#111111]">
                  No Content Audit Executed Yet
                </div>
                <p className="text-xs text-[#111111]/80 max-w-md mx-auto">
                  Paste your recent posts on the left and click{" "}
                  <strong>Run Full Content Audit</strong> to generate hook
                  scores, drop-off diagnostics, and 3 concrete tactical
                  adjustments.
                </p>
              </div>
            ) : (
              <div className="p-3.5 space-y-3.5 bg-[#F9F6F0]">
                {/* Score Row */}
                <div className="grid grid-cols-3 gap-2.5 font-mono tabular-nums">
                  <div className="border-2 border-[#111111] bg-[#77FCA4] p-2.5 shadow-[2px_2px_0px_#111111]">
                    <div className="text-[10px] font-bold uppercase text-[#111111]">
                      Hook Strength
                    </div>
                    <div className="text-2xl font-black text-[#111111] mt-0.5">
                      {activeAudit.hookStrengthScore}
                      <span className="text-xs font-bold"> / 100</span>
                    </div>
                  </div>
                  <div className="border-2 border-[#111111] bg-white p-2.5 shadow-[2px_2px_0px_#111111]">
                    <div className="text-[10px] font-bold uppercase text-[#111111]/70">
                      Retention Score
                    </div>
                    <div className="text-2xl font-black text-[#03AA5C] mt-0.5">
                      {activeAudit.retentionScore}
                      <span className="text-xs font-bold text-[#111111]">
                        {" "}
                        / 100
                      </span>
                    </div>
                  </div>
                  <div className="border-2 border-[#111111] bg-white p-2.5 shadow-[2px_2px_0px_#111111]">
                    <div className="text-[10px] font-bold uppercase text-[#111111]/70">
                      Overall Audit
                    </div>
                    <div className="text-2xl font-black text-[#111111] mt-0.5">
                      {activeAudit.overallScore}
                      <span className="text-xs font-bold"> / 100</span>
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="border-2 border-[#111111] bg-white p-3 shadow-[2px_2px_0px_#111111]">
                  <div className="font-mono text-[11px] font-black uppercase text-[#111111] mb-1">
                    Diagnostic Summary
                  </div>
                  <p className="text-xs text-[#111111] leading-relaxed">
                    {activeAudit.executiveSummary}
                  </p>
                </div>

                {/* What Worked */}
                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-black uppercase text-[#03AA5C] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>What Worked</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {activeAudit.whatWorked.map((item, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-[#111111] bg-white p-2.5 space-y-1 shadow-[2px_2px_0px_#111111]"
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-xs">
                          <span className="font-extrabold text-[#111111]">
                            {item.pattern}
                          </span>
                          <span className="bg-[#77FCA4] border border-[#111111] px-1 text-[10px] font-bold shrink-0">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-xs text-[#111111]/80 leading-relaxed">
                          {item.evidence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drop-Off Diagnostics */}
                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-black uppercase text-[#111111] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#111111]" />
                    <span>Drop-Off Point Diagnostics</span>
                  </div>
                  <div className="space-y-2">
                    {activeAudit.dropOffDiagnostics.map((d, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-[#111111] bg-white p-2.5 space-y-1 shadow-[2px_2px_0px_#111111]"
                      >
                        <div className="font-mono text-xs font-extrabold bg-[#FFC0D0] inline-block px-1.5 border border-[#111111]">
                          {d.location}
                        </div>
                        <p className="text-xs text-[#111111]">{d.diagnosis}</p>
                        <p className="text-xs font-mono font-bold text-[#03AA5C]">
                          Fix: {d.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 Concrete Tactical Adjustments */}
                <div className="space-y-2">
                  <div className="font-mono text-[11px] font-black uppercase text-[#111111] flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#03AA5C]" />
                    <span>3 Concrete Tactical Adjustments for Next Week</span>
                  </div>
                  <div className="space-y-2">
                    {activeAudit.tacticalAdjustments.map((adj, idx) => (
                      <div
                        key={idx}
                        className="border-2 border-[#111111] bg-[#77FCA4]/40 p-2.5 space-y-1 shadow-[2px_2px_0px_#111111]"
                      >
                        <div className="flex items-center justify-between gap-2 font-mono text-xs">
                          <span className="font-black text-[#111111]">
                            0{idx + 1}. {adj.title}
                          </span>
                          <span className="bg-[#111111] text-[#77FCA4] px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                            {adj.platform} · {adj.expectedLift}
                          </span>
                        </div>
                        <p className="text-xs text-[#111111] leading-relaxed">
                          {adj.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </WindowFrame>
        </div>
      </div>
    </div>
  );
};
