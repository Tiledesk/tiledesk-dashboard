import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtIntegrationComponent } from './ext-integration.component';

describe('ExtIntegrationComponent', () => {
  let component: ExtIntegrationComponent;
  let fixture: ComponentFixture<ExtIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
