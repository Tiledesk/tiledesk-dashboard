import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McpServerTableComponent } from './mcp-server-table.component';

describe('McpServerTableComponent', () => {
  let component: McpServerTableComponent;
  let fixture: ComponentFixture<McpServerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ McpServerTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(McpServerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

