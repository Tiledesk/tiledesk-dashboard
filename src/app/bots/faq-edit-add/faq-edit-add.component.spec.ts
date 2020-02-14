import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqEditAddComponent } from './faq-edit-add.component';

describe('FaqEditAddComponent', () => {
  let component: FaqEditAddComponent;
  let fixture: ComponentFixture<FaqEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
