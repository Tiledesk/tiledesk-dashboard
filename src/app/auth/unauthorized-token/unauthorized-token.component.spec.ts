import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedTokenComponent } from './unauthorized-token.component';

describe('UnauthorizedTokenComponent', () => {
  let component: UnauthorizedTokenComponent;
  let fixture: ComponentFixture<UnauthorizedTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnauthorizedTokenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizedTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
