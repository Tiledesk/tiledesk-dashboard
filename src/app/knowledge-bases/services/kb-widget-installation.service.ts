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
 * - risolve `departmentID` (dipartimento target) preferendo il default
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
   * - `departmentID`: preferisce il dipartimento default, altrimenti il primo.
   *
   * Non lancia errori: in caso di fallimento ritorna solo `projectId` o parziali.
   */
  resolveWidgetInstallTarget(params: { projectId: string; namespaceId?: string; namespaceName?: string }): Observable<WidgetInstallTarget> {
    const projectId = params?.projectId;
    if (!projectId) {
      return of({ projectId });
    }

    const resolveParticipants$ = !params?.namespaceId
      ? of(undefined)
      : this.kbService.getChatbotsUsingNamespace(params.namespaceId).pipe(
          take(1),
          map((res: any) => {
            const bots = Array.isArray(res) ? res : res?.chatbots ?? res?.data ?? [];
            const byName =
              params?.namespaceName ? bots.find((b: any) => (b?.name || '').trim() === (params.namespaceName || '').trim()) : undefined;
            const bot = byName ?? bots?.[0];
            return bot?._id ? `bot_${bot._id}` : undefined;
          }),
          catchError(() => of(undefined)),
        );

    return resolveParticipants$.pipe(
      take(1),
      map((participants?: string) => ({ projectId, participants }) as WidgetInstallTarget),
      switchMap((partial: WidgetInstallTarget) =>
        this.departmentService.getDeptsByProjectId().pipe(
          take(1),
          map((depts: any[]) => {
            const dept = depts?.find((d: any) => d?.default === true) ?? depts?.[0];
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

