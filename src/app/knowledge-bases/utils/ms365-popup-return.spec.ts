import { readMs365PopupReturn, relayMs365PopupReturn, parseMs365Relayed, MS365_CONNECT_CHANNEL } from './ms365-popup-return';

describe('ms365-popup-return', () => {
  it('reads the popup return from the hash route', () => {
    expect(readMs365PopupReturn({ hash: '#/project/p/knowledge-bases/ns?ms365=connected&reason=&connection_id=c1&ms365_popup=1', search: '' }))
      .toEqual({ type: 'ms365-connect', status: 'connected', connection_id: 'c1', provider: 'microsoft365' });
    expect(readMs365PopupReturn({ hash: '#/x?ms365=error&reason=access_denied&ms365_popup=1', search: '' }))
      .toEqual({ type: 'ms365-connect', status: 'error', reason: 'access_denied', provider: 'microsoft365' });
  });

  it('reads the generic kbsrc return with its provider', () => {
    expect(readMs365PopupReturn({ hash: '#/x?kbsrc=connected&connection_id=c1&provider=googledrive&kbsrc_popup=1', search: '' }))
      .toEqual({ type: 'ms365-connect', status: 'connected', connection_id: 'c1', provider: 'googledrive' });
    expect(readMs365PopupReturn({ hash: '#/x?kbsrc=error&reason=scope_missing&kbsrc_popup=1', search: '' }))
      .toEqual({ type: 'ms365-connect', status: 'error', reason: 'scope_missing', provider: 'microsoft365' });
    expect(readMs365PopupReturn({ hash: '#/x?kbsrc=connected&provider=googledrive', search: '' })).toBeNull();
  });

  it('reads the query string when there is no hash route', () => {
    expect(readMs365PopupReturn({ hash: '', search: '?ms365=connected&ms365_popup=1' }))
      .toEqual({ type: 'ms365-connect', status: 'connected', provider: 'microsoft365' });
  });

  it('ignores a full-page return (no ms365_popup) and bad statuses', () => {
    expect(readMs365PopupReturn({ hash: '#/x?ms365=connected', search: '' })).toBeNull();
    expect(readMs365PopupReturn({ hash: '#/x?ms365=closed&ms365_popup=1', search: '' })).toBeNull();
    expect(readMs365PopupReturn({ hash: '#/x', search: '' })).toBeNull();
  });

  it('parseMs365Relayed keeps only valid fields', () => {
    expect(parseMs365Relayed({ type: 'ms365-connect', status: 'connected', connection_id: 'c', reason: 5, provider: 'googledrive' }))
      .toEqual({ status: 'connected', reason: undefined, connection_id: 'c', provider: 'googledrive' });
    expect(parseMs365Relayed({ type: 'ms365-connect', status: 'blocked' })).toBeNull();
  });

  it('relays on the channel, closes the window and returns true', (done) => {
    const listener = new BroadcastChannel(MS365_CONNECT_CHANNEL);
    listener.onmessage = (e) => {
      expect(e.data).toEqual({ type: 'ms365-connect', status: 'connected', connection_id: 'c1', provider: 'microsoft365' });
      listener.close();
      done();
    };
    const body = document.createElement('div');
    const win: any = {
      location: { hash: '#/x?ms365=connected&connection_id=c1&ms365_popup=1', search: '' },
      close: jasmine.createSpy('close'),
      document: { body, createElement: (t: string) => document.createElement(t) },
    };
    expect(relayMs365PopupReturn(win)).toBe(true);
    expect(win.close).toHaveBeenCalled();
    expect(body.textContent).toContain('connected');
  });

  it('returns false and does nothing on a normal page', () => {
    const win: any = { location: { hash: '#/project/p/home', search: '' }, close: jasmine.createSpy('close') };
    expect(relayMs365PopupReturn(win)).toBe(false);
    expect(win.close).not.toHaveBeenCalled();
  });
});
