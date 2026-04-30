import { Component, EventEmitter, HostListener, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { KbScrapeConfig } from 'app/models/kb-scrape-config-model';

/**
 * Read-only summary of the current scrape configuration. Renders 2 chips
 * (mode + situated context) with state-aware colors (blue = active, grey =
 * inactive). Each chip opens a SatPopover with details and a button that
 * mirrors the parent's "open settings" affordance — toggling between
 * "Open settings" and "Close settings" based on `isSettingsOpen`.
 *
 * The component never mutates `config`: it is intentionally a passive view.
 */
@Component({
  selector: 'app-kb-scrape-summary',
  templateUrl: './kb-scrape-summary.component.html',
  styleUrls: ['./kb-scrape-summary.component.scss']
})
export class KbScrapeSummaryComponent {
  /** Mandatory: the parent must pass the same `KbScrapeConfig` reference used by the settings panel. */
  @Input() config!: KbScrapeConfig;
  /** Drives the "Open settings" / "Close settings" button label & icon inside each popover. */
  @Input() isSettingsOpen = false;
  /**
   * i18n key for the headline above the chips. Default phrasing fits the create
   * flows ("…will be applied"); the detail/edit flow overrides it with the
   * past-tense variant ("…have been applied") since the rules are already in
   * effect on the saved KB.
   */
  @Input() titleKey = 'KbPage.TheFollowingScrapingRulesWillBeApplied';

  /** Emitted when the user clicks "Open settings" inside any popover. */
  @Output() openSettings = new EventEmitter<void>();
  /** Emitted when the user clicks "Close settings" inside any popover. */
  @Output() closeSettings = new EventEmitter<void>();

  /** Collected references to all popovers in the template so we can close them mutually. */
  @ViewChildren(SatPopover) private popovers!: QueryList<SatPopover>;

  /**
   * Mutual-exclusive popover toggling: closes any other open popover before
   * toggling the target. Without this, clicking a different chip would just
   * leave the previous popover open.
   */
  onChipClick(target: SatPopover): void {
    if (this.popovers) {
      this.popovers.forEach(p => {
        if (p !== target && p.isOpen()) {
          p.close();
        }
      });
    }
    target.toggle();
  }

  /** Closes the popover and asks the parent to toggle the side-by-side settings dialog. */
  onSettingsButtonClick(popover: SatPopover): void {
    popover.close();
    if (this.isSettingsOpen) {
      this.closeSettings.emit();
    } else {
      this.openSettings.emit();
    }
  }

  /**
   * Close popovers when the user clicks anywhere outside a chip or a popover panel.
   * We avoid `hasBackdrop` on `<sat-popover>` because the backdrop would also
   * intercept clicks on sibling chips, breaking the single-click chip-to-chip
   * switching implemented in `onChipClick`. By listening on the document we
   * keep that UX while still getting the standard click-outside-to-close.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (target.closest('.scrape-chip') || target.closest('.scrape-summary-popover__content')) {
      return;
    }
    if (this.popovers) {
      this.popovers.forEach(p => {
        if (p.isOpen()) {
          p.close();
        }
      });
    }
  }
}
