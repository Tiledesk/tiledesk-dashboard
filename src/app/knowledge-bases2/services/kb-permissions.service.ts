import { Injectable } from '@angular/core';
import { PERMISSIONS } from 'app/utils/permissions.constants';

export type KbRole = 'owner' | 'admin' | 'agent' | string;

export interface KbPermissionsState {
  role: KbRole;
  hasDefaultRole: boolean;
  canDelete: boolean;
  canAddKb: boolean;
  canAddFlows: boolean;
  canEditFlows: boolean;
}

@Injectable({ providedIn: 'root' })
export class KbPermissionsService {
  resolve(role: KbRole, matchedPermissions: string[] = []): KbPermissionsState {
    const isOwnerOrAdmin = role === 'owner' || role === 'admin';
    const isAgent = role === 'agent';

    return {
      role,
      hasDefaultRole: ['owner', 'admin', 'agent'].includes(role),
      canDelete: isOwnerOrAdmin ? true : isAgent ? false : matchedPermissions.includes(PERMISSIONS.KB_DELETE),
      canAddKb: isOwnerOrAdmin ? true : isAgent ? false : matchedPermissions.includes(PERMISSIONS.KB_NAMESPACE_ADD),
      canEditFlows: isOwnerOrAdmin ? true : isAgent ? false : matchedPermissions.includes(PERMISSIONS.FLOW_EDIT),
      canAddFlows: isOwnerOrAdmin ? true : isAgent ? false : matchedPermissions.includes(PERMISSIONS.FLOW_ADD),
    };
  }
}

