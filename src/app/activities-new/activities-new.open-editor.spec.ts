import { of } from 'rxjs';
import { ActivitiesNewComponent } from './activities-new.component';

/**
 * Activities -> chatbot link. Cached agents open as stored; an agent not in the local cache is
 * read back: a v3 agent opens in Design Studio V3, any other one with the stub built from the
 * activity (master's behaviour). Built without TestBed.
 */
describe('ActivitiesNewComponent - goToChatbotCds opens the right Design Studio', () => {
  const PROJECT = 'pid', BOT = 'bid';
  const CDS = 'https://host/cds/', CDS_V3 = 'https://host/cds-v3/';
  const activity: any = { createdAt: '2026-10-20T00:00:00.000Z', target: { id: BOT, object: { _id: BOT, type: 'tilebot' } }, actionObj: {} };
  let open: jasmine.Spy;

  function component(cached: any, server: any) {
    const c: any = Object.create(ActivitiesNewComponent.prototype);
    c.logger = { log: () => {}, error: () => {} };
    c.router = { navigate: jasmine.createSpy('navigate') };
    c.projectId = PROJECT;
    c.PERMISSION_TO_READ_FLOWS = true;
    c.PERMISSION_TO_EDIT_FLOWS = true;
    c.PERMISSION_TO_UPDATE_APP = true;
    c.notify = { presentDialogNoPermissionToPermomfAction: () => {} };
    c.appConfigService = { getConfig: () => ({ cdsBaseUrl: CDS, cdsV3BaseUrl: CDS_V3 }) };
    c.botLocalDbService = { getBotFromStorage: () => cached };
    c.faqKbService = { getFaqKbById: jasmine.createSpy('getFaqKbById').and.returnValue(of(server)) };
    return c;
  }

  beforeEach(() => { open = spyOn(window, 'open').and.returnValue(null); });

  it('a v3 agent not in the local cache is read back and opens in Design Studio V3', () => {
    const c = component(null, { _id: BOT, type: 'tilebot', createdAt: '2026-10-20T00:00:00.000Z', ds_version: 'v3' });
    c.goToChatbotCds(activity);
    expect(c.faqKbService.getFaqKbById).toHaveBeenCalledWith(BOT);
    expect(open.calls.allArgs()).toEqual([[`${CDS_V3}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
  });

  it('a v2 agent not in the cache (created before 2023-10-02) opens with the activity stub, as master', () => {
    const c = component(null, { _id: BOT, type: 'tilebot', createdAt: '2023-01-01T00:00:00.000Z' });
    c.goToChatbotCds(activity);
    expect(open.calls.allArgs()).toEqual([[`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
    expect(c.router.navigate).not.toHaveBeenCalled();
  });

  it('a cached agent opens as stored, without a lookup', () => {
    const c = component({ _id: BOT, type: 'tilebot', createdAt: '2026-10-20T00:00:00.000Z', ds_version: 'v3' }, null);
    c.goToChatbotCds(activity);
    expect(c.faqKbService.getFaqKbById).not.toHaveBeenCalled();
    expect(open.calls.allArgs()).toEqual([[`${CDS_V3}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
  });
});
