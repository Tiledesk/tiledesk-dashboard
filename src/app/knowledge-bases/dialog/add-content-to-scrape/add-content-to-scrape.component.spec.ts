import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContentToScrapeComponent } from './add-content-to-scrape.component';

describe('AddContentToScrapeComponent', () => {
  let component: AddContentToScrapeComponent;
  let fixture: ComponentFixture<AddContentToScrapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContentToScrapeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContentToScrapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
