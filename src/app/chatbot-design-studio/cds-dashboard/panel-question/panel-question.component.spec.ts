import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelQuestionComponent } from './panel-question.component';

describe('PanelQuestionComponent', () => {
  let component: PanelQuestionComponent;
  let fixture: ComponentFixture<PanelQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelQuestionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
