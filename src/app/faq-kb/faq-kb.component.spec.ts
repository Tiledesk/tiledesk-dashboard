import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqKbComponent } from './faq-kb.component';

describe('FaqKbComponent', () => {
  let component: FaqKbComponent;
  let fixture: ComponentFixture<FaqKbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqKbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqKbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
