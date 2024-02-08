import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteKnowledgeBaseComponent } from './modal-delete-knowledge-base.component';

describe('ModalDeleteKnowledgeBaseComponent', () => {
  let component: ModalDeleteKnowledgeBaseComponent;
  let fixture: ComponentFixture<ModalDeleteKnowledgeBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDeleteKnowledgeBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDeleteKnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
