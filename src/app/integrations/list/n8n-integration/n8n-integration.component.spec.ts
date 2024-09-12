import { ComponentFixture, TestBed } from '@angular/core/testing';

import { N8nIntegrationComponent } from './n8n-integration.component';

describe('N8nIntegrationComponent', () => {
  let component: N8nIntegrationComponent;
  let fixture: ComponentFixture<N8nIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ N8nIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(N8nIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
