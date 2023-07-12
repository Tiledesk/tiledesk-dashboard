import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionEmailComponent } from './action-email.component';

describe('ActionEmailComponent', () => {
  let component: ActionEmailComponent;
  let fixture: ComponentFixture<ActionEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
