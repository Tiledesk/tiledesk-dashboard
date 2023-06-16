import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdsFloatingMenuComponent } from './cds-floating-menu.component';

describe('CdsFloatingMenuComponent', () => {
  let component: CdsFloatingMenuComponent;
  let fixture: ComponentFixture<CdsFloatingMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdsFloatingMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdsFloatingMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
