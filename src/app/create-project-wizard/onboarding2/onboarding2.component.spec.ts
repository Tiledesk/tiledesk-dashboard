import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Onboarding2Component } from './onboarding2.component';

describe('Onboarding2Component', () => {
  let component: Onboarding2Component;
  let fixture: ComponentFixture<Onboarding2Component>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    await TestBed.configureTestingModule({
      declarations: [Onboarding2Component],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { projectid: 'p1' } } } },
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
});

