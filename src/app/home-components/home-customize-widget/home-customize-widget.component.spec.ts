import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCustomizeWidgetComponent } from './home-customize-widget.component';

describe('HomeCustomizeWidgetComponent', () => {
  let component: HomeCustomizeWidgetComponent;
  let fixture: ComponentFixture<HomeCustomizeWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeCustomizeWidgetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCustomizeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
