import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoggerService } from 'app/services/logger/logger.service';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UsersService } from 'app/services/users.service';
import { ProjectUser } from 'app/models/project-user';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }
  currentUserId: string

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
        console.log('[ROLE-GUARD] - Current USER ID ', this.currentUserId)

      }
    });
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> { 
    
    console.log(['ROLE-GUARD next ',next])
    console.log(['ROLE-GUARD state ',state])

    const prjct_id = next.params.projectid;
    console.log(['ROLE-GUARD prjct_id ',prjct_id])

    const isAgent = await this.getProjectUserInProject(this.currentUserId, prjct_id)
    console.log('[ROLE-GUARD] isAgent ', isAgent) 

    if(isAgent) {
      console.log('[ROLE-GUARD] isAgent here y ', isAgent) 
      this.router.navigate([`project/${prjct_id}/unauthorized`]);
      // this.router.navigate([`project/unauthorized`]);
   
      return false;
    }
    return true;

  }

  getProjectUserInProject(currentUserId,prjct_id): Promise<boolean>{
    return new Promise((resolve, reject)=> {
      this.usersService.getProjectUserByUserIdPassingProjectId(currentUserId, prjct_id).subscribe( (projectUser) => {
        
        console.log('[ROLE-GUARD] projectUser ', projectUser) 
        console.log('[ROLE-GUARD] projectUser role', projectUser[0]['role']) 
        if (projectUser[0]['role'] === 'agent') {
          resolve(true)
        } else {
          resolve(false)
        }
      },  (error)=> {
          this.logger.error('[ROLE-GUARD] getProjectUserRole --> ERROR:', error)
          resolve(false)
      })
    
    })
  }
  
}
