import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotsSidebarComponent } from './bots-sidebar.component';

describe('BotsSidebarComponent', () => {
  let component: BotsSidebarComponent;
  let fixture: ComponentFixture<BotsSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotsSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotsSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
