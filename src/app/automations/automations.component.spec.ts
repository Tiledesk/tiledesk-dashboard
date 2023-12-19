import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationsComponent } from './automations.component';

describe('AutomationsComponent', () => {
  let component: AutomationsComponent;
  let fixture: ComponentFixture<AutomationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
