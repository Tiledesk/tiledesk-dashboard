import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContentMenuComponent } from './add-content-menu.component';

describe('AddContentMenuComponent', () => {
  let component: AddContentMenuComponent;
  let fixture: ComponentFixture<AddContentMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContentMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
