import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Subscription } from 'rxjs';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { PLAN_NAME } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { Location } from '@angular/common';
import { RoleService } from 'app/services/role.service';
@Component({
  selector: 'appdashboard-automation-static',
  templateUrl: './automation-static.component.html',
  styleUrls: ['./automation-static.component.scss']
})

export class AutomationStaticComponent extends PricingBaseComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  public_Key: any
  payIsVisible: boolean;
  tparams: any;
  imageObject = [
    {
      image: 'assets/img/automations-static.jpeg',
      thumbImage: 'assets/img/automations-static.jpeg'
    },
    // {
    //   image: 'assets/img/contacts-static-2.png',
    //   thumbImage: 'assets/img/contacts-static-2.png'
    // }
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
  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;
  PLAN_NAME = PLAN_NAME

  constructor(
    private router: Router,
    public auth: AuthService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    public translate: TranslateService,
    private usersService: UsersService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    public location: Location,
    private roleService: RoleService
  ) {
    // super(translate)
    super(prjctPlanService, notify);

  }

  ngOnInit(): void {
    // this.auth.checkRoleForCurrentProject();
    this.roleService.checkRoleForCurrentProject('automation')
    this.getOSCODE();
    this.getCurrentProject();
    this.getProjectPlan();
    this.getProjectUserRole();
    this.getTranslationStrings();
    this.getBrowserVersion();
    this.presentModalsOnInit()
    this.tparams = { 'plan_name': PLAN_NAME.F }
    this.listenSidebarIsOpened();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((isChromeVerGreaterThan100: boolean) => {
        this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
        //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
      })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[AUTOMATION-COMP-STATIC] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[AUTOMATION-COMP-STATIC] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[AUTOMATION-COMP-STATIC] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        this.logger.log('[AUTOMATION-COMP-STATIC] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[AUTOMATION-COMP-STATIC] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[AUTOMATION-COMP-STATIC] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[AUTOMATION-COMP-STATIC] - pay isVisible', this.payIsVisible);
    }
  }


  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.USER_ROLE = user_role;
        this.logger.log('[AUTOMATION-COMP-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
      });
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }


  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        // this.logger.log('[DEPTS-STATIC] - project ', project)

        if (project) {
          this.projectId = project._id
          this.logger.log('[AUTOMATION-COMP-STATIC] - project Id ', this.projectId)
        }
      });
  }

  presentModalsOnInit() {
    if (this.payIsVisible) {
      if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
        if (this.USER_ROLE === 'owner') {
          if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {

            this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)

          } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {

            this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
          }
        }
      }
    }
  }


  goToPricing() {
    this.logger.log('[CNTCTS-STATIC] - goToPricing projectId ', this.projectId);
    if (this.payIsVisible) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {

          // this.notify.presentContactUsModalToUpgradePlan(true);
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        } else if (this.prjct_profile_type === 'free') {
          this.router.navigate(['project/' + this.projectId + '/pricing']);

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


  goBack() {
    this.location.back();
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

}
