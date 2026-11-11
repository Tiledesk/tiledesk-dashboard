import { PERMISSIONS } from 'app/utils/permissions.constants';

// Mirrors the tiledesk-executions API (src/api/routes/executions.ts, src/api/stateView.ts).

export type ExecutionStatus = string;

export interface ExecutionRow {
  _id: string;
  agent_id: string;
  agent_name: string | null;
  status: ExecutionStatus;
  end_reason: string | null;
  trigger: any | null;
  started_at: string | null;
  duration_ms: number | null;
  steps_count: number;
  failure_conditions: number;
  vars_changed: number;
  trace_complete: boolean | null;
  test: boolean;
}

export interface ExecutionPage {
  items: ExecutionRow[];
  next_cursor: string | null;
}

export interface ExecutionListParams {
  agent_id?: string;
  trigger?: string;
  status?: string;
  has_failures?: boolean;
  test?: boolean;
  from?: string;
  to?: string;
  q?: string;
  limit?: number;
  cursor?: string;
}

export interface ExecutionRetention {
  trace_until: string | null;
  data_until: string | null;
}

export interface Execution {
  _id: string;
  id_project: string;
  agent_id: string;
  agent_name: string | null;
  agent_version: string | null;
  test: boolean;
  request_id: string;
  conversation_link: string | null;
  trigger: any | null;
  status: ExecutionStatus;
  end_reason: string | null;
  error: any | null;
  handed_to_bot_id: string | null;
  failure_conditions: number;
  steps_count: number;
  actions_count: number;
  vars_changed: number;
  started_at: string | null;
  ended_at: string | null;
  last_event_at: string | null;
  duration_ms: number | null;
  last_seq: number | null;
  trace_complete: boolean | null;
  missing_seq: number[];
  has_checkpoint: boolean;
  has_data: boolean;
  retention: ExecutionRetention | null;
  // Phase 2 (stop / destroy)
  stop_mode?: 'soft' | 'hard' | null;
  stopped_at?: string | null;
  interrupted_action?: InterruptedAction | null;
  messages_while_stopped?: number | null;
  conversation_closed_at?: string | null;
}

export interface InterruptedAction {
  index: number;
  action_id: string | null;
  type: string | null;
  title: string | null;
}

export type ControlName = 'stop' | 'stop_hard_now' | 'destroy' | 'resume' | 'start_new';

/** Why a control the status offers is not allowed (version_gone only comes back from a resume attempt). */
export type ControlReason =
  | 'role'
  | 'test_run'
  | 'no_checkpoint'
  | 'conversation_closed'
  | 'newer_execution'
  | 'already_resumed'
  | 'not_unattended'
  | 'unsupported_trigger'
  | 'version_gone';

export const CONTROL_REASONS: ControlReason[] = [
  'role', 'test_run', 'no_checkpoint', 'conversation_closed', 'newer_execution', 'already_resumed',
  'not_unattended', 'unsupported_trigger', 'version_gone',
];

/** A control offered for the status; allowed:false with the reason when the role or the execution blocks it. */
export interface AllowedControl {
  name: ControlName;
  allowed: boolean;
  reason?: ControlReason;
}

/** The action a resume would run first, as a 409 confirm_required names it. */
export interface ResumeAction {
  index: number | null;
  type: string | null;
  title: string | null;
}

/** GET start-new/input: the stored trigger input, masked values set to null and listed by path. */
export interface StartNewInput {
  input: { [k: string]: any };
  masked: string[];
}

export interface StepAction {
  index: number;
  action_id: string | null;
  type: string | null;
  title: string | null;
  outcome: string | null;
  exit_taken: string | null;
  duration_ms: number | null;
  error_code: string | null;
  has_data: boolean;
  hard_degraded: boolean;
  at: string | null;
}

export interface OutsideChange {
  key: string;
  by: string | null;
}

export interface Step {
  seq: number;
  block_id: string | null;
  block_name: string | null;
  agent_id: string | null;
  agent_version: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_ms: number | null;
  outcome: string | null;
  exit_taken: string | null;
  state_vars: number | null;
  changed_keys: number;
  actions: StepAction[];
  outside: OutsideChange[];
}

export interface Lineage {
  parent: string | null;
  previous: string | null;
  retry_of: string | null;
  retried_as: string[];
}

export interface ExecutionDetail {
  execution: Execution;
  steps: Step[];
  allowed_controls: AllowedControl[];
  lineage: Lineage;
}

export interface AgentSummary {
  running: number;
  waiting: number;
  failed: number;
  stopped: number;
  last_started_at: string | null;
}

export interface Summary {
  agents: { [agentId: string]: AgentSummary };
}

export interface VarSide {
  type: string | null;
  size: number | null;
  hash: string | null;
}

export interface VarView {
  key: string;
  reserved: boolean;
  before: VarSide | null;
  after: VarSide | null;
  changed: boolean;
  by: string | null;
}

export interface StateView {
  step_seq: number;
  partial: boolean;
  vars: VarView[];
}

export interface VarHistoryEntry {
  seq: number;
  step_seq: number | null;
  block_name?: string | null;
  action_id: string | null;
  by: string | null;
  op: string | null;
  type: string | null;
  size: number | null;
  hash_before: string | null;
  hash_after: string | null;
  omitted?: string;
}

/** Who may see execution traces: owner/admin/supervisor yes, agent no, custom roles need executions_read. */
export function canViewExecutions(role: string, matchedPermissions: string[] | undefined): boolean {
  if (role === 'owner' || role === 'admin' || role === 'supervisor') return true;
  if (role === 'agent') return false;
  return !!matchedPermissions && matchedPermissions.includes(PERMISSIONS.EXECUTIONS_READ);
}
