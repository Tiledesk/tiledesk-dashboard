import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationStaticComponent } from './automation-static.component';

describe('AutomationStaticComponent', () => {
  let component: AutomationStaticComponent;
  let fixture: ComponentFixture<AutomationStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
