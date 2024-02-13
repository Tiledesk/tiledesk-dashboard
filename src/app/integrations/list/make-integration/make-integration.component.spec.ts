import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeIntegrationComponent } from './make-integration.component';

describe('MakeIntegrationComponent', () => {
  let component: MakeIntegrationComponent;
  let fixture: ComponentFixture<MakeIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MakeIntegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MakeIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
