import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UsersService } from '../services/users.service';

// implements CanActivate
@Injectable()
export class AdminGuard {

  userRole: string;

  constructor(
    private router: Router,
    private usersService: UsersService
  ) {
    this.checkRole();
  }

  checkRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      if (user_role) {

        this.userRole = user_role;
        console.log('»> »> !!! »»» ADMIN GUARD - CHECK ROLE (FROM SUBSCRIPTION) »»» ', this.userRole);
        // if (user_role === 'agent' || user_role === undefined) {
        //   console.log('»> »> !!! »»» ADMIN GUARD - CHECK ROLE (FROM SUBSCRIPTION) »»» ', user_role);

        //   this.router.navigate(['unauthorized']);

        // } else {
        //   console.log('»> »> !!! »»» ADMIN GUARD - CHECK ROLE (FROM SUBSCRIPTION) »»» ', user_role);
        // }
      }
    });
  }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.userRole !== 'agent') {
      return true;
    }
    this.router.navigate(['unauthorized']);
    return false;
  }
  // canActivate(): (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {



  // }
}
