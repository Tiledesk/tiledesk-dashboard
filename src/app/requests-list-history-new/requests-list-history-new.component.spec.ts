import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsListHistoryNewComponent } from './requests-list-history-new.component';

describe('RequestsListHistoryNewComponent', () => {
  let component: RequestsListHistoryNewComponent;
  let fixture: ComponentFixture<RequestsListHistoryNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsListHistoryNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsListHistoryNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
