import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const MODEL_NAME = "gemini-3.8-flash";

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function handleGeminiError(err: unknown, res: express.Response) {
  const message =
    err instanceof Error ? err.message : "Unknown Gemini API error";
  console.error("[Gemini API Error]", message);
  const status =
    message.includes("403") || message.includes("PERMISSION_DENIED")
      ? 403
      : message.includes("429") || message.includes("RESOURCE_EXHAUSTED")
        ? 429
        : message.includes("400") || message.includes("API_KEY_INVALID")
          ? 400
          : 500;
  res.status(status).json({ error: message });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "2mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: Boolean(
        process.env.GEMINI_API_KEY &&
          process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"
      ),
    });
  });

  // 1. Content Audit Endpoint
  app.post("/api/ai/audit", async (req, res) => {
    try {
      const { postsText, platformFilter, voiceDna } = req.body as {
        postsText: string;
        platformFilter?: string;
        voiceDna?: string;
      };

      if (!postsText || !postsText.trim()) {
        res.status(400).json({ error: "Please provide post data to audit." });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        res.json({
          source: "fallback",
          overallScore: 84,
          hookStrengthScore: 87,
          retentionScore: 79,
          executiveSummary:
            "Posts anchored in concrete aerospace failure modes and quantitative stock-and-flow bottlenecks outperform abstract commentary by 2.3x. Primary drop-offs occur when structural definitions delay the core mechanism past line 3 or second 12.",
          whatWorked: [
            {
              pattern: "Quantified Constraint Framing",
              evidence: "Posts leading with physical or latency bounds (e.g., thermal margin, thrust-to-weight, supply chain lead time) held 68% higher 30-second retention.",
              impact: "+2.1x Saves & Shares",
            },
            {
              pattern: "Visual System Topology",
              evidence: "Feedback-loop diagrams and side-by-side trade-off matrices triggered strong LinkedIn and Reddit technical debate.",
              impact: "+64% Comment Depth",
            },
          ],
          dropOffDiagnostics: [
            {
              location: "0:08–0:18 / Paragraph 2 Setup",
              diagnosis: "Over-explaining background history before introducing the causal bottleneck causes technical viewers to skim or bounce.",
              fix: "Start directly at the failure threshold, then backfill system context only where needed to explain the constraint.",
            },
            {
              location: "Closing Call-to-Action",
              diagnosis: "Generic engagement prompts dilute @antonov.systems authority and underperform on Reddit/LinkedIn.",
              fix: "End with a falsifiable systems question or open engineering trade-off.",
            },
          ],
          tacticalAdjustments: [
            {
              title: "Compress Pre-Thesis Context to 1 Sentence",
              platform: platformFilter && platformFilter !== "All Channels" ? platformFilter : "YouTube / IG Reels",
              action: "Open with a visual HUD telemetry overlay + concrete physical limit in the first 3 seconds before historical context.",
              expectedLift: "+14% 30s Retention",
            },
            {
              title: "Convert Top Bottleneck Into Stock-and-Flow Carousel",
              platform: "LinkedIn + Substack",
              action: "Break multi-variable geopolitical supply chains into 4 explicit stock/flow/delay slides with zero narrative filler.",
              expectedLift: "+35% Saves-to-Reach",
            },
            {
              title: "Publish Raw Trade-Off Memo on Technical Subreddits",
              platform: "Reddit",
              action: "Strip all promotional framing; present assumptions, equations/ratios, and ask engineers where the model breaks.",
              expectedLift: "+2.8x Discussion Depth",
            },
          ],
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze the following recent social content for @antonov.systems (Focus: aerospace engineering, system dynamics, macro-geopolitics).
Target Scope: ${platformFilter || "All Channels"}
Brand Voice DNA: ${voiceDna || "Analytical, systems-thinking, high-contrast, zero fluff, blending aerospace mechanics, stock-and-flow system dynamics, and macro-geopolitics."}

Recent Posts / Metrics:
${postsText}`,
        config: {
          systemInstruction:
            "You are a ruthless editorial and audience-retention analyst for @antonov.systems. Evaluate hook strength, retention drop-offs, causal clarity, and voice fidelity. Never give generic social media advice like 'post more consistently' or 'use trending audio'. Give engineering-grade, concrete diagnostics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              hookStrengthScore: { type: Type.INTEGER },
              retentionScore: { type: Type.INTEGER },
              executiveSummary: { type: Type.STRING },
              whatWorked: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    pattern: { type: Type.STRING },
                    evidence: { type: Type.STRING },
                    impact: { type: Type.STRING },
                  },
                },
              },
              dropOffDiagnostics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    location: { type: Type.STRING },
                    diagnosis: { type: Type.STRING },
                    fix: { type: Type.STRING },
                  },
                },
              },
              tacticalAdjustments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    platform: { type: Type.STRING },
                    action: { type: Type.STRING },
                    expectedLift: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ source: "gemini", ...parsed });
    } catch (err) {
      handleGeminiError(err, res);
    }
  });

  // 2. Voice-Matched AI Studio Endpoint
  app.post("/api/ai/voice-studio", async (req, res) => {
    try {
      const { idea, targetPlatform, voiceDna, constraints, refineInstruction } =
        req.body as {
          idea: string;
          targetPlatform: string;
          voiceDna: string;
          constraints: string[];
          refineInstruction?: string;
        };

      if (!idea || !idea.trim()) {
        res.status(400).json({ error: "Please enter a rough idea or research note." });
        return;
      }

      const ai = getAiClient();
      if (!ai) {
        const isVideo =
          targetPlatform === "YouTube" || targetPlatform === "Instagram";
        const isReddit = targetPlatform === "Reddit";

        res.json({
          source: "fallback",
          platform: targetPlatform,
          headline: isReddit
            ? `Failure modes in scaling ${idea.slice(0, 48).trim()}...`
            : `The hidden bottleneck behind ${idea.slice(0, 48).trim()}`,
          visualHudHook: isVideo
            ? "[00:00–00:03] HUD TELEMETRY OVERLAY: Split-screen causal loop diagram locking onto primary constraint delta (REDLINE THRESHOLD)."
            : "",
          spokenHook: isVideo
            ? "Everyone models this as a linear capacity problem. In reality, a single feedback delay turns a 12% margin into total system stall."
            : "",
          primaryBody: isReddit
            ? `I've been modeling the system dynamics behind this constraint and wanted to pressure-test the assumptions here.\n\n1. Stock & Flow Bottleneck: ${idea}\n2. Second-Order Delay: Lead-time amplification creates oscillatory shortages even when aggregate capacity looks nominal.\n3. Open Question: Where does your real-world operational experience contradict this boundary condition?`
            : isVideo
              ? `[0:00-0:03] HOOK: Start mid-diagnosis. Show the exact failure threshold on screen.\n[0:03-0:18] MECHANISM: Break down the physical/systems constraint from ${idea}.\n[0:18-0:42] SYSTEM DYNAMICS: Map the reinforcing loop and why conventional fixes worsen oscillation.\n[0:42-0:58] GEOPOLITICAL / SCALE CONSEQUENCE: Close on the structural implication—zero fluff.`
              : `Most analyses of ${idea.slice(0, 60)} miss the governing delay variable.\n\n• Stock-and-Flow Constraint: Linear forecasts break when upstream lead times exceed demand cycle time.\n• Structural Trade-Off: Optimizing unit cost erodes buffer stock, amplifying tail-risk cascades.\n• Macro Implication: Resilience requires redundant flow paths, not higher peak throughput.`,
          caption: isReddit
            ? "Technical discussion draft — zero promotional links."
            : "System dynamics breakdown for @antonov.systems. Save the causal loop reference.",
          shotList: isVideo
            ? [
                "HUD Animation: Monospace telemetry counter + threshold warning bar (0–3s)",
                "A-Roll Tight Frame: Direct-to-lens delivery under high-contrast key light",
                "Diagram Overlay: Stock-and-flow causal loop showing delay node",
                "B-Roll: Aerospace hardware / schematic cross-section pan",
              ]
            : [],
          candidates: [
            {
              angle: "HIGH CONTRARIAN",
              confidence: 96,
              dwellEstimate: isVideo ? "54s avg hold" : "~48s read",
              text: "Most teams optimize unit throughput when the governing constraint is actually feedback delay across the boundary layer.",
            },
            {
              angle: "FIRST-PRINCIPLES SCHEMATIC",
              confidence: 93,
              dwellEstimate: isVideo ? "49s avg hold" : "~42s read",
              text: "If you map this as a 3-node stock-and-flow system instead of a static spreadsheet, the failure point becomes obvious in 10 seconds.",
            },
          ],
          cadenceCheck: {
            pacing: 95,
            clarity: 93,
            fluffPercent: 0,
          },
        });
        return;
      }

      const platformGuidelines =
        targetPlatform === "YouTube" || targetPlatform === "Instagram"
          ? "FORMAT RULES FOR YOUTUBE / IG REELS: Provide a concrete Visual HUD Hook (0-3s screen overlay/diagram), Spoken Hook (1 punchy sentence), Paced Technical Script with timestamp beats [0:00-0:03] etc., and a specific Shot List of camera/HUD/diagram shots."
          : targetPlatform === "Reddit"
            ? "FORMAT RULES FOR REDDIT: Deep-dive technical discussion post with ZERO marketing tone, ZERO emojis, ZERO clickbait. State explicit assumptions, engineering trade-offs, system dynamics mechanics, and end with an authentic technical question for practitioners."
            : "FORMAT RULES FOR LINKEDIN / SUBSTACK: High-contrast systems-breakdown essay/post. Open with a sharp thesis line, follow with analytical bullet points covering mechanics, stock-and-flow dynamics, and macro-geopolitical consequences. Zero fluff or engagement bait.";

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate platform-native content for @antonov.systems.

Target Platform: ${targetPlatform}
Brand Voice DNA: ${voiceDna}
Active Voice Constraints: ${constraints.join(", ")}
${refineInstruction ? `Refinement Directive: ${refineInstruction}` : ""}

Raw Idea / Research Note:
${idea}

${platformGuidelines}`,
        config: {
          systemInstruction:
            "You are the Voice Engine for @antonov.systems. Your writing blends aerospace engineering rigor, stock-and-flow system dynamics, and macro-geopolitics. High contrast, zero fluff, zero generic AI hype words ('game-changer', 'revolutionize', 'delve', 'unlock').",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              visualHudHook: {
                type: Type.STRING,
                description:
                  "For YouTube/Instagram: 0-3s visual HUD hook description. Empty string for text-only platforms.",
              },
              spokenHook: {
                type: Type.STRING,
                description:
                  "For YouTube/Instagram: opening spoken hook. For text platforms: opening thesis sentence.",
              },
              primaryBody: {
                type: Type.STRING,
                description:
                  "Full paced script (for video) or systems-breakdown post / technical Reddit post.",
              },
              caption: { type: Type.STRING },
              shotList: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4-6 specific camera shots, HUD animations, or diagram overlays.",
              },
              candidates: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    angle: { type: Type.STRING },
                    confidence: { type: Type.INTEGER },
                    dwellEstimate: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                },
              },
              cadenceCheck: {
                type: Type.OBJECT,
                properties: {
                  pacing: { type: Type.INTEGER },
                  clarity: { type: Type.INTEGER },
                  fluffPercent: { type: Type.INTEGER },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ source: "gemini", platform: targetPlatform, ...parsed });
    } catch (err) {
      handleGeminiError(err, res);
    }
  });

  // 3. Generate 5 High-Retention Hooks Endpoint
  app.post("/api/ai/hooks", async (req, res) => {
    try {
      const { title, platform, researchNotes, voiceDna } = req.body as {
        title: string;
        platform: string;
        researchNotes?: string;
        voiceDna?: string;
      };

      const ai = getAiClient();
      if (!ai) {
        res.json({
          source: "fallback",
          hooks: [
            {
              angleType: "Failure Threshold",
              hookText: `Most engineers optimize ${title.slice(0, 32)} at steady state—which fails the moment a 4-second feedback delay hits.`,
              retentionRationale: "Establishes immediate physical/mathematical stakes.",
              estimatedHoldRate: 94,
            },
            {
              angleType: "Contrarian Mechanism",
              hookText: "Adding capacity to a bottlenecked loop makes the oscillation worse, not better.",
              retentionRationale: "Violates linear intuition, forcing mental resolution.",
              estimatedHoldRate: 91,
            },
            {
              angleType: "Geopolitical Leverage",
              hookText: "Three choke points control 82% of this supply chain—and none of them show up in standard cost models.",
              retentionRationale: "Combines hard ratio with hidden structural leverage.",
              estimatedHoldRate: 89,
            },
            {
              angleType: "First-Principles Teardown",
              hookText: "If you strip away the marketing specs, the entire architecture comes down to one thermal equation.",
              retentionRationale: "Signals zero-fluff engineering credibility.",
              estimatedHoldRate: 88,
            },
            {
              angleType: "Historical Analog",
              hookText: "The exact control-loop failure that grounded test flights in 1968 is repeating in modern autonomous stacks.",
              retentionRationale: "Creates cross-era pattern curiosity.",
              estimatedHoldRate: 86,
            },
          ],
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate 5 high-retention hooks for @antonov.systems.
Title: ${title}
Platform: ${platform}
Voice DNA: ${voiceDna || "Analytical, systems-thinking, high-contrast, zero fluff."}
Research Notes: ${researchNotes || "None provided."}`,
        config: {
          systemInstruction:
            "Generate 5 distinct, high-retention hooks tailored to @antonov.systems (aerospace engineering, system dynamics, macro-geopolitics). No clickbait fluff, no hollow adjectives.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hooks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    angleType: { type: Type.STRING },
                    hookText: { type: Type.STRING },
                    retentionRationale: { type: Type.STRING },
                    estimatedHoldRate: { type: Type.INTEGER },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ source: "gemini", ...parsed });
    } catch (err) {
      handleGeminiError(err, res);
    }
  });

  // 4. Generate Visual Shot List & B-Roll Endpoint
  app.post("/api/ai/shotlist", async (req, res) => {
    try {
      const { title, platform, researchNotes, script } = req.body as {
        title: string;
        platform: string;
        researchNotes?: string;
        script?: string;
      };

      const ai = getAiClient();
      if (!ai) {
        res.json({
          source: "fallback",
          shots: [
            {
              category: "HUD Animation",
              description: "0–3s tactical telemetry header locking onto primary boundary variable.",
              durationSec: 3,
              visualNote: "Monospace #FF7A00 overlay on dark #0B0D0F schematic grid",
            },
            {
              category: "Camera A-Roll",
              description: "Tight medium shot at workbench explaining the core physical constraint.",
              durationSec: 12,
              visualNote: "High-contrast side key light, 35mm lens",
            },
            {
              category: "Diagram Overlay",
              description: "Stock-and-flow causal loop showing feedback delay node and oscillation.",
              durationSec: 10,
              visualNote: "Animate flow arrows sequentially in sync with spoken beat",
            },
            {
              category: "B-Roll",
              description: "Archival aerospace test telemetry / hardware cross-section pan.",
              durationSec: 8,
              visualNote: "Slow 10% digital push-in with subtle scanline grid",
            },
            {
              category: "HUD Animation",
              description: "Side-by-side trade-off matrix summarizing failure vs stable regime.",
              durationSec: 7,
              visualNote: "Highlight winning invariant in emerald/amber",
            },
          ],
        });
        return;
      }

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Generate a production-ready Visual Shot List & B-Roll checklist for @antonov.systems.
Title: ${title}
Platform: ${platform}
Research Notes: ${researchNotes || ""}
Script Draft: ${script || ""}`,
        config: {
          systemInstruction:
            "Create a concise, concrete production shot list (5-6 items) mixing Camera A-Roll, HUD Animations, Diagram Overlays (stock-and-flow / schematics), and B-Roll tailored to @antonov.systems visual style.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              shots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                    durationSec: { type: Type.INTEGER },
                    visualNote: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ source: "gemini", ...parsed });
    } catch (err) {
      handleGeminiError(err, res);
    }
  });

  // 5. Notion / Webhook Proxy Endpoint
  app.post("/api/notion/push", async (req, res) => {
    try {
      const { webhookUrl, notionToken, databaseId, payload } = req.body as {
        webhookUrl: string;
        notionToken?: string;
        databaseId?: string;
        payload: unknown;
      };

      if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl.trim())) {
        res
          .status(400)
          .json({ error: "Please provide a valid http(s) Webhook or Notion Proxy URL." });
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (notionToken && notionToken.trim()) {
        headers["Authorization"] = `Bearer ${notionToken.trim()}`;
        headers["Notion-Version"] = "2022-06-28";
      }

      const bodyToSend =
        databaseId && databaseId.trim()
          ? { database_id: databaseId.trim(), ...(payload as object) }
          : payload;

      const upstream = await fetch(webhookUrl.trim(), {
        method: "POST",
        headers,
        body: JSON.stringify(bodyToSend),
      });

      const responseText = await upstream.text();
      if (!upstream.ok) {
        res.status(upstream.status).json({
          ok: false,
          status: upstream.status,
          error: `Upstream returned HTTP ${upstream.status}: ${responseText.slice(0, 300)}`,
        });
        return;
      }

      res.json({
        ok: true,
        status: upstream.status,
        responsePreview: responseText.slice(0, 400) || "Accepted",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reach webhook endpoint";
      res.status(502).json({ ok: false, error: message });
    }
  });

  // Vite dev / static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `@antonov.systems Command Center running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();
