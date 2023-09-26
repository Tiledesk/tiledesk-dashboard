import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextResponseComponent } from './text-response.component';

describe('TextResponseComponent', () => {
  let component: TextResponseComponent;
  let fixture: ComponentFixture<TextResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TextResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
