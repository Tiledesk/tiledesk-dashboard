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
const Swal = require('sweetalert2')

@Component({
  selector: 'appdashboard-users-roles',
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss']
})
export class UsersRolesComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<any> = new Subject<any>();
  IS_OPEN_SETTINGS_SIDEBAR: boolean
  isChromeVerGreaterThan100: boolean
  id_project: string

  public_Key: string
  showSpinner = true
  isVisibleGroups: boolean;
  areActivePay: boolean;
  roles: any


  constructor(
    private router: Router,
    private auth: AuthService,
    public notify: NotifyService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private rolesService: RolesService,
    private translate: TranslateService
  ) {
    // this.roles = [{ "name":"role1", "permissions":["lead_create","request_read_group"]}, { "name":"role2", "permissions":["request_read_group"]}]

  }

  ngOnInit(): void {
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getOSCODE()
    this.getCurrentProject()
    this.getRoles()
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    console.log('[USERS-ROLES] delete flow webhook - roleid ', roleid)
    const htmlContent = this.translate.instant('TheRoleWillBeDeleted', {
      role_name: `<strong>${rolename}</strong>`
    });
    Swal.fire({
      title: this.translate.instant('AreYouSure'),
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
      // buttons: ["Cancel", "Delete"],
      // dangerMode: true,
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
    this.router.navigate(['project/' + this.id_project + '/edit-role/' + roleid]);
  }

}
