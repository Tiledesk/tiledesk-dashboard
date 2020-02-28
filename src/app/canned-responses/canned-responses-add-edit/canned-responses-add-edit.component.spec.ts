import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponsesAddEditComponent } from './canned-responses-add-edit.component';

describe('CannedResponsesAddEditComponent', () => {
  let component: CannedResponsesAddEditComponent;
  let fixture: ComponentFixture<CannedResponsesAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CannedResponsesAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponsesAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
