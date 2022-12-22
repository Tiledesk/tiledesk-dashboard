import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameResponseComponent } from './frame-response.component';

describe('FrameResponseComponent', () => {
  let component: FrameResponseComponent;
  let fixture: ComponentFixture<FrameResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrameResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
