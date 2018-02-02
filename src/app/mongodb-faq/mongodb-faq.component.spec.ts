import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MongodbFaqComponent } from './mongodb-faq.component';

describe('MongodbFaqComponent', () => {
  let component: MongodbFaqComponent;
  let fixture: ComponentFixture<MongodbFaqComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MongodbFaqComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MongodbFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
