import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';

export interface ProjectPermissions {
  FLOWS: boolean;
  KB: boolean;
  ANALYTICS: boolean;
  WA_BROADCAST: boolean;
  TEAMMATES: boolean;
  TEAMMATE_DETAILS: boolean;
  INVITE: boolean;
  HISTORY: boolean;
  OP: boolean;
  WIDGET_SETUP: boolean;
  QUOTA_USAGE: boolean;
}

const DEFAULT_PERMISSIONS: ProjectPermissions = {
  FLOWS: false,
  KB: false,
  ANALYTICS: false,
  WA_BROADCAST: false,
  TEAMMATES: false,
  TEAMMATE_DETAILS: false,
  INVITE: false,
  HISTORY: false,
  OP: false,
  WIDGET_SETUP: false,
  QUOTA_USAGE: false,
};

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private _permissions$ = new BehaviorSubject<ProjectPermissions>({ ...DEFAULT_PERMISSIONS });
  readonly permissions$: Observable<ProjectPermissions> = this._permissions$.asObservable();

  constructor(private rolesService: RolesService) {
    // listenToProjectUserPermissions avvia le subscription interne di RolesService.
    // Essendo PermissionsService un singleton root, il Subject non viene mai completato
    // (le permission vivono per tutta la durata dell'app).
    this.rolesService.listenToProjectUserPermissions(new Subject<any>());

    this.rolesService.getUpdateRequestPermission()
      .subscribe(status => {
        this._permissions$.next(this.computePermissions(status));
      });
  }

  /**
   * Accesso sincrono all'ultimo valore calcolato.
   * Usato dai getter del componente per evitare la gestione esplicita degli Observable nel template.
   */
  get snapshot(): ProjectPermissions {
    return this._permissions$.getValue();
  }

  // ─── Logica di calcolo ────────────────────────────────────────────────────

  /**
   * Regole per i ruoli standard:
   *  - owner / admin  → tutti i permessi true (eccetto quelli con logica specifica)
   *  - agent          → permessi false (eccetto QUOTA_USAGE e OP: true per tutti i ruoli default)
   *  - custom         → dipende da matchedPermissions
   *
   * QUOTA_USAGE e OP usano una regola diversa: owner/admin/agent → true; custom → controllo flag.
   */
  computePermissions(status: { role: string; matchedPermissions: string[] }): ProjectPermissions {
    const isOwnerOrAdmin = status.role === 'owner' || status.role === 'admin';
    const isDefaultRole  = isOwnerOrAdmin || status.role === 'agent';

    const standard = (flag: string): boolean => {
      if (isOwnerOrAdmin)       return true;
      if (status.role === 'agent') return false;
      return status.matchedPermissions.includes(flag);
    };

    const allDefault = (flag: string): boolean => {
      if (isDefaultRole) return true;
      return status.matchedPermissions.includes(flag);
    };

    return {
      FLOWS:           standard(PERMISSIONS.FLOWS_READ),
      KB:              standard(PERMISSIONS.KB_READ),
      ANALYTICS:       standard(PERMISSIONS.ANALYTICS_READ),
      WA_BROADCAST:    standard(PERMISSIONS.AUTOMATIONSLOG_READ),
      TEAMMATES:       standard(PERMISSIONS.TEAMMATES_READ),
      TEAMMATE_DETAILS: standard(PERMISSIONS.TEAMMATE_UPDATE),
      INVITE:          standard(PERMISSIONS.TEAMMATES_CREATE),
      HISTORY:         false,  // non impostato nell'implementazione originale — mantenuto false
      OP:              allDefault(PERMISSIONS.HOURS_READ),
      WIDGET_SETUP:    standard(PERMISSIONS.WIDGETSETUP_READ),
      QUOTA_USAGE:     allDefault(PERMISSIONS.QUOTA_USAGE_READ),
    };
  }
}
