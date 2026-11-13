import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'ngx-moment';
import { BotListComponent } from './bots-list.component';
import { ExecutionsService } from '../../services/executions.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { FaqService } from '../../services/faq.service';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { NotifyService } from '../../core/notify.service';
import { AppConfigService } from '../../services/app-config.service';
import { DepartmentService } from '../../services/department.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { MatDialog } from '@angular/material/dialog';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { WebhookService } from 'app/services/webhook.service';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { AgentPromptsService } from 'app/services/agent-prompts.service';

// Focused spec for the executions entry (the generated bots-list spec has no providers and cannot run).
describe('BotListComponent executions entry', () => {
  let fixture: ComponentFixture<BotListComponent>;
  let component: BotListComponent;
  let executions: { isConfigured: jasmine.Spy; summary: jasmine.Spy };
  let router: { navigate: jasmine.Spy; url: string };

  const bots = [
    { _id: 'v1', root_id: 'root1', name: 'A', type: 'tilebot' },
    { _id: 'b2', name: 'B', type: 'tilebot' },
  ];

  function setup(configured: boolean, role: string, perms: string[] = [], summaryResult: any = of({ agents: {} })) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(configured),
      summary: jasmine.createSpy('summary').and.returnValue(summaryResult),
    };
    router = { navigate: jasmine.createSpy('navigate'), url: '/project/p1/bots/my-chatbots/all' };
    spyOn(BotListComponent.prototype, 'ngOnInit').and.stub();
    TestBed.configureTestingModule({
      declarations: [BotListComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatMenuModule, MatTooltipModule, MatButtonModule, NoopAnimationsModule, MomentModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: Router, useValue: router },
        { provide: BrandService, useValue: { getBrand: () => ({}) } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
        // the card template reads the config (Clone to V3 on master-STAGE-NEW)
        { provide: AppConfigService, useValue: { getConfig: () => ({}) } },
        // collaborators the executions entry does not touch
        ...[FaqKbService, FaqService, AuthService, Location, NotifyService, DepartmentService,
          ProjectService, BotLocalDbService, MatDialog, ProjectPlanService, UsersService, Clipboard, WebhookService,
          ActivatedRoute, RoleService, RolesService, AgentPromptsService].map(t => ({ provide: t, useValue: {} })),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(BotListComponent);
    component = fixture.componentInstance;
    (component as any).project = { _id: 'p1' };
    component.faqkbList = bots as any;
    component.pagedFaqkbList = bots as any;
    component.applyExecutionsPermission(role, perms);
  }

  it('button hidden when not configured', () => {
    setup(false, 'owner');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.executions-btn')).toBeNull();
    component.loadExecutionsSummary();
    expect(executions.summary).not.toHaveBeenCalled();
  });

  it('button hidden for agent role', () => {
    setup(true, 'agent');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.executions-btn')).toBeNull();
    component.loadExecutionsSummary();
    expect(executions.summary).not.toHaveBeenCalled();
  });

  it('shows a button per card and one summary call with the root ids', () => {
    setup(true, 'supervisor');
    fixture.detectChanges();
    component.loadExecutionsSummary();
    component.loadExecutionsSummary();
    expect(fixture.nativeElement.querySelectorAll('.executions-btn').length).toBe(2);
    expect(executions.summary).toHaveBeenCalledTimes(1);
    expect(executions.summary).toHaveBeenCalledWith('p1', ['root1', 'b2']);
  });

  it('badge shows failed+stopped count and a running dot', () => {
    setup(true, 'owner', [], of({ agents: {
      root1: { running: 2, waiting: 0, failed: 3, stopped: 4, last_started_at: null },
      b2: { running: 0, waiting: 0, failed: 0, stopped: 0, last_started_at: null },
    } }));
    component.loadExecutionsSummary();
    fixture.detectChanges();
    const badges = fixture.nativeElement.querySelectorAll('.executions-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].textContent.trim()).toBe('7');
    expect(fixture.nativeElement.querySelectorAll('.executions-running-dot').length).toBe(1);
  });

  it('caps the badge at 99+', () => {
    setup(true, 'owner', [], of({ agents: { root1: { running: 0, waiting: 0, failed: 150, stopped: 0, last_started_at: null } } }));
    component.loadExecutionsSummary();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.executions-badge').textContent.trim()).toBe('99+');
  });

  it('a failed summary call hides badges and does not throw', () => {
    setup(true, 'owner', [], throwError(() => new Error('boom')));
    component.loadExecutionsSummary();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.executions-badge')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.executions-btn').length).toBe(2);
  });

  it('calls summary again when the visible page changes', () => {
    setup(true, 'owner');
    component.loadExecutionsSummary();
    component.pagedFaqkbList = [bots[1]] as any;
    component.loadExecutionsSummary();
    expect(executions.summary).toHaveBeenCalledTimes(2);
    expect(executions.summary.calls.mostRecent().args).toEqual(['p1', ['b2']]);
  });

  it('agent executions button opens monitor on the last 24 hours, the badge\'s window (the page defaults to Now)', () => {
    setup(true, 'owner');
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.executions-btn')[0].click();
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'monitor', 'root1', 'executions'], { queryParams: { range: '24h' } });
  });

  it('all executions button opens monitor', () => {
    setup(true, 'owner');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.bots-list-all-executions-btn').click();
    expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'monitor', 'executions']);
  });

  it('agents page has no list/graph switch', () => {
    const getItem = spyOn(localStorage, 'getItem').and.callThrough();
    const setItem = spyOn(localStorage, 'setItem').and.callThrough();
    setup(true, 'owner');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.bots-list-view-switch')).toBeNull();
    expect(el.querySelector('execution-graph')).toBeNull();
    expect(el.querySelectorAll('.card-list').length).toBe(2);
    expect((component as any).viewMode).toBeUndefined();
    expect((component as any).graphAgents).toBeUndefined();
    expect(getItem).not.toHaveBeenCalledWith('tiledesk_agents_view');
    expect(setItem).not.toHaveBeenCalledWith('tiledesk_agents_view', jasmine.anything());
  });

  it('agent executions button has an accessible name', () => {
    setup(true, 'owner');
    fixture.detectChanges();
    const btns = fixture.nativeElement.querySelectorAll('.executions-btn');
    expect(btns.length).toBe(2);
    btns.forEach((b: HTMLElement) => expect(b.getAttribute('aria-label')).toBe('Executions.Executions'));
  });
});
