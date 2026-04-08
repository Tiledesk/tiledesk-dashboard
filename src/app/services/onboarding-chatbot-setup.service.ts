import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from 'app/core/auth.service';
import { FaqService } from 'app/services/faq.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';

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
}

