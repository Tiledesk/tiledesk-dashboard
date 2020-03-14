import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsEditComponent } from './tags-edit.component';

describe('TagsEditComponent', () => {
  let component: TagsEditComponent;
  let fixture: ComponentFixture<TagsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
