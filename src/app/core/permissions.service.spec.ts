import { TestBed } from '@angular/core/testing';
import { PermissionsService, ProjectPermissions } from './permissions.service';
import { RolesService } from 'app/services/roles.service';
import { RolesServiceStub } from 'app/testing/stubs/roles.stub';
import { PERMISSIONS } from 'app/utils/permissions.constants';

function buildService(): { svc: PermissionsService; rolesStub: RolesServiceStub } {
  const rolesStub = new RolesServiceStub();
  TestBed.configureTestingModule({
    providers: [
      PermissionsService,
      { provide: RolesService, useValue: rolesStub }
    ]
  });
  return { svc: TestBed.inject(PermissionsService), rolesStub };
}

describe('PermissionsService', () => {

  // ── T4.1: ruolo owner → tutti i permessi chiave true ─────────────────────
  describe('T4.1 — ruolo owner', () => {
    it('dovrebbe avere tutti i permessi true (eccetto HISTORY)', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('owner', []);

      const p = svc.snapshot;
      expect(p.FLOWS).toBe(true);
      expect(p.KB).toBe(true);
      expect(p.ANALYTICS).toBe(true);
      expect(p.WA_BROADCAST).toBe(true);
      expect(p.TEAMMATES).toBe(true);
      expect(p.TEAMMATE_DETAILS).toBe(true);
      expect(p.INVITE).toBe(true);
      expect(p.OP).toBe(true);
      expect(p.WIDGET_SETUP).toBe(true);
      expect(p.QUOTA_USAGE).toBe(true);
    });
  });

  // ── T4.2: ruolo admin → identico a owner ─────────────────────────────────
  describe('T4.2 — ruolo admin', () => {
    it('dovrebbe avere tutti i permessi true (eccetto HISTORY)', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('admin', []);

      const p = svc.snapshot;
      expect(p.FLOWS).toBe(true);
      expect(p.KB).toBe(true);
      expect(p.ANALYTICS).toBe(true);
      expect(p.WA_BROADCAST).toBe(true);
      expect(p.WIDGET_SETUP).toBe(true);
      expect(p.QUOTA_USAGE).toBe(true);
      expect(p.OP).toBe(true);
    });
  });

  // ── T4.3: ruolo agent → permessi ristretti ────────────────────────────────
  describe('T4.3 — ruolo agent', () => {
    it('dovrebbe avere FLOWS, KB, ANALYTICS, WIDGET_SETUP, WA_BROADCAST, TEAMMATES, INVITE a false', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('agent', []);

      const p = svc.snapshot;
      expect(p.FLOWS).toBe(false);
      expect(p.KB).toBe(false);
      expect(p.ANALYTICS).toBe(false);
      expect(p.WA_BROADCAST).toBe(false);
      expect(p.TEAMMATES).toBe(false);
      expect(p.TEAMMATE_DETAILS).toBe(false);
      expect(p.INVITE).toBe(false);
      expect(p.WIDGET_SETUP).toBe(false);
    });

    it('dovrebbe avere QUOTA_USAGE e OP a true anche per agent', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('agent', []);

      const p = svc.snapshot;
      expect(p.QUOTA_USAGE).toBe(true);
      expect(p.OP).toBe(true);
    });
  });

  // ── T4.4: ruolo custom con FLOWS_READ ─────────────────────────────────────
  describe('T4.4 — ruolo custom con FLOWS_READ', () => {
    it('dovrebbe abilitare solo FLOWS', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('custom', [PERMISSIONS.FLOWS_READ]);

      const p = svc.snapshot;
      expect(p.FLOWS).toBe(true);
      expect(p.KB).toBe(false);
      expect(p.ANALYTICS).toBe(false);
      expect(p.WIDGET_SETUP).toBe(false);
    });
  });

  // ── T4.5: ruolo custom con più permessi ───────────────────────────────────
  describe('T4.5 — ruolo custom con KB_READ + ANALYTICS_READ', () => {
    it('dovrebbe abilitare solo KB e ANALYTICS', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('custom', [PERMISSIONS.KB_READ, PERMISSIONS.ANALYTICS_READ]);

      const p = svc.snapshot;
      expect(p.KB).toBe(true);
      expect(p.ANALYTICS).toBe(true);
      expect(p.FLOWS).toBe(false);
      expect(p.WIDGET_SETUP).toBe(false);
    });
  });

  // ── T4.6: ruolo custom con QUOTA_USAGE_READ e HOURS_READ ─────────────────
  describe('T4.6 — ruolo custom con QUOTA_USAGE_READ e HOURS_READ', () => {
    it('dovrebbe abilitare QUOTA_USAGE e OP', () => {
      const { svc, rolesStub } = buildService();
      rolesStub.emitPermissions('custom', [PERMISSIONS.QUOTA_USAGE_READ, PERMISSIONS.HOURS_READ]);

      const p = svc.snapshot;
      expect(p.QUOTA_USAGE).toBe(true);
      expect(p.OP).toBe(true);
      expect(p.FLOWS).toBe(false);
    });
  });

  // ── T4.7: reattività — cambio ruolo aggiorna permissions$ ─────────────────
  describe('T4.7 — reattività a cambio di ruolo', () => {
    it('permissions$ dovrebbe emettere un nuovo valore al cambio di ruolo', (done) => {
      const { svc, rolesStub } = buildService();
      const emitted: ProjectPermissions[] = [];

      svc.permissions$.subscribe(p => emitted.push(p));

      rolesStub.emitPermissions('agent', []);
      rolesStub.emitPermissions('owner', []);

      // owner: emissione al costruttore (owner default) + agent + owner = 3 emissioni
      expect(emitted.length).toBeGreaterThanOrEqual(2);
      expect(emitted[emitted.length - 1].FLOWS).toBe(true);  // ultimo: owner
      done();
    });
  });

  // ── T4.8: HISTORY sempre false ────────────────────────────────────────────
  describe('T4.8 — HISTORY sempre false', () => {
    it('dovrebbe essere false per owner, agent e custom', () => {
      const { svc, rolesStub } = buildService();

      rolesStub.emitPermissions('owner', []);
      expect(svc.snapshot.HISTORY).toBe(false);

      rolesStub.emitPermissions('agent', []);
      expect(svc.snapshot.HISTORY).toBe(false);

      rolesStub.emitPermissions('custom', [PERMISSIONS.HISTORY_READ]);
      expect(svc.snapshot.HISTORY).toBe(false);
    });
  });

  // ── T4.9: computePermissions come funzione pura ───────────────────────────
  describe('T4.9 — computePermissions è una funzione pura', () => {
    it('non dovrebbe mutare lo stato interno del servizio', () => {
      const { svc } = buildService();
      const result = svc.computePermissions({ role: 'owner', matchedPermissions: [] });
      expect(result.FLOWS).toBe(true);
      // lo snapshot dipende dall'ultima emissione del rolesService stub (owner di default)
      expect(svc.snapshot.FLOWS).toBe(true);
    });
  });
});
