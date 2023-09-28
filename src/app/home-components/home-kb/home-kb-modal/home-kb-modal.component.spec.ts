import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeKbModalComponent } from './home-kb-modal.component';

describe('HomeKbModalComponent', () => {
  let component: HomeKbModalComponent;
  let fixture: ComponentFixture<HomeKbModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeKbModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeKbModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
