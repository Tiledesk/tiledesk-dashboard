import { Component, isDevMode, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { ProjectPlanService } from 'app/services/project-plan.service';
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from 'app/utils/util';
import { NotifyService } from 'app/core/notify.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { BrandService } from 'app/services/brand.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME= APP_SUMO_PLAN_NAME;
  appSumoProfile:string
  private unsubscribe$: Subject<any> = new Subject<any>();
  userId: string;
  projectId: string;

  hasClickedDeleteAccount = false;
  displayDeleteAccountModal = 'none';
  deleteAccount_hasError = false;
  showSpinner_deleteAccount: boolean;
  delete_account_completed = false;
  projects_length: number;
  countOfPrjctsInWichAreOwner: number;
  countOfPrjctsProfileTypePayment: number;
  translateparamCountOfPrjct: any;
  warning: string;
  selectAProjectToManageNotificationEmails: string;
  USER_ROLE: string; ù
  subscription: Subscription;
  prjct_profile_type: string;
  prjct_profile_name: string
  isActiveSubscription: boolean;
  isChromeVerGreaterThan100: boolean;
  currentUser: any;
  project: any;
  displayChangePwd: boolean;
  constructor(
    public notify: NotifyService,
    private _location: Location,
    private route: ActivatedRoute,
    private usersService: UsersService,
    public auth: AuthService,
    private router: Router,
    private projectService: ProjectService,
    private logger: LoggerService,
    private translate: TranslateService,
    public prjctPlanService: ProjectPlanService,
    public brandService: BrandService
  ) { 
    super(prjctPlanService, notify);
    const brand = brandService.getBrand(); 
    this.displayChangePwd = brand['display_change_pwd']
  }

  ngOnInit() {
    this.getUserIdFromRouteParams();
    this.getCurrentProject();
    this.getProjects();
    this.translateStrings();
    this.getProjectPlan();
    this.getProjectUserRole();
    this.getBrowserVersion();
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {

      if (user) {
        this.currentUser = user;
        // this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - LoggedUser', this.currentUser)
      }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    // this.subscription.unsubscribe()
  }

  // getProjectPlan() {
  //   this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
  //     this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - getProjectPlan project Profile Data', projectProfileData)
  //     if (projectProfileData) {

  //       this.prjct_profile_type = projectProfileData.profile_type;
  //       this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - getProjectPlan project Profile Data > prjct_profile_type', this.prjct_profile_type)


  //       if (projectProfileData && projectProfileData.extra3) {
  //         this.logger.log('[HOME] Find Current Project Among All extra3 ', projectProfileData.extra3)
  //         this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
  //         this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] Find Current Project appSumoProfile ', this.appSumoProfile)
  //       }


  //       if (projectProfileData.profile_type === 'free') {
  //         if (projectProfileData.trial_expired === false) {
  //           this.prjct_profile_name = PLAN_NAME.B + " plan (trial)"
       
  //         } else {
  //           this.prjct_profile_name = "Free plan";
           
  //         }
  //       } else if (projectProfileData.profile_type === 'payment') {
         
  //           if (projectProfileData.profile_name === PLAN_NAME.A) {
  //             if (!this.appSumoProfile) {
  //               this.prjct_profile_name = PLAN_NAME.A + " plan";
      
  //             } else {
  //               this.prjct_profile_name = PLAN_NAME.A + " plan " + '(' + this.appSumoProfile + ')';
  //             }
  //           } else if (projectProfileData.profile_name === PLAN_NAME.B) {
  //             if (!this.appSumoProfile) {
  //               this.prjct_profile_name = PLAN_NAME.B + " plan";
             
  //             } else {
  //               this.prjct_profile_name = PLAN_NAME.B + " plan " + '(' + this.appSumoProfile + ')';;
           
  //             }
  //           } else if (projectProfileData.profile_name === PLAN_NAME.C) {
  //             this.prjct_profile_name = PLAN_NAME.C + " plan";
  //           }
  //       }
  //     }
  //   }, error => {
  //     this.logger.error('[USER-PROFILE][ACCOUNT-SETTINGS]] - getProjectPlan - ERROR', error);
  //   }, () => {

  //     this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - getProjectPlan * COMPLETE *')

  //   });
  // }


  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role
        }
      });
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
        this.countOfPrjctsInWichAreOwner = 0;
        this.countOfPrjctsProfileTypePayment = 0;
        projects.forEach(project => {
          this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - project ', project);
          this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - project role', project.role);
          if (project.role === 'owner' && project.id_project.status !== 0) {
            this.countOfPrjctsInWichAreOwner = this.countOfPrjctsInWichAreOwner + 1;
          }
          if (project.role === 'owner') {
            if (project.id_project && project.id_project.profile.type === "payment") {
              this.countOfPrjctsProfileTypePayment = this.countOfPrjctsProfileTypePayment + 1;
            }
          }
        });
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - count Of Prjcts In Wich Are Owner ', this.countOfPrjctsInWichAreOwner);
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - count Of Prjcts Progile type Payment ', this.countOfPrjctsProfileTypePayment);

        this.projects_length = projects.length;
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET PROJECTS - LENGTH ', this.projects_length);

        this.translateparamCountOfPrjct = { projects_length: this.countOfPrjctsInWichAreOwner };
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
        this.project = project
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET CURRENT PROJECT - project ', project)
        this.projectId = project._id;
        this.logger.log('[USER-PROFILE][ACCOUNT-SETTINGS] - GET CURRENT PROJECT - project ID', this.projectId)

      } else {
        this.logger.log('ACCOUNT_SETTINGS - GET CURRENT PROJECT ', project, ' HIDE-SIDEBAR')
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
    if (this.USER_ROLE === 'owner' && this.prjct_profile_type === 'payment') {
      this.isActiveSubscription = true
    }
    // else if (this.USER_ROLE === 'owner' && this.prjct_profile_type !== 'payment') {
    //   this.displayDeleteAccountModal = 'block'
    // } else if (this.USER_ROLE !== 'owner') {
    //   this.displayDeleteAccountModal = 'block'
    // }
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

      if (res) {
        this.trackDeleteUserAccount()
       
      }
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

  trackDeleteUserAccount() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("User Profile Page, Settings", {

          });
        } catch (err) {
          this.logger.error('Account Deleted page error', err);
        }

        let userFullname = ''
        if (this.currentUser.firstname && this.currentUser.lastname)  {
          userFullname = this.currentUser.firstname + ' ' + this.currentUser.lastname
        } else if (this.currentUser.firstname && !this.currentUser.lastname) {
          userFullname = this.currentUser.firstname
        }


        try {
          window['analytics'].identify(this.currentUser._id, {
            name: userFullname,
            email: this.currentUser.email,
            plan: this.prjct_profile_name

          });
        } catch (err) {
          this.logger.error('identify in Account Deleted  error', err);
        }

        try {
          window['analytics'].track('Account Deleted', {
            "account_name": this.prjct_profile_name,
          }, {
            "context": {
              "groupId": this.projectId
            }
          });
        } catch (err) {
          this.logger.error('track Account Deleted event error', err);
        }

        try {
          window['analytics'].group(this.project._id, {
            name: this.project.name,
            plan: this.prjct_profile_name,
          });
        } catch (err) {
          this.logger.error('group Signed Out error', err);
        }
      }
    }
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
