import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeGoToChatComponent } from './home-go-to-chat.component';

describe('HomeGoToChatComponent', () => {
  let component: HomeGoToChatComponent;
  let fixture: ComponentFixture<HomeGoToChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeGoToChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeGoToChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
