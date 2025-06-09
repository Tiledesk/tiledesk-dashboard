import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { UsersService } from './users.service';
import { LoggerService } from './logger/logger.service';
import { Router } from '@angular/router';
import { PERMISSIONS } from 'app/utils/permissions.constants';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
    private router: Router,
    private logger: LoggerService,
    private auth: AuthService,
    private usersService: UsersService
  ) { }

  async checkRoleForCurrentProject(calledby) {
    console.log('[ROLE-SERV] checkRoleForCurrentProject is called by ', calledby)
    const storedUser = localStorage.getItem('user')
    this.logger.log('[ROLE-SERV] storedUser ', storedUser)
    let userId = ''
    if (storedUser) {
      const storedUserObject = JSON.parse(storedUser)
      // this.logger.log('[ROLE-SERV] storedUserObject ', storedUserObject)
      userId = storedUserObject._id
      this.logger.log('[ROLE-SERV] checkRoleForCurrentProject > userId ', userId)
      const currentProject = this.auth.project_bs.value
      // console.log('[ROLE-SERV] checkRoleForCurrentProject currentProject ', currentProject)

      const projectId = currentProject._id

      const projectUserRole = this.usersService.project_user_role_bs.value
      const projectUser_bs = this.usersService.projectUser_bs.value
      console.log('[ROLE-SERV] checkRoleForCurrentProject projectUserRole ', projectUserRole)
      console.log('[ROLE-SERV] checkRoleForCurrentProject projectUser_bs ', projectUser_bs)
      this.logger.log('[ROLE-SERV] checkRoleForCurrentProject > projectId ', projectId)
      if (projectUserRole) {

        if (projectUserRole === 'agent') {
          if (calledby === 'ws-request-list' ||
            calledby === 'contacts' ||
            calledby === 'contact-edit' ||
            calledby === 'all-conversations' ||
            calledby === 'history') {
            return
          }

          this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
          this.router.navigate([`project/${projectId}/unauthorized`])

        } else if (projectUserRole !== 'owner' && projectUserRole !== 'admin') {
          console.log('[ROLE-SERV] - custom role 2', projectUserRole)
          // Monitor & NORT
          if (calledby === 'ws-request-list' || calledby === 'all-conversations') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.INBOX_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // History
          if (calledby === 'history') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.HISTORY_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Knowledge bases
          if (calledby === 'kb') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.KB_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Flows 
          if (calledby === 'flows') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Flows webhook
          if (calledby === 'flow-webhook') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Leads
          if (calledby === 'contacts' || calledby === 'contact-edit') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.LEAD_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Analytics
          if (calledby === 'analytics') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.ANALYTICS_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Activities
          if (calledby === 'activities') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.ACTIVITIES_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          if (calledby === 'widget-set-up') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-set-up hasPermission ', hasPermission)
            return hasPermission;
          }

           if (calledby === 'widget-multilanguage') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.TRANSLATIONS_READ);
            console.log('[ROLE-SERV] - widget-multilanguage hasPermission ', hasPermission)
            return hasPermission;
          }

          

        }
      } else {
        this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole * Error *', projectUserRole)
        const _projectUser = await this.getProjectUser(userId, projectId)
        const _projectUserRole = _projectUser['role']
        console.log('[ROLE-SERV] - checkRoleForCurrentProject  _projectUserRole GET from remote', _projectUserRole)
        if (_projectUserRole === 'agent') {
          if (calledby === 'ws-request-list' ||
            calledby === 'contacts' ||
            calledby === 'contact-edit' ||
            calledby === 'all-conversations' ||
            calledby === 'history') {
            return
          }

          this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
          this.router.navigate([`project/${projectId}/unauthorized`])
        } else if (_projectUserRole !== 'owner' && _projectUserRole !== 'admin') {
          console.log('[ROLE-SERV] - checkRoleForCurrentProject get from remote _projectUser.rolePermissions ', _projectUser.rolePermissions)

          // Monitor & Nort
          if (calledby === 'ws-request-list' || calledby === 'all-conversations') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.INBOX_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // History
          if (calledby === 'history') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.HISTORY_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Knowledge bases
          if (calledby === 'kb') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.KB_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Flows
          if (calledby === 'flows') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Flows webhook
          if (calledby === 'flow-webhook') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Leads
          if (calledby === 'contacts' || calledby === 'contact-edit') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.LEAD_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Analytics
          if (calledby === 'analytics') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.ANALYTICS_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          // Activities
          if (calledby === 'activities') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.ACTIVITIES_READ)) {
              this.router.navigate([`project/${projectId}/unauthorized`])
            }
          }

          if (calledby === 'widget-set-up') {
            const hasPermission =  _projectUser.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-set-up hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-multilanguage') {
            const hasPermission =  _projectUser.rolePermissions.includes(PERMISSIONS.TRANSLATIONS_READ);
            console.log('[ROLE-SERV] - widget-multilanguage hasPermission ', hasPermission)
            return hasPermission;
          }


          

        }
      }

    }
  }

  getProjectUser(currentUserId: string, prjct_id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.usersService.getProjectUserByUserIdPassingProjectId(currentUserId, prjct_id).subscribe((projectUser) => {

        console.log('[ROLE-SERV] projectUser  ', projectUser)
        console.log('[ROLE-SERV] projectUser role', projectUser[0]['role'])
        resolve(projectUser[0])

      }, (error) => {
        this.logger.error('[ROLE-SERV] getProjectUserRole --> ERROR:', error)
        resolve('error')
      })

    })
  }


}
