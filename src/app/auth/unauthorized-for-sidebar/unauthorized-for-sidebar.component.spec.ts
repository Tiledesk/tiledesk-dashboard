import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedForSidebarComponent } from './unauthorized-for-sidebar.component';

describe('UnauthorizedForSidebarComponent', () => {
  let component: UnauthorizedForSidebarComponent;
  let fixture: ComponentFixture<UnauthorizedForSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnauthorizedForSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizedForSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
