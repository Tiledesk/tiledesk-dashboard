import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError, take } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { ProjectService } from 'app/services/project.service';
import { LoggerService } from 'app/services/logger/logger.service';

/**
 * ProjectResolver
 *
 * Garantisce che `auth.project_bs` contenga il progetto corretto **prima**
 * che il componente di destinazione venga istanziato.
 *
 * Flusso:
 * 1. Se `project_bs` ha già il progetto con l'ID corretto → restituisce
 *    il valore in cache senza chiamate HTTP.
 * 2. Altrimenti chiama `projectService.getProjectById`, pubblica il risultato
 *    su `project_bs` e restituisce il progetto risolto.
 * 3. In caso di errore HTTP → restituisce `null` (navigazione non bloccata).
 *
 * In questo step il resolver **coesiste** con la chiamata a `getProjectById`
 * presente in `HomeComponent`. La chiamata del componente sarà rimossa nello
 * Step 9 (Slim HomeComponent). Grazie al `shareReplay(1)` interno al
 * `ProjectService`, non avvengono doppie richieste HTTP.
 */
@Injectable({ providedIn: 'root' })
export class ProjectResolver implements Resolve<any> {

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private logger: LoggerService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const projectId = route.params['projectid'];
    this.logger.log('[PROJECT-RESOLVER] resolve called for projectId:', projectId);

    // ── Fast path: il progetto giusto è già in project_bs ─────────────────
    const current = this.auth.project_bs.value;
    if (current?._id === projectId) {
      this.logger.log('[PROJECT-RESOLVER] project_bs already has the correct project, skipping HTTP call.');
      return of(current);
    }

    // ── Slow path: fetch dal server e pubblica su project_bs ──────────────
    return this.projectService.getProjectById(projectId).pipe(
      take(1),
      tap((project: any) => {
        if (project) {
          this.logger.log('[PROJECT-RESOLVER] fetched project, publishing to project_bs:', project._id);
          // Pubblica solo se project_bs non è stato aggiornato nel frattempo
          // (es. da AuthGuard che corre in parallelo)
          if (this.auth.project_bs.value?._id !== projectId) {
            this.auth.project_bs.next(project);
          }
        }
      }),
      catchError((err) => {
        this.logger.error('[PROJECT-RESOLVER] error fetching project:', err);
        return of(null);
      }),
    );
  }
}
