import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';
import { FaqKbService } from '../services/faq-kb.service';

// implements CanActivate
@Injectable()
export class AdminGuard {

  userRole: string;
  projectId: string;
  currentUserId: string

  constructor(
    private router: Router,
    private usersService: UsersService,
    private auth: AuthService
  ) {
    // this.checkRole();
    // this.getLoggedUser();
    // this.getCurrentProject();

  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {

      if (user) {
        this.currentUserId = user._id;
        console.log('»> »> !!! »»» ADMIN GUARD -Current USER ID ', this.currentUserId)

      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        console.log('»> »> !!! »»» ADMIN GUARD - PRJCT ID from AUTH SERV SUBSC  ', this.projectId);
      }

    });
  }

  checkRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      if (user_role) {

        this.userRole = user_role;
        // this.userRole = 'agent';
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


//   canActivate(): Observable<boolean> | Promise<boolean> | boolean {

//     // console.log('»> »> !!! »»» ADMIN GUARD - CAN ACTIVATE - USER IS OWNER or ADMIN ', this.usersService.checkRole() )
//     const hasAdminPrivileges = this.usersService.checkRole();
//     console.log('»> »> !!! »»» ADMIN GUARD - CAN ACTIVATE - USER IS OWNER or ADMIN ', hasAdminPrivileges);

//     if (hasAdminPrivileges === true) {

//       return true;
//     }
//     this.router.navigate([`project/${this.projectId}/unauthorized`]);
//     return false;

//   }
//   // canActivate(): (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean { }

}
