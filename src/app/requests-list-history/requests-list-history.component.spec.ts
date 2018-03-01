import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsListHistoryComponent } from './requests-list-history.component';

describe('RequestsListHistoryComponent', () => {
  let component: RequestsListHistoryComponent;
  let fixture: ComponentFixture<RequestsListHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsListHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsListHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
