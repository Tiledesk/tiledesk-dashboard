import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TilebotSidebarComponent } from './tilebot-sidebar.component';

describe('TilebotSidebarComponent', () => {
  let component: TilebotSidebarComponent;
  let fixture: ComponentFixture<TilebotSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TilebotSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TilebotSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
