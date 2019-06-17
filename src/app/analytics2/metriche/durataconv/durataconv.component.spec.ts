import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DurataconvComponent } from './durataconv.component';

describe('DurataconvComponent', () => {
  let component: DurataconvComponent;
  let fixture: ComponentFixture<DurataconvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DurataconvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DurataconvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
