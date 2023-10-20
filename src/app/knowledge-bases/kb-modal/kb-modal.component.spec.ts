import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KbModalComponent } from './kb-modal.component';

describe('KbModalComponent', () => {
  let component: KbModalComponent;
  let fixture: ComponentFixture<KbModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KbModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KbModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
