import { TestBed } from '@angular/core/testing';
import { QuotasStateService, QuotaState } from './quotas-state.service';
import { QuotesService } from 'app/services/quotes.service';
import { QuotesServiceStub } from 'app/testing/stubs/quotes.stub';

function buildService(): { svc: QuotasStateService; quotesStub: QuotesServiceStub } {
  const quotesStub = new QuotesServiceStub();
  TestBed.configureTestingModule({
    providers: [
      QuotasStateService,
      { provide: QuotesService, useValue: quotesStub }
    ]
  });
  return { svc: TestBed.inject(QuotasStateService), quotesStub };
}

// Helper: dati minimi validi
function makeData(overrides: Partial<any> = {}) {
  return {
    projectId: 'p1',
    projectLimits: { requests: 100, messages: 200, email: 50, tokens: 1000, voice_duration: 3600 },
    allQuotes: {
      requests:       { quote: 50  },
      messages:       { quote: 100 },
      email:          { quote: 10  },
      tokens:         { quote: 500 },
      voice_duration: { quote: 60  }
    },
    ...overrides
  };
}

describe('QuotasStateService', () => {

  // ── T5.1: calcolo percentuale corretto ────────────────────────────────────
  describe('T5.1 — calcolo percentuale corretto', () => {
    it('dovrebbe calcolare perc=50 per quota=50, limit=100', () => {
      const { svc } = buildService();
      const state = svc.computeState(makeData(), false);
      expect(state.requests.perc).toBe(50);
    });
  });

  // ── T5.2: percentuale capped a 100 ───────────────────────────────────────
  describe('T5.2 — percentuale capped a 100', () => {
    it('dovrebbe restituire perc=100 anche se quota > limit', () => {
      const { svc } = buildService();
      const data = makeData();
      data.allQuotes.requests.quote = 150;
      const state = svc.computeState(data, false);
      expect(state.requests.perc).toBe(100);
    });
  });

  // ── T5.3: runnedOut quando quota >= limit ─────────────────────────────────
  describe('T5.3 — runnedOut quando quota >= limit', () => {
    it('dovrebbe impostare runnedOut=true per requests quando quota === limit', () => {
      const { svc } = buildService();
      const data = makeData();
      data.allQuotes.requests.quote = 100;
      const state = svc.computeState(data, false);
      expect(state.requests.runnedOut).toBe(true);
    });

    it('dovrebbe impostare runnedOut=true per email quando quota > limit', () => {
      const { svc } = buildService();
      const data = makeData();
      data.allQuotes.email.quote = 60;
      const state = svc.computeState(data, false);
      expect(state.email.runnedOut).toBe(true);
    });
  });

  // ── T5.4: runnedOut=false quando quota < limit ────────────────────────────
  describe('T5.4 — runnedOut=false quando quota < limit', () => {
    it('dovrebbe avere runnedOut=false per requests quando quota < limit', () => {
      const { svc } = buildService();
      const state = svc.computeState(makeData(), false);
      expect(state.requests.runnedOut).toBe(false); // 50 < 100
    });
  });

  // ── T5.5: null quote gestito → normalizzato a 0 ───────────────────────────
  describe('T5.5 — quota null normalizzato a 0', () => {
    it('dovrebbe trattare quota=null come 0', () => {
      const { svc } = buildService();
      const data = makeData();
      data.allQuotes.requests.quote = null;
      const state = svc.computeState(data, false);
      expect(state.requests.count).toBe(0);
      expect(state.requests.perc).toBe(0);
      expect(state.requests.runnedOut).toBe(false);
    });
  });

  // ── T5.6: voiceRunnedOut solo quando voiceEnabled=true ───────────────────
  describe('T5.6 — voiceRunnedOut rispetta voiceEnabled', () => {
    it('dovrebbe essere false se voiceEnabled=false anche con quota >= limit', () => {
      const { svc } = buildService();
      const data = makeData();
      data.allQuotes.voice_duration.quote = 4000; // > 3600
      const state = svc.computeState(data, false);
      expect(state.voice.runnedOut).toBe(false);
    });

    it('dovrebbe essere true se voiceEnabled=true e quota >= limit', () => {
      const { svc } = buildService();
      const data = makeData();
      data.allQuotes.voice_duration.quote = 4000; // > 3600
      const state = svc.computeState(data, true);
      expect(state.voice.runnedOut).toBe(true);
    });
  });

  // ── T5.7: reattività — stato aggiornato al cambio projectId ──────────────
  describe('T5.7 — reattività a setProjectId', () => {
    it('state$ dovrebbe emettere dopo setProjectId con projectId corrispondente ai dati', (done) => {
      const { svc } = buildService();
      // QuotesServiceStub emette dati con projectId='test-project-id'
      svc.setProjectId('test-project-id');

      svc.state$.subscribe(state => {
        if (state.requests.count > 0) {
          expect(state.requests.count).toBe(50);
          done();
        }
      });
    });
  });

  // ── T5.8: secondsToMinutes_seconds ───────────────────────────────────────
  describe('T5.8 — secondsToMinutes_seconds', () => {
    it('dovrebbe formattare 90 secondi come "1m 30s"', () => {
      const { svc } = buildService();
      expect(svc.secondsToMinutes_seconds(90)).toBe('1m 30s');
    });

    it('dovrebbe formattare 0 secondi come "0m 0s"', () => {
      const { svc } = buildService();
      expect(svc.secondsToMinutes_seconds(0)).toBe('0m 0s');
    });
  });

  // ── T5.9: filtro projectId — dati di altro progetto ignorati ─────────────
  describe('T5.9 — dati di un progetto diverso vengono ignorati', () => {
    it('snapshot dovrebbe rimanere DEFAULT se projectId non corrisponde', () => {
      const { svc } = buildService();
      // QuotesServiceStub emette 'test-project-id', il service aspetta 'altro-id'
      svc.setProjectId('altro-id');
      expect(svc.snapshot.requests.count).toBe(0);
    });
  });
});
