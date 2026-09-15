export function getChatbotUpdatedAtTimestamp(
  bot: { updatedAt?: unknown; updated_at?: unknown } | null | undefined,
): number {
  const value = bot?.updatedAt ?? bot?.updated_at;
  if (value == null || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return value > 1e12 ? value : value * 1000;
  }

  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  if (typeof value === 'object') {
    const nested = (value as { $date?: unknown; date?: unknown }).$date
      ?? (value as { date?: unknown }).date;
    if (nested != null) {
      return getChatbotUpdatedAtTimestamp({ updatedAt: nested });
    }
  }

  const time = new Date(value as string).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function compareChatbotsByLastUpdated<T extends { updatedAt?: unknown; updated_at?: unknown; name?: string }>(
  a: T,
  b: T,
): number {
  const updatedDiff = getChatbotUpdatedAtTimestamp(b) - getChatbotUpdatedAtTimestamp(a);
  if (updatedDiff !== 0) {
    return updatedDiff;
  }

  const aUpdatedRaw = String(a?.updatedAt ?? a?.updated_at ?? '');
  const bUpdatedRaw = String(b?.updatedAt ?? b?.updated_at ?? '');
  if (bUpdatedRaw > aUpdatedRaw) {
    return 1;
  }
  if (bUpdatedRaw < aUpdatedRaw) {
    return -1;
  }

  return String(a?.name ?? '').localeCompare(String(b?.name ?? ''));
}

export function sortChatbotsByLastUpdated<T extends { updatedAt?: unknown; updated_at?: unknown }>(
  chatbots: T[] | null | undefined,
): T[] {
  if (!chatbots?.length) {
    return [];
  }

  return [...chatbots].sort(compareChatbotsByLastUpdated);
}

export function getLastUpdatedChatbot<T extends { updatedAt?: unknown; updated_at?: unknown }>(
  chatbots: T[] | null | undefined,
): T | null {
  const sorted = sortChatbotsByLastUpdated(chatbots);
  return sorted[0] ?? null;
}
