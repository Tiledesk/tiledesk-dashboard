import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';

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

  constructor(
    private _location: Location,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public auth: AuthService,
    private router: Router,
    private projectService: ProjectService,
  ) { }

  ngOnInit() {
    this.getUserIdFromRouteParams();
    this.getCurrentProject();
    this.getProjects();
  }

  /**
   * GET PROJECTS   
   */
  getProjects() {
    this.projectService.getProjects().subscribe((projects: any) => {
      console.log('ACCOUNT_SETTINGS - GET PROJECTS ', projects);

      if (projects) {
        this.projects_length = projects.length;
        console.log('ACCOUNT_SETTINGS - GET PROJECTS - LENGTH ', this.projects_length);

        this.translateparam = { projects_length: this.projects_length };
      }
    }, error => {

      console.log('ACCOUNT_SETTINGS - GET PROJECTS - ERROR ', error)
    }, () => {
      console.log('ACCOUNT_SETTINGS - GET PROJECTS - COMPLETE')
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        console.log('ACCOUNT_SETTINGS - project from AUTH-SERV subscr ', project)
        this.projectId = project._id;

      } else {
        console.log('ACCOUNT_SETTINGS - project from AUTH-SERV subscr ? ', project)

        this.hideSidebar();
      }
    });
  }


  // hides the sidebar if the user is in the CHANGE PSW PAGE but has not yet selected a project
  hideSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('ACCOUNT_SETTINGS  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    console.log('ACCOUNT_SETTINGS  elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getUserIdFromRouteParams() {
    this.userId = this.route.snapshot.params['userid'];
    console.log('ACCOUNT_SETTINGS - USER ID ', this.userId)
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

    // setTimeout(() => { 
    //   this.showSpinner_deleteAccount = false;
    //   this.deleteAccount_hasError  = true;
    //   if(this.deleteAccount_hasError === true) {
    //     this.hasClickedDeleteAccount = false;
    //     this.showSpinner_deleteAccount  = null;
    //   }
    //   }, 300);

    this.usersService.deleteUserAccount().subscribe((res: any) => {
      console.log('ACCOUNT_SETTINGS - DELETE-USER-ACCOUNT RES ', res);

    }, (error) => {
      console.log('ACCOUNT_SETTINGS - DELETE-USER-ACCOUNT ', error);

      this.showSpinner_deleteAccount = false;
      this.deleteAccount_hasError = true;
      this.hasClickedDeleteAccount = false;
    }, () => {
      console.log('ACCOUNT_SETTINGS - DELETE-USER-ACCOUNT * COMPLETE *');
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
    console.log('»» GO TO CHANGE PSW - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/password/change']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/password/change']);
    }
  }

  goToUserProfile() {
    console.log('»» GO TO USER PROFILE  - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user-profile']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user-profile']);
    }
  }

  goToNotificationSettings() {
    console.log('»» GO TO USER  NOTIFICATION SETTINGS - PROJECT ID ', this.projectId)
    if (this.projectId === undefined) {
      this.router.navigate(['user/' + this.userId + '/notifications']);
    } else {
      this.router.navigate(['project/' + this.projectId + '/user/' + this.userId + '/notifications']);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
