import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsDeleteComponent } from './tags-delete.component';

describe('TagsDeleteComponent', () => {
  let component: TagsDeleteComponent;
  let fixture: ComponentFixture<TagsDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagsDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
