/**
 * Stub minimalisti per i servizi con poca logica nel HomeComponent.
 * Raggruppati in un unico file per ridurre il numero di import nei test.
 */

import { BehaviorSubject, of } from 'rxjs';
import { ProjectPermissions } from 'app/core/permissions.service';
import { QuotaState } from 'app/services/quotas-state.service';
import { DashletConfig } from 'app/services/onboarding-preferences.service';

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

// ── QuotasStateService ─────────────────────────────────────────────────────────
const DEFAULT_QUOTA_STATE: QuotaState = {
  requests: { count: 0, limit: 0, perc: 0, runnedOut: false },
  messages: { count: 0, limit: 0, perc: 0 },
  email:    { count: 0, limit: 0, perc: 0, runnedOut: false },
  tokens:   { count: 0, limit: 0, perc: 0, runnedOut: false },
  voice:    { count: 0, countMinSec: '0m 0s', limit: 0, limitInSec: 0, perc: 0, runnedOut: false },
};

export class QuotasStateServiceStub {
  private _snapshot: QuotaState = { ...DEFAULT_QUOTA_STATE };
  readonly state$ = new BehaviorSubject<QuotaState>(this._snapshot);

  get snapshot(): QuotaState { return this._snapshot; }

  setProjectId(_id: string): void {}
  setVoiceEnabled(_enabled: boolean): void {}
  secondsToMinutes_seconds(seconds: number): string {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  setState(overrides: Partial<QuotaState>): void {
    this._snapshot = { ...DEFAULT_QUOTA_STATE, ...overrides } as QuotaState;
    this.state$.next(this._snapshot);
  }
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

// ── OnboardingPreferencesService ───────────────────────────────────────────────
const DEFAULT_DASHLET_CONFIG: DashletConfig = {
  displayAnalyticsConvsGraph: false, displayAnalyticsIndicators: false,
  displayConnectWhatsApp: false,     displayWhatsappAccountWizard: false,
  displayCreateChatbot: true,        displayInviteTeammate: true,
  displayKnowledgeBase: true,        displayCustomizeWidget: false,
  displayNewsFeed: true,             displayKbHeroSection: false,
  childListOrder: [
    { pos: 1, type: 'child1' }, { pos: 2, type: 'child2' },
    { pos: 3, type: 'child5' }, { pos: 4, type: 'child7' },
    { pos: 5, type: 'child6' }, { pos: 6, type: 'child8' },
    { pos: 7, type: 'child3' }, { pos: 8, type: 'child4' },
  ],
  solution: undefined, solutionChannel: undefined, useCase: undefined,
};

export class OnboardingPreferencesServiceStub {
  resolveConfig(_attributes: any): DashletConfig {
    return { ...DEFAULT_DASHLET_CONFIG, childListOrder: [...DEFAULT_DASHLET_CONFIG.childListOrder] };
  }
}

// ── ProjectInitializerService ──────────────────────────────────────────────────
export class ProjectInitializerServiceStub {
  initialize(_projectId: string): void {}
}
