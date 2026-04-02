import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { ProjectResolver } from './project.resolver';
import { AuthService } from './auth.service';
import { ProjectService } from 'app/services/project.service';
import { LoggerService } from 'app/services/logger/logger.service';

// ── Stubs ─────────────────────────────────────────────────────────────────────

class AuthServiceStub {
  project_bs = new BehaviorSubject<any>(null);
}

class ProjectServiceStub {
  private _returnValue: any = null;
  setReturnValue(v: any) { this._returnValue = v; }
  getProjectById(_id: string) {
    return this._returnValue instanceof Error
      ? throwError(this._returnValue)
      : of(this._returnValue);
  }
}

class LoggerServiceStub {
  log(..._args: any[]) {}
  error(..._args: any[]) {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRoute(projectid: string): ActivatedRouteSnapshot {
  return { params: { projectid } } as any;
}

function buildResolver(): {
  resolver: ProjectResolver;
  authStub: AuthServiceStub;
  projectStub: ProjectServiceStub;
} {
  const authStub      = new AuthServiceStub();
  const projectStub   = new ProjectServiceStub();
  const loggerStub    = new LoggerServiceStub();

  TestBed.configureTestingModule({
    providers: [
      ProjectResolver,
      { provide: AuthService,    useValue: authStub    },
      { provide: ProjectService, useValue: projectStub },
      { provide: LoggerService,  useValue: loggerStub  },
    ],
  });

  return {
    resolver: TestBed.inject(ProjectResolver),
    authStub,
    projectStub,
  };
}

// ── Test suite ────────────────────────────────────────────────────────────────

describe('ProjectResolver', () => {

  // ── T7.1 — fast path: project_bs già popolato con il progetto corretto ────
  describe('T7.1 — fast path: project_bs ha già il progetto corretto', () => {
    it('dovrebbe restituire il progetto da project_bs senza chiamare getProjectById', (done) => {
      const { resolver, authStub, projectStub } = buildResolver();
      const project = { _id: 'proj-123', name: 'Test' };
      authStub.project_bs.next(project);

      const spy = spyOn(projectStub, 'getProjectById').and.callThrough();

      resolver.resolve(buildRoute('proj-123')).subscribe((result) => {
        expect(result).toEqual(project);
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });
  });

  // ── T7.2 — slow path: project_bs è null → chiamata HTTP ──────────────────
  describe('T7.2 — slow path: project_bs è null → chiama getProjectById', () => {
    it('dovrebbe chiamare getProjectById con il projectid dalla route', (done) => {
      const { resolver, projectStub } = buildResolver();
      const project = { _id: 'proj-456', name: 'Remote' };
      projectStub.setReturnValue(project);

      const spy = spyOn(projectStub, 'getProjectById').and.callThrough();

      resolver.resolve(buildRoute('proj-456')).subscribe(() => {
        expect(spy).toHaveBeenCalledWith('proj-456');
        done();
      });
    });
  });

  // ── T7.3 — slow path: project_bs ha un progetto diverso → nuova chiamata ─
  describe('T7.3 — project_bs ha un progetto diverso → chiama getProjectById', () => {
    it('dovrebbe chiamare getProjectById anche se project_bs non è null', (done) => {
      const { resolver, authStub, projectStub } = buildResolver();
      authStub.project_bs.next({ _id: 'old-project', name: 'Old' });
      const newProject = { _id: 'new-project', name: 'New' };
      projectStub.setReturnValue(newProject);

      const spy = spyOn(projectStub, 'getProjectById').and.callThrough();

      resolver.resolve(buildRoute('new-project')).subscribe(() => {
        expect(spy).toHaveBeenCalledWith('new-project');
        done();
      });
    });
  });

  // ── T7.4 — pubblica su project_bs quando ottiene il progetto dal server ───
  describe('T7.4 — pubblica su project_bs dopo il fetch', () => {
    it('dovrebbe chiamare auth.project_bs.next con il progetto recuperato', (done) => {
      const { resolver, authStub, projectStub } = buildResolver();
      const project = { _id: 'proj-789', name: 'Fetched' };
      projectStub.setReturnValue(project);

      const spy = spyOn(authStub.project_bs, 'next').and.callThrough();

      resolver.resolve(buildRoute('proj-789')).subscribe(() => {
        expect(spy).toHaveBeenCalledWith(project);
        done();
      });
    });
  });

  // ── T7.5 — errore HTTP → restituisce null, non blocca la navigazione ──────
  describe('T7.5 — errore HTTP → non blocca la navigazione', () => {
    it('dovrebbe restituire null in caso di errore e non lanciare eccezioni', (done) => {
      const { resolver, projectStub } = buildResolver();
      projectStub.setReturnValue(new Error('Network error'));

      resolver.resolve(buildRoute('proj-err')).subscribe({
        next: (result) => {
          expect(result).toBeNull();
          done();
        },
        error: () => {
          fail('Il resolver non dovrebbe emettere un errore');
          done();
        },
      });
    });
  });

  // ── T7.6 — il valore emesso dall'observable è il progetto recuperato ──────
  describe('T7.6 — il valore emesso è il progetto (dati disponibili via ActivatedRoute.data)', () => {
    it('dovrebbe emettere il progetto come valore risolto', (done) => {
      const { resolver, projectStub } = buildResolver();
      const project = { _id: 'proj-data', name: 'Data' };
      projectStub.setReturnValue(project);

      resolver.resolve(buildRoute('proj-data')).subscribe((result) => {
        expect(result).toEqual(project);
        done();
      });
    });
  });
});
