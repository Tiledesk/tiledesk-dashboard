import { Component } from '@angular/core';
import { CreditsPeriod, CreditsService, CreditsSummary } from 'app/services/credits.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { CreditsStore } from '../credits-store.service';
import {
  CREDITS_GROUPS, CreditsGroup, CreditsResourceRow, groupColor, modelLabel, resourceColor, resourceRows, tokenUsage
} from '../credits-resources';

const DAY_MS = 24 * 3600 * 1000;
const TOP_MODELS = 5;

export interface CreditsGroupTotal {
  group: CreditsGroup;
  credits: number;
  perc: number;
  color: string;
}

export interface CreditsProjection {
  /** credits consumed at the end of the period at the current pace: monthly fees once, the rest by day */
  projected: number;
  perDay: number;
  /** when the available credits run out at the current pace, if before the end of the period */
  runOut: Date | null;
  elapsedPerc: number;
}

export interface CreditsTopModel {
  label: string | undefined;
  resource: string;
  credits: number;
  perc: number;
}

interface OverviewView {
  period: CreditsPeriod | null;
  summary: CreditsSummary | null;
  rows: CreditsResourceRow[];
  groups: CreditsGroupTotal[];
  projection: CreditsProjection | null;
  topModels: CreditsTopModel[];
  aiCredits: number;
}

/**
 * How the credits of the current period were spent: balance, by group and resource, the estimate at the end of
 * the period and the AI models that cost the most.
 */
@Component({
  selector: 'appdashboard-credits-overview',
  templateUrl: './credits-overview.component.html'
})
export class CreditsOverviewComponent {

  extraCredits: number;
  buyingExtra = false;
  extraError: string | null = null;

  private cached: OverviewView | null = null;

  constructor(
    public store: CreditsStore,
    private creditsService: CreditsService,
    private logger: LoggerService
  ) {
    this.extraCredits = store.summary?.extraCreditsMin;
  }

  get summary() {
    return this.store.summary;
  }

  get current() {
    return this.store.current;
  }

  /** Data of the page, computed again when the store loads new data */
  get view(): OverviewView {
    if (!this.cached || this.cached.period !== this.current || this.cached.summary !== this.summary) {
      this.cached = this.compute(this.current, this.summary);
    }
    return this.cached;
  }

  /** Share of the included credits still available, 0-100 */
  get includedLeftPerc(): number {
    const included = this.summary?.includedCredits;
    const left = this.summary?.balance?.included;
    if (!included || left === undefined) {
      return 0;
    }
    return Math.max(0, Math.min(100, (left / included) * 100));
  }

  color(resource: string): string {
    return resourceColor(resource);
  }

  trackResource(index: number, row: CreditsResourceRow) {
    return row.resource;
  }

  trackModel(index: number, model: CreditsTopModel) {
    return model.label || model.resource;
  }

  buyExtraCredits() {
    this.extraError = null;
    const min = this.summary?.extraCreditsMin || 0;
    const credits = Number(this.extraCredits);
    if (!Number.isInteger(credits) || credits < min) {
      this.extraError = 'Credits.ExtraMinError';
      return;
    }
    this.buyingExtra = true;
    this.creditsService.buyExtraCredits(this.store.projectId, credits).subscribe({
      next: (session) => {
        window.location.href = session.url;
      },
      error: (err) => {
        this.logger.error('[CREDITS] - buyExtraCredits ERROR ', err);
        this.buyingExtra = false;
        this.extraError = err?.status === 501 ? 'Credits.ExtraNotAvailable'
          : err?.status === 403 ? 'Credits.ExtraAdminOnly'
            : 'Credits.ExtraCheckoutError';
      }
    });
  }

  private compute(period: CreditsPeriod | null, summary: CreditsSummary | null): OverviewView {
    const rows = resourceRows(period, summary);
    const consumed = period?.consumed || 0;
    const groups = CREDITS_GROUPS.map((group) => {
      const credits = rows.filter((row) => row.group === group).reduce((sum, row) => sum + row.credits, 0);
      return { group, credits, perc: consumed ? (credits / consumed) * 100 : 0, color: groupColor(group) };
    });
    const total = (group: CreditsGroup) => groups.find((item) => item.group === group).credits;
    return {
      period,
      summary,
      rows,
      groups,
      projection: projection(period, summary, total('monthly')),
      topModels: topModels(period),
      aiCredits: total('ai')
    };
  }
}

function projection(period: CreditsPeriod | null, summary: CreditsSummary | null, monthly: number): CreditsProjection | null {
  if (!period || period.closed || !summary?.balance) {
    return null;
  }
  const start = new Date(period.start).getTime();
  const end = new Date(period.end).getTime();
  const now = Math.min(Date.now(), end);
  const elapsedDays = (now - start) / DAY_MS;
  // a pace measured on less than a day says little
  if (elapsedDays < 1) {
    return null;
  }
  const perDay = Math.max(0, period.consumed - monthly) / elapsedDays;
  const runOutAt = perDay > 0 ? now + (Math.max(0, summary.balance.available) / perDay) * DAY_MS : null;
  return {
    projected: monthly + perDay * ((end - start) / DAY_MS),
    perDay,
    runOut: runOutAt !== null && runOutAt < end ? new Date(runOutAt) : null,
    elapsedPerc: Math.min(100, ((now - start) / (end - start)) * 100)
  };
}

/** The models that cost the most in the period, every resource and key together */
function topModels(period: CreditsPeriod | null): CreditsTopModel[] {
  const usage = tokenUsage(period);
  const total = usage.reduce((sum, row) => sum + row.credits, 0);
  const byModel = new Map<string, CreditsTopModel>();
  usage.forEach((row) => {
    const label = modelLabel(row);
    const key = label || 'resource:' + row.resource;
    const entry = byModel.get(key) || { label, resource: row.resource, credits: 0, perc: 0 };
    entry.credits += row.credits;
    byModel.set(key, entry);
  });
  return Array.from(byModel.values())
    .filter((entry) => entry.credits > 0)
    .map((entry) => Object.assign(entry, { perc: total ? (entry.credits / total) * 100 : 0 }))
    .sort((a, b) => b.credits - a.credits)
    .slice(0, TOP_MODELS);
}
