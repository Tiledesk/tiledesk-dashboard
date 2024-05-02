import { Component, OnInit } from '@angular/core';
import { BotsBaseComponent } from 'app/bots/bots-base/bots-base.component';
import { NotifyService } from 'app/core/notify.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { PLAN_NAME } from 'app/utils/util';
import { TranslateService } from '@ngx-translate/core'
import { UsersService } from 'app/services/users.service';
import { Router } from '@angular/router';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';


@Component({
  selector: 'appdashboard-chatbot-alert',
  templateUrl: './chatbot-alert.component.html',
  styleUrls: ['./chatbot-alert.component.scss']
})

export class ChatbotAlertComponent extends PricingBaseComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  public chatBotCount: number;
  PLAN_NAME = PLAN_NAME;
  public USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  route: string;
  IS_TEMPLATE_ROUTE: boolean
  projectId: string;
  project: Project
  constructor(
    public prjctPlanService: ProjectPlanService,
    private logger: LoggerService,
    private faqKbService: FaqKbService,
    private translate: TranslateService,
    public notify: NotifyService,
    public usersService: UsersService,
    private router: Router,
    private auth: AuthService,
  ) {
    super(prjctPlanService, notify);
    this.getProjectPlan();
  }

  ngOnInit(): void {
    this.getFaqKbByProjectId();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.getProjectUserRole();
    this.getActiveRoute();
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((project) => {
      if (project) {
        this.project = project;
        this.projectId = project._id
      }
      
    })
  }

  getActiveRoute() {
    const currentUrl = this.router.url;
    this.logger.log('[CHATBOT-ALERT] currentUrl route', currentUrl)
    if (currentUrl.indexOf('/templates/') !== -1) {
      this.logger.log('[CHATBOT-ALERT] template route')
      this.IS_TEMPLATE_ROUTE = true
    } else if (currentUrl.indexOf('/my-chatbots/') !== -1) {
      this.logger.log('[CHATBOT-ALERT] chatbots route')
      this.IS_TEMPLATE_ROUTE = false
    }

  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role
      this.logger.log('[CHATBOT-ALERT] - GET PROJECT USER ROLE - USER_ROLE : ', this.USER_ROLE)
    })
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[CHATBOT-ALERT] - GET BOTS BY PROJECT ID > RES', faqKb);
      if (faqKb) {
        this.chatBotCount = faqKb.length;
        this.logger.log('[CHATBOT-ALERT] - GET BOTS BY PROJECT ID > chatBotCount', this.chatBotCount);
      }
    }, (error) => {
      this.logger.error('[CHATBOT-ALERT] GET BOTS ERROR ', error);
    }, () => {
      this.logger.log('[CHATBOT-ALERT] GET BOTS * COMPLETE *');

    });
  }

  presentGoToPricingModal() {
    if (this.USER_ROLE === 'owner') {
      this.notify.displayGoToPricingModal('chatbot_exceeds')
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
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
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date,
        )
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  // openModalTrialExpired() {
  //   if (this.USER_ROLE === 'owner') {
  //     this.notify.displayTrialHasExpiredModal(this.projectId);
  //   } else {
  //     this.presentModalOnlyOwnerCanManageTheAccountPlan();
  //   }
  // }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
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
