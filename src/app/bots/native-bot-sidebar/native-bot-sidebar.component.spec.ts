import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NativeBotSidebarComponent } from './native-bot-sidebar.component';

describe('NativeBotComponent', () => {
  let component: NativeBotSidebarComponent;
  let fixture: ComponentFixture<NativeBotSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NativeBotSidebarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NativeBotSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
