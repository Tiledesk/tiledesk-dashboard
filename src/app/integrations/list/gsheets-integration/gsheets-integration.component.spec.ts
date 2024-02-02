import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsheetsIntegrationComponent } from './gsheets-integration.component';

describe('GsheetsIntegrationComponent', () => {
  let component: GsheetsIntegrationComponent;
  let fixture: ComponentFixture<GsheetsIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GsheetsIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GsheetsIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
