import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LoggerService } from 'app/services/logger/logger.service';
import { KbScrapeConfig } from 'app/models/kb-scrape-config-model';

/**
 * Shared settings panel for KB import flows (URLs and Sitemap). Owns no state of its
 * own beyond UI helpers (panel expanded, stored option flag); all persisted
 * configuration lives in the `config` reference passed by the parent and is mutated
 * in place. The parent reads it at save time.
 */
@Component({
  selector: 'app-kb-scrape-settings',
  templateUrl: './kb-scrape-settings.component.html',
  styleUrls: ['./kb-scrape-settings.component.scss']
})
export class KbScrapeSettingsComponent implements OnInit {
  /** Mandatory: the parent must pass a config object reference. The component mutates it in place. */
  @Input() config!: KbScrapeConfig;

  /** Chip input separators (Enter and comma) shared across the three chip lists. */
  separatorKeysCodes: number[] = [ENTER, COMMA];
  /** Local UI state: HTML tags accordion is closed by default and auto-closes when automatic extraction is on. */
  htmlTagsPanelExpanded = false;
  /** Local UI state: enables "Paste" button only when localStorage has stored options. */
  stored_scrape_option = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private logger: LoggerService,
  ) {}

  ngOnInit(): void {
    this.refreshStoredScrapeOptionFlag();
  }

  onAutomaticSlideToggle(event: MatSlideToggleChange): void {
    const checked = event.checked;
    if (checked) {
      this.htmlTagsPanelExpanded = false;
    } else {
      this.config.situatedContextEnabled = false;
    }
    this.config.automaticContentExtraction = checked;
  }

  onSituatedContextSlideToggle(event: MatSlideToggleChange): void {
    if (!this.config.automaticContentExtraction) {
      return;
    }
    this.config.situatedContextEnabled = event.checked;
  }

  addTag(type: 'extract_tags' | 'unwanted_tags' | 'unwanted_classnames', event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if (type === 'extract_tags') {
        this.config.extract_tags.push(value);
      } else if (type === 'unwanted_tags') {
        this.config.unwanted_tags.push(value);
      } else if (type === 'unwanted_classnames') {
        this.config.unwanted_classnames.push(value);
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  removeTag(arrayName: 'extract_tags' | 'unwanted_tags' | 'unwanted_classnames', tag: string): void {
    if (arrayName === 'extract_tags') {
      const index = this.config.extract_tags.findIndex(v => v === tag);
      if (index !== -1) {
        this.config.extract_tags.splice(index, 1);
      }
    } else if (arrayName === 'unwanted_tags') {
      const index = this.config.unwanted_tags.findIndex(v => v === tag);
      if (index !== -1) {
        this.config.unwanted_tags.splice(index, 1);
      }
    } else if (arrayName === 'unwanted_classnames') {
      const index = this.config.unwanted_classnames.findIndex(v => v === tag);
      if (index !== -1) {
        this.config.unwanted_classnames.splice(index, 1);
      }
    }
  }

  /** Replace the three chip arrays with values previously stored in localStorage by `copyAllScrapeOptions`. */
  pasteAllScrapeOptions(): void {
    try {
      const stored = localStorage.getItem('scrape_options');
      this.logger.log('[KB-SCRAPE-SETTINGS] Stored value from localStorage:', stored);
      if (!stored) {
        this.logger.log('[KB-SCRAPE-SETTINGS] No stored value found in localStorage');
        return;
      }
      const scrapeOptions = JSON.parse(stored);
      this.config.extract_tags = Array.isArray(scrapeOptions.extract_tags)
        ? [...scrapeOptions.extract_tags]
        : [];
      this.config.unwanted_tags = Array.isArray(scrapeOptions.unwanted_tags)
        ? [...scrapeOptions.unwanted_tags]
        : [];
      this.config.unwanted_classnames = Array.isArray(scrapeOptions.unwanted_classnames)
        ? [...scrapeOptions.unwanted_classnames]
        : [];
      // Force change detection: chip arrays were replaced with new references but Angular default CD
      // may not pick it up immediately when the click originates from a non-ngModel handler.
      this.cdr.detectChanges();
    } catch (error) {
      this.logger.error('[KB-SCRAPE-SETTINGS] Error reading scrape options from storage:', error);
    }
  }

  private refreshStoredScrapeOptionFlag(): void {
    try {
      this.stored_scrape_option = localStorage.getItem('scrape_options') !== null;
    } catch (error) {
      this.logger.error('[KB-SCRAPE-SETTINGS] Error reading scrape options from storage:', error);
      this.stored_scrape_option = false;
    }
  }
}
