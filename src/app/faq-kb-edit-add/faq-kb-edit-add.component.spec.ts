import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqKbEditAddComponent } from './faq-kb-edit-add.component';

describe('FaqKbEditAddComponent', () => {
  let component: FaqKbEditAddComponent;
  let fixture: ComponentFixture<FaqKbEditAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqKbEditAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqKbEditAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
