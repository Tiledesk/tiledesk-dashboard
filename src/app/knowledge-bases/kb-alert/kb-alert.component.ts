import { Component, OnInit } from '@angular/core';
import { KbBaseComponent } from '../kb-base/kb-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { PLAN_NAME } from 'app/utils/util';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';

@Component({
  selector: 'appdashboard-kb-alert',
  templateUrl: './kb-alert.component.html',
  styleUrls: ['./kb-alert.component.scss']
})

// extends KbBaseComponent
export class KbAlertComponent extends PricingBaseComponent implements OnInit {
 
  kbCount: number;
  public USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  PLAN_NAME = PLAN_NAME;
  
  constructor(
    public prjctPlanService: ProjectPlanService,
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
    private usersService: UsersService,
    private notify: NotifyService,
    private translate: TranslateService,
  ) { 
    super(prjctPlanService);
  }

  ngOnInit(): void {
    this.getKB();
    this.getProjectUserRole();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.getProjectPlan();
  }


  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role
      this.logger.log('[KB-ALERT] - GET PROJECT USER ROLE - USER_ROLE : ', this.USER_ROLE)
    })
  }

  getKB() {
    this.kbService.getKbSettings().subscribe((kbSettings: any) => {
      console.log("[KB-ALERT] get kbSettings: ", kbSettings);
      this.kbCount = kbSettings.kbs.length; 
      console.log("[KB-ALERT] get KB COUNT: ", this.kbCount);
      // if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {

      // if (this.kbSettings.kbs.length < this.kbLimit) {

      //   this.addButtonDisabled = false;
      // } else {
      //   this.addButtonDisabled = true;
      // }
      
    }, (error) => {
      this.logger.error("[KB-ALERT] get kbSettings ERROR: ", error);
    }, () => {
      this.logger.log("[KB-ALERT] get kbSettings * COMPLETE *");
    })
  }

  presentContactUsModal() {
    if (this.USER_ROLE === 'owner') {
      this.notify._displayContactUsModal(true, 'upgrade_plan')
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  openModalSubsExpired() {
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(
          true,
          this.prjct_profile_name,
          this.subscription_end_date,
        )
      } else if (this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(
          true,
          this.prjct_profile_name,
          this.subscription_end_date,
        )
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(
      this.onlyOwnerCanManageTheAccountPlanMsg,
      this.learnMoreAboutDefaultRoles,
    )
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate
      .get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[KB-ALERT]  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation
      })

    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[KB-ALERT] PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation
      })
  }

}
