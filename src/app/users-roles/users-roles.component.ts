import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { AppConfigService } from 'app/services/app-config.service';
import { RolesService } from 'app/services/roles.service';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from 'app/services/users.service';
import { ProjectUser } from 'app/models/project-user';
import { RoleService } from 'app/services/role.service';
import { BrandService } from 'app/services/brand.service';
import { URL_understanding_custom_roles_and_permissions } from 'app/utils/util';
import { PERMISSIONS } from 'app/utils/permissions.constants';
const Swal = require('sweetalert2')

@Component({
  selector: 'appdashboard-users-roles',
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss']
})
export class UsersRolesComponent implements OnInit, OnDestroy {
  CUSTOM_ROLES_AND_PERMISSIONS_DOCS_URL = URL_understanding_custom_roles_and_permissions
  private unsubscribe$: Subject<any> = new Subject<any>();
  IS_OPEN_SETTINGS_SIDEBAR: boolean
  isChromeVerGreaterThan100: boolean
  id_project: string

  public_Key: string
  showSpinner = true
  isVisibleGroups: boolean;
  areActivePay: boolean;
  roles: any;
  projectUsers: any;
  pendingInvitationList:any;
  projectUsersAssociatedToRole: any

  isAuthorized = false;
  permissionChecked = false;
  public hideHelpLink: boolean;

  PERMISSION_TO_VIEW_TEAMMATES: boolean;
  PERMISSION_TO_VIEW_GROUPS: boolean;
  PERMISSION_TO_CREATE_NEW_ROLE: boolean;
  PERMISSION_TO_UPDATE_ROLE: boolean;
  PERMISSION_TO_DELETE_ROLE: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    public notify: NotifyService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private rolesService: RolesService,
    private translate: TranslateService,
    private usersService: UsersService,
    private roleService: RoleService,
    public brandService: BrandService,
  
  ) {
    const brand = brandService.getBrand();
    this.hideHelpLink = brand['DOCS'];
    // this.roles = [{ "name":"role1", "permissions":["lead_create","request_read_group"]}, { "name":"role2", "permissions":["request_read_group"]}]

  }

  ngOnInit(): void {
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getOSCODE()
    this.getCurrentProject()
    this.getRoles()
    this.getAllUsersOfCurrentProject()
    this.getPendingInvitation()
    this.checkPermissions();
    this.listenToProjectUser()
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        console.log('[USERS] - Role:', status.role);
        console.log('[USERS] - Permissions:', status.matchedPermissions);
      
        // ----------------------------
        // PERMISSION_TO_VIEW_TEAMMATES
        // ----------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_TEAMMATES = true;
          console.log('[USERS] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_TEAMMATES:', this.PERMISSION_TO_VIEW_TEAMMATES);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_TEAMMATES = false;
          console.log('[USERS] - Project user agent (2)', 'PERMISSION_TO_VIEW_TEAMMATES:', this.PERMISSION_TO_VIEW_TEAMMATES);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_TEAMMATES = status.matchedPermissions.includes(PERMISSIONS.TEAMMATES_READ);
          console.log('[USERS] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_TEAMMATES:', this.PERMISSION_TO_VIEW_TEAMMATES);
        }

        // -------------------------
        // PERMISSION_TO_VIEW_GROUPS
        // -------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_VIEW_GROUPS = true;
          console.log('[USERS-ROLES] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_GROUPS:', this.PERMISSION_TO_VIEW_GROUPS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_GROUPS = false;
          console.log('[USERS-ROLES] - Project user agent (2)', 'PERMISSION_TO_VIEW_GROUPS:', this.PERMISSION_TO_VIEW_GROUPS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_GROUPS = status.matchedPermissions.includes(PERMISSIONS.GROUPS_READ);
          console.log('[USERS-ROLES] - Custom role (3) role', status.role, 'PERMISSION_TO_VIEW_GROUPS:', this.PERMISSION_TO_VIEW_GROUPS);
        }

        // -----------------------------
        // PERMISSION_TO_CREATE_NEW_ROLE
        // -----------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_CREATE_NEW_ROLE = true;
          console.log('[USERS-ROLES] - Project user is owner or admin (1)', 'PERMISSION_TO_CREATE_NEW_ROLE:', this.PERMISSION_TO_CREATE_NEW_ROLE);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_CREATE_NEW_ROLE = false;
          console.log('[USERS-ROLES] - Project user agent (2)', 'PERMISSION_TO_CREATE_NEW_ROLE:', this.PERMISSION_TO_CREATE_NEW_ROLE);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_CREATE_NEW_ROLE = status.matchedPermissions.includes(PERMISSIONS.ROLE_CREATE);
          console.log('[USERS-ROLES] - Custom role (3) role', status.role, 'PERMISSION_TO_CREATE_NEW_ROLE:', this.PERMISSION_TO_CREATE_NEW_ROLE);
        }

        // -----------------------------
        // PERMISSION_TO_UPDATE_ROLE
        // -----------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_UPDATE_ROLE = true;
          console.log('[USERS-ROLES] - Project user is owner or admin (1)', 'PERMISSION_TO_UPDATE_ROLE:', this.PERMISSION_TO_UPDATE_ROLE);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_UPDATE_ROLE = false;
          console.log('[USERS-ROLES] - Project user agent (2)', 'PERMISSION_TO_UPDATE_ROLE:', this.PERMISSION_TO_UPDATE_ROLE);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_UPDATE_ROLE = status.matchedPermissions.includes(PERMISSIONS.ROLE_UPDATE);
          console.log('[USERS-ROLES] - Custom role (3) role', status.role, 'PERMISSION_TO_UPDATE_ROLE:', this.PERMISSION_TO_UPDATE_ROLE);
        }

        // -----------------------------
        // PERMISSION_TO_DELETE_ROLE
        // -----------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_DELETE_ROLE = true;
          console.log('[USERS-ROLES] - Project user is owner or admin (1)', 'PERMISSION_TO_DELETE_ROLE:', this.PERMISSION_TO_DELETE_ROLE);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_DELETE_ROLE = false;
          console.log('[USERS-ROLES] - Project user agent (2)', 'PERMISSION_TO_DELETE_ROLE:', this.PERMISSION_TO_DELETE_ROLE);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_DELETE_ROLE = status.matchedPermissions.includes(PERMISSIONS.ROLE_DELETE);
          console.log('[USERS-ROLES] - Custom role (3) role', status.role, 'PERMISSION_TO_DELETE_ROLE:', this.PERMISSION_TO_DELETE_ROLE);
        }

        
        // You can also check status.role === 'owner' if needed
      });
  }

  async checkPermissions() {
    const result = await this.roleService.checkRoleForCurrentProject('users-roles')
    console.log('[USERS-ROLES] result ', result)
    this.isAuthorized = result === true;
    this.permissionChecked = true;
    console.log('[USERS-ROLES] isAuthorized ', this.isAuthorized)
    console.log('[USERS-ROLES] permissionChecked ', this.permissionChecked)
  }

  getAllUsersOfCurrentProject() {

    this.usersService.getProjectUsersByProjectId().subscribe(
      (projectUsers: any) => {

        console.log('[USERS-ROLES] - GET PROJECT-USERS - RES', projectUsers)

        if (projectUsers) {
          this.projectUsers = projectUsers
        }
      }, (error) => {
        console.log('[USERS-ROLES] - GET PROJECT-USERS - ERROR', error)

      }, () => {
        console.log('[USERS-ROLES] - GET PROJECT-USERS * COMPLETE *')
      });
  }

   getPendingInvitation() {
    this.usersService.getPendingUsers().subscribe(
      (pendingInvitation: any) => {
        console.log('[USERS-ROLES] - GET PENDING INVITATION - RES', pendingInvitation)

        if (pendingInvitation) {
          this.pendingInvitationList = pendingInvitation
   
          console.log('[USERS-ROLES] - GET PENDING INVITATION - # OF PENDING INVITATION ', this.pendingInvitationList)
        }
      }, (error) => {
    
        this.logger.error('[USERS-ROLES] - GET PENDING INVITATION - ERROR', error)
      }, () => {
        this.logger.log('[USERS-ROLES] - GET PENDING INVITATION * COMPLETE * ')
     
      },
    )
  }


  getRoles() {
    this.rolesService.getAllRoles()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
        console.log('[USERS-ROLES] - GET ROLES - RES ', res);
        this.roles = res

      }, error => {

        this.showSpinner = false
        console.error('[USERS-ROLES] - GET ROLES - ERROR: ', error);
      }, () => {
        this.showSpinner = false
        console.log('[USERS-ROLESN] - GET ROLES * COMPLETE *')
      });
  }

  _deleteRole(roleid: string) {
    console.log('[USERS-ROLES] - DELETE ROLE - roleid ', roleid);
    this.rolesService.deleteRole(roleid)
      .subscribe((res: any) => {
        console.log('[USERS-ROLES] - DELETE ROLE - RES ', res);
        // Remove role foem the list
        for (var i = 0; i < this.roles.length; i++) {
          if (this.roles[i]._id === roleid) {
            this.roles.splice(i, 1);
            i--;
          }
        }

      }, error => {
        console.error('[USERS-ROLES] - DELETE ROLE - ERROR: ', error);
      }, () => {
        console.log('[USERS-ROLES] - DELETE ROLE * COMPLETE *')
      });
  }

  deleteRole(roleid, rolename) {

    if (!this.PERMISSION_TO_DELETE_ROLE) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }

    const puFilteredForRoleArray = this.projectUsers.filter((obj: any) => {
      return obj.role === rolename;
    });

    const pendingInvitationFilteredForRoleArray = this.pendingInvitationList.filter((invitation: any) => {
        return invitation.role === rolename;
    });

    console.log('[USERS-ROLES] delete role - puFilteredForRoleArray ', puFilteredForRoleArray)
    console.log('[USERS-ROLES] delete role - pendingInvitationFilteredForRoleArray ', pendingInvitationFilteredForRoleArray)

    const totalAssociations = puFilteredForRoleArray.length + pendingInvitationFilteredForRoleArray.length;
    console.log('[USERS-ROLES] delete role - totalAssociations ', totalAssociations)

    // this.projectUsersAssociatedToRole = []

    // puFilteredForRoleArray.forEach(pu => {
    //   let userFullname = ""
    //   if (pu.id_user.firstname) {
    //     userFullname = pu.id_user.firstname + ' ' + pu.id_user.lastname
    //   }

    //   this.projectUsersAssociatedToRole.push(userFullname)
    // });
    if (totalAssociations === 0) {
        this.presentDialogDeleteRole(rolename, roleid)
    } else {
        this.presentDialogRoleAssigned(rolename, totalAssociations)
    }


    // let warningText = '';
    // let warningTextPartTwo = '';
    // if (puFilteredForRoleArray.length === 0) {

    //   this.presentDialogDeleteRole(rolename, roleid)
    // }
    // if (puFilteredForRoleArray.length === 1) {
    //   warningText = this.translate.instant('TheRoleCannotBeDeletedBecauseItIsAssignedToOneTeammate', {
    //     role_name: `<strong>${rolename}</strong>`
    //   });
    //   warningTextPartTwo = this.translate.instant('RemoveTheRoleAssignment')
    //   this.presentDialogRoleAssigned(warningText,warningTextPartTwo, this.projectUsersAssociatedToRole)
    // }
    // if (puFilteredForRoleArray.length > 1) {
    //   warningText = this.translate.instant('TheRoleCannotBeDeletedBecauseItIsAssignedToTeammates', {
    //     role_name: `<strong>${rolename}</strong>`
    //   });
    //   warningTextPartTwo = this.translate.instant('RemoveTheRoleAssignments')
    //   this.presentDialogRoleAssigned(warningText,warningTextPartTwo, this.projectUsersAssociatedToRole)
    // }

  }

  presentDialogRoleAssigned(rolename, totalAssociations) {
    const isSingle = totalAssociations === 1;
    const associationType = isSingle ? this.translate.instant('Teammate') : this.translate.instant('Teammates');
    const pronoun = isSingle ? this.translate.instant('TheTeammate') : this.translate.instant('TheTeammates');
    const htmlContent =  `
      ${this.translate.instant('CannotDeleteRole', { role_name: rolename })}<br>
      ${this.translate.instant('ThisRoleIsCurrentlyAssignedTo', { total_associations: totalAssociations, association_type: associationType })}<br>
      ${this.translate.instant('ReassignDifferentRoleBeforeDeleting', { pronoun: pronoun })}<br>
    `;
    Swal.fire({
      title: this.translate.instant('RoleCannotBeDeleted'),
      html: htmlContent,
      icon: "warning",
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: false,

    })
  
  }

  _presentDialogRoleAssigned(warningText,warningTextPartTwo, projectUsersAssociatedToRole) {

    // const htmlContent = this.translate.instant('TheRoleCannotBeDeletedBecauseItIsAssignedToTeammates', {
    //   role_name: `<strong>${rolename}</strong>`
    // });
    Swal.fire({
      title: this.translate.instant('Warning'),
      html: warningText + ' ' + projectUsersAssociatedToRole + '. ' + warningTextPartTwo ,
      icon: "warning",
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: false,

    })
  }

  presentDialogDeleteRole(rolename, roleid) {
    console.log('[USERS-ROLES] delete role - roleid ', roleid)
    const htmlContent = this.translate.instant('TheRoleWillBeDeleted', {
      role_name: `<strong>${rolename}</strong>`
    });

    Swal.fire({
      title: this.translate.instant('AreYouSure') + '?',
      // text: this.translate.instant('TheRoleWillBeDeleted', { role_name: rolename }),
      html: htmlContent,
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,

    })
      .then((result) => {
        if (result.isDenied) {
          this.rolesService.deleteRole(roleid)
            .subscribe((res: any) => {
              console.log('[USERS-ROLES] - DELETE ROLE - RES ', res);
            }, (error) => {
              Swal.fire({
                title: this.translate.instant('Oops') + '!',
                text: this.translate.instant('HoursPage.ErrorOccurred'),
                icon: "error",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonText: this.translate.instant('Ok'),
                // confirmButtonColor: "var(--primary-btn-background)",
              });
              this.logger.error('[USERS-ROLES] DELETE  ERROR ', error);
            }, () => {
              this.logger.log('[USERS-ROLES]  * COMPLETE *');

              // Removes role from the list
              for (var i = 0; i < this.roles.length; i++) {
                if (this.roles[i]._id === roleid) {
                  this.roles.splice(i, 1);
                  i--;
                }
              }

              Swal.fire({
                title: this.translate.instant('Done') + "!",
                text: this.translate.instant('TheRoleHasBeenDeleted'),
                icon: "success",
                showCloseButton: false,
                showCancelButton: false,
                // confirmButtonColor: "var(--primary-btn-background)",
                confirmButtonText: this.translate.instant('Ok'),
              }).then((okpressed) => {

              });
            });
        } else {
          this.logger.log('[USERS-ROLES] (else)')
        }
      });

  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log('[USERS-ROLES] getAppConfig - public_Key', this.public_Key)

    let keys = this.public_Key.split('-')
    keys.forEach((key) => {
      if (key.includes('GRO')) {
        // this.logger.log('[USERS-ROLES] - PUBLIC-KEY - key', key);
        let gro = key.split(':')
        // this.logger.log('[USERS-ROLES] - PUBLIC-KEY  - gro key&value', gro);

        if (gro[1] === 'F') {
          this.isVisibleGroups = false
          // this.logger.log('[USERS-ROLES] - PUBLIC-KEY  - gro isVisibleGroups', this.isVisibleGroups);
        } else {
          this.isVisibleGroups = true
          // this.logger.log('[USERS-ROLES] - PUBLIC-KEY - gro isVisibleGroups', this.isVisibleGroups);
        }
      }

      if (key.includes('PAY')) {
        // this.logger.log('[USERS-ROLES] - PUBLIC-KEY - key', key);
        let gro = key.split(':')
        // this.logger.log('[USERS-ROLES] - PUBLIC-KEY - gro key&value', gro);

        if (gro[1] === 'F') {
          this.areActivePay = false
          // this.logger.log('[USERS-ROLES] - PUBLIC-KEY - areActivePay', this.areActivePay);
        } else {
          this.areActivePay = true
          // this.logger.log('[USERS-ROLES] - PUBLIC-KEY - areActivePay', this.areActivePay);
        }
      }
    })

    if (!this.public_Key.includes("GRO")) {
      this.isVisibleGroups = false;
    }

    if (!this.public_Key.includes("PAY")) {
      this.areActivePay = false;
    }

  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {

          this.id_project = project._id;
          this.logger.log('[USERS-ROLES] - GET CURRENT PROJECT -> project ID', this.id_project)
        }
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[USERS-ROLES] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[USERS-ROLES] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    })
  }


  goToGroups() {
    this.logger.log('[USERS-ROLES] - goToGroups')
    this.router.navigate(['project/' + this.id_project + '/groups'])
  }

  goToUsers() {
    this.router.navigate(['project/' + this.id_project + '/users']);
  }

  goToCreateNewRole() {
    this.router.navigate(['project/' + this.id_project + '/create-new-role']);
  }

  goToRoleDetail(roleid) {
    if (!this.PERMISSION_TO_UPDATE_ROLE) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return
    }
    this.router.navigate(['project/' + this.id_project + '/edit-role/' + roleid]);
  }

}
