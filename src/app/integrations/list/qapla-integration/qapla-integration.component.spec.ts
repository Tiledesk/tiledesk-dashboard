import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QaplaIntegrationComponent } from './qapla-integration.component';

describe('QaplaIntegrationComponent', () => {
  let component: QaplaIntegrationComponent;
  let fixture: ComponentFixture<QaplaIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QaplaIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QaplaIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
