import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreditsLlmUsage, CreditsPeriod } from 'app/services/credits.service';
import { CreditsStore } from '../credits-store.service';
import { modelLabel, resourceColor, TOKEN_RESOURCES, tokenUsage } from '../credits-resources';

const CHART_MODELS = 10;

export type CreditsModelsSort = 'credits' | 'calls' | 'tokens' | 'cost';

export interface CreditsModelRow extends CreditsLlmUsage {
  label: string | undefined;
  /** share of the credits of the rows shown, 0-100 */
  perc: number;
  /** average credits per 1000 tokens */
  perThousand: number | null;
}

export interface CreditsModelsTotals {
  credits: number;
  calls: number;
  tokens: number;
  cost: number;
  unpriced: number;
}

export interface CreditsModelBar {
  label: string | undefined;
  resource: string;
  credits: number;
  perc: number;
}

interface ModelsView {
  period: CreditsPeriod | null;
  filters: string;
  rows: CreditsModelRow[];
  totals: CreditsModelsTotals;
  chart: CreditsModelBar[];
}

/**
 * Credits consumed by the AI models in a period: every resource on tokens (AI, KB indexing, OCR, vibe coder),
 * with the Tiledesk key and the project's own key.
 */
@Component({
  selector: 'appdashboard-credits-models',
  templateUrl: './credits-models.component.html'
})
export class CreditsModelsComponent implements OnInit, OnDestroy {

  readonly resources = TOKEN_RESOURCES;

  /** start of the period shown, the current one when null */
  periodStart: string | null = null;
  resource = '';
  key: '' | 'tiledesk' | 'own' = '';
  search = '';
  sort: CreditsModelsSort = 'credits';

  private cached: ModelsView | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(
    public store: CreditsStore,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const resource = params.get('resource');
      this.resource = TOKEN_RESOURCES.includes(resource) ? resource : '';
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get period(): CreditsPeriod | null {
    const history = this.store.history;
    return history.find((period) => period.start === this.periodStart) || history[0] || null;
  }

  /** Rows, totals and chart, computed again when the data or the filters change */
  get view(): ModelsView {
    const period = this.period;
    const filters = [this.resource, this.key, this.search.trim().toLowerCase(), this.sort].join('|');
    if (!this.cached || this.cached.period !== period || this.cached.filters !== filters) {
      const rows = this.computeRows(period);
      this.cached = { period, filters, rows, totals: totals(rows), chart: chart(rows) };
    }
    return this.cached;
  }

  setSort(sort: CreditsModelsSort) {
    this.sort = sort;
  }

  color(resource: string): string {
    return resourceColor(resource);
  }

  trackRow(index: number, row: CreditsModelRow) {
    return [row.resource, row.label, row.ownKey].join('|');
  }

  private computeRows(period: CreditsPeriod | null): CreditsModelRow[] {
    const search = this.search.trim().toLowerCase();
    const rows = tokenUsage(period)
      .filter((usage) => !this.resource || usage.resource === this.resource)
      .filter((usage) => !this.key || usage.ownKey === (this.key === 'own'))
      .map((usage) => Object.assign({}, usage, {
        label: modelLabel(usage),
        perc: 0,
        perThousand: usage.tokens ? (usage.credits / usage.tokens) * 1000 : null
      }))
      .filter((row) => !search || (row.label || '').toLowerCase().includes(search));
    const total = rows.reduce((sum, row) => sum + row.credits, 0);
    rows.forEach((row) => row.perc = total ? (row.credits / total) * 100 : 0);
    return rows.sort((a, b) => (b[this.sort] || 0) - (a[this.sort] || 0));
  }
}

function totals(rows: CreditsModelRow[]): CreditsModelsTotals {
  return rows.reduce((sum, row) => ({
    credits: sum.credits + row.credits,
    calls: sum.calls + row.calls,
    tokens: sum.tokens + row.tokens,
    cost: sum.cost + (row.cost || 0),
    unpriced: sum.unpriced + (row.unpriced || 0)
  }), { credits: 0, calls: 0, tokens: 0, cost: 0, unpriced: 0 });
}

/** The models that cost the most among the rows, resources and keys together; perc relative to the first */
function chart(rows: CreditsModelRow[]): CreditsModelBar[] {
  const byModel = new Map<string, CreditsModelBar>();
  rows.forEach((row) => {
    const key = row.label || 'resource:' + row.resource;
    const entry = byModel.get(key) || { label: row.label, resource: row.resource, credits: 0, perc: 0 };
    entry.credits += row.credits;
    byModel.set(key, entry);
  });
  const entries = Array.from(byModel.values())
    .filter((entry) => entry.credits > 0)
    .sort((a, b) => b.credits - a.credits)
    .slice(0, CHART_MODELS);
  const max = entries.length ? entries[0].credits : 0;
  entries.forEach((entry) => entry.perc = max ? (entry.credits / max) * 100 : 0);
  return entries;
}
