import { BehaviorSubject, Subject } from 'rxjs';

export class AuthServiceStub {
  user_bs = new BehaviorSubject<any>({
    _id: 'test-user-id',
    firstname: 'Test',
    lastname: 'User',
    email: 'test@example.com'
  });

  project_bs = new BehaviorSubject<any>(null);

  hasChangedProjectFroList$ = new BehaviorSubject<boolean>(false);

  projectProfile(_name: string): void {}

  hasClickedGoToProjects(): void {}
}
