import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityTemplateDtlsComponent } from './community-template-dtls.component';

describe('CommunityTemplateDtlsComponent', () => {
  let component: CommunityTemplateDtlsComponent;
  let fixture: ComponentFixture<CommunityTemplateDtlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunityTemplateDtlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityTemplateDtlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
