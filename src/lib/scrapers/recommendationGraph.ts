/**
 * YouTube Recommendation Graph Crawler
 *
 * Follows YouTube's own recommendation graph to discover channels.
 * Takes seed channels → follows relatedChannels → builds massive DB.
 * 750 seeds → 5,000–15,000 channels in a single pass.
 *
 * Free, no API key. Uses youtubeiClient internally.
 */

import { getChannelData, type ChannelData } from "@/lib/data/youtubeiClient";

// ─── Types ───────────────────────────────────────────────────────

export interface GraphExpansionResult {
  discovered: string[];
  channelData: Map<string, ChannelData>;
  totalProcessed: number;
  depth: number;
  durationMs: number;
}

export interface GraphProgressEvent {
  processed: number;
  discovered: number;
  queueRemaining: number;
  currentDepth: number;
  channelId: string;
  channelTitle: string;
}

// ─── Main Crawler ────────────────────────────────────────────────

/**
 * BFS traversal of YouTube's recommendation graph.
 *
 * @param seedChannelIds - Starting channel IDs
 * @param depth - How many hops from seeds (default 2)
 * @param maxChannels - Stop after discovering this many (default 5000)
 * @param onProgress - Optional callback for progress logging
 */
export async function expandChannelGraph(
  seedChannelIds: string[],
  depth = 2,
  maxChannels = 5000,
  onProgress?: (event: GraphProgressEvent) => void
): Promise<GraphExpansionResult> {
  const startTime = Date.now();
  const discovered = new Set<string>(seedChannelIds);
  const channelData = new Map<string, ChannelData>();
  let totalProcessed = 0;

  // BFS queue: [channelId, currentDepth]
  const queue: Array<[string, number]> = seedChannelIds.map((id) => [id, 0]);

  console.log(`[Graph] Starting expansion from ${seedChannelIds.length} seeds`);
  console.log(`[Graph] Max depth: ${depth}, Max channels: ${maxChannels}`);

  while (queue.length > 0 && discovered.size < maxChannels) {
    const [channelId, currentDepth] = queue.shift()!;

    if (currentDepth > depth) continue;

    try {
      const data = await getChannelData(channelId);
      totalProcessed++;

      if (!data) {
        continue;
      }

      channelData.set(channelId, data);

      // Follow related channels if we haven't exceeded depth
      if (currentDepth < depth) {
        for (const related of data.relatedChannels) {
          if (!discovered.has(related.channelId) && discovered.size < maxChannels) {
            discovered.add(related.channelId);
            queue.push([related.channelId, currentDepth + 1]);
          }
        }
      }

      // Progress logging every 100 channels
      if (totalProcessed % 100 === 0 || totalProcessed <= 5) {
        const event: GraphProgressEvent = {
          processed: totalProcessed,
          discovered: discovered.size,
          queueRemaining: queue.length,
          currentDepth,
          channelId,
          channelTitle: data.channelTitle,
        };

        console.log(
          `[Graph] Processed: ${event.processed} | ` +
          `Discovered: ${event.discovered} | ` +
          `Queue: ${event.queueRemaining} | ` +
          `Depth: ${event.currentDepth} | ` +
          `Current: ${event.channelTitle}`
        );

        onProgress?.(event);
      }

      // Rate limit: 400ms between requests
      await new Promise((r) => setTimeout(r, 400));
    } catch (error) {
      console.warn(
        `[Graph] Failed to process ${channelId}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  const durationMs = Date.now() - startTime;
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);

  console.log(`[Graph] ═══════════════════════════════════════════`);
  console.log(`[Graph] Expansion complete`);
  console.log(`[Graph]   Channels discovered: ${discovered.size}`);
  console.log(`[Graph]   Channels processed:  ${totalProcessed}`);
  console.log(`[Graph]   With full data:      ${channelData.size}`);
  console.log(`[Graph]   Duration:            ${minutes}m ${seconds}s`);
  console.log(`[Graph] ═══════════════════════════════════════════`);

  return {
    discovered: Array.from(discovered),
    channelData,
    totalProcessed,
    depth,
    durationMs,
  };
}

/**
 * Lightweight version — only returns IDs, doesn't store full data.
 * Much faster, lower memory. Good for pure discovery.
 */
export async function discoverChannelIds(
  seedChannelIds: string[],
  depth = 1,
  maxChannels = 2000
): Promise<string[]> {
  const discovered = new Set<string>(seedChannelIds);
  const queue: Array<[string, number]> = seedChannelIds.map((id) => [id, 0]);
  let processed = 0;

  while (queue.length > 0 && discovered.size < maxChannels) {
    const [channelId, currentDepth] = queue.shift()!;
    if (currentDepth > depth) continue;

    try {
      const data = await getChannelData(channelId);
      processed++;

      if (data && currentDepth < depth) {
        for (const related of data.relatedChannels) {
          if (!discovered.has(related.channelId) && discovered.size < maxChannels) {
            discovered.add(related.channelId);
            queue.push([related.channelId, currentDepth + 1]);
          }
        }
      }

      if (processed % 50 === 0) {
        console.log(`[GraphLite] Processed ${processed}, discovered ${discovered.size}`);
      }

      await new Promise((r) => setTimeout(r, 400));
    } catch {
      // Skip failed channels
    }
  }

  return Array.from(discovered);
}
