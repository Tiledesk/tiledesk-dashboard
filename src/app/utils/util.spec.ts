import { configuredUrl, goToCDSVersion, isV3Chatbot, openChatbotEditor } from './util';

/**
 * Which editor a chatbot opens in: an agent labelled v3 goes to the new Design Studio when its
 * URL is configured; everything else keeps the behaviour of always.
 */
describe('util - the Design Studio of a chatbot', () => {

  const PROJECT = 'pid', BOT = 'bid';
  const CDS = 'https://host/cds/', CDS_V3 = 'https://host/cds-v3/';
  const recent = (fields?: any) => ({ _id: BOT, createdAt: '2026-10-01T00:00:00.000Z', ...(fields || {}) } as any);

  describe('isV3Chatbot', () => {
    it('is true for the ds_version label v3, spaces and case apart, in the field or (older agents) in the attributes', () => {
      expect(isV3Chatbot(recent({ ds_version: 'v3' }))).toBe(true);
      expect(isV3Chatbot(recent({ ds_version: ' V3 ' }))).toBe(true);
      expect(isV3Chatbot(recent({ ds_version: 'v2' }))).toBe(false);
      expect(isV3Chatbot(recent({ ds_version: 3 }))).toBe(false);
      expect(isV3Chatbot(recent({ connectors: { version: 1, items: [] } }))).toBe(false);
      expect(isV3Chatbot(recent({ attributes: { dsVersion: 'v3' } }))).toBe(true);
      expect(isV3Chatbot(recent({ attributes: { dsVersion: ' V3 ' } }))).toBe(true);
      expect(isV3Chatbot(recent({ ds_version: 'v2', attributes: { dsVersion: 'v3' } }))).toBe(false);
      expect(isV3Chatbot(recent({ attributes: { dsVersion: 'v2' } }))).toBe(false);
      expect(isV3Chatbot(recent())).toBe(false);
      expect(isV3Chatbot({ _id: BOT, createdAt: new Date() })).toBe(false);
      expect(isV3Chatbot(null)).toBe(false);
    });
  });

  describe('configuredUrl', () => {
    it('ignores an empty value and the placeholder left by envsubst', () => {
      expect(configuredUrl(CDS_V3)).toBe(CDS_V3);
      expect(configuredUrl('  ' + CDS_V3 + ' ')).toBe(CDS_V3);
      expect(configuredUrl('')).toBeNull();
      expect(configuredUrl('   ')).toBeNull();
      expect(configuredUrl('${CDS_V3_URL}')).toBeNull();
      expect(configuredUrl(undefined)).toBeNull();
      expect(configuredUrl(null)).toBeNull();
    });
  });

  describe('goToCDSVersion', () => {
    let open: jasmine.Spy;
    let router: { navigate: jasmine.Spy };
    beforeEach(() => {
      open = spyOn(window, 'open').and.returnValue(null);
      router = { navigate: jasmine.createSpy('navigate') };
    });

    it('a v3 agent opens in the new Design Studio when its URL is configured', () => {
      goToCDSVersion(router, recent({ ds_version: 'v3' }), PROJECT, CDS, CDS_V3);
      expect(open.calls.allArgs()).toEqual([[`${CDS_V3}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('a v3 agent without that URL, or with the placeholder, opens as always', () => {
      goToCDSVersion(router, recent({ ds_version: 'v3' }), PROJECT, CDS);
      goToCDSVersion(router, recent({ ds_version: 'v3' }), PROJECT, CDS, '');
      goToCDSVersion(router, recent({ ds_version: 'v3' }), PROJECT, CDS, '${CDS_V3_URL}');
      expect(open.calls.allArgs()).toEqual([
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
      ]);
    });

    it('any other agent opens as always, the v3 URL notwithstanding', () => {
      goToCDSVersion(router, recent(), PROJECT, CDS, CDS_V3);
      goToCDSVersion(router, recent({ ds_version: 'v2' }), PROJECT, CDS, CDS_V3);
      goToCDSVersion(router, { _id: BOT, createdAt: new Date() } as any, PROJECT, CDS, CDS_V3);
      expect(open.calls.allArgs()).toEqual([
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
      ]);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('a chatbot older than the Design Studio still opens in the previous editor', () => {
      goToCDSVersion(router, { _id: BOT, createdAt: '2023-01-01T00:00:00.000Z' } as any, PROJECT, CDS, CDS_V3);
      expect(open).not.toHaveBeenCalled();
      expect(router.navigate.calls.allArgs()).toEqual([[['project/' + PROJECT + '/cds/', BOT, 'intent', '0']]]);
    });

    it('a chatbot without createdAt opens in the external editor (avoids NG04002 on the legacy in-app route)', () => {
      goToCDSVersion(router, { _id: BOT } as any, PROJECT, CDS, CDS_V3);
      expect(open.calls.allArgs()).toEqual([[`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('openChatbotEditor', () => {
    let open: jasmine.Spy;
    beforeEach(() => { open = spyOn(window, 'open').and.returnValue(null); });

    it('reads both URLs from the configuration: a v3 agent opens in the new editor, any other in the previous one', () => {
      const config = { cdsBaseUrl: CDS, cdsV3BaseUrl: CDS_V3 };
      openChatbotEditor({ navigate: () => {} }, recent({ ds_version: 'v3' }), PROJECT, config);
      openChatbotEditor({ navigate: () => {} }, recent(), PROJECT, config);
      expect(open.calls.allArgs()).toEqual([
        [`${CDS_V3}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
        [`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self'],
      ]);
    });

    it('without the v3 URL in the configuration every agent opens as always', () => {
      openChatbotEditor({ navigate: () => {} }, recent({ ds_version: 'v3' }), PROJECT, { cdsBaseUrl: CDS });
      openChatbotEditor({ navigate: () => {} }, recent({ ds_version: 'v3' }), PROJECT, { cdsBaseUrl: CDS, cdsV3BaseUrl: '${CDS_V3_URL}' });
      expect(open.calls.allArgs().map(a => a[0])).toEqual([`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, `${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`]);
    });
  });
});
