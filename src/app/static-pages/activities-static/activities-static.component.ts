import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
// import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { StaticPageBaseComponent } from './../static-page-base/static-page-base.component';
import { Subscription } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { PLAN_NAME } from 'app/utils/util';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-activities-static',
  templateUrl: './activities-static.component.html',
  styleUrls: ['./activities-static.component.scss']
})
export class ActivitiesStaticComponent extends StaticPageBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME
  tparams: any;
  activities: any;
  agentAvailabilityOrRoleChange: string;
  agentDeletion: string;
  agentInvitation: string;
  newRequest: string;
  projectId: string;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  browserLang: string;

  subscription: Subscription;

  USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;

  // public myDatePickerOptions: IMyDpOptions = {
  //   dateFormat: 'dd/mm/yyyy',
  // };
  profile_name: string;
  isChromeVerGreaterThan100:boolean;
  constructor(
    public translate: TranslateService,
    public auth: AuthService,
    private router: Router,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private usersService: UsersService,
    public logger: LoggerService,
    public appConfigService: AppConfigService
  ) {
    super(translate,);
  }

  ngOnInit() {
    this.buildActivitiesOptions();
    this.getCurrentProject();
    this.getBrowserLang();
    this.getProjectPlan();

    this.getProjectUserRole();
    this.getTranslationStrings();
    this.getOSCODE();
    this.getBrowserVersion();
    this.tparams = {'plan_name': PLAN_NAME.C}
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[ACTIVITIES-STATIC] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[ACTIVITIES-STATIC] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        this.logger.log('[ACTIVITIES-STATIC] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[ACTIVITIES-STATIC] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[ACTIVITIES-STATIC] - pay isVisible', this.payIsVisible);
        }
      }


    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[ACTIVITIES-STATIC] - pay isVisible', this.payIsVisible);
    }
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[ACTIVITIES-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
    });
  }

  getTranslationStrings() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[ACTIVITIES-STATIC] - GET PROJECT PROFILE', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date
        this.profile_name = projectProfileData.profile_name;
        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

        

        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          // if (this.USER_ROLE === 'owner') {
          //   if (this.profile_name === PLAN_NAME.C) {
          //       // this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
          //       this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);

          //   }
          // }
          if (this.USER_ROLE === 'owner') {

            if (this.profile_name !== PLAN_NAME.C) {

              this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date)

            } else if (this.profile_name === PLAN_NAME.C) {

              this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
            }
          }
        }
      }
    }, err => {
      this.logger.error('[ACTIVITIES-STATIC] GET PROJECT PROFILE - ERROR', err);
    }, () => {
      this.logger.log('[ACTIVITIES-STATIC] GET PROJECT PROFILE * COMPLETE *');
    });
  }


  goToPricing() {
    if (this.payIsVisible) {
      if (this.USER_ROLE === 'owner') {

        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        } else {
          this.router.navigate(['project/' + this.projectId + '/pricing']);
          // this.notify.presentContactUsModalToUpgradePlan(true);
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[ACTIVITIES-STATIC] - project ', project)

      if (project) {
        this.projectId = project._id
        this.logger.log('[ACTIVITIES-STATIC] - project id ', this.projectId)
      }
    });
  }


  buildActivitiesOptions() {
    this.translate.get('ActivitiesOptions')
      .subscribe((text: any) => {

        this.agentAvailabilityOrRoleChange = text.AgentAvailabilityOrRoleChange;
        this.agentDeletion = text.AgentDeletion;
        this.agentInvitation = text.AgentInvitation;
        this.newRequest = text.NewRequest;

        // this.logger.log('[ACTIVITIES-STATIC] - translateActivities AgentAvailabilityOrRoleChange ', text.AgentAvailabilityOrRoleChange)
        // this.logger.log('[ACTIVITIES-STATIC] - AgentDeletion ', text.AgentDeletion)
        // this.logger.log('[ACTIVITIES-STATIC] - AgentDeletion ', text.AgentInvitation)
        // this.logger.log('[ACTIVITIES-STATIC] - newRequest ', text.newRequest)
      }, (error) => {
        this.logger.error('[ACTIVITIES-STATIC] - GET translations error', error);
      }, () => {
        this.logger.log('[ACTIVITIES-STATIC] - GET translations * COMPLETE *');

        this.activities = [
          { id: 'PROJECT_USER_UPDATE', name: this.agentAvailabilityOrRoleChange },
          { id: 'PROJECT_USER_DELETE', name: this.agentDeletion },
          { id: 'PROJECT_USER_INVITE', name: this.agentInvitation },
          { id: 'REQUEST_CREATE', name: this.newRequest },
        ];
      });
  }




}
