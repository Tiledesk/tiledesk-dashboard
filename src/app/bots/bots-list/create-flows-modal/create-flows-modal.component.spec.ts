import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFlowsModalComponent } from './create-flows-modal.component';

describe('CreateFlowsModalComponent', () => {
  let component: CreateFlowsModalComponent;
  let fixture: ComponentFixture<CreateFlowsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFlowsModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFlowsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
