import { BehaviorSubject, of } from 'rxjs';

export class UsersServiceStub {
  project_user_role_bs = new BehaviorSubject<string>('owner');

  getCurrentProjectUser() {
    return of([
      { _id: 'pu-1', role: 'owner', user_available: true, isBusy: false }
    ]);
  }

  getBotsByProjectIdAndSaveInStorage(): void {}

  getAllUsersOfCurrentProjectAndSaveInStorage(): void {}

  user_role(_role: string): void {}

  getAvailableProjectUsersByProjectId() {
    return of([]);
  }
}
