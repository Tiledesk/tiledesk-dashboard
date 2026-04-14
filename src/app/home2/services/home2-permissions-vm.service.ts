import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';

export interface Home2PermissionsVm {
  role?: string;
  matchedPermissions?: string[];

  PERMISSION_TO_VIEW_QUOTA_USAGE: boolean;
  PERMISSION_TO_VIEW_OP: boolean;
  PERMISSION_TO_VIEW_WIDGET_SETUP: boolean;
  PERMISSION_TO_VIEW_FLOWS: boolean;
  PERMISSION_TO_VIEW_KB: boolean;
  PERMISSION_TO_VIEW_ANALYTICS: boolean;
  PERMISSION_TO_VIEW_WA_BRODCAST: boolean;
  PERMISSION_TO_VIEW_TEAMMATES: boolean;
  PERMISSION_TO_READ_TEAMMATE_DETAILS: boolean;
  PERMISSION_TO_INVITE: boolean;
}

@Injectable({ providedIn: 'root' })
export class Home2PermissionsVmService {
  constructor(private rolesService: RolesService) {}

  /**
   * Exposes a view-model of permission flags for Home2.
   * Keeps the exact semantics currently implemented in Home2Component:
   * - default roles (owner/admin/agent): explicit allow/deny rules
   * - custom roles: check `matchedPermissions`
   */
  permissions$(unsubscribe$: Subject<any>): Observable<Home2PermissionsVm> {
    this.rolesService.listenToProjectUserPermissions(unsubscribe$);

    return this.rolesService.getUpdateRequestPermission().pipe(
      map((status: any) => {
        const role: string | undefined = status?.role;
        const matched: string[] = status?.matchedPermissions ?? [];

        const isDefaultRole = role === 'owner' || role === 'admin' || role === 'agent';

        const vm: Home2PermissionsVm = {
          role,
          matchedPermissions: matched,

          PERMISSION_TO_VIEW_QUOTA_USAGE:
            isDefaultRole ? true : matched.includes(PERMISSIONS.QUOTA_USAGE_READ),

          PERMISSION_TO_VIEW_OP:
            isDefaultRole ? true : matched.includes(PERMISSIONS.HOURS_READ),

          PERMISSION_TO_VIEW_WIDGET_SETUP:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.WIDGETSETUP_READ),

          PERMISSION_TO_VIEW_FLOWS:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.FLOWS_READ),

          PERMISSION_TO_VIEW_KB:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.KB_READ),

          PERMISSION_TO_VIEW_ANALYTICS:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.ANALYTICS_READ),

          PERMISSION_TO_VIEW_WA_BRODCAST:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.AUTOMATIONSLOG_READ),

          PERMISSION_TO_VIEW_TEAMMATES:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.TEAMMATES_READ),

          PERMISSION_TO_READ_TEAMMATE_DETAILS:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.TEAMMATE_UPDATE),

          PERMISSION_TO_INVITE:
            role === 'owner' || role === 'admin'
              ? true
              : role === 'agent'
                ? false
                : matched.includes(PERMISSIONS.TEAMMATES_CREATE)
        };

        return vm;
      })
    );
  }
}

