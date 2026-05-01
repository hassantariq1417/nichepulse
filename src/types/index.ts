// Global TypeScript types for NichePulse

export type Plan = "FREE" | "STARTER" | "PRO" | "TEAM";
export type ChannelFormat = "LONG_FORM" | "SHORT_FORM" | "BOTH";
export type CompetitionLevel = "LOW" | "MEDIUM" | "HIGH";
export type TrendDirection = "UP" | "STABLE" | "DOWN";

export interface Channel {
  id: string;
  youtubeId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  category: string | null;
  format: ChannelFormat;
  estimatedMonthlyRevenue: number;
  nicheScore: number;
  growthRate7d: number;
  growthRate30d: number;
  viewsLast48h: number;
  uploadFrequency: number;
  isOutlier: boolean;
  isTrending: boolean;
  createdAt: string;
  updatedAt: string;
  lastScrapedAt: string | null;
}

export interface NicheCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  averageNicheScore: number;
  channelCount: number;
  competitionLevel: CompetitionLevel;
  trendDirection: TrendDirection;
  estimatedCPM: number;
}

export interface VideoInsight {
  id: string;
  channelId: string;
  youtubeVideoId: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  isViral: boolean;
  viewsPerHour: number;
  thumbnail: string | null;
}

export interface UserSavedNiche {
  id: string;
  userId: string;
  channelId: string;
  notes: string | null;
  savedAt: string;
}

export interface VideoIdea {
  title: string;
  hook: string;
  whyItWorks: string;
  estimatedViews: string;
}

export interface ScriptOutline {
  hook: string;
  intro: string;
  sections: { title: string; content: string }[];
  cta: string;
}

export interface NicheRecommendation {
  channelId: string;
  channelTitle: string;
  nicheScore: number;
  reasoning: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardFeed {
  outliers: Channel[];
  trending: NicheCategory[];
  viral: VideoInsight[];
}

// Filter types for Niche Finder
export interface NicheFinderFilters {
  categories?: string[];
  format?: ChannelFormat | null;
  subscriberMin?: number;
  subscriberMax?: number;
  viewVelocityMin?: number;
  viewVelocityMax?: number;
  growthPeriod?: "7d" | "30d";
  growthMin?: number;
  competition?: CompetitionLevel | null;
  cpmMin?: number;
  cpmMax?: number;
  uploadFrequencyMin?: number;
  nicheScoreMin?: number;
  country?: string | null;
  monetizationEligible?: boolean | null;
  channelAgeMin?: number;
  channelAgeMax?: number;
  trendDirection?: TrendDirection | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
