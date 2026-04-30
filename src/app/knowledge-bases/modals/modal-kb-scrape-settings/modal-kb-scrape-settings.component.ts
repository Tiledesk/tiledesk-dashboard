import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KbScrapeConfig } from 'app/models/kb-scrape-config-model';

/**
 * Side-by-side dialog that hosts `<app-kb-scrape-settings>`. Opened from the
 * import modals (URL / Sitemap, with `actionMode: 'paste'`) and from the detail
 * modal (with `actionMode: 'copy'`). The dialog mutates the same
 * `KbScrapeConfig` reference owned by the parent modal — settings are read by
 * the parent at save time, so this dialog has no save action of its own.
 */
@Component({
  selector: 'modal-kb-scrape-settings',
  templateUrl: './modal-kb-scrape-settings.component.html',
  styleUrls: ['./modal-kb-scrape-settings.component.scss']
})
export class ModalKbScrapeSettingsComponent implements OnInit {
  /** Shared scrape configuration; the same reference owned by the parent modal. */
  config: KbScrapeConfig;
  /** Forwarded to `<app-kb-scrape-settings>` to switch the action button (paste/copy). */
  actionMode: 'paste' | 'copy' = 'paste';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { config: KbScrapeConfig; actionMode?: 'paste' | 'copy' },
    public dialogRef: MatDialogRef<ModalKbScrapeSettingsComponent>,
  ) {}

  ngOnInit(): void {
    this.config = this.data?.config;
    if (this.data?.actionMode) {
      this.actionMode = this.data.actionMode;
    }
  }
}
