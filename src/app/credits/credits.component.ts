import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreditsPeriod, CreditsService, CreditsSummary } from 'app/services/credits.service';
import { LoggerService } from 'app/services/logger/logger.service';

/** Charge seen between two refreshes of the page (the server has no movements API) */
export interface CreditsLiveCharge {
  at: Date;
  resource: string;
  model?: string;
  units: number;
  credits: number;
}

const LIVE_REFRESH_MS = 10000;
const LIVE_LOG_SIZE = 50;

@Component({
  selector: 'appdashboard-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent implements OnInit, OnDestroy {

  projectId: string;
  summary: CreditsSummary | null = null;
  history: CreditsPeriod[] = [];
  current: CreditsPeriod | null = null;

  loading = true;
  loadError = false;
  lastUpdate: Date | null = null;

  autoRefresh = true;
  liveCharges: CreditsLiveCharge[] = [];

  packCredits: number;
  buyingPack = false;
  packError: string | null = null;
  checkoutOutcome: 'success' | 'cancel' | null = null;
  llmPriceFilter = '';

  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private creditsService: CreditsService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      this.projectId = params.get('projectid');
      this.summary = null;
      this.history = [];
      this.current = null;
      this.liveCharges = [];
      this.loading = true;
      this.load();
    });
    this.route.queryParamMap.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      const outcome = params.get('credits_checkout');
      this.checkoutOutcome = outcome === 'success' || outcome === 'cancel' ? outcome : null;
    });
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get isCredits(): boolean {
    return this.summary?.metering === 'credits';
  }

  /** Share of the grant still available, 0-100 */
  get grantLeftPerc(): number {
    const grant = this.summary?.grant;
    const left = this.summary?.balance?.grant;
    if (!grant || left === undefined) {
      return 0;
    }
    return Math.max(0, Math.min(100, (left / grant) * 100));
  }

  get resourceRows(): { resource: string; credits: number; units: number; tokens?: number; perc: number }[] {
    if (!this.current) {
      return [];
    }
    const consumed = this.current.consumed || 0;
    return Object.keys(this.current.resources)
      .map((resource) => {
        const total = this.current.resources[resource];
        return { resource, credits: total.credits, units: total.units, tokens: total.tokens, perc: consumed ? (total.credits / consumed) * 100 : 0 };
      })
      .sort((a, b) => b.credits - a.credits);
  }

  get llmPriceRows(): { provider: string; model: string; input: number; output: number; total: number }[] {
    const prices = this.summary?.llmPrices || {};
    const filter = this.llmPriceFilter.trim().toLowerCase();
    const rows = [];
    Object.keys(prices).sort().forEach((provider) => {
      Object.keys(prices[provider]).sort().forEach((model) => {
        if (!filter || (provider + '/' + model).toLowerCase().includes(filter)) {
          rows.push(Object.assign({ provider, model }, prices[provider][model]));
        }
      });
    });
    return rows;
  }

  objectKeys(value: object): string[] {
    return value ? Object.keys(value) : [];
  }

  load() {
    const projectId = this.projectId;
    if (!projectId) {
      return;
    }
    forkJoin({
      summary: this.creditsService.getSummary(projectId),
      history: this.creditsService.getHistory(projectId, 12)
    }).subscribe({
      next: ({ summary, history }) => {
        if (projectId !== this.projectId) {
          return;
        }
        const previous = this.current;
        this.summary = summary;
        this.history = history || [];
        this.current = this.history.length ? this.history[0] : null;
        if (!this.packCredits && summary.packMin) {
          this.packCredits = summary.packMin;
        }
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

  onAutoRefreshChange() {
    if (this.autoRefresh) {
      this.startAutoRefresh();
      this.load();
    } else {
      this.stopAutoRefresh();
    }
  }

  clearLiveCharges() {
    this.liveCharges = [];
  }

  buyPack() {
    this.packError = null;
    const credits = Number(this.packCredits);
    const packMin = this.summary?.packMin || 0;
    if (!Number.isInteger(credits) || credits < packMin) {
      this.packError = 'Credits.PackMinError';
      return;
    }
    this.buyingPack = true;
    this.creditsService.buyPack(this.projectId, credits).subscribe({
      next: (session) => {
        window.location.href = session.url;
      },
      error: (err) => {
        this.logger.error('[CREDITS] - buyPack ERROR ', err);
        this.buyingPack = false;
        this.packError = err?.status === 501 ? 'Credits.PacksNotAvailable'
          : err?.status === 403 ? 'Credits.PacksAdminOnly'
            : 'Credits.PackCheckoutError';
      }
    });
  }

  /** Compares two snapshots of the current period and records what was charged in between */
  private trackCharges(previous: CreditsPeriod | null, next: CreditsPeriod | null) {
    if (!previous || !next || previous.start !== next.start) {
      return;
    }
    const at = new Date();
    const charges: CreditsLiveCharge[] = [];

    Object.keys(next.resources).forEach((resource) => {
      if (resource === 'llm') {
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
      const before = previous.llm.find((u) => u.provider === usage.provider && u.model === usage.model);
      const credits = round(usage.credits - (before ? before.credits : 0));
      const calls = usage.calls - (before ? before.calls : 0);
      if (credits > 0 || calls > 0) {
        charges.push({ at, resource: 'llm', model: usage.provider + '/' + usage.model, units: calls, credits });
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
  return Math.round(value * 10000) / 10000;
}
