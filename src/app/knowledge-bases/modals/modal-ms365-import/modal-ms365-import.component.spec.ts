import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ModalMs365ImportComponent } from './modal-ms365-import.component';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { BrandService } from 'app/services/brand.service';

const activeConn = { _id: 'c1', provider: 'microsoft365', account: { display_name: 'Ann', upn: 'ann@x.com', tenant_id: 't' },
  created_by: { id: 'u', name: 'Bob' }, status: 'active', folders_count: 0 };
const staleConn = { ...activeConn, _id: 'c2', status: 'needs_reconnect' };

describe('ModalMs365ImportComponent', () => {
  let component: ModalMs365ImportComponent;
  let fixture: ComponentFixture<ModalMs365ImportComponent>;
  let svc: jasmine.SpyObj<KbSourcesService>;
  let dialogRef: { close: jasmine.Spy };
  let onPlanLimit: jasmine.Spy;

  function setup(conns: any[], dataOverride: any = {}, render = false) {
    svc = jasmine.createSpyObj('KbSourcesService',
      ['getConnections', 'connect', 'cancelConnect', 'getRoots', 'getDrives', 'getChildren', 'importItems']);
    svc.getConnections.and.returnValue(of(conns));
    svc.getRoots.and.returnValue(of({ items: [
      { kind: 'onedrive', id: 'me', name: 'My OneDrive', drive_id: 'd-me' },
      { kind: 'site', id: 's1', name: 'Team Site' }] }));
    svc.getDrives.and.returnValue(of({ items: [{ kind: 'drive', id: 'd-s1', name: 'Documents' }] }));
    svc.getChildren.and.returnValue(of({ items: [
      { kind: 'folder', id: 'f1', name: 'Folder', size: 0, supported: true },
      { kind: 'file', id: 'x1', name: 'a.pdf', size: 10, supported: true },
      { kind: 'file', id: 'x2', name: 'a.exe', size: 10, supported: false, reason: 'unsupported_type' }] }));
    dialogRef = { close: jasmine.createSpy('close') };
    onPlanLimit = jasmine.createSpy('onPlanLimit');
    TestBed.configureTestingModule({
      declarations: [ModalMs365ImportComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { namespace: 'ns1', refreshRateIsEnabled: true,
            isAvailableRefreshRateFeature: true, payIsVisible: true, kbMaxFileSize: 50 * 1048576, onPlanLimit, ...dataOverride } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: KbSourcesService, useValue: svc },
        { provide: LoggerService, useValue: { log: () => {}, error: () => {}, warn: () => {} } },
        { provide: BrandService, useValue: { getBrand: () => ({ DOCS: false, CONTACT_SALES_EMAIL: 'a@b.c' }) } },
      ]
    });
    if (!render) {
      TestBed.overrideComponent(ModalMs365ImportComponent, { set: { template: '', templateUrl: undefined } });
    }
    fixture = TestBed.createComponent(ModalMs365ImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function text(): string { return fixture.nativeElement.textContent; }

  it('with no connections shows Connect', () => {
    setup([], {}, true);
    expect(component.step).toBe('account');
    expect(text()).toContain('KbPage.Ms365Connect');
    expect(text()).not.toContain('KbPage.Ms365ConnectAnother');
  });

  it('with connections offers Connect another account', () => {
    setup([activeConn], {}, true);
    expect(text()).toContain('KbPage.Ms365ConnectAnother');
  });

  it('a blocked popup shows "Open sign-in again"', fakeAsync(() => {
    setup([], {}, true);
    svc.connect.and.returnValue(Promise.resolve({ status: 'blocked' }));
    component.startConnect();
    expect(component.connectState).toBe('waiting');
    flush();
    fixture.detectChanges();
    expect(component.connectState).toBe('retry');
    expect(text()).toContain('KbPage.Ms365OpenAgain');
  }));

  it('waiting shows the waiting text and Cancel ignores the later result', fakeAsync(() => {
    setup([]);
    let resolve: any;
    svc.connect.and.returnValue(new Promise(r => resolve = r));
    component.startConnect();
    component.cancelConnect();
    expect(svc.cancelConnect).toHaveBeenCalled();
    expect(component.connectState).toBe('idle');
    resolve({ status: 'connected', connection_id: 'c1' });
    flush();
    expect(component.step).toBe('account');
  }));

  it('connected reloads the connections and opens the browser of the new account', fakeAsync(() => {
    setup([]);
    svc.getConnections.and.returnValue(of([activeConn]));
    svc.connect.and.returnValue(Promise.resolve({ status: 'connected', connection_id: 'c1' }));
    component.startConnect();
    flush();
    expect(svc.getConnections).toHaveBeenCalledTimes(2);
    expect(component.step).toBe('browse');
    expect(svc.getRoots).toHaveBeenCalledWith('c1');
  }));

  it('account_mismatch shows the expected upn; access_denied and others have their own text', fakeAsync(() => {
    setup([staleConn]);
    svc.connect.and.returnValue(Promise.resolve({ status: 'error', reason: 'account_mismatch' }));
    component.startConnect('c2');
    flush();
    expect(component.connectError).toEqual({ key: 'KbPage.Ms365AccountMismatch', params: { upn: 'ann@x.com' } });
    svc.connect.and.returnValue(Promise.resolve({ status: 'error', reason: 'state_invalid' }));
    component.startConnect('c2');
    flush();
    expect(component.connectError.key).toBe('KbPage.Ms365ErrConnect');
    expect(component.connectState).toBe('retry');
    svc.connect.and.returnValue(Promise.resolve({ status: 'error', reason: 'access_denied' }));
    component.startConnect('c2');
    flush();
    expect(component.connectError.key).toBe('KbPage.Ms365ErrAccessDenied');
  }));

  it('choosing a needs_reconnect connection shows Reconnect and does not call getRoots', () => {
    setup([staleConn], {}, true);
    component.chooseConnection(staleConn as any);
    fixture.detectChanges();
    expect(svc.getRoots).not.toHaveBeenCalled();
    expect(component.step).toBe('account');
    expect(text()).toContain('KbPage.Ms365Reconnect');
    expect(text()).toContain('KbPage.Ms365NeedsReconnect');
  });

  it('a 409 connection_needs_reconnect while browsing shows the reconnect prompt', () => {
    setup([activeConn]);
    svc.getRoots.and.returnValue(throwError(({ status: 409, error: { success: false, error: 'connection_needs_reconnect' } })));
    component.chooseConnection(activeConn as any);
    expect(component.browseError).toBe('needs_reconnect');
  });

  it('browse errors map to one message per class', () => {
    setup([activeConn]);
    const cases: [number, string, string][] = [
      [404, 'folder_not_found', 'KbPage.Ms365ErrNotFound'],
      [403, 'graph_forbidden', 'KbPage.Ms365ErrForbidden'],
      [503, 'connection_busy', 'KbPage.Ms365ErrBusy'],
      [502, 'graph_error', 'KbPage.Ms365ErrBrowse'],
      [400, 'invalid_page_token', 'KbPage.Ms365ErrBrowse'],
    ];
    for (const [status, code, key] of cases) {
      svc.getRoots.and.returnValue(throwError(({ status, error: { success: false, error: code } })));
      component.chooseConnection(activeConn as any);
      expect(component.browseError).toBe(key);
    }
  });

  it('navigates roots -> site -> drive -> folder with a breadcrumb', () => {
    setup([activeConn]);
    component.chooseConnection(activeConn as any);
    expect(component.items.length).toBe(2);
    component.openItem(component.items[1]); // site
    expect(svc.getDrives).toHaveBeenCalledWith('c1', 's1');
    component.openItem(component.items[0]); // drive
    expect(svc.getChildren).toHaveBeenCalledWith('c1', 'd-s1', undefined, undefined);
    component.openItem(component.items[0]); // folder f1
    expect(svc.getChildren).toHaveBeenCalledWith('c1', 'd-s1', 'f1', undefined);
    expect(component.crumbs.map(c => c.label)).toEqual(['KbPage.Ms365Locations', 'Team Site', 'Documents', 'Folder']);
    component.goToCrumb(1);
    expect(svc.getDrives).toHaveBeenCalledTimes(2);
    expect(component.crumbs.length).toBe(2);
  });

  it('OneDrive opens its drive directly', () => {
    setup([activeConn]);
    component.chooseConnection(activeConn as any);
    component.openItem(component.items[0]);
    expect(svc.getChildren).toHaveBeenCalledWith('c1', 'd-me', undefined, undefined);
  });

  it('Load more appends the next page', () => {
    setup([activeConn]);
    svc.getChildren.and.returnValues(
      of({ items: [{ kind: 'file', id: 'a', name: 'a.pdf', supported: true }], next_page: 'tok' }),
      of({ items: [{ kind: 'file', id: 'b', name: 'b.pdf', supported: true }] }));
    component.chooseConnection(activeConn as any);
    component.openItem(component.items[0]);
    expect(component.nextPage).toBe('tok');
    component.loadMore();
    expect(svc.getChildren).toHaveBeenCalledWith('c1', 'd-me', undefined, 'tok');
    expect(component.items.map(i => i.id)).toEqual(['a', 'b']);
    expect(component.nextPage).toBeUndefined();
  });

  it('unsupported rows cannot be selected and report their reason', () => {
    setup([activeConn]);
    component.chooseConnection(activeConn as any);
    component.openItem(component.items[0]);
    const exe = component.items[2];
    component.toggleItem(exe);
    expect(component.selectedCount).toBe(0);
    expect(component.reasonKey(exe)).toBe('KbPage.Ms365Unsupported');
    expect(component.reasonKey({ ...exe, reason: 'too_large' } as any)).toBe('KbPage.Ms365TooLarge');
    expect(component.maxFileSizeMb).toBe(50);
  });

  it('caps the selection at 50 items', () => {
    setup([activeConn]);
    component.chooseConnection(activeConn as any);
    component.openItem(component.items[0]);
    for (let i = 0; i < 51; i++) {
      component.toggleItem({ kind: 'file', id: 'i' + i, name: 'n', supported: true } as any);
    }
    expect(component.selectedCount).toBe(50);
    expect(component.selectionLimitReached).toBe(true);
  });

  function pickAndGoToOptions(underSite: boolean) {
    component.chooseConnection(activeConn as any);
    component.openItem(component.items[underSite ? 1 : 0]);
    if (underSite) { component.openItem(component.items[0]); }
    component.toggleItem(component.items[0]); // folder f1
    component.toggleItem(component.items[1]); // file x1
    component.goToOptions();
  }

  it('Import sends namespace, connection, items (site_name under a site), refresh_rate and tags', () => {
    setup([activeConn]);
    pickAndGoToOptions(true);
    expect(component.step).toBe('options');
    component.selectedRefreshRate = 'weekly';
    component.kbTag = ' hr ';
    component.addsKbTag();
    svc.importItems.and.returnValue(of({ contents: [{ _id: 'k1', type: 'ms365_folder', name: 'Folder' }] }));
    component.onImport();
    expect(svc.importItems).toHaveBeenCalledWith({
      namespace: 'ns1', connection_id: 'c1',
      items: [
        { drive_id: 'd-s1', item_id: 'f1', kind: 'folder', site_name: 'Team Site' },
        { drive_id: 'd-s1', item_id: 'x1', kind: 'file', site_name: 'Team Site' }],
      refresh_rate: 'weekly', tags: ['hr']
    });
    expect(dialogRef.close).toHaveBeenCalledWith({ contents: [{ _id: 'k1', type: 'ms365_folder', name: 'Folder' }] });
  });

  it('site_name is capped at 200 characters', () => {
    setup([activeConn]);
    svc.getRoots.and.returnValue(of({ items: [
      { kind: 'onedrive', id: 'me', name: 'My OneDrive', drive_id: 'd-me' },
      { kind: 'site', id: 's1', name: 'x'.repeat(250) }] }));
    pickAndGoToOptions(true);
    svc.importItems.and.returnValue(of({ contents: [] }));
    component.onImport();
    const req: any = svc.importItems.calls.mostRecent().args[0];
    expect(req.items[0].site_name).toBe('x'.repeat(200));
  });

  it('destroying the modal while connect is pending closes the popup', () => {
    setup([]);
    svc.connect.and.returnValue(new Promise(() => {}));
    component.startConnect();
    fixture.destroy();
    expect(svc.cancelConnect).toHaveBeenCalled();
  });

  it('OneDrive items carry no site_name', () => {
    setup([activeConn]);
    pickAndGoToOptions(false);
    svc.importItems.and.returnValue(of({ contents: [] }));
    component.onImport();
    const req = svc.importItems.calls.mostRecent().args[0];
    expect(req.items.every(i => !('site_name' in i))).toBe(true);
    expect(req.items[0].drive_id).toBe('d-me');
  });

  it('plan_limit calls the plan-limit handler and keeps the modal open', () => {
    setup([activeConn]);
    pickAndGoToOptions(false);
    svc.importItems.and.returnValue(throwError(({ status: 400, error: { success: false, error: 'plan_limit', plan_limit: 200, count: 210 } })));
    component.onImport();
    expect(onPlanLimit).toHaveBeenCalledWith(200);
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.importing).toBe(false);
    expect(component.importError).toBeNull();
  });

  it('inline import errors', () => {
    setup([activeConn]);
    pickAndGoToOptions(false);
    const cases: [number, any, string, any][] = [
      [409, { error: 'already_imported' }, 'KbPage.Ms365ErrAlreadyImported', undefined],
      [409, { error: 'owned_by_other_folder' }, 'KbPage.Ms365ErrOwnedByOther', undefined],
      [400, { error: 'too_many_files', limit: 5000 }, 'KbPage.Ms365ErrTooManyFiles', { limit: 5000 }],
      [400, { error: 'refresh_not_available' }, 'KbPage.Ms365ErrRefreshNotAvailable', undefined],
      [400, { error: 'invalid_request' }, 'KbPage.Ms365ErrImport', undefined],
    ];
    for (const [status, body, key, params] of cases) {
      svc.importItems.and.returnValue(throwError(({ status, error: { success: false, ...body } })));
      component.onImport();
      expect(component.importError.key).toBe(key);
      if (params) { expect(component.importError.params).toEqual(params); }
    }
  });

  it('409 connection_needs_reconnect on import goes back to the reconnect prompt', () => {
    setup([activeConn]);
    pickAndGoToOptions(false);
    svc.importItems.and.returnValue(throwError(({ status: 409, error: { success: false, error: 'connection_needs_reconnect' } })));
    component.onImport();
    expect(component.step).toBe('account');
    expect(component.reconnectTarget._id).toBe('c1');
  });

  it('without the refresh feature only "never" is offered and sent', () => {
    setup([activeConn], { refreshRateIsEnabled: false, isAvailableRefreshRateFeature: false });
    expect(component.refreshRates.map(r => r.value)).toEqual(['never']);
    pickAndGoToOptions(false);
    svc.importItems.and.returnValue(of({ contents: [] }));
    component.onImport();
    expect(svc.importItems.calls.mostRecent().args[0].refresh_rate).toBe('never');
  });

  it('with the refresh feature the rates are never/daily/weekly/monthly', () => {
    setup([activeConn]);
    expect(component.refreshRates.map(r => r.value)).toEqual(['never', 'daily', 'weekly', 'monthly']);
  });

  it('a blocked popup also offers "Continue in this window", which uses the full-page sign-in', fakeAsync(() => {
    setup([], {}, true);
    (svc as any).connectInWindow = jasmine.createSpy('connectInWindow').and.returnValue(Promise.resolve());
    svc.connect.and.returnValue(Promise.resolve({ status: 'blocked' }));
    component.startConnect('c9');
    flush();
    fixture.detectChanges();
    expect(text()).toContain('KbPage.Ms365ContinueHere');
    component.continueInWindow(component.lastConnectionId);
    expect((svc as any).connectInWindow).toHaveBeenCalledWith('c9');
  }));

  it('"Continue in this window" is not offered when the user closed the popup', fakeAsync(() => {
    setup([], {}, true);
    svc.connect.and.returnValue(Promise.resolve({ status: 'closed' }));
    component.startConnect();
    flush();
    fixture.detectChanges();
    expect(text()).not.toContain('KbPage.Ms365ContinueHere');
  }));

  it('a failing full-page sign-in shows the generic connect error', fakeAsync(() => {
    setup([], {});
    (svc as any).connectInWindow = jasmine.createSpy('connectInWindow').and.returnValue(Promise.reject({ reason: 'connect_failed' }));
    component.continueInWindow();
    flush();
    expect(component.connectError).toEqual({ key: 'KbPage.Ms365ErrConnect' });
    expect(component.connectState).toBe('retry');
  }));

  it('initialConnectionId opens the browser of that account', () => {
    setup([activeConn], { initialConnectionId: 'c1' });
    expect(component.step).toBe('browse');
    expect(component.connection._id).toBe('c1');
    expect(svc.getRoots).toHaveBeenCalledWith('c1');
  });

});
