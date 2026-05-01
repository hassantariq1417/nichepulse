/**
 * NichePulse Scoring Algorithm v2
 *
 * Pure functions — no async, no API calls.
 * Takes channel metrics → returns NicheScore (0-100).
 *
 * Score = weighted average of 4 components:
 *   viewVelocity     × 0.40  (most important signal)
 *   growthMomentum   × 0.25
 *   competitionGap   × 0.20
 *   uploadConsistency × 0.15
 */

// ─── Types ───────────────────────────────────────────────────────

export interface ScoringInput {
  subscriberCount: number;
  videoCount: number;
  uploadFrequency: number; // days between uploads
  recentVideos: Array<{ viewCount: number }>;
  avgViews: number;
  viewsLast48h?: number;
  categorySlug?: string;
}

export interface ScoreBreakdown {
  total: number;
  viewVelocity: number;
  growthMomentum: number;
  competitionGap: number;
  uploadConsistency: number;
  label: string;
  emoji: string;
  color: string;
  bg: string;
}

// ─── Score Labels ────────────────────────────────────────────────

export function getScoreLabel(score: number): {
  label: string;
  emoji: string;
  color: string;
  bg: string;
} {
  if (score >= 80) return { label: "Hot", emoji: "🔥", color: "#34D399", bg: "#064E3B" };
  if (score >= 60) return { label: "Rising", emoji: "📈", color: "#FCD34D", bg: "#3B2F00" };
  if (score >= 40) return { label: "Watch", emoji: "👀", color: "#60A5FA", bg: "#1E3A5F" };
  return { label: "Cold", emoji: "❄️", color: "#94A3B8", bg: "#1E293B" };
}

export function getScoreBadgeClasses(score: number): string {
  if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (score >= 40) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

// ─── Main Scoring Function ───────────────────────────────────────

export function calculateNicheScore(input: ScoringInput): number {
  const vv = calcViewVelocity(input);
  const gm = calcGrowthMomentum(input);
  const cg = calcCompetitionGap(input);
  const uc = calcUploadConsistency(input);

  const total = Math.round(vv * 0.4 + gm * 0.25 + cg * 0.2 + uc * 0.15);
  return Math.max(0, Math.min(100, total));
}

export function calculateNicheScoreDetailed(input: ScoringInput): ScoreBreakdown {
  const vv = calcViewVelocity(input);
  const gm = calcGrowthMomentum(input);
  const cg = calcCompetitionGap(input);
  const uc = calcUploadConsistency(input);

  const total = Math.round(vv * 0.4 + gm * 0.25 + cg * 0.2 + uc * 0.15);
  const clamped = Math.max(0, Math.min(100, total));
  const { label, emoji, color, bg } = getScoreLabel(clamped);

  return {
    total: clamped,
    viewVelocity: vv,
    growthMomentum: gm,
    competitionGap: cg,
    uploadConsistency: uc,
    label,
    emoji,
    color,
    bg,
  };
}

// ─── Component 1: View Velocity (0-100) ──────────────────────────

function calcViewVelocity(input: ScoringInput): number {
  const { subscriberCount, avgViews, viewsLast48h } = input;
  if (subscriberCount === 0) return 0;

  // Use 48h data if available, otherwise fall back to avg views
  const views = viewsLast48h || avgViews;
  const ratio = views / subscriberCount;

  // ratio / 0.3 * 100: 30% views/subs = 100 score
  const score = (ratio / 0.3) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Component 2: Growth Momentum (0-100) ────────────────────────

function calcGrowthMomentum(input: ScoringInput): number {
  const { uploadFrequency, subscriberCount, recentVideos, avgViews } = input;
  let score = 50;

  // Upload frequency bonuses
  if (uploadFrequency <= 1) score += 25;
  else if (uploadFrequency <= 3) score += 20;
  else if (uploadFrequency <= 7) score += 10;
  else if (uploadFrequency <= 14) score += 0;
  else score -= 15;

  // Outlier video bonus: any video > 3× channel average
  if (avgViews > 0 && recentVideos.length > 0) {
    const hasOutlier = recentVideos.some((v) => v.viewCount > avgViews * 3);
    if (hasOutlier) score += 15;
  }

  // Small channel bonus
  if (subscriberCount < 10_000) score += 10;
  else if (subscriberCount < 100_000) score += 5;

  return Math.max(0, Math.min(100, score));
}

// ─── Component 3: Competition Gap (0-100) ────────────────────────

function calcCompetitionGap(input: ScoringInput): number {
  const { subscriberCount } = input;

  // Use subscriber count as proxy for niche saturation
  if (subscriberCount < 5_000) return 85;
  if (subscriberCount < 25_000) return 75;
  if (subscriberCount < 100_000) return 60;
  if (subscriberCount < 500_000) return 45;
  return 30;
}

// ─── Component 4: Upload Consistency (0-100) ─────────────────────

function calcUploadConsistency(input: ScoringInput): number {
  const { uploadFrequency, videoCount } = input;

  // Frequency score
  let score: number;
  if (uploadFrequency <= 3) score = 100;
  else if (uploadFrequency <= 7) score = 85;
  else if (uploadFrequency <= 14) score = 65;
  else if (uploadFrequency <= 30) score = 40;
  else score = 20;

  // Video count bonus/penalty
  if (videoCount >= 200) score += 10;
  else if (videoCount >= 50) score += 5;
  else if (videoCount < 10) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// ─── CPM Table ───────────────────────────────────────────────────

const CATEGORY_CPM: Record<string, number> = {
  finance: 22,
  real_estate: 18,
  business: 16,
  coding: 14,
  ai_tools: 13,
  health: 12,
  productivity: 11,
  mindset: 10,
  luxury: 9,
  language: 8,
  stoicism: 8,
  fitness: 7,
  true_crime: 7,
  dark_history: 6,
  travel: 6,
};

const DEFAULT_CPM = 7;

// ─── Revenue Estimation ──────────────────────────────────────────

export function estimateMonthlyRevenue(
  monthlyViews: number,
  category?: string
): number {
  const cpm = CATEGORY_CPM[category || ""] || DEFAULT_CPM;
  return Math.round((monthlyViews / 1000) * cpm * 0.6); // 60% monetization rate
}

export function estimateMonthlyViews(
  subscriberCount: number,
  uploadFrequency: number
): number {
  const viewsPerVideo = subscriberCount * 0.08; // 8% engagement rate
  const uploadsPerMonth = 30 / Math.max(uploadFrequency, 1);
  return Math.round(viewsPerVideo * uploadsPerMonth);
}

// ─── Legacy Compatibility ────────────────────────────────────────
// Keep old exports working for existing dashboard components

export function nicheScore(input: {
  viewsLast48h: number;
  subscriberCount: number;
  growthRate30d: number;
  channelsInNiche: number;
  totalNicheChannels: number;
  estimatedCPM: number;
  monthlyViews: number;
  allGrowthRates: number[];
}): ScoreBreakdown {
  const total = calculateNicheScore({
    subscriberCount: input.subscriberCount,
    videoCount: 0,
    uploadFrequency: 7,
    recentVideos: [],
    avgViews: input.viewsLast48h,
    viewsLast48h: input.viewsLast48h,
  });

  const { label, emoji, color, bg } = getScoreLabel(total);
  return {
    total,
    viewVelocity: 0,
    growthMomentum: 0,
    competitionGap: 0,
    uploadConsistency: 0,
    label,
    emoji,
    color,
    bg,
  };
}
