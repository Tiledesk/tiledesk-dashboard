import { Injectable, OnDestroy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CreditsLlmPrice, CreditsLlmUsage, CreditsPeriod, CreditsService, CreditsSummary } from 'app/services/credits.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { modelLabel } from './credits-resources';

/** Charge seen between two refreshes of the page (the server has no movements API) */
export interface CreditsLiveCharge {
  at: Date;
  resource: string;
  model?: string;
  ownKey?: boolean;
  units: number;
  credits: number;
}

const LIVE_REFRESH_MS = 10000;
const LIVE_LOG_SIZE = 50;
const HISTORY_PERIODS = 12;

/**
 * Credits of the project shared by the pages of the credits section (provided by CreditsComponent):
 * summary, history of the periods, AI models prices and the charges seen while the section is open.
 */
@Injectable()
export class CreditsStore implements OnDestroy {

  projectId: string | null = null;
  summary: CreditsSummary | null = null;
  history: CreditsPeriod[] = [];
  /** the period in progress, first of the history */
  current: CreditsPeriod | null = null;

  loading = true;
  loadError = false;
  lastUpdate: Date | null = null;

  autoRefresh = true;
  liveCharges: CreditsLiveCharge[] = [];

  llmPrices: CreditsLlmPrice[] = [];

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private links = new Map<string, string[]>();

  constructor(
    private creditsService: CreditsService,
    private logger: LoggerService
  ) { }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  get isCredits(): boolean {
    return this.summary?.metering === 'credits';
  }

  /** router link of a page of the section: '' (overview), 'models', 'history', 'prices'; the same array every time */
  link(page = ''): string[] {
    const key = this.projectId + '/' + page;
    if (!this.links.has(key)) {
      this.links.set(key, ['/project', this.projectId, 'credits'].concat(page ? [page] : []));
    }
    return this.links.get(key);
  }

  setProject(projectId: string) {
    if (projectId === this.projectId) {
      return;
    }
    this.projectId = projectId;
    this.summary = null;
    this.history = [];
    this.current = null;
    this.liveCharges = [];
    this.llmPrices = [];
    this.loading = true;
    this.load();
    this.loadLlmPrices();
    this.startAutoRefresh();
  }

  load() {
    const projectId = this.projectId;
    if (!projectId) {
      return;
    }
    forkJoin({
      summary: this.creditsService.getSummary(projectId),
      history: this.creditsService.getHistory(projectId, HISTORY_PERIODS)
    }).subscribe({
      next: ({ summary, history }) => {
        if (projectId !== this.projectId) {
          return;
        }
        const previous = this.current;
        this.summary = summary;
        this.history = history || [];
        this.current = this.history.length ? this.history[0] : null;
        this.trackCharges(previous, this.current);
        this.loading = false;
        this.loadError = false;
        this.lastUpdate = new Date();
      },
      error: (err) => {
        this.logger.error('[CREDITS] - load ERROR ', err);
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  setAutoRefresh(enabled: boolean) {
    this.autoRefresh = enabled;
    if (enabled) {
      this.startAutoRefresh();
      this.load();
    } else {
      this.stopAutoRefresh();
    }
  }

  clearLiveCharges() {
    this.liveCharges = [];
  }

  private loadLlmPrices() {
    const projectId = this.projectId;
    this.creditsService.getLlmPrices(projectId).subscribe({
      next: (prices) => {
        if (projectId === this.projectId) {
          this.llmPrices = prices || [];
        }
      },
      error: (err) => this.logger.error('[CREDITS] - getLlmPrices ERROR ', err)
    });
  }

  /** Compares two snapshots of the current period and records what was charged in between */
  private trackCharges(previous: CreditsPeriod | null, next: CreditsPeriod | null) {
    if (!previous || !next || previous.start !== next.start) {
      return;
    }
    const at = new Date();
    const charges: CreditsLiveCharge[] = [];
    const resourceOf = (usage: CreditsLlmUsage) => usage.resource || 'llm';

    Object.keys(next.resources).forEach((resource) => {
      if (next.llm.some((usage) => resourceOf(usage) === resource)) {
        return;
      }
      const before = previous.resources[resource] || { credits: 0, units: 0 };
      const after = next.resources[resource];
      const credits = round(after.credits - before.credits);
      if (credits > 0 || after.units > before.units) {
        charges.push({ at, resource, units: after.units - before.units, credits });
      }
    });

    next.llm.forEach((usage) => {
      const before = previous.llm.find((u) => resourceOf(u) === resourceOf(usage) && u.provider === usage.provider && u.model === usage.model && u.ownKey === usage.ownKey);
      const credits = round(usage.credits - (before ? before.credits : 0));
      const calls = usage.calls - (before ? before.calls : 0);
      if (credits > 0 || calls > 0) {
        charges.push({ at, resource: resourceOf(usage), model: modelLabel(usage), ownKey: usage.ownKey, units: calls, credits });
      }
    });

    if (charges.length) {
      this.liveCharges = charges.concat(this.liveCharges).slice(0, LIVE_LOG_SIZE);
    }
  }

  private startAutoRefresh() {
    this.stopAutoRefresh();
    if (!this.autoRefresh) {
      return;
    }
    this.refreshTimer = setInterval(() => {
      if (!document.hidden && this.isCredits) {
        this.load();
      }
    }, LIVE_REFRESH_MS);
  }

  private stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

function round(value: number): number {
  return Math.round(value * 1000000) / 1000000;
}
