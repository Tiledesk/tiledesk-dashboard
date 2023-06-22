import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryResponseComponent } from './gallery-response.component';

describe('GalleryResponseComponent', () => {
  let component: GalleryResponseComponent;
  let fixture: ComponentFixture<GalleryResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GalleryResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
