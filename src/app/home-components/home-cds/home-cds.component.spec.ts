import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCdsComponent } from './home-cds.component';

describe('HomeCdsComponent', () => {
  let component: HomeCdsComponent;
  let fixture: ComponentFixture<HomeCdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeCdsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeCdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
