import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHookBotComponent } from './modal-hook-bot.component';

describe('ModalHookBotComponent', () => {
  let component: ModalHookBotComponent;
  let fixture: ComponentFixture<ModalHookBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalHookBotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalHookBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
