import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlsWhitelistComponent } from './urls-whitelist.component';

describe('UrlsWhitelistComponent', () => {
  let component: UrlsWhitelistComponent;
  let fixture: ComponentFixture<UrlsWhitelistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UrlsWhitelistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UrlsWhitelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
