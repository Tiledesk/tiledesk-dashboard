import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';
import { LoggerService } from '../services/logger/logger.service';
// implements CanActivate
@Injectable()
export class AdminGuard {

  userRole: string;
  projectId: string;
  currentUserId: string

  constructor(
    private router: Router,
    private usersService: UsersService,
    private auth: AuthService,
    private logger: LoggerService
  ) {
    // this.checkRole();
    // this.getLoggedUser();
    // this.getCurrentProject();

  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {

      if (user) {
        this.currentUserId = user._id;
        this.logger.log('[ADMIN-GUARD] - Current USER ID ', this.currentUserId)

      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        this.logger.log('[ADMIN-GUARD] - PRJCT ID from AUTH SERV SUBSC  ', this.projectId);
      }

    });
  }

  checkRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      if (user_role) {

        this.userRole = user_role;
        // this.userRole = 'agent';
        this.logger.log('[ADMIN-GUARD] - CHECK ROLE (FROM SUBSCRIPTION) »»» ', this.userRole);
        // if (user_role === 'agent' || user_role === undefined) {
        //   this.logger.log([ADMIN-GUARD] - CHECK ROLE (FROM SUBSCRIPTION) »»» ', user_role);

        //   this.router.navigate(['unauthorized']);

        // } else {
        //   this.logger.log([ADMIN-GUARD] - CHECK ROLE (FROM SUBSCRIPTION) »»» ', user_role);
        // }
      }
    });
  }

}
