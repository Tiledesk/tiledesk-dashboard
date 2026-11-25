import { agentRunInfo, parseRunPayload, webhooksByAgent } from './agent-run';
import { RunAgentDialogComponent } from './run-agent-dialog.component';

describe('agent-run', () => {
  const live = { enabled: true, schedule: { frequency: 'daily' }, published_bot_id: 'pub1', block_id: 'b1' };

  it('no webhook record: nothing to run', () => {
    expect(agentRunInfo({ _id: 'a' }, undefined)).toEqual({ webhookId: null, schedule: 'none' });
  });

  it('a Webhook agent (or a webhook start point) with an enabled webhook can be run', () => {
    expect(agentRunInfo({ _id: 'a', subtype: 'webhook' }, { webhook_id: 'w1', enabled: true }).webhookId).toBe('w1');
    expect(agentRunInfo({ _id: 'a' }, { webhook_id: 'w1', start_points: [{ type: 'webhook' }] }).webhookId).toBe('w1');
    expect(agentRunInfo({ _id: 'a', subtype: 'webhook' }, { webhook_id: 'w1', enabled: false }).webhookId).toBeNull();
    // a scheduled-only record carries a webhook_id too, but it is no Webhook agent
    expect(agentRunInfo({ _id: 'a' }, { webhook_id: 'w1', start_points: [{ type: 'scheduled' }] }).webhookId).toBeNull();
  });

  it('schedule state comes from the published snapshot', () => {
    const wh = (scheduled_live: any) => ({ webhook_id: 'w', start_points: [{ type: 'scheduled' }], scheduled_live });
    expect(agentRunInfo({}, wh(undefined)).schedule).toBe('unpublished');
    expect(agentRunInfo({}, wh(live)).schedule).toBe('running');
    expect(agentRunInfo({}, wh({ ...live, enabled: false, stopped: true })).schedule).toBe('stopped');
    expect(agentRunInfo({}, wh({ ...live, enabled: false })).schedule).toBe('stopped');
    expect(agentRunInfo({}, wh({ ...live, error: 'down' })).schedule).toBe('error');
    expect(agentRunInfo({}, { webhook_id: 'w', start_points: [] }).schedule).toBe('none');
  });

  it('indexes webhook records by chatbot_id', () => {
    expect(Object.keys(webhooksByAgent([{ chatbot_id: 'a' }, { chatbot_id: 'b' }, {}]))).toEqual(['a', 'b']);
    expect(webhooksByAgent(null as any)).toEqual({});
  });

  it('parses the run payload: empty is {}, else a JSON object', () => {
    expect(parseRunPayload('')).toEqual({ ok: true, payload: {} });
    expect(parseRunPayload('{"a":1}')).toEqual({ ok: true, payload: { a: 1 } });
    expect(parseRunPayload('{a')).toEqual({ ok: false, error: 'invalid_json' });
    expect(parseRunPayload('[1]')).toEqual({ ok: false, error: 'not_object' });
  });

  it('the dialog closes with the payload, and stays open on invalid JSON', () => {
    const ref = { close: jasmine.createSpy('close') };
    const d = new RunAgentDialogComponent(ref as any, { agentName: 'A' });
    d.text = 'nope';
    d.confirm();
    expect(d.error).toBe('invalid_json');
    expect(ref.close).not.toHaveBeenCalled();
    d.text = '{"x":true}';
    d.confirm();
    expect(ref.close).toHaveBeenCalledWith({ x: true });
  });
});
