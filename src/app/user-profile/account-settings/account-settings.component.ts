import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  userId: string;
  projectId: string;

  hasClickedDeleteAccount = false;
  displayDeleteAccountModal = 'none';
  deleteAccount_hasError = false;
  showSpinner_deleteAccount: boolean;
  delete_account_completed = false;
  projects_length: number;
  translateparam: any;
  warning: string;
  selectAProjectToManageNotificationEmails: string;

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public auth: AuthService,
    private router: Router,
    private projectService: ProjectService,
    private logger: LoggerService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.getUserIdFromRouteParams();
    this.getCurrentProject();
    this.getProjects();
    this.translateStrings();
  }

  translateStrings() {
    this.translate.get('Warning')
    .subscribe((text: string) => {
      this.warning = text;
    });

    this.translate.get('ItIsNecessaryToSelectAProjectToManageNotificationEmails')
    .subscribe((text: string) => {
      this.selectAProjectToManageNotificationEmails = text;
    });
}

  /**
   * GET PROJECTS   
   */
  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET PROJECTS ', projects);

      if (projects) {
        this.projects_length = projects.length;
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET PROJECTS - LENGTH ', this.projects_length);

        this.translateparam = { projects_length: this.projects_length };
      }
    }, error => {

      this.logger.error('[USER-PROFILE][ACCOUNT-SETTINGS] - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET PROJECTS * COMPLETE *')
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {

        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET CURRENT PROJECT - project ', project)
        this.projectId = project._id;
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET CURRENT PROJECT - project ID', this.projectId)
    
      } else {
        this.logger.log('ACCOUNT_SETTINGS - GET CURRENT PROJECT ', project , ' HIDE-SIDEBAR')
        this.hideSidebar();
      }
    });
  }


  // hides the sidebar if the user is in the CHANGE PSW PAGE but has not yet selected a project
  hideSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS]  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS]  elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getUserIdFromRouteParams() {
    this.userId = this.route.snapshot.params['userid'];
    this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - USER ID ', this.userId)
  }


  openDeleteAccountModal() {
    this.displayDeleteAccountModal = 'block'
    this.hasClickedDeleteAccount = false;

  }

  closeDeleteAccountModal() {
    this.displayDeleteAccountModal = 'none'
    this.showSpinner_deleteAccount = null;
    this.deleteAccount_hasError === false

    if (this.delete_account_completed === true) {
      this.router.navigate(['/login']);
    }
  }

  deleteAccount() {
    this.hasClickedDeleteAccount = true;
    this.showSpinner_deleteAccount = true;
    this.deleteAccount_hasError = false;

    this.usersService.deleteUserAccount().subscribe((res: any) => {
      this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - DELETE-USER-ACCOUNT RES ', res);

    }, (error) => {
      this.logger.error('[USER-PROFILE][ACCOUNT-SETTINGS] - DELETE-USER-ACCOUNT ', error);

      this.showSpinner_deleteAccount = false;
      this.deleteAccount_hasError = true;
      this.hasClickedDeleteAccount = false;
    }, () => {
      this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - DELETE-USER-ACCOUNT * COMPLETE *');
      this.delete_account_completed = true;
      this.showSpinner_deleteAccount = false;
      this.deleteAccount_hasError = false;

      this.auth.signOut('account-settings');
      this.auth.showExpiredSessionPopup(false);

    });
  }



  // --------------------------------------------------------------
  // Go to
  // --------------------------------------------------------------

  goBack() {
    this._location.back();
  }

  goToChangePsw() {
    this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }

  goToUserProfile() {
    this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GO TO USER PROFILE  - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user-profile']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user-profile']);
    }
  }

  goToNotificationSettings() {
    this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] GO TO USER  NOTIFICATION SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      // this.router.navigate(['user/' + this.userId + '/notifications']);
      this.presentModalSelectAProjectToManageEmailNotification();
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/notifications']);
    }
  }


  presentModalSelectAProjectToManageEmailNotification() {
    swal({
      title: this.warning,
      text: this.selectAProjectToManageNotificationEmails,
      icon: "warning",
      button: "Ok",
      dangerMode: false,
    })
  }



  goToLogin() {
    this.router.navigate(['/login']);
  }

}
