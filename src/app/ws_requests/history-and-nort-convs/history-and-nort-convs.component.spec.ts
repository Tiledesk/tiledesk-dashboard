import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryAndNortConvsComponent } from './history-and-nort-convs.component';

describe('RequestsListHistoryNewComponent', () => {
  let component: HistoryAndNortConvsComponent;
  let fixture: ComponentFixture<HistoryAndNortConvsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HistoryAndNortConvsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryAndNortConvsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
