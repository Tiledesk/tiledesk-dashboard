import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTranslationComponent } from './base-translation.component';

describe('BaseTranslationComponent', () => {
  let component: BaseTranslationComponent;
  let fixture: ComponentFixture<BaseTranslationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseTranslationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
