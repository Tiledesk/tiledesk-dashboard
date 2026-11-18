/** A score the bars can paint: an integer from 1 to 5. Numeric strings count. */
export function parseRatingScore(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const raw = typeof value === 'number'
    ? value
    : (typeof value === 'string' ? Number(value.trim()) : NaN);
  if (!Number.isFinite(raw) || !Number.isInteger(raw) || raw < 1 || raw > 5) {
    return null;
  }
  return raw;
}

/** The AI text sometimes arrives wrapped in extra quotes. */
export function cleanAiSentiment(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  let text = value.trim();
  if (text.length >= 2) {
    const first = text.charAt(0);
    const last = text.charAt(text.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      text = text.slice(1, -1).trim();
    }
  }
  return text.length ? text : null;
}

export function cleanRatingMessage(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const text = value.trim();
  return text.length ? text : null;
}
