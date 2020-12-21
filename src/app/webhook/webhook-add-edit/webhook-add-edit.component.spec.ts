import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebhookAddEditComponent } from './webhook-add-edit.component';

describe('WebhookAddEditComponent', () => {
  let component: WebhookAddEditComponent;
  let fixture: ComponentFixture<WebhookAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WebhookAddEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebhookAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
