import { BehaviorSubject, Subject, Observable } from 'rxjs';

export class RolesServiceStub {
  private updateRequestPermission$ = new BehaviorSubject<{ role: string; matchedPermissions: string[] }>({
    role: 'owner',
    matchedPermissions: []
  });

  listenToProjectUserPermissions(_unsubscribe$: Observable<any>): void {}

  getUpdateRequestPermission(): Observable<{ role: string; matchedPermissions: string[] }> {
    return this.updateRequestPermission$.asObservable();
  }

  /** Helper per i test: emette un nuovo stato ruolo/permessi */
  emitPermissions(role: string, matchedPermissions: string[] = []): void {
    this.updateRequestPermission$.next({ role, matchedPermissions });
  }
}
