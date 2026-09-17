import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetDomainsWithelistModalComponent } from './widget-domains-withelist-modal.component';

describe('WidgetDomainsWithelistModalComponent', () => {
  let component: WidgetDomainsWithelistModalComponent;
  let fixture: ComponentFixture<WidgetDomainsWithelistModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WidgetDomainsWithelistModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetDomainsWithelistModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
