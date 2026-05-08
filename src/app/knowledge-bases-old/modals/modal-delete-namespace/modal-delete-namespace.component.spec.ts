import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteNamespaceComponent } from './modal-delete-namespace.component';

describe('ModalDeleteNamespaceComponent', () => {
  let component: ModalDeleteNamespaceComponent;
  let fixture: ComponentFixture<ModalDeleteNamespaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalDeleteNamespaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalDeleteNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
