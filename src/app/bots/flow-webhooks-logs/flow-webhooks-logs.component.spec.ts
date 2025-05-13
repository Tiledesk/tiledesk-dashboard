import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowWebhooksLogsComponent } from './flow-webhooks-logs.component';

describe('FlowWebhooksLogsComponent', () => {
  let component: FlowWebhooksLogsComponent;
  let fixture: ComponentFixture<FlowWebhooksLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowWebhooksLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowWebhooksLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
