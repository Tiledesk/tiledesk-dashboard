import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER, DEFAULT_CHATBOT_NAME } from 'app/utils/constants';

export type WidgetInstallTarget = {
  projectId: string;
  participants?: string;
  departmentID?: string;
};

@Injectable({ providedIn: 'root' })
export class KbWidgetInstallationService {
  constructor(
    private faqKbService: FaqKbService,
    private departmentService: DepartmentService,
  ) {}

  /**
   * Risolve i parametri "best effort" per l'installazione widget:
   * - `participants`: preferisce il bot `DEFAULT_CHATBOT_NAME`, poi un bot con tag certificato `kb-official-responder`, altrimenti il primo bot disponibile.
   * - `departmentID`: preferisce il dipartimento default, altrimenti il primo.
   *
   * Non lancia errori: in caso di fallimento ritorna solo `projectId` o parziali.
   */
  resolveWidgetInstallTarget(projectId: string): Observable<WidgetInstallTarget> {
    if (!projectId) {
      return of({ projectId });
    }

    return this.faqKbService.getFaqKbByProjectId().pipe(
      take(1),
      map((bots: any[]) => {
        const bot =
          bots?.find((b: any) => b?.name === DEFAULT_CHATBOT_NAME) ??
          bots?.find((b: any) => b?.certifiedTags?.some((t: any) => t?.name === CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER)) ??
          bots?.[0];

        const participants = bot?._id ? `bot_${bot._id}` : undefined;
        return { projectId, participants } as WidgetInstallTarget;
      }),
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

