import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorIntegrationComponent } from './connector-integration.component';

describe('ConnectorIntegrationComponent', () => {
  let component: ConnectorIntegrationComponent;
  let fixture: ComponentFixture<ConnectorIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectorIntegrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectorIntegrationComponent);
    component = fixture.componentInstance;
    component.integration = { name: 'connectors', value: {} };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes integration.value.items as an empty array when absent', () => {
    expect(component.integration.value.items).toEqual([]);
  });

  it('does not render a list of already-added connectors', () => {
    component.integration.value.items = [
      { name: 'Google Services', baseUrl: 'http://localhost:4000', actionCount: 58, triggerCount: 14 }
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-section')).toBeNull();
  });
});
