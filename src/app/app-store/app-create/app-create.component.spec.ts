import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCreateComponent } from './app-create.component';
import { AppStoreService } from 'app/services/app-store.service';
import { of } from 'rxjs';

describe('AppCreateComponent', () => {
  let component: AppCreateComponent;
  let fixture: ComponentFixture<AppCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults app_category to an empty string', () => {
    expect(component.app_category).toEqual('');
  });

  it('saveNewApp passes app_category to createNewApp and follows up with updateNewApp when a category is set', () => {
    const appStoreService = TestBed.inject(AppStoreService);
    spyOn(appStoreService, 'createNewApp').and.returnValue(of({ _id: 'app-123' }));
    spyOn(appStoreService, 'updateNewApp').and.returnValue(of({}));

    component.app_category = 'connector';
    component.saveNewApp();

    expect(appStoreService.createNewApp).toHaveBeenCalled();
    const createArgs = (appStoreService.createNewApp as jasmine.Spy).calls.mostRecent().args;
    expect(createArgs[createArgs.length - 1]).toEqual('connector');

    expect(appStoreService.updateNewApp).toHaveBeenCalled();
    const updateArgs = (appStoreService.updateNewApp as jasmine.Spy).calls.mostRecent().args;
    expect(updateArgs[0]).toEqual('app-123');
    expect(updateArgs[updateArgs.length - 1]).toEqual('connector');
  });
});
