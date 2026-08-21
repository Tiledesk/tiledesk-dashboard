import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorDetailComponent } from './connector-detail.component';

describe('ConnectorDetailComponent', () => {
  let component: ConnectorDetailComponent;
  let fixture: ComponentFixture<ConnectorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectorDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectorDetailComponent);
    component = fixture.componentInstance;
    component.integration = {
      name: 'connectors',
      value: {
        items: [
          { name: 'Google Services', baseUrl: 'http://localhost:4000', actionCount: 58, triggerCount: 14 },
          { name: 'Salesforce', baseUrl: 'https://salesforce.example.com', actionCount: 3, triggerCount: 1 }
        ]
      }
    };
    component.connectorItem = component.integration.value.items[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the selected connector name and URL', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Google Services');
    expect(compiled.textContent).toContain('http://localhost:4000');
  });
});
