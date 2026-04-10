import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { take } from 'rxjs/operators';

import { ProjectService } from 'app/services/project.service';
import { QuotesService } from 'app/services/quotes.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow legati al progetto nel contesto Knowledge Bases.
 *
 * Azioni:
 * - `loadProjectById()`: recupera profilo piano/subscription e customization (usati per abilitare feature/limiti UI)
 * - `loadQuotas()`: recupera quote/limiti progetto (risorse KB, ecc.)
 *
 * Quando viene invocato:
 * - all’apertura pagina KB, dopo aver ottenuto `projectId` (AuthService.project_bs)
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesFacadeService.project.*` (wrapper tramite `kbFacade.loadProjectById()` / `kbFacade.loadQuotas()`)
 * - `KnowledgeBasesComponent.getProjectById()` e `getQuotas()` tramite facade
 */
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

