import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TempirispostaComponent } from './tempirisposta.component';

describe('TempirispostaComponent', () => {
  let component: TempirispostaComponent;
  let fixture: ComponentFixture<TempirispostaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TempirispostaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TempirispostaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
