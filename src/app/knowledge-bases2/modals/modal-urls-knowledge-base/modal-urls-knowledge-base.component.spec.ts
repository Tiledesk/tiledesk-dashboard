import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUrlsKnowledgeBaseComponent } from './modal-urls-knowledge-base.component';

describe('ModalUrlsKnowledgeBaseComponent', () => {
  let component: ModalUrlsKnowledgeBaseComponent;
  let fixture: ComponentFixture<ModalUrlsKnowledgeBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUrlsKnowledgeBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUrlsKnowledgeBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
