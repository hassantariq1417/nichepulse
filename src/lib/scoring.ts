// NichePulse Scoring Algorithm
// Score = weighted average of 4 factors, returns 0-100

export interface ScoringInput {
  viewsLast48h: number;
  subscriberCount: number;
  growthRate30d: number;        // percentage
  channelsInNiche: number;
  totalNicheChannels: number;   // total across all niches for percentile
  estimatedCPM: number;
  monthlyViews: number;
  allGrowthRates: number[];     // for percentile calculation
}

export interface ScoreBreakdown {
  total: number;
  viewVelocityScore: number;
  growthMomentum: number;
  competitionGap: number;
  revenueEstimate: number;
  label: string;
  emoji: string;
  color: string;
}

/**
 * View Velocity Score (40% weight)
 * Measures views/48hr relative to subscriber count
 * A channel with 10K subs getting 50K views in 48hr is more impressive
 * than a 1M sub channel getting 50K views
 */
function calcViewVelocity(viewsLast48h: number, subscriberCount: number): number {
  if (subscriberCount === 0) return 0;
  const ratio = viewsLast48h / subscriberCount;
  // Typical ratio: 0.01-0.05 is normal, 0.1+ is excellent
  const score = Math.min(100, (ratio / 0.15) * 100);
  return Math.round(score);
}

/**
 * Growth Momentum (25% weight)
 * 30-day growth rate as a percentile among all tracked channels
 */
function calcGrowthMomentum(growthRate30d: number, allGrowthRates: number[]): number {
  if (allGrowthRates.length === 0) return 50;
  const sorted = [...allGrowthRates].sort((a, b) => a - b);
  const index = sorted.findIndex((r) => r >= growthRate30d);
  const percentile = index === -1 ? 100 : (index / sorted.length) * 100;
  return Math.round(percentile);
}

/**
 * Competition Gap (20% weight)
 * Fewer channels in niche = higher score (opportunity)
 */
function calcCompetitionGap(channelsInNiche: number, totalChannels: number): number {
  if (totalChannels === 0) return 50;
  const saturation = channelsInNiche / totalChannels;
  // Inverse: less saturation = higher score
  const score = (1 - saturation) * 100;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Revenue Estimate (15% weight)
 * Category CPM × monthly views estimate
 */
function calcRevenueEstimate(estimatedCPM: number, monthlyViews: number): number {
  const monthlyRevenue = (estimatedCPM * monthlyViews) / 1000;
  // Scale: $0 = 0, $500+ = 50, $2000+ = 80, $5000+ = 100
  if (monthlyRevenue >= 5000) return 100;
  if (monthlyRevenue >= 2000) return 80 + ((monthlyRevenue - 2000) / 3000) * 20;
  if (monthlyRevenue >= 500) return 50 + ((monthlyRevenue - 500) / 1500) * 30;
  return (monthlyRevenue / 500) * 50;
}

/**
 * Main scoring function
 */
export function nicheScore(input: ScoringInput): ScoreBreakdown {
  const viewVelocityScore = calcViewVelocity(input.viewsLast48h, input.subscriberCount);
  const growthMomentum = calcGrowthMomentum(input.growthRate30d, input.allGrowthRates);
  const competitionGap = calcCompetitionGap(input.channelsInNiche, input.totalNicheChannels);
  const revenueEstimate = calcRevenueEstimate(input.estimatedCPM, input.monthlyViews);

  const total = Math.round(
    viewVelocityScore * 0.4 +
    growthMomentum * 0.25 +
    competitionGap * 0.2 +
    revenueEstimate * 0.15
  );

  const { label, emoji, color } = getScoreLabel(total);

  return {
    total,
    viewVelocityScore,
    growthMomentum,
    competitionGap,
    revenueEstimate,
    label,
    emoji,
    color,
  };
}

export function getScoreLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 80) return { label: "Hot", emoji: "🔥", color: "text-niche-hot" };
  if (score >= 60) return { label: "Rising", emoji: "📈", color: "text-niche-rising" };
  if (score >= 40) return { label: "Watch", emoji: "👀", color: "text-niche-watch" };
  return { label: "Cold", emoji: "❄️", color: "text-niche-cold" };
}

export function getScoreBadgeClasses(score: number): string {
  if (score >= 80) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (score >= 40) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  return "bg-gray-500/20 text-gray-400 border-gray-500/30";
}
