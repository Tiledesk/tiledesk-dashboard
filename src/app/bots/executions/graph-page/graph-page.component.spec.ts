import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { GraphPageComponent } from './graph-page.component';
import { MonitorTabsComponent } from '../monitor-tabs/monitor-tabs.component';
import { ExecutionsService } from 'app/services/executions.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { RolesService } from 'app/services/roles.service';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({ selector: 'execution-graph', template: '' })
class GraphStubComponent {
  @Input() projectId: string;
  @Input() projectName: string;
  @Input() agents: any[];
  @Input() fill: boolean;
}

describe('GraphPageComponent', () => {
  let fixture: ComponentFixture<GraphPageComponent>;
  let perms$: Subject<any>;

  let getAgents: jasmine.Spy;

  function setup(bots$: any, perm: any = { role: 'owner', matchedPermissions: [] }, configured = true) {
    getAgents = jasmine.createSpy('getFaqKbByProjectId').and.returnValue(bots$);
    perms$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [GraphPageComponent, GraphStubComponent, MonitorTabsComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ExecutionsService, useValue: { isConfigured: () => configured } },
        { provide: FaqKbService, useValue: { getFaqKbByProjectId: getAgents } },
        { provide: AuthService, useValue: { project_bs: new BehaviorSubject({ _id: 'p1', name: 'Proj' }) } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, error() {}, debug() {}, warn() {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(GraphPageComponent);
    fixture.detectChanges();
    perms$.next(perm);
    fixture.detectChanges();
  }

  const graph = () => fixture.debugElement.query(By.css('execution-graph'));

  it('graph page passes agents once loaded', () => {
    const bots$ = new Subject<any[]>();
    setup(bots$);
    expect(graph()).toBeNull();
    bots$.next([{ _id: 'b1', name: 'One' }, { _id: 'b2', root_id: 'r2', name: 'Two' }]);
    fixture.detectChanges();
    const g = graph().componentInstance as GraphStubComponent;
    expect(g.agents).toEqual([{ id: 'b1', name: 'One' }, { id: 'r2', name: 'Two' }]);
    expect(g.projectId).toBe('p1');
    expect(g.projectName).toBe('Proj');
  });

  it('shows an error when agents fail to load', () => {
    setup(throwError(() => new Error('boom')));
    expect(graph()).toBeNull();
    expect(fixture.nativeElement.querySelector('.graph-page-error')).not.toBeNull();
  });

  it('shows the unauthorized message without permission', () => {
    setup(of([]), { role: 'agent', matchedPermissions: [] });
    expect(graph()).toBeNull();
    expect(fixture.nativeElement.querySelector('.unauthorized-message-container-in-page')).not.toBeNull();
  });

  it('tab bar marks graph', () => {
    setup(of([]));
    const tabs = fixture.debugElement.query(By.directive(MonitorTabsComponent)).componentInstance as MonitorTabsComponent;
    expect(tabs.active).toBe('graph');
  });

  it('not configured: shows the not-configured message, no agents load, no graph', () => {
    setup(of([{ _id: 'b1', name: 'One' }]), { role: 'owner', matchedPermissions: [] }, false);
    expect(getAgents).not.toHaveBeenCalled();
    expect(graph()).toBeNull();
    const msg = fixture.nativeElement.querySelector('.exec-not-configured');
    expect(msg).not.toBeNull();
    expect(msg.textContent.trim()).toBe('Executions.NotConfigured');
  });

  it('not configured: no unauthorized message for an unpermitted role either way', () => {
    setup(of([]), { role: 'agent', matchedPermissions: [] }, false);
    expect(getAgents).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.unauthorized-message-container-in-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.exec-not-configured')).toBeNull();
  });
});
