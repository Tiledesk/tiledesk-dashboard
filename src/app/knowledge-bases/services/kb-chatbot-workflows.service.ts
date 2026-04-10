import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { OnboardingChatbotSetupService } from 'app/services/onboarding-chatbot-setup.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow “post-name-dialog” per i chatbot creati nella pagina Knowledge Bases.
 *
 * Azioni:
 * - importa il chatbot JSON nel progetto
 * - rinomina il namespace (agente) con lo stesso nome del bot
 * - pubblica il bot e (se possibile) lo aggancia al dipartimento di default
 *
 * Quando viene invocato:
 * - dopo la chiusura della modale `ModalChatbotNameComponent` (nome bot confermato).
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesFacadeService.chatbots.*` (wrapper tramite `kbFacade.chatbots...`)
 * - `KnowledgeBasesComponent.importChatbotFromJSON()` tramite `kbFacade.chatbots...` (indiretto).
 */
export class KbChatbotWorkflowsService {
  constructor(private onboardingChatbotSetupService: OnboardingChatbotSetupService) {}

  /**
   * Workflow "post name dialog" per Knowledge Bases:
   * - Import del chatbot JSON nel progetto
   * - Rinomina namespace (agent) con lo stesso nome del bot
   * - Publish + hook al default dept se necessario
   */
  importPublishHookAndRenameNamespace(params: {
    projectId: string;
    namespaceId: string;
    chatbotJson: any;
    chatbotName: string;
  }): Observable<{ faqkb: any; namespace: any; published: any }> {
    const { projectId, namespaceId, chatbotJson, chatbotName } = params || ({} as any);
    if (!projectId) return throwError(() => new Error('projectId is required'));
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!chatbotJson) return throwError(() => new Error('chatbotJson is required'));
    if (!chatbotName) return throwError(() => new Error('chatbotName is required'));

    return this.onboardingChatbotSetupService
      .importChatbotAndRenameNamespace({ projectId, namespaceId, chatbotJson, chatbotName })
      .pipe(
        switchMap(({ faqkb, namespace }) =>
          this.onboardingChatbotSetupService.publishAndHookToDefaultDeptIfNeeded(faqkb).pipe(
            map((published: any) => ({ faqkb, namespace, published })),
          ),
        ),
      );
  }
}

