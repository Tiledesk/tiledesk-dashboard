import { ActivitiesNewComponent } from './activities-new.component';
import { renderActivity } from './utils/activity-message.util';
import { executionLink } from '../bots/executions/execution-links';

const EXEC = '0a1b2c3d-1111-4222-8333-444455556666';
const AGENT = '65f000000000000000000001';

function retention(before: any, after: any): any {
  return {
    verb: 'EXECUTION_RETENTION_UPDATE',
    actor: { type: 'user', id: 'u1', name: 'Anna Rossi' },
    target: { type: 'project', id: '65f0000000000000000000aa', object: {} },
    actionObj: { retention: { before, after } },
  };
}

function activity(verb: string, extra: any = {}): any {
  return {
    verb,
    actor: { type: 'user', id: 'u1', name: 'Anna Rossi' },
    target: { type: 'execution', id: EXEC, object: { agent_id: AGENT, agent_name: 'Support Bot', request_id: 'r1' } },
    related: { role: 'agent', type: 'faq_kb', id: AGENT, name: 'Support Bot' },
    actionObj: { result: 'ok', audit_id: 'a1', ...extra },
  };
}

describe('Activities - Executions audit rows', () => {
  it('EXECUTION_STOP_HARD renders "<actor> paused execution <id> of <agent> now" (stop is shown as pause)', () => {
    expect(renderActivity(activity('EXECUTION_STOP_HARD'))).toBe('Anna Rossi paused execution 556666 of Support Bot now');
  });

  it('EXECUTION_STOP_SOFT and EXECUTION_DESTROY render like the server, with the reason appended', () => {
    expect(renderActivity(activity('EXECUTION_STOP_SOFT'))).toBe('Anna Rossi paused execution 556666 of Support Bot after the current action');
    expect(renderActivity(activity('EXECUTION_DESTROY', { reason: 'stuck' })))
      .toBe('Anna Rossi destroyed execution 556666 of Support Bot · "stuck"');
  });

  it('a rejected control reads as an attempt with the refusal, like the server sentence', () => {
    expect(renderActivity(activity('EXECUTION_STOP_HARD', { result: 'rejected:stopped' })))
      .toBe('Anna Rossi tried to pause execution 556666 of Support Bot now (rejected: paused)');
    expect(renderActivity(activity('EXECUTION_STOP_SOFT', { result: 'rejected:completed' })))
      .toBe('Anna Rossi tried to pause execution 556666 of Support Bot after the current action (rejected: completed)');
    expect(renderActivity(activity('EXECUTION_DESTROY', { result: 'rejected:destroyed', reason: 'again' })))
      .toBe('Anna Rossi tried to destroy execution 556666 of Support Bot (rejected: destroyed) · "again"');
    expect(renderActivity(activity('EXECUTION_DESTROY', { result: 'rejected:stopping' })))
      .toBe('Anna Rossi tried to destroy execution 556666 of Support Bot (rejected: pausing)');
    expect(renderActivity(activity('EXECUTION_DESTROY', { result: 'rejected' })))
      .toBe('Anna Rossi tried to destroy execution 556666 of Support Bot (rejected)');
    expect(renderActivity(activity('EXECUTION_STOP_HARD', { result: 'accepted' })))
      .toBe('Anna Rossi paused execution 556666 of Support Bot now');

    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.projectId = 'pid';
    c.activityMessage = (a: any) => renderActivity(a);
    const parts = c.getActivityParts(activity('EXECUTION_STOP_HARD', { result: 'rejected:stopped', reason: 'x' }));
    expect(parts.before).toBe(' tried to pause execution ');
    expect(parts.executionLinkLabel).toBe('556666');
    expect(parts.after).toBe(' of Support Bot now (rejected: paused) · "x"');
  });

  it('a start new refire failure renders as an attempt with the code', () => {
    expect(renderActivity(activity('EXECUTION_START_NEW', { result: 'rejected:refire_failed' })))
      .toBe('Anna Rossi tried to start a new run of execution 556666 of Support Bot (rejected: refire_failed)');
    expect(renderActivity(activity('EXECUTION_START_NEW', { result: 'rejected:not_startable:webhook_not_found' })))
      .toBe('Anna Rossi tried to start a new run of execution 556666 of Support Bot (rejected: not_startable:webhook_not_found)');
    // the refire got no answer: the run may have started, so it reads as started (same sentence as the server's)
    expect(renderActivity(activity('EXECUTION_START_NEW', { result: 'rejected:refire_unconfirmed' })))
      .toBe('Anna Rossi started a new run of execution 556666 of Support Bot (unconfirmed)');
    expect(renderActivity(activity('EXECUTION_START_NEW', { result: 'rejected:refire_unconfirmed', reason: 'retry' })))
      .toBe('Anna Rossi started a new run of execution 556666 of Support Bot (unconfirmed) · "retry"');
    expect(renderActivity(activity('EXECUTION_RESUME', { result: 'rejected:refire_unconfirmed' })))
      .toBe('Anna Rossi tried to resume execution 556666 of Support Bot (rejected: refire_unconfirmed)');
  });

  it('EXECUTION_RESUME and EXECUTION_START_NEW render the server sentences (done and tried)', () => {
    expect(renderActivity(activity('EXECUTION_RESUME'))).toBe('Anna Rossi resumed execution 556666 of Support Bot');
    expect(renderActivity(activity('EXECUTION_START_NEW', { reason: 'retry' })))
      .toBe('Anna Rossi started a new run of execution 556666 of Support Bot · "retry"');
    expect(renderActivity(activity('EXECUTION_RESUME', { result: 'rejected:newer_execution' })))
      .toBe('Anna Rossi tried to resume execution 556666 of Support Bot (rejected: newer_execution)');
    expect(renderActivity(activity('EXECUTION_START_NEW', { result: 'rejected:already_started' })))
      .toBe('Anna Rossi tried to start a new run of execution 556666 of Support Bot (rejected: already_started)');
    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.projectId = 'pid';
    c.activityMessage = (a: any) => renderActivity(a);
    const parts = c.getActivityParts(activity('EXECUTION_START_NEW'));
    expect(parts.before).toBe(' started a new run of execution ');
    expect(parts.executionLinkLabel).toBe('556666');
    expect(c.executionRouterLink(activity('EXECUTION_RESUME'))).toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
  });

  it('execution link targets bots/<agent>/executions/<id>', () => {
    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.projectId = 'pid';
    c.activityMessage = (a: any) => renderActivity(a);
    const parts = c.getActivityParts(activity('EXECUTION_STOP_HARD', { reason: 'x' }));
    expect(parts.executionLinkLabel).toBe('556666');
    expect(parts.actorLink).toBe('Anna Rossi');
    expect(parts.before).toBe(' paused execution ');
    expect(parts.after).toBe(' of Support Bot now · "x"');
    expect(c.executionRouterLink(activity('EXECUTION_STOP_HARD')))
      .toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
    expect(executionLink('pid', AGENT, EXEC)!.commands).toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
  });

  describe('data access and retention verbs', () => {
    function parts(a: any) {
      const c: any = Object.create(ActivitiesNewComponent.prototype);
      c.projectId = 'pid';
      c.activityMessage = (x: any) => renderActivity(x);
      return { c, parts: c.getActivityParts(a) };
    }

    it('three new verbs render the server sentences', () => {
      expect(renderActivity(activity('EXECUTION_DATA_ACCESS', { reason: 'ticket 42', scope: { type: 'step', step_seq: 3 } })))
        .toBe('Anna Rossi viewed the data of execution 556666 of Support Bot · "ticket 42" · 1 block');
      expect(renderActivity(activity('EXECUTION_DATA_ACCESS', { scope: { type: 'execution' } })))
        .toBe('Anna Rossi viewed the data of execution 556666 of Support Bot · whole execution');
      expect(renderActivity(activity('EXECUTION_DATA_ACCESS_DENIED', { role: 'supervisor', reason: 'x' })))
        .toBe('Anna Rossi was denied access to the data of execution 556666 of Support Bot (role supervisor)');
      expect(renderActivity(activity('EXECUTION_DATA_ACCESS_DENIED', { result: 'rejected:forbidden', role: 'agent' })))
        .toBe('Anna Rossi was denied access to the data of execution 556666 of Support Bot (role agent)');
      expect(renderActivity(retention({ trace_days: 90, data_days: 30 }, { trace_days: 30, data_days: 30 })))
        .toBe('Anna Rossi changed executions retention: trace 90 → 30 days');
      expect(renderActivity(retention({ trace_days: 90, data_days: 30 }, { trace_days: 60, data_days: 7 })))
        .toBe('Anna Rossi changed executions retention: trace 90 → 60 days, data 30 → 7 days');
    });

    it('data access rows link to the execution', () => {
      const { c, parts: p } = parts(activity('EXECUTION_DATA_ACCESS', { scope: { type: 'execution' } }));
      expect(p.executionLinkLabel).toBe('556666');
      expect(p.before).toBe(' viewed the data of execution ');
      expect(p.after).toBe(' of Support Bot · whole execution');
      expect(c.executionRouterLink(activity('EXECUTION_DATA_ACCESS'))).toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
    });

    it('a retention row renders without an execution link', () => {
      const a = retention({ trace_days: 90, data_days: 30 }, { trace_days: 30, data_days: 30 });
      const { c, parts: p } = parts(a);
      expect(p.executionLinkLabel).toBeNull();
      expect(c.executionRouterLink(a)).toBeNull();
      expect(p.before).toBe(' changed executions retention');
      expect(p.after).toBe(': trace 90 → 30 days');
    });
  });

  describe('Executions group', () => {
    function build(role: string, matched: string[]) {
      const c: any = Object.create(ActivitiesNewComponent.prototype);
      c.translate = { instant: (k: string) => k };
      c.applyExecutionsAuditPermission({ role, matchedPermissions: matched });
      c.buildActivityFilterOptions();
      return c.activityFilterOptions.map((o: any) => o.id);
    }

    it('Executions group hidden for admin, shown for owner', () => {
      expect(build('admin', [])).not.toContain('EXECUTION_STOP_SOFT');
      expect(build('admin', [])).not.toContain('EXECUTION_RESUME');
      expect(build('owner', [])).toEqual(jasmine.arrayContaining(['EXECUTION_STOP_SOFT', 'EXECUTION_STOP_HARD', 'EXECUTION_DESTROY', 'EXECUTION_RESUME', 'EXECUTION_START_NEW', 'EXECUTION_DATA_ACCESS', 'EXECUTION_DATA_ACCESS_DENIED', 'EXECUTION_RETENTION_UPDATE']));
    });

    it('is shown to a custom role only with executions_audit_read', () => {
      expect(build('custom', ['activities_read'])).not.toContain('EXECUTION_DESTROY');
      expect(build('custom', ['executions_audit_read'])).toContain('EXECUTION_DESTROY');
      expect(build('agent', [])).not.toContain('EXECUTION_DESTROY');
    });
  });
});
