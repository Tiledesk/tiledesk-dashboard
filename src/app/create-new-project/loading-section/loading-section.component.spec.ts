import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSectionComponent } from './loading-section.component';

describe('LoadingSectionComponent', () => {
  let component: LoadingSectionComponent;
  let fixture: ComponentFixture<LoadingSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
