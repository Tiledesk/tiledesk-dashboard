import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorResultComponent } from './error-result.component';

describe('ErrorResultComponent', () => {
  let component: ErrorResultComponent;
  let fixture: ComponentFixture<ErrorResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorResultComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
