import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloneBotComponent } from './clone-bot.component';

describe('CloneBotComponent', () => {
  let component: CloneBotComponent;
  let fixture: ComponentFixture<CloneBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloneBotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloneBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
