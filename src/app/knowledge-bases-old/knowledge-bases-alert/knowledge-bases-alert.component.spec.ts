import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeBasesAlertComponent } from './knowledge-bases-alert.component';

describe('KnowledgeBasesAlertComponent', () => {
  let component: KnowledgeBasesAlertComponent;
  let fixture: ComponentFixture<KnowledgeBasesAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeBasesAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeBasesAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
