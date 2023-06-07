import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { StaticPageBaseComponent } from './../static-page-base/static-page-base.component';
import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from 'app/utils/util';

const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-analytics-static',
  templateUrl: './analytics-static.component.html',
  styleUrls: ['./analytics-static.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnalyticsStaticComponent extends StaticPageBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  subscription: Subscription;
  projectId: string;
  browserLang: string;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  profile_name: string;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;

  imageUrlArray = [
    { url: 'assets/img/new_analitycs_1_v6.png', backgroundSize: 'contain' },
    { url: 'assets/img/new_anlitycs_2.png', backgroundSize: 'contain' },
    { url: 'assets/img/new_analitycs_6.png', backgroundSize: 'contain' },
  ];

  imageObject = [
    {
      image: 'assets/img/new_analitycs_1_v6.png',
      thumbImage: 'assets/img/new_analitycs_1_v6.png',
      alt: 'analitycs demo image'
    },
    {
      image: 'assets/img/new_anlitycs_2.png',
      thumbImage: 'assets/img/new_anlitycs_2.png',
      alt: 'analitycs demo image'
    },
    {
      image: 'assets/img/new_analitycs_6.png',
      thumbImage: 'assets/img/new_analitycs_6.png',
      alt: 'analitycs demo image '
    },
  ];

  USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  isChromeVerGreaterThan100: boolean;
  tparams: any;
  constructor(
    private router: Router,
    public auth: AuthService,
    public translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private usersService: UsersService,
    private logger: LoggerService,
    public appConfigService: AppConfigService
  ) {
    super(translate);
    this.tparams = { 'plan_name': PLAN_NAME.B }
  }

  ngOnInit() {
    this.getOSCODE();
    this.getCurrentProject();
    this.getBrowserLang();
    this.getProjectPlan();
    this.getProjectUserRole();
    this.getTranslationStrings();
    this.getBrowserVersion();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[ANALYTICS-STATIC] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[ANALYTICS-STATIC public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        this.logger.log('[ANALYTICS-STATIC] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[ANALYTICS-STATIC] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[ANALYTICS-STATIC] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[ANALYTICS-STATIC] - pay isVisible', this.payIsVisible);
    }
  }



  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[ANALYTICS-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
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

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        this.logger.log('[ANALYTICS-STATIC] - project id', this.projectId)
      }
    });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[ANALYTICS-STATIC] GET PROJECT PROFILE', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date
        this.profile_name = projectProfileData.profile_name

        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']

          this.tparams = { 'plan_name': this.appSumoProfilefeatureAvailableFromBPlan }
        } else if (!projectProfileData.extra3) {
          this.tparams = { 'plan_name': PLAN_NAME.B }
        }

        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.USER_ROLE === 'owner') {
            if (this.profile_name !== PLAN_NAME.A) {

              if (this.profile_name === PLAN_NAME.B) {

                this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date)

              } else if (this.profile_name === PLAN_NAME.C) {

                this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
              }
            } else if (this.profile_name === PLAN_NAME.A) {

              this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date)
            }
          }
        }
      }
    }, err => {
      this.logger.error('[ANALYTICS-STATIC] GET PROJECT PROFILE - ERROR', err);
    }, () => {
      this.logger.log('[ANALYTICS-STATIC] GET PROJECT PROFILE * COMPLETE *');
    });
  }


  goToPricing() {
    this.logger.log('[ANALYTICS-STATIC] - goToPricing projectId ', this.projectId);
    if (!this.appSumoProfile) {
      if (this.payIsVisible) {
        if (this.USER_ROLE === 'owner') {
          if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
            this.notify._displayContactUsModal(true, 'upgrade_plan');
          } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {

            this.notify.presentContactUsModalToUpgradePlan(true);
          } else if (this.prjct_profile_type === 'free') {
            this.router.navigate(['project/' + this.projectId + '/pricing']);
          }
        } else {
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      } else {
        this.notify._displayContactUsModal(true, 'upgrade_plan');
      }
    } else if (this.appSumoProfile) {
      this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
