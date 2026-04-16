import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { Onboarding2Component } from './onboarding2.component';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { KbNamespaceLinkedResourcesService } from 'app/knowledge-bases2/services/kb-namespace-linked-resources.service';

describe('Onboarding2Component', () => {
  let component: Onboarding2Component;
  let fixture: ComponentFixture<Onboarding2Component>;
  let router: jasmine.SpyObj<Router>;
  let kbService: jasmine.SpyObj<KnowledgeBaseService>;
  let kbLinkedResources: jasmine.SpyObj<KbNamespaceLinkedResourcesService>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    kbService = jasmine.createSpyObj<KnowledgeBaseService>('KnowledgeBaseService', ['getAllNamespaces', 'createNamespace', 'updateNamespace']);
    kbLinkedResources = jasmine.createSpyObj<KbNamespaceLinkedResourcesService>('KbNamespaceLinkedResourcesService', [
      'ensureOnCreate',
      'ensureOnCreateWithProgress',
    ]);

    kbService.getAllNamespaces.and.returnValue(of([]));
    kbService.createNamespace.and.returnValue(of({ id: 'ns1', name: 'My Agent' } as any));
    kbService.updateNamespace.and.returnValue(of({ id: 'ns1', name: 'My Agent' } as any));
    kbLinkedResources.ensureOnCreateWithProgress.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      declarations: [Onboarding2Component],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { projectid: 'p1' } } } },
        { provide: KnowledgeBaseService, useValue: kbService },
        { provide: KbNamespaceLinkedResourcesService, useValue: kbLinkedResources },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to knowledge-bases for current project', () => {
    component.goToKnowledgeBases();
    expect(router.navigate).toHaveBeenCalledWith(['/project/p1/knowledge-bases']);
  });

  it('skips provisioning when namespaces already exist', fakeAsync(() => {
    kbService.getAllNamespaces.and.returnValue(of([{ id: 'nsExisting', name: 'Existing' } as any]));

    // Recreate to re-run ngOnInit pipeline with new mocks
    fixture = TestBed.createComponent(Onboarding2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(0);

    expect(kbService.createNamespace).not.toHaveBeenCalled();
    expect(kbLinkedResources.ensureOnCreateWithProgress).not.toHaveBeenCalled();
  }));

  it('renames auto-created Default namespace to defaultName and provisions on it', fakeAsync(() => {
    kbService.getAllNamespaces.and.returnValue(of([{ id: 'nsDefault', name: 'Default' } as any]));
    kbService.updateNamespace.and.returnValue(of({ id: 'nsDefault', name: 'My Agent' } as any));

    fixture = TestBed.createComponent(Onboarding2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(0);

    expect(kbService.updateNamespace).toHaveBeenCalled();
    expect(kbLinkedResources.ensureOnCreateWithProgress).toHaveBeenCalled();
  }));

  it('creates default namespace and ensures linked resources when none exist', fakeAsync(() => {
    kbService.getAllNamespaces.and.returnValue(of([]));

    fixture = TestBed.createComponent(Onboarding2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(0);

    expect(kbService.createNamespace).toHaveBeenCalled();
    expect(kbLinkedResources.ensureOnCreateWithProgress).toHaveBeenCalled();
  }));

  it('shows an error and allows retry provisioning', fakeAsync(() => {
    kbService.getAllNamespaces.and.returnValue(of([]));
    kbLinkedResources.ensureOnCreateWithProgress.and.returnValue(throwError(() => new Error('boom')));

    fixture = TestBed.createComponent(Onboarding2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(0);

    expect(component.provisioningError).toBeTruthy();

    kbLinkedResources.ensureOnCreateWithProgress.and.returnValue(of({} as any));
    component.retryProvisioning();
    tick(0);
    expect(kbLinkedResources.ensureOnCreateWithProgress).toHaveBeenCalled();
  }));

  it('redirects only after minimum delay', fakeAsync(() => {
    kbService.getAllNamespaces.and.returnValue(of([]));

    fixture = TestBed.createComponent(Onboarding2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(0);

    // before 5s: no redirect yet
    tick(4999);
    expect(router.navigate).not.toHaveBeenCalled();

    tick(1);
    expect(router.navigate).toHaveBeenCalled();
  }));
});

