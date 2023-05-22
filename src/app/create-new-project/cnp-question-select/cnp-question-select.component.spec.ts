import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpQuestionSelectComponent } from './cnp-question-select.component';

describe('CnpQuestionSelectComponent', () => {
  let component: CnpQuestionSelectComponent;
  let fixture: ComponentFixture<CnpQuestionSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpQuestionSelectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpQuestionSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
