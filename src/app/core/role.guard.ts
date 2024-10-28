import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoggerService } from 'app/services/logger/logger.service';
import { AuthService } from './auth.service';
import { UsersService } from 'app/services/users.service';

@Injectable({
  providedIn: 'root'
})

export class RoleGuard implements CanActivate {
  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }
  private currentUserId: string
  private roles: Array<string> = [];
  private projectUser: any;

  constructor(
    private router: Router,
    private usersService: UsersService,
    private auth: AuthService,
    private logger: LoggerService
  ) {
    // this.checkRole();
    this.getLoggedUser();
    // this.getCurrentProject();

  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {

      if (user) {
        this.currentUserId = user._id;
        this.logger.log('[ROLE-GUARD] - Current USER ID ', this.currentUserId)

      }
    });
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> { 
    
    this.logger.log('[ROLE-GUARD] next ',next)
    this.logger.log('[ROLE-GUARD] state ',state)

    const prjct_id = next.params.projectid;
    this.logger.log(['[ROLE-GUARD] prjct_id ',prjct_id])

    this.roles = next.data[0].roles
    this.logger.log('[ROLE-GUARD] roles ',this.roles)

    const userIsInProject = await this.getProjectUserInProject(this.currentUserId, prjct_id)
    this.logger.log('[ROLE-GUARD] userIsInProject ', userIsInProject) 
    this.logger.log('[ROLE-GUARD] this.projectUser.role ', this.projectUser.role)
    const roleEnabled = this.roles.includes(this.projectUser.role);
    this.logger.log('[ROLE-GUARD] roleEnabled ', roleEnabled) 
    if(!userIsInProject || !roleEnabled) {
      this.logger.log('[ROLE-GUARD]  here y redirect', userIsInProject) 
      this.router.navigate([`project/${prjct_id}/unauthorized`]);
      // this.router.navigate([`project/unauthorized`]);
   
      return false;
    }
    return true;

  }

  getProjectUserInProject(currentUserId,prjct_id): Promise<boolean>{
    return new Promise((resolve, reject)=> {
      this.usersService.getProjectUserByUserIdPassingProjectId(currentUserId, prjct_id).subscribe( (projectUser) => {
        this.projectUser = projectUser[0]
        this.logger.log('[ROLE-GUARD] projectUser ', this.projectUser) 
        this.logger.log('[ROLE-GUARD] projectUser role', projectUser[0]['role']) 
        resolve(true)
        // if (projectUser[0]['role'] === 'agent') {
        //   resolve(true)
        // } else {
        //   resolve(false)
        // }
      },  (error)=> {
          this.logger.error('[ROLE-GUARD] getProjectUserRole --> ERROR:', error)
          resolve(false)
      })
    
    })
  }
  
}
