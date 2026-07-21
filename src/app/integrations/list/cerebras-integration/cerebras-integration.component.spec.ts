import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerebrasIntegrationComponent } from './cerebras-integration.component';

describe('CerebrasIntegrationComponent', () => {
  let component: CerebrasIntegrationComponent;
  let fixture: ComponentFixture<CerebrasIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CerebrasIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CerebrasIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
