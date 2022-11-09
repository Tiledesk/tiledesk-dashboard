import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TilebotAddEditFormComponent } from './tilebot-add-edit-form.component';

describe('TilebotAddEditFormComponent', () => {
  let component: TilebotAddEditFormComponent;
  let fixture: ComponentFixture<TilebotAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TilebotAddEditFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TilebotAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
