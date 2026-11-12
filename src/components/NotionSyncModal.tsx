import React, { useState } from "react";
import { Check, Copy, Download, Loader2, Send, X } from "lucide-react";
import { ContentCard, NotionConfig } from "../types";

interface NotionSyncModalProps {
  config: NotionConfig;
  cards: ContentCard[];
  onSaveConfig: (cfg: NotionConfig) => void;
  onClose: () => void;
}

export const NotionSyncModal: React.FC<NotionSyncModalProps> = ({
  config,
  cards,
  onSaveConfig,
  onClose,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl);
  const [notionToken, setNotionToken] = useState(config.notionToken);
  const [databaseId, setDatabaseId] = useState(config.databaseId);
  const [pushing, setPushing] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const structuredPayload = {
    account: "@antonov.systems",
    exportedAt: new Date().toISOString(),
    totalItems: cards.length,
    weeklyPlan: cards.map((c) => ({
      code: c.code,
      day: c.day,
      scheduledTime: c.scheduledTime,
      platform: c.platform,
      status: c.status,
      title: c.title,
      topicTag: c.topicTag,
      primaryHook: c.selectedHook || c.hooks[0]?.hookText || "",
      researchNotes: c.researchNotes,
      referenceLinks: c.referenceLinks,
      shotList: c.shotList.map((s) => ({
        category: s.category,
        description: s.description,
        durationSec: s.durationSec,
        completed: s.completed,
      })),
      script: c.script,
      caption: c.caption,
    })),
  };

  const buildMarkdownTable = (): string => {
    const header =
      "| Code | Day | Platform | Status | Title | Primary Hook | Shots | Script |\n| --- | --- | --- | --- | --- | --- | --- | --- |";
    const rows = cards.map((c) => {
      const hook = (c.selectedHook || c.hooks[0]?.hookText || "—").replace(
        /\|/g,
        "\\|"
      );
      const title = c.title.replace(/\|/g, "\\|");
      const shots = `${c.shotList.filter((s) => s.completed).length}/${
        c.shotList.length
      }`;
      const scriptState = c.script
        ? `${c.script.split(/\s+/).length}w`
        : "Draft";
      return `| ${c.code} | ${c.day} | ${c.platform} | ${c.status} | ${title} | ${hook} | ${shots} | ${scriptState} |`;
    });
    return `${header}\n${rows.join("\n")}`;
  };

  const handleSaveOnly = () => {
    onSaveConfig({
      webhookUrl: webhookUrl.trim(),
      notionToken: notionToken.trim(),
      databaseId: databaseId.trim(),
      lastSyncedAt: config.lastSyncedAt,
    });
    setStatusMessage({ ok: true, text: "Notion sync settings saved locally." });
  };

  const handlePushToNotion = async () => {
    const updatedCfg: NotionConfig = {
      webhookUrl: webhookUrl.trim(),
      notionToken: notionToken.trim(),
      databaseId: databaseId.trim(),
      lastSyncedAt: config.lastSyncedAt,
    };
    onSaveConfig(updatedCfg);

    if (!webhookUrl.trim()) {
      setStatusMessage({
        ok: false,
        text: "Paste a Make.com, Pipedream, or Notion Proxy Webhook URL first.",
      });
      return;
    }

    setPushing(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/notion/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          notionToken: notionToken.trim(),
          databaseId: databaseId.trim(),
          payload: structuredPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Webhook push failed.");
      }
      const now = new Date().toLocaleString();
      onSaveConfig({ ...updatedCfg, lastSyncedAt: now });
      setStatusMessage({
        ok: true,
        text: `Pushed ${cards.length} items to Notion webhook (HTTP ${data.status}).`,
      });
    } catch (err) {
      setStatusMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Failed to push to Notion.",
      });
    } finally {
      setPushing(false);
    }
  };

  const handleCopyMarkdownTable = async () => {
    await navigator.clipboard.writeText(buildMarkdownTable());
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(structuredPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `antonov-systems-week-plan-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col max-h-[90vh]">
        <div className="px-4 py-2.5 border-b-2 border-[#111111] bg-[#FFC0D0] flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-black uppercase tracking-wider text-[#111111]">
              Notion 2-Way Sync & Export Config
            </span>
            {config.lastSyncedAt && (
              <span className="ml-3 font-mono text-[10px] font-bold bg-[#77FCA4] px-1 border border-[#111111]">
                Last sync: {config.lastSyncedAt}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[#111111] bg-white hover:bg-[#F78DA7] text-[#111111] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 text-xs bg-[#F9F6F0]">
          <div className="space-y-3">
            <div>
              <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                Make.com / Pipedream Webhook URL or Notion API Proxy URL
              </label>
              <input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.us1.make.com/..."
                className="w-full bg-white border-2 border-[#111111] px-3 py-2 font-mono text-xs text-[#111111] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                  Notion Database ID (Optional for Proxy)
                </label>
                <input
                  value={databaseId}
                  onChange={(e) => setDatabaseId(e.target.value)}
                  placeholder="Optional database UUID"
                  className="w-full bg-white border-2 border-[#111111] px-3 py-2 font-mono text-xs text-[#111111] outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                  Bearer Token (Optional for Proxy)
                </label>
                <input
                  type="password"
                  value={notionToken}
                  onChange={(e) => setNotionToken(e.target.value)}
                  placeholder="Optional Notion secret token"
                  className="w-full bg-white border-2 border-[#111111] px-3 py-2 font-mono text-xs text-[#111111] outline-none"
                />
              </div>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`border-2 border-[#111111] px-3 py-2 font-mono text-xs font-bold ${
                statusMessage.ok ? "bg-[#77FCA4]" : "bg-[#FFC0D0]"
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Structured JSON Payload Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#111111]">
              <span>Structured Weekly JSON Payload ({cards.length} nodes)</span>
              <button
                onClick={handleDownloadJson}
                className="text-[#03AA5C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download JSON</span>
              </button>
            </div>
            <pre className="bg-white border-2 border-[#111111] p-3 font-mono text-[10px] text-[#111111] max-h-48 overflow-auto">
              {JSON.stringify(structuredPayload, null, 2)}
            </pre>
          </div>
        </div>

        <div className="px-4 py-3 border-t-2 border-[#111111] bg-white flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleCopyMarkdownTable}
            className="px-3 py-2 border-2 border-[#111111] bg-white hover:bg-[#FFC0D0] text-[#111111] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#111111]"
          >
            {copiedTable ? (
              <Check className="w-3.5 h-3.5 text-[#03AA5C]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#111111]" />
            )}
            <span>
              {copiedTable
                ? "Copied Markdown Table!"
                : "Copy as Notion Markdown Table"}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOnly}
              className="px-3 py-2 border border-[#111111] bg-white hover:bg-[#FFC0D0] text-xs font-mono font-bold text-[#111111] cursor-pointer"
            >
              Save Config
            </button>
            <button
              onClick={handlePushToNotion}
              disabled={pushing}
              className="px-4 py-2 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-extrabold uppercase flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {pushing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Push to Notion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
