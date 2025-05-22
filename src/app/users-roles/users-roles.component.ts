import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { AppConfigService } from 'app/services/app-config.service';

@Component({
  selector: 'appdashboard-users-roles',
  templateUrl: './users-roles.component.html',
  styleUrls: ['./users-roles.component.scss']
})
export class UsersRolesComponent implements OnInit {

  private unsubscribe$: Subject<any> = new Subject<any>();
  IS_OPEN_SETTINGS_SIDEBAR: boolean
  isChromeVerGreaterThan100: boolean
  id_project: string

  public_Key: string
  showSpinner = true
  isVisibleGroups: boolean;
  areActivePay: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    public notify: NotifyService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
  ) { }

  ngOnInit(): void {
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getOSCODE()
    this.getCurrentProject()
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log('[USERS] getAppConfig - public_Key', this.public_Key)

    let keys = this.public_Key.split('-')
    keys.forEach((key) => {
      if (key.includes('GRO')) {
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - key', key);
        let gro = key.split(':')
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro key&value', gro);

        if (gro[1] === 'F') {
          this.isVisibleGroups = false
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro isVisibleGroups', this.isVisibleGroups);
        } else {
          this.isVisibleGroups = true
          // this.logger.log('[USERS] - PUBLIC-KEY - gro isVisibleGroups', this.isVisibleGroups);
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

}
