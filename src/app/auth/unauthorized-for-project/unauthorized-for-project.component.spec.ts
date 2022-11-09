import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedForProjectComponent } from './unauthorized-for-project.component';

describe('UnauthorizedForProjectComponent', () => {
  let component: UnauthorizedForProjectComponent;
  let fixture: ComponentFixture<UnauthorizedForProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnauthorizedForProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnauthorizedForProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
