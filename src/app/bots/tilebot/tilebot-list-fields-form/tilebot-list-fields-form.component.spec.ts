import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TilebotListFieldsFormComponent } from './tilebot-list-fields-form.component';

describe('TilebotListFieldsFormComponent', () => {
  let component: TilebotListFieldsFormComponent;
  let fixture: ComponentFixture<TilebotListFieldsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TilebotListFieldsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TilebotListFieldsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
