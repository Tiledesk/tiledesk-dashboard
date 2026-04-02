/**
 * Stub minimalisti per i servizi con poca logica nel HomeComponent.
 * Raggruppati in un unico file per ridurre il numero di import nei test.
 */

import { BehaviorSubject, of } from 'rxjs';

// ── NotifyService ──────────────────────────────────────────────────────────────
export class NotifyServiceStub {
  _displayContactUsModal(_show: boolean, _type: string): void {}
  presentModalOnlyOwnerCanManageTheAccountPlan(_msg: string, _link: string): void {}
  displaySubscripionHasExpiredModal(_show: boolean, _name: string, _date: Date): void {}
  displayEnterprisePlanHasExpiredModal(_show: boolean, _name: string, _date: Date): void {}
  publishHasClickedChat(_val: boolean): void {}
}

// ── LocalDbService ─────────────────────────────────────────────────────────────
export class LocalDbServiceStub {
  getFromStorage(_key: string): any { return null; }
  removeFromStorage(_key: string): void {}
  getStoredChangelogDate(): boolean { return false; }
  saveUserRoleInStorage(_role: string): void {}
  savChangelogDate(): void {}
}

// ── ProjectPlanService ─────────────────────────────────────────────────────────
export class ProjectPlanServiceStub {
  projectPlan$ = new BehaviorSubject<any>(null);
}

// ── FaqKbService ───────────────────────────────────────────────────────────────
export class FaqKbServiceStub {
  getFaqKbByProjectId() {
    return of([]);
  }
}

// ── LoggerService ──────────────────────────────────────────────────────────────
export class LoggerServiceStub {
  log(..._args: any[]): void {}
  error(..._args: any[]): void {}
  warn(..._args: any[]): void {}
}

// ── AppStoreService ────────────────────────────────────────────────────────────
export class AppStoreServiceStub {}

// ── DepartmentService ──────────────────────────────────────────────────────────
export class DepartmentServiceStub {
  getVisitorCounter() { return of([]); }
}
