import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MonitorTabsComponent } from './monitor-tabs.component';
import { ExecutionsService } from 'app/services/executions.service';
import { RolesService } from 'app/services/roles.service';
import { AuthService } from 'app/core/auth.service';

describe('MonitorTabsComponent', () => {
  let fixture: ComponentFixture<MonitorTabsComponent>;
  let perms$: Subject<any>;

  function setup(opts: { configured?: boolean; role?: string; perms?: string[]; active?: string } = {}) {
    perms$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [MonitorTabsComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        { provide: ExecutionsService, useValue: { isConfigured: () => opts.configured !== false } },
        { provide: AuthService, useValue: { project_bs: new BehaviorSubject({ _id: 'p1' }) } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(MonitorTabsComponent);
    fixture.componentInstance.active = (opts.active || 'executions') as any;
    fixture.detectChanges();
    perms$.next({ role: opts.role || 'owner', matchedPermissions: opts.perms || [] });
    fixture.detectChanges();
  }

  const links = () => Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];

  it('no tab bar without executions permission', () => {
    setup({ role: 'agent' });
    expect(links().length).toBe(0);
  });

  it('no tab bar when executions are not configured', () => {
    setup({ configured: false });
    expect(links().length).toBe(0);
  });

  it('three tabs with the active one marked', () => {
    setup({ active: 'executions' });
    const a = links();
    expect(a.length).toBe(3);
    expect(a.map(x => x.getAttribute('href'))).toEqual([
      '/project/p1/wsrequests', '/project/p1/monitor/executions', '/project/p1/monitor/graph']);
    expect(a.map(x => x.getAttribute('aria-current'))).toEqual([null, 'page', null]);
  });
});
