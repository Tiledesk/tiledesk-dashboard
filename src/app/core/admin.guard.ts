import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UsersService } from '../services/users.service';

// implements CanActivate
@Injectable()
export class AdminGuard {

  constructor(
    private router: Router,
    private usersService: UsersService
  ) {
    this.checkRole();
  }

  checkRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      if (user_role) {
        if (user_role === 'agent' || user_role === undefined) {
          console.log('»> »> !!! »»» ADMIN GUARD COMP - CHECK ROLE (FROM SUBSCRIPTION) »»» ', user_role);

          this.router.navigate(['unauthorized']);

        }
        console.log('»> »> !!! »»» ADMIN GUARD - CHECK ROLE (GOT SUBSCRIPTION) »»» ', user_role);

        


      }
    });
  }
  // canActivate(): (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {



  // }
}
