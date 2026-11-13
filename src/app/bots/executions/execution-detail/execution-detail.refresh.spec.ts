import { ComponentFixture, discardPeriodicTasks, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { COPIED_MS, ExecutionDetailComponent, MIN_BAR_PCT, rowBar, timeSplit } from './execution-detail.component';
import { ExecutionStatusChipComponent } from '../shared/execution-status-chip.component';
import { ExecutionsService } from '../../../services/executions.service';
import { RolesService } from '../../../services/roles.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { PERMISSIONS } from '../../../utils/permissions.constants';
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

describe('ExecutionDetailComponent refreshed layout', () => {
  let fixture: ComponentFixture<ExecutionDetailComponent>;
  let component: ExecutionDetailComponent;
  let executions: any;
  let router: { navigate: jasmine.Spy };

  function setup(d: any, role = 'owner', perms: string[] = []) {
    executions = {
      isConfigured: jasmine.createSpy('isConfigured').and.returnValue(true),
      get: jasmine.createSpy('get').and.returnValue(of(d)),
      state: jasmine.createSpy('state').and.returnValue(of({ step_seq: 1, partial: false, vars: [] })),
      history: jasmine.createSpy('history').and.returnValue(of([])),
      stop: jasmine.createSpy('stop').and.returnValue(new Subject()),
    };
    router = { navigate: jasmine.createSpy('navigate') };
    const perms$ = new Subject<any>();
    TestBed.configureTestingModule({
      declarations: [ExecutionDetailComponent, ExecutionStatusChipComponent],
      imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, MatMenuModule, NoopAnimationsModule],
      providers: [
        { provide: ExecutionsService, useValue: executions },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of('soft') }) } },
        { provide: Router, useValue: router },
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
    perms$.next({ role, matchedPermissions: perms });
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const primary = () => el().querySelector('.ex-controls button') as HTMLButtonElement;

  function openMenu() {
    if (!document.querySelector('.ex-menu')) {
      (el().querySelector('.ex-more') as HTMLButtonElement).click();
      fixture.detectChanges();
    }
  }
  /** The overflow menu's items, in order: a control by its name, the others by their class. */
  function menuItems(): string[] {
    openMenu();
    return Array.from(document.querySelectorAll('.ex-menu [mat-menu-item]')).map(b => {
      const ctl = Array.from(b.classList).find(c => c.startsWith('ex-ctl-'));
      return ctl ? ctl.slice('ex-ctl-'.length) : Array.from(b.classList).find(c => c === 'ex-copy-link' || c === 'ex-open-activities');
    });
  }
  const menuItem = (sel: string) => { openMenu(); return document.querySelector('.ex-menu ' + sel) as HTMLButtonElement; };

  function end() {
    fixture.destroy();
    discardPeriodicTasks();
  }

  afterEach(() => { if (fixture) fixture.destroy(); });

  describe('primary control and overflow menu', () => {
    const cases: Array<[string, string[], string | null, string[]]> = [
      // status, allowed controls, primary, menu items in order
      ['running', ['stop', 'destroy'], 'stop', ['ex-copy-link', 'ex-open-activities', 'destroy']],
      ['running', ['stop', 'stop_hard_now', 'destroy'], 'stop', ['stop_hard_now', 'ex-copy-link', 'ex-open-activities', 'destroy']],
      ['waiting', ['destroy', 'stop'], 'stop', ['ex-copy-link', 'ex-open-activities', 'destroy']],
      ['stopping', ['stop_hard_now', 'destroy'], 'stop_hard_now', ['ex-copy-link', 'ex-open-activities', 'destroy']],
      ['stopped', ['destroy', 'resume', 'start_new'], 'resume', ['start_new', 'ex-copy-link', 'ex-open-activities', 'destroy']],
      ['stopped', ['destroy', 'start_new'], 'start_new', ['ex-copy-link', 'ex-open-activities', 'destroy']],
      ['completed', ['start_new', 'destroy'], 'start_new', ['ex-copy-link', 'ex-open-activities', 'destroy']],
      ['failed', ['resume', 'start_new', 'destroy'], 'start_new', ['resume', 'ex-copy-link', 'ex-open-activities', 'destroy']],
      ['stopped', ['destroy'], null, ['ex-copy-link', 'ex-open-activities', 'destroy']],
      ['completed', [], null, ['ex-copy-link', 'ex-open-activities']],
    ];
    cases.forEach(([status, names, want, menu]) => {
      it(`${status} with [${names.join(', ')}]: primary ${want || 'none'}, menu ${menu.join(', ')}`, fakeAsync(() => {
        setup(detail(status, names.map(name => ({ name, allowed: true }))));
        if (want) {
          expect(primary().classList).toContain('ex-ctl-' + want);
          expect(el().querySelectorAll('.ex-controls button').length).toBe(1);
        } else expect(el().querySelector('.ex-controls')).toBeNull();
        expect(menuItems()).toEqual(menu);
        end();
      }));
    });

    it('destroy is last, red and after a divider', fakeAsync(() => {
      setup(detail('stopped', [{ name: 'destroy', allowed: true }, { name: 'resume', allowed: true }, { name: 'start_new', allowed: true }]));
      const destroy = menuItem('.ex-ctl-destroy');
      expect(destroy.classList).toContain('ex-menu-danger');
      const items = Array.from(document.querySelectorAll('.ex-menu [mat-menu-item]'));
      expect(items[items.length - 1]).toBe(destroy);
      expect(destroy.previousElementSibling.tagName.toLowerCase()).toBe('mat-divider');
      end();
    }));

    it('a disabled primary keeps its reason as tooltip; a disabled menu item writes it under its name', fakeAsync(() => {
      setup(detail('stopped', [{ name: 'resume', allowed: false, reason: 'conversation_closed' }, { name: 'start_new', allowed: false, reason: 'test_run' },
        { name: 'destroy', allowed: true }]));
      expect(primary().disabled).toBe(true);
      const tips = fixture.debugElement.queryAll(By.directive(MatTooltip)).map(d => d.injector.get(MatTooltip)).map(t => t.message);
      expect(tips).toContain('The conversation is closed');
      const sn = menuItem('.ex-ctl-start_new');
      expect(sn.disabled).toBe(true);
      expect(sn.querySelector('.ex-ctl-label').textContent.trim()).toBe('Start new');
      expect(sn.querySelector('.ex-ctl-reason').textContent.trim()).toBe('Not available for Design Studio test runs');
      // an allowed item has no reason line
      expect(menuItem('.ex-ctl-destroy').querySelector('.ex-ctl-reason')).toBeNull();
      expect(menuItem('.ex-ctl-destroy').disabled).toBe(false);
      end();
    }));

    it('while a control is pending, the primary and the menu controls are disabled; copy link stays', fakeAsync(() => {
      setup(detail('running', [{ name: 'stop', allowed: true }, { name: 'stop_hard_now', allowed: true }, { name: 'destroy', allowed: true }]));
      primary().click(); // the stop dialog answers soft; the request stays in flight
      fixture.detectChanges();
      expect(primary().disabled).toBe(true);
      expect(menuItem('.ex-ctl-stop_hard_now').disabled).toBe(true);
      expect(menuItem('.ex-ctl-destroy').disabled).toBe(true);
      expect(menuItem('.ex-copy-link').disabled).toBe(false);
      end();
    }));

    it('Open in Activities goes to the activities page; hidden without the audit permission', fakeAsync(() => {
      setup(detail('completed'));
      menuItem('.ex-open-activities').click();
      expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'activities']);
      fixture.destroy();
      TestBed.resetTestingModule();
      setup(detail('completed'), 'custom', [PERMISSIONS.EXECUTIONS_READ]);
      expect(menuItems()).toEqual(['ex-copy-link']);
      end();
    }));
  });

  describe('copy buttons', () => {
    let write: jasmine.Spy;
    beforeEach(() => { write = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve()); });

    it('copies the full version and shows Copied for a while', fakeAsync(() => {
      setup(detail('completed'));
      const v = el().querySelector('.ex-version').textContent.trim();
      expect(v).toBe('…e7f60123'); // a long version by its tail
      const b = el().querySelector('.ex-copy-version') as HTMLButtonElement;
      b.click();
      expect(write).toHaveBeenCalledWith('6731a0f2c4e5b9d8e7f60123');
      flushMicrotasks();
      fixture.detectChanges();
      expect(b.querySelector('mat-icon').textContent.trim()).toBe('check');
      tick(COPIED_MS);
      fixture.detectChanges();
      expect(b.querySelector('mat-icon').textContent.trim()).toBe('content_copy');
      end();
    }));

    it('copies the full execution id (the short one is shown, the full one in the tooltip)', fakeAsync(() => {
      setup(detail('completed'));
      expect(el().querySelector('.ex-exec-id').textContent.trim()).toBe('00000001');
      (el().querySelector('.ex-copy-id') as HTMLButtonElement).click();
      expect(write).toHaveBeenCalledWith(EXEC_ID);
      flushMicrotasks();
      fixture.detectChanges();
      expect(el().querySelector('.ex-copy-id mat-icon').textContent.trim()).toBe('check');
      tick(COPIED_MS);
      end();
    }));

    it('Copy execution link copies the page URL and says so', fakeAsync(() => {
      setup(detail('completed'));
      menuItem('.ex-copy-link').click();
      expect(write).toHaveBeenCalledWith(window.location.href);
      flushMicrotasks();
      fixture.detectChanges();
      expect(el().querySelector('.ex-link-copied').textContent.trim()).toBe('Execution link copied');
      tick(COPIED_MS);
      fixture.detectChanges();
      expect(el().querySelector('.ex-link-copied').textContent.trim()).toBe('');
      end();
    }));

    it('a refused copy changes nothing', fakeAsync(() => {
      write.and.callFake(() => Promise.reject(new Error('denied')));
      setup(detail('completed'));
      (el().querySelector('.ex-copy-id') as HTMLButtonElement).click();
      flushMicrotasks();
      fixture.detectChanges();
      expect(component.copied).toBeNull();
      end();
    }));
  });

  describe('summary tiles', () => {
    const tile = (k: string) => el().querySelector(`.ex-kpi[data-kpi="${k}"]`) as HTMLElement;
    const value = (k: string) => tile(k).querySelector('.ex-kpi-value').textContent.trim();

    it('shows duration, blocks, actions, failure conditions, errors and attributes changed from the detail', fakeAsync(() => {
      setup(detail('completed'));
      expect(Array.from(el().querySelectorAll('.ex-kpi')).map(t => t.getAttribute('data-kpi')))
        .toEqual(['duration', 'blocks', 'actions', 'failure_conditions', 'errors', 'vars_changed']);
      expect(value('duration')).toBe('2.0 s');
      expect(value('blocks')).toBe('2');
      expect(value('actions')).toBe('7');
      expect(value('failure_conditions')).toBe('1');
      expect(value('errors')).toBe('3');
      expect(value('vars_changed')).toBe('5');
      expect(tile('errors').querySelector('.ex-kpi-label').textContent.trim()).toBe('Errors');
      expect(tile('errors').classList).toContain('ex-kpi-bad');
      expect(tile('failure_conditions').classList).toContain('ex-kpi-warn');
      expect(tile('actions').classList).toContain('ex-kpi-neutral');
      end();
    }));

    it('the tiles have no border at all, not even the coloured top line; the value keeps the accent (feedback 2026-11-13)', fakeAsync(() => {
      setup(detail('completed'));
      for (const k of ['duration', 'blocks', 'actions', 'failure_conditions', 'errors', 'vars_changed']) {
        const cs = getComputedStyle(tile(k));
        for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
          expect((cs as any)['border' + side + 'Width']).toBe('0px', k + ' ' + side);
        }
        expect(cs.boxShadow).toBe('none', k + ' shadow');
      }
      // the bad/warn values keep their colour
      expect(getComputedStyle(tile('errors').querySelector('.ex-kpi-value')).color).toBe('rgb(198, 47, 47)');
      end();
    }));

    it('zeros are neutral; a missing errors (older API) is 0; a running execution shows its elapsed time', fakeAsync(() => {
      const d = detail('running', [], { execution: { errors: undefined, failure_conditions: 0, duration_ms: null } });
      setup(d);
      spyOn(component, 'now').and.returnValue(Date.parse(START) + 12000);
      fixture.detectChanges();
      expect(value('errors')).toBe('0');
      expect(tile('errors').classList).toContain('ex-kpi-neutral');
      expect(tile('failure_conditions').classList).toContain('ex-kpi-neutral');
      expect(value('duration')).toBe('12.0 s');
      end();
    }));
  });

  describe('time split', () => {
    const steps = (...xs: Array<[number, number, number]>) => xs.map(([seq, start, end]) => ({ seq, start, end }));

    it('splits the run into blocks and the waits between them, in time order', () => {
      // run 0..1000: block 1 0..100, wait 100..400, block 2 400..500, wait 500..1000
      const sp = timeSplit(0, 1000, steps([1, 0, 100], [2, 400, 500]));
      expect(sp.segments.map(x => [x.kind, x.seq, x.left, x.width, x.ms])).toEqual([
        ['block', 1, 0, 10, 100], ['wait', 1, 10, 30, 300], ['block', 2, 40, 10, 100], ['wait', 2, 50, 50, 500],
      ]);
      expect(sp.blockMs).toBe(200);
      expect(sp.waitMs).toBe(800);
      expect(sp.waitAfter.get(1)).toBe(300);
      expect(sp.waitAfter.get(2)).toBe(500);
    });

    it('time before the first block is waiting with no block to own it', () => {
      const sp = timeSplit(0, 1000, steps([1, 200, 1000]));
      expect(sp.segments.map(x => [x.kind, x.seq])).toEqual([['wait', undefined], ['block', 1]]);
      expect(sp.waitMs).toBe(200);
      expect(sp.waitAfter.size).toBe(0);
    });

    it('clamps blocks into the run and never counts overlaps twice', () => {
      // starts before the run (clock skew), overlaps the next block, last one runs past the end
      const sp = timeSplit(1000, 1000, steps([1, 900, 1300], [2, 1200, 1500], [3, 1800, 2500]));
      expect(sp.segments.map(x => [x.kind, x.ms])).toEqual([['block', 300], ['block', 200], ['wait', 300], ['block', 200]]);
      expect(sp.blockMs + sp.waitMs).toBe(1000);
    });

    it('no split without a start or a span', () => {
      expect(timeSplit(NaN, 1000, [])).toBeNull();
      expect(timeSplit(0, 0, [])).toBeNull();
    });

    it('a row: the block share from the left, then the wait after it', () => {
      const sp = timeSplit(0, 1000, steps([1, 0, 100], [2, 400, 500]));
      expect(rowBar(sp, 1, 100)).toEqual({ width: 10, waitLeft: 10, waitWidth: 30, waitMs: 300 });
      // a 0 ms block keeps a visible sliver; the wait is cut so both fit the track
      const sp2 = timeSplit(0, 1000, steps([1, 0, 0]));
      expect(rowBar(sp2, 1, 0)).toEqual({ width: MIN_BAR_PCT, waitLeft: MIN_BAR_PCT, waitWidth: 100 - MIN_BAR_PCT, waitMs: 1000 });
    });

    it('the strip shows where a waiting run spends its time', fakeAsync(() => {
      // 20 s in blocks, then waiting: 10 % in blocks, 90 % waiting
      setup(detail('completed', [], { execution: { duration_ms: 200000 }, steps: [step(1, 0, 10000), step(2, 10000, 10000)] }));
      const segs = Array.from(el().querySelectorAll('.tl-split-bar .tl-seg')) as HTMLElement[];
      expect(segs.length).toBe(3);
      expect(segs[2].classList).toContain('tl-seg-wait');
      expect(segs[2].style.left).toBe('10%');
      expect(segs[2].style.width).toBe('90%');
      expect(el().querySelector('.tl-split-blocks').textContent).toContain('20.0 s');
      expect(el().querySelector('.tl-split-blocks').textContent).toContain('10%');
      expect(el().querySelector('.tl-split-wait').textContent).toContain('90%');
      // each row: its block from the left, the last one followed by the wait
      const bars = Array.from(el().querySelectorAll('.tl-step .tl-bar')) as HTMLElement[];
      expect(bars.map(b => [b.style.left, b.style.width])).toEqual([['0%', '5%'], ['0%', '5%']]);
      const waits = Array.from(el().querySelectorAll('.tl-step .tl-bar-wait')) as HTMLElement[];
      expect(waits.length).toBe(1);
      expect(waits[0].style.left).toBe('5%');
      expect(waits[0].style.width).toBe('90%');
      expect(el().querySelectorAll('.tl-step .tl-wait-dur')[1].textContent).toContain('3 m');
      end();
    }));

    it('a running execution: the open block grows up to now', fakeAsync(() => {
      setup(detail('running', [], { execution: { duration_ms: 500 }, steps: [step(1, 0, 1000), step(2, 2000, null)] }));
      spyOn(component, 'now').and.returnValue(Date.parse(START) + 4000);
      fixture.detectChanges();
      const bars = Array.from(el().querySelectorAll('.tl-step .tl-bar')) as HTMLElement[];
      expect(bars[0].style.width).toBe('25%');
      expect(bars[1].style.width).toBe('50%');
      expect(bars[1].classList).toContain('o-running');
      end();
    }));

    it('no strip and no bar when the execution has no start', fakeAsync(() => {
      setup(detail('completed', [], { execution: { started_at: null } }));
      expect(el().querySelector('.tl-split')).toBeNull();
      expect(el().querySelectorAll('.tl-step .tl-bar').length).toBe(0);
      expect(el().querySelectorAll('.tl-step .tl-dur').length).toBe(2);
      end();
    }));
  });

  describe('header facts', () => {
    const fact = (label: string) => {
      const cell = Array.from(el().querySelectorAll('.ex-fact')).find(f => f.querySelector('dt').textContent.trim() === label);
      return cell ? cell.querySelector('dd').textContent.replace(/\s+/g, ' ').trim() : null;
    };

    it('the labelled grid: trigger, version, execution id, started, conversation (the agent is the title)', fakeAsync(() => {
      setup(detail('completed', [], { execution: { conversation_link: 'support-group-p1-r1', ended_at: at(2000) } }));
      expect(fact('Agent')).toBeNull();
      expect(el().querySelector('.ex-title').textContent).toContain('Nightly checks');
      expect(fact('Trigger')).toBe(EN.Executions.Triggers.scheduled);
      expect(fact('version')).toContain('…e7f60123');
      expect(fact('Execution ID')).toContain('00000001');
      expect(fact('Started')).toContain('09 Nov 2026');
      expect(fact('Conversation')).toContain('conversation');
      // the subtitle: trigger · ended time · conversation
      const sub = el().querySelector('.ex-subtitle').textContent.replace(/\s+/g, ' ');
      expect(sub).toContain(EN.Executions.Triggers.scheduled);
      expect(sub).toContain('ended');
      (el().querySelector('.ex-conversation') as HTMLButtonElement).click();
      expect(router.navigate).toHaveBeenCalledWith(['/project', 'p1', 'wsrequest', 'support-group-p1-r1', 'messages']);
      end();
    }));

    it('a running one says started in the subtitle; no conversation is said in both places', fakeAsync(() => {
      setup(detail('running'));
      const sub = el().querySelector('.ex-subtitle').textContent;
      expect(sub).toContain('started');
      expect(sub).toContain(EN.Executions.Detail.NoConversation);
      expect(fact('Conversation')).toBe(EN.Executions.Detail.NoConversation);
      end();
    }));

    it('stop facts, messages while stopped and lineage are cells of the grid', fakeAsync(() => {
      setup(detail('stopped', [], {
        execution: {
          stop_mode: 'soft', stopped_at: at(1500), messages_while_stopped: 2,
          interrupted_action: { index: 0, action_id: 'x', type: 'webrequestv2', title: 'GET status' },
        },
        lineage: { previous: '0193a2f4-0000-7000-8000-0000000000aa', parent: '0193a2f4-0000-7000-8000-0000000000bb' },
      }));
      const stop = fact('Pause');
      expect(stop).toContain('pause after the current action');
      expect(stop).toContain('09 Nov');
      expect(stop).toContain('interrupted "GET status"');
      expect(fact('Messages')).toBe('2 messages received while paused');
      expect(fact('previous')).toContain('000000aa');
      expect(fact('parent')).toContain('000000bb');
      expect(el().querySelectorAll('.ex-head .ex-fact.ex-lineage').length).toBe(2);
      end();
    }));

    it('a short version is shown whole; no version is a dash without a copy button', fakeAsync(() => {
      setup(detail('completed', [], { execution: { agent_version: 'v12' } }));
      expect(el().querySelector('.ex-version').textContent.trim()).toBe('v12');
      fixture.destroy();
      TestBed.resetTestingModule();
      setup(detail('completed', [], { execution: { agent_version: null } }));
      expect(fact('version')).toBe('—');
      expect(el().querySelector('.ex-copy-version')).toBeNull();
      end();
    }));
  });

  describe('timeline table', () => {
    it('has the column headers and an outcome badge per block', fakeAsync(() => {
      setup(detail('completed', [], { steps: [step(1, 0, 400), step(2, 500, 500, { outcome: 'error' })] }));
      const cols = Array.from(el().querySelectorAll('.tl-cols span')).map(s => s.textContent.trim()).filter(Boolean);
      expect(cols).toEqual(['Time', 'Block', 'Outcome', 'Attributes', 'Duration']);
      const badges = Array.from(el().querySelectorAll('.tl-step .tl-outcome'));
      expect(badges.map(b => b.textContent.trim())).toEqual([EN.Executions.Outcomes.success, EN.Executions.Outcomes.error]);
      expect(badges[1].classList).toContain('o-error');
      // the filter sits in the tabs bar
      expect(el().querySelector('.ex-tabs-bar .tl-filter-failed')).not.toBeNull();
      end();
    }));
  });
});
