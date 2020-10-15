import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsUrlRowComponent } from './docs-url-row.component';

describe('DocsUrlRowComponent', () => {
  let component: DocsUrlRowComponent;
  let fixture: ComponentFixture<DocsUrlRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocsUrlRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocsUrlRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
