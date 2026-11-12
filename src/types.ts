export type PlatformKey =
  | "YouTube"
  | "Instagram"
  | "LinkedIn"
  | "Substack"
  | "Reddit";

export type ChannelFilter = "All Channels" | PlatformKey;

export type WorkspaceTab =
  | "overview"
  | "audit"
  | "planner"
  | "vault"
  | "voice";

export type DayOfWeek = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type ContentStatus =
  | "Idea"
  | "Researching"
  | "Scripting"
  | "Recording"
  | "Ready"
  | "Published";

export interface ShotItem {
  id: string;
  category: string;
  description: string;
  durationSec: number;
  visualNote: string;
  completed: boolean;
}

export interface HookVariation {
  id: string;
  angleType: string;
  hookText: string;
  retentionRationale: string;
  estimatedHoldRate: number;
}

export interface ContentCard {
  id: string;
  code: string;
  platform: PlatformKey;
  day: DayOfWeek;
  scheduledTime: string;
  status: ContentStatus;
  title: string;
  topicTag: string;
  researchNotes: string;
  referenceLinks: string[];
  shotList: ShotItem[];
  hooks: HookVariation[];
  selectedHook: string;
  script: string;
  caption: string;
  estReach: string;
}

export interface ChannelMetric {
  platform: PlatformKey;
  handle: string;
  followers: number;
  followerDelta7d: number;
  impressions7d: number;
  impressionsDeltaPct: number;
  engagementRate: number;
  engagementMultiplier: number;
  retentionOrReadRate: number;
  conversionSharePct: number;
}

export interface ResearchNote {
  id: string;
  title: string;
  domain: "Aerospace" | "System Dynamics" | "Geopolitics";
  sourceUrl: string;
  summary: string;
  createdAt: string;
  linkedCardId?: string;
}

export interface AuditResult {
  id: string;
  timestamp: string;
  platformScope: ChannelFilter;
  overallScore: number;
  hookStrengthScore: number;
  retentionScore: number;
  executiveSummary: string;
  whatWorked: { pattern: string; evidence: string; impact: string }[];
  dropOffDiagnostics: { location: string; diagnosis: string; fix: string }[];
  tacticalAdjustments: {
    title: string;
    platform: string;
    action: string;
    expectedLift: string;
  }[];
  source?: string;
}

export interface VoiceStudioResult {
  platform: string;
  headline: string;
  visualHudHook: string;
  spokenHook: string;
  primaryBody: string;
  caption: string;
  shotList: string[];
  candidates: {
    angle: string;
    confidence: number;
    dwellEstimate: string;
    text: string;
  }[];
  cadenceCheck: {
    pacing: number;
    clarity: number;
    fluffPercent: number;
  };
  source?: string;
}

export interface NotionConfig {
  webhookUrl: string;
  notionToken: string;
  databaseId: string;
  lastSyncedAt: string | null;
}

export interface WeeklyGoal {
  id: string;
  platform: PlatformKey;
  label: string;
  targetCount: number;
}
