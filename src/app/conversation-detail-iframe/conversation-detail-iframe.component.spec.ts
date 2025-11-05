import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationDetailIframeComponent } from './conversation-detail-iframe.component';

describe('ConversationDetailIframeComponent', () => {
  let component: ConversationDetailIframeComponent;
  let fixture: ComponentFixture<ConversationDetailIframeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationDetailIframeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConversationDetailIframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

