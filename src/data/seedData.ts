import {
  ChannelMetric,
  ContentCard,
  NotionConfig,
  ResearchNote,
  WeeklyGoal,
} from "../types";

export const DEFAULT_VOICE_DNA =
  "Analytical, systems-thinking, high-contrast, zero fluff, blending aerospace mechanics, stock-and-flow system dynamics, and macro-geopolitics.";

export const VOICE_CONSTRAINTS_LIST = [
  "Strict No-Hype",
  "Stock-and-Flow Framing",
  "Contrarian Opening",
  "Physical Constraints & Ratios",
  "Zero Marketing Tone",
];

export const INITIAL_CHANNEL_METRICS: ChannelMetric[] = [
  {
    platform: "YouTube",
    handle: "@antonov.systems",
    followers: 42400,
    followerDelta7d: 3180,
    impressions7d: 1840000,
    impressionsDeltaPct: 31.2,
    engagementRate: 8.15,
    engagementMultiplier: 2.4,
    retentionOrReadRate: 65.4,
    conversionSharePct: 31,
  },
  {
    platform: "Instagram",
    handle: "@antonov.systems",
    followers: 18500,
    followerDelta7d: 1420,
    impressions7d: 540000,
    impressionsDeltaPct: 24.8,
    engagementRate: 6.92,
    engagementMultiplier: 1.9,
    retentionOrReadRate: 71.0,
    conversionSharePct: 12,
  },
  {
    platform: "LinkedIn",
    handle: "Antonov Systems + Newsletter",
    followers: 94200,
    followerDelta7d: 6840,
    impressions7d: 1180000,
    impressionsDeltaPct: 27.6,
    engagementRate: 7.95,
    engagementMultiplier: 2.6,
    retentionOrReadRate: 78.5,
    conversionSharePct: 40,
  },
  {
    platform: "Substack",
    handle: "Antonov Systems Dispatch",
    followers: 24800,
    followerDelta7d: 1960,
    impressions7d: 210000,
    impressionsDeltaPct: 19.4,
    engagementRate: 9.4,
    engagementMultiplier: 2.2,
    retentionOrReadRate: 54.8,
    conversionSharePct: 17,
  },
  {
    platform: "Reddit",
    handle: "u/antonov_systems",
    followers: 6150,
    followerDelta7d: 890,
    impressions7d: 72910,
    impressionsDeltaPct: 34.5,
    engagementRate: 11.2,
    engagementMultiplier: 3.1,
    retentionOrReadRate: 84.0,
    conversionSharePct: 9,
  },
];

export const INITIAL_CONTENT_CARDS: ContentCard[] = [
  {
    id: "card-yt-104",
    code: "YT-104",
    platform: "YouTube",
    day: "Wed",
    scheduledTime: "14:00 UTC",
    status: "Recording",
    title:
      "Full-Flow Staged Combustion vs Methalox Thruster Trade-Offs Under Thermal Margin",
    topicTag: "#propulsion-dynamics",
    researchNotes:
      "Merlin Summary: Raptor-class full-flow staged combustion eliminates the inter-propellant seal failure mode, driving chamber pressures past 300 bar. However, turbine inlet oxygen-rich preburner alloys impose severe lead-time bottlenecks in specialized vacuum-induction-melted superalloy supply chains.",
    referenceLinks: [
      "https://ntrs.nasa.gov/citations/staged-combustion-thermal-limits",
      "https://merlin.research/notes/superalloy-supply-lag-2026",
    ],
    shotList: [
      {
        id: "shot-1",
        category: "HUD Animation",
        description:
          "0–3s tactical pressure gauge overlay jumping from 100 bar to 330 bar with redline warning",
        durationSec: 3,
        visualNote: "Monospace #FF7A00 telemetry bars over dark schematic grid",
        completed: true,
      },
      {
        id: "shot-2",
        category: "Diagram Overlay",
        description:
          "Side-by-side gas generator vs full-flow preburner loop animation",
        durationSec: 18,
        visualNote: "Highlight oxygen-rich vs fuel-rich mass flow paths",
        completed: true,
      },
      {
        id: "shot-3",
        category: "Camera A-Roll",
        description:
          "Workbench whiteboard breakdown of specific impulse vs manufacturing lead-time delay",
        durationSec: 25,
        visualNote: "Tight 35mm frame, high-contrast directional key light",
        completed: false,
      },
      {
        id: "shot-4",
        category: "B-Roll",
        description:
          "Nickel-chromium superalloy billet milling & static fire plume slow-motion",
        durationSec: 10,
        visualNote: "Subtle scanline HUD annotation for Mach diamonds",
        completed: false,
      },
    ],
    hooks: [
      {
        id: "hk-1",
        angleType: "Failure Mode",
        hookText:
          "Most rocket engines fail before ignition—because of a single rotating seal separating liquid oxygen from hot fuel-rich gas.",
        retentionRationale: "Anchors viewer in immediate physical failure threshold.",
        estimatedHoldRate: 96,
      },
      {
        id: "hk-2",
        angleType: "Supply Chain System Dynamics",
        hookText:
          "300 bar chamber pressure isn't a physics problem anymore. It's a 14-month superalloy foundry bottleneck.",
        retentionRationale: "Bridges propulsion mechanics to macro-industrial delay.",
        estimatedHoldRate: 92,
      },
    ],
    selectedHook:
      "Most rocket engines fail before ignition—because of a single rotating seal separating liquid oxygen from hot fuel-rich gas.",
    script:
      "[0:00–0:03] HUD HOOK: Show turbopump cross-section with red seal callout.\nSPOKEN: Most rocket engines fail before they even reach full thrust—because of one rotating seal.\n\n[0:03–0:22] MECHANISM: In an oxidizer-rich or fuel-rich staged cycle, keeping cryogenic LOX separated from 900K turbine gas requires heroic sealing tolerances. Full-flow staged combustion removes that boundary condition entirely by running two independent preburners.\n\n[0:22–0:48] SYSTEM DYNAMICS: Why doesn't everyone build full-flow? Because doubling the hot-gas manifold shifts the bottleneck from thermodynamic efficiency to superalloy forging lead time—creating a 14-month reinforcing delay in engine cadence.",
    caption:
      "Why 300-bar methalox architectures trade seal failure modes for foundry lead-time delays. Full propulsion + system dynamics breakdown.",
    estReach: "145K views",
  },
  {
    id: "card-li-089",
    code: "LI-089",
    platform: "LinkedIn",
    day: "Thu",
    scheduledTime: "08:30 EST",
    status: "Ready",
    title:
      "Why Semiconductor Export Controls Create Oscillatory Bullwhip Cascades (Stock-and-Flow Breakdown)",
    topicTag: "#system-dynamics",
    researchNotes:
      "Merlin Summary: When policy shocks restrict EUV lithography tools, downstream buyers double-order legacy-node DUV capacity, triggering an 18-month bullwhip inventory overshoot followed by localized fab utilization drops.",
    referenceLinks: [
      "https://ocw.mit.edu/system-dynamics-beer-game-oscillation",
    ],
    shotList: [
      {
        id: "shot-li-1",
        category: "Diagram Overlay",
        description: "Slide 01 Cover: Stock-and-flow causal loop of fab lead times",
        durationSec: 5,
        visualNote: "High-contrast #0B0D0F card with #FF7A00 flow arrows",
        completed: true,
      },
      {
        id: "shot-li-2",
        category: "Diagram Overlay",
        description: "Slide 02: 18-month capex delay vs demand signal graph",
        durationSec: 5,
        visualNote: "Plot phase shift between policy shock and inventory spike",
        completed: true,
      },
    ],
    hooks: [
      {
        id: "hk-li-1",
        angleType: "Contrarian Systems",
        hookText:
          "Export controls rarely shrink total global wafer capacity. They amplify the bullwhip oscillation across every adjacent node.",
        retentionRationale: "Challenges linear geopolitical commentary.",
        estimatedHoldRate: 94,
      },
    ],
    selectedHook:
      "Export controls rarely shrink total global wafer capacity. They amplify the bullwhip oscillation across every adjacent node.",
    script:
      "Export controls rarely shrink total global wafer capacity. They amplify the bullwhip oscillation across every adjacent node.\n\nWhen you introduce a hard boundary on leading-edge lithography:\n• Perceived scarcity spikes downstream safety-stock targets by 2.4x.\n• Because fab tooling carries a 14–22 month physical delivery delay, orders pile up in the supply pipeline.\n• Two years later, legacy-node capacity floods the market simultaneously, compressing margins across allied suppliers.\n\nPolicy analysts read static trade tables. Systems engineers read phase delays.",
    caption:
      "A 5-slide stock-and-flow breakdown of semiconductor capex delays and second-order geopolitical feedback loops.",
    estReach: "180K+ impressions",
  },
  {
    id: "card-ig-054",
    code: "IG-054",
    platform: "Instagram",
    day: "Fri",
    scheduledTime: "11:00 PST",
    status: "Ready",
    title: "Hypersonic Boundary Layer Heating Visualized in 20 Seconds",
    topicTag: "#aerothermodynamics",
    researchNotes:
      "Stagnation point heat flux scales with the cube of velocity (q ~ rho^0.5 * V^3). Doubling Mach from 5 to 10 increases thermal load by 8x.",
    referenceLinks: [],
    shotList: [
      {
        id: "shot-ig-1",
        category: "HUD Animation",
        description: "0–3s Mach 5 -> Mach 10 slider showing 8x thermal flux jump",
        durationSec: 3,
        visualNote: "9:16 vertical framing, crisp monospace counter",
        completed: true,
      },
      {
        id: "shot-ig-2",
        category: "B-Roll",
        description: "Arc-jet wind tunnel plasma bow-shock test footage",
        durationSec: 9,
        visualNote: "Overlay bow-shock standoff distance callout",
        completed: true,
      },
    ],
    hooks: [
      {
        id: "hk-ig-1",
        angleType: "Scaling Law",
        hookText:
          "Doubling speed from Mach 5 to Mach 10 doesn't double the heat—it multiplies thermal flux by 8.",
        retentionRationale: "Instant non-linear physics contrast.",
        estimatedHoldRate: 95,
      },
    ],
    selectedHook:
      "Doubling speed from Mach 5 to Mach 10 doesn't double the heat—it multiplies thermal flux by 8.",
    script:
      "[0:00-0:03] HUD: q ∝ V³ counter ramping to 8.0x.\nSPOKEN: Doubling speed from Mach 5 to Mach 10 doesn't double the heat—it multiplies it by eight.\n[0:03-0:18] Bow shock ionization compresses air to plasma before it ever touches the leading edge, turning nose-cone radius into a survival equation.",
    caption:
      "Why V³ aerodynamic heating governs hypersonic airframe geometry. #aerospace #thermodynamics",
    estReach: "38K reach",
  },
  {
    id: "card-rd-019",
    code: "RD-019",
    platform: "Reddit",
    day: "Tue",
    scheduledTime: "16:00 UTC",
    status: "Scripting",
    title:
      "Modeling Rare-Earth Refining Choke Points as a Two-Stock Delay System (r/SystemDynamics & r/geopolitics)",
    topicTag: "#geopolitics",
    researchNotes:
      "Separation and solvent-extraction stages require 400+ mixer-settler cells; permitting + environmental remediation lags take 6-9 years in Western jurisdictions vs 18 months for downstream magnet demand growth.",
    referenceLinks: [],
    shotList: [],
    hooks: [
      {
        id: "hk-rd-1",
        angleType: "Technical Inquiry",
        hookText:
          "I built a 2-stock delay model for NdFeB magnet refining lead times—curious where practitioners think my permitting lag assumption breaks.",
        retentionRationale: "Zero marketing tone; invites peer critique.",
        estimatedHoldRate: 91,
      },
    ],
    selectedHook:
      "I built a 2-stock delay model for NdFeB magnet refining lead times—curious where practitioners think my permitting lag assumption breaks.",
    script:
      "I've been modeling Western rare-earth separation capacity as a coupled stock-and-flow system rather than static annual tonnage.\n\nKey assumptions in the model:\n1. Mine-to-oxide extraction scales in ~3.5 years, but solvent-extraction separation requires 6–8 years due to chemical reagent permitting.\n2. Because refining is the rate-limiting stock, subsidizing upstream mining alone accumulates unprocessed concentrate without shifting magnet independence.\n\nFor anyone working in chemical processing or mineral supply chains: what's the realistic floor for solvent-extraction commissioning under current EPA/EU permitting?",
    caption: "Technical discussion post for r/geopolitics and r/SystemDynamics.",
    estReach: "420+ upvotes target",
  },
  {
    id: "card-sb-042",
    code: "SB-042",
    platform: "Substack",
    day: "Sat",
    scheduledTime: "12:00 EST",
    status: "Researching",
    title:
      "Orbital Launch Cadence as an Industrial Feedback Loop: Payload Mass vs Turnaround Time",
    topicTag: "#orbital-logistics",
    researchNotes:
      "Reusable booster refurbishment turnaround time dominates orbital mass-to-orbit throughput more than vehicle payload capacity once fleet size stabilizes below 12 cores.",
    referenceLinks: [
      "https://antonov.systems/notes/orbital-cadence-stocks",
    ],
    shotList: [
      {
        id: "shot-sb-1",
        category: "Diagram Overlay",
        description: "Fleet Turnaround Loop Schematic (Booster Stock vs Pad Queue)",
        durationSec: 10,
        visualNote: "High-res PNG schematic embed for Substack header",
        completed: false,
      },
    ],
    hooks: [
      {
        id: "hk-sb-1",
        angleType: "Throughput Law",
        hookText:
          "Cutting booster turnaround from 21 days to 4 days moves more mass to orbit than doubling rocket payload capacity.",
        retentionRationale: "Strong counter-intuitive quantitative thesis.",
        estimatedHoldRate: 93,
      },
    ],
    selectedHook:
      "Cutting booster turnaround from 21 days to 4 days moves more mass to orbit than doubling rocket payload capacity.",
    script:
      "In orbital logistics, engineers obsess over payload-to-LEO mass fractions. Yet Little's Law dictates that total annual upmass is governed far more aggressively by pad and thermal-protection turnaround cycle time.\n\n• Fleet Utilization Bound: A 10-booster fleet with a 21-day refurbishment cycle caps at ~173 launches/year.\n• Cycle-Time Leverage: Compressing inspection to 4 days unlocks >900 launch slots without altering a single engine bell.",
    caption:
      "Issue #42 of Antonov Systems Dispatch: Why launch cadence is a queuing theory problem.",
    estReach: "58% open rate",
  },
  {
    id: "card-yt-105",
    code: "YT-105",
    platform: "YouTube",
    day: "Mon",
    scheduledTime: "15:00 UTC",
    status: "Idea",
    title:
      "Why Phased-Array Radar Cooling Limits Electronic Warfare Range",
    topicTag: "#avionics",
    researchNotes:
      "GaN T/R modules push power density to 8-10 W/mm, turning airframe skin thermal dissipation into the true range ceiling.",
    referenceLinks: [],
    shotList: [],
    hooks: [],
    selectedHook: "",
    script: "",
    caption: "",
    estReach: "110K views",
  },
  {
    id: "card-li-090",
    code: "LI-090",
    platform: "LinkedIn",
    day: "Sun",
    scheduledTime: "10:00 EST",
    status: "Idea",
    title:
      "The 3 Delays That Break Defense Procurement Loops (And How Iterative Hardware Fixes Them)",
    topicTag: "#system-dynamics",
    researchNotes:
      "Requirements freeze -> 5-year test lag -> obsolete avionics upon delivery.",
    referenceLinks: [],
    shotList: [],
    hooks: [],
    selectedHook: "",
    script: "",
    caption: "",
    estReach: "95K impressions",
  },
];

export const INITIAL_RESEARCH_VAULT: ResearchNote[] = [
  {
    id: "res-1",
    title: "Turbopump Inter-Propellant Seal Thermal Envelope & Failure Modes",
    domain: "Aerospace",
    sourceUrl: "https://ntrs.nasa.gov/citations/staged-combustion-thermal-limits",
    summary:
      "Single-shaft oxidizer/fuel turbopumps depend on helium-purged dynamic seals. Full-flow staged combustion splits the turbopumps so each runs exclusively in fuel-rich or oxidizer-rich gas, trading mechanical seal risk for hot-manifold metallurgy.",
    createdAt: "2026-11-10",
    linkedCardId: "card-yt-104",
  },
  {
    id: "res-2",
    title: "Forrester Supply Chain Bullwhip Amplification Under Export Tariffs",
    domain: "System Dynamics",
    sourceUrl: "https://ocw.mit.edu/system-dynamics-beer-game-oscillation",
    summary:
      "When upstream lead time T_L exceeds 12 months and buyers observe a policy shock, panic ordering causes pipeline stock to overshoot steady-state demand by 2.2x–3.0x before collapsing.",
    createdAt: "2026-11-11",
    linkedCardId: "card-li-089",
  },
  {
    id: "res-3",
    title: "Heavy Rare Earth Solvent-Extraction Cascade Bottlenecks",
    domain: "Geopolitics",
    sourceUrl: "https://merlin.research/notes/ree-separation-cascades",
    summary:
      "Dysprosium and terbium separation requires 300–500 mixer-settler stages. Permitting chemical effluent lagoons takes 6+ years in OECD nations, rendering raw ore extraction subsidies ineffective without midstream refining.",
    createdAt: "2026-11-12",
    linkedCardId: "card-rd-019",
  },
  {
    id: "res-4",
    title: "GaN Active Electronically Scanned Array (AESA) Thermal Flux Ceiling",
    domain: "Aerospace",
    sourceUrl: "https://ieee.org/gan-aesa-liquid-cooling-loops",
    summary:
      "Transitioning from GaAs to GaN increases radar transmit power 4x, shifting the limiting constraint from RF amplification to closed-loop PAO coolant heat rejection at high altitude.",
    createdAt: "2026-11-12",
  },
];

export const SAMPLE_AUDIT_POSTS = `1. [YouTube] "Why 300-Bar Methalox Engines Trade Seal Failure for Foundry Delays" | Views: 164,200 | Avg View Duration: 67% | 30s Retention: 74% | Hook: "Most rocket engines fail before ignition—because of a single rotating seal separating LOX from hot gas."
2. [YouTube] "The Complete History of Soviet Closed-Cycle Turbopumps" | Views: 58,400 | Avg View Duration: 41% | 30s Retention: 51% | Hook: "In 1959, Soviet propulsion engineers began looking at ways to improve rocket efficiency..."
3. [LinkedIn] "Why Semiconductor Export Controls Create Bullwhip Cascades" | Impressions: 192,000 | Engagement: 8.4% | Saves: 4,120 | Hook: "Export controls rarely shrink total global wafer capacity. They amplify the bullwhip oscillation across every adjacent node."
4. [Instagram Reel] "Hypersonic Mach 10 V^3 Heating Law in 20s" | Reach: 44,900 | Completion: 82% | Shares: 1,940 | Hook: "Doubling speed from Mach 5 to Mach 10 doesn't double the heat—it multiplies thermal flux by 8."
5. [Substack] "Orbital Launch Cadence as a Queuing Theory Problem" | Opens: 14,200 (58%) | Replies: 94 | Hook: "Cutting booster turnaround from 21 days to 4 days moves more mass to orbit than doubling rocket payload capacity."
6. [Reddit r/geopolitics] "Why Rare-Earth Mining Subsidies Fail Without Separation Capacity" | Upvotes: 486 (97%) | Comments: 84 | Hook: "I built a 2-stock delay model for NdFeB magnet refining lead times—curious where practitioners think my permitting lag assumption breaks."`;

export const INITIAL_NOTION_CONFIG: NotionConfig = {
  webhookUrl: "",
  notionToken: "",
  databaseId: "",
  lastSyncedAt: null,
};

export const INITIAL_WEEKLY_GOALS: WeeklyGoal[] = [
  {
    id: "goal-yt",
    platform: "YouTube",
    label: "YouTube Videos",
    targetCount: 3,
  },
  {
    id: "goal-li",
    platform: "LinkedIn",
    label: "LinkedIn Breakdowns",
    targetCount: 2,
  },
  {
    id: "goal-ig",
    platform: "Instagram",
    label: "Instagram Reels",
    targetCount: 2,
  },
  {
    id: "goal-sb",
    platform: "Substack",
    label: "Substack Dispatches",
    targetCount: 1,
  },
  {
    id: "goal-rd",
    platform: "Reddit",
    label: "Reddit Deep Dives",
    targetCount: 2,
  },
];
