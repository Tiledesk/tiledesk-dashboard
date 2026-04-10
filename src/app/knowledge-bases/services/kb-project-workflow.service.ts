import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { ProjectService } from 'app/services/project.service';
import { QuotesService } from 'app/services/quotes.service';

@Injectable({ providedIn: 'root' })
export class KbProjectWorkflowService {
  constructor(
    private projectService: ProjectService,
    private quotasService: QuotesService,
  ) {}

  loadProjectById(projectId: string): Observable<any> {
    if (!projectId) return throwError(() => new Error('projectId is required'));
    return this.projectService.getProjectById(projectId).pipe(take(1));
  }

  loadQuotas(projectId: string): Promise<any> {
    if (!projectId) return Promise.reject(new Error('projectId is required'));
    return this.quotasService.getProjectQuotes(projectId);
  }
}

