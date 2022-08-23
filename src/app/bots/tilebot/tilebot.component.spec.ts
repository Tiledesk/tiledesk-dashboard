import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TilebotComponent } from './tilebot.component';

describe('TilebotComponent', () => {
  let component: TilebotComponent;
  let fixture: ComponentFixture<TilebotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TilebotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TilebotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
