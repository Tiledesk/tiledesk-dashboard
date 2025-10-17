import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationCreateComponent } from './automation-create.component';

describe('AutomationCreateComponent', () => {
  let component: AutomationCreateComponent;
  let fixture: ComponentFixture<AutomationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
