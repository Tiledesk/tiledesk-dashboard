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
    console.log('[ROLE-SERV] checkRoleForCurrentProject is called by ', calledby)
    const storedUser = localStorage.getItem('user')
    // console.log('[ROLE-SERV] storedUser ', storedUser) 
    let userId = ''
    if (storedUser) {
      const storedUserObject = JSON.parse(storedUser)
      // console.log('[ROLE-SERV] storedUserObject ', storedUserObject)
      userId = storedUserObject._id
      console.log('[ROLE-SERV] checkRoleForCurrentProject > userId ', userId)
      const currentProject = this.auth.project_bs.value
      // console.log('[ROLE-SERV] checkRoleForCurrentProject currentProject ', currentProject)

      const projectId = currentProject._id

      const projectUserRole = this.usersService.projectUser_bs.value.role
      console.log('[ROLE-SERV] checkRoleForCurrentProject projectUserRole ', projectUserRole)
      console.log('[ROLE-SERV] checkRoleForCurrentProject > projectId ', projectId)
      if (projectUserRole) {
        if (projectUserRole === 'agent') {
          console.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
          this.router.navigate([`project/${projectId}/unauthorized`])
      
        } else {
          console.log('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
        }
      } else {
        console.error('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
      }

      // if (userId && projectId) {
      //   console.log('[ROLE-SERV] HERE YES ')

      //   const projectUserRole = await this.getProjectUser(userId, projectId)
      //   console.log('[ROLE-SERV] checkRoleForCurrentProject projectUserRole 2', projectUserRole)
      //   if (projectUserRole) {
      //     if (projectUserRole === 'agent') {
      //       console.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
      //       this.router.navigate([`project/${projectId}/unauthorized`])
        
      //     } else {
      //       console.log('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
      //     }
      //   } else {
      //     console.error('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole', projectUserRole)
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
