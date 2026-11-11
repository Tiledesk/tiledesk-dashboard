import { ActivitiesNewComponent } from './activities-new.component';
import { renderActivity } from './utils/activity-message.util';
import { executionLink } from '../bots/executions/execution-links';

const EXEC = '0a1b2c3d-1111-4222-8333-444455556666';
const AGENT = '65f000000000000000000001';

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
  it('EXECUTION_STOP_HARD renders "<actor> hard-stopped execution <id> of <agent>"', () => {
    expect(renderActivity(activity('EXECUTION_STOP_HARD'))).toBe('Anna Rossi hard-stopped execution 0a1b2c of Support Bot');
  });

  it('EXECUTION_STOP_SOFT and EXECUTION_DESTROY render like the server, with the reason appended', () => {
    expect(renderActivity(activity('EXECUTION_STOP_SOFT'))).toBe('Anna Rossi soft-stopped execution 0a1b2c of Support Bot');
    expect(renderActivity(activity('EXECUTION_DESTROY', { reason: 'stuck' })))
      .toBe('Anna Rossi destroyed execution 0a1b2c of Support Bot · "stuck"');
  });

  it('a rejected control reads as an attempt with the refusal, like the server sentence', () => {
    expect(renderActivity(activity('EXECUTION_STOP_HARD', { result: 'rejected:stopped' })))
      .toBe('Anna Rossi tried to hard-stop execution 0a1b2c of Support Bot (rejected: stopped)');
    expect(renderActivity(activity('EXECUTION_STOP_SOFT', { result: 'rejected:completed' })))
      .toBe('Anna Rossi tried to soft-stop execution 0a1b2c of Support Bot (rejected: completed)');
    expect(renderActivity(activity('EXECUTION_DESTROY', { result: 'rejected:destroyed', reason: 'again' })))
      .toBe('Anna Rossi tried to destroy execution 0a1b2c of Support Bot (rejected: destroyed) · "again"');
    expect(renderActivity(activity('EXECUTION_DESTROY', { result: 'rejected' })))
      .toBe('Anna Rossi tried to destroy execution 0a1b2c of Support Bot (rejected)');
    expect(renderActivity(activity('EXECUTION_STOP_HARD', { result: 'accepted' })))
      .toBe('Anna Rossi hard-stopped execution 0a1b2c of Support Bot');

    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.projectId = 'pid';
    c.activityMessage = (a: any) => renderActivity(a);
    const parts = c.getActivityParts(activity('EXECUTION_STOP_HARD', { result: 'rejected:stopped', reason: 'x' }));
    expect(parts.before).toBe(' tried to hard-stop execution ');
    expect(parts.executionLinkLabel).toBe('0a1b2c');
    expect(parts.after).toBe(' of Support Bot (rejected: stopped) · "x"');
  });

  it('EXECUTION_RESUME and EXECUTION_START_NEW render the server sentences (done and tried)', () => {
    expect(renderActivity(activity('EXECUTION_RESUME'))).toBe('Anna Rossi resumed execution 0a1b2c of Support Bot');
    expect(renderActivity(activity('EXECUTION_START_NEW', { reason: 'retry' })))
      .toBe('Anna Rossi started a new run of execution 0a1b2c of Support Bot · "retry"');
    expect(renderActivity(activity('EXECUTION_RESUME', { result: 'rejected:newer_execution' })))
      .toBe('Anna Rossi tried to resume execution 0a1b2c of Support Bot (rejected: newer_execution)');
    expect(renderActivity(activity('EXECUTION_START_NEW', { result: 'rejected:already_started' })))
      .toBe('Anna Rossi tried to start a new run of execution 0a1b2c of Support Bot (rejected: already_started)');
    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.projectId = 'pid';
    c.activityMessage = (a: any) => renderActivity(a);
    const parts = c.getActivityParts(activity('EXECUTION_START_NEW'));
    expect(parts.before).toBe(' started a new run of execution ');
    expect(parts.executionLinkLabel).toBe('0a1b2c');
    expect(c.executionRouterLink(activity('EXECUTION_RESUME'))).toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
  });

  it('execution link targets bots/<agent>/executions/<id>', () => {
    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.projectId = 'pid';
    c.activityMessage = (a: any) => renderActivity(a);
    const parts = c.getActivityParts(activity('EXECUTION_STOP_HARD', { reason: 'x' }));
    expect(parts.executionLinkLabel).toBe('0a1b2c');
    expect(parts.actorLink).toBe('Anna Rossi');
    expect(parts.before).toBe(' hard-stopped execution ');
    expect(parts.after).toBe(' of Support Bot · "x"');
    expect(c.executionRouterLink(activity('EXECUTION_STOP_HARD')))
      .toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
    expect(executionLink('pid', AGENT, EXEC)!.commands).toEqual(['/project', 'pid', 'monitor', AGENT, 'executions', EXEC]);
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
      expect(build('owner', [])).toEqual(jasmine.arrayContaining(['EXECUTION_STOP_SOFT', 'EXECUTION_STOP_HARD', 'EXECUTION_DESTROY', 'EXECUTION_RESUME', 'EXECUTION_START_NEW']));
    });

    it('is shown to a custom role only with executions_audit_read', () => {
      expect(build('custom', ['activities_read'])).not.toContain('EXECUTION_DESTROY');
      expect(build('custom', ['executions_audit_read'])).toContain('EXECUTION_DESTROY');
      expect(build('agent', [])).not.toContain('EXECUTION_DESTROY');
    });
  });
});
