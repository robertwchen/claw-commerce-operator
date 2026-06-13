import type { Asset, CommerceState, ContentItem, Product, PublishLog } from "@/lib/domain";
import { absoluteAppUrl, appBaseUrl, nowIso, truncate, uid } from "@/lib/utils";
import { envFlag, isRealMode, MissingCredentialError } from "@/lib/runtime";
import { mockPublishQueue } from "@/lib/publishers/mock";

type PublishContext = {
  state: CommerceState;
  content: ContentItem;
  product?: Product;
  assets: Asset[];
};

function publishLog(content: ContentItem, status: PublishLog["status"], message: string, payload: Record<string, unknown> = {}, attemptCount = 1): PublishLog {
  return {
    id: uid("pub"),
    contentId: content.id,
    platform: content.platform,
    status,
    message,
    payload,
    attemptCount,
    createdAt: nowIso(),
  };
}

function publicHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

function configuredForRealPublishing() {
  return process.env.PUBLISH_MODE === "real" || isRealMode() || Boolean(process.env.PINTEREST_ACCESS_TOKEN || process.env.TIKTOK_ACCESS_TOKEN);
}

function bodyString(content: ContentItem, key: string) {
  const value = content.body[key];
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(String).join("\n");
  return undefined;
}

function disclosureDescription(content: ContentItem) {
  const description = bodyString(content, "description") ?? bodyString(content, "caption") ?? bodyString(content, "summary") ?? content.title;
  return `${description}\n\n${content.disclosureLine}`.trim();
}

function productLink(state: CommerceState, product?: Product) {
  if (!product) return appBaseUrl();
  const link = state.affiliateLinks.find((item) => item.productId === product.id);
  return absoluteAppUrl(link ? `/go/${link.code}?source=owned-social&campaign=${encodeURIComponent(link.campaign)}` : `/p/${product.slug}`);
}

function pinterestImageUrl(assets: Asset[], product?: Product) {
  const explicit = process.env.PINTEREST_IMAGE_URL;
  if (explicit) return explicit;
  const asset = assets.find((item) => item.type === "pinterest_card") ?? assets[0];
  if (asset) return absoluteAppUrl(asset.url);
  return product?.imageUrl ? absoluteAppUrl(product.imageUrl) : undefined;
}

async function postJson(url: string, headers: Record<string, string>, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(async () => ({ raw: await response.text() }))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function publishPinterest({ state, content, product, assets }: PublishContext) {
  if (!process.env.PINTEREST_ACCESS_TOKEN || !process.env.PINTEREST_BOARD_ID) {
    throw new MissingCredentialError("Pinterest publishing", ["PINTEREST_ACCESS_TOKEN", "PINTEREST_BOARD_ID"]);
  }

  const imageUrl = pinterestImageUrl(assets, product);
  const link = productLink(state, product);
  if (!imageUrl || !publicHttpsUrl(imageUrl) || !publicHttpsUrl(link)) {
    return publishLog(content, "skipped", "Pinterest publish requires public HTTPS image and link URLs.", { imageUrl, link }, 0);
  }

  const payload = {
    board_id: process.env.PINTEREST_BOARD_ID,
    title: truncate(content.title, 100),
    description: truncate(disclosureDescription(content), 500),
    link,
    alt_text: truncate(`${content.title} ${product?.category ?? ""}`.trim(), 500),
    media_source: {
      source_type: "image_url",
      url: imageUrl,
      is_standard: true,
    },
  };

  const response = await postJson(
    "https://api.pinterest.com/v5/pins",
    { authorization: `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}` },
    payload,
  );

  content.status = "published";
  content.publishedAt = nowIso();
  return publishLog(content, "published", "Pinterest Pin created through the official API.", {
    pinId: response.id,
    request: { ...payload, media_source: { ...payload.media_source, url: imageUrl } },
  });
}

function tiktokPhotoUrls(content: ContentItem) {
  const envUrls = process.env.TIKTOK_PHOTO_URLS?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  if (envUrls.length) return envUrls;
  const bodyUrls = content.body.photoUrls ?? content.body.mediaUrls;
  if (Array.isArray(bodyUrls)) return bodyUrls.map(String);
  return [];
}

async function publishTikTok({ content }: PublishContext) {
  if (!process.env.TIKTOK_ACCESS_TOKEN) {
    throw new MissingCredentialError("TikTok publishing", ["TIKTOK_ACCESS_TOKEN"]);
  }

  const photoUrls = tiktokPhotoUrls(content).filter(publicHttpsUrl);
  if (!photoUrls.length) {
    return publishLog(content, "skipped", "TikTok publish requires verified public HTTPS photo URLs in TIKTOK_PHOTO_URLS or content.body.photoUrls.", {}, 0);
  }

  const postMode = process.env.TIKTOK_POST_MODE ?? "MEDIA_UPLOAD";
  const payload = {
    media_type: "PHOTO",
    post_mode: postMode,
    post_info: {
      title: truncate(content.title, 90),
      description: truncate(disclosureDescription(content), 4000),
      privacy_level: process.env.TIKTOK_PRIVACY_LEVEL,
      disable_comment: envFlag("TIKTOK_DISABLE_COMMENT", false),
      auto_add_music: envFlag("TIKTOK_AUTO_ADD_MUSIC", false),
      brand_content_toggle: true,
      brand_organic_toggle: false,
    },
    source_info: {
      source: "PULL_FROM_URL",
      photo_images: photoUrls,
      photo_cover_index: 0,
    },
  };

  const response = await postJson(
    "https://open.tiktokapis.com/v2/post/publish/content/init/",
    { authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}` },
    payload,
  );

  content.status = "published";
  content.publishedAt = nowIso();
  return publishLog(content, "published", "TikTok post initialized through the official Content Posting API.", {
    publishId: (response.data as { publish_id?: unknown } | undefined)?.publish_id,
    error: response.error,
    postMode,
  });
}

function publishOwnedWeb({ content, product }: PublishContext) {
  content.status = "published";
  content.publishedAt = content.publishedAt ?? nowIso();
  return publishLog(content, "published", "Owned web content is available on the configured app domain.", {
    url: absoluteAppUrl(product ? `/p/${product.slug}` : "/landing"),
  });
}

async function publishRealContent(context: PublishContext) {
  if (context.content.platform === "pinterest") return publishPinterest(context);
  if (context.content.platform === "tiktok") return publishTikTok(context);
  return publishOwnedWeb(context);
}

export async function publishQueue(state: CommerceState, limit = 12) {
  if (!configuredForRealPublishing()) {
    return mockPublishQueue(state, limit);
  }

  const publishable = state.content.filter((item) => item.status === "queued" || item.status === "scheduled" || item.status === "draft").slice(0, limit);
  const logs: PublishLog[] = [];

  for (const content of publishable) {
    const product = state.products.find((item) => item.id === content.productId);
    const assets = state.assets.filter((item) => item.productId === content.productId && (!item.contentId || item.contentId === content.id));

    try {
      logs.push(await publishRealContent({ state, content, product, assets }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logs.push(publishLog(content, error instanceof MissingCredentialError ? "skipped" : "failed", message, {}, 1));
    }
  }

  return logs;
}

export function activePublishingMode() {
  return configuredForRealPublishing() ? "real" : "mock";
}

export type PublishingMode = ReturnType<typeof activePublishingMode>;
