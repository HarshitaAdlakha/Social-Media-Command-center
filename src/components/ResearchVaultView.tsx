import React, { useState } from "react";
import { ArrowUpRight, Plus, Search, Trash2, Zap } from "lucide-react";
import { ResearchNote } from "../types";
import { WindowFrame } from "./WindowFrame";

interface ResearchVaultViewProps {
  notes: ResearchNote[];
  onAddNote: (note: ResearchNote) => void;
  onDeleteNote: (id: string) => void;
  onSendToVoiceStudio: (seedText: string) => void;
}

const DOMAINS: ("All" | "Aerospace" | "System Dynamics" | "Geopolitics")[] = [
  "All",
  "Aerospace",
  "System Dynamics",
  "Geopolitics",
];

export const ResearchVaultView: React.FC<ResearchVaultViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onSendToVoiceStudio,
}) => {
  const [domainFilter, setDomainFilter] = useState<
    "All" | "Aerospace" | "System Dynamics" | "Geopolitics"
  >("All");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState<
    "Aerospace" | "System Dynamics" | "Geopolitics"
  >("Aerospace");
  const [sourceUrl, setSourceUrl] = useState("");
  const [summary, setSummary] = useState("");

  const filtered = notes.filter((n) => {
    const matchesDomain =
      domainFilter === "All" || n.domain === domainFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q);
    return matchesDomain && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    onAddNote({
      id: `res-${Date.now()}`,
      title: title.trim(),
      domain,
      sourceUrl: sourceUrl.trim(),
      summary: summary.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    });
    setTitle("");
    setSourceUrl("");
    setSummary("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
      {/* Add Research Note Form */}
      <div className="lg:col-span-4">
        <WindowFrame title="Capture Research / Merlin Note">
          <form onSubmit={handleCreate} className="p-3.5 space-y-3 text-xs bg-[#F9F6F0]">
            <div>
              <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                Brief Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Nozzle Regenerative Cooling Channels"
                className="w-full bg-white border-2 border-[#111111] px-3 py-2 text-[#111111] outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                Domain Pillar
              </label>
              <select
                value={domain}
                onChange={(e) =>
                  setDomain(
                    e.target.value as
                      | "Aerospace"
                      | "System Dynamics"
                      | "Geopolitics"
                  )
                }
                className="w-full bg-white border-2 border-[#111111] px-3 py-2 font-mono text-[#111111] outline-none"
              >
                <option value="Aerospace">Aerospace</option>
                <option value="System Dynamics">System Dynamics</option>
                <option value="Geopolitics">Geopolitics</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                Source Link (Optional)
              </label>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-white border-2 border-[#111111] px-3 py-2 font-mono text-[#111111] outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold text-[#111111] mb-1">
                Raw Notes / Merlin AI Summary
              </label>
              <textarea
                required
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Paste key constraints, equations, lead-time delays, or paper takeaways..."
                className="w-full bg-white border-2 border-[#111111] p-2.5 font-mono text-xs text-[#111111] outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#03AA5C] hover:bg-[#028f4d] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-extrabold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save To Vault</span>
            </button>
          </form>
        </WindowFrame>
      </div>

      {/* Vault Directory */}
      <div className="lg:col-span-8">
        <WindowFrame
          title="Research Vault"
          badge={`${filtered.length} ENTRIES`}
          headerRight={
            <div className="relative">
              <Search className="w-3 h-3 text-[#111111]/60 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="bg-white border border-[#111111] pl-6 pr-2 py-0.5 font-mono text-[10px] text-[#111111] outline-none w-36"
              />
            </div>
          }
        >
          <div className="px-3 py-2 border-b-2 border-[#111111] bg-[#F9F6F0] flex flex-wrap gap-1.5">
            {DOMAINS.map((d) => (
              <button
                key={d}
                onClick={() => setDomainFilter(d)}
                className={`px-2.5 py-0.5 font-mono text-[10px] font-bold border border-[#111111] cursor-pointer ${
                  domainFilter === d
                    ? "bg-[#111111] text-[#F78DA7]"
                    : "bg-white text-[#111111] hover:bg-[#FFC0D0]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="divide-y-2 divide-[#111111] bg-white">
            {filtered.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-[#111111]/70">
                No matching research briefs in this filter.
              </div>
            ) : (
              filtered.map((note) => (
                <div
                  key={note.id}
                  className="p-3.5 hover:bg-[#FFC0D0]/20 transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="bg-[#FFC0D0] border border-[#111111] px-1.5 font-bold text-[#111111]">
                          {note.domain}
                        </span>
                        <span className="text-[#111111]/70 font-bold tabular-nums">
                          {note.createdAt}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#111111] mt-1">
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          onSendToVoiceStudio(
                            `${note.title}\n\n${note.summary}`
                          )
                        }
                        className="px-2.5 py-1 bg-[#03AA5C] hover:bg-[#028f4d] text-white border border-[#111111] shadow-[1px_1px_0px_#111111] font-mono text-[10px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Draft in Voice</span>
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1 border border-[#111111] bg-white hover:bg-[#F78DA7] text-[#111111] cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[#111111]/85 leading-relaxed">
                    {note.summary}
                  </p>
                  {note.sourceUrl && (
                    <div className="font-mono text-[11px] text-[#03AA5C] font-bold flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="truncate">{note.sourceUrl}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </WindowFrame>
      </div>
    </div>
  );
};
