import { of } from 'rxjs';
import { KnowledgeBasesComponent } from './knowledge-bases.component';

/**
 * KB "used by chatbots" chip -> confirm dialog -> "block" or "settings". The namespace's chatbot
 * list carries only {_id, name}, so the agent is read back: a v3 agent opens in Design Studio V3;
 * any other agent opens exactly where master opened it (stub with createdAt now => external CDS),
 * also when it was created before 2023-10-02 (its real createdAt would take the dead in-app route).
 * Built without TestBed: only what presentDialogGoToCDS() touches is provided.
 */
describe('KnowledgeBasesComponent - go to CDS dialog opens the right Design Studio', () => {
  const PROJECT = 'pid', BOT = 'bid';
  const CDS = 'https://host/cds/', CDS_V3 = 'https://host/cds-v3/';
  const blocks = (base: string) => `${base}#/project/${PROJECT}/chatbot/${BOT}/blocks`;
  const settings = (base: string) => `${base}#/project/${PROJECT}/chatbot/${BOT}/settings?active=bot_detail`;
  let open: jasmine.Spy;

  function component(agent: any, redirectTo: 'block' | 'settings') {
    const c: any = Object.create(KnowledgeBasesComponent.prototype);
    c.logger = { log: () => {}, error: () => {} };
    c.router = { navigate: jasmine.createSpy('navigate') };
    c.project = { _id: PROJECT };
    c.PERMISSION_TO_EDIT_FLOWS = true;
    c.appConfigService = { getConfig: () => ({ cdsBaseUrl: CDS, cdsV3BaseUrl: CDS_V3 }) };
    c.faqKbService = { getFaqKbById: jasmine.createSpy('getFaqKbById').and.returnValue(of(agent)) };
    c.dialog = { open: () => ({ afterClosed: () => of({ chatbot: { _id: BOT }, redirectTo }) }) };
    return c;
  }

  beforeEach(() => { open = spyOn(window, 'open').and.returnValue(null); });

  it('v2 agent created before 2023-10-02: "block" opens the external CDS, as master', () => {
    const c = component({ _id: BOT, name: 'old', createdAt: '2023-01-01T00:00:00.000Z' }, 'block');
    c.presentDialogGoToCDS({ _id: BOT, name: 'old' });
    expect(open.calls.allArgs()).toEqual([[blocks(CDS), '_self']]);
    expect(c.router.navigate).not.toHaveBeenCalled();
  });

  it('v2 agent created before 2023-10-02: "settings" opens the external CDS settings, as master', () => {
    const c = component({ _id: BOT, name: 'old', createdAt: '2023-01-01T00:00:00.000Z' }, 'settings');
    c.presentDialogGoToCDS({ _id: BOT, name: 'old' });
    expect(open.calls.allArgs()).toEqual([[settings(CDS), '_self']]);
    expect(c.router.navigate).not.toHaveBeenCalled();
  });

  it('v3 agent: "block" and "settings" open Design Studio V3', () => {
    const v3 = { _id: BOT, name: 'new', createdAt: '2026-10-20T00:00:00.000Z', ds_version: 'v3' };
    component(v3, 'block').presentDialogGoToCDS({ _id: BOT });
    component(v3, 'settings').presentDialogGoToCDS({ _id: BOT });
    expect(open.calls.allArgs()).toEqual([[blocks(CDS_V3), '_self'], [settings(CDS_V3), '_self']]);
  });
});
