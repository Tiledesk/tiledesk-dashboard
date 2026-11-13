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
  /** Unhandled actions (an error, or a failure condition with no jump): the run is "with errors" when > 0. */
  errors: number;
  vars_changed: number;
  trace_complete: boolean | null;
  test: boolean;
}

export interface ExecutionPage {
  items: ExecutionRow[];
  next_cursor: string | null;
  /** With with_stats=true: the stats of range (or stats_range) with the list's filters (the stats route's body). */
  stats?: ExecutionStats;
}

export interface ExecutionListParams {
  agent_id?: string;
  trigger?: string;
  status?: string;
  has_failures?: boolean;
  /** errors > 0 (true) or not (false) */
  has_errors?: boolean;
  /** true: test runs only; 'all': real and test runs; unset: real runs only */
  test?: boolean | 'all';
  from?: string;
  to?: string;
  q?: string;
  limit?: number;
  cursor?: string;
  /** The graph's view instead of from/to: now = the unfinished runs of any age; a range adds every run started in it. */
  range?: StatsRange;
  /** Adds `stats` to the page (one call instead of list + stats), over range and the list's filters. */
  with_stats?: boolean;
  /** Older form of the stats' range (without range); range is preferred. */
  stats_range?: Exclude<StatsRange, 'now'>;
}

/** The filters the list, the stats and the graph share (spec addendum 3: cards, list and graph describe one set). */
export interface ViewFilters {
  agent_id?: string;
  /** a comma list; 'unattended' stands for the unattended triggers */
  trigger?: string;
  status?: string;
  has_failures?: boolean;
  has_errors?: boolean;
  q?: string;
  /** /graph and /stats: 'all' (their default), true test only, false real only */
  test?: boolean | 'all';
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
  /** Unhandled actions of the run (missing on an older API: none). */
  errors?: number;
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
  /** when the last resume was accepted (ISO), null if never */
  resumed_at?: string | null;
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
  | 'no_trigger_source'
  | 'version_gone';

export const CONTROL_REASONS: ControlReason[] = [
  'role', 'test_run', 'no_checkpoint', 'conversation_closed', 'newer_execution', 'already_resumed',
  'not_unattended', 'unsupported_trigger', 'no_trigger_source', 'version_gone',
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
export type StartNewStored = 'ok' | 'none' | 'unreadable' | 'structure_only';

export interface StartNewInput {
  input: { [k: string]: any };
  masked: string[];
  /** ok: values returned; none/unreadable: nothing to prefill; structure_only: values hidden for the role */
  stored?: StartNewStored;
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
  /** The action compromised the flow (outcome error, or failure_condition with no jump); missing on an older API: false. */
  unhandled?: boolean;
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

/** The graph's view (tiledesk-executions GET /executions/stats): `now` = the not-terminated runs, any age; a range adds every run started in it. */
export type StatsRange = 'now' | '1h' | '24h' | '7d' | '30d';
export const STATS_RANGES: StatsRange[] = ['now', '1h', '24h', '7d', '30d'];

export interface StatusCounts {
  running: number;
  waiting: number;
  stopping: number;
  stopped: number;
  failed: number;
  completed: number;
  destroyed: number;
}

/** Per agent: the status counts plus the executions in view with failure_conditions > 0 and with errors > 0. */
export interface AgentStatusCounts extends StatusCounts {
  failure_conditions: number;
  /** Executions in view with errors > 0 (an unhandled action): what makes the agent red besides failed. */
  errors: number;
}

export interface ExecutionStats {
  range: StatsRange;
  from: string | null;
  statuses: StatusCounts;
  /** Executions in view with errors > 0 (an unhandled action), whatever their status. */
  with_errors?: number;
  agents: { [agentId: string]: AgentStatusCounts };
}

/** One agent of GET /executions/graph: what the graph draws for it. */
export interface GraphAgentData {
  /** agent_name on its newest run in view (deleted agents keep a name); null when the run has none. */
  name: string | null;
  counts: AgentStatusCounts;
  /** At most 12 rows, in chip priority order (failed, with errors, stopping, running, waiting, stopped, completed, destroyed; newest first). */
  drawn: ExecutionRow[];
  /** In view but not drawn, by status; only statuses with n > 0. */
  hidden: Partial<StatusCounts>;
}

/** GET /executions/graph?range=&test=: the stats of the view plus, per agent, what to draw. One call per refresh. */
export interface ExecutionGraph {
  range: StatsRange;
  from: string | null;
  statuses: StatusCounts;
  with_errors: number;
  agents: { [agentId: string]: GraphAgentData };
}

/** GET /executions/graph: the view (range) and the list's filters on top of it. */
export interface GraphParams extends ViewFilters {
  range: StatsRange;
}

export interface StatsParams {
  range: StatsRange;
  agent_id?: string;
  /** 'all' (the API default): real and test runs; true: test runs only; false: real runs only */
  test?: boolean | 'all';
}

/** Why a value is not returned under a grant (tiledesk-executions stateValues.ts). */
export type ValueState = 'secret' | 'too_large' | 'not_stored' | 'expired' | 'unreadable';

export const VALUE_STATES: ValueState[] = ['secret', 'too_large', 'not_stored', 'expired', 'unreadable'];

/** A value read behind a grant: the JSON value, or why there is none. */
export interface ValueOrState {
  value?: any;
  value_state?: ValueState;
}

export interface VarSide {
  type: string | null;
  size: number | null;
  hash: string | null;
  /** only in a state view read with a grant covering the block */
  value?: any;
  value_state?: ValueState;
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
  /** only when read with a grant */
  grant?: { expires_at: string };
  actions?: any[];
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
  /** only in steps a grant covers */
  before_value?: any;
  after_value?: any;
  before_state?: ValueState;
  after_state?: ValueState;
}

/** What a data access grant opens: the whole execution (blocks and trigger input) or one block. */
export type GrantScope = { type: 'execution' } | { type: 'step'; step_seq: number };

/** POST data-access answer: valid until expires_at (15 min), closed earlier by revoke. */
export interface GrantInfo {
  grant_id: string;
  /** server clock: shown for reference, the countdown runs on ttl_s */
  expires_at: string;
  scope: GrantScope;
  /** whole seconds left when the service answered (absent from older services) */
  ttl_s?: number;
  /** client only, not from the API: Date.now() when the answer arrived (ttl_s counts from here) */
  received_at?: number;
}

const DAY_MS = 86400000;

/**
 * Days the execution's sealed data is kept: data_until minus started_at (the service dates both from the start),
 * or null when they are missing or do not span a whole number of days (data set to 0, shortened to "now").
 */
export function dataRetentionDays(execution: Pick<Execution, 'started_at' | 'retention'> | null): number | null {
  const start = execution && execution.started_at ? Date.parse(execution.started_at) : NaN;
  const until = execution && execution.retention && execution.retention.data_until ? Date.parse(execution.retention.data_until) : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(until)) return null;
  const days = (until - start) / DAY_MS;
  const n = Math.round(days);
  if (n < 1 || Math.abs(days - n) * DAY_MS > 60000) return null;
  return n;
}

/** Who may see execution traces: owner/admin/supervisor yes, agent no, custom roles need executions_read. */
export function canViewExecutions(role: string, matchedPermissions: string[] | undefined): boolean {
  if (role === 'owner' || role === 'admin' || role === 'supervisor') return true;
  if (role === 'agent') return false;
  return !!matchedPermissions && matchedPermissions.includes(PERMISSIONS.EXECUTIONS_READ);
}

/** Who may open execution data (spec §5): owner and admin; custom roles need executions_data_access. */
export function canViewExecutionData(role: string, perms: string[] | undefined): boolean {
  if (role === 'owner' || role === 'admin') return true;
  if (role === 'supervisor' || role === 'agent') return false;
  return !!perms && perms.includes(PERMISSIONS.EXECUTIONS_DATA_ACCESS);
}

/** One row of GET .../executions/:id/audit (newest first). Never holds a value. */
export interface AuditView {
  audit_id: string;
  at: string;
  actor: { name: string; role: string };
  action: string;
  reason: string | null;
  details: {
    result?: string;
    scope?: { type: 'execution' } | { type: 'step'; step_seq: number };
    step_seq?: number;
    grant_id?: string;
    role?: string;
    key?: string;
    purpose?: string;
    mode?: string;
    of_audit_id?: string;
    [k: string]: any;
  };
}

export interface AuditPage {
  entries: AuditView[];
  next_cursor: string | null;
}

/**
 * GET/PUT /projects/:pid/settings/stop-notice: the notice the chatbot sends once in the conversation when a user writes
 * while the agent's execution is stopped. `text` null: the chatbot's default (`default_text`, by the conversation's
 * language). `can_edit` is false without executions_control.
 */
export interface StopNoticeSettings {
  enabled: boolean;
  text: string | null;
  default_text: { en: string; it: string };
  can_edit: boolean;
}

/** PUT body; `text` is trimmed by the service, empty → null, at most STOP_NOTICE_MAX characters. */
export interface StopNoticeBody {
  enabled: boolean;
  text: string | null;
}

export const STOP_NOTICE_MAX = 500;

/** GET/PUT /projects/:pid/settings/retention. `can_edit` is false without executions_audit_read. */
export interface RetentionSettings {
  trace_days: number;
  data_days: number;
  defaults: { trace_days: number; data_days: number };
  test_days: number;
  audit_days: number;
  can_edit: boolean;
}
