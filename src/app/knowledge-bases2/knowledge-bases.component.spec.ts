import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBases2Component } from './knowledge-bases.component';

describe('KnowledgeBases2Component', () => {
  let component: KnowledgeBases2Component;
  let fixture: ComponentFixture<KnowledgeBases2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBases2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBases2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
