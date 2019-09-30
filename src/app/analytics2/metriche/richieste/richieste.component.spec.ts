import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RichiesteComponent } from './richieste.component';

describe('RichiesteComponent', () => {
  let component: RichiesteComponent;
  let fixture: ComponentFixture<RichiesteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RichiesteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RichiesteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
