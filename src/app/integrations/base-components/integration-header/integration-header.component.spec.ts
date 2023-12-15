import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrationHeaderComponent } from './integration-header.component';

describe('IntegrationHeaderComponent', () => {
  let component: IntegrationHeaderComponent;
  let fixture: ComponentFixture<IntegrationHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntegrationHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntegrationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
