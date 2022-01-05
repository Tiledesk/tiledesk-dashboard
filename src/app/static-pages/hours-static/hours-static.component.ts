import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { StaticPageBaseComponent } from './../static-page-base/static-page-base.component';
import { UsersService } from '../../services/users.service';
import { LoggerService } from '../../services/logger/logger.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-hours-static',
  templateUrl: './hours-static.component.html',
  styleUrls: ['./hours-static.component.scss']
})
export class HoursStaticComponent extends StaticPageBaseComponent implements OnInit, OnDestroy {
  projectId: string;
  subscription: Subscription;
  browserLang: string;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;

  USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  profile_name: string;
  constructor(
    private router: Router,
    public auth: AuthService,
    public translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    private notify: NotifyService,
    private usersService: UsersService,
    private logger: LoggerService
  ) { super(translate); }

  ngOnInit() {
    this.getCurrentProject();
    this.getBrowserLang();
    this.getProjectPlan();

    this.getProjectUserRole();
    this.getTranslationStrings();
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[HOURS-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
    });
  }

  getTranslationStrings() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[HOURS-STATIC] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[HOURS-STATIC] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }


  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[HOURS-STATIC] GET PROJECT PROFILE', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date
        this.profile_name = projectProfileData.profile_name

        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.USER_ROLE === 'owner') {
            if (this.profile_name !== 'enterprise') {

              this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
            
            } else if (this.profile_name === 'enterprise') {

              this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
            }
          }
        }
      }
    }, err => {
      this.logger.error('[HOURS-STATIC] GET PROJECT PROFILE - ERROR ', err);
    }, () => {
      this.logger.log('[HOURS-STATIC] GET PROJECT PROFILE * COMPLETE *');
    });
  }


  goToPricing() {
    this.logger.log('[HOURS-STATIC] goToPricing projectId ', this.projectId);
    if (this.USER_ROLE === 'owner') {
      if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
        this.notify._displayContactUsModal(true, 'upgrade_plan');
      } else {
        this.router.navigate(['project/' + this.projectId + '/pricing']);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    const el = document.createElement('div')
    el.innerHTML = this.onlyOwnerCanManageTheAccountPlanMsg + '. ' + "<a href='https://docs.tiledesk.com/knowledge-base/understanding-default-roles/' target='_blank'>" + this.learnMoreAboutDefaultRoles + "</a>"

    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      button: {
        text: "OK",
      },
      dangerMode: false,
    })
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      // this.logger.log('[HOURS-STATIC] - project ', project)

      if (project) {
        this.projectId = project._id
        this.logger.log('[HOURS-STATIC] - project ID', this.projectId)
      }
    });
  }



  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


}
