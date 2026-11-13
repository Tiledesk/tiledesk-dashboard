import { ComponentFixture, discardPeriodicTasks, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { By } from '@angular/platform-browser';
import { ExecutionDetailComponent } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import * as enJson from '../../../../assets/i18n/en.json';

const EN = (enJson as any).default || enJson;
const EXEC_ID = '0193a2f4-0000-7000-8000-000000000001';
const START = '2026-11-09T03:00:00.000Z';
const at = (ms: number) => new Date(Date.parse(START) + ms).toISOString();

function step(seq: number, startMs: number, durMs: number | null, extra: any = {}) {
  return {
    seq, block_id: 'b' + seq, block_name: 'Block ' + seq, agent_id: 'a1', agent_version: 'v1',
    started_at: at(startMs), ended_at: durMs == null ? null : at(startMs + durMs), duration_ms: durMs,
    outcome: durMs == null ? null : 'success', exit_taken: null, state_vars: 1, changed_keys: 0, actions: [], outside: [], ...extra,
  };
}

function detail(status: string, controls: any[] = [], extra: any = {}): any {
  return {
    execution: {
      _id: EXEC_ID, id_project: 'p1', agent_id: 'a1', agent_name: 'Nightly checks', agent_version: '6731a0f2c4e5b9d8e7f60123',
      test: false, request_id: 'r1', conversation_link: null, trigger: { type: 'scheduled' }, status,
      end_reason: null, error: null, handed_to_bot_id: null, failure_conditions: 1, errors: 3, steps_count: 2,
      actions_count: 7, vars_changed: 5, started_at: START, ended_at: null,
      last_event_at: null, duration_ms: 2000, last_seq: 2, trace_complete: true, missing_seq: [],
      has_checkpoint: true, has_data: false, retention: null, ...(extra.execution || {}),
    },
    steps: extra.steps || [step(1, 0, 400), step(2, 500, 500)],
    allowed_controls: controls,
    lineage: { parent: null, previous: null, retry_of: null, retried_as: [], ...(extra.lineage || {}) },
  };
}

const act = (type: string, extra: any = {}) => ({ action_id: type + Math.random().toString(36).slice(2, 6), type, title: null, outcome: 'success', ...extra });

/** Five blocks: two named "Ask", mixed action types, one failed. */
const STEPS = () => [
  step(1, 0, 100, { block_name: 'Start', actions: [act('reply')] }),
  step(2, 100, 100, { block_name: 'Ask', actions: [act('webrequestv2'), act('reply')] }),
  step(3, 200, 100, { block_name: 'Ask', outcome: 'error', actions: [act('ai_prompt')] }),
  step(4, 300, 100, { block_name: 'Route', actions: [act('ai_prompt'), act('webrequestv2'), act('webrequestv2')] }),
  step(5, 400, 100, { block_name: null, block_id: 'blk-5', actions: [] }),
];

describe('ExecutionDetailComponent timeline filters (feedback 2026-11-13 item 6)', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let component: ExecutionDetailComponent;
  let executions: any;

  function setup(d: any) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.returnValue(of(d)),
      state: jasmine.createSpy('state').and.returnValue(of({ step_seq: 1, partial: false, vars: [] })),
      history: jasmine.createSpy('history').and.returnValue(of([])),
    };
    const perms$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [ExecutionDetailComponent, ExecutionStatusChipComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, MatMenuModule, NoopAnimationsModule, FormsModule, NgSelectModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(null) }) } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
        { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ projectid: 'p1', botid: 'a1', executionid: EXEC_ID })) } },
        { provide: RolesService, useValue: { listenToProjectUserPermissions() {}, getUpdateRequestPermission: () => perms$ } },
        { provide: LoggerService, useValue: { log() {}, debug() {}, warn() {}, error() {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    const t = TestBed.inject(TranslateService);
    t.setTranslation('en', EN);
    t.use('en');
    fixture = TestBed.createComponent(ExecutionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    perms$.next({ role: 'owner', matchedPermissions: [] });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const shown = () => component.visibleTimeline.map(i => i.step.seq);
  const rowNames = () => Array.from(el().querySelectorAll('.tl-step .tl-name')).map(n => n.textContent.trim());
  const select = (cls: string) => fixture.debugElement.query(By.css('ng-select.' + cls));

  afterEach(() => { if (fixture) fixture.destroy(); });

  it('options come from the loaded steps: block names and action types, each with the number of blocks', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    expect(component.blockNameOptions).toEqual([
      { value: 'Ask', label: 'Ask', count: 2 },
      { value: 'blk-5', label: 'blk-5', count: 1 },
      { value: 'Route', label: 'Route', count: 1 },
      { value: 'Start', label: 'Start', count: 1 },
    ]);
    // a block counts once per type, whatever the number of its actions of that type; no mapping: the raw type
    expect(component.blockTypeOptions).toEqual([
      { value: 'ai_prompt', label: 'ai_prompt', count: 2 },
      { value: 'reply', label: 'reply', count: 2 },
      { value: 'webrequestv2', label: 'webrequestv2', count: 2 },
    ]);
  });

  it('block name: only the blocks with a selected name', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    component.setBlockNames(['Ask', 'blk-5']);
    fixture.detectChanges();
    expect(shown()).toEqual([2, 3, 5]);
    expect(rowNames()).toEqual(['Ask', 'Ask', 'blk-5']);
  });

  it('block type: a block matches if it contains any selected action type', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    component.setBlockTypes(['webrequestv2']);
    expect(shown()).toEqual([2, 4]);
    component.setBlockTypes(['webrequestv2', 'reply']);
    expect(shown()).toEqual([1, 2, 4]);
  });

  it('the filters combine with each other and with Not successful (AND)', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    component.setBlockNames(['Ask', 'Route']);
    component.setBlockTypes(['ai_prompt']);
    expect(shown()).toEqual([3, 4]);
    component.setFailedOnly(true);
    expect(shown()).toEqual([3]);
    component.setFailedOnly(false);
    expect(shown()).toEqual([3, 4]);
  });

  it('two multi-select dropdowns with checkboxes beside All / Not successful', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    const bar = el().querySelector('.ex-tabs-bar') as HTMLElement;
    expect(bar.querySelector('ng-select.tl-filter-name')).not.toBeNull();
    expect(bar.querySelector('ng-select.tl-filter-type')).not.toBeNull();
    expect(bar.querySelector('.tl-filter-failed')).not.toBeNull();
    for (const cls of ['tl-filter-name', 'tl-filter-type']) {
      const ng = select(cls).componentInstance as NgSelectComponent;
      expect(ng.multiple).toBe(true, cls);
      expect(ng.closeOnSelect).toBe(false, cls);
      expect(select(cls).nativeElement.getAttribute('aria-label')).toBeTruthy();
    }
    const types = select('tl-filter-type').componentInstance as NgSelectComponent;
    types.open();
    fixture.detectChanges();
    const opts = Array.from(document.querySelectorAll('ng-select.tl-filter-type .ng-option')) as HTMLElement[];
    expect(opts.length).toBe(3);
    expect(opts.every(o => !!o.querySelector('input[type="checkbox"]'))).toBe(true);
    expect(opts[0].textContent).toContain('ai_prompt');
    expect(opts[0].querySelector('.tl-filter-count').textContent.trim()).toBe('2');
    // a pick in the dropdown filters the timeline, and its checkbox is checked
    opts[2].click();
    fixture.detectChanges();
    expect(component.blockTypes).toEqual(['webrequestv2']);
    expect(shown()).toEqual([2, 4]);
    const checked = Array.from(document.querySelectorAll('ng-select.tl-filter-type .ng-option input[type="checkbox"]')) as HTMLInputElement[];
    expect(checked.map(c => c.checked)).toEqual([false, false, true]);
  });

  it('clear filters resets names, types and Not successful; shown only while a filter is on', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    expect(el().querySelector('.tl-filter-clear')).toBeNull();
    component.setBlockNames(['Ask']);
    fixture.detectChanges();
    const clear = el().querySelector('.tl-filter-clear') as HTMLButtonElement;
    expect(clear).not.toBeNull();
    component.setFailedOnly(true);
    component.setBlockTypes(['reply']);
    clear.click();
    fixture.detectChanges();
    expect(component.blockNames).toEqual([]);
    expect(component.blockTypes).toEqual([]);
    expect(component.failedOnly).toBe(false);
    expect(shown()).toEqual([1, 2, 3, 4, 5]);
    expect(el().querySelector('.tl-filter-clear')).toBeNull();
  });

  it('nothing matches: a note with a clear action instead of the rows', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    component.setBlockNames(['Start']);
    component.setBlockTypes(['ai_prompt']);
    fixture.detectChanges();
    expect(el().querySelectorAll('.tl-step').length).toBe(0);
    const note = el().querySelector('.tl-filter-empty') as HTMLElement;
    expect(note).not.toBeNull();
    expect(note.textContent).toContain(EN.Executions.Detail.NoBlocksMatch);
    (note.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el().querySelectorAll('.tl-step').length).toBe(5);
    expect(el().querySelector('.tl-filter-empty')).toBeNull();
  });

  it('no steps: no filters and no filter note (the "no blocks" note stays)', () => {
    setup(detail('completed', [], { steps: [] }));
    expect(el().querySelector('ng-select.tl-filter-name')).toBeNull();
    expect(el().querySelector('.tl-filter-empty')).toBeNull();
  });

  it('the filters are only on the timeline tab', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    component.setTab('state');
    fixture.detectChanges();
    expect(el().querySelector('ng-select.tl-filter-name')).toBeNull();
  });

  it('a block shown again by a filter change that is expanded gets its state loaded', () => {
    setup(detail('completed', [], { steps: STEPS() }));
    component.setBlockNames(['Start']);
    component.expanded.add(4);
    executions.state.calls.reset();
    component.setBlockNames([]);
    expect(executions.state.calls.allArgs().map((a: any[]) => a[2])).toContain(4);
  });
});
