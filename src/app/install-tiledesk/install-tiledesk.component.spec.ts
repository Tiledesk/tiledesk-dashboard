import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallTiledeskComponent } from './install-tiledesk.component';

describe('InstallTiledeskComponent', () => {
  let component: InstallTiledeskComponent;
  let fixture: ComponentFixture<InstallTiledeskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallTiledeskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallTiledeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
