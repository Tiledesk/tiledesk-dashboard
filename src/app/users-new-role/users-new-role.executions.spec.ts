import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { PERMISSIONS, PERMISSION_DEPENDENCIES } from 'app/utils/permissions.constants';
import { UsersNewRoleComponent } from './users-new-role.component';

describe('UsersNewRoleComponent executions permissions', () => {
  let component: UsersNewRoleComponent;
  let storedPermissions: string[];
  let configured: boolean;

  const ctrl = (key: string) => component.form.get(key);

  beforeEach(() => {
    storedPermissions = [];
    configured = true;
    const rolesService: any = {
      getRoleById: () => of({ name: 'custom', permissions: storedPermissions }),
    };
    const logger: any = { log: () => {}, error: () => {} };
    const executionsService: any = { isConfigured: () => configured };
    component = new UsersNewRoleComponent(
      {} as any, {} as any, {} as any, logger, {} as any, {} as any,
      new FormBuilder(), rolesService, {} as any, {} as any, {} as any, executionsService
    );
    component.buildForm();
  });

  it('declares the dependency rules', () => {
    expect(PERMISSION_DEPENDENCIES[PERMISSIONS.EXECUTIONS_READ]).toEqual([PERMISSIONS.FLOWS_READ]);
    expect(PERMISSION_DEPENDENCIES[PERMISSIONS.EXECUTIONS_AUDIT_READ]).toContain(PERMISSIONS.ACTIVITIES_READ);
    expect(PERMISSION_DEPENDENCIES[PERMISSIONS.EXECUTIONS_AUDIT_READ]).toContain(PERMISSIONS.FLOWS_READ);
    for (const k of [PERMISSIONS.EXECUTIONS_CONTROL, PERMISSIONS.EXECUTIONS_DESTROY, PERMISSIONS.EXECUTIONS_DATA_ACCESS]) {
      expect(PERMISSION_DEPENDENCIES[k]).toContain(PERMISSIONS.EXECUTIONS_READ);
      expect(PERMISSION_DEPENDENCIES[k]).toContain(PERMISSIONS.FLOWS_READ);
    }
  });

  it('has an Executions section with the five permissions', () => {
    const section = component.sections.find(s => s.title === 'Executions');
    expect(section.children.map(c => c.key)).toEqual([
      'executions_read', 'executions_control', 'executions_destroy', 'executions_data_access', 'executions_audit_read',
    ]);
  });

  it('ticking executions_control ticks and locks executions_read and flows_read', () => {
    ctrl('executions_control').setValue(true);
    expect(ctrl('executions_read').value).toBe(true);
    expect(ctrl('flows_read').value).toBe(true);
    expect(ctrl('executions_read').disabled).toBe(true);
    expect(ctrl('flows_read').disabled).toBe(true);
    expect(ctrl('executions_control').disabled).toBe(false);
  });

  it('ticking executions_audit_read also locks activities_read', () => {
    ctrl('executions_audit_read').setValue(true);
    expect(ctrl('activities_read').value).toBe(true);
    expect(ctrl('activities_read').disabled).toBe(true);
    expect(ctrl('flows_read').disabled).toBe(true);
  });

  it('unticking the dependent unlocks', () => {
    ctrl('executions_control').setValue(true);
    ctrl('executions_control').setValue(false);
    expect(ctrl('executions_read').disabled).toBe(false);
    expect(ctrl('flows_read').disabled).toBe(false);
  });

  it('keeps a prerequisite locked while another dependent is still ticked', () => {
    ctrl('executions_control').setValue(true);
    ctrl('executions_destroy').setValue(true);
    ctrl('executions_control').setValue(false);
    expect(ctrl('executions_read').disabled).toBe(true);
    ctrl('executions_destroy').setValue(false);
    expect(ctrl('executions_read').disabled).toBe(false);
  });

  it('saving keeps the locked prerequisites', () => {
    ctrl('executions_control').setValue(true);
    const selected = component.getSelectedPermissions();
    expect(selected).toEqual(jasmine.arrayContaining(['executions_control', 'executions_read', 'flows_read']));
  });

  it('a stored role with executions_read loads with it ticked', () => {
    storedPermissions = ['executions_read'];
    component.getRoleById('r1');
    expect(ctrl('executions_read').value).toBe(true);
    expect(ctrl('flows_read').value).toBe(true);
    expect(ctrl('flows_read').disabled).toBe(true);
  });

  it('hides the Executions section when the service is not configured', () => {
    configured = false;
    expect(component.visibleSections.find(s => s.title === 'Executions')).toBeUndefined();
  });

  it('shows the Executions section when the service is configured', () => {
    expect(component.visibleSections.find(s => s.title === 'Executions')).toBeDefined();
  });

  it('keeps stored executions permissions on save while the section is hidden', () => {
    configured = false;
    storedPermissions = ['executions_read', 'executions_control', 'flows_read'];
    component.getRoleById('r1');
    expect(component.visibleSections.find(s => s.title === 'Executions')).toBeUndefined();
    expect(component.getSelectedPermissions()).toEqual(jasmine.arrayContaining([
      'executions_read', 'executions_control', 'flows_read',
    ]));
  });
});
