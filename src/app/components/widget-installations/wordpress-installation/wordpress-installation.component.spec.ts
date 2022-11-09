import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WordpressInstallationComponent } from './wordpress-installation.component';

describe('WordpressInstallationComponent', () => {
  let component: WordpressInstallationComponent;
  let fixture: ComponentFixture<WordpressInstallationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WordpressInstallationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WordpressInstallationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
