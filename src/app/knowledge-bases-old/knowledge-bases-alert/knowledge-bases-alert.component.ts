import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NotifyService } from 'app/core/notify.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { PLAN_NAME } from 'app/utils/util';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { Project } from 'app/models/project-model';
import { UsersService } from 'app/services/users.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-knowledge-bases-alert',
  templateUrl: './knowledge-bases-alert.component.html',
  styleUrls: ['./knowledge-bases-alert.component.scss']
})
export class KnowledgeBasesAlertComponent extends PricingBaseComponent  implements OnInit , OnChanges{
  @Input() public kbsListCount: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  public kbContentCount: number;
  PLAN_NAME = PLAN_NAME;
  public USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  projectId: string;
  project: Project;
  // kbsListCount: number = 0;
  
  constructor(
    public prjctPlanService: ProjectPlanService,
    private logger: LoggerService,
    public notify: NotifyService,
    private auth: AuthService,
    public usersService: UsersService,
    private kbService: KnowledgeBaseService,
    private translate: TranslateService,
  ) {
    super(prjctPlanService, notify);
    this.getProjectPlan();
   }

  ngOnInit(): void {
    this.getProjectUserRole();
    this.getCurrentProject();
    // this.getListOfKb();
    this.translateModalOnlyOwnerCanManageProjectAccount();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.logger.log('[KB-ALERT] (ngOnChanges) kbsListCount ', this.kbsListCount )
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.logger.log('[KB-ALERT] - $ubscribe to CURRENT PROJECT ', project)
        if (project) {
          this.project = project;
          this.projectId = project._id
        }

      })
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role
      this.logger.log('[KB-ALERT] - GET PROJECT USER ROLE - USER_ROLE : ', this.USER_ROLE)
    })
  }

  getListOfKb(params?) {
    this.logger.log("[KB-ALERT] getListOfKb ");
    this.kbService.getListOfKb(params).subscribe((resp:any) => {
      this.logger.log("[KB-ALERT] get kbList: ", resp);
      //this.kbs = resp;
      this.kbsListCount = resp.count;
      this.logger.log('[KB-ALERT] kbsListCount ', this.kbsListCount )
      // resp.kbs.forEach(kb => {
      //   // this.kbsList.push(kb);
      //   const index = this.kbsList.findIndex(objA => objA._id === kb._id);
      //   if (index !== -1) {
      //     this.kbsList[index] = kb;
      //   } else {
      //     this.kbsList.push(kb);
      //   }
        
      // });
    
      
      
    }, (error) => {
      this.logger.error("[KB-ALERT] ERROR get kbSettings: ", error);
      //this.showSpinner = false;
    }, () => {
      this.logger.log("[KB-ALERT] get kbSettings *COMPLETE*");
      //this.showSpinner = false;
    })
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

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

}
