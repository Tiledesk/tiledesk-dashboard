import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBasesPreviousComponent } from './knowledge-bases-previous.component';

describe('KnowledgeBasesPreviousComponent', () => {
  let component: KnowledgeBasesPreviousComponent;
  let fixture: ComponentFixture<KnowledgeBasesPreviousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBasesPreviousComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBasesPreviousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
