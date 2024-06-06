import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddNamespaceComponent } from './modal-add-namespace.component';

describe('ModalAddNamespaceComponent', () => {
  let component: ModalAddNamespaceComponent;
  let fixture: ComponentFixture<ModalAddNamespaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddNamespaceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAddNamespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
