import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McpIntegrationComponent } from './mcp-integration.component';

describe('McpIntegrationComponent', () => {
  let component: McpIntegrationComponent;
  let fixture: ComponentFixture<McpIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McpIntegrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McpIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

