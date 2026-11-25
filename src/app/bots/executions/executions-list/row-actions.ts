import { PERMISSIONS } from 'app/utils/permissions.constants';
import { ExecutionRow } from '../executions.models';

/** The list's actions: pause (stop), resume, destroy — per row and on the selected rows. */
export type RowAction = 'pause' | 'resume' | 'destroy';

/** What the role may do on executions: owner and admin everything, supervisor/agent nothing, custom roles by permission. */
export interface ExecutionGrants {
  control: boolean;
  destroy: boolean;
}

export function executionGrants(role: string, perms: string[] | undefined): ExecutionGrants {
  if (role === 'owner' || role === 'admin') return { control: true, destroy: true };
  if (role === 'supervisor' || role === 'agent' || !role) return { control: false, destroy: false };
  const p = perms || [];
  return { control: p.includes(PERMISSIONS.EXECUTIONS_CONTROL), destroy: p.includes(PERMISSIONS.EXECUTIONS_DESTROY) };
}

/**
 * The statuses each action applies to (the service's controls, spec §6.5): pause a running or waiting run,
 * resume a stopped or failed one, destroy anything not finished. The service still has the last word
 * (no checkpoint, test run, newer execution...): a refused row is reported, never hidden.
 */
const BY_ACTION: Record<RowAction, readonly string[]> = {
  pause: ['running', 'waiting'],
  resume: ['stopped', 'failed'],
  destroy: ['running', 'waiting', 'stopping', 'stopped', 'failed'],
};

export function rowOffers(row: Pick<ExecutionRow, 'status'>, action: RowAction, grants: ExecutionGrants): boolean {
  if (!row) return false;
  const allowed = action === 'destroy' ? grants.destroy : grants.control;
  return allowed && BY_ACTION[action].includes(row.status);
}

/** The rows of the selection an action applies to. */
export function rowsFor<T extends Pick<ExecutionRow, 'status'>>(rows: T[], action: RowAction, grants: ExecutionGrants): T[] {
  return (rows || []).filter(r => rowOffers(r, action, grants));
}

/** A row's checkbox is offered when any action could apply to it. */
export function selectable(row: Pick<ExecutionRow, 'status'>, grants: ExecutionGrants): boolean {
  return rowOffers(row, 'pause', grants) || rowOffers(row, 'resume', grants) || rowOffers(row, 'destroy', grants);
}

/** Outcome of a bulk action: done, failed, and (resume) the ones that need a one-by-one confirm. */
export interface BulkOutcome {
  done: number;
  failed: number;
  confirm: number;
}
