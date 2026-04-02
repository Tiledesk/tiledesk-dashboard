import { TestBed } from '@angular/core/testing';
import { FeatureToggleService, FeatureFlags } from './feature-toggle.service';
import { AppConfigService } from 'app/services/app-config.service';
import { AppConfigServiceStub } from 'app/testing/stubs/app-config.stub';

function buildService(oscode: string): FeatureToggleService {
  const stub = new AppConfigServiceStub(oscode);
  TestBed.configureTestingModule({
    providers: [
      FeatureToggleService,
      { provide: AppConfigService, useValue: stub }
    ]
  });
  return TestBed.inject(FeatureToggleService);
}

describe('FeatureToggleService', () => {

  // ── T3.1: chiave vuota ────────────────────────────────────────────────────
  describe('T3.1 — chiave OSCODE vuota', () => {
    it('dovrebbe restituire tutti i flag a false', () => {
      const svc = buildService('');
      const flags: FeatureFlags = svc.getFlags();
      Object.values(flags).forEach(v => expect(v).toBe(false));
    });
  });

  // ── T3.2: flag :T → true ──────────────────────────────────────────────────
  describe('T3.2 — flag con valore T', () => {
    it('dovrebbe restituire true per i flag impostati a T', () => {
      const svc = buildService('PAY:T-ANA:T');
      expect(svc.getFlag('PAY')).toBe(true);
      expect(svc.getFlag('ANA')).toBe(true);
    });
  });

  // ── T3.3: flag :F → false ─────────────────────────────────────────────────
  describe('T3.3 — flag con valore F', () => {
    it('dovrebbe restituire false per i flag impostati a F', () => {
      const svc = buildService('PAY:F-ANA:F');
      expect(svc.getFlag('PAY')).toBe(false);
      expect(svc.getFlag('ANA')).toBe(false);
    });
  });

  // ── T3.4: flag assente → false (default sicuro) ───────────────────────────
  describe('T3.4 — flag assente nella chiave', () => {
    it('dovrebbe restituire false per flag non presenti nella chiave', () => {
      const svc = buildService('PAY:T');  // ANA, APP, … non presenti
      expect(svc.getFlag('ANA')).toBe(false);
      expect(svc.getFlag('APP')).toBe(false);
      expect(svc.getFlag('OPH')).toBe(false);
    });
  });

  // ── T3.5: chiave completa ─────────────────────────────────────────────────
  describe('T3.5 — chiave OSCODE completa (tutti i flag)', () => {
    it('dovrebbe parsare correttamente tutti gli 8 flag', () => {
      const svc = buildService('PAY:T-ANA:T-APP:T-OPH:T-HPB:F-PPB:F-KNB:T-QIN:T');
      expect(svc.getFlag('PAY')).toBe(true);
      expect(svc.getFlag('ANA')).toBe(true);
      expect(svc.getFlag('APP')).toBe(true);
      expect(svc.getFlag('OPH')).toBe(true);
      expect(svc.getFlag('HPB')).toBe(false);
      expect(svc.getFlag('PPB')).toBe(false);
      expect(svc.getFlag('KNB')).toBe(true);
      expect(svc.getFlag('QIN')).toBe(true);
    });
  });

  // ── T3.6: getter di convenienza ───────────────────────────────────────────
  describe('T3.6 — getter di convenienza', () => {
    it('dovrebbe esporre i getter con i valori corretti', () => {
      const svc = buildService('PAY:T-ANA:F-APP:T-OPH:F-HPB:T-PPB:T-KNB:F-QIN:T');
      expect(svc.isVisiblePay).toBe(true);
      expect(svc.isVisibleANA).toBe(false);
      expect(svc.isVisibleAPP).toBe(true);
      expect(svc.isVisibleOPH).toBe(false);
      expect(svc.isVisibleHomeBanner).toBe(true);
      expect(svc.projectPlanBadge).toBe(true);
      expect(svc.isVisibleKNB).toBe(false);
      expect(svc.isVisibleQIN).toBe(true);
    });
  });

  // ── T3.7: parseOscode come funzione pura ─────────────────────────────────
  describe('T3.7 — parseOscode è una funzione pura', () => {
    let svc: FeatureToggleService;

    beforeEach(() => {
      svc = buildService('');
    });

    it('non dovrebbe mutare lo stato interno chiamando parseOscode direttamente', () => {
      const result1 = svc.parseOscode('PAY:T');
      const result2 = svc.parseOscode('PAY:F');
      expect(result1.PAY).toBe(true);
      expect(result2.PAY).toBe(false);
      // lo stato interno del servizio rimane quello inizializzato con chiave vuota
      expect(svc.isVisiblePay).toBe(false);
    });
  });
});
