import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelIntentComponent } from './panel-intent.component';

describe('PanelIntentComponent', () => {
  let component: PanelIntentComponent;
  let fixture: ComponentFixture<PanelIntentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanelIntentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelIntentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
