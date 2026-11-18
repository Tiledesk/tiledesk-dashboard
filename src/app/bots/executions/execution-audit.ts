import { AuditView } from './executions.models';

// A stop is shown as a pause (feedback 2026-11-13); the action codes keep their names.
const PHRASES: { [action: string]: string } = {
  stop_soft: 'paused execution',
  stop_hard: 'paused execution',
  destroy: 'destroyed execution',
  resume: 'resumed execution',
  start_new: 'started a new run of execution',
};
const TRIED: { [action: string]: string } = {
  stop_soft: 'tried to pause execution',
  stop_hard: 'tried to pause execution',
  destroy: 'tried to destroy execution',
  resume: 'tried to resume execution',
  start_new: 'tried to start a new run of execution',
};
/** After "<id> of <agent>": the soft pause waits for the current action, the hard one does not. */
export const PAUSE_MODE: { [action: string]: string } = { stop_soft: 'after the current action', stop_hard: 'now' };
/** A refusal's status as the page names it: stopped/stopping read paused/pausing. */
const SHOWN_STATUS: { [status: string]: string } = { stopped: 'paused', stopping: 'pausing' };
export function shownStatus(status: string): string {
  return Object.prototype.hasOwnProperty.call(SHOWN_STATUS, status) ? SHOWN_STATUS[status] : status;
}

/** The same last 6 hex characters of the id, without dashes, that the server and Activities use. */
export function auditShortId(executionId: string): string {
  return String(executionId || '').replace(/-/g, '').slice(-6);
}

/** The name of a block by its step_seq, on the execution on screen; null when unknown. */
export type BlockNameOf = (stepSeq: number) => string | null;

/** "block <name>", or "block <step_seq>" when the name is unknown. */
function blockLabel(seq: any, blockName?: BlockNameOf): string {
  const name = blockName && typeof seq === 'number' ? blockName(seq) : null;
  return `block ${name || seq}`;
}

/** What a data_viewed row showed: a block, an attribute's history, the trigger input, or the start new prefill. */
export function auditViewedTarget(e: AuditView, blockName?: BlockNameOf): string {
  const d = e.details || {};
  if (d.key) return `attribute ${d.key}`;
  if (d.purpose === 'trigger') return 'trigger input';
  if (d.purpose === 'start_new_prefill') return 'start new input';
  if (d.step_seq !== undefined && d.step_seq !== null) return blockLabel(d.step_seq, blockName);
  if (d.scope && d.scope.type === 'step') return blockLabel(d.scope.step_seq, blockName);
  return 'whole execution';
}

export function auditResult(e: AuditView): string {
  return (e.details && typeof e.details.result === 'string') ? e.details.result : '';
}

/** `accepted`, `requested` or `rejected: <code>` (the stored `rejected:<code>`); empty when the row has no result. */
export function auditResultLabel(e: AuditView): string {
  const r = auditResult(e);
  if (/^rejected(:|$)/.test(r)) {
    const i = r.indexOf(':');
    return i >= 0 ? `rejected: ${shownStatus(r.substring(i + 1))}` : 'rejected';
  }
  return r;
}

export function auditResultKind(e: AuditView): 'ok' | 'pending' | 'bad' | 'none' {
  const r = auditResult(e);
  if (!r) return 'none';
  if (/^rejected(:|$)/.test(r)) return 'bad';
  return r === 'requested' ? 'pending' : 'ok';
}

/**
 * One sentence per row, in the words Activities uses for the same actions (the reason and the result are shown apart).
 * `executionId` and `agent` are the execution on screen; `blockName` names its blocks (else their number).
 */
export function auditSentence(e: AuditView, executionId: string, agent: string, blockName?: BlockNameOf): string {
  const actor = (e.actor && e.actor.name) || 'someone';
  const id6 = auditShortId(executionId);
  const where = `${id6} of ${agent || 'agent'}`;
  const rejected = auditResultKind(e) === 'bad';
  switch (e.action) {
    case 'stop_soft':
    case 'stop_hard':
    case 'destroy':
    case 'resume':
    case 'start_new':
      return `${actor} ${rejected ? TRIED[e.action] : PHRASES[e.action]} ${where}${PAUSE_MODE[e.action] ? ' ' + PAUSE_MODE[e.action] : ''}`;
    case 'data_viewed':
      return `${actor} viewed data (${auditViewedTarget(e, blockName)})`;
    case 'data_access_requested': {
      const scope = e.details && e.details.scope && e.details.scope.type === 'step' ? '1 block' : 'whole execution';
      return `${actor} requested access to the data of execution ${where} · ${scope}`;
    }
    case 'data_access_denied': {
      const role = e.details && e.details.role;
      return `${actor} was denied access to the data of execution ${where}${role ? ` (role ${role})` : ''}`;
    }
    case 'retention_update':
      return `${actor} changed executions retention`;
    case 'stop_notice_update':
      return `${actor} changed the executions pause notice`;
    default:
      return `${actor} ${String(e.action || '').replace(/_/g, ' ')}`;
  }
}
