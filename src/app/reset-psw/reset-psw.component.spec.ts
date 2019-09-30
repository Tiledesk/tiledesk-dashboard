import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPswComponent } from './reset-psw.component';

describe('ResetPswComponent', () => {
  let component: ResetPswComponent;
  let fixture: ComponentFixture<ResetPswComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPswComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPswComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
