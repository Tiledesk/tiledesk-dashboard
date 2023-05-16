import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCustomPropertiesComponent } from './contact-custom-properties.component';

describe('ContactCustomPropertiesComponent', () => {
  let component: ContactCustomPropertiesComponent;
  let fixture: ComponentFixture<ContactCustomPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactCustomPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactCustomPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
