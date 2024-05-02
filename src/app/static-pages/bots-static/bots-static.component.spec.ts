import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsStaticComponent } from './bots-static.component';

describe('BotsStaticComponent', () => {
  let component: BotsStaticComponent;
  let fixture: ComponentFixture<BotsStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotsStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotsStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
