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
      .toEqual(['/project', 'pid', 'bots', AGENT, 'executions', EXEC]);
    expect(executionLink('pid', AGENT, EXEC)!.commands).toEqual(['/project', 'pid', 'bots', AGENT, 'executions', EXEC]);
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
      expect(build('owner', [])).toEqual(jasmine.arrayContaining(['EXECUTION_STOP_SOFT', 'EXECUTION_STOP_HARD', 'EXECUTION_DESTROY']));
    });

    it('is shown to a custom role only with executions_audit_read', () => {
      expect(build('custom', ['activities_read'])).not.toContain('EXECUTION_DESTROY');
      expect(build('custom', ['executions_audit_read'])).toContain('EXECUTION_DESTROY');
      expect(build('agent', [])).not.toContain('EXECUTION_DESTROY');
    });
  });
});
