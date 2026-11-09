import { executionAgentId, executionLink, validExecutionId } from './execution-links';
import { WsRequestsMsgsComponent } from 'app/ws_requests/ws-requests-msgs/ws-requests-msgs.component';
import { FlowWebhooksLogsComponent } from 'app/bots/flow-webhooks-logs/flow-webhooks-logs.component';

const EID = '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b';

describe('execution links', () => {
  it('validates the execution id shape', () => {
    expect(validExecutionId(EID)).toBe(EID);
    expect(validExecutionId('../../x')).toBeNull();
    expect(validExecutionId('abc')).toBeNull();
    expect(validExecutionId(undefined)).toBeNull();
    expect(validExecutionId(42)).toBeNull();
  });

  it('links to the agent detail, or to the list filtered by id when the agent is unknown', () => {
    expect(executionLink('p1', 'a1', EID).commands).toEqual(['/project', 'p1', 'bots', 'a1', 'executions', EID]);
    const fallback = executionLink('p1', null, EID);
    expect(fallback.commands).toEqual(['/project', 'p1', 'bots', 'executions']);
    expect(fallback.queryParams).toEqual({ q: EID });
    expect(executionLink('p1', 'a1', 'nope')).toBeNull();
  });

  it('agent id is the root id, else the bot id, else null', () => {
    expect(executionAgentId({ _id: 's', root_id: 'r' })).toBe('r');
    expect(executionAgentId({ _id: 's' })).toBe('s');
    expect(executionAgentId(null)).toBeNull();
  });
});

describe('conversation detail: link shown only with execution_id and permission', () => {
  function make(opts: { perm: boolean; configured?: boolean; attrs?: any; participants?: string[]; bot?: any }) {
    const c: any = Object.create(WsRequestsMsgsComponent.prototype);
    c.PERMISSION_TO_VIEW_EXECUTIONS = opts.perm;
    c.executionsService = { isConfigured: () => opts.configured !== false };
    c.botLocalDbService = { getBotFromStorage: () => opts.bot };
    c.id_project = 'p1';
    c.request = { participants: opts.participants || ['bot_s1'], attributes: opts.attrs === undefined ? { execution_id: EID } : opts.attrs };
    return c as WsRequestsMsgsComponent;
  }

  it('is shown with execution_id and permission, using the root id of the bot participant', () => {
    const c = make({ perm: true, bot: { _id: 's1', root_id: 'r1' } });
    expect(c.executionLink.commands).toEqual(['/project', 'p1', 'bots', 'r1', 'executions', EID]);
  });
  it('falls back to the list with q when the bot is unknown', () => {
    const c = make({ perm: true, bot: null });
    expect(c.executionLink.commands).toEqual(['/project', 'p1', 'bots', 'executions']);
    expect(c.executionLink.queryParams).toEqual({ q: EID });
  });
  it('is hidden without permission, when not configured, without execution_id or with a bad one', () => {
    expect(make({ perm: false }).executionLink).toBeNull();
    expect(make({ perm: true, configured: false }).executionLink).toBeNull();
    expect(make({ perm: true, attrs: {} }).executionLink).toBeNull();
    expect(make({ perm: true, attrs: { execution_id: 'javascript:alert(1)' } }).executionLink).toBeNull();
  });
});

describe('webhook logs: link target', () => {
  function make(perm: boolean, bots: any[], configured = true) {
    const c: any = Object.create(FlowWebhooksLogsComponent.prototype);
    c.PERMISSION_TO_VIEW_EXECUTIONS = perm;
    c.executionsService = { isConfigured: () => configured };
    c.projectId = 'p1';
    c.currentWH = { chatbot_id: 'b1' };
    c.allBots = bots;
    return c as FlowWebhooksLogsComponent;
  }
  it('points at the bot executions, with the root id when known', () => {
    expect(make(true, [{ _id: 'b1', root_id: 'r1' }]).executionsLink).toEqual(['/project', 'p1', 'bots', 'r1', 'executions']);
    expect(make(true, []).executionsLink).toEqual(['/project', 'p1', 'bots', 'b1', 'executions']);
  });
  it('is hidden without permission or when not configured', () => {
    expect(make(false, []).executionsLink).toBeNull();
    expect(make(true, [], false).executionsLink).toBeNull();
  });
});
