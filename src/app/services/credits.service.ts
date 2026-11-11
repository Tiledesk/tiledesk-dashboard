import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';

export type CreditsBillingStatus = 'active' | 'grace' | 'suspended' | 'canceled';

export interface CreditsLlmPrice {
  input: number;
  output: number;
  total: number;
}

/** GET /:projectid/credits (and `credits` of POST /:projectid/quotes, without the price list) */
export interface CreditsSummary {
  metering: 'credits' | 'quotes';
  grant?: number;
  period?: { start: string; end: string };
  balance?: { grant: number; packs: number; packsFrozen: boolean; available: number };
  billing?: { status: CreditsBillingStatus; graceUntil?: string };
  creditsFrom?: string;
  packs?: number;
  fees?: { [resource: string]: number };
  monthlyFees?: { [resource: string]: number };
  llmPrices?: { [provider: string]: { [model: string]: CreditsLlmPrice } };
  packMin?: number;
}

export interface CreditsLlmUsage {
  provider: string;
  model: string;
  credits: number;
  tokens: number;
  /** provider cost, USD */
  cost?: number;
  calls: number;
  unpriced: number;
}

/** One period of GET /:projectid/credits/history */
export interface CreditsPeriod {
  start: string;
  end: string;
  closed: boolean;
  grant: number;
  expired: number;
  consumed: number;
  fromGrant: number;
  fromPacks: number;
  packsPurchased: number;
  adjustments: { [kind: string]: number };
  resources: { [resource: string]: { credits: number; units: number; tokens?: number } };
  llm: CreditsLlmUsage[];
}

export interface ProjectCredits {
  projectId: string;
  /** null while the project is on plan quotas */
  summary: CreditsSummary | null;
}

const POLL_INTERVAL_MS = 30000;

@Injectable({
  providedIn: 'root'
})
export class CreditsService implements OnDestroy {

  private creditsSubject = new BehaviorSubject<ProjectCredits | null>(null);
  /** Credits of the current project, refreshed while it is metered in credits */
  credits$: Observable<ProjectCredits | null> = this.creditsSubject.asObservable();

  private projectId: string | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) { }

  ngOnDestroy() {
    this.stopPolling();
  }

  private httpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.auth.user_bs.value?.token
      })
    };
  }

  private url(projectId: string, path = '') {
    return this.appConfigService.getConfig().SERVER_BASE_URL + projectId + '/credits' + path;
  }

  getSummary(projectId: string): Observable<CreditsSummary> {
    return this.http.get<CreditsSummary>(this.url(projectId), this.httpOptions()).pipe(
      tap((summary) => this.publish(projectId, summary))
    );
  }

  getHistory(projectId: string, limit = 12): Observable<CreditsPeriod[]> {
    return this.http.get<CreditsPeriod[]>(this.url(projectId, '/history?limit=' + limit), this.httpOptions());
  }

  /** Stripe checkout of a credits pack: the caller redirects to `url` */
  buyPack(projectId: string, credits: number): Observable<{ id: string; url: string }> {
    return this.http.post<{ id: string; url: string }>(this.url(projectId, '/packs'), { credits }, this.httpOptions());
  }

  /** Called on project change: loads the credits of the project */
  watch(projectId: string) {
    if (!projectId || projectId === this.projectId) {
      return;
    }
    this.projectId = projectId;
    this.stopPolling();
    this.creditsSubject.next(null);
    this.refresh();
  }

  refresh() {
    if (!this.projectId) {
      return;
    }
    const projectId = this.projectId;
    this.getSummary(projectId).subscribe({
      error: (err) => this.logger.error('[CREDITS-SERVICE] - getSummary ERROR ', err)
    });
  }

  /** Summary from any source (GET /credits, POST /quotes); null or 'quotes' metering for quota projects */
  publish(projectId: string, summary: CreditsSummary | null) {
    if (projectId !== this.projectId) {
      return;
    }
    const credits = summary && summary.metering === 'credits' ? summary : null;
    const current = this.creditsSubject.value?.summary;
    // POST /quotes returns the summary without the price list: keep the one already loaded
    const merged = credits && current ? Object.assign({}, current, credits) : credits;
    this.creditsSubject.next({ projectId, summary: merged });
    if (merged) {
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  private startPolling() {
    if (this.pollTimer) {
      return;
    }
    this.pollTimer = setInterval(() => {
      if (!document.hidden) {
        this.refresh();
      }
    }, POLL_INTERVAL_MS);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
