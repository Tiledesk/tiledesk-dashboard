import { TestBed } from '@angular/core/testing';
import { ProjectInitializerService } from './project-initializer.service';
import { UsersService } from 'app/services/users.service';
import { QuotesService } from 'app/services/quotes.service';
import { LoggerService } from 'app/services/logger/logger.service';

// ── Stubs ─────────────────────────────────────────────────────────────────────

class UsersServiceStub {
  getAllUsersOfCurrentProjectAndSaveInStorage(): void {}
  getBotsByProjectIdAndSaveInStorage(): void {}
}

class QuotesServiceStub {
  requestQuotasUpdate(): void {}
}

class LoggerServiceStub {
  log(..._args: any[]) {}
  error(..._args: any[]) {}
}

// ── Helper ────────────────────────────────────────────────────────────────────

function buildService(): {
  svc: ProjectInitializerService;
  usersStub: UsersServiceStub;
  quotesStub: QuotesServiceStub;
} {
  const usersStub  = new UsersServiceStub();
  const quotesStub = new QuotesServiceStub();

  TestBed.configureTestingModule({
    providers: [
      ProjectInitializerService,
      { provide: UsersService,  useValue: usersStub  },
      { provide: QuotesService, useValue: quotesStub },
      { provide: LoggerService, useValue: new LoggerServiceStub() },
    ],
  });

  return { svc: TestBed.inject(ProjectInitializerService), usersStub, quotesStub };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('ProjectInitializerService', () => {

  // ── T8.1 — chiama getAllUsersOfCurrentProjectAndSaveInStorage ─────────────
  describe('T8.1 — chiama getAllUsersOfCurrentProjectAndSaveInStorage', () => {
    it('dovrebbe salvare gli utenti del progetto in storage', () => {
      const { svc, usersStub } = buildService();
      const spy = spyOn(usersStub, 'getAllUsersOfCurrentProjectAndSaveInStorage');

      svc.initialize('proj-1');

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ── T8.2 — chiama getBotsByProjectIdAndSaveInStorage ─────────────────────
  describe('T8.2 — chiama getBotsByProjectIdAndSaveInStorage', () => {
    it('dovrebbe salvare i bot del progetto in storage', () => {
      const { svc, usersStub } = buildService();
      const spy = spyOn(usersStub, 'getBotsByProjectIdAndSaveInStorage');

      svc.initialize('proj-2');

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ── T8.3 — chiama requestQuotasUpdate ────────────────────────────────────
  describe('T8.3 — chiama requestQuotasUpdate', () => {
    it('dovrebbe notificare la Navbar di aggiornare le quote', () => {
      const { svc, quotesStub } = buildService();
      const spy = spyOn(quotesStub, 'requestQuotasUpdate');

      svc.initialize('proj-3');

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ── T8.4 — tutte e tre le chiamate avvengono in un singolo initialize ─────
  describe('T8.4 — initialize esegue tutte e tre le operazioni in un unico invocation', () => {
    it('dovrebbe chiamare tutti e tre i metodi', () => {
      const { svc, usersStub, quotesStub } = buildService();
      const spyUsers  = spyOn(usersStub, 'getAllUsersOfCurrentProjectAndSaveInStorage');
      const spyBots   = spyOn(usersStub, 'getBotsByProjectIdAndSaveInStorage');
      const spyQuotes = spyOn(quotesStub, 'requestQuotasUpdate');

      svc.initialize('proj-4');

      expect(spyUsers).toHaveBeenCalledTimes(1);
      expect(spyBots).toHaveBeenCalledTimes(1);
      expect(spyQuotes).toHaveBeenCalledTimes(1);
    });
  });

  // ── T8.5 — chiamate multiple (cambio progetto) ────────────────────────────
  describe('T8.5 — chiamate multiple per cambio progetto', () => {
    it('dovrebbe eseguire le operazioni per ogni chiamata a initialize', () => {
      const { svc, usersStub, quotesStub } = buildService();
      const spyUsers  = spyOn(usersStub, 'getAllUsersOfCurrentProjectAndSaveInStorage');
      const spyQuotes = spyOn(quotesStub, 'requestQuotasUpdate');

      svc.initialize('proj-A');
      svc.initialize('proj-B');

      expect(spyUsers).toHaveBeenCalledTimes(2);
      expect(spyQuotes).toHaveBeenCalledTimes(2);
    });
  });

  // ── T8.6 — nessuna eccezione se i servizi sono disponibili ───────────────
  describe('T8.6 — non lancia eccezioni', () => {
    it('dovrebbe completare senza errori con un projectId valido', () => {
      const { svc } = buildService();
      expect(() => svc.initialize('proj-safe')).not.toThrow();
    });
  });
});
