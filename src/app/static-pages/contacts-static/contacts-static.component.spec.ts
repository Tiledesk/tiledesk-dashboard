import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsStaticComponent } from './contacts-static.component';

describe('ContactsStaticComponent', () => {
  let component: ContactsStaticComponent;
  let fixture: ComponentFixture<ContactsStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactsStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
