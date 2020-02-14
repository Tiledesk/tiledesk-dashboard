import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqTestComponent } from './faq-test.component';

describe('FaqTestComponent', () => {
  let component: FaqTestComponent;
  let fixture: ComponentFixture<FaqTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
