import {
  buildConnectorTiles, canActOnConnector, CONNECTOR_ADD_TILE, CONNECTOR_ITEM_KEY_PREFIX, connectorIdFromKey, connectorPermissions,
  CATEGORIES_LIST, HUB_ERROR_KEYS, hubErrorKey, hubErrorMessage, hubErrorTextKey, INTEGRATIONS_CATEGORIES, isSafeAuthUrl, registryScopeOf
} from './utils';
import { HubConnector, HubMe } from 'app/services/connector-hub.service';

describe('integrations utils (connector hub)', () => {
  const connector = (o: Partial<HubConnector>): HubConnector =>
    ({ id: 'google-services', name: 'Google', version: '1.0.0', description: '', icon: 'https://x/g.svg', owner: 'global', status: 'active', ...o });
  const me = (o: Partial<HubMe>): HubMe =>
    ({ role: 'owner', manager: false, hub_admin: false, project_connectors_enabled: false, ...o });

  describe('buildConnectorTiles', () => {
    it('returns no tiles for an empty list when the user cannot register', () => {
      expect(buildConnectorTiles([], false, CONNECTOR_ADD_TILE)).toEqual([]);
    });

    it('builds one tile per connector keyed by id, with icon fallback and no plan lock', () => {
      const tiles = buildConnectorTiles(
        [connector({}), connector({ id: 'microsoft', name: 'Microsoft', icon: '' })], false, CONNECTOR_ADD_TILE);
      expect(tiles.length).toBe(2);
      expect(tiles[0].key).toBe(CONNECTOR_ITEM_KEY_PREFIX + 'google-services');
      expect(tiles[0].category).toBe(INTEGRATIONS_CATEGORIES.CONNECTOR);
      expect(tiles[0].src_icon).toBe('https://x/g.svg');
      expect(tiles[1].key).toBe('connector_item:microsoft');
      expect(tiles[1].src_icon).toBe(CONNECTOR_ADD_TILE.src_icon);
      expect(tiles[1].src_logo).toBe(CONNECTOR_ADD_TILE.src_logo);
      expect(tiles.every(t => t.pro === false && t.plan === 'Sandbox' && t.disabled === false)).toBe(true);
    });

    it('appends the add tile last when the user can register', () => {
      const tiles = buildConnectorTiles([connector({})], true, CONNECTOR_ADD_TILE);
      expect(tiles.length).toBe(2);
      expect(tiles[1].key).toBe('connectors');
      expect(tiles[1].name).toBe(CONNECTOR_ADD_TILE.name);
      expect(tiles[1].pro).toBe(false);
      expect(tiles[1].plan).toBe('Sandbox');
      expect(buildConnectorTiles([], true, CONNECTOR_ADD_TILE).length).toBe(1);
    });

    it('marks disabled connectors', () => {
      const tiles = buildConnectorTiles([connector({ status: 'disabled' })], false, CONNECTOR_ADD_TILE);
      expect(tiles[0].disabled).toBe(true);
    });
  });

  it('connector category is listed', () => {
    expect(CATEGORIES_LIST.some(c => c.type === INTEGRATIONS_CATEGORIES.CONNECTOR && c.name === 'Connectors')).toBe(true);
  });

  it('connectorIdFromKey', () => {
    expect(connectorIdFromKey('connector_item:x')).toBe('x');
    expect(connectorIdFromKey('connectors')).toBeNull();
    expect(connectorIdFromKey('connector_item:')).toBeNull();
    expect(connectorIdFromKey(undefined as any)).toBeNull();
  });

  describe('registryScopeOf / connectorPermissions', () => {
    it('hub admin -> global', () => {
      expect(registryScopeOf(me({ hub_admin: true }))).toBe('global');
      expect(connectorPermissions(me({ hub_admin: true }))).toEqual({ canRegister: true, canManageConnections: false, scope: 'global' });
    });
    it('manager with project connectors on -> project', () => {
      const m = me({ manager: true, project_connectors_enabled: true });
      expect(registryScopeOf(m)).toBe('project');
      expect(connectorPermissions(m)).toEqual({ canRegister: true, canManageConnections: true, scope: 'project' });
    });
    it('manager with project connectors off -> none', () => {
      const m = me({ manager: true });
      expect(registryScopeOf(m)).toBeNull();
      expect(connectorPermissions(m)).toEqual({ canRegister: false, canManageConnections: true, scope: null });
    });
    it('non-manager with project connectors on -> none', () => {
      const m = me({ project_connectors_enabled: true });
      expect(connectorPermissions(m)).toEqual({ canRegister: false, canManageConnections: false, scope: null });
    });
  });

  describe('canActOnConnector (C12)', () => {
    it('hub admin may act on global and own-project connectors', () => {
      const m = me({ hub_admin: true });
      expect(canActOnConnector(m, connector({ owner: 'global' }), 'p1')).toBe(true);
      expect(canActOnConnector(m, connector({ owner: 'p1' }), 'p1')).toBe(true);
    });
    it('project manager only on connectors owned by this project', () => {
      const m = me({ manager: true, project_connectors_enabled: true });
      expect(canActOnConnector(m, connector({ owner: 'p1' }), 'p1')).toBe(true);
      expect(canActOnConnector(m, connector({ owner: 'global' }), 'p1')).toBe(false);
      expect(canActOnConnector(m, connector({ owner: 'p2' }), 'p1')).toBe(false);
    });
    it('nobody else may act', () => {
      expect(canActOnConnector(me({ manager: true }), connector({ owner: 'p1' }), 'p1')).toBe(false);
      expect(canActOnConnector(me({}), connector({ owner: 'p1' }), 'p1')).toBe(false);
    });
  });

  describe('hubErrorMessage', () => {
    it('reads code, message and the errors list of invalid_manifest', () => {
      const r = hubErrorMessage({ status: 422, error: { code: 'invalid_manifest', error: 'The connector manifest is not valid', errors: ['/actions/0/id must match pattern'] } });
      expect(r.code).toBe('invalid_manifest');
      expect(r.message).toBe('The connector manifest is not valid');
      expect(r.details).toEqual(['/actions/0/id must match pattern']);
    });
    it('maps a network error', () => {
      const r = hubErrorMessage({ status: 0, message: 'Http failure response for http://hub: 0 Unknown Error', error: new ProgressEvent('error') });
      expect(r.code).toBe('network');
      expect(r.details).toEqual([]);
      expect(r.message).toContain('Http failure');
    });
    it('flags hub_not_configured', () => {
      expect(hubErrorMessage(new Error('hub_not_configured')).code).toBe('hub_not_configured');
    });
    it('falls back to err.message then Unknown error', () => {
      expect(hubErrorMessage({ status: 500, message: 'boom', error: {} }).message).toBe('boom');
      expect(hubErrorMessage({}).message).toBe('Unknown error');
      expect(hubErrorMessage(null).message).toBe('Unknown error');
    });
  });

  it('hubErrorKey maps the known 403/404/422 codes and nothing else', () => {
    ['not_a_member', 'unknown_connector', 'connector_disabled', 'internal_url_not_allowed', 'manager_role_required',
      'hub_admin_required', 'project_connectors_disabled'].forEach(c => {
      expect(hubErrorKey(c)).toBe('Integration.ConnectorErr_' + c);
    });
    expect(hubErrorKey('whatever')).toBeNull();
    expect(hubErrorKey('constructor')).toBeNull();
  });

  describe('hubErrorTextKey (always a translation key, never raw text)', () => {
    const GENERIC = 'Integration.ConnectorErr_unknown';
    it('maps a network failure', () => {
      expect(hubErrorTextKey({ status: 0, message: 'Http failure response for x: 0 Unknown Error', error: new ProgressEvent('error') }))
        .toBe('Integration.ConnectorErr_network');
    });
    it('maps hub_not_configured', () => {
      expect(hubErrorTextKey(new Error('hub_not_configured'))).toBe('Integration.ConnectorErr_hub_not_configured');
    });
    it('falls back to the generic key for an HTML 502 body, an unmapped code and junk', () => {
      expect(hubErrorTextKey({ status: 502, message: 'Http failure response', error: '<html>Bad Gateway</html>' })).toBe(GENERIC);
      expect(hubErrorTextKey({ status: 400, error: { code: 'something_new', error: 'raw hub text' } })).toBe(GENERIC);
      expect(hubErrorTextKey({})).toBe(GENERIC);
      expect(hubErrorTextKey(null)).toBe(GENERIC);
      expect(hubErrorTextKey({ error: { code: 'constructor' } })).toBe(GENERIC);
    });
    it('maps every code in HUB_ERROR_KEYS', () => {
      Object.keys(HUB_ERROR_KEYS).forEach((code) => {
        const err = code === 'network' ? { status: 0 } : code === 'hub_not_configured' ? new Error('hub_not_configured')
          : { status: 403, error: { code, error: 'x' } };
        expect(hubErrorTextKey(err)).toBe(HUB_ERROR_KEYS[code]);
        expect(HUB_ERROR_KEYS[code]).toBe('Integration.ConnectorErr_' + code);
      });
      expect(HUB_ERROR_KEYS['unknown']).toBeUndefined();
    });
  });

  describe('isSafeAuthUrl', () => {
    it('allows https, and http only on loopback hosts', () => {
      expect(isSafeAuthUrl('https://login.provider.test/consent?x=1')).toBe(true);
      expect(isSafeAuthUrl('http://localhost:3000/oauth')).toBe(true);
      expect(isSafeAuthUrl('http://127.0.0.1/oauth')).toBe(true);
      expect(isSafeAuthUrl('http://[::1]:8080/oauth')).toBe(true);
    });

    it('rejects other schemes, plain http on other hosts and unparsable values', () => {
      ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'http://provider.test/consent',
        'http://localhost.evil.test/x', 'ftp://provider.test', '/relative/path', '', null, undefined]
        .forEach((u) => expect(isSafeAuthUrl(u as any)).toBe(false, String(u)));
    });
  });

});
