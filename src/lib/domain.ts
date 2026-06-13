export type Platform = "Pinterest" | "TikTok" | "Google Trends" | "Reddit" | "Web";
export type ContentPlatform = "pinterest" | "tiktok" | "web";
export type ContentStatus = "draft" | "queued" | "scheduled" | "published" | "mock_published";
export type ProductStatus = "new" | "scored" | "active" | "winner" | "paused";
export type AutopilotMode = "dry_run" | "manual_review" | "full_autopilot";
export type ProductSource = "Amazon Creators API" | "Amazon PA-API" | "owned catalog import" | "manual import" | "mock Amazon" | "mock Walmart" | "mock Target" | "mock direct brand" | string;

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  commissionEstimate: number;
  productUrl: string;
  affiliateUrl: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  source: ProductSource;
  niche: string;
  trendScore: number;
  visualScore: number;
  buyerIntent: number;
  commissionValue: number;
  priceValue: number;
  competitionPenalty: number;
  opportunityScore: number;
  status: ProductStatus;
};

export type Trend = {
  id: string;
  slug: string;
  keyword: string;
  niche: string;
  platform: Platform;
  velocity: number;
  confidence: number;
  exampleHooks: string[];
  matchingProducts: string[];
  status: "rising" | "watching" | "peaked" | "manual";
};

export type ViralAngle = {
  id: string;
  slug: string;
  hookType: string;
  visualStyle: string;
  painPoint: string;
  audience: string;
  emotionalAngle: string;
  ctaStyle: string;
  platform: ContentPlatform | "all";
  niche: string;
  productCategory: string;
};

export type ContentItem = {
  id: string;
  productId: string;
  trendId?: string;
  angleId?: string;
  platform: ContentPlatform;
  type: "pin" | "tiktok_script" | "product_page" | "comparison" | "gift_guide" | "best_x_for_y";
  title: string;
  body: Record<string, unknown>;
  status: ContentStatus;
  disclosureLine: string;
  cta: string;
  scheduledFor?: string;
  publishedAt?: string;
  exportPath?: string;
  createdAt: string;
};

export type Asset = {
  id: string;
  productId: string;
  contentId?: string;
  type: "pinterest_card" | "product_collage" | "comparison_graphic" | "before_after" | "tiktok_storyboard";
  title: string;
  url: string;
  spec: Record<string, unknown>;
  svg: string;
  status: "generated" | "exported";
  createdAt: string;
};

export type LandingPage = {
  id: string;
  productId: string;
  type: "product" | "guide" | "compare";
  slug: string;
  title: string;
  body: {
    summary: string;
    pros: string[];
    cons: string[];
    alternatives: string[];
  };
  status: "draft" | "published";
  publicUrl: string;
  createdAt: string;
};

export type AffiliateLink = {
  id: string;
  productId: string;
  code: string;
  destinationUrl: string;
  campaign: string;
  clicks: number;
  revenueEstimate: number;
};

export type ClickEvent = {
  id: string;
  linkId: string;
  productId: string;
  sourcePlatform: string;
  campaign: string;
  referrer?: string;
  userAgent?: string;
  createdAt: string;
};

export type MetricImport = {
  id: string;
  contentId?: string;
  productId?: string;
  platform: ContentPlatform;
  impressions: number;
  saves: number;
  likes: number;
  clicks: number;
  conversions: number;
  revenue: number;
  importedAt: string;
};

export type PublishLog = {
  id: string;
  contentId?: string;
  platform: ContentPlatform;
  status: "published" | "mock_published" | "exported" | "failed" | "skipped";
  message: string;
  payload: Record<string, unknown>;
  attemptCount: number;
  createdAt: string;
};

export type OperatorLog = {
  id: string;
  level: "info" | "warn" | "error";
  scope: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AutopilotRun = {
  id: string;
  mode: AutopilotMode;
  status: "completed" | "dry_run" | "failed";
  summary: Record<string, unknown>;
  startedAt: string;
  endedAt?: string;
};

export type CommerceState = {
  products: Product[];
  trends: Trend[];
  angles: ViralAngle[];
  content: ContentItem[];
  assets: Asset[];
  landingPages: LandingPage[];
  affiliateLinks: AffiliateLink[];
  clickEvents: ClickEvent[];
  metrics: MetricImport[];
  publishLogs: PublishLog[];
  autopilotRuns: AutopilotRun[];
  logs: OperatorLog[];
  settings: {
    demoMode: boolean;
    pinterestEnabled: boolean;
    tiktokEnabled: boolean;
    webEnabled: boolean;
    aiProvider: "mock" | "openai" | "anthropic";
  };
  updatedAt: string;
};
