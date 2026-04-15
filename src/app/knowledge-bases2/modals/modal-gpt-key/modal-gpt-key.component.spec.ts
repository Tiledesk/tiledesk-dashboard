import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGptKeyComponent } from './modal-gpt-key.component';

describe('ModalGptKeyComponent', () => {
  let component: ModalGptKeyComponent;
  let fixture: ComponentFixture<ModalGptKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalGptKeyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalGptKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
