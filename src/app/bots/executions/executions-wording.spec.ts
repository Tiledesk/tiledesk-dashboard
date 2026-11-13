import * as enJson from '../../../assets/i18n/en.json';
import * as itJson from '../../../assets/i18n/it.json';

const EN = (enJson as any).default || enJson;
const IT = (itJson as any).default || itJson;

/** Every string under a node, with its dotted key. */
function strings(node: any, path: string, out: Array<[string, string]> = []): Array<[string, string]> {
  if (typeof node === 'string') { out.push([path, node]); return out; }
  if (node && typeof node === 'object') Object.keys(node).forEach(k => strings(node[k], path ? path + '.' + k : k, out));
  return out;
}
/** The executions' user-facing strings: the Executions section and the EXECUTION_* activity filters. */
function executionStrings(lang: any): Array<[string, string]> {
  const verbs = Object.keys(lang.ActivitiesNew.FilterVerb).filter(k => k.startsWith('EXECUTION_'))
    .map(k => ['ActivitiesNew.FilterVerb.' + k, lang.ActivitiesNew.FilterVerb[k]] as [string, string]);
  return strings(lang.Executions, 'Executions').concat(verbs);
}

// "stopped" is shown as "paused" (feedback 2026-11-13 item 8); keys, codes and status values keep "stop".
describe('Executions wording: pause, not stop', () => {
  it('en: no stop/stopped/stopping in the executions strings', () => {
    const left = executionStrings(EN).filter(([, v]) => /\bstop(s|ped|ping)?\b/i.test(v));
    expect(left).toEqual([]);
  });

  it('it: no arresto/arrestata/fermata/fermare in the executions strings', () => {
    const left = executionStrings(IT).filter(([, v]) => /arrest|\bferm(a|ata|ate|are|o)\b|si ferma/i.test(v));
    expect(left).toEqual([]);
  });

  it('status chips, card, controls and dialogs say pause (en)', () => {
    const E = EN.Executions;
    expect(E.Status.stopped).toBe('paused');
    expect(E.Status.stopping).toBe('pausing');
    expect(E.Cards.stopped).toBe('Paused');
    expect(E.Controls.stop).toBe('Pause');
    expect(E.Controls.stop_hard_now).toBe('Pause now');
    expect(E.Controls.Pending.stopping).toBe('pausing…');
    expect(E.Controls.MessagesWhileStopped).toBe('{{n}} messages received while paused');
    expect(E.Controls.MessagesWhileStoppedOne).toBe('1 message received while paused');
    expect(E.Dialogs.StopTitle).toBe('Pause execution');
    expect(E.Dialogs.Stop).toBe('Pause');
    expect(E.Dialogs.StopNow).toBe('Pause now');
    expect(E.Dialogs.Soft).toContain('Pause after the current action');
    expect(E.Dialogs.Hard).toContain('Pause now');
    expect(E.StopNotice.Title).toBe('Pause notice');
    expect(E.StopNotice.Hint).toContain('paused');
  });

  it('status chips, card, controls and dialogs say pausa (it)', () => {
    const I = IT.Executions;
    expect(I.Status.stopped).toBe('in pausa');
    expect(I.Cards.stopped).toBe('In pausa');
    expect(I.Controls.stop).toBe('Metti in pausa');
    expect(I.Controls.stop_hard_now).toBe('Metti in pausa subito');
    expect(I.Dialogs.Stop).toBe('Metti in pausa');
    expect(I.Dialogs.Soft).toContain("Pausa dopo l'azione corrente");
    expect(I.StopNotice.Title).toBe('Avviso di pausa');
    expect(I.StopNotice.Hint).toContain('in pausa');
  });

  it('the whole pause notice card says pause', () => {
    const notice = (l: any) => JSON.stringify(l.Executions.StopNotice);
    expect(notice(EN)).not.toMatch(/\bstop(ped)?\b/i);
  });
});
