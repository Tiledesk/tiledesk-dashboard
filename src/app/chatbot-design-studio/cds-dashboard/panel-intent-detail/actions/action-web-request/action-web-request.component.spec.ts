import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionWebRequestComponent } from './action-web-request.component';

describe('ActionWebRequestComponent', () => {
  let component: ActionWebRequestComponent;
  let fixture: ComponentFixture<ActionWebRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionWebRequestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionWebRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
