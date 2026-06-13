import type { CommerceState, ContentItem, ContentPlatform, PublishLog } from "@/lib/domain";
import { nowIso, uid } from "@/lib/utils";

export interface Publisher {
  platform: ContentPlatform;
  publish(content: ContentItem): Promise<PublishLog>;
}

export class MockPublisher implements Publisher {
  constructor(public platform: ContentPlatform) {}

  async publish(content: ContentItem): Promise<PublishLog> {
    return {
      id: uid("pub"),
      contentId: content.id,
      platform: this.platform,
      status: "mock_published",
      message: `${this.platform} mock publish completed in demo mode.`,
      payload: {
        contentId: content.id,
        title: content.title,
        exported: true,
        officialApi: false,
      },
      attemptCount: 1,
      createdAt: nowIso(),
    };
  }
}

export function getPublisher(platform: ContentPlatform) {
  return new MockPublisher(platform);
}

export async function mockPublishQueue(state: CommerceState, limit = 12) {
  const publishable = state.content.filter((item) => item.status === "queued" || item.status === "scheduled").slice(0, limit);
  const logs: PublishLog[] = [];

  for (const item of publishable) {
    const publisher = getPublisher(item.platform);
    const log = await publisher.publish(item);
    logs.push(log);
    item.status = "mock_published";
    item.publishedAt = nowIso();
    item.exportPath = `exports/${item.platform}/${item.id}.json`;
  }

  return logs;
}
