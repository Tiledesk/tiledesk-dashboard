import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionAskgptComponent } from './action-askgpt.component';

describe('ActionAskgptComponent', () => {
  let component: ActionAskgptComponent;
  let fixture: ComponentFixture<ActionAskgptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionAskgptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionAskgptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
