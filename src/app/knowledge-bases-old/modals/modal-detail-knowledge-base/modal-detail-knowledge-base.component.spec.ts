import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDetailKnowledgeBaseComponent } from './modal-detail-knowledge-base.component';

describe('ModalDetailKnowledgeBaseComponent', () => {
  let component: ModalDetailKnowledgeBaseComponent;
  let fixture: ComponentFixture<ModalDetailKnowledgeBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDetailKnowledgeBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDetailKnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
