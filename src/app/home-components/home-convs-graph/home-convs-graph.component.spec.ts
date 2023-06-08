import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeConvsGraphComponent } from './home-convs-graph.component';

describe('HomeConvsGraphComponent', () => {
  let component: HomeConvsGraphComponent;
  let fixture: ComponentFixture<HomeConvsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeConvsGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeConvsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
