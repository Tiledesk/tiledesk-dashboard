/**
 * Configuration shared by `modal-urls-knowledge-base` and `modal-site-map` to control
 * how content is fetched and parsed. The parent owns the object; the child
 * `<app-kb-scrape-settings>` mutates fields in place. Field names are kept as-is
 * (mixed snake_case/camelCase) to match the existing body payload and localStorage
 * keys used by the "Paste scraping rules" feature, avoiding regressions.
 */
export interface KbScrapeConfig {
  /** When true, backend uses automatic extraction (`scrape_type: 0`); HTML tags panel is disabled. */
  automaticContentExtraction: boolean;
  /** Only meaningful when automatic extraction is on; sent in body as `situated_context`. */
  situatedContextEnabled: boolean;
  /** Scrape type identifier; 4 = "Advanced" (manual rules), 2 = "Standard". */
  selectedScrapeType: number;
  /** Tags to extract (mapped to body `scrape_options.tags_to_extract`). */
  extract_tags: string[];
  /** Tags to discard (mapped to body `scrape_options.unwanted_tags`). */
  unwanted_tags: string[];
  /** Class names to discard (mapped to body `scrape_options.unwanted_classnames`). */
  unwanted_classnames: string[];
}

/**
 * Returns a fresh `KbScrapeConfig` with the same defaults previously hardcoded
 * in `modal-urls-knowledge-base` / `modal-site-map`.
 */
export function buildDefaultKbScrapeConfig(): KbScrapeConfig {
  return {
    automaticContentExtraction: true,
    situatedContextEnabled: false,
    selectedScrapeType: 4,
    extract_tags: ['body'],
    unwanted_tags: [],
    unwanted_classnames: [],
  };
}
