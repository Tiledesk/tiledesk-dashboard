import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateAppsumoProductComponent } from './activate-appsumo-product.component';

describe('ActivateAppsumoProductComponent', () => {
  let component: ActivateAppsumoProductComponent;
  let fixture: ComponentFixture<ActivateAppsumoProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivateAppsumoProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivateAppsumoProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
