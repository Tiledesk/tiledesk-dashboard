import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { KbDepartmentsWorkflowService } from './kb-departments-workflow.service';

export type BotDepartmentHookOutcome =
  | { outcome: 'no-departments' }
  | { outcome: 'already-hooked' }
  | { outcome: 'hooked-to-default'; deptId: string }
  | { outcome: 'needs-selection'; deptsWithoutBotArray: Array<{ id: string; name: string }> };

@Injectable({ providedIn: 'root' })
/**
 * Workflow “hook bot to department” nel contesto Knowledge Bases.
 *
 * Azioni:
 * - carica i dipartimenti del progetto
 * - se c’è un solo dept:
 *   - se `hasBot === true`: non fa nulla
 *   - altrimenti: aggancia il bot al dept
 * - se ci sono più dept:
 *   - ritorna la lista di dept senza bot per permettere alla UI di chiedere all’utente
 *
 * Quando viene invocato:
 * - dopo creazione/import di un chatbot dalla pagina KB, per “attivarlo” su un dept.
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesComponent.getDeptsByProjectId()` (legacy) o un flusso post-creazione bot,
 *   tramite `KnowledgeBasesFacadeService`.
 */
export class KbBotDepartmentHookWorkflowService {
  constructor(private departmentsWorkflow: KbDepartmentsWorkflowService) {}

  resolveAndHookIfPossible(botId: string): Observable<BotDepartmentHookOutcome> {
    if (!botId) return throwError(() => new Error('botId is required'));

    return this.departmentsWorkflow.loadDepartments().pipe(
      take(1),
      switchMap((departments: any[]) => {
        if (!Array.isArray(departments) || departments.length === 0) {
          return of({ outcome: 'no-departments' } as BotDepartmentHookOutcome);
        }

        // Keep parity with legacy behavior: only auto-hook when there is exactly 1 department.
        if (departments.length === 1) {
          const dept = departments[0];
          const deptId = dept?._id;
          if (!deptId) {
            return of({ outcome: 'no-departments' } as BotDepartmentHookOutcome);
          }
          if (dept?.hasBot === true) {
            return of({ outcome: 'already-hooked' } as BotDepartmentHookOutcome);
          }
          return this.departmentsWorkflow.hookBotToDept(deptId, botId).pipe(
            map(() => ({ outcome: 'hooked-to-default', deptId }) as BotDepartmentHookOutcome),
            catchError(() =>
              of({
                outcome: 'needs-selection' as const,
                deptsWithoutBotArray: [{ id: deptId, name: dept?.name }],
              } as BotDepartmentHookOutcome),
            ),
          );
        }

        const deptsWithoutBotArray =
          departments
            .filter((d: any) => d?.hasBot !== true)
            .map((d: any) => ({ id: d?._id, name: d?.name }))
            .filter((d: any) => !!d.id) ?? [];

        if (deptsWithoutBotArray.length === 0) {
          return of({ outcome: 'already-hooked' } as BotDepartmentHookOutcome);
        }

        return of({ outcome: 'needs-selection', deptsWithoutBotArray } as BotDepartmentHookOutcome);
      }),
    );
  }
}

