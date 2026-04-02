/**
 * Stub minimalisti per i servizi con poca logica nel HomeComponent.
 * Raggruppati in un unico file per ridurre il numero di import nei test.
 */

import { BehaviorSubject, of } from 'rxjs';
import { ProjectPermissions } from 'app/core/permissions.service';

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

// ── PermissionsService ─────────────────────────────────────────────────────────
const ALL_FALSE: ProjectPermissions = {
  FLOWS: false, KB: false, ANALYTICS: false, WA_BROADCAST: false,
  TEAMMATES: false, TEAMMATE_DETAILS: false, INVITE: false,
  HISTORY: false, OP: false, WIDGET_SETUP: false, QUOTA_USAGE: false,
};

export class PermissionsServiceStub {
  private _snapshot: ProjectPermissions = { ...ALL_FALSE };
  readonly permissions$ = new BehaviorSubject<ProjectPermissions>(this._snapshot);

  get snapshot(): ProjectPermissions { return this._snapshot; }

  /** Helper per i test: imposta uno snapshot custom */
  setPermissions(overrides: Partial<ProjectPermissions>): void {
    this._snapshot = { ...ALL_FALSE, ...overrides };
    this.permissions$.next(this._snapshot);
  }
}
