import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdsFooterComponent } from './cds-footer.component';

describe('CdsFooterComponent', () => {
  let component: CdsFooterComponent;
  let fixture: ComponentFixture<CdsFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CdsFooterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CdsFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
