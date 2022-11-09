import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseRequestModalComponent } from './close-request-modal.component';

describe('CloseRequestModalComponent', () => {
  let component: CloseRequestModalComponent;
  let fixture: ComponentFixture<CloseRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseRequestModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
