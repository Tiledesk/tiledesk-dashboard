/**
 * home-testbed.factory.ts
 *
 * Factory riusabile per configurare il TestBed di HomeComponent.
 * Centralizza tutti i provider/stub in un unico punto: ogni test spec
 * può importare questo factory e, opzionalmente, sovrascrivere singoli provider.
 *
 * Utilizzo base:
 *   const { fixture, component } = await createHomeTestBed();
 *
 * Utilizzo con override:
 *   const customRoles = new RolesServiceStub();
 *   customRoles.emitPermissions('agent');
 *   const { fixture, component } = await createHomeTestBed({
 *     providers: [{ provide: RolesService, useValue: customRoles }]
 *   });
 */

import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA }  from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { HomeComponent }     from 'app/home/home.component';

// Services
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

// Stubs
import { AuthServiceStub }      from './stubs/auth.stub';
import { UsersServiceStub }     from './stubs/users.stub';
import { ProjectServiceStub }   from './stubs/project.stub';
import { QuotesServiceStub }    from './stubs/quotes.stub';
import { RolesServiceStub }     from './stubs/roles.stub';
import { AppConfigServiceStub } from './stubs/app-config.stub';
import { BrandServiceStub }     from './stubs/brand.stub';
import { TranslateServiceStub } from './stubs/translate.stub';
import {
  NotifyServiceStub,
  LocalDbServiceStub,
  ProjectPlanServiceStub,
  FaqKbServiceStub,
  LoggerServiceStub,
  AppStoreServiceStub,
  DepartmentServiceStub
} from './stubs/misc.stubs';

export interface HomeTestBedOptions {
  /** Provider aggiuntivi o override di quelli di default */
  providers?: any[];
}

export interface HomeTestBedResult {
  fixture:   ComponentFixture<HomeComponent>;
  component: HomeComponent;
  /** Istanze degli stub — utili per fare spy o emettere valori */
  stubs: {
    auth:         AuthServiceStub;
    users:        UsersServiceStub;
    project:      ProjectServiceStub;
    quotes:       QuotesServiceStub;
    roles:        RolesServiceStub;
    appConfig:    AppConfigServiceStub;
    brand:        BrandServiceStub;
    translate:    TranslateServiceStub;
    notify:       NotifyServiceStub;
    localDb:      LocalDbServiceStub;
    projectPlan:  ProjectPlanServiceStub;
    faqKb:        FaqKbServiceStub;
    logger:       LoggerServiceStub;
  };
}

/**
 * Crea e restituisce un TestBed configurato per HomeComponent.
 * Da chiamare dentro waitForAsync/fakeAsync.
 */
export async function createHomeTestBed(
  options: HomeTestBedOptions = {}
): Promise<HomeTestBedResult> {

  const authStub        = new AuthServiceStub();
  const usersStub       = new UsersServiceStub();
  const projectStub     = new ProjectServiceStub();
  const quotesStub      = new QuotesServiceStub();
  const rolesStub       = new RolesServiceStub();
  const appConfigStub   = new AppConfigServiceStub();
  const brandStub       = new BrandServiceStub();
  const translateStub   = new TranslateServiceStub();
  const notifyStub      = new NotifyServiceStub();
  const localDbStub     = new LocalDbServiceStub();
  const projectPlanStub = new ProjectPlanServiceStub();
  const faqKbStub       = new FaqKbServiceStub();
  const loggerStub      = new LoggerServiceStub();

  const defaultProviders = [
    { provide: AuthService,        useValue: authStub        },
    { provide: UsersService,       useValue: usersStub       },
    { provide: LocalDbService,     useValue: localDbStub     },
    { provide: NotifyService,      useValue: notifyStub      },
    { provide: TranslateService,   useValue: translateStub   },
    { provide: ProjectPlanService, useValue: projectPlanStub },
    { provide: AppConfigService,   useValue: appConfigStub   },
    { provide: BrandService,       useValue: brandStub       },
    { provide: FaqKbService,       useValue: faqKbStub       },
    { provide: LoggerService,      useValue: loggerStub      },
    { provide: ProjectService,     useValue: projectStub     },
    { provide: AppStoreService,    useValue: new AppStoreServiceStub()   },
    { provide: DepartmentService,  useValue: new DepartmentServiceStub() },
    { provide: QuotesService,      useValue: quotesStub      },
    { provide: RolesService,       useValue: rolesStub       },
  ];

  // Gli override dell'utente sostituiscono i provider di default con lo stesso token
  const mergedProviders = mergeProviders(defaultProviders, options.providers ?? []);

  await TestBed.configureTestingModule({
    declarations: [HomeComponent],
    imports:      [RouterTestingModule],
    providers:    mergedProviders,
    schemas:      [NO_ERRORS_SCHEMA]   // sopprime errori da componenti figlio non dichiarati
  }).compileComponents();

  const fixture   = TestBed.createComponent(HomeComponent);
  const component = fixture.componentInstance;

  return {
    fixture,
    component,
    stubs: {
      auth:        authStub,
      users:       usersStub,
      project:     projectStub,
      quotes:      quotesStub,
      roles:       rolesStub,
      appConfig:   appConfigStub,
      brand:       brandStub,
      translate:   translateStub,
      notify:      notifyStub,
      localDb:     localDbStub,
      projectPlan: projectPlanStub,
      faqKb:       faqKbStub,
      logger:      loggerStub,
    }
  };
}

/** Unisce due array di provider: i provider con lo stesso token negli `overrides` vincono. */
function mergeProviders(defaults: any[], overrides: any[]): any[] {
  if (!overrides.length) { return defaults; }
  const overrideTokens = new Set(overrides.map(p => p.provide));
  return [
    ...defaults.filter(p => !overrideTokens.has(p.provide)),
    ...overrides
  ];
}
