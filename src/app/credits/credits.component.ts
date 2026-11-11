import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreditsLlmPrice, CreditsPeriod, CreditsService, CreditsSummary } from 'app/services/credits.service';
import { LoggerService } from 'app/services/logger/logger.service';

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
const LLM_PRICES_SHOWN = 50;

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

  extraCredits: number;
  buyingExtra = false;
  extraError: string | null = null;
  checkoutOutcome: 'success' | 'cancel' | null = null;
  llmPrices: CreditsLlmPrice[] = [];
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
      this.llmPrices = [];
      this.loading = true;
      this.load();
      this.loadLlmPrices();
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

  /** Share of the included credits still available, 0-100 */
  get includedLeftPerc(): number {
    const included = this.summary?.includedCredits;
    const left = this.summary?.balance?.included;
    if (!included || left === undefined) {
      return 0;
    }
    return Math.max(0, Math.min(100, (left / included) * 100));
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

  /** The models used in the period, or the ones matching the search (at most LLM_PRICES_SHOWN) */
  get llmPriceRows(): CreditsLlmPrice[] {
    const filter = this.llmPriceFilter.trim().toLowerCase();
    if (filter) {
      return this.llmPrices.filter((price) => price.id.toLowerCase().includes(filter)).slice(0, LLM_PRICES_SHOWN);
    }
    const used = (this.current?.llm || []).map((usage) => usage.model);
    return this.llmPrices.filter((price) => used.some((model) => price.id === model || price.id.endsWith('/' + model)));
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
        if (!this.extraCredits && summary.extraCreditsMin) {
          this.extraCredits = summary.extraCreditsMin;
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

  loadLlmPrices() {
    const projectId = this.projectId;
    if (!projectId) {
      return;
    }
    this.creditsService.getLlmPrices(projectId).subscribe({
      next: (prices) => {
        if (projectId === this.projectId) {
          this.llmPrices = prices || [];
        }
      },
      error: (err) => this.logger.error('[CREDITS] - getLlmPrices ERROR ', err)
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

  buyExtraCredits() {
    this.extraError = null;
    const credits = Number(this.extraCredits);
    const min = this.summary?.extraCreditsMin || 0;
    if (!Number.isInteger(credits) || credits < min) {
      this.extraError = 'Credits.ExtraMinError';
      return;
    }
    this.buyingExtra = true;
    this.creditsService.buyExtraCredits(this.projectId, credits).subscribe({
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
      const before = previous.llm.find((u) => u.provider === usage.provider && u.model === usage.model && u.ownKey === usage.ownKey);
      const credits = round(usage.credits - (before ? before.credits : 0));
      const calls = usage.calls - (before ? before.calls : 0);
      if (credits > 0 || calls > 0) {
        charges.push({ at, resource: 'llm', model: usage.provider + '/' + usage.model, ownKey: usage.ownKey, units: calls, credits });
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
