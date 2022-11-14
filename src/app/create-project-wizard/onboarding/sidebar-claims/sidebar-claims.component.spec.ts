import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarClaimsComponent } from './sidebar-claims.component';

describe('SidebarClaimsComponent', () => {
  let component: SidebarClaimsComponent;
  let fixture: ComponentFixture<SidebarClaimsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SidebarClaimsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
