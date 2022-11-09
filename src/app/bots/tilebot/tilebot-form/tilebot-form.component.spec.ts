import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TilebotFormComponent } from './tilebot-form.component';

describe('TilebotFormComponent', () => {
  let component: TilebotFormComponent;
  let fixture: ComponentFixture<TilebotFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TilebotFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TilebotFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
