import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CnpProjectNameComponent } from './cnp-project-name.component';

describe('CnpProjectNameComponent', () => {
  let component: CnpProjectNameComponent;
  let fixture: ComponentFixture<CnpProjectNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CnpProjectNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CnpProjectNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
