/**
 * home.component.spec.ts — Step 1: Baseline di test
 *
 * Scopo:
 *   - Verificare che HomeComponent si compili e si monti senza errori (T1.1, T1.2)
 *   - Verificare che tutti i service stub siano iniettabili senza NullInjectorError (T1.4)
 *   - Stabilire una baseline strutturale del template (T1.3)
 *   - Preparare l'infrastruttura riusabile per gli step successivi
 *
 * Pattern:
 *   Il TestBed viene configurato in beforeEach (non nelle singole it).
 *   Questo evita problemi di tracking zone.js con async/await nested.
 */

import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA }  from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent } from './home.component';

import { AuthService }        from 'app/core/auth.service';
import { UsersService }       from 'app/services/users.service';
import { LocalDbService }     from 'app/services/users-local-db.service';
import { NotifyService }      from 'app/core/notify.service';
import { TranslateService }   from '@ngx-translate/core';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { AppConfigService }   from 'app/services/app-config.service';
import { BrandService }       from 'app/services/brand.service';
import { FaqKbService }       from 'app/services/faq-kb.service';
import { LoggerService }      from 'app/services/logger/logger.service';
import { ProjectService }     from 'app/services/project.service';
import { AppStoreService }    from 'app/services/app-store.service';
import { DepartmentService }  from 'app/services/department.service';
import { QuotesService }      from 'app/services/quotes.service';
import { RolesService }       from 'app/services/roles.service';
import { PermissionsService } from 'app/core/permissions.service';
import { FeatureToggleService } from 'app/core/feature-toggle.service';

import { AuthServiceStub }      from 'app/testing/stubs/auth.stub';
import { UsersServiceStub }     from 'app/testing/stubs/users.stub';
import { ProjectServiceStub }   from 'app/testing/stubs/project.stub';
import { QuotesServiceStub }    from 'app/testing/stubs/quotes.stub';
import { RolesServiceStub }     from 'app/testing/stubs/roles.stub';
import { AppConfigServiceStub } from 'app/testing/stubs/app-config.stub';
import { BrandServiceStub }     from 'app/testing/stubs/brand.stub';
import { TranslateServiceStub } from 'app/testing/stubs/translate.stub';
import {
  NotifyServiceStub,
  LocalDbServiceStub,
  ProjectPlanServiceStub,
  FaqKbServiceStub,
  LoggerServiceStub,
  AppStoreServiceStub,
  DepartmentServiceStub,
  PermissionsServiceStub
} from 'app/testing/stubs/misc.stubs';

// ─────────────────────────────────────────────────────────────────────────────
// Istanze degli stub condivise tra le describe (accessibili via closure)
// ─────────────────────────────────────────────────────────────────────────────
let fixture:   ComponentFixture<HomeComponent>;
let component: HomeComponent;

let authStub:        AuthServiceStub;
let usersStub:       UsersServiceStub;
let projectStub:     ProjectServiceStub;
let quotesStub:      QuotesServiceStub;
let rolesStub:       RolesServiceStub;
let appConfigStub:   AppConfigServiceStub;
let brandStub:       BrandServiceStub;
let translateStub:   TranslateServiceStub;

function buildProviders() {
  authStub      = new AuthServiceStub();
  usersStub     = new UsersServiceStub();
  projectStub   = new ProjectServiceStub();
  quotesStub    = new QuotesServiceStub();
  rolesStub     = new RolesServiceStub();
  appConfigStub = new AppConfigServiceStub();
  brandStub     = new BrandServiceStub();
  translateStub = new TranslateServiceStub();

  return [
    { provide: AuthService,        useValue: authStub        },
    { provide: UsersService,       useValue: usersStub       },
    { provide: LocalDbService,     useValue: new LocalDbServiceStub()     },
    { provide: NotifyService,      useValue: new NotifyServiceStub()      },
    { provide: TranslateService,   useValue: translateStub   },
    { provide: ProjectPlanService, useValue: new ProjectPlanServiceStub() },
    { provide: AppConfigService,   useValue: appConfigStub   },
    { provide: BrandService,       useValue: brandStub       },
    { provide: FaqKbService,       useValue: new FaqKbServiceStub()       },
    { provide: LoggerService,      useValue: new LoggerServiceStub()      },
    { provide: ProjectService,     useValue: projectStub     },
    { provide: AppStoreService,    useValue: new AppStoreServiceStub()    },
    { provide: DepartmentService,  useValue: new DepartmentServiceStub()  },
    { provide: QuotesService,        useValue: quotesStub                    },
    { provide: RolesService,         useValue: rolesStub                     },
    { provide: PermissionsService,   useValue: new PermissionsServiceStub()  },
    { provide: FeatureToggleService, useValue: { isVisiblePay: false, isVisibleANA: false, isVisibleAPP: false, isVisibleOPH: false, isVisibleHomeBanner: false, projectPlanBadge: false, isVisibleKNB: false, isVisibleQIN: false } },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// T1.1 / T1.2 — Compilazione e mount del componente
// ─────────────────────────────────────────────────────────────────────────────
describe('HomeComponent — Step 1: Baseline', () => {

  describe('T1.1 + T1.2: smoke test (compilazione e mount)', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports:      [RouterTestingModule],
        providers:    buildProviders(),
        schemas:      [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture   = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
    });

    it('T1.2 — dovrebbe creare il componente senza eccezioni', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component).toBeTruthy();
    });

    it('dovrebbe avere projectId non definito prima di ricevere il progetto', () => {
      fixture.detectChanges();
      expect(component.projectId).toBeFalsy();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T1.4 — Nessun NullInjectorError: tutti i provider risolti
  // ─────────────────────────────────────────────────────────────────────────
  describe('T1.4: nessun NullInjectorError', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports:      [RouterTestingModule],
        providers:    buildProviders(),
        schemas:      [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    it('dovrebbe iniettare tutti i servizi senza NullInjectorError', () => {
      expect(() => {
        fixture   = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // T1.3 — Baseline strutturale del template
  // ─────────────────────────────────────────────────────────────────────────
  describe('T1.3: baseline strutturale del template', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports:      [RouterTestingModule],
        providers:    buildProviders(),
        schemas:      [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture   = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('dovrebbe renderizzare l\'elemento host del componente', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el).toBeTruthy();
    });

    it('dovrebbe avere showSpinner=true inizialmente', () => {
      expect(component.showSpinner).toBe(true);
    });

    it('dovrebbe avere USER_ROLE impostato dopo emissione del ruolo', () => {
      usersStub.project_user_role_bs.next('owner');
      fixture.detectChanges();
      expect(component.USER_ROLE).toBe('owner');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Reattività agli stub
  // ─────────────────────────────────────────────────────────────────────────
  describe('reattività agli stub', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports:      [RouterTestingModule],
        providers:    buildProviders(),
        schemas:      [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture   = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('dovrebbe aggiornare USER_ROLE al cambio del ruolo', () => {
      usersStub.project_user_role_bs.next('agent');
      fixture.detectChanges();
      expect(component.USER_ROLE).toBe('agent');

      usersStub.project_user_role_bs.next('admin');
      fixture.detectChanges();
      expect(component.USER_ROLE).toBe('admin');
    });

    it('dovrebbe impostare projectId quando project_bs emette un progetto', () => {
      spyOn(projectStub, 'getProjectById').and.callThrough();

      authStub.project_bs.next({
        _id: 'test-project-id',
        name: 'Test Project',
        activeOperatingHours: false
      });
      fixture.detectChanges();

      expect(component.projectId).toBe('test-project-id');
      expect(projectStub.getProjectById).toHaveBeenCalledWith('test-project-id');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ngOnDestroy
  // ─────────────────────────────────────────────────────────────────────────
  describe('lifecycle — ngOnDestroy', () => {

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [HomeComponent],
        imports:      [RouterTestingModule],
        providers:    buildProviders(),
        schemas:      [NO_ERRORS_SCHEMA]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture   = TestBed.createComponent(HomeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('dovrebbe eseguire ngOnDestroy senza eccezioni', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Factory helper (home-testbed.factory.ts) — verifica che l'export funzioni
  // ─────────────────────────────────────────────────────────────────────────
  describe('home-testbed.factory — import funzionante', () => {
    it('dovrebbe esportare createHomeTestBed senza errori di import', () => {
      // Verifica che il modulo factory sia importabile (test di smoke dell'infrastruttura)
      const factory = require('app/testing/home-testbed.factory');
      expect(factory.createHomeTestBed).toBeDefined();
      expect(typeof factory.createHomeTestBed).toBe('function');
    });
  });
});
