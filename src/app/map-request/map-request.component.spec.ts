import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapRequestComponent } from './map-request.component';

describe('MapRequestComponent', () => {
  let component: MapRequestComponent;
  let fixture: ComponentFixture<MapRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
