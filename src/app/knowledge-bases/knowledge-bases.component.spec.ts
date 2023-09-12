import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBasesComponent } from './knowledge-bases.component';

describe('KnowledgeBasesComponent', () => {
  let component: KnowledgeBasesComponent;
  let fixture: ComponentFixture<KnowledgeBasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBasesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
