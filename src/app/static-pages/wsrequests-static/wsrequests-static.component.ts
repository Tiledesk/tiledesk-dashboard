import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';

import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { PLAN_NAME } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { Location } from '@angular/common';
@Component({
  selector: 'appdashboard-wsrequests-static',
  templateUrl: './wsrequests-static.component.html',
  styleUrls: ['./wsrequests-static.component.scss']
})

export class WsrequestsStaticComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  private unsubscribe$: Subject<any> = new Subject<any>();
  PLAN_NAME = PLAN_NAME
  subscription: Subscription;
  projectId: string;
  browserLang: string;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  profile_name: string;
  public_Key: any
  payIsVisible: boolean;
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


  constructor(
    private router: Router,
    public auth: AuthService,
    public translate: TranslateService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private usersService: UsersService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    public location: Location
  ) { 
    super(prjctPlanService, notify);
  }

  ngOnInit(): void {
    this.getOSCODE();
    this.getCurrentProject();
    this.getBrowserLang();
    this.getProjectPlan();
    this.getProjectUserRole();
    this.getTranslationStrings();
    this.getBrowserVersion();
    this.presentModalsOnInit()
  }

  ngOnDestroy() {
    // this.subscription.unsubscribe();
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

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[WSREQUEST-STATIC] AppConfigService getAppConfig public_Key', this.public_Key)
    this.logger.log('[WSREQUEST-STATIC] public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (Navbar) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("PAY")) {
        this.logger.log('[WSREQUEST-STATIC] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[WSREQUEST-STATIC] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[WSREQUEST-STATIC] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[WSREQUEST-STATIC] - pay isVisible', this.payIsVisible);
    }
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[WSREQUEST-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
    });
  }


  getCurrentProject() {
    this.auth.project_bs
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((project) => {

      if (project) {
        this.projectId = project._id
        this.logger.log('[WSREQUEST-STATIC] - project id', this.projectId)
      }
    });
  }

  presentModalsOnInit() {
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


  goToPricing() {
    this.logger.log('[WSREQUEST-STATIC] - goToPricing projectId ', this.projectId);
    if (this.payIsVisible) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        } else {
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
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });
  }


}
