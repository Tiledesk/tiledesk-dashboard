import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewContactModalComponent } from './add-new-contact-modal.component';

describe('AddNewContactModalComponent', () => {
  let component: AddNewContactModalComponent;
  let fixture: ComponentFixture<AddNewContactModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewContactModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewContactModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
