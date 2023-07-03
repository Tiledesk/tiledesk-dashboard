import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCreateTeammateComponent } from './home-create-teammate.component';

describe('HomeCreateTeammateComponent', () => {
  let component: HomeCreateTeammateComponent;
  let fixture: ComponentFixture<HomeCreateTeammateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeCreateTeammateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCreateTeammateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
