import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementTextareaComponent } from './element-textarea.component';

describe('ElementTextareaComponent', () => {
  let component: ElementTextareaComponent;
  let fixture: ComponentFixture<ElementTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElementTextareaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElementTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
