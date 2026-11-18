import { configuredUrl, isV3Chatbot } from './util';

/**
 * "Clone to V3" in the agents list (27/10/2026).
 *
 * The server migrates a V2 agent to V3 only from the agent itself (`POST /:projectid/faq_kb/:id/migrate-v3`):
 * it clones it, with its sub agents, as a NEW agent "<name> (V3)" and leaves the V2 agent untouched.
 * With `?dryRun=true` it writes nothing and answers only the report, which the dashboard shows
 * before asking for confirmation. 422 when the migration does not pass its checks: the report says why.
 * Import and export never convert: this is the only way from V2 to V3.
 */

/** How many warnings the confirmation lists before "and N more". */
export const MIGRATION_WARNINGS_SHOWN = 8;

/**
 * An agent saved before the version label became a field can still carry it in
 * `attributes.dsVersion`: the server reads it as V3 and refuses the migration ("already-v3"),
 * so the list must not offer it. Only for this menu: the editor keeps choosing by `ds_version`.
 */
export function hasLegacyV3Label(chatbot: any): boolean {
  const version = chatbot?.attributes?.dsVersion;
  return typeof version === 'string' && version.trim().toLowerCase() === 'v3';
}

/**
 * Whether the list offers "Clone to V3" for an agent: a flow of the Design Studio (tilebot) that is
 * not V3 yet (neither in the field nor in the old attribute), not a sub agent (it moves with the
 * agent that owns it) and not a published copy; and only when the Design Studio V3 is configured,
 * otherwise the new agent could not be opened.
 */
export function canMigrateToV3(chatbot: any, config: any): boolean {
  if (!chatbot || !configuredUrl(config?.cdsV3BaseUrl)) {
    return false;
  }
  return chatbot.type === 'tilebot'
    && !isV3Chatbot(chatbot)
    && !hasLegacyV3Label(chatbot)
    && chatbot.subtype !== 'subagent'
    && !chatbot.root_id;
}

/** Error codes of the migration report that the dialog explains with a sentence of its own. */
export const MIGRATION_ERROR_KEYS: { [code: string]: string } = {
  'already-v3': 'MigrateToV3.ErrorAlreadyV3',
  'not-an-agent-export': 'MigrateToV3.ErrorNotAnAgent'
};

/**
 * The reason of a refused migration, from the HTTP error: `key` is a translation key for a known
 * error code (or for failed checks, then `details` lists them); otherwise `details` carries the
 * server's message. Both empty when the answer says nothing (network error).
 */
export function migrationErrorReason(httpError: any): { key: string | null, details: string[] } {
  let body = httpError?.error;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = { msg: body }; }
  }
  const summary = summarizeMigrationReport(body?.report);
  const code = body?.report?.error;
  if (code && MIGRATION_ERROR_KEYS[code]) {
    return { key: MIGRATION_ERROR_KEYS[code], details: [] };
  }
  if (summary.failures.length > 0) {
    return { key: 'MigrateToV3.ErrorChecks', details: summary.failures };
  }
  const message = body?.msg || body?.message;
  return { key: null, details: message ? [String(message)] : [] };
}

export interface MigrationWarning {
  agent: string;
  block: string;
  message: string;
}

export interface MigrationSummary {
  ok: boolean;
  blocksBefore: number;
  blocksAfter: number;
  subagents: number;
  warnings: MigrationWarning[];
  /** Why the migration is refused: the failed checks, or the error code of the server. */
  failures: string[];
}

/** What the dashboard shows of a migration report (`report` of the dry run, or of a 422). */
export function summarizeMigrationReport(report: any): MigrationSummary {
  const agents: any[] = Array.isArray(report?.agents) ? report.agents : [];
  const summary: MigrationSummary = {
    ok: report?.ok === true,
    blocksBefore: 0,
    blocksAfter: 0,
    subagents: Math.max(agents.length - 1, 0),
    warnings: [],
    failures: []
  };
  if (report?.error) {
    summary.failures.push(String(report.error));
  }
  for (const agent of agents) {
    summary.blocksBefore += Number(agent?.blocksBefore) || 0;
    summary.blocksAfter += Number(agent?.blocksAfter) || 0;
    for (const item of Array.isArray(agent?.items) ? agent.items : []) {
      if (item?.severity === 'warning') {
        summary.warnings.push({ agent: agent.agent || '', block: item.intentName || '', message: item.message || item.code || '' });
      }
    }
    for (const invariant of Array.isArray(agent?.invariants) ? agent.invariants : []) {
      if (invariant && invariant.ok === false) {
        summary.failures.push((agent.agent ? agent.agent + ': ' : '') + invariant.name + (invariant.detail ? ' (' + invariant.detail + ')' : ''));
      }
    }
  }
  return summary;
}

/** Text from the server or from an agent goes into the dialog's HTML: never as markup. */
export function escapeHtml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** The list of warnings for the confirmation dialog, escaped, at most `MIGRATION_WARNINGS_SHOWN` rows. */
export function migrationWarningsHtml(warnings: MigrationWarning[], moreLabel: string): string {
  if (!warnings || warnings.length === 0) {
    return '';
  }
  const rows = warnings.slice(0, MIGRATION_WARNINGS_SHOWN).map((warning) => {
    const where = [warning.agent, warning.block].filter(Boolean).map(escapeHtml).join(' › ');
    return '<li>' + (where ? '<b>' + where + '</b>: ' : '') + escapeHtml(warning.message) + '</li>';
  });
  const more = warnings.length - MIGRATION_WARNINGS_SHOWN;
  if (more > 0) {
    rows.push('<li>' + escapeHtml(moreLabel.replace('{{count}}', String(more))) + '</li>');
  }
  return '<ul class="migrate-v3-warnings">' + rows.join('') + '</ul>';
}
