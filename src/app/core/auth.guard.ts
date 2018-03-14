import { Injectable } from '@angular/core';
// ActivatedRouteSnapshot, RouterStateSnapshot,
import { CanActivate, Router } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';

import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthGuard implements CanActivate {

  // public IS_LOGGED_IN: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  user: any;
  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotifyService
  ) {
    console.log('HELLO AUTH GUARD !!!')

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      console.log('AUTH GUARD USER ', user)
    });

    this.canActivate()
  }

  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

  //   console.log('CAN ACTIVATE (auth.guard.ts) ', firebase.auth().currentUser);
  //   return this.auth.user_bs.pipe(
  //     take(1),
  //     map((user) => !!user),
  //     tap((loggedIn) => {
  //       console.log('--- > LOGGED IN ', loggedIn);
  //       this.IS_LOGGED_IN.next(loggedIn);

  //       if (!loggedIn) {
  //         console.log('access denied');
  //         this.notify.update('You must be logged in!', 'error');
  //         this.router.navigate(['/login']);
  //       }
  //     }),
  //   );


  // }
  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
  //   if (this.auth.user_bs !== null) {
  //     console.log('AUTH GUARD ', this.auth.user_bs)
  //     return true;
  //   }
  //   return false;
  // }

  canActivate() {
    console.log('AlwaysAuthGuard');

    if (this.user) {
      // this.router.navigate(['/home']);
      return true;
    } else {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.router.navigate(['/login']);
      return false;
    }
  }


}
