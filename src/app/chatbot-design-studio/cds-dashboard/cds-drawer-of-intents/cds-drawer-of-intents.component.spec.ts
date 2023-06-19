import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdsDrawerOfIntentsComponent } from './cds-drawer-of-intents.component';

describe('CdsDrawerOfIntentsComponent', () => {
  let component: CdsDrawerOfIntentsComponent;
  let fixture: ComponentFixture<CdsDrawerOfIntentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdsDrawerOfIntentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdsDrawerOfIntentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
