import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionSendEmailComponent } from './action-send-email.component';

describe('ActionSendEmailComponent', () => {
  let component: ActionSendEmailComponent;
  let fixture: ComponentFixture<ActionSendEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionSendEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionSendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
