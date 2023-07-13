import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectResponseComponent } from './redirect-response.component';

describe('RedirectResponseComponent', () => {
  let component: RedirectResponseComponent;
  let fixture: ComponentFixture<RedirectResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedirectResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedirectResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
