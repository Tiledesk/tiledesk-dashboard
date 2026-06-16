export interface AnalyticsConfigLike {
  analyticsApiBase?: unknown;
  analyticsEmbedBase?: unknown;
}

/** True when value is a non-empty http(s) URL (not an unresolved ${...} placeholder). */
export function isValidAnalyticsBaseUrl(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (/\$\{[^}]+\}/.test(trimmed)) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** New embedded analytics are available only when both bases are valid URLs. */
export function isNewAnalyticsConfigured(config: AnalyticsConfigLike | null | undefined): boolean {
  if (!config) {
    return false;
  }
  return isValidAnalyticsBaseUrl(config.analyticsApiBase)
    && isValidAnalyticsBaseUrl(config.analyticsEmbedBase);
}
