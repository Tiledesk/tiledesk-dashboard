import { Injectable } from '@angular/core';

import { AuthService } from 'app/core/auth.service';
import { UsersService } from './users.service';
import { LoggerService } from './logger/logger.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
    private router: Router,
    private logger: LoggerService,
    private auth: AuthService,
    private usersService: UsersService
  ) {
   

  }




  async checkRoleForCurrentProject(calledby) {
    this.logger.log('[ROLE-SERV] checkRoleForCurrentProject is called by ', calledby)
    const storedUser = localStorage.getItem('user')
    // this.logger.log('[ROLE-SERV] storedUser ', storedUser) 
    let userId = ''
    if (storedUser) {
      const storedUserObject = JSON.parse(storedUser)
      // this.logger.log('[ROLE-SERV] storedUserObject ', storedUserObject)
      userId = storedUserObject._id
      this.logger.log('[ROLE-SERV] checkRoleForCurrentProject > userId ', userId)
      const currentProject = this.auth.project_bs.value
      // this.logger.log('[ROLE-SERV] checkRoleForCurrentProject currentProject ', currentProject)

      const projectId = currentProject._id

      const projectUserRole = this.usersService.project_user_role_bs.value
      this.logger.log('[ROLE-SERV] checkRoleForCurrentProject projectUserRole ', projectUserRole)
      this.logger.log('[ROLE-SERV] checkRoleForCurrentProject > projectId ', projectId)
      if (projectUserRole) {
        if (projectUserRole === 'agent') {
          this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
          this.router.navigate([`project/${projectId}/unauthorized`])
      
        } else {
          this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
        }
      } else {
        this.logger.error('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
      }

      // if (userId && projectId) {
      //   this.logger.log('[ROLE-SERV] HERE YES ')

      //   const projectUserRole = await this.getProjectUser(userId, projectId)
      //   this.logger.log('[ROLE-SERV] checkRoleForCurrentProject projectUserRole 2', projectUserRole)
      //   if (projectUserRole) {
      //     if (projectUserRole === 'agent') {
      //       this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
      //       this.router.navigate([`project/${projectId}/unauthorized`])
        
      //     } else {
      //       this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
      //     }
      //   } else {
      //     this.logger.error('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
      //   }


      // }
    }
  }

  // getProjectUser(currentUserId: string, prjct_id: string): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.usersService.getProjectUserByUserIdPassingProjectId(currentUserId, prjct_id).subscribe((projectUser) => {

  //       console.log('[ROLE-SERV] projectUser ', projectUser)
  //       console.log('[ROLE-SERV] projectUser role', projectUser[0]['role'])
  //       resolve(projectUser[0]['role'])
      
  //     }, (error) => {
  //       console.error('[ROLE-SERV] getProjectUserRole --> ERROR:', error)
  //       resolve('error')
  //     })

  //   })
  // }


}
