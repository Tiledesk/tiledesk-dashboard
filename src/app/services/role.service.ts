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
          if (calledby === 'wsrequests' ||
             calledby === 'all-conversations' ||
            calledby === 'wsrequest-detail' ||
            calledby ===  'wsrequest-detail-history' ||
            calledby === 'contacts' ||
            calledby === 'contact-details' ||
            calledby === 'history') {
            console.log('hey i am an agent !!!!! RETURN PLEASE')
            return true
          }

          this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
          this.router.navigate([`project/${projectId}/unauthorized`])
          return false;

        } else if (projectUserRole !== 'owner' && projectUserRole !== 'admin') {
          console.log('[ROLE-SERV] - custom role 2', projectUserRole)
         
          // Monitor & NORT
          if (calledby === 'wsrequests' || calledby === 'all-conversations' || calledby === 'wsrequest-detail')  {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.INBOX_READ)) {
             this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
            // const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.INBOX_READ);
            // console.log('[ROLE-SERV] - contacts & contact-details hasPermission ', hasPermission)
            // return hasPermission;
          }

          // History
          if (calledby === 'history' || calledby === 'wsrequest-detail-history') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.HISTORY_READ)) {
              
              // this.router.navigate([`project/${projectId}/unauthorized`])
               this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Knowledge bases
          if (calledby === 'kb') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.KB_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Flows 
          if (calledby === 'flows') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Flows webhook
          if (calledby === 'flow-webhook') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Leads
          if (calledby === 'contacts' || calledby === 'contact-details') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.LEADS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
            // const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.LEADS_READ);
            // console.log('[ROLE-SERV] - contacts & contact-details hasPermission ', hasPermission)
            // return hasPermission;
          }

         


          // Analytics
          if (calledby === 'analytics') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.ANALYTICS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
               this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Activities
          if (calledby === 'activities') {
            console.log('[ROLE-SERV] - here yes projectUser_bs.rolePermissions', projectUser_bs.rolePermissions)
            if (!projectUser_bs.rolePermissions.includes(PERMISSIONS.ACTIVITIES_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
               this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Widget set up
          if (calledby === 'widget-set-up') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-set-up hasPermission ', hasPermission)
            return hasPermission;
          }

          // Widget Translations
          if (calledby === 'widget-multilanguage') {
            // const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.TRANSLATIONS_READ);
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-multilanguage hasPermission ', hasPermission)
            return hasPermission;
          }


          // Widget installations
          if (calledby === 'widget-installation') {
            // const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.INSTALLATION_READ);
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-installation hasPermission ', hasPermission)
            return hasPermission;
          }

          // Department List
          if (calledby === 'departments-list') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.DEPARTMENTS_LIST_READ);
            console.log('[ROLE-SERV] - departments-list hasPermission ', hasPermission)
            return hasPermission;
          }

          // Department detail
          if (calledby === 'department-edit') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.DEPARTMENT_DETAIL_READ);
            console.log('[ROLE-SERV] - department-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Department Create
          if (calledby === 'department-create') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.DEPARTMENT_CREATE_READ);
            console.log('[ROLE-SERV] - department-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammates list
          if (calledby === 'teammates') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.TEAMMATES_READ);
            console.log('[ROLE-SERV] - teammates hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammate detail
          if (calledby === 'teammate-edit') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.TEAMMATES_DETAILS_READ);
            console.log('[ROLE-SERV] - teammate-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammate create
          if (calledby === 'teammate-create') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.TEAMMATES_CREATE);
            console.log('[ROLE-SERV] - teammate-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Groups
          if (calledby === 'groups') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.GROUPS_READ);
            console.log('[ROLE-SERV] - groups hasPermission ', hasPermission)
            return hasPermission;
          }

          // Roles
          if (calledby === 'users-roles') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.ROLES_READ);
            console.log('[ROLE-SERV] - users-roles hasPermission ', hasPermission)
            return hasPermission;
          }

          // Email ticketing
          if (calledby === 'email-ticketing') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.EMAIL_TICKETING_READ);
            console.log('[ROLE-SERV] - email-ticketing hasPermission ', hasPermission)
            return hasPermission;
          }

          // Canned responses
          if (calledby === 'canned-responses') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.CANNED_RESPONSES_READ);
            console.log('[ROLE-SERV] - canned-responses hasPermission ', hasPermission)
            return hasPermission;
          }

          // Tags
          if (calledby === 'tags') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.TAGS_READ);
            console.log('[ROLE-SERV] - tags hasPermission ', hasPermission)
            return hasPermission;
          }

          // Operating Hours
          if (calledby === 'hours') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.HOURS_READ);
            console.log('[ROLE-SERV] - hours hasPermission ', hasPermission)
            return hasPermission;
          }

          // Automations Log
          if (calledby === 'automations') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.AUTOMATIONSLOG_READ);
            console.log('[ROLE-SERV] - automations hasPermission ', hasPermission)
            return hasPermission;
          }

          // Integrations
          if (calledby === 'integrations') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.INTEGRATIONS_READ);
            console.log('[ROLE-SERV] - integrations hasPermission ', hasPermission)
            return hasPermission;
          }

          // App store
          if (calledby === 'app-store') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.APPS_READ);
            console.log('[ROLE-SERV] - app-store hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > General
          if (calledby === 'project-settings-general') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_GENERAL_READ);
            console.log('[ROLE-SERV] - project-settings-general hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Subscription
          if (calledby === 'project-settings-sub') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_SUBSCRIPTION_READ);
            console.log('[ROLE-SERV] - project-settings-sub hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Developer
          if (calledby === 'project-settings-dev') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ);
            console.log('[ROLE-SERV] - project-settings-dev hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Developer > Webhook
          if (calledby === 'webhook') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ);
            console.log('[ROLE-SERV] - webhook hasPermission ', hasPermission)
            return hasPermission;
          }
          // Project settings > Smart Assign
          if (calledby === 'project-settings-smart-assign') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_READ);
            console.log('[ROLE-SERV] - project-settings-smart-assign hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Notifications
          if (calledby === 'project-settings-notifications') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_NOTIFICATION_READ);
            console.log('[ROLE-SERV] - project-settings-notifications hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Security
          if (calledby === 'project-settings-security') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_SECURITY_READ);
            console.log('[ROLE-SERV] - project-settings-security hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Banned
          if (calledby === 'project-settings-banned') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_BANNED_READ);
            console.log('[ROLE-SERV] - project-settings-banned hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Advanced
          if (calledby === 'project-settings-advanced') {
            const hasPermission = projectUser_bs.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_ADVANCED_READ);
            console.log('[ROLE-SERV] - project-settings-advanced hasPermission ', hasPermission)
            return hasPermission;
          }



          

        } else if (projectUserRole === 'owner' || projectUserRole === 'admin') {

          // Monitor & NORT
          // if (calledby === 'ws-request-list' || calledby === 'all-conversations') {
          //   const hasPermission = true
          //   console.log('[ROLE-SERV] - ws-request-list & all-conversations hasPermission ', hasPermission)
          //   return hasPermission;
          // }

          // if (calledby === 'contacts' || calledby === 'contact-details') {
          //   const hasPermission = true
          //   console.log('[ROLE-SERV] - contacts & contact-details hasPermission ', hasPermission)
          //   return hasPermission;
          // }

          if (calledby === 'widget-set-up') {
            const hasPermission = true
            console.log('[ROLE-SERV] - widget-set-up hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-multilanguage') {
            const hasPermission = true
            console.log('[ROLE-SERV] - widget-multilanguage hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-installation') {
            const hasPermission = true
            console.log('[ROLE-SERV] - widget-installation hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'departments-list') {
            const hasPermission = true
            console.log('[ROLE-SERV] - departments-list hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'department-edit') {
            const hasPermission = true
            console.log('[ROLE-SERV] - department-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'department-create') {
            const hasPermission = true
            console.log('[ROLE-SERV] - department-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammates list
          if (calledby === 'teammates') {
            const hasPermission = true
            console.log('[ROLE-SERV] - department-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammates detail
          if (calledby === 'teammate-edit') {
            const hasPermission = true
            console.log('[ROLE-SERV] - teammate-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammates create
          if (calledby === 'teammate-create') {
            const hasPermission = true
            console.log('[ROLE-SERV] - teammate-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Groups
          if (calledby === 'groups') {
            const hasPermission = true
            console.log('[ROLE-SERV] - groups hasPermission ', hasPermission)
            return hasPermission;
          }

          // Roles
          if (calledby === 'users-roles') {
            const hasPermission = true
            console.log('[ROLE-SERV] - users-roles hasPermission ', hasPermission)
            return hasPermission;
          }

          // Email ticketing
          if (calledby === 'email-ticketing') {
            const hasPermission = true
            console.log('[ROLE-SERV] - email-ticketing hasPermission ', hasPermission)
            return hasPermission;
          }

          // Canned responses
          if (calledby === 'canned-responses') {
            const hasPermission = true
            console.log('[ROLE-SERV] - canned-responses hasPermission ', hasPermission)
            return hasPermission;
          }

          // Tags
          if (calledby === 'tags') {
            const hasPermission = true
            console.log('[ROLE-SERV] - tags hasPermission ', hasPermission)
            return hasPermission;
          }

          // Operating Hours
          if (calledby === 'hours') {
            const hasPermission = true
            console.log('[ROLE-SERV] - hours hasPermission ', hasPermission)
            return hasPermission;
          }

          // Automations Log
          if (calledby === 'automations') {
            const hasPermission = true
            console.log('[ROLE-SERV] - automations hasPermission ', hasPermission)
            return hasPermission;
          }

          // Integrations
          if (calledby === 'integrations') {
            const hasPermission = true
            console.log('[ROLE-SERV] - integrations hasPermission ', hasPermission)
            return hasPermission;
          }

          // App store
          if (calledby === 'app-store') {
            const hasPermission = true
            console.log('[ROLE-SERV] - app-store hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > General
          if (calledby === 'project-settings-general') {
            const hasPermission = true
            console.log('[ROLE-SERV] - project-settings-general hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Subscription
          if (calledby === 'project-settings-sub') {
            const hasPermission = projectUserRole === 'owner'
            console.log('[ROLE-SERV] - project-settings-sub hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Developer
          if (calledby === 'project-settings-dev') {
            const hasPermission = true
            console.log('[ROLE-SERV] - project-settings-dev hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Developer > Webhook
          if (calledby === 'webhook') {
            const hasPermission = true
            console.log('[ROLE-SERV] - project-settings-dev hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Smart Assign
          if (calledby === 'project-settings-smart-assign') {
            const hasPermission = true
            console.log('[ROLE-SERV] - project-settings-smart-assign hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Notifications
          if (calledby === 'project-settings-notifications') {
            const hasPermission = true
            console.log('[ROLE-SERV] - project-settings-notifications hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Security
          if (calledby === 'project-settings-security') {
            const hasPermission = projectUserRole === 'owner'
            console.log('[ROLE-SERV] - project-settings-security hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Banned
          if (calledby === 'project-settings-banned') {
            const hasPermission = projectUserRole === 'owner' || projectUserRole === 'admin'
            console.log('[ROLE-SERV] - project-settings-security hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Advanced
          if (calledby === 'project-settings-advanced') {
            const hasPermission = projectUserRole === 'owner' || projectUserRole === 'admin'
            console.log('[ROLE-SERV] - project-settings-advanced hasPermission ', hasPermission)
            return hasPermission;
          }


        }
      } else {
        this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject  projectUserRole * Error *', projectUserRole)
        const _projectUser = await this.getProjectUser(userId, projectId)
        const _projectUserRole = _projectUser['role']
        console.log('[ROLE-SERV] - checkRoleForCurrentProject  _projectUserRole GET from remote', _projectUserRole)
        if (_projectUserRole === 'agent') {
          if (calledby === 'wsrequests' ||
            calledby === 'all-conversations' ||
            calledby === 'wsrequest-detail' ||
            calledby === 'wsrequest-detail-history' ||
            calledby === 'contacts' ||
            calledby === 'contact-details' ||
            calledby === 'history') {
            return true
          }

          this.logger.log('[ROLE-SERV] - checkRoleForCurrentProject ', projectUserRole, ' RUN NAVIGATE TO unauthorized page')
          this.router.navigate([`project/${projectId}/unauthorized`])
          return false

        } else if (_projectUserRole !== 'owner' && _projectUserRole !== 'admin') {
          console.log('[ROLE-SERV] - checkRoleForCurrentProject get from remote _projectUser.rolePermissions ', _projectUser.rolePermissions)

          // Monitor & Nort
          if (calledby === 'wsrequests' || calledby === 'all-conversations' || calledby === 'wsrequest-detail') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.INBOX_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
            // const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.INBOX_READ);
            // console.log('[ROLE-SERV] - ws-request-list & all-conversations hasPermission ', hasPermission)
            // return hasPermission;
          }

          // History
          if (calledby === 'history' || calledby === 'wsrequest-detail-history') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.HISTORY_READ)) {
             
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Knowledge bases
          if (calledby === 'kb') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.KB_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Flows
          if (calledby === 'flows') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
                this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Flows webhook
          if (calledby === 'flow-webhook') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.FLOWS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
              this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Leads
          if (calledby === 'contacts' || calledby === 'contact-details') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.LEADS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
               this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
            // const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.LEADS_READ);
            // console.log('[ROLE-SERV] - contacts & contact-details hasPermission ', hasPermission)
            // return hasPermission;
          }

          // Analytics
          if (calledby === 'analytics') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.ANALYTICS_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
               this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          // Activities
          if (calledby === 'activities') {
            console.log('[ROLE-SERV] - here yes 2')
            if (!_projectUser.rolePermissions.includes(PERMISSIONS.ACTIVITIES_READ)) {
              // this.router.navigate([`project/${projectId}/unauthorized`])
               this.router.navigate([`project/${projectId}/${calledby}/no-auth`]);
            }
          }

          if (calledby === 'widget-set-up') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-set-up hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-multilanguage') {
            // const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.TRANSLATIONS_READ);
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-multilanguage hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-installation') {
            // const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.INSTALLATION_READ);
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.WIDGETSETUP_READ);
            console.log('[ROLE-SERV] - widget-installation hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'departments-list') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.DEPARTMENTS_LIST_READ);
            console.log('[ROLE-SERV] - departments-list hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'department-edit') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.DEPARTMENT_DETAIL_READ);
            console.log('[ROLE-SERV] - department-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'department-create') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.DEPARTMENT_CREATE_READ);
            console.log('[ROLE-SERV] - department-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammates list 
          if (calledby === 'teammates') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.TEAMMATES_READ);
            console.log('[ROLE-SERV] - teammates hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammate details 
          if (calledby === 'teammate-edit') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.TEAMMATES_DETAILS_READ);
            console.log('[ROLE-SERV] - teammate-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammate create 
          if (calledby === 'teammate-create') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.TEAMMATES_CREATE);
            console.log('[ROLE-SERV] - teammate-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Groups
          if (calledby === 'groups') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.GROUPS_READ);
            console.log('[ROLE-SERV] - groups hasPermission ', hasPermission)
            return hasPermission;
          }

          // Roles
          if (calledby === 'users-roles') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.ROLES_READ);
            console.log('[ROLE-SERV] - users-roles hasPermission ', hasPermission)
            return hasPermission;
          }

          // Email ticketing
          if (calledby === 'email-ticketing') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.EMAIL_TICKETING_READ);
            console.log('[ROLE-SERV] - email-ticketing hasPermission ', hasPermission)
            return hasPermission;
          }

          // Canned responses
          if (calledby === 'canned-responses') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.CANNED_RESPONSES_READ);
            console.log('[ROLE-SERV] - canned-responses hasPermission ', hasPermission)
            return hasPermission;
          }

          // Tags
          if (calledby === 'tags') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.TAGS_READ);
            console.log('[ROLE-SERV] - tags hasPermission ', hasPermission)
            return hasPermission;
          }

          // Operating Hours
          if (calledby === 'hours') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.HOURS_READ);
            console.log('[ROLE-SERV] - hours hasPermission ', hasPermission)
            return hasPermission;
          }

          // Automations Log
          if (calledby === 'automations') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.AUTOMATIONSLOG_READ);
            console.log('[ROLE-SERV] - automations hasPermission ', hasPermission)
            return hasPermission;
          }

          // Integrations
          if (calledby === 'integrations') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.INTEGRATIONS_READ);
            console.log('[ROLE-SERV] - integrations hasPermission ', hasPermission)
            return hasPermission;
          }

          // App store
          if (calledby === 'app-store') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.APPS_READ);
            console.log('[ROLE-SERV] - app-store hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > General
          if (calledby === 'project-settings-general') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_GENERAL_READ);
            console.log('[ROLE-SERV] - project-settings-general hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Subscription
          if (calledby === 'project-settings-sub') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_SUBSCRIPTION_READ);
            console.log('[ROLE-SERV] - project-settings-sub hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Developer
          if (calledby === 'project-settings-dev') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ);
            console.log('[ROLE-SERV] - project-settings-dev hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Developer > Webhook
          if (calledby === 'webhook') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_DEVELOPER_READ);
            console.log('[ROLE-SERV] - webhook hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Smart Assign
          if (calledby === 'project-settings-smart-assign') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_SMARTASSIGNMENT_READ);
            console.log('[ROLE-SERV] - project-settings-smart-assign hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Notifications
          if (calledby === 'project-settings-notifications') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_NOTIFICATION_READ);
            console.log('[ROLE-SERV] - project-settings-notifications hasPermission ', hasPermission)
            return hasPermission;
          }
          
          // Project settings > Security
          if (calledby === 'project-settings-security') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_SECURITY_READ);
            console.log('[ROLE-SERV] - project-settings-security hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Banned
          if (calledby === 'project-settings-banned') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_BANNED_READ);
            console.log('[ROLE-SERV] - project-settings-banned hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Advanced
          if (calledby === 'project-settings-advanced') {
            const hasPermission = _projectUser.rolePermissions.includes(PERMISSIONS.PROJECTSETTINGS_ADVANCED_READ);
            console.log('[ROLE-SERV] - project-settings-advanced hasPermission ', hasPermission)
            return hasPermission;
          }


        } else if (_projectUserRole === 'owner' || _projectUserRole === 'admin') {
          console.log('HELLO ')

           // Monitor & Nort
          // if (calledby === 'ws-request-list' || calledby === 'all-conversations') {
          //   const hasPermission = true
          //   console.log('[ROLE-SERV] - ws-request-list & all-conversations hasPermission ', hasPermission)
          //   return hasPermission;
          // }

          // if (calledby === 'contacts' || calledby === 'contact-details') { 
          //   const hasPermission = true
          //   console.log('[ROLE-SERV] - contacts & contact-details hasPermission ', hasPermission)
          //   return hasPermission;
          // }

          if (calledby === 'widget-set-up') {
            const hasPermission = true
            console.log('[ROLE-SERV] - widget-set-up hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-multilanguage') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - widget-multilanguage hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'widget-installation') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - widget-installation hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'departments-list') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - departments-list hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'department-edit') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - department-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          if (calledby === 'department-create') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - department-create hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammates list 
          if (calledby === 'teammates') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - teammates hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammate details 
           if (calledby === 'teammate-edit') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - teammate-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Teammate create 
          if (calledby === 'teammate-create') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - teammate-edit hasPermission ', hasPermission)
            return hasPermission;
          }

          // Groups
          if (calledby === 'groups') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - teammates hasPermission ', hasPermission)
            return hasPermission;
          }

          // Roles
          if (calledby === 'users-roles') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - users-roles hasPermission ', hasPermission)
            return hasPermission;
          }

          // Email ticketing
          if (calledby === 'email-ticketing') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - email-ticketing hasPermission ', hasPermission)
            return hasPermission;
          }

          // Canned responses
          if (calledby === 'canned-responses') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - canned-responses hasPermission ', hasPermission)
            return hasPermission;
          }

          // Tags
          if (calledby === 'tags') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - tags hasPermission ', hasPermission)
            return hasPermission;
          }

          // Operating Hours
          if (calledby === 'hours') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - hours hasPermission ', hasPermission)
            return hasPermission;
          }

          // Automations Log
          if (calledby === 'automations') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - automations hasPermission ', hasPermission)
            return hasPermission;
          }

          // Integrations
          if (calledby === 'integrations') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - integrations hasPermission ', hasPermission)
            return hasPermission;
          }

          // App store
          if (calledby === 'app-store') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - integrations hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > General
          if (calledby === 'project-settings-general') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - project-settings-general hasPermission ', hasPermission)
            return hasPermission;
          }
          
          // Project settings > Subscription
          if (calledby === 'project-settings-sub') {
              const hasPermission = _projectUserRole === 'owner';
              console.log('[ROLE-SERV] - project-settings-sub hasPermission ', hasPermission)
              return hasPermission;
            }
          }

          // Project settings > Developer
          if (calledby === 'project-settings-dev') {
              const hasPermission = true;
              console.log('[ROLE-SERV] - project-settings-dev hasPermission ', hasPermission)
              return hasPermission;
          }

          // Project settings > Developer > Webhook
          if (calledby === 'webhook') {
              const hasPermission = true;
              console.log('[ROLE-SERV] - webhook hasPermission ', hasPermission)
              return hasPermission;
          }

          // Project settings > Smart Assign
          if (calledby === 'project-settings-smart-assign') {
              const hasPermission = true;
              console.log('[ROLE-SERV] - project-settings-smart-assign hasPermission ', hasPermission)
              return hasPermission;
          }

          // Project settings > Notifications
          if (calledby === 'project-settings-notifications') {
            const hasPermission = true;
            console.log('[ROLE-SERV] - project-settings-notifications hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Security
          if (calledby === 'project-settings-security') {
            const hasPermission = _projectUserRole === 'owner';
            console.log('[ROLE-SERV] - project-settings-security hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Banned
          if (calledby === 'project-settings-banned') {
            const hasPermission = _projectUserRole === 'owner' ||  _projectUserRole === 'admin';
            console.log('[ROLE-SERV] - project-settings-banned hasPermission ', hasPermission)
            return hasPermission;
          }

          // Project settings > Advanced
          if (calledby === 'project-settings-advanced') {
            const hasPermission = _projectUserRole === 'owner' ||  _projectUserRole === 'admin';
            console.log('[ROLE-SERV] - project-settings-advanced hasPermission ', hasPermission)
            return hasPermission;
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
