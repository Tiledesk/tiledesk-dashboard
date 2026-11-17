import { Component } from '@angular/core';
import { CreditsPeriod } from 'app/services/credits.service';
import { CreditsStore } from '../credits-store.service';
import { resourceColor, resourceRows, CreditsResourceRow } from '../credits-resources';

interface HistoryBar {
  period: CreditsPeriod;
  /** parts of the bar by resource, widths relative to the highest of the periods */
  parts: { row: CreditsResourceRow; width: number }[];
  /** position of the included credits on the same scale, 0-100 */
  includedAt: number;
}

/**
 * Credits of the last periods: consumption by resource, from the included and the extra credits, and what expired
 */
@Component({
  selector: 'appdashboard-credits-history',
  templateUrl: './credits-history.component.html'
})
export class CreditsHistoryComponent {

  private cached: { history: CreditsPeriod[]; bars: HistoryBar[] } | null = null;

  constructor(public store: CreditsStore) { }

  get bars(): HistoryBar[] {
    const history = this.store.history;
    if (!this.cached || this.cached.history !== history) {
      const max = Math.max(1, ...history.map((period) => Math.max(period.consumed, period.includedCredits || 0)));
      const bars = history.map((period) => ({
        period,
        parts: resourceRows(period, this.store.summary).map((row) => ({ row, width: (row.credits / max) * 100 })),
        includedAt: ((period.includedCredits || 0) / max) * 100
      }));
      this.cached = { history, bars };
    }
    return this.cached.bars;
  }

  color(resource: string): string {
    return resourceColor(resource);
  }

  trackPeriod(index: number, bar: HistoryBar) {
    return bar.period.start;
  }
}
