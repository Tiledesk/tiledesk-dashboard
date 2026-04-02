import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { QuotesService } from 'app/services/quotes.service';

// ─── Interfacce pubbliche ─────────────────────────────────────────────────────

export interface QuotaMetric {
  count: number;
  limit: number;
  perc: number;
  runnedOut: boolean;
}

export interface QuotaState {
  requests: QuotaMetric;
  messages: { count: number; limit: number; perc: number };
  email: QuotaMetric;
  tokens: QuotaMetric;
  voice: {
    count: number;
    countMinSec: string;
    limit: number;
    limitInSec: number;
    perc: number;
    runnedOut: boolean;
  };
}

const DEFAULT_STATE: QuotaState = {
  requests: { count: 0, limit: 0, perc: 0, runnedOut: false },
  messages: { count: 0, limit: 0, perc: 0 },
  email:    { count: 0, limit: 0, perc: 0, runnedOut: false },
  tokens:   { count: 0, limit: 0, perc: 0, runnedOut: false },
  voice:    { count: 0, countMinSec: '0m 0s', limit: 0, limitInSec: 0, perc: 0, runnedOut: false },
};

@Injectable({
  providedIn: 'root'
})
export class QuotasStateService {

  private _state$        = new BehaviorSubject<QuotaState>({ ...DEFAULT_STATE });
  private _projectId$    = new BehaviorSubject<string | null>(null);
  private _voiceEnabled$ = new BehaviorSubject<boolean>(false);

  readonly state$: Observable<QuotaState> = this._state$.asObservable();

  constructor(private quotesService: QuotesService) {
    combineLatest([
      this.quotesService.quotesData$,
      this._projectId$,
      this._voiceEnabled$,
    ]).pipe(
      filter(([data, pid]) => !!data && !!pid && data['projectId'] === pid)
    ).subscribe(([data, , voiceEnabled]) => {
      this._state$.next(this.computeState(data, voiceEnabled));
    });
  }

  // ─── API pubblica ─────────────────────────────────────────────────────────

  get snapshot(): QuotaState {
    return this._state$.getValue();
  }

  setProjectId(id: string): void {
    this._projectId$.next(id);
  }

  setVoiceEnabled(enabled: boolean): void {
    this._voiceEnabled$.next(enabled);
  }

  // ─── Logica di calcolo (pubblica per essere unit-testabile) ───────────────

  computeState(data: any, voiceEnabled: boolean): QuotaState {
    const limits   = data.projectLimits  ?? {};
    const allQuotas = data.allQuotes      ?? {};

    const reqQuote  = allQuotas.requests?.quote      ?? 0;
    const msgQuote  = allQuotas.messages?.quote      ?? 0;
    const emlQuote  = allQuotas.email?.quote         ?? 0;
    const tokQuote  = allQuotas.tokens?.quote        ?? 0;
    const voiQuote  = allQuotas.voice_duration?.quote ?? 0;

    const reqLimit  = limits.requests       ?? 0;
    const msgLimit  = limits.messages       ?? 0;
    const emlLimit  = limits.email          ?? 0;
    const tokLimit  = limits.tokens         ?? 0;
    const voiLimSec = limits.voice_duration ?? 0;
    const voiLimit  = Math.floor(voiLimSec / 60);

    const perc = (used: number, limit: number): number =>
      limit > 0 ? Math.min(100, Math.floor((used / limit) * 100)) : 0;

    return {
      requests: {
        count:     reqQuote,
        limit:     reqLimit,
        perc:      perc(reqQuote, reqLimit),
        runnedOut: reqQuote >= reqLimit && reqLimit > 0,
      },
      messages: {
        count: msgQuote,
        limit: msgLimit,
        perc:  perc(msgQuote, msgLimit),
      },
      email: {
        count:     emlQuote,
        limit:     emlLimit,
        perc:      perc(emlQuote, emlLimit),
        runnedOut: emlQuote >= emlLimit && emlLimit > 0,
      },
      tokens: {
        count:     tokQuote,
        limit:     tokLimit,
        perc:      perc(tokQuote, tokLimit),
        runnedOut: tokQuote >= tokLimit && tokLimit > 0,
      },
      voice: {
        count:      voiQuote,
        countMinSec: this.secondsToMinutes_seconds(voiQuote),
        limit:      voiLimit,
        limitInSec: voiLimSec,
        perc:       perc(voiQuote, voiLimSec),
        runnedOut:  voiceEnabled && voiLimSec > 0 && voiQuote >= voiLimSec,
      },
    };
  }

  secondsToMinutes_seconds(seconds: number): string {
    const minutes          = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
