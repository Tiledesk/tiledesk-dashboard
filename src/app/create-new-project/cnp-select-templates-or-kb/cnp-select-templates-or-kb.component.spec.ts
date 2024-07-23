import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpSelectTemplatesOrKbComponent } from './cnp-select-templates-or-kb.component';

describe('CnpSelectTemplatesOrKbComponent', () => {
  let component: CnpSelectTemplatesOrKbComponent;
  let fixture: ComponentFixture<CnpSelectTemplatesOrKbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpSelectTemplatesOrKbComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpSelectTemplatesOrKbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
