import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAnswerComponent } from './panel-answer.component';

describe('PanelAnswerComponent', () => {
  let component: PanelAnswerComponent;
  let fixture: ComponentFixture<PanelAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelAnswerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
