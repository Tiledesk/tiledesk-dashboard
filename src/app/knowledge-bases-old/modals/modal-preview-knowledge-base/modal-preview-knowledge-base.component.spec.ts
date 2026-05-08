import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPreviewKnowledgeBaseComponent } from './modal-preview-knowledge-base.component';

describe('ModalPreviewKnowledgeBaseComponent', () => {
  let component: ModalPreviewKnowledgeBaseComponent;
  let fixture: ComponentFixture<ModalPreviewKnowledgeBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPreviewKnowledgeBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPreviewKnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
