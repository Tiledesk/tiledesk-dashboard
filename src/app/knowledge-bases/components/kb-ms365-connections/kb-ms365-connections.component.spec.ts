import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError, Subject } from 'rxjs';
import Swal from 'sweetalert2';

import { KbMs365ConnectionsComponent } from './kb-ms365-connections.component';
import { KbSourcesService } from 'app/services/kb-sources.service';
import { NotifyService } from 'app/core/notify.service';

const conn = (over: any = {}) => ({
  _id: 'c1', provider: 'microsoft365', account: { display_name: 'Ann', upn: 'ann@x.com', tenant_id: 't' },
  created_by: { id: 'u1', name: 'Bob' }, status: 'connected', folders_count: 2, files_count: 10, ...over,
});

describe('KbMs365ConnectionsComponent', () => {
  let fixture: ComponentFixture<KbMs365ConnectionsComponent>;
  let component: KbMs365ConnectionsComponent;
  let kbSources: jasmine.SpyObj<KbSourcesService>;
  let notify: jasmine.SpyObj<NotifyService>;
  let fire: jasmine.Spy;
  let relay$: Subject<any>;

  function setup(list: any[]) {
    kbSources = jasmine.createSpyObj('KbSourcesService', ['getConnections', 'deleteConnection', 'connect']);
    kbSources.getConnections.and.returnValue(of(list));
    relay$ = new Subject<any>();
    (kbSources as any).relayedConnectResults$ = relay$;
    notify = jasmine.createSpyObj('NotifyService', ['showWidgetStyleUpdateNotification']);
    TestBed.configureTestingModule({
      declarations: [KbMs365ConnectionsComponent],
      imports: [TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: KbSourcesService, useValue: kbSources }, { provide: NotifyService, useValue: notify }],
    });
    fixture = TestBed.createComponent(KbMs365ConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }
  const text = () => fixture.nativeElement.textContent;

  beforeEach(() => { fire = spyOn(Swal, 'fire'); });

  it('a relayed connected result reloads the accounts and emits changed; errors are ignored', () => {
    setup([conn()]);
    const changed = spyOn(component.changed, 'emit');
    relay$.next({ status: 'error', reason: 'access_denied' });
    expect(kbSources.getConnections).toHaveBeenCalledTimes(1);
    relay$.next({ status: 'connected', connection_id: 'c1' });
    expect(kbSources.getConnections).toHaveBeenCalledTimes(2);
    expect(changed).toHaveBeenCalledWith({ cascade: false });
    fixture.destroy();
    expect(relay$.observers.length).toBe(0);
  });

  it('renders account, connected by and counts', () => {
    setup([conn()]);
    expect(text()).toContain('Ann');
    expect(text()).toContain('ann@x.com');
    expect(text()).toContain('KbPage.Ms365ConnectedBy');
    expect(text()).toContain('KbPage.Ms365FoldersCount');
    expect(text()).toContain('KbPage.Ms365FilesCount');
  });

  it('uses the singular for exactly one folder or file', () => {
    setup([conn({ folders_count: 1, files_count: 1 })]);
    expect(text()).toContain('KbPage.Ms365FolderOne');
    expect(text()).toContain('KbPage.Ms365FileOne');
    expect(component.countKey(0, 'File')).toBe('KbPage.Ms365FilesCount');
    expect(component.countKey(undefined, 'Folder')).toBe('KbPage.Ms365FoldersCount');
  });

  it('flags needs_reconnect with the warning', () => {
    setup([conn({ status: 'needs_reconnect' })]);
    expect(fixture.nativeElement.querySelector('.ms365-conn-warning')).not.toBeNull();
  });

  it('Reconnect calls connect(id), reloads and emits', fakeAsync(() => {
    setup([conn()]);
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'connected' } as any));
    const emitted: any[] = [];
    component.changed.subscribe(v => emitted.push(v));
    component.reconnect(component.connections[0]);
    flushMicrotasks();
    expect(kbSources.connect).toHaveBeenCalledWith('microsoft365', 'c1');
    expect(kbSources.getConnections).toHaveBeenCalledTimes(2);
    expect(emitted).toEqual([{ cascade: false }]);
  }));

  it('Disconnect confirms, deletes without cascade and emits', fakeAsync(() => {
    setup([conn()]);
    fire.and.returnValue(Promise.resolve({ isConfirmed: true }));
    kbSources.deleteConnection.and.returnValue(of({}));
    const emitted: any[] = [];
    component.changed.subscribe(v => emitted.push(v));
    component.disconnect(component.connections[0]);
    flushMicrotasks();
    expect(kbSources.deleteConnection).toHaveBeenCalledWith('c1', false);
    expect(emitted).toEqual([{ cascade: false }]);
  }));

  it('cancelled confirmation does nothing', fakeAsync(() => {
    setup([conn()]);
    fire.and.returnValue(Promise.resolve({ isConfirmed: false }));
    component.disconnect(component.connections[0]);
    flushMicrotasks();
    expect(kbSources.deleteConnection).not.toHaveBeenCalled();
  }));

  it('409 in_use asks with n = folders + files and retries with cascade', fakeAsync(() => {
    setup([conn()]);
    fire.and.returnValue(Promise.resolve({ isConfirmed: true }));
    kbSources.deleteConnection.and.callFake((id: string, cascade = false) =>
      cascade ? of({ removed: 12 }) : throwError({ status: 409, error: { error: 'in_use', folders_count: 2, files_count: 10 } }));
    const emitted: any[] = [];
    component.changed.subscribe(v => emitted.push(v));
    component.disconnect(component.connections[0]);
    flushMicrotasks();
    expect(fire.calls.count()).toBe(2);
    expect(fire.calls.mostRecent().args[0].text).toContain('KbPage.Ms365DisconnectInUse');
    expect(kbSources.deleteConnection.calls.allArgs()).toEqual([['c1', false], ['c1', true]]);
    expect(emitted).toEqual([{ cascade: true }]);
  }));

  it('declining the cascade keeps the account', fakeAsync(() => {
    setup([conn()]);
    fire.and.returnValues(Promise.resolve({ isConfirmed: true }), Promise.resolve({ isConfirmed: false }));
    kbSources.deleteConnection.and.returnValue(throwError({ status: 409, error: { error: 'in_use', folders_count: 1, files_count: 0 } }));
    component.disconnect(component.connections[0]);
    flushMicrotasks();
    expect(kbSources.deleteConnection).toHaveBeenCalledTimes(1);
  }));

  it('409 remove_failed toasts the counts, keeps the row and tells the page', fakeAsync(() => {
    setup([conn()]);
    fire.and.returnValue(Promise.resolve({ isConfirmed: true }));
    kbSources.deleteConnection.and.callFake((id: string, cascade = false) =>
      cascade ? throwError({ status: 409, error: { error: 'remove_failed', failed: 3, removed: 4 } })
        : throwError({ status: 409, error: { error: 'in_use', folders_count: 1, files_count: 6 } }));
    const emitted: any[] = [];
    component.changed.subscribe(v => emitted.push(v));
    component.disconnect(component.connections[0]);
    flushMicrotasks();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toContain('KbPage.Ms365ErrRemoveFailed');
    expect(component.connections.length).toBe(1);
    expect(emitted).toEqual([{ cascade: true }]);
  }));

  it('Reconnect with blocked pop-ups asks and continues in this window', fakeAsync(() => {
    setup([conn()]);
    (kbSources as any).connectInWindow = jasmine.createSpy('connectInWindow').and.returnValue(Promise.resolve());
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'blocked' } as any));
    fire.and.returnValue(Promise.resolve({ isConfirmed: true }));
    component.reconnect(component.connections[0]);
    flushMicrotasks();
    expect(fire).toHaveBeenCalled();
    expect((kbSources as any).connectInWindow).toHaveBeenCalledWith('microsoft365', 'c1');
  }));

  it('Reconnect with blocked pop-ups and a declined confirm does nothing', fakeAsync(() => {
    setup([conn()]);
    (kbSources as any).connectInWindow = jasmine.createSpy('connectInWindow');
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'blocked' } as any));
    fire.and.returnValue(Promise.resolve({ isConfirmed: false }));
    component.reconnect(component.connections[0]);
    flushMicrotasks();
    expect((kbSources as any).connectInWindow).not.toHaveBeenCalled();
  }));

  it('a failing full-page sign-in toasts the connect error', fakeAsync(() => {
    setup([conn()]);
    (kbSources as any).connectInWindow = jasmine.createSpy('connectInWindow').and.returnValue(Promise.reject({ reason: 'connect_failed' }));
    kbSources.connect.and.returnValue(Promise.resolve({ status: 'blocked' } as any));
    fire.and.returnValue(Promise.resolve({ isConfirmed: true }));
    component.reconnect(component.connections[0]);
    flushMicrotasks();
    expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toBe('KbPage.Ms365ErrConnect');
  }));

  it('emits loaded with the accounts', () => {
    setup([conn(), conn({ _id: 'c2' })]);
    // loaded fired during the first load; a reload emits again
    const seen: any[] = [];
    component.loaded.subscribe(l => seen.push(l.length));
    component.load();
    expect(seen).toEqual([2]);
  });

  it('banner view shows only the accounts that need to sign in again', () => {
    setup([conn(), conn({ _id: 'c2', status: 'needs_reconnect', account: { display_name: 'Bo', upn: 'bo@x.com', tenant_id: 't' } })]);
    component.view = 'banner';
    fixture.detectChanges();
    const banners = fixture.nativeElement.querySelectorAll('.ms365-banner');
    expect(banners.length).toBe(1);
    expect(text()).toContain('KbPage.SourceReconnectBanner');
    expect(text()).not.toContain('KbPage.Ms365Disconnect');
  });

  describe('two providers', () => {
    const g = () => conn({ _id: 'g1', provider: 'googledrive', account: { display_name: 'Gus', upn: 'gus@gmail.com', tenant_id: 'google' } });

    it('groups the accounts by provider, one heading and icon each', () => {
      setup([g(), conn()]);
      const groups = fixture.nativeElement.querySelectorAll('.ms365-conn-group');
      expect(groups.length).toBe(2);
      expect(groups[0].textContent).toContain('KbPage.Ms365Card');
      expect(groups[0].textContent).toContain('Ann');
      expect(groups[1].textContent).toContain('KbPage.GdriveCard');
      expect(groups[1].textContent).toContain('Gus');
      expect(groups[1].querySelector('.ms365-conn-group-icon').textContent).toContain('add_to_drive');
    });

    it('a provider without accounts has no group', () => {
      setup([g()]);
      expect(fixture.nativeElement.querySelectorAll('.ms365-conn-group').length).toBe(1);
    });

    it('Reconnect on a Google account calls connect(googledrive, id)', fakeAsync(() => {
      setup([g()]);
      kbSources.connect.and.returnValue(Promise.resolve({ status: 'connected' } as any));
      component.reconnect(component.connections[0]);
      flushMicrotasks();
      expect(kbSources.connect).toHaveBeenCalledWith('googledrive', 'g1');
    }));

    it('the banner of a Google account names Google Drive, not Microsoft', () => {
      setup([g()]);
      component.connections[0].status = 'needs_reconnect';
      component.view = 'banner';
      fixture.detectChanges();
      expect(component.providerLabelKey(component.connections[0])).toBe('KbPage.GdriveCard');
      expect(text()).toContain('KbPage.SourceReconnectBanner');
    });

    it('provider-specific texts follow the account provider', fakeAsync(() => {
      setup([g()]);
      fire.and.returnValue(Promise.resolve({ isConfirmed: false }));
      component.disconnect(component.connections[0]);
      flushMicrotasks();
      expect(fire.calls.mostRecent().args[0].text).toBe('KbPage.GdriveDisconnectConfirm');
      kbSources.connect.and.returnValue(Promise.reject({}));
      component.reconnect(component.connections[0]);
      flushMicrotasks();
      expect(notify.showWidgetStyleUpdateNotification.calls.mostRecent().args[0]).toBe('KbPage.GdriveErrConnect');
    }));
  });
});
