import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBaseTableComponent } from './knowledge-base-table.component';

describe('KnowledgeBaseTableComponent', () => {
  let component: KnowledgeBaseTableComponent;
  let fixture: ComponentFixture<KnowledgeBaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBaseTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
