import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqSidebarComponent } from './faq-sidebar.component';

describe('FaqSidebarComponent', () => {
  let component: FaqSidebarComponent;
  let fixture: ComponentFixture<FaqSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
