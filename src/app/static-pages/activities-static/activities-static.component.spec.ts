import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitiesStaticComponent } from './activities-static.component';

describe('ActivitiesStaticComponent', () => {
  let component: ActivitiesStaticComponent;
  let fixture: ComponentFixture<ActivitiesStaticComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitiesStaticComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitiesStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
