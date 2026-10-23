import { of, throwError } from 'rxjs';
import { TemplateDetailComponent } from './template-detail.component';

/**
 * Installing a template ends in the editor of the new agent. Only its id is at hand, so the
 * component reads the agent back and the editor follows its version label: a v3 agent opens
 * in Design Studio V3 (cdsV3BaseUrl), any other one in the previous Design Studio.
 * The component is built without TestBed (it has ~20 collaborators): only what
 * goToBotDetails() touches is provided.
 */
describe('TemplateDetailComponent - goToBotDetails opens the right Design Studio', () => {
  const PROJECT = 'pid', BOT = 'bid';
  const CDS = 'https://host/cds/', CDS_V3 = 'https://host/cds-v3/';
  let open: jasmine.Spy;

  function component(lookup: any, config: any = { cdsBaseUrl: CDS, cdsV3BaseUrl: CDS_V3 }) {
    const c: any = Object.create(TemplateDetailComponent.prototype);
    c.logger = { log: () => {}, error: () => {} };
    c.router = { navigate: jasmine.createSpy('navigate') };
    c.project = { _id: PROJECT };
    c.botid = BOT;
    c.appConfigService = { getConfig: () => config };
    c.faqKbService = { getFaqKbById: jasmine.createSpy('getFaqKbById').and.returnValue(lookup) };
    c.dialogRef = { close: jasmine.createSpy('close') };
    return c;
  }

  beforeEach(() => { open = spyOn(window, 'open').and.returnValue(null); });

  it('a v3 agent installed from a template opens in Design Studio V3', () => {
    const c = component(of({ _id: BOT, createdAt: '2026-10-20T00:00:00.000Z', ds_version: 'v3' }));
    c.goToBotDetails();
    expect(c.faqKbService.getFaqKbById).toHaveBeenCalledWith(BOT);
    expect(open.calls.allArgs()).toEqual([[`${CDS_V3}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
    expect(c.dialogRef.close).toHaveBeenCalled();
  });

  it('a legacy-labelled v3 agent (attributes.dsVersion) opens in Design Studio V3 too', () => {
    const c = component(of({ _id: BOT, createdAt: '2026-10-20T00:00:00.000Z', attributes: { dsVersion: 'v3' } }));
    c.goToBotDetails();
    expect(open.calls.mostRecent().args[0]).toBe(`${CDS_V3}#/project/${PROJECT}/chatbot/${BOT}/blocks`);
  });

  it('a v2 agent opens in the previous Design Studio', () => {
    const c = component(of({ _id: BOT, createdAt: '2026-10-20T00:00:00.000Z' }));
    c.goToBotDetails();
    expect(open.calls.allArgs()).toEqual([[`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
  });

  it('a v2 agent created before 2023-10-02 still opens the external CDS (as master: stub with createdAt now)', () => {
    const c = component(of({ _id: BOT, createdAt: '2023-01-01T00:00:00.000Z' }));
    c.goToBotDetails();
    expect(open.calls.allArgs()).toEqual([[`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
    expect(c.router.navigate).not.toHaveBeenCalled();
  });

  it('a v3 agent opens as always when cdsV3BaseUrl is not configured (envsubst placeholder)', () => {
    const c = component(of({ _id: BOT, createdAt: '2026-10-20T00:00:00.000Z', ds_version: 'v3' }),
      { cdsBaseUrl: CDS, cdsV3BaseUrl: '${CDS_V3_URL}' });
    c.goToBotDetails();
    expect(open.calls.allArgs()).toEqual([[`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
  });

  it('if the lookup fails the agent still opens (previous Design Studio)', () => {
    const c = component(throwError(new Error('boom')));
    c.goToBotDetails();
    expect(open.calls.allArgs()).toEqual([[`${CDS}#/project/${PROJECT}/chatbot/${BOT}/blocks`, '_self']]);
  });
});
