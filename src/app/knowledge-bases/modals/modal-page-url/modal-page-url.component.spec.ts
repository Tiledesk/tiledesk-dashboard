import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPageUrlComponent } from './modal-page-url.component';

describe('ModalPageUrlComponent', () => {
  let component: ModalPageUrlComponent;
  let fixture: ComponentFixture<ModalPageUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalPageUrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalPageUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
