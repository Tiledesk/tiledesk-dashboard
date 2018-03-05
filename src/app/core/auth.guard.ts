import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';

import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthGuard implements CanActivate {

  public IS_LOGGED_IN: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private auth: AuthService, private router: Router, private notify: NotifyService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {

    console.log('CAN ACTIVATE (auth.guard.ts) ', firebase.auth().currentUser);
    return this.auth.user.pipe(
      take(1),
      map((user) => !!user),
      tap((loggedIn) => {
        console.log('--- > LOGGED IN ', loggedIn);
        this.IS_LOGGED_IN.next(loggedIn);

        if (!loggedIn) {
          console.log('access denied');
          this.notify.update('You must be logged in!', 'error');
          this.router.navigate(['/login']);
        }
      }),
    );


  }
}
