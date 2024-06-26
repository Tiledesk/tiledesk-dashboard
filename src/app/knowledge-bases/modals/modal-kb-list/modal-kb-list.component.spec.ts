import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalKbListComponent } from './modal-kb-list.component';

describe('ModalKbListComponent', () => {
  let component: ModalKbListComponent;
  let fixture: ComponentFixture<ModalKbListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalKbListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalKbListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
