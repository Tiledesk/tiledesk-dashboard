import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { DepartmentService } from 'app/services/department.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { OnboardingChatbotSetupService } from 'app/services/onboarding-chatbot-setup.service';

export type KbProvisioningResult = {
  botId?: string;
  departmentId?: string;
  createdDepartment?: boolean;
  updatedDepartment?: boolean;
};

@Injectable({ providedIn: 'root' })
/**
 * Workflow “provisioning” per una Knowledge Base (namespace):
 * - garantisce che esista un chatbot associato al namespace (creato da template certificato)
 * - garantisce che esista un department con lo stesso nome del namespace/bot
 * - collega il department al bot (quando possibile)
 *
 * Regole:
 * - routing base: `assigned`
 * - associazione bot: preferisce `bot.name === namespaceName`, altrimenti primo bot del namespace
 * - associazione dept: preferisce `dept.name === namespaceName`, altrimenti crea un dept nuovo
 *
 * Invocato da:
 * - `KnowledgeBasesFacadeService.createKbOfficialResponderChatbotAndDepartmentForNamespace()`
 */
export class KbDepartmentProvisioningWorkflowService {
  private static readonly DEFAULT_ROUTING: 'assigned' | 'pooled' = 'assigned';
  private static buildKbDeptTags(params: { namespaceId: string; botId: string }) {
    const { namespaceId, botId } = params || ({} as any);
    return [`kb_namespace_id:${namespaceId}`, `kb_bot_id:${botId}`];
  }

  constructor(
    private onboardingChatbotSetupService: OnboardingChatbotSetupService,
    private kbService: KnowledgeBaseService,
    private departmentService: DepartmentService,
  ) {}

  /**
   * Crea il chatbot (template kb-official-responder) e poi crea/aggiorna il department omonimo collegandolo al bot.
   *
   * Best-effort:
   * - se il chatbot viene creato ma il department fallisce, non blocca il flusso chiamante (torna comunque risultato parziale).
   */
  createChatbotAndDepartmentForNamespace(params: {
    projectId: string;
    namespaceId: string;
    namespaceName: string;
  }): Observable<KbProvisioningResult> {
    const { projectId, namespaceId, namespaceName } = params || ({} as any);
    if (!projectId) return throwError(() => new Error('projectId is required'));
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!namespaceName) return throwError(() => new Error('namespaceName is required'));

    return this.onboardingChatbotSetupService
      .createKbOfficialResponderChatbotForNamespace({ projectId, namespaceId, chatbotName: namespaceName })
      .pipe(
        switchMap(() =>
          this.ensureDepartmentForNamespace({ namespaceId, namespaceName }).pipe(
            catchError(() => of({} as KbProvisioningResult)),
          ),
        ),
      );
  }

  /**
   * Crea (o aggiorna) il department associato al namespace, collegandolo al bot del namespace.
   */
  ensureDepartmentForNamespace(params: { namespaceId: string; namespaceName: string }): Observable<KbProvisioningResult> {
    const { namespaceId, namespaceName } = params || ({} as any);
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!namespaceName) return throwError(() => new Error('namespaceName is required'));

    return this.resolveBotIdForNamespace({ namespaceId, namespaceName }).pipe(
      switchMap((botId) => {
        if (!botId) return of({} as KbProvisioningResult);
        return this.departmentService.getDeptsByProjectId().pipe(
          take(1),
          switchMap((depts: any[]) => {
            const existing = Array.isArray(depts) ? depts.find((d: any) => (d?.name || '').trim() === namespaceName.trim()) : undefined;
            if (existing?._id) {
              // Ensure the bot is associated (best effort).
              const tags = KbDepartmentProvisioningWorkflowService.buildKbDeptTags({ namespaceId, botId });
              const allowMultipleGroups = Array.isArray(existing?.groups) && existing.groups.length > 0;
              return this.departmentService.updateDept(
                existing._id,
                existing?.name ?? namespaceName,
                existing?.description ?? '',
                botId,
                existing?.bot_only ?? true,
                existing?.id_group ?? null,
                existing?.routing ?? KbDepartmentProvisioningWorkflowService.DEFAULT_ROUTING,
                existing?.groups ?? [],
                allowMultipleGroups,
                tags,
              ).pipe(
                take(1),
                map(() => ({
                  botId,
                  departmentId: existing._id,
                  createdDepartment: false,
                  updatedDepartment: true,
                })),
                catchError(() =>
                  of({
                    botId,
                    departmentId: existing._id,
                    createdDepartment: false,
                    updatedDepartment: false,
                  } as KbProvisioningResult),
                ),
              );
            }

            return this.departmentService
              .addDept(
                namespaceName,
                '',
                botId,
                true,
                null as any,
                KbDepartmentProvisioningWorkflowService.DEFAULT_ROUTING,
                [],
                false,
              )
              .pipe(
                take(1),
                switchMap((created: any) => {
                  const departmentId = created?._id || created?.id;
                  if (!departmentId) {
                    return of({
                      botId,
                      departmentId: undefined,
                      createdDepartment: true,
                      updatedDepartment: false,
                    } as KbProvisioningResult);
                  }
                  const tags = KbDepartmentProvisioningWorkflowService.buildKbDeptTags({ namespaceId, botId });
                  return this.departmentService
                    .updateDept(
                      departmentId,
                      namespaceName,
                      created?.description ?? '',
                      botId,
                      true,
                      created?.id_group ?? null,
                      created?.routing ?? KbDepartmentProvisioningWorkflowService.DEFAULT_ROUTING,
                      created?.groups ?? [],
                      Array.isArray(created?.groups) && created.groups.length > 0,
                      tags,
                    )
                    .pipe(
                      take(1),
                      map(() => ({
                        botId,
                        departmentId,
                        createdDepartment: true,
                        updatedDepartment: true,
                      })),
                      catchError(() =>
                        of({
                          botId,
                          departmentId,
                          createdDepartment: true,
                          updatedDepartment: false,
                        } as KbProvisioningResult),
                      ),
                    );
                }),
              );
          }),
          catchError(() => of({ botId } as KbProvisioningResult)),
        );
      }),
      catchError(() => of({} as KbProvisioningResult)),
    );
  }

  private resolveBotIdForNamespace(params: { namespaceId: string; namespaceName: string }): Observable<string | undefined> {
    const { namespaceId, namespaceName } = params || ({} as any);
    return this.kbService.getChatbotsUsingNamespace(namespaceId).pipe(
      take(1),
      map((res: any) => {
        const bots = Array.isArray(res) ? res : res?.chatbots ?? res?.data ?? [];
        const byName = bots.find((b: any) => (b?.name || '').trim() === (namespaceName || '').trim());
        const bot = byName ?? bots?.[0];
        return bot?._id || bot?.id;
      }),
      catchError(() => of(undefined)),
    );
  }
}

