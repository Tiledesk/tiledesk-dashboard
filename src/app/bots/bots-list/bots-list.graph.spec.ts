import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'ngx-moment';
import { Location } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialog } from '@angular/material/dialog';
import { BotListComponent } from './bots-list.component';
import { ExecutionsService } from '../../services/executions.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { FaqService } from '../../services/faq.service';
import { AuthService } from '../../core/auth.service';
import { NotifyService } from '../../core/notify.service';
import { AppConfigService } from '../../services/app-config.service';
import { DepartmentService } from '../../services/department.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { WebhookService } from 'app/services/webhook.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { AgentPromptsService } from 'app/services/agent-prompts.service';

@Component({ selector: 'execution-graph', template: '' })
class StubGraphComponent {
  @Input() projectId: string;
  @Input() projectName: string;
  @Input() agents: any[];
  @Output() unavailable = new EventEmitter<void>();
}

describe('BotListComponent list / graph switch', () => {
  let fixture: ComponentFixture<BotListComponent>;
  let component: BotListComponent;
  let store: { [k: string]: string };

  const bots = [
    { _id: 'v1', root_id: 'root1', name: 'A', type: 'tilebot' },
    { _id: 'b2', name: 'B', type: 'tilebot' },
  ];

  function setup(configured: boolean, role: string, stored?: string, url = '/project/p1/bots/my-chatbots/all', faqKb: any = {}) {
    store = stored ? { tiledesk_agents_view: stored } : {};
    spyOn(localStorage, 'getItem').and.callFake((k: string) => (k in store ? store[k] : null));
    spyOn(localStorage, 'setItem').and.callFake((k: string, v: string) => { store[k] = v; });
    spyOn(BotListComponent.prototype, 'ngOnInit').and.stub();
    TestBed.configureTestingModule({
      declarations: [BotListComponent, StubGraphComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatMenuModule, MatTooltipModule, MatButtonModule, NoopAnimationsModule, MomentModule],
      providers: [
        { provide: ExecutionsService, useValue: { isConfigured: () => configured, summary: () => of({ agents: {} }) } },
        { provide: Router, useValue: { navigate() {}, url } },
        { provide: BrandService, useValue: { getBrand: () => ({}) } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
        { provide: FaqKbService, useValue: faqKb },
        { provide: AppConfigService, useValue: { getConfig: () => ({}) } },
        ...[FaqService, AuthService, Location, NotifyService, DepartmentService,
          ProjectService, BotLocalDbService, MatDialog, ProjectPlanService, UsersService, Clipboard, WebhookService,
          ActivatedRoute, RoleService, RolesService, AgentPromptsService].map(t => ({ provide: t, useValue: {} })),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(BotListComponent);
    component = fixture.componentInstance;
    (component as any).project = { _id: 'p1', name: 'Proj' };
    component.isChatbotRoute = 'all';
    component.faqkbList = bots as any;
    component.pagedFaqkbList = bots as any;
    (component as any).buildGraphAgents();
    component.applyExecutionsPermission(role, []);
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;

  it('switch hidden when executionsEnabled is false', () => {
    setup(false, 'owner');
    expect(el().querySelector('.bots-list-view-switch')).toBeNull();
  });

  it('graph mode shows execution-graph with the agents\' root ids and hides the list', () => {
    setup(true, 'owner');
    expect(el().querySelector('execution-graph')).toBeNull();
    expect(el().querySelectorAll('.card-list').length).toBe(2);
    (el().querySelectorAll('.bots-list-view-switch-btn')[1] as HTMLElement).click();
    fixture.detectChanges();
    const g = fixture.debugElement.nativeElement.querySelector('execution-graph');
    expect(g).not.toBeNull();
    expect(el().querySelectorAll('.card-list').length).toBe(0);
    expect(component.graphAgents).toEqual([{ id: 'root1', name: 'A' }, { id: 'b2', name: 'B' }]);
  });

  it('choice is remembered', () => {
    setup(true, 'owner');
    component.setViewMode('graph');
    expect(store['tiledesk_agents_view']).toBe('graph');
    component.setViewMode('list');
    expect(store['tiledesk_agents_view']).toBe('list');
  });

  it('unavailable falls back to list', () => {
    setup(true, 'owner', 'graph');
    expect(component.showGraph).toBe(true);
    component.onGraphUnavailable();
    fixture.detectChanges();
    expect(component.viewMode).toBe('list');
    expect(el().querySelector('execution-graph')).toBeNull();
    expect(el().querySelectorAll('.card-list').length).toBe(2);
  });

  it('stored graph with executions disabled shows the list', () => {
    setup(false, 'owner', 'graph');
    expect(component.showGraph).toBe(false);
    expect(el().querySelector('execution-graph')).toBeNull();
    expect(el().querySelectorAll('.card-list').length).toBe(2);
  });

  it('aria-pressed reflects the mode and the group is labelled', () => {
    setup(true, 'owner');
    const group = el().querySelector('.bots-list-view-switch');
    expect(group.getAttribute('aria-label')).toBeTruthy();
    const btns = el().querySelectorAll('.bots-list-view-switch-btn');
    expect(btns[0].getAttribute('aria-pressed')).toBe('true');
    expect(btns[1].getAttribute('aria-pressed')).toBe('false');
    component.setViewMode('graph');
    fixture.detectChanges();
    expect(btns[0].getAttribute('aria-pressed')).toBe('false');
    expect(btns[1].getAttribute('aria-pressed')).toBe('true');
  });

  it('graphAgents come from the final list of a flows route', () => {
    const list = [
      { _id: 'c1', name: 'Chat', type: 'tilebot' },
      { _id: 'w1', root_id: 'wr', name: 'Hook', type: 'tilebot', subtype: 'webhook' },
    ];
    setup(true, 'owner', undefined, '/project/p1/flows/flow-automations', { getFaqKbByProjectId: () => of(list) });
    component.getFaqKbByProjectId();
    expect(component.graphAgents).toEqual([{ id: 'wr', name: 'Hook' }]);
  });
});
