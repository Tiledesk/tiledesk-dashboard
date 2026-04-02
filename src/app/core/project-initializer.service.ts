import { Injectable } from '@angular/core';

import { UsersService } from 'app/services/users.service';
import { QuotesService } from 'app/services/quotes.service';
import { LoggerService } from 'app/services/logger/logger.service';

/**
 * ProjectInitializerService
 *
 * Centralizza i side-effect di avvio per un progetto attivo:
 *   1. Salva gli utenti del progetto in localStorage (usato da sidebar e chat)
 *   2. Salva i bot del progetto in localStorage (usato da chat e altri componenti)
 *   3. Notifica la Navbar di aggiornare i dati delle quote
 *
 * Il metodo `initialize(projectId)` viene chiamato da `HomeComponent` ogni volta
 * che `auth.project_bs` emette un nuovo progetto valido.
 *
 * In Step 9 (Slim HomeComponent) il punto di chiamata sarà spostato nel
 * `ProjectResolver`, rendendo l'inizializzazione indipendente dalla Home.
 */
@Injectable({ providedIn: 'root' })
export class ProjectInitializerService {

  constructor(
    private usersService: UsersService,
    private quotesService: QuotesService,
    private logger: LoggerService,
  ) {}

  /**
   * Esegue tutti i side-effect di avvio per il progetto `projectId`.
   * Fire-and-forget: non restituisce Observable.
   */
  initialize(projectId: string): void {
    this.logger.log('[PROJECT-INIT] initialize for project:', projectId);

    // 1. Salva tutti gli utenti del progetto in localStorage
    this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

    // 2. Salva i bot del progetto in localStorage
    this.usersService.getBotsByProjectIdAndSaveInStorage();

    // 3. Notifica la Navbar di recuperare i dati aggiornati delle quote
    this.quotesService.requestQuotasUpdate();
  }
}
