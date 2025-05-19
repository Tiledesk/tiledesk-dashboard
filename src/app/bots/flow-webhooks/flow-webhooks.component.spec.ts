import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowWebhooksComponent } from './flow-webhooks.component';

describe('FlowWebhooksComponent', () => {
  let component: FlowWebhooksComponent;
  let fixture: ComponentFixture<FlowWebhooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowWebhooksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowWebhooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
