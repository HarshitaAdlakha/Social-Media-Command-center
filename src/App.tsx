import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  Database,
  Mic,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  AuditResult,
  ChannelFilter,
  ChannelMetric,
  ContentCard,
  DayOfWeek,
  NotionConfig,
  PlatformKey,
  ResearchNote,
  WeeklyGoal,
  WorkspaceTab,
} from "./types";
import {
  DEFAULT_VOICE_DNA,
  INITIAL_CHANNEL_METRICS,
  INITIAL_CONTENT_CARDS,
  INITIAL_NOTION_CONFIG,
  INITIAL_RESEARCH_VAULT,
  INITIAL_WEEKLY_GOALS,
  SAMPLE_AUDIT_POSTS,
} from "./data/seedData";
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from "./utils/storage";
import { AnalyticsBar } from "./components/AnalyticsBar";
import { DailyPulse } from "./components/DailyPulse";
import { WeeklyContentGoals } from "./components/WeeklyContentGoals";
import { WeeklyPlannerView } from "./components/WeeklyPlannerView";
import { VoiceStudioPanel } from "./components/VoiceStudioPanel";
import { ContentAuditView } from "./components/ContentAuditView";
import { ResearchVaultView } from "./components/ResearchVaultView";
import { CardDetailDrawer } from "./components/CardDetailDrawer";
import { MetricsModal } from "./components/MetricsModal";
import { NotionSyncModal } from "./components/NotionSyncModal";
import { QuickNoteFloating } from "./components/QuickNoteFloating";

const CHANNELS: { key: ChannelFilter; label: string }[] = [
  { key: "All Channels", label: "All Channels" },
  { key: "YouTube", label: "YouTube" },
  { key: "Instagram", label: "Instagram" },
  { key: "LinkedIn", label: "LinkedIn + Newsletter" },
  { key: "Substack", label: "Substack" },
  { key: "Reddit", label: "Reddit" },
];

export default function App() {
  const [selectedChannel, setSelectedChannel] =
    useState<ChannelFilter>("All Channels");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  const [metrics, setMetrics] = useState<ChannelMetric[]>(() =>
    loadFromStorage(STORAGE_KEYS.METRICS, INITIAL_CHANNEL_METRICS)
  );
  const [cards, setCards] = useState<ContentCard[]>(() =>
    loadFromStorage(STORAGE_KEYS.CARDS, INITIAL_CONTENT_CARDS)
  );
  const [vaultNotes, setVaultNotes] = useState<ResearchNote[]>(() =>
    loadFromStorage(STORAGE_KEYS.VAULT, INITIAL_RESEARCH_VAULT)
  );
  const [voiceDna, setVoiceDna] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.VOICE_DNA, DEFAULT_VOICE_DNA)
  );
  const [auditHistory, setAuditHistory] = useState<AuditResult[]>(() =>
    loadFromStorage(STORAGE_KEYS.AUDITS, [])
  );
  const [notionConfig, setNotionConfig] = useState<NotionConfig>(() =>
    loadFromStorage(STORAGE_KEYS.NOTION, INITIAL_NOTION_CONFIG)
  );
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(() =>
    loadFromStorage(STORAGE_KEYS.GOALS, INITIAL_WEEKLY_GOALS)
  );

  const [auditInputText, setAuditInputText] = useState(SAMPLE_AUDIT_POSTS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [metricsModalMode, setMetricsModalMode] = useState<
    "edit" | "csv" | null
  >(null);
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [voiceIdeaSeed, setVoiceIdeaSeed] = useState<string | undefined>(
    undefined
  );

  useEffect(() => saveToStorage(STORAGE_KEYS.METRICS, metrics), [metrics]);
  useEffect(() => saveToStorage(STORAGE_KEYS.CARDS, cards), [cards]);
  useEffect(() => saveToStorage(STORAGE_KEYS.VAULT, vaultNotes), [vaultNotes]);
  useEffect(
    () => saveToStorage(STORAGE_KEYS.VOICE_DNA, voiceDna),
    [voiceDna]
  );
  useEffect(
    () => saveToStorage(STORAGE_KEYS.AUDITS, auditHistory),
    [auditHistory]
  );
  useEffect(
    () => saveToStorage(STORAGE_KEYS.NOTION, notionConfig),
    [notionConfig]
  );
  useEffect(
    () => saveToStorage(STORAGE_KEYS.GOALS, weeklyGoals),
    [weeklyGoals]
  );

  const selectedCard = cards.find((c) => c.id === selectedCardId) || null;
  const latestAudit = auditHistory[0] || null;

  const handleUpdateCard = (updated: ContentCard) => {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCardId === id) setSelectedCardId(null);
  };

  const handleAddCard = (card: ContentCard) => {
    setCards((prev) => [card, ...prev]);
  };

  const handleInsertVoiceIntoCard = (
    cardId: string,
    payload: {
      hook?: string;
      script: string;
      caption?: string;
      shotList?: string[];
    }
  ) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const newShots =
          payload.shotList && payload.shotList.length > 0
            ? payload.shotList.map((desc, idx) => ({
                id: `shot-vs-${Date.now()}-${idx}`,
                category: desc.toLowerCase().includes("hud")
                  ? "HUD Animation"
                  : desc.toLowerCase().includes("diagram")
                    ? "Diagram Overlay"
                    : "Production Shot",
                description: desc,
                durationSec: 6,
                visualNote: "Generated by Voice Studio",
                completed: false,
              }))
            : c.shotList;

        return {
          ...c,
          selectedHook: payload.hook || c.selectedHook,
          script: payload.script,
          caption: payload.caption || c.caption,
          shotList: newShots,
        };
      })
    );
  };

  const handleCreateCardFromVoice = (
    platform: PlatformKey,
    title: string,
    script: string,
    hook: string,
    caption: string,
    shotList: string[]
  ) => {
    const prefixMap: Record<PlatformKey, string> = {
      YouTube: "YT",
      Instagram: "IG",
      LinkedIn: "LI",
      Substack: "SB",
      Reddit: "RD",
    };
    const newCard: ContentCard = {
      id: `card-${Date.now()}`,
      code: `${prefixMap[platform]}-${Math.floor(100 + Math.random() * 899)}`,
      platform,
      day: "Thu",
      scheduledTime: "14:00 UTC",
      status: "Scripting",
      title,
      topicTag: "#systems",
      researchNotes: "",
      referenceLinks: [],
      shotList: shotList.map((desc, idx) => ({
        id: `shot-new-${Date.now()}-${idx}`,
        category: "Production Shot",
        description: desc,
        durationSec: 6,
        visualNote: "Generated by Voice Studio",
        completed: false,
      })),
      hooks: hook
        ? [
            {
              id: `hk-new-${Date.now()}`,
              angleType: "Voice Studio Primary",
              hookText: hook,
              retentionRationale: "Matched to Brand Voice DNA",
              estimatedHoldRate: 94,
            },
          ]
        : [],
      selectedHook: hook,
      script,
      caption,
      estReach: "TBD",
    };
    setCards((prev) => [newCard, ...prev]);
    setSelectedCardId(newCard.id);
  };

  const navItems: {
    id: WorkspaceTab;
    label: string;
    icon: typeof BarChart3;
    meta?: string;
  }[] = [
    { id: "overview", label: "Overview & Analytics", icon: BarChart3 },
    {
      id: "audit",
      label: "AI Content Audit",
      icon: ShieldCheck,
      meta: latestAudit ? `${latestAudit.hookStrengthScore}` : undefined,
    },
    {
      id: "planner",
      label: "Weekly Planner",
      icon: CalendarDays,
      meta: `${cards.length}`,
    },
    {
      id: "vault",
      label: "Research Vault",
      icon: BookOpen,
      meta: `${vaultNotes.length}`,
    },
    { id: "voice", label: "Voice Engine", icon: Mic },
  ];

  return (
    <div className="min-h-screen bg-[#F78DA7] text-[#111111] flex flex-col">
      {/* TOP BAR (Typesafe Retro Masthead — single-line non-wrapping controls) */}
      <header className="sticky top-0 z-40 h-12 bg-[#F78DA7] border-b-2 border-[#111111] px-3 flex items-center justify-between gap-3 font-mono text-xs select-none">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-4 h-4 bg-white border border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center font-bold text-[9px]">
            ■
          </div>
          <span className="font-extrabold tracking-tight text-sm whitespace-nowrap">
            @antonov.systems
          </span>
        </div>

        {/* Multi-Account Switcher */}
        <nav
          aria-label="Channel Switcher"
          className="flex items-center gap-1 overflow-x-auto bg-[#111111]/10 p-0.5 border border-[#111111] min-w-0"
        >
          {CHANNELS.map((ch) => {
            const active = selectedChannel === ch.key;
            return (
              <button
                key={ch.key}
                onClick={() => setSelectedChannel(ch.key)}
                className={`px-2 py-0.5 text-[11px] border border-[#111111] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active
                    ? "bg-[#111111] text-[#F78DA7] font-bold shadow-[1px_1px_0px_#111111]"
                    : "bg-white text-[#111111] hover:bg-[#FFC0D0] font-medium"
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </nav>

        {/* Right Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("audit")}
            className="hidden sm:flex px-2.5 py-1 bg-[#03AA5C] hover:bg-[#028f4d] text-white font-bold text-[11px] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Run Content Audit</span>
          </button>
          <button
            onClick={() => setShowNotionModal(true)}
            className="px-2.5 py-1 bg-white hover:bg-[#FFC0D0] text-[#111111] font-bold text-[11px] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync to Notion</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* LEFT SIDEBAR: Retro Mac System 7 Explorer */}
        <aside className="hidden md:flex w-56 shrink-0 border-r-2 border-[#111111] bg-[#F78DA7] flex-col justify-between font-mono select-none">
          <div>
            <div className="h-6 px-2 border-b-2 border-[#111111] flex items-center gap-1.5 bg-white text-[10px] font-bold">
              <div className="w-2.5 h-2.5 border border-[#111111] bg-white shrink-0" />
              <div className="flex-1 mac-titlebar-stripes opacity-70" />
              <span className="px-1 uppercase tracking-wider">EXPLORER</span>
              <div className="flex-1 mac-titlebar-stripes opacity-70" />
            </div>

            <div className="p-2 space-y-1 text-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#111111]/75 px-1 py-1">
                Workspace Panes
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full px-2 py-1.5 flex items-center justify-between text-xs border cursor-pointer transition-colors ${
                      active
                        ? "bg-white text-[#111111] border-[#111111] shadow-[2px_2px_0px_#111111] font-bold"
                        : "bg-transparent border-transparent text-[#111111] hover:bg-white hover:border-[#111111] font-medium"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.meta && (
                      <span className="text-[9px] bg-[#77FCA4] border border-[#111111] px-1 font-bold tabular-nums">
                        {item.meta}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Domain Pillars */}
            <div className="mt-2 border-t-2 border-[#111111] p-2 space-y-1.5 bg-[#FFC0D0]/45">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#111111]">
                Domain Pillars
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between px-2 py-1 bg-white border border-[#111111]">
                  <span className="truncate">Aerospace</span>
                  <span className="text-[#03AA5C] font-bold tabular-nums">
                    {
                      cards.filter(
                        (c) =>
                          c.topicTag.includes("propulsion") ||
                          c.topicTag.includes("aero") ||
                          c.topicTag.includes("avionics") ||
                          c.topicTag.includes("orbital")
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-white border border-[#111111]">
                  <span className="truncate">System Dynamics</span>
                  <span className="text-[#03AA5C] font-bold tabular-nums">
                    {cards.filter((c) => c.topicTag.includes("system")).length}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1 bg-white border border-[#111111]">
                  <span className="truncate">Macro-Geopolitics</span>
                  <span className="text-[#03AA5C] font-bold tabular-nums">
                    {cards.filter((c) => c.topicTag.includes("geo")).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LocalStorage Persistence Summary */}
          <div className="border-t-2 border-[#111111] bg-white p-2.5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-1">
                <Database className="w-3 h-3 text-[#03AA5C]" />
                <span>LOCAL_STORAGE</span>
              </span>
              <span className="bg-[#03AA5C] text-white px-1 border border-[#111111] text-[9px]">
                SYNCED
              </span>
            </div>
            <div className="text-[9px] text-[#111111]/75">
              {cards.length} cards · {vaultNotes.length} vault ·{" "}
              {auditHistory.length} audits
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 min-w-0 p-3 lg:p-4 pb-20 bg-[#F78DA7] retro-grid-dots overflow-y-auto">
          <div className="max-w-[1680px] mx-auto space-y-3.5">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1 font-mono text-xs whitespace-nowrap border border-[#111111] cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#111111] text-[#F78DA7] font-bold"
                      : "bg-white text-[#111111]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <>
                <div className="border-2 border-[#111111] bg-white p-3 shadow-[3px_3px_0px_#111111] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#111111]/80">
                      <span className="bg-[#F78DA7] px-1.5 border border-[#111111] text-[#111111]">
                        @ANTONOV.SYSTEMS // SOCIAL COMMAND CENTER
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#111111] mt-1 uppercase">
                      Aerospace Engineering, System Dynamics &amp; Geopolitics
                    </h1>
                  </div>
                  <div className="border border-[#111111] p-1.5 bg-[#FFC0D0] font-mono text-xs text-right">
                    <div className="font-bold text-[10px] text-[#111111]/75">
                      ACTIVE CHANNEL SCOPE
                    </div>
                    <div className="font-black text-sm text-[#111111]">
                      {selectedChannel}
                    </div>
                  </div>
                </div>

                <AnalyticsBar
                  metrics={metrics}
                  selectedChannel={selectedChannel}
                  latestAudit={latestAudit}
                  onOpenEditMetrics={() => setMetricsModalMode("edit")}
                  onOpenCsvImport={() => setMetricsModalMode("csv")}
                  onNavigateAudit={() => setActiveTab("audit")}
                />

                <DailyPulse
                  cards={cards}
                  onSelectCard={(card) => setSelectedCardId(card.id)}
                  onScheduleToday={(todayDay: DayOfWeek) => {
                    const targetPlatform: PlatformKey =
                      selectedChannel === "All Channels"
                        ? "YouTube"
                        : selectedChannel;
                    const prefixMap: Record<PlatformKey, string> = {
                      YouTube: "YT",
                      Instagram: "IG",
                      LinkedIn: "LI",
                      Substack: "SB",
                      Reddit: "RD",
                    };
                    const newCard: ContentCard = {
                      id: `card-${Date.now()}`,
                      code: `${prefixMap[targetPlatform]}-${Math.floor(
                        100 + Math.random() * 899
                      )}`,
                      platform: targetPlatform,
                      day: todayDay,
                      scheduledTime: "16:00 UTC",
                      status: "Idea",
                      title: `New ${targetPlatform} Dispatch for ${todayDay}`,
                      topicTag: "#system-dynamics",
                      researchNotes: "",
                      referenceLinks: [],
                      shotList: [],
                      hooks: [],
                      selectedHook: "",
                      script: "",
                      caption: "",
                      estReach: "75K views",
                    };
                    handleAddCard(newCard);
                    setSelectedCardId(newCard.id);
                  }}
                />

                <WeeklyContentGoals
                  goals={weeklyGoals}
                  cards={cards}
                  selectedChannel={selectedChannel}
                  onUpdateGoal={(updatedGoal) =>
                    setWeeklyGoals((prev) =>
                      prev.map((g) =>
                        g.id === updatedGoal.id ? updatedGoal : g
                      )
                    )
                  }
                  onAddGoal={(goal) =>
                    setWeeklyGoals((prev) => [...prev, goal])
                  }
                  onDeleteGoal={(id) =>
                    setWeeklyGoals((prev) => prev.filter((g) => g.id !== id))
                  }
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                  <div className="lg:col-span-7">
                    <WeeklyPlannerView
                      cards={cards}
                      selectedChannel={selectedChannel}
                      defaultView="weave"
                      onSelectCard={(card) => setSelectedCardId(card.id)}
                      onAddCard={handleAddCard}
                      onChangeStatus={(cardId, status) =>
                        setCards((prev) =>
                          prev.map((c) =>
                            c.id === cardId ? { ...c, status } : c
                          )
                        )
                      }
                    />
                  </div>
                  <div className="lg:col-span-5">
                    <VoiceStudioPanel
                      selectedChannel={selectedChannel}
                      voiceDna={voiceDna}
                      onChangeVoiceDna={setVoiceDna}
                      cards={cards}
                      externalIdeaSeed={voiceIdeaSeed}
                      onInsertIntoCard={handleInsertVoiceIntoCard}
                      onCreateCardFromOutput={handleCreateCardFromVoice}
                      onOpenNotionModal={() => setShowNotionModal(true)}
                      compact
                    />
                  </div>
                </div>
              </>
            )}

            {/* CONTENT AUDIT TAB */}
            {activeTab === "audit" && (
              <>
                <AnalyticsBar
                  metrics={metrics}
                  selectedChannel={selectedChannel}
                  latestAudit={latestAudit}
                  onOpenEditMetrics={() => setMetricsModalMode("edit")}
                  onOpenCsvImport={() => setMetricsModalMode("csv")}
                  onNavigateAudit={() => setActiveTab("audit")}
                />
                <ContentAuditView
                  selectedChannel={selectedChannel}
                  metrics={metrics}
                  auditInputText={auditInputText}
                  onChangeAuditInput={setAuditInputText}
                  auditHistory={auditHistory}
                  onSaveAudit={(res) =>
                    setAuditHistory((prev) => [res, ...prev])
                  }
                  voiceDna={voiceDna}
                  cards={cards}
                  onOpenEditMetrics={() => setMetricsModalMode("edit")}
                  onOpenCsvImport={() => setMetricsModalMode("csv")}
                />
              </>
            )}

            {/* WEEKLY PLANNER TAB */}
            {activeTab === "planner" && (
              <WeeklyPlannerView
                cards={cards}
                selectedChannel={selectedChannel}
                defaultView="grid"
                onSelectCard={(card) => setSelectedCardId(card.id)}
                onAddCard={handleAddCard}
              />
            )}

            {/* RESEARCH VAULT TAB */}
            {activeTab === "vault" && (
              <ResearchVaultView
                notes={vaultNotes}
                onAddNote={(note) => setVaultNotes((prev) => [note, ...prev])}
                onDeleteNote={(id) =>
                  setVaultNotes((prev) => prev.filter((n) => n.id !== id))
                }
                onSendToVoiceStudio={(seed) => {
                  setVoiceIdeaSeed(seed);
                  setActiveTab("voice");
                }}
              />
            )}

            {/* VOICE ENGINE TAB */}
            {activeTab === "voice" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                <div className="lg:col-span-8">
                  <VoiceStudioPanel
                    selectedChannel={selectedChannel}
                    voiceDna={voiceDna}
                    onChangeVoiceDna={setVoiceDna}
                    cards={cards}
                    externalIdeaSeed={voiceIdeaSeed}
                    onInsertIntoCard={handleInsertVoiceIntoCard}
                    onCreateCardFromOutput={handleCreateCardFromVoice}
                    onOpenNotionModal={() => setShowNotionModal(true)}
                  />
                </div>
                <div className="lg:col-span-4 border-2 border-[#111111] bg-white shadow-[3px_3px_0px_#111111] p-3.5 space-y-3">
                  <div className="font-mono text-xs font-black uppercase bg-[#FFC0D0] border border-[#111111] px-2 py-1 text-[#111111]">
                    Active Brand Voice DNA
                  </div>
                  <textarea
                    rows={5}
                    value={voiceDna}
                    onChange={(e) => setVoiceDna(e.target.value)}
                    className="w-full bg-[#F9F6F0] border-2 border-[#111111] p-2.5 font-mono text-xs text-[#111111] leading-relaxed outline-none"
                  />
                  <div className="space-y-2 pt-2 border-t border-[#111111]/25 text-xs text-[#111111]">
                    <div className="font-mono text-[11px] font-black">
                      Platform Output Contracts:
                    </div>
                    <p>
                      <strong className="bg-[#FFC0D0] px-1">
                        YouTube / IG Reels:
                      </strong>{" "}
                      0–3s visual HUD hook, spoken hook, beat-paced technical
                      script, and shot list.
                    </p>
                    <p>
                      <strong className="bg-[#77FCA4] px-1">
                        LinkedIn &amp; Substack:
                      </strong>{" "}
                      Systems-breakdown essay with analytical bullet points and
                      stock-and-flow framing.
                    </p>
                    <p>
                      <strong className="bg-[#F9F6F0] border border-[#111111] px-1">
                        Reddit:
                      </strong>{" "}
                      Deep-dive technical discussion with explicit assumptions
                      and zero marketing tone.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Card Detail Slide-Over Drawer */}
      {selectedCard && (
        <CardDetailDrawer
          card={selectedCard}
          voiceDna={voiceDna}
          vaultNotes={vaultNotes}
          onClose={() => setSelectedCardId(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Manual Metrics / CSV Import Modal */}
      {metricsModalMode && (
        <MetricsModal
          mode={metricsModalMode}
          metrics={metrics}
          onClose={() => setMetricsModalMode(null)}
          onSaveMetrics={setMetrics}
          onImportPostsToAudit={(text) => {
            setAuditInputText(text);
            setActiveTab("audit");
          }}
          onResetMetrics={() => setMetrics(INITIAL_CHANNEL_METRICS)}
        />
      )}

      {/* Notion Sync Config Modal */}
      {showNotionModal && (
        <NotionSyncModal
          config={notionConfig}
          cards={cards}
          onSaveConfig={setNotionConfig}
          onClose={() => setShowNotionModal(false)}
        />
      )}
      {/* Floating Quick Note Capture */}
      <QuickNoteFloating
        onSaveToVault={(note) => setVaultNotes((prev) => [note, ...prev])}
        vaultCount={vaultNotes.length}
      />
    </div>
  );
}
