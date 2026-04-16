import { Injectable } from '@angular/core';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { FaqService } from 'app/services/faq.service';
import { DepartmentService } from 'app/services/department.service';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import type { KbNamespace } from '../models/kb-types';

type ProvisioningResult = { bot?: any; department?: any };
type TagString = string;

/**
 * Ensure KB-linked resources (chatbot + department) exist and stay in sync with a namespace.
 *
 * Notes:
 * - Chatbot association to namespace is achieved by setting `askgptv2.namespace = namespaceId`
 *   inside the bot intents/actions.
 * - Department association is achieved by linking the bot to a department (dept.id_bot).
 * - This service is designed to live entirely in `knowledge-bases2` to keep rollback simple.
 */
@Injectable({ providedIn: 'root' })
export class KbNamespaceLinkedResourcesService {
  private readonly kbOfficialResponderTag = 'kb-official-responder';
  private readonly tagNamespaceIdKey = 'kb_namespace_id';
  private readonly tagBotIdKey = 'kb_bot_id';
  private readonly tagDeptIdKey = 'kb_dept_id';

  constructor(
    private kbService: KnowledgeBaseService,
    private faqKbService: FaqKbService,
    private faqService: FaqService,
    private departmentService: DepartmentService,
  ) {}

  ensureOnCreate(input: { projectId: string; namespace: KbNamespace }): Observable<ProvisioningResult> {
    const namespaceId = input.namespace?.id as string;
    const namespaceName = input.namespace?.name as string;
    if (!namespaceId || !namespaceName) {
      return throwError(() => new Error('Missing namespace id or name'));
    }

    return this.ensureChatbotForNamespace({ namespaceId, namespaceName }).pipe(
      switchMap((bot) =>
        this.ensureDepartmentForNamespace({ namespaceName, bot }).pipe(map((department) => ({ bot, department }))),
      ),
      switchMap(({ bot, department }) => {
        const botId = bot?._id ?? bot?.id;
        const deptId = department?._id ?? department?.id;
        const tags = this.buildOwnershipTags({ namespaceId, botId, deptId });

        return this.patchTagsOnBot({ bot, tags }).pipe(
          switchMap(() => this.patchTagsOnDepartment({ department, tags })),
          map(() => ({ bot, department })),
        );
      }),
    );
  }

  syncOnRename(input: { namespaceId: string; oldName: string; newName: string }): Observable<void> {
    const { namespaceId, oldName, newName } = input;
    if (!namespaceId || !newName) {
      return throwError(() => new Error('Missing namespaceId or newName'));
    }

    return this.kbService.getChatbotsUsingNamespace(namespaceId).pipe(
      switchMap((bots: any[]) => {
        const list = Array.isArray(bots) ? bots : [];
        if (list.length === 0) {
          return of(undefined);
        }
        // Rename all bots associated to this namespace.
        return of(list).pipe(
          switchMap((items) =>
            items.reduce((acc$, bot) => {
              return acc$.pipe(
                switchMap(() => {
                  const updated = { ...bot, name: newName };
                  return this.faqKbService.updateChatbot(updated);
                }),
              );
            }, of(null as any)),
          ),
          map(() => list[0]),
        );
      }),
      switchMap((bot) => {
        // Rename department best-effort: prefer ownership tags, fallback to oldName, then bot linkage.
        return this.departmentService.getDeptsByProjectId().pipe(
          switchMap((depts: any[]) => {
            const list = Array.isArray(depts) ? depts : [];
            const tagged = list.find((d) => this.hasTag(d?.tags, this.tagNamespaceIdKey, namespaceId));
            const dept =
              tagged ||
              list.find((d) => d?.name === oldName) ||
              (bot ? list.find((d) => d?.id_bot === bot?._id || d?.id_bot === bot?.id) : undefined);

            if (!dept) {
              return of(undefined);
            }

            const deptId = dept?._id;
            if (!deptId) {
              return of(undefined);
            }

            // Preserve existing fields when available.
            const deptDescription = dept?.description ?? '';
            const idBot = (bot?._id ?? bot?.id ?? dept?.id_bot ?? null) as string | null;
            const botOnly = !!dept?.bot_only;
            const idGroup = dept?.id_group ?? null;
            const routing = dept?.routing ?? 'assigned';
            const groups = Array.isArray(dept?.groups) ? dept.groups : [];
            const allowMultipleGroups = !!dept?.allowMultipleGroups;

            return this.departmentService.updateDept(
              deptId,
              newName,
              deptDescription,
              idBot,
              botOnly,
              idGroup,
              routing,
              groups,
              allowMultipleGroups,
              dept?.tags,
            ) as any;
          }),
          map(() => undefined),
        );
      }),
    );
  }

  cleanupOnDelete(input: { namespaceId: string; namespaceName: string }): Observable<void> {
    const { namespaceId, namespaceName } = input;
    if (!namespaceId) {
      return throwError(() => new Error('Missing namespaceId'));
    }

    return this.kbService.getChatbotsUsingNamespace(namespaceId).pipe(
      switchMap((bots: any[]) => {
        const list = Array.isArray(bots) ? bots : [];
        const bot = list[0];
        return this.departmentService.getDeptsByProjectId().pipe(
          switchMap((depts: any[]) => {
            const dlist = Array.isArray(depts) ? depts : [];
            const tagged = dlist.find((d) => this.hasTag(d?.tags, this.tagNamespaceIdKey, namespaceId));
            const dept =
              tagged ||
              dlist.find((d) => d?.id_bot === bot?._id || d?.id_bot === bot?.id) ||
              (namespaceName ? dlist.find((d) => d?.name === namespaceName) : undefined);

            if (!dept?._id) {
              return of(undefined);
            }
            return this.departmentService.deleteDeparment(dept._id).pipe(map(() => undefined));
          }),
          switchMap(() => {
            // There is no explicit "delete bot" API in this frontend; trash it if possible.
            if (!bot?._id) {
              return of(undefined);
            }
            return this.faqKbService.updateFaqKbAsTrashed(bot._id, true).pipe(map(() => undefined));
          }),
        );
      }),
    );
  }

  private ensureChatbotForNamespace(input: { namespaceId: string; namespaceName: string }): Observable<any> {
    const { namespaceId, namespaceName } = input;
    return this.kbService.getChatbotsUsingNamespace(namespaceId).pipe(
      switchMap((bots: any[]) => {
        const list = Array.isArray(bots) ? bots : [];
        if (list.length > 0) {
          return of(list[0]);
        }
        return this.createChatbotFromOfficialResponderTemplate({ namespaceId, namespaceName });
      }),
    );
  }

  private createChatbotFromOfficialResponderTemplate(input: { namespaceId: string; namespaceName: string }): Observable<any> {
    const { namespaceId, namespaceName } = input;

    return this.faqKbService.getTemplates().pipe(
      map((templates: any[]) => Array.isArray(templates) ? templates : []),
      map((templates) =>
        templates.find((c) => Array.isArray(c?.certifiedTags) && c.certifiedTags.some((t: any) => t?.name === this.kbOfficialResponderTag)),
      ),
      switchMap((template) => {
        if (!template?._id) {
          return throwError(() => new Error('kb-official-responder template not found'));
        }
        return this.faqKbService.exportChatbotToJSON(template._id);
      }),
      map((chatbotJson: any) => {
        const edited = { ...chatbotJson, name: namespaceName };
        const intents: any[] = Array.isArray(edited?.intents) ? edited.intents : [];
        for (const intent of intents) {
          const actions: any[] = Array.isArray(intent?.actions) ? intent.actions : [];
          for (const action of actions) {
            if (action?._tdActionType === 'askgptv2') {
              action.namespace = namespaceId;
            }
          }
        }
        return edited;
      }),
      switchMap((editedChatbot) => this.faqService.importChatbotFromJSONFromScratch(editedChatbot)),
      switchMap((created: any) => {
        if (!created?._id) {
          return of(created);
        }
        return this.faqKbService.publish({ _id: created._id } as any).pipe(map(() => created));
      }),
    );
  }

  private ensureDepartmentForNamespace(input: { namespaceName: string; bot: any }): Observable<any> {
    const { namespaceName, bot } = input;
    const botId = bot?._id ?? bot?.id;
    if (!botId) {
      return throwError(() => new Error('Missing botId'));
    }

    return this.departmentService.getDeptsByProjectId().pipe(
      map((depts: any[]) => (Array.isArray(depts) ? depts : [])),
      switchMap((depts) => {
        const existing = depts.find((d) => d?.name === namespaceName) || depts.find((d) => d?.id_bot === botId);
        if (existing?._id) {
          // Ensure bot is linked; keep existing routing/config.
          return this.departmentService.updateExistingDeptWithSelectedBot(existing._id, botId).pipe(map(() => existing));
        }

        // Create a new department owned by this KB (same name).
        const deptDescription = '';
        const botOnly = false;
        const idGroup = null;
        const routing = 'assigned';
        const groups: any[] = [];
        const allowMultipleGroups = false;
        return this.departmentService.addDept(
          namespaceName,
          deptDescription,
          botId,
          botOnly,
          idGroup,
          routing,
          groups,
          allowMultipleGroups,
        );
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  private buildOwnershipTags(input: { namespaceId: string; botId?: string; deptId?: string }): TagString[] {
    const tags: TagString[] = [`${this.tagNamespaceIdKey}:${input.namespaceId}`];
    if (input.botId) tags.push(`${this.tagBotIdKey}:${input.botId}`);
    if (input.deptId) tags.push(`${this.tagDeptIdKey}:${input.deptId}`);
    return tags;
  }

  private normalizeTags(tags: any): TagString[] {
    if (!tags) return [];
    if (Array.isArray(tags)) {
      return tags
        .map((t) => {
          if (typeof t === 'string') {
            return t;
          }
          if (t && typeof t === 'object' && typeof t.key === 'string' && typeof t.value === 'string') {
            return `${t.key}:${t.value}`;
          }
          return null;
        })
        .filter(Boolean) as TagString[];
    }
    return [];
  }

  private mergeTags(existing: any, next: TagString[]): TagString[] {
    const curr = this.normalizeTags(existing);
    // Deduplicate by key prefix before ':'.
    const mapByKey = new Map<string, TagString>();
    for (const t of curr) {
      const key = String(t).split(':')[0];
      mapByKey.set(key, t);
    }
    for (const t of next) {
      const key = String(t).split(':')[0];
      mapByKey.set(key, t);
    }
    return Array.from(mapByKey.values());
  }

  private hasTag(tags: any, key: string, value: string): boolean {
    const expected = `${key}:${value}`;
    return this.normalizeTags(tags).some((t) => t === expected);
  }

  private patchTagsOnBot(input: { bot: any; tags: TagString[] }): Observable<any> {
    const bot = input.bot;
    if (!bot?._id) return of(bot);
    // IMPORTANT: backend PUT /faq_kb/:id may validate required fields.
    // Always fetch full bot before updating to avoid sending partial payloads.
    return this.faqKbService.getBotById(bot._id).pipe(
      map((fullBot: any) => {
        const merged = this.mergeTags(fullBot?.tags, input.tags);
        return { ...fullBot, name: bot?.name ?? fullBot?.name, tags: merged };
      }),
      switchMap((updated) => this.faqKbService.updateChatbot(updated as any).pipe(map(() => updated))),
    );
  }

  private patchTagsOnDepartment(input: { department: any; tags: TagString[] }): Observable<any> {
    const dept = input.department;
    const deptId = dept?._id ?? dept?.id;
    if (!deptId) return of(dept);

    const mergedTags = this.mergeTags(dept?.tags, input.tags);
    const deptName = dept?.name ?? '';
    const deptDescription = dept?.description ?? '';
    const idBot = dept?.id_bot ?? null;
    const botOnly = !!dept?.bot_only;
    const idGroup = dept?.id_group ?? null;
    const routing = dept?.routing ?? 'assigned';
    const groups = Array.isArray(dept?.groups) ? dept.groups : [];
    const allowMultipleGroups = !!dept?.allowMultipleGroups;

    return (this.departmentService.updateDept(
      deptId,
      deptName,
      deptDescription,
      idBot,
      botOnly,
      idGroup,
      routing,
      groups,
      allowMultipleGroups,
      mergedTags,
    ) as any).pipe(map(() => ({ ...dept, tags: mergedTags })));
  }
}

