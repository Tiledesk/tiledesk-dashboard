import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedToUpgradeComponent } from './unauthorized-to-upgrade.component';

describe('UnauthorizedToUpgradeComponent', () => {
  let component: UnauthorizedToUpgradeComponent;
  let fixture: ComponentFixture<UnauthorizedToUpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnauthorizedToUpgradeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizedToUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
