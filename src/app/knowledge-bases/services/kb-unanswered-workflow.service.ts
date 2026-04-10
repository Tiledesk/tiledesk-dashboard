import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { UnansweredQuestionsService } from 'app/services/unanswered-questions.service';

@Injectable({ providedIn: 'root' })
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

