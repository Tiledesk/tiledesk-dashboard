import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { StaticPageBaseComponent } from './../static-page-base/static-page-base.component';
import { Subscription } from 'rxjs';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from 'app/utils/util';
const swal = require('sweetalert');
// node_modules/ng-simple-slideshow/src/app/modules/slideshow/IImage.d.ts
// src/app/static-pages/departments-static/departments-static.component.ts
@Component({
  selector: 'appdashboard-departments-static',
  templateUrl: './departments-static.component.html',
  styleUrls: ['./departments-static.component.scss']
})
export class DepartmentsStaticComponent extends StaticPageBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  imageObject = [
    {
      image: 'assets/img/static-depts4.png',
      thumbImage: 'assets/img/static-depts4.png'
    },
    {
      image: 'assets/img/static-depts5.png',
      thumbImage: 'assets/img/static-depts4.png'
    }
  ];


  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  browserLang: string;

  subscription: Subscription;

  projectId: string;

  USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  profile_name: string;
  isChromeVerGreaterThan100: boolean;
  tparams: any;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  constructor(
    private router: Router,
    public auth: AuthService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    public translate: TranslateService,
    private usersService: UsersService,
    private logger: LoggerService,
    public appConfigService: AppConfigService
  ) {
    super(translate);
  }

  ngOnInit() {
    this.getOSCODE();
    this.getCurrentProject();
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
    this.logger.log('[DEPTS-BASECOMP] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[DEPTS-BASECOMP] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        this.logger.log('[DEPTS-STATIC] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[DEPTS-STATIC] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[DEPTS-STATIC] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[DEPTS-STATIC] - pay isVisible', this.payIsVisible);
    }
  }



  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[DEPTS-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
    });
  }

  getTranslationStrings() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[DEPTS-STATIC]  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[DEPTS-STATIC] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });
  }


  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[DEPTS-STATIC] - project ', project)

      if (project) {
        this.projectId = project._id
        this.logger.log('[DEPTS-STATIC] - project Id ', this.projectId)
      }
    });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[DEPTS-STATIC] GET PROJECT PROFILE', projectProfileData)
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

            if (this.profile_name !== PLAN_NAME.C) {

              this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date)

            } else if (this.profile_name === PLAN_NAME.C) {

              this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
            }
          }

        }
      }
    }, err => {
      this.logger.error('[DEPTS-STATIC] GET PROJECT PROFILE - ERROR', err);
    }, () => {
      this.logger.log('[DEPTS-STATIC] GET PROJECT PROFILE * COMPLETE *');
    });
  }

  goToPricing() {
    this.logger.log('[DEPTS-STATIC] - goToPricing projectId ', this.projectId);
    if (!this.appSumoProfile) {
      if (this.payIsVisible) {
        if (this.USER_ROLE === 'owner') {
          if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
            this.notify._displayContactUsModal(true, 'upgrade_plan');
          } else {
            // this.router.navigate(['project/' + this.projectId + '/pricing']);
            this.notify.presentContactUsModalToUpgradePlan(true);
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
