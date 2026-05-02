import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// AI Analysis engine — generates deep strategic insights for a niche
// Uses Claude when available, falls back to data-driven templates

interface NicheAnalysisInput {
  niche: {
    name: string;
    description: string | null;
    averageNicheScore: number;
    competitionLevel: string;
    trendDirection: string;
    estimatedCPM: number;
    channelCount: number;
  };
  channels: Array<{
    title: string;
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
    nicheScore: number;
    isOutlier: boolean;
    estimatedMonthlyRevenue: number;
    growthRate30d: number;
  }>;
}

function generateAnalysis(input: NicheAnalysisInput) {
  const { niche, channels } = input;
  const totalSubs = channels.reduce((s, c) => s + c.subscriberCount, 0);
  const avgSubs = channels.length > 0 ? Math.round(totalSubs / channels.length) : 0;
  const totalViews = channels.reduce((s, c) => s + Number(c.viewCount), 0);
  const avgViews = channels.length > 0 ? Math.round(totalViews / channels.length) : 0;
  const outlierCount = channels.filter((c) => c.isOutlier).length;
  const avgGrowth = channels.length > 0
    ? channels.reduce((s, c) => s + c.growthRate30d, 0) / channels.length
    : 0;
  const totalRevenue = channels.reduce((s, c) => s + c.estimatedMonthlyRevenue, 0);

  // Strategy Brief
  const trendText = niche.trendDirection === "UP"
    ? "rapidly growing with increasing search volume and viewer interest"
    : niche.trendDirection === "DOWN"
    ? "currently declining, which may indicate market saturation or shifting viewer preferences"
    : "showing stable demand with consistent audience interest";

  const compText = niche.competitionLevel === "LOW"
    ? "low competition, making it an excellent entry point for new creators"
    : niche.competitionLevel === "HIGH"
    ? "high competition from established creators, requiring differentiation to succeed"
    : "moderate competition with room for well-positioned newcomers";

  const strategy = `## Why "${niche.name}" is ${niche.averageNicheScore >= 70 ? "a high-potential" : niche.averageNicheScore >= 50 ? "a promising" : "a challenging"} niche

The ${niche.name} niche is ${trendText}. With ${niche.channelCount} tracked channels and an average NicheScore of ${niche.averageNicheScore.toFixed(1)}, this space has ${compText}.

**Key metrics:**
- Average subscribers per channel: ${avgSubs.toLocaleString()}
- Average total views: ${avgViews.toLocaleString()}
- Estimated CPM: $${niche.estimatedCPM.toFixed(2)}
- ${outlierCount} outlier channel${outlierCount !== 1 ? "s" : ""} identified (performing significantly above average)
- Average 30-day growth: ${avgGrowth > 0 ? "+" : ""}${avgGrowth.toFixed(1)}%

${niche.averageNicheScore >= 70 ? "**This niche scores in the top tier** — it combines strong audience demand with favorable monetization rates." : niche.averageNicheScore >= 50 ? "**This niche shows solid potential** but requires careful content positioning to stand out." : "**Proceed with caution** — consider adjacent niches or unique angles to improve your chances."}`;

  // Content Gaps
  const gaps = [
    `Most channels in ${niche.name} focus on ${channels.length > 0 ? "broad overviews" : "general content"}. There's an opportunity to create deep-dive, expert-level content that builds authority.`,
    `Few creators are using short-form content (YouTube Shorts) to funnel viewers into long-form ${niche.name} videos. This cross-format strategy is underutilized.`,
    `Educational "how-to" content with step-by-step breakdowns is underrepresented. Creators who teach actionable skills tend to build loyal audiences faster.`,
    `Community-driven content (polls, challenges, Q&A) is almost non-existent. This format drives high engagement and repeat viewership.`,
    `Comparison and "vs" content performs well in search but few channels in this niche create it consistently.`,
  ];

  // Risks
  const risks = [];
  if (niche.competitionLevel === "HIGH") {
    risks.push(`**High saturation risk.** With ${niche.channelCount} channels already in this space, standing out requires a clear unique value proposition.`);
  }
  if (niche.trendDirection === "DOWN") {
    risks.push(`**Declining trend.** Viewer interest appears to be waning. Consider timing your entry carefully or pivoting to an adjacent growing niche.`);
  }
  if (avgGrowth < 0) {
    risks.push(`**Negative average growth.** Channels in this niche are losing subscribers on average, suggesting audience fatigue.`);
  }
  if (niche.estimatedCPM < 5) {
    risks.push(`**Low CPM.** At $${niche.estimatedCPM.toFixed(2)} CPM, monetization will require high view volume. Consider sponsorship and affiliate strategies.`);
  }
  if (risks.length === 0) {
    risks.push(`**Low overall risk.** This niche has favorable metrics across the board. The main risk is failing to differentiate your content.`);
  }

  // Content Calendar
  const calendar = [
    { day: "Monday", type: "Educational Deep-Dive", description: `Long-form (10-15 min) breakdown of a specific ${niche.name} topic` },
    { day: "Wednesday", type: "Trending Topic Response", description: `React to or analyze trending news/developments in ${niche.name}` },
    { day: "Friday", type: "List or Comparison", description: `"Top 5/10" or "X vs Y" format — high search volume, shareable` },
    { day: "Saturday", type: "YouTube Short", description: `60-sec tip or highlight from your long-form content` },
  ];

  return {
    strategy,
    contentGaps: gaps,
    risks,
    calendar,
    metrics: {
      avgSubscribers: avgSubs,
      avgViews: avgViews,
      totalRevenue: Math.round(totalRevenue),
      outlierCount,
      avgGrowth: parseFloat(avgGrowth.toFixed(1)),
      nicheScore: niche.averageNicheScore,
      cpm: niche.estimatedCPM,
    },
  };
}

async function tryClaudeAnalysis(input: NicheAnalysisInput): Promise<ReturnType<typeof generateAnalysis> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const channelSummary = input.channels
      .slice(0, 5)
      .map((c) => `- ${c.title}: ${c.subscriberCount.toLocaleString()} subs, ${Number(c.viewCount).toLocaleString()} views, score ${c.nicheScore.toFixed(0)}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `You are a YouTube niche strategy expert. Analyze this niche and provide actionable insights.

Niche: ${input.niche.name}
Description: ${input.niche.description || "N/A"}
NicheScore: ${input.niche.averageNicheScore}/100
Competition: ${input.niche.competitionLevel}
Trend: ${input.niche.trendDirection}
CPM: $${input.niche.estimatedCPM}
Channels tracked: ${input.niche.channelCount}

Top channels:
${channelSummary}

Provide a JSON response with:
1. "strategy" - 2-3 paragraph markdown analysis of why this niche is/isn't profitable
2. "contentGaps" - Array of 5 specific content gaps creators can fill
3. "risks" - Array of 3-4 risks with bold headings
4. "calendar" - Array of 4 objects with day, type, description for weekly posting

Respond ONLY with valid JSON.`,
      }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const fallback = generateAnalysis(input);
      return {
        ...fallback,
        strategy: parsed.strategy || fallback.strategy,
        contentGaps: parsed.contentGaps || fallback.contentGaps,
        risks: parsed.risks || fallback.risks,
        calendar: parsed.calendar || fallback.calendar,
      };
    }
    return null;
  } catch (e) {
    console.log("Claude analysis unavailable:", (e as Error).message);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nicheId = searchParams.get("nicheId");

    if (!nicheId) {
      return NextResponse.json({ error: "Missing nicheId" }, { status: 400 });
    }

    const niche = await prisma.nicheCategory.findUnique({
      where: { id: nicheId },
      include: {
        _count: { select: { channels: true } },
        channels: {
          take: 10,
          orderBy: { nicheScore: "desc" },
          select: {
            title: true,
            subscriberCount: true,
            viewCount: true,
            videoCount: true,
            nicheScore: true,
            isOutlier: true,
            estimatedMonthlyRevenue: true,
            growthRate30d: true,
          },
        },
      },
    });

    if (!niche) {
      return NextResponse.json({ error: "Niche not found" }, { status: 404 });
    }

    const input: NicheAnalysisInput = {
      niche: {
        name: niche.name,
        description: niche.description,
        averageNicheScore: niche.averageNicheScore,
        competitionLevel: niche.competitionLevel,
        trendDirection: niche.trendDirection,
        estimatedCPM: niche.estimatedCPM,
        channelCount: niche._count.channels,
      },
      channels: niche.channels.map((c) => ({
        ...c,
        viewCount: Number(c.viewCount),
      })),
    };

    // Try Claude first, fall back to data-driven analysis
    const aiResult = await tryClaudeAnalysis(input);
    if (aiResult) {
      return NextResponse.json({ analysis: aiResult, source: "claude" });
    }

    const analysis = generateAnalysis(input);
    return NextResponse.json({ analysis, source: "engine" });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
