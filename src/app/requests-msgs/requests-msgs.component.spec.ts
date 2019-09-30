import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsMsgsComponent } from './requests-msgs.component';

describe('RequestsMsgsComponent', () => {
  let component: RequestsMsgsComponent;
  let fixture: ComponentFixture<RequestsMsgsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestsMsgsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsMsgsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
