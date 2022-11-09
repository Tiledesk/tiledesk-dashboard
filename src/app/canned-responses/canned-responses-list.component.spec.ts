import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponsesListComponent } from './canned-responses-list.component';

describe('CannedResponsesListComponent', () => {
  let component: CannedResponsesListComponent;
  let fixture: ComponentFixture<CannedResponsesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponsesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponsesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
