import { Component, OnInit } from '@angular/core';
import { BotsBaseComponent } from 'app/bots/bots-base/bots-base.component';
import { NotifyService } from 'app/core/notify.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { PLAN_NAME } from 'app/utils/util';
import { TranslateService } from '@ngx-translate/core'
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'appdashboard-chatbot-alert',
  templateUrl: './chatbot-alert.component.html',
  styleUrls: ['./chatbot-alert.component.scss']
})

export class ChatbotAlertComponent extends BotsBaseComponent implements OnInit {

  public chatBotCount: number;
  PLAN_NAME = PLAN_NAME;
  public USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;

  constructor(
    public prjctPlanService: ProjectPlanService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private translate: TranslateService,
    private notify: NotifyService,
    private usersService: UsersService,
  ) {
    super(prjctPlanService);
    this.getProjectPlan();

  }

  ngOnInit(): void {
    this.getFaqKbByProjectId();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.getProjectUserRole()
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role
      this.logger.log('[CHATBOT-ALERT] - GET PROJECT USER ROLE - USER_ROLE : ', this.USER_ROLE)
    })
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      console.log('[CHATBOT-ALERT] - GET BOTS BY PROJECT ID > RES', faqKb);
      if (faqKb) {
        this.chatBotCount = faqKb.length;
        console.log('[CHATBOT-ALERT] - GET BOTS BY PROJECT ID > chatBotCount', this.chatBotCount);
      }
    }, (error) => {
      this.logger.error('[CHATBOT-ALERT] GET BOTS ERROR ', error);
    }, () => {
      this.logger.log('[CHATBOT-ALERT] GET BOTS * COMPLETE *');

    });
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
        // this.logger.log('[CHATBOT-ALERT]  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation
      })

    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[CHATBOT-ALERT] PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation
      })
  }

}
