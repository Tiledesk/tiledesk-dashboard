import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbAlertComponent } from './kb-alert.component';

describe('KbAlertComponent', () => {
  let component: KbAlertComponent;
  let fixture: ComponentFixture<KbAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KbAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
