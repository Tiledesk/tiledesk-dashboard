import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarForPanelComponent } from './navbar-for-panel.component';

describe('NavbarForPanelComponent', () => {
  let component: NavbarForPanelComponent;
  let fixture: ComponentFixture<NavbarForPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavbarForPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarForPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
