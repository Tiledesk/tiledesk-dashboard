import { Observable, from, of } from 'rxjs';
import { map, mergeMap, toArray } from 'rxjs/operators';

/** Session cache for Home Flow "KB utilizzate" enrichment only (not shared with Knowledge Bases). */
const TTL_MS = 10 * 60 * 1000;

/** Max parallel getChatbotsUsingNamespace calls from Home Flow. */
export const HOME_FLOW_NAMESPACE_CHATBOTS_CONCURRENCY = 5;

export interface HomeFlowNamespaceCacheItem {
  id: string;
  name: string;
  updatedAt?: string;
  chatbots: Array<{ _id: string; name?: string }>;
}

interface CacheEntry {
  projectId: string;
  data: HomeFlowNamespaceCacheItem[];
  storedAt: number;
}

/**
 * In-memory cache keyed by project. Cleared on CDS enter, logout, and
 * dashboard mutations that can change KB↔flow links.
 */
export class HomeFlowNamespacesCache {
  private static entry: CacheEntry | null = null;

  static get(projectId: string): HomeFlowNamespaceCacheItem[] | null {
    if (!projectId || !this.entry || this.entry.projectId !== projectId) {
      return null;
    }
    if (Date.now() - this.entry.storedAt > TTL_MS) {
      this.entry = null;
      return null;
    }
    // Return a shallow copy so callers can mutate filters without poisoning cache
    return this.entry.data.map((item) => ({
      ...item,
      chatbots: [...(item.chatbots || [])],
    }));
  }

  static set(projectId: string, data: HomeFlowNamespaceCacheItem[]): void {
    if (!projectId) {
      return;
    }
    this.entry = {
      projectId,
      data: (data || []).map((item) => ({
        ...item,
        chatbots: [...(item.chatbots || [])],
      })),
      storedAt: Date.now(),
    };
  }

  static clear(projectId?: string): void {
    if (!projectId || this.entry?.projectId === projectId) {
      this.entry = null;
    }
  }

  static clearAll(): void {
    this.entry = null;
  }
}

/**
 * Run async work for each item with a max parallel count; preserves input order.
 */
export function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  project: (item: T, index: number) => Observable<R>,
): Observable<R[]> {
  if (!items.length) {
    return of([] as R[]);
  }
  return from(items).pipe(
    mergeMap(
      (item, index) =>
        project(item, index).pipe(
          map((value) => ({ index, value })),
        ),
      Math.max(1, concurrency),
    ),
    toArray(),
    map((pairs) =>
      pairs
        .sort((a, b) => a.index - b.index)
        .map((pair) => pair.value),
    ),
  );
}

/** Helper for catchError identity with typed empty chatbots row. */
export function namespaceChatbotsFallback(
  namespace: { id: string; name: string; updatedAt?: string },
): HomeFlowNamespaceCacheItem {
  return {
    id: namespace.id,
    name: namespace.name,
    updatedAt: namespace.updatedAt,
    chatbots: [],
  };
}
