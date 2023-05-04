import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProjectGsComponent } from './create-project-gs.component';

describe('CreateProjectGsComponent', () => {
  let component: CreateProjectGsComponent;
  let fixture: ComponentFixture<CreateProjectGsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateProjectGsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProjectGsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
