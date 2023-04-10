import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CannedResponsesStaticComponent } from './canned-responses-static.component';

describe('CannedResponsesStaticComponent', () => {
  let component: CannedResponsesStaticComponent;
  let fixture: ComponentFixture<CannedResponsesStaticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CannedResponsesStaticComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CannedResponsesStaticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
