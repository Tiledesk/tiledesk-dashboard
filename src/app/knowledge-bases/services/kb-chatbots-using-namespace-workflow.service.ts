import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { KnowledgeBaseService } from 'app/services/knowledge-base.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow “read-only” per recuperare i chatbot associati ad un namespace.
 *
 * Azioni:
 * - chiama l’endpoint che ritorna i chatbot che usano il namespace selezionato
 *
 * Quando viene invocato:
 * - cambio namespace
 * - dopo import/creazione/publish bot, per refresh della sezione chatbots
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesFacadeService.getChatbotsUsingNamespace()`
 * - `KnowledgeBasesComponent.getChatbotUsingNamespace()` tramite `kbFacade.getChatbotsUsingNamespace()`
 */
export class KbChatbotsUsingNamespaceWorkflowService {
  constructor(private kbService: KnowledgeBaseService) {}

  getChatbotsUsingNamespace(namespaceId: string): Observable<any> {
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    return this.kbService.getChatbotsUsingNamespace(namespaceId);
  }
}

