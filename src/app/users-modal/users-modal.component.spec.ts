import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersModalComponent } from './users-modal.component';

describe('UsersModalComponent', () => {
  let component: UsersModalComponent;
  let fixture: ComponentFixture<UsersModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsersModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
