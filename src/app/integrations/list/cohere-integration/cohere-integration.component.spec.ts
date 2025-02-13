import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CohereIntegrationComponent } from './cohere-integration.component';

describe('CohereIntegrationComponent', () => {
  let component: CohereIntegrationComponent;
  let fixture: ComponentFixture<CohereIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CohereIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CohereIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
