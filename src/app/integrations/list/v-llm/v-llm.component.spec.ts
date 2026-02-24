import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VLLMComponent } from './v-llm.component';

describe('VLLMComponent', () => {
  let component: VLLMComponent;
  let fixture: ComponentFixture<VLLMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VLLMComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VLLMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
