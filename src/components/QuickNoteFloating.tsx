import React, { useEffect, useRef, useState } from "react";
import { Check, StickyNote, X } from "lucide-react";
import { ResearchNote } from "../types";

interface QuickNoteFloatingProps {
  onSaveToVault: (note: ResearchNote) => void;
  vaultCount: number;
}

function inferDomain(text: string): ResearchNote["domain"] {
  const lower = text.toLowerCase();
  if (
    /(sanction|export|supply chain|chokepoint|semiconductor|geopolit|tariff|nato|strait|treaty|mineral)/.test(
      lower
    )
  ) {
    return "Geopolitics";
  }
  if (
    /(feedback|stock|flow|delay|loop|bottleneck|queue|system dynamics|capacity|throughput|latency)/.test(
      lower
    )
  ) {
    return "System Dynamics";
  }
  return "Aerospace";
}

function buildQuickResearchNote(rawInput: string): ResearchNote {
  const trimmed = rawInput.trim();
  const urlMatch = trimmed.match(/https?:\/\/[^\s]+/i);
  const sourceUrl = urlMatch ? urlMatch[0].replace(/[),.;]+$/, "") : "";

  const textWithoutUrl = trimmed.replace(/https?:\/\/[^\s]+/gi, "").trim();
  const firstLine = (textWithoutUrl || trimmed)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  let title = "Quick Note";
  if (textWithoutUrl && firstLine) {
    title =
      firstLine.length > 64 ? `${firstLine.slice(0, 61).trim()}...` : firstLine;
  } else if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl);
      title = `Saved Link: ${parsed.hostname.replace(/^www\./, "")}`;
    } catch {
      title = "Saved Reference Link";
    }
  }

  return {
    id: `res-${Date.now()}`,
    title,
    domain: inferDomain(trimmed),
    sourceUrl,
    summary: trimmed,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export const QuickNoteFloating: React.FC<QuickNoteFloatingProps> = ({
  onSaveToVault,
  vaultCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [snippet, setSnippet] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), 2400);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!snippet.trim()) return;
    const note = buildQuickResearchNote(snippet);
    onSaveToVault(note);
    setSnippet("");
    setIsOpen(false);
    setJustSaved(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-2">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Quick Note to Research Vault"
          className="w-80 sm:w-96 border-2 border-[#111111] bg-white shadow-[4px_4px_0px_#111111] overflow-hidden"
        >
          {/* System 7 Pinstripe Titlebar */}
          <div className="h-7 px-2.5 bg-[#FFC0D0] border-b-2 border-[#111111] flex items-center justify-between gap-2 font-mono text-[11px] font-bold select-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <StickyNote className="w-3.5 h-3.5 shrink-0 text-[#111111]" />
              <span className="truncate uppercase tracking-wide">
                Quick Note // Vault
              </span>
            </div>
            <div className="flex-1 mac-titlebar-stripes opacity-60" />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Quick Note"
              className="w-4 h-4 bg-white border border-[#111111] flex items-center justify-center hover:bg-[#F78DA7] cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-3 bg-[#F9F6F0] space-y-2.5">
            <textarea
              ref={textareaRef}
              rows={4}
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Drop a quick snippet, observation, or https:// link..."
              className="w-full bg-white border-2 border-[#111111] p-2.5 font-mono text-xs text-[#111111] placeholder:text-[#111111]/45 outline-none resize-y"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-[#111111]/70">
                Appends to Research Vault ({vaultCount})
              </span>
              <button
                type="submit"
                disabled={!snippet.trim()}
                className="px-3.5 py-1.5 bg-[#03AA5C] hover:bg-[#028f4d] disabled:opacity-50 disabled:cursor-not-allowed text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-extrabold uppercase cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center gap-2">
        {justSaved && !isOpen && (
          <div className="px-2.5 py-1.5 bg-[#77FCA4] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[11px] font-extrabold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#03AA5C]" />
            <span>Saved to Vault</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className={`px-3.5 py-2 border-2 border-[#111111] shadow-[3px_3px_0px_#111111] font-mono text-xs font-extrabold uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
            isOpen
              ? "bg-[#111111] text-[#F78DA7]"
              : "bg-[#03AA5C] hover:bg-[#028f4d] text-white"
          }`}
        >
          <StickyNote className="w-4 h-4" />
          <span>Quick Note</span>
        </button>
      </div>
    </div>
  );
};
