import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpTemplatesComponent } from './cnp-templates.component';

describe('CnpTemplatesComponent', () => {
  let component: CnpTemplatesComponent;
  let fixture: ComponentFixture<CnpTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpTemplatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
