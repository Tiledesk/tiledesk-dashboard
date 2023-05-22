import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpQuestionButtonComponent } from './cnp-question-button.component';

describe('CnpQuestionButtonComponent', () => {
  let component: CnpQuestionButtonComponent;
  let fixture: ComponentFixture<CnpQuestionButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpQuestionButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpQuestionButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
