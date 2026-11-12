import React from "react";
import { ArrowRight, FileSpreadsheet, SlidersHorizontal } from "lucide-react";
import { AuditResult, ChannelFilter, ChannelMetric } from "../types";
import { WindowFrame } from "./WindowFrame";

interface AnalyticsBarProps {
  metrics: ChannelMetric[];
  selectedChannel: ChannelFilter;
  latestAudit: AuditResult | null;
  onOpenEditMetrics: () => void;
  onOpenCsvImport: () => void;
  onNavigateAudit: () => void;
}

function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export const AnalyticsBar: React.FC<AnalyticsBarProps> = ({
  metrics,
  selectedChannel,
  latestAudit,
  onOpenEditMetrics,
  onOpenCsvImport,
  onNavigateAudit,
}) => {
  const filtered =
    selectedChannel === "All Channels"
      ? metrics
      : metrics.filter((m) => m.platform === selectedChannel);

  const totalImpressions = filtered.reduce((sum, m) => sum + m.impressions7d, 0);
  const avgImpressionsDelta =
    filtered.reduce((sum, m) => sum + m.impressionsDeltaPct, 0) /
    (filtered.length || 1);
  const avgEngagement =
    filtered.reduce((sum, m) => sum + m.engagementRate, 0) /
    (filtered.length || 1);
  const avgMultiplier =
    filtered.reduce((sum, m) => sum + m.engagementMultiplier, 0) /
    (filtered.length || 1);
  const totalFollowers = filtered.reduce((sum, m) => sum + m.followers, 0);
  const totalFollowerDelta = filtered.reduce(
    (sum, m) => sum + m.followerDelta7d,
    0
  );
  const avgRetention =
    filtered.reduce((sum, m) => sum + m.retentionOrReadRate, 0) /
    (filtered.length || 1);

  const hookScore = latestAudit?.hookStrengthScore ?? 94;
  const auditOverall = latestAudit?.overallScore ?? 91;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {/* Card 1: Total Reach / Impressions */}
      <WindowFrame
        title={
          selectedChannel === "All Channels"
            ? "Reach.1.1"
            : `Reach // ${selectedChannel}`
        }
        badge={`+${avgImpressionsDelta.toFixed(1)}% 7D`}
        headerRight={
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenCsvImport}
              title="Paste / Import CSV Metrics"
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold border border-[#111111] bg-white text-[#111111] hover:bg-[#77FCA4] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>CSV</span>
            </button>
            <button
              onClick={onOpenEditMetrics}
              title="Edit Metrics Manually"
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold border border-[#111111] bg-white text-[#111111] hover:bg-[#77FCA4] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        }
      >
        <div className="p-3 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#111111]/75 font-bold">
              <span>TOTAL REACH / IMPRESSIONS</span>
              <span className="bg-[#03AA5C] text-white px-1 border border-[#111111] text-[9px]">
                +{avgImpressionsDelta.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black font-sans tabular-nums tracking-tight text-[#111111]">
                {totalImpressions.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-[#111111]/70 font-semibold">
                views
              </span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 mt-2.5 pt-2 border-t border-[#111111]/25 text-[10px] font-mono tabular-nums text-center">
            {metrics.map((m) => {
              const isSelected =
                selectedChannel === "All Channels" ||
                selectedChannel === m.platform;
              return (
                <div
                  key={m.platform}
                  className={`px-1 py-0.5 border border-[#111111] ${
                    isSelected
                      ? "bg-[#F78DA7]/25 text-[#111111]"
                      : "bg-[#F9F6F0] text-[#111111]/40"
                  }`}
                >
                  <div className="text-[9px] font-bold">
                    {m.platform.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="font-bold">{formatCompact(m.impressions7d)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </WindowFrame>

      {/* Card 2: Engagement Velocity */}
      <WindowFrame
        title="Velocity.1.1"
        badge={`${avgMultiplier.toFixed(1)}x BASE`}
      >
        <div className="p-3 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#111111]/75 font-bold">
              <span>ENGAGEMENT VELOCITY</span>
              <span className="bg-[#111111] text-white px-1 text-[9px] font-bold">
                {avgMultiplier.toFixed(1)}x BASE
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black font-sans tabular-nums tracking-tight text-[#03AA5C]">
                {avgEngagement.toFixed(2)}%
              </span>
              <span className="text-[10px] font-mono bg-[#77FCA4] text-[#111111] px-1.5 border border-[#111111] font-bold">
                {avgRetention.toFixed(1)}% RET
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-[#111111]/25 text-[10px] font-mono tabular-nums">
            <div className="border border-[#111111] bg-[#F9F6F0] px-2 py-1 flex justify-between">
              <span>TRACTION:</span>
              <span className="font-bold">{avgMultiplier.toFixed(2)}x</span>
            </div>
            <div className="border border-[#111111] bg-[#F9F6F0] px-2 py-1 flex justify-between">
              <span>SCOPE:</span>
              <span className="font-bold">{filtered.length}/5 CH</span>
            </div>
          </div>
        </div>
      </WindowFrame>

      {/* Card 3: Operator Follower Delta */}
      <WindowFrame
        title="Followers.1.1"
        badge={`${formatCompact(totalFollowers)} TOTAL`}
      >
        <div className="p-3 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between items-center text-[10px] font-mono text-[#111111]/75 font-bold">
              <span>OPERATOR FOLLOWER DELTA</span>
              <span className="bg-[#F78DA7] text-[#111111] px-1 border border-[#111111] text-[9px] font-bold">
                {avgRetention.toFixed(0)}% RET
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black font-sans tabular-nums tracking-tight text-[#111111]">
                +{totalFollowerDelta.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-[#111111]/70 font-semibold">
                net/wk
              </span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#111111]/25 flex items-center justify-between text-[10px] font-mono font-bold tabular-nums">
            <span>TOTAL: {formatCompact(totalFollowers)}</span>
            <span className="text-[#03AA5C]">
              {selectedChannel === "All Channels"
                ? "LI 40% · YT 31% · SUB 17%"
                : `${selectedChannel.toUpperCase()} ACTIVE`}
            </span>
          </div>
        </div>
      </WindowFrame>

      {/* Card 4: AI Channel Audit Score */}
      <WindowFrame
        title="AuditHealth.1.1"
        badge={latestAudit ? "VERIFIED" : "BASELINE"}
        mintBody
      >
        <div className="p-3 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono text-[#111111] font-bold">
                AI CHANNEL AUDIT SCORE
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-4xl font-black font-sans tabular-nums tracking-tight text-[#111111]">
                  {hookScore}
                </span>
                <span className="text-xs font-mono font-bold text-[#111111]">
                  / 100
                </span>
              </div>
            </div>
            <div className="border-2 border-[#111111] bg-white px-2 py-1 text-[10px] font-mono font-bold text-right shadow-[1px_1px_0px_#111111] tabular-nums">
              <div>OVERALL: {auditOverall}</div>
              <div className="text-[#03AA5C]">
                {latestAudit ? "AUDITED" : "READY"}
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateAudit}
            className="mt-2 w-full py-1.5 px-3 bg-[#111111] hover:bg-[#222222] text-[#77FCA4] text-[10px] font-mono font-extrabold uppercase border border-[#111111] flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#111111] cursor-pointer transition-colors"
          >
            <span>VIEW FULL AUDIT SPEC</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </WindowFrame>
    </div>
  );
};
