import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { DepartmentService } from 'app/services/department.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';

export type WidgetInstallTarget = {
  projectId: string;
  participants?: string;
  departmentID?: string;
};

@Injectable({ providedIn: 'root' })
/**
 * Workflow service per la modale “Installa sul tuo sito web”.
 *
 * Azioni:
 * - risolve `participants` (bot da associare al widget) in base alla KB (namespace) selezionata,
 *   usando l’endpoint `/kb/namespace/{namespace_id}/chatbots`.
 *   Strategia:
 *   1) se esiste un bot con `name === namespaceName` -> usa quello (è il caso “bot creato insieme alla KB”)
 *   2) fallback al primo bot collegato al namespace
 * - risolve `departmentID` (dipartimento target) associato alla KB selezionata.
 *   Strategia:
 *   1) se esiste un department con `name === namespaceName` -> usa quello
 *   2) fallback: se il bot del namespace è univoco e c’è un solo department con `id_bot === botId` -> usa quello
 *   3) fallback finale: dipartimento default, altrimenti il primo
 *
 * Quando viene invocato:
 * - al click del badge “Installa sul tuo sito web” in `knowledge-bases.component.html`.
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesComponent.presentModalInstallWidget()` tramite `KnowledgeBasesFacadeService.resolveWidgetInstallTarget()`.
 *
 * Nota:
 * - best-effort: non fa fallire la UI; in caso di errori restituisce dati parziali.
 */
export class KbWidgetInstallationService {
  constructor(
    private kbService: KnowledgeBaseService,
    private departmentService: DepartmentService,
  ) {}

  /**
   * Risolve i parametri "best effort" per l'installazione widget:
   * - `participants`: usa il bot associato al namespace selezionato.
   * - `departmentID`: usa il department associato al namespace selezionato (fallback al default).
   *
   * Non lancia errori: in caso di fallimento ritorna solo `projectId` o parziali.
   */
  resolveWidgetInstallTarget(params: { projectId: string; namespaceId?: string; namespaceName?: string }): Observable<WidgetInstallTarget> {
    const projectId = params?.projectId;
    if (!projectId) {
      return of({ projectId });
    }

    const resolveBotForNamespace$ = !params?.namespaceId
      ? of(undefined)
      : this.kbService.getChatbotsUsingNamespace(params.namespaceId).pipe(
          take(1),
          map((res: any) => {
            const bots = Array.isArray(res) ? res : res?.chatbots ?? res?.data ?? [];
            const byName =
              params?.namespaceName ? bots.find((b: any) => (b?.name || '').trim() === (params.namespaceName || '').trim()) : undefined;
            const bot = byName ?? bots?.[0];
            return bot?._id || bot?.id;
          }),
          catchError(() => of(undefined)),
        );

    return resolveBotForNamespace$.pipe(
      take(1),
      map((botId?: string) => ({
        projectId,
        botId,
        participants: botId ? `bot_${botId}` : undefined,
      })),
      switchMap((partial: WidgetInstallTarget) =>
        this.departmentService.getDeptsByProjectId().pipe(
          take(1),
          map((depts: any[]) => {
            const list = Array.isArray(depts) ? depts : [];
            const nsName = (params?.namespaceName || '').trim();
            const nsId = (params?.namespaceId || '').trim();
            const tag = nsId ? `kb_namespace_id:${nsId}` : '';

            const byTag = tag
              ? list.find((d: any) => {
                  const tags = d?.tags;
                  if (!tags) return false;
                  if (Array.isArray(tags)) return tags.includes(tag);
                  if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).includes(tag);
                  return false;
                })
              : undefined;
            const byName = nsName ? list.find((d: any) => (d?.name || '').trim() === nsName) : undefined;
            const byBot =
              (partial as any)?.botId ? list.filter((d: any) => d?.id_bot === (partial as any).botId) : [];
            const byBotUnambiguous = Array.isArray(byBot) && byBot.length === 1 ? byBot[0] : undefined;

            const dept = byTag ?? byName ?? byBotUnambiguous ?? list.find((d: any) => d?.default === true) ?? list?.[0];
            const departmentID = dept?._id;
            return { ...partial, departmentID };
          }),
          catchError(() => of(partial)),
        ),
      ),
      catchError(() => of({ projectId })),
    );
  }
}

