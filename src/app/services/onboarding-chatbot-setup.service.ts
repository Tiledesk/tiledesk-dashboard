import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { FaqService } from 'app/services/faq.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { ACTION_TYPE_ASKGPTV2, CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER } from 'app/utils/constants';

@Injectable({ providedIn: 'root' })
export class OnboardingChatbotSetupService {
  constructor(
    private auth: AuthService,
    private faqService: FaqService,
    private kbService: KnowledgeBaseService,
    private localDbService: LocalDbService,
    private faqKbService: FaqKbService,
    private departmentService: DepartmentService,
  ) {}

  /**
   * Imports a chatbot definition (JSON) "from scratch".
   * Returns the created FAQ KB object.
   */
  importChatbotFromJsonFromScratch(chatbotJson: any): Observable<any> {
    if (!chatbotJson) {
      return throwError(() => new Error('chatbotJson is required'));
    }
    return this.faqService.importChatbotFromJSONFromScratch(chatbotJson);
  }

  /**
   * Renames a Knowledge Base namespace and stores it as "last namespace" for the project.
   */
  renameNamespace(projectId: string, namespaceId: string, chatbotName: string): Observable<any> {
    if (!projectId) {
      return throwError(() => new Error('projectId is required'));
    }
    if (!namespaceId) {
      return throwError(() => new Error('namespaceId is required'));
    }
    if (!chatbotName) {
      return throwError(() => new Error('chatbotName is required'));
    }

    // KnowledgeBaseService.updateNamespace expects a string body (already JSON-stringified by HttpClient when needed).
    const body = JSON.stringify({ name: chatbotName });
    return this.kbService.updateNamespace(body, namespaceId).pipe(
      map((namespace: any) => {
        if (namespace) {
          this.localDbService.setInStorage(`last_kbnamespace-${projectId}`, JSON.stringify(namespace));
        }
        return namespace;
      }),
    );
  }

  /**
   * Convenience for onboarding flows that only have the chatbot name.
   * It renames the first available namespace for the current project.
   */
  renameFirstNamespaceForCurrentProject(chatbotName: string): Observable<any> {
    return this.auth.project_bs.pipe(
      take(1),
      switchMap((project: any) => {
        const projectId = project?._id || project?.id;
        if (!projectId) {
          return throwError(() => new Error('No selected project available'));
        }
        return this.kbService.getAllNamespaces().pipe(
          switchMap((namespaces: any[]) => {
            const first = namespaces?.[0];
            const namespaceId = first?.id;
            if (!namespaceId) {
              return throwError(() => new Error('No namespace available to rename'));
            }
            return this.renameNamespace(projectId, namespaceId, chatbotName);
          }),
        );
      }),
      catchError((err) => throwError(() => err)),
    );
  }

  /**
   * Full helper used by `CnpTemplatesComponent` after the name dialog.
   * - imports the chatbot JSON
   * - renames the selected namespace with the same name
   */
  importChatbotAndRenameNamespace(params: {
    chatbotJson: any;
    chatbotName: string;
    projectId: string;
    namespaceId: string;
  }): Observable<{ faqkb: any; namespace: any }> {
    const { chatbotJson, chatbotName, projectId, namespaceId } = params || ({} as any);
    if (!chatbotJson) {
      return throwError(() => new Error('chatbotJson is required'));
    }
    if (!chatbotName) {
      return throwError(() => new Error('chatbotName is required'));
    }
    if (!projectId) {
      return throwError(() => new Error('projectId is required'));
    }
    if (!namespaceId) {
      return throwError(() => new Error('namespaceId is required'));
    }

    return this.importChatbotFromJsonFromScratch(chatbotJson).pipe(
      switchMap((faqkb: any) =>
        this.renameNamespace(projectId, namespaceId, chatbotName).pipe(
          map((namespace: any) => ({ faqkb, namespace })),
        ),
      ),
    );
  }

  /**
   * Mirrors the post-import steps done in `CnpTemplatesComponent`:
   * - publish the chatbot
   * - if the default department has no bot, hook this bot to it
   */
  publishAndHookToDefaultDeptIfNeeded(faqkb: any): Observable<any> {
    const botId = faqkb?._id || faqkb?.id || faqkb;
    if (!botId) {
      return throwError(() => new Error('faqkb/botId is required'));
    }

    return this.faqKbService.publish({ _id: botId } as any).pipe(
      switchMap(() => this.departmentService.getDeptsByProjectId()),
      switchMap((departments: any[]) => {
        if (!Array.isArray(departments) || departments.length === 0) {
          return throwError(() => new Error('No departments found'));
        }

        // Match current behavior: only handle the "single default dept" case.
        if (departments.length === 1) {
          const dept = departments[0];
          if (dept?.hasBot === true) {
            return new Observable((observer) => {
              observer.next({ published: true, hooked: false });
              observer.complete();
            });
          }
          return this.departmentService.updateExistingDeptWithSelectedBot(dept._id, botId).pipe(
            map(() => ({ published: true, hooked: true })),
          );
        }

        // If multiple departments exist, do not auto-hook (keeps parity with current code where this is commented out).
        return new Observable((observer) => {
          observer.next({ published: true, hooked: false, skipped: 'multiple-departments' });
          observer.complete();
        });
      }),
    );
  }

  /**
   * Crea un chatbot basato sul template certificato "kb-official-responder" e lo collega ad un namespace KB.
   *
   * - Esporta il template in JSON
   * - Imposta `chatbotJson.name = chatbotName`
   * - Imposta `action.namespace = namespaceId` per tutte le azioni `askgptv2`
   * - Import + (ri)rinomina namespace con lo stesso nome del bot
   * - Publish + hook al default dept (se necessario)
   */
  createKbOfficialResponderChatbotForNamespace(params: {
    projectId: string;
    namespaceId: string;
    chatbotName: string;
  }): Observable<any> {
    const { projectId, namespaceId, chatbotName } = params || ({} as any);
    if (!projectId) {
      return throwError(() => new Error('projectId is required'));
    }
    if (!namespaceId) {
      return throwError(() => new Error('namespaceId is required'));
    }
    if (!chatbotName) {
      return throwError(() => new Error('chatbotName is required'));
    }

    return this.faqKbService.getTemplates().pipe(
      take(1),
      switchMap((templates: any[]) => {
        const tpl = templates?.find((t: any) =>
          t?.certifiedTags?.some((tag: any) => tag?.name === CHATBOT_TEMPLATE_TAG_KB_OFFICIAL_RESPONDER),
        );
        if (!tpl?._id) {
          return throwError(() => new Error('kb-official-responder template not found'));
        }
        return this.faqKbService.exportChatbotToJSON(tpl._id).pipe(
          take(1),
          map((chatbotJson: any) => {
            if (!chatbotJson) {
              throw new Error('exportChatbotToJSON returned empty payload');
            }

            chatbotJson['name'] = chatbotName;
            if (Array.isArray(chatbotJson?.intents)) {
              chatbotJson.intents.forEach((intent: any) => {
                const actions = intent?.actions;
                if (!Array.isArray(actions)) return;
                actions.forEach((action: any) => {
                  if (action?._tdActionType === ACTION_TYPE_ASKGPTV2) {
                    action.namespace = namespaceId;
                  }
                });
              });
            }

            return chatbotJson;
          }),
        );
      }),
      switchMap((chatbotJson: any) =>
        this.importChatbotAndRenameNamespace({ chatbotJson, chatbotName, projectId, namespaceId }),
      ),
      switchMap(({ faqkb }) => this.publishAndHookToDefaultDeptIfNeeded(faqkb)),
      catchError((err) => throwError(() => err)),
    );
  }
}

