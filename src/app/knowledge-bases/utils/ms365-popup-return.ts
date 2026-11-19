import { KbSourceProviderId, Ms365ConnectResult } from 'app/models/kb-sources.model';

/** Same-origin channel the sign-in popup uses to hand its result to the main dashboard window. */
export const MS365_CONNECT_CHANNEL = 'tiledesk-ms365-connect';

export interface Ms365RelayedResult {
  type: 'ms365-connect';
  status: 'connected' | 'error';
  reason?: string;
  connection_id?: string;
  provider: KbSourceProviderId;
}

/** Known provider id, or undefined. */
export function asProvider(v: any): KbSourceProviderId | undefined {
  return v === 'microsoft365' || v === 'googledrive' ? v : undefined;
}

/** Validates a relayed message; returns the connect result or null. */
export function parseMs365Relayed(data: any): Ms365ConnectResult | null {
  if (!data || data.type !== 'ms365-connect' || (data.status !== 'connected' && data.status !== 'error')) { return null; }
  return {
    status: data.status,
    reason: typeof data.reason === 'string' && data.reason ? data.reason : undefined,
    connection_id: typeof data.connection_id === 'string' && data.connection_id ? data.connection_id : undefined,
    provider: asProvider(data.provider) || 'microsoft365',
  };
}

/**
 * Reads ?kbsrc=...&kbsrc_popup=1&provider=... (or the legacy ?ms365=...&ms365_popup=1, provider
 * microsoft365) from the hash route (or the query string).
 */
export function readMs365PopupReturn(loc: { hash: string; search: string }): Ms365RelayedResult | null {
  const hash = loc.hash || '';
  const q = hash.indexOf('?') >= 0 ? hash.slice(hash.indexOf('?') + 1) : (loc.search || '').replace(/^\?/, '');
  const p = new URLSearchParams(q);
  const generic = p.get('kbsrc_popup') === '1';
  if (!generic && p.get('ms365_popup') !== '1') { return null; }
  const status = generic ? p.get('kbsrc') : p.get('ms365');
  if (status !== 'connected' && status !== 'error') { return null; }
  const provider = generic ? (asProvider(p.get('provider')) || 'microsoft365') : 'microsoft365';
  const msg: Ms365RelayedResult = { type: 'ms365-connect', status, provider };
  if (p.get('reason')) { msg.reason = p.get('reason'); }
  if (p.get('connection_id')) { msg.connection_id = p.get('connection_id'); }
  return msg;
}

/**
 * Runs before the app boots. The provider sign-in pages may cut window.opener
 * (Cross-Origin-Opener-Policy), so the server sends the popup back here with kbsrc_popup=1:
 * relay the result to the main window on a BroadcastChannel and close the popup.
 * Returns true when this window is such a popup (the app must not boot in it).
 */
export function relayMs365PopupReturn(win: Window): boolean {
  const msg = readMs365PopupReturn(win.location);
  if (!msg) { return false; }
  try {
    const ch = new BroadcastChannel(MS365_CONNECT_CHANNEL);
    ch.postMessage(msg);
    ch.close();
  } catch (e) { /* no BroadcastChannel: the main window can still be refreshed by hand */ }
  win.close();
  // close() refused: leave a plain note instead of booting a second dashboard in the popup
  const doc = win.document;
  if (doc && doc.body) {
    doc.body.innerHTML = '';
    const p = doc.createElement('p');
    p.style.cssText = 'font-family:sans-serif;margin:40px;text-align:center';
    const name = msg.provider === 'googledrive' ? 'Google Drive' : 'Microsoft 365';
    p.textContent = msg.status === 'connected'
      ? name + ' connected. You can close this window.'
      : name + ' sign-in failed. You can close this window and try again.';
    doc.body.appendChild(p);
  }
  return true;
}
