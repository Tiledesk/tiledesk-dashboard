import {
  MIGRATION_WARNINGS_SHOWN, canMigrateToV3, escapeHtml, migrationErrorReason, migrationWarningsHtml, summarizeMigrationReport
} from './migrate-to-v3.util';

describe('migrate-to-v3.util ("Clone to V3" in the agents list)', () => {
  const config = { cdsBaseUrl: 'https://cds/', cdsV3BaseUrl: 'https://cds-v3/' };
  const v2 = (extra: any = {}) => ({ _id: 'b1', name: 'Payments', type: 'tilebot', ...extra });

  it('offers the clone only for a V2 flow of the Design Studio', () => {
    expect(canMigrateToV3(v2(), config)).toBe(true);
    expect(canMigrateToV3(v2({ subtype: 'webhook' }), config)).toBe(true);
    expect(canMigrateToV3(v2({ ds_version: 'v3' }), config)).toBe(false);
    expect(canMigrateToV3(v2({ ds_version: ' V3 ' }), config)).toBe(false);
    expect(canMigrateToV3(v2({ subtype: 'subagent' }), config)).toBe(false);
    expect(canMigrateToV3(v2({ root_id: 'draft1' }), config)).toBe(false);
    expect(canMigrateToV3(v2({ type: 'internal' }), config)).toBe(false);
    expect(canMigrateToV3(null, config)).toBe(false);
  });

  it('does not offer it for a V3 agent whose label is still in attributes.dsVersion', () => {
    expect(canMigrateToV3(v2({ attributes: { dsVersion: 'v3' } }), config)).toBe(false);
    expect(canMigrateToV3(v2({ attributes: { dsVersion: ' V3 ' } }), config)).toBe(false);
    expect(canMigrateToV3(v2({ attributes: { dsVersion: 'v2' } }), config)).toBe(true);
    expect(canMigrateToV3(v2({ attributes: {} }), config)).toBe(true);
  });

  it('explains the refusal: known code, failed checks, or the server message', () => {
    // the answer of stage on 27/10/2026 for an agent labelled V3 the old way
    const alreadyV3 = { status: 422, error: { success: false, msg: 'The agent cannot be migrated to V3', report: { ok: false, version: 1, error: 'already-v3', agents: [] } } };
    expect(migrationErrorReason(alreadyV3)).toEqual({ key: 'MigrateToV3.ErrorAlreadyV3', details: [] });
    const checks = { status: 422, error: { report: { ok: false, agents: [{ agent: 'A', items: [], invariants: [{ name: 'I5 one action per block', ok: false }] }] } } };
    expect(migrationErrorReason(checks)).toEqual({ key: 'MigrateToV3.ErrorChecks', details: ['A: I5 one action per block'] });
    expect(migrationErrorReason({ status: 400, error: { success: false, msg: 'A sub agent is migrated with the agent that owns it' } }))
      .toEqual({ key: null, details: ['A sub agent is migrated with the agent that owns it'] });
    expect(migrationErrorReason({ status: 422, error: JSON.stringify(alreadyV3.error) }).key).toBe('MigrateToV3.ErrorAlreadyV3');
    expect(migrationErrorReason({ status: 0, error: null })).toEqual({ key: null, details: [] });
  });

  it('does not offer it when the Design Studio V3 is not configured', () => {
    expect(canMigrateToV3(v2(), { cdsBaseUrl: 'https://cds/' })).toBe(false);
    expect(canMigrateToV3(v2(), { cdsV3BaseUrl: '${CDS_V3_URL}' })).toBe(false);
    expect(canMigrateToV3(v2(), { cdsV3BaseUrl: '  ' })).toBe(false);
    expect(canMigrateToV3(v2(), null)).toBe(false);
  });

  it('sums the blocks of the agent and its sub agents and keeps only the warnings', () => {
    const summary = summarizeMigrationReport({
      ok: true,
      agents: [
        { agent: 'Payments', ok: true, blocksBefore: 4, blocksAfter: 7, invariants: [{ name: 'I5 one action per block', ok: true }],
          items: [
            { severity: 'info', code: 'block-split', message: 'Block split', intentName: 'welcome' },
            { severity: 'warning', code: 'close-not-last', message: 'Close followed by other actions', intentName: 'bye' }
          ] },
        { agent: 'Helper', ok: true, blocksBefore: 2, blocksAfter: 3, invariants: [],
          items: [{ severity: 'warning', code: 'inactive-action', message: 'Action "gpt_task" is no longer offered in V3' }] }
      ]
    });
    expect(summary).toEqual({
      ok: true, blocksBefore: 6, blocksAfter: 10, subagents: 1, failures: [],
      warnings: [
        { agent: 'Payments', block: 'bye', message: 'Close followed by other actions' },
        { agent: 'Helper', block: '', message: 'Action "gpt_task" is no longer offered in V3' }
      ]
    });
  });

  it('says why a migration is refused: the server error or the failed checks', () => {
    expect(summarizeMigrationReport({ ok: false, error: 'already-v3', agents: [] }).failures).toEqual(['already-v3']);
    const refused = summarizeMigrationReport({ ok: false, agents: [
      { agent: 'Payments', ok: false, blocksBefore: 4, blocksAfter: 7, items: [],
        invariants: [{ name: 'I1-I2 same actions', ok: true }, { name: 'I3 same action exits', ok: false, detail: '1 exit changed' }] }
    ] });
    expect(refused.ok).toBe(false);
    expect(refused.failures).toEqual(['Payments: I3 same action exits (1 exit changed)']);
    expect(summarizeMigrationReport(undefined)).toEqual({ ok: false, blocksBefore: 0, blocksAfter: 0, subagents: 0, warnings: [], failures: [] });
  });

  it('escapes names and messages before they reach the dialog', () => {
    expect(escapeHtml('<img src=x onerror="a()">&\'')).toBe('&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;');
    const html = migrationWarningsHtml([{ agent: '<b>A</b>', block: 'x', message: '<script>' }], '');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;b&gt;A&lt;/b&gt; › x');
  });

  it('lists at most the first warnings and says how many are left', () => {
    const warnings = Array.from({ length: MIGRATION_WARNINGS_SHOWN + 3 }, (_, i) => ({ agent: 'A', block: 'b' + i, message: 'm' + i }));
    const html = migrationWarningsHtml(warnings, 'and {{count}} more');
    expect((html.match(/<li>/g) || []).length).toBe(MIGRATION_WARNINGS_SHOWN + 1);
    expect(html).toContain('and 3 more');
    expect(migrationWarningsHtml([], 'x')).toBe('');
  });
});
