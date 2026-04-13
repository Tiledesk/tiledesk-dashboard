import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { DepartmentService } from 'app/services/department.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow di sync Department <-> KB (namespace):
 * - rinomina il department associato quando viene rinominata la KB
 * - elimina il department associato quando viene eliminata la KB
 *
 * Risoluzione “conservativa” dell’associazione:
 * - se esiste un solo department con `name === namespaceName` -> quello
 * - altrimenti, se si riesce a risalire al bot del namespace e c’è un solo department con `id_bot === botId` -> quello
 * - altrimenti: non fa nulla (evita side effects)
 */
export class KbDepartmentSyncWorkflowService {
  private static buildNamespaceTag(namespaceId: string) {
    return `kb_namespace_id:${namespaceId}`;
  }
  constructor(
    private departmentService: DepartmentService,
    private kbService: KnowledgeBaseService,
  ) {}

  renameAssociatedDepartment(params: {
    namespaceId: string;
    oldNamespaceName: string;
    newNamespaceName: string;
  }): Observable<void> {
    const { namespaceId, oldNamespaceName, newNamespaceName } = params || ({} as any);
    if (!namespaceId || !oldNamespaceName || !newNamespaceName) return of(void 0);
    if (oldNamespaceName === newNamespaceName) return of(void 0);

    return this.resolveAssociatedDepartment({ namespaceId, namespaceName: oldNamespaceName }).pipe(
      switchMap((dept: any) => {
        if (!dept?._id) return of(void 0);
        const allowMultipleGroups = Array.isArray(dept?.groups) && dept.groups.length > 0;
        return this.departmentService
          .updateDept(
            dept._id,
            newNamespaceName,
            dept?.description ?? '',
            dept?.id_bot ?? null,
            dept?.bot_only ?? false,
            dept?.id_group ?? null,
            dept?.routing ?? 'assigned',
            dept?.groups ?? [],
            allowMultipleGroups,
            dept?.tags,
          )
          .pipe(
            take(1),
            map(() => void 0),
            catchError(() => of(void 0)),
          );
      }),
      catchError(() => of(void 0)),
    );
  }

  deleteAssociatedDepartment(params: { namespaceId: string; namespaceName?: string }): Observable<void> {
    const { namespaceId, namespaceName } = params || ({} as any);
    if (!namespaceId) return of(void 0);

    return this.resolveAssociatedDepartment({ namespaceId, namespaceName }).pipe(
      switchMap((dept: any) => {
        if (!dept?._id) return of(void 0);
        return this.departmentService.deleteDeparment(dept._id).pipe(
          take(1),
          map(() => void 0),
          catchError(() => of(void 0)),
        );
      }),
      catchError(() => of(void 0)),
    );
  }

  private resolveAssociatedDepartment(params: { namespaceId: string; namespaceName?: string }): Observable<any | undefined> {
    const { namespaceId, namespaceName } = params || ({} as any);
    return this.departmentService.getDeptsByProjectId().pipe(
      take(1),
      switchMap((depts: any[]) => {
        const list = Array.isArray(depts) ? depts : [];
        const tag = KbDepartmentSyncWorkflowService.buildNamespaceTag(namespaceId);

        const byTag = list.filter((d: any) => {
          const tags = d?.tags;
          if (!tags) return false;
          if (Array.isArray(tags)) return tags.includes(tag);
          if (typeof tags === 'string') return tags.split(',').map((t) => t.trim()).includes(tag);
          return false;
        });
        if (byTag.length === 1) return of(byTag[0]);

        if (namespaceName) {
          const byName = list.filter((d: any) => (d?.name || '').trim() === (namespaceName || '').trim());
          if (byName.length === 1) return of(byName[0]);
        }

        // Fallback: try by botId (only if unambiguous).
        return this.kbService.getChatbotsUsingNamespace(namespaceId).pipe(
          take(1),
          map((res: any) => {
            const bots = Array.isArray(res) ? res : res?.chatbots ?? res?.data ?? [];
            if (!bots?.length) return undefined;
            if (bots.length === 1) return bots[0]?._id || bots[0]?.id;
            if (namespaceName) {
              const exact = bots.find((b: any) => (b?.name || '').trim() === (namespaceName || '').trim());
              return exact?._id || exact?.id;
            }
            return undefined;
          }),
          map((botId) => {
            if (!botId) return undefined;
            const byBot = list.filter((d: any) => d?.id_bot === botId);
            if (byBot.length === 1) return byBot[0];
            return undefined;
          }),
          catchError(() => of(undefined)),
        );
      }),
      catchError(() => of(undefined)),
    );
  }
}

