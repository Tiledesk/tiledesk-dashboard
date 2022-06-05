import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WsSidebarAppsComponent } from './ws-sidebar-apps.component';

describe('WsSidebarAppsComponent', () => {
  let component: WsSidebarAppsComponent;
  let fixture: ComponentFixture<WsSidebarAppsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WsSidebarAppsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WsSidebarAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
