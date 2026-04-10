import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { UnansweredQuestionsService } from 'app/services/unanswered-questions.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow per la tab “Unanswered questions”.
 *
 * Azioni:
 * - carica pagine di domande senza risposta per `projectId` + `namespaceId` con sorting/paginazione.
 *
 * Quando viene invocato:
 * - apertura tab “Unanswered”
 * - refresh / load more
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesFacadeService.unanswered.*` (wrapper tramite `kbFacade.loadUnansweredQuestions()`)
 * - `KnowledgeBasesComponent.loadUnansweredQuestions()`
 */
export class KbUnansweredWorkflowService {
  constructor(private unansweredQuestionsService: UnansweredQuestionsService) {}

  load(params: {
    projectId: string;
    namespaceId: string;
    limit: number;
    page: number;
    sortField: string;
    direction: number;
  }): Observable<any> {
    const { projectId, namespaceId, limit, page, sortField, direction } = params || ({} as any);
    if (!projectId) return throwError(() => new Error('projectId is required'));
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    return this.unansweredQuestionsService.getUnansweredQuestions(
      projectId,
      namespaceId,
      limit,
      page,
      sortField,
      direction,
    );
  }
}

