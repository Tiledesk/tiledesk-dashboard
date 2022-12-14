import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelResponseComponent } from './panel-response.component';

describe('PanelResponseComponent', () => {
  let component: PanelResponseComponent;
  let fixture: ComponentFixture<PanelResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
