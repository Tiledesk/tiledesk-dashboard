import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeKbComponent } from './home-kb.component';

describe('HomeKbComponent', () => {
  let component: HomeKbComponent;
  let fixture: ComponentFixture<HomeKbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeKbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeKbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
