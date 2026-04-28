import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KbScrapeConfig } from 'app/models/kb-scrape-config-model';

/**
 * Side-by-side dialog that hosts `<app-kb-scrape-settings>`. Opened from the import
 * modals (currently only `modal-urls-knowledge-base`) so users can edit scraping
 * configuration alongside the source list. The dialog mutates the same
 * `KbScrapeConfig` reference owned by the parent modal — settings are read by the
 * parent at save time, so this dialog has no save action of its own.
 */
@Component({
  selector: 'modal-kb-scrape-settings',
  templateUrl: './modal-kb-scrape-settings.component.html',
  styleUrls: ['./modal-kb-scrape-settings.component.scss']
})
export class ModalKbScrapeSettingsComponent implements OnInit {
  /** Shared scrape configuration; the same reference owned by the parent modal. */
  config: KbScrapeConfig;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { config: KbScrapeConfig },
    public dialogRef: MatDialogRef<ModalKbScrapeSettingsComponent>,
  ) {}

  ngOnInit(): void {
    this.config = this.data?.config;
  }
}
