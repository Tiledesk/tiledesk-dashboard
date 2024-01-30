import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSiteMapComponent } from './modal-site-map.component';

describe('ModalSiteMapComponent', () => {
  let component: ModalSiteMapComponent;
  let fixture: ComponentFixture<ModalSiteMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSiteMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSiteMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
