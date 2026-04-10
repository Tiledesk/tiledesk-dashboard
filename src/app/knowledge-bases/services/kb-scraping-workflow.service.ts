import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { OpenaiService } from 'app/services/openai.service';

@Injectable({ providedIn: 'root' })
/**
 * Workflow di indicizzazione/scraping (OpenAI) per una risorsa KB.
 *
 * Azioni:
 * - `checkStatus()`: legge lo stato di indicizzazione della risorsa (kb_id) per namespace/progetto
 * - `start()`: avvia lo scraping/indicizzazione per la risorsa (kb_id + source)
 *
 * Quando viene invocato:
 * - dalla tabella contenuti (azioni “Indexing / Check status”).
 *
 * Da chi viene invocato:
 * - `KnowledgeBasesFacadeService.scraping.*` (wrapper tramite `kbFacade.checkScrapingStatus()` / `kbFacade.startScraping()`)
 * - `KnowledgeBasesComponent` tramite `kbFacade.*`
 */
export class KbScrapingWorkflowService {
  constructor(private openaiService: OpenaiService) {}

  checkStatus(params: { id_project: string; namespaceId: string; kbId: string }): Observable<any> {
    const { id_project, namespaceId, kbId } = params || ({} as any);
    if (!id_project) return throwError(() => new Error('id_project is required'));
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!kbId) return throwError(() => new Error('kbId is required'));

    const data = {
      id_project,
      namespace: namespaceId,
      kb_id: kbId,
    };
    return this.openaiService.checkScrapingStatus(data);
  }

  start(params: { id_project: string; namespaceId: string; kbId: string; source: string }): Observable<any> {
    const { id_project, namespaceId, kbId, source } = params || ({} as any);
    if (!id_project) return throwError(() => new Error('id_project is required'));
    if (!namespaceId) return throwError(() => new Error('namespaceId is required'));
    if (!kbId) return throwError(() => new Error('kbId is required'));
    if (!source) return throwError(() => new Error('source is required'));

    const data = {
      id_project,
      namespace: namespaceId,
      kb_id: kbId,
      source,
    };
    return this.openaiService.startScraping(data);
  }
}

