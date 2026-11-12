import React, { useState } from "react";
import { X, Check, FileSpreadsheet, RotateCcw } from "lucide-react";
import { ChannelMetric, PlatformKey } from "../types";

interface MetricsModalProps {
  mode: "edit" | "csv";
  metrics: ChannelMetric[];
  onClose: () => void;
  onSaveMetrics: (updated: ChannelMetric[]) => void;
  onImportPostsToAudit: (postsText: string) => void;
  onResetMetrics: () => void;
}

const SAMPLE_CSV = `platform,title,impressions,engagement_rate,followers_gained,retention_pct
YouTube,"Full-Flow Staged Combustion Thermal Limits",164200,8.4,1420,67.2
LinkedIn,"Semiconductor Export Controls & Bullwhip Delays",192000,8.1,2150,79.0
Instagram,"Hypersonic Mach 10 V^3 Heating Law",44900,7.2,540,82.0
Substack,"Orbital Launch Cadence Queuing Model",31400,9.6,680,58.5
Reddit,"Rare-Earth Separation Two-Stock Delay Model",28500,11.8,410,85.0`;

export const MetricsModal: React.FC<MetricsModalProps> = ({
  mode: initialMode,
  metrics,
  onClose,
  onSaveMetrics,
  onImportPostsToAudit,
  onResetMetrics,
}) => {
  const [tab, setTab] = useState<"edit" | "csv">(initialMode);
  const [draftMetrics, setDraftMetrics] = useState<ChannelMetric[]>(metrics);
  const [csvText, setCsvText] = useState(SAMPLE_CSV);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  const handleFieldChange = (
    platform: PlatformKey,
    field: keyof ChannelMetric,
    value: string
  ) => {
    const num = Number(value);
    if (Number.isNaN(num)) return;
    setDraftMetrics((prev) =>
      prev.map((m) => (m.platform === platform ? { ...m, [field]: num } : m))
    );
  };

  const handleParseCsv = () => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      setCsvStatus("Need a header row and at least one data row.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const idxPlatform = headers.findIndex((h) => h.includes("platform"));
    const idxTitle = headers.findIndex((h) => h.includes("title"));
    const idxImpressions = headers.findIndex(
      (h) => h.includes("impression") || h.includes("view") || h.includes("reach")
    );
    const idxEngagement = headers.findIndex((h) => h.includes("eng"));
    const idxFollowers = headers.findIndex((h) => h.includes("follow"));
    const idxRetention = headers.findIndex((h) => h.includes("ret"));

    const accum: Record<
      string,
      { imp: number; fol: number; engSum: number; retSum: number; count: number }
    > = {};
    const auditLines: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols =
        lines[i]
          .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
          ?.map((c) => c.replace(/^"|"$/g, "").trim()) ||
        lines[i].split(",").map((c) => c.trim());

      const rawPlatform = (idxPlatform >= 0 ? cols[idxPlatform] : "") || "";
      const matched = metrics.find(
        (m) => m.platform.toLowerCase() === rawPlatform.toLowerCase()
      );
      const platform = matched ? matched.platform : "YouTube";
      const title = idxTitle >= 0 ? cols[idxTitle] : `Imported Post #${i}`;
      const imp = idxImpressions >= 0 ? Number(cols[idxImpressions]) || 0 : 0;
      const eng = idxEngagement >= 0 ? Number(cols[idxEngagement]) || 0 : 0;
      const fol = idxFollowers >= 0 ? Number(cols[idxFollowers]) || 0 : 0;
      const ret = idxRetention >= 0 ? Number(cols[idxRetention]) || 0 : 0;

      if (!accum[platform]) {
        accum[platform] = { imp: 0, fol: 0, engSum: 0, retSum: 0, count: 0 };
      }
      accum[platform].imp += imp;
      accum[platform].fol += fol;
      accum[platform].engSum += eng;
      accum[platform].retSum += ret;
      accum[platform].count += 1;

      auditLines.push(
        `${i}. [${platform}] "${title}" | Impressions: ${imp.toLocaleString()} | Engagement: ${eng}% | Retention: ${ret}% | Followers Gained: +${fol}`
      );
    }

    const updated = draftMetrics.map((m) => {
      const a = accum[m.platform];
      if (!a) return m;
      return {
        ...m,
        impressions7d: a.imp > 0 ? a.imp : m.impressions7d,
        followerDelta7d: a.fol > 0 ? a.fol : m.followerDelta7d,
        engagementRate:
          a.engSum > 0
            ? Number((a.engSum / a.count).toFixed(2))
            : m.engagementRate,
        retentionOrReadRate:
          a.retSum > 0
            ? Number((a.retSum / a.count).toFixed(1))
            : m.retentionOrReadRate,
      };
    });

    setDraftMetrics(updated);
    onSaveMetrics(updated);
    if (auditLines.length > 0) {
      onImportPostsToAudit(auditLines.join("\n"));
    }
    setCsvStatus(
      `Imported ${lines.length - 1} rows into channel metrics and Content Audit queue.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col max-h-[90vh]">
        <div className="px-4 py-2.5 border-b-2 border-[#111111] bg-[#FFC0D0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#111111]">
              Channel Telemetry Input
            </span>
            <div className="flex items-center border border-[#111111] bg-white p-0.5">
              <button
                onClick={() => setTab("edit")}
                className={`px-2.5 py-0.5 text-xs font-mono cursor-pointer ${
                  tab === "edit"
                    ? "bg-[#111111] text-[#F78DA7] font-bold"
                    : "text-[#111111] hover:bg-[#FFC0D0]"
                }`}
              >
                Manual Metrics
              </button>
              <button
                onClick={() => setTab("csv")}
                className={`px-2.5 py-0.5 text-xs font-mono cursor-pointer ${
                  tab === "csv"
                    ? "bg-[#111111] text-[#F78DA7] font-bold"
                    : "text-[#111111] hover:bg-[#FFC0D0]"
                }`}
              >
                Paste CSV Data
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#111111] bg-white hover:bg-[#F78DA7] text-[#111111] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 bg-[#F9F6F0]">
          {tab === "edit" ? (
            <div className="overflow-x-auto bg-white border-2 border-[#111111] p-2">
              <table className="w-full text-left border-collapse font-mono text-xs tabular-nums">
                <thead>
                  <tr className="border-b-2 border-[#111111] text-[#111111]">
                    <th className="py-2 pr-3">Platform</th>
                    <th className="py-2 px-2">Followers</th>
                    <th className="py-2 px-2">7d Delta</th>
                    <th className="py-2 px-2">7d Impressions</th>
                    <th className="py-2 px-2">Eng %</th>
                    <th className="py-2 pl-2">Retention %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111111]/20">
                  {draftMetrics.map((m) => (
                    <tr key={m.platform}>
                      <td className="py-2 pr-3 font-extrabold text-[#111111]">
                        {m.platform}
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={m.followers}
                          onChange={(e) =>
                            handleFieldChange(
                              m.platform,
                              "followers",
                              e.target.value
                            )
                          }
                          className="w-24 bg-[#F9F6F0] border border-[#111111] px-2 py-1 text-xs text-[#111111] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={m.followerDelta7d}
                          onChange={(e) =>
                            handleFieldChange(
                              m.platform,
                              "followerDelta7d",
                              e.target.value
                            )
                          }
                          className="w-20 bg-[#F9F6F0] border border-[#111111] px-2 py-1 text-xs text-[#111111] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={m.impressions7d}
                          onChange={(e) =>
                            handleFieldChange(
                              m.platform,
                              "impressions7d",
                              e.target.value
                            )
                          }
                          className="w-28 bg-[#F9F6F0] border border-[#111111] px-2 py-1 text-xs text-[#111111] outline-none"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="0.1"
                          value={m.engagementRate}
                          onChange={(e) =>
                            handleFieldChange(
                              m.platform,
                              "engagementRate",
                              e.target.value
                            )
                          }
                          className="w-16 bg-[#F9F6F0] border border-[#111111] px-2 py-1 text-xs text-[#111111] outline-none"
                        />
                      </td>
                      <td className="py-2 pl-2">
                        <input
                          type="number"
                          step="0.1"
                          value={m.retentionOrReadRate}
                          onChange={(e) =>
                            handleFieldChange(
                              m.platform,
                              "retentionOrReadRate",
                              e.target.value
                            )
                          }
                          className="w-16 bg-[#F9F6F0] border border-[#111111] px-2 py-1 text-xs text-[#111111] outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#111111]">
                Paste CSV rows with columns like{" "}
                <code className="bg-white border border-[#111111] px-1 font-mono font-bold">
                  platform,title,impressions,engagement_rate,followers_gained,retention_pct
                </code>
                . Imported rows update channel telemetry and populate the Content
                Audit queue.
              </p>
              <textarea
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full bg-white border-2 border-[#111111] p-3 font-mono text-xs text-[#111111] outline-none"
              />
              {csvStatus && (
                <div className="border-2 border-[#111111] bg-[#77FCA4] px-3 py-2 text-xs font-mono font-bold text-[#111111]">
                  {csvStatus}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t-2 border-[#111111] bg-white flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onResetMetrics();
              onClose();
            }}
            className="px-3 py-1.5 border border-[#111111] bg-white hover:bg-[#FFC0D0] text-xs font-mono font-bold text-[#111111] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#111111] bg-white hover:bg-[#FFC0D0] text-xs font-mono font-bold text-[#111111] cursor-pointer"
            >
              Cancel
            </button>
            {tab === "edit" ? (
              <button
                onClick={() => {
                  onSaveMetrics(draftMetrics);
                  onClose();
                }}
                className="px-4 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Telemetry</span>
              </button>
            ) : (
              <button
                onClick={handleParseCsv}
                className="px-4 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Parse & Apply CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
