import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HomeKbModalComponent } from './home-kb-modal/home-kb-modal.component';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { AuthService } from 'app/core/auth.service';
import { Router } from '@angular/router';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { NotifyService } from 'app/core/notify.service';
import { UsersService } from 'app/services/users.service';
import { PLAN_NAME } from 'app/utils/util';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { LocalDbService } from 'app/services/users-local-db.service';

@Component({
  selector: 'appdashboard-home-kb',
  templateUrl: './home-kb.component.html',
  styleUrls: ['./home-kb.component.scss']
})
export class HomeKbComponent extends PricingBaseComponent implements OnInit {
  PLAN_NAME = PLAN_NAME;
  @Output() trackUserAction = new EventEmitter();
  private unsubscribe$: Subject<any> = new Subject<any>();
  addButtonDisabled: boolean = false;
  project: any;
  kbCount: number;
  projectId: string;
  kbSettings: KbSettings = {
    _id: null,
    id_project: null,
    gptkey: null,
    maxKbsNumber: null,
    maxPagesNumber: null,
    kbs: []
  }

  newKb: KB = {
    _id: null,
    name: '',
    url: ''
  }

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  areNewKb: boolean;

  kbNameSpaceid: string = '';

  constructor(
    public dialog: MatDialog,
    private kbService: KnowledgeBaseService,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private auth: AuthService,
    public router: Router,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    public usersService: UsersService,
    private translate: TranslateService,
    public localDbService: LocalDbService,

  ) {
    super(prjctPlanService, notify);
  }

  ngOnInit(): void {
    // this.getKnowledgeBaseSettings();
    this.getCurrentProject();
    this.getProjectPlan();
    this.translateString();
    this.getKnowledgeBaseSettings()
  }

  getCurrentProject() {
    this.logger.log('[HOME-KB] - $ubscribe to CURRENT PROJECT ', this.project)
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          this.project = project;
        }
      })
  }

  getKnowledgeBaseSettings() {
    this.kbService.getKbSettingsPrev().subscribe((kbSettings: KbSettings) => {
      this.logger.log("[HOME-KB] get kbSettings RES ", kbSettings);
      if (kbSettings && kbSettings.kbs) {
        if (kbSettings.kbs.length === 0) {
          this.areNewKb = true;
        } else if (kbSettings.kbs.length > 0) {
          this.areNewKb = false;
        }

      } else {
        this.areNewKb = true;
      }

    }, (error) => {
      this.logger.error("[HOME-KB] get kbSettings ERROR ", error);
    }, () => {
      this.logger.log("HOME-KB] get kbSettings * COMPLETE *");

    })
  }


  // goToKnowledgeBases() {
  //   // this.trackUserAction.emit({action:'Home, Add Knowledge Base button clicked',actionRes: null })
  //   this.logger.log("goToKnowledgeBases -----> project._id: ", this.project._id);
  //   this.router.navigate(['project/' + this.project._id + '/knowledge-bases/h'])
  // }

  goToKnowledgeBases() {
    const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.project._id}`)
    this.logger.log('[HOME-KB] storedNamespace', storedNamespace);
    if (storedNamespace) {
      let storedNamespaceObjct = JSON.parse(storedNamespace)
      this.logger.log('[BOTS-SIDEBAR] storedNamespaceObjct', storedNamespaceObjct);
      this.kbNameSpaceid = storedNamespaceObjct.id
    }

    this.logger.log("goToKnowledgeBases -----> project._id: ", this.project._id);
    if (this.areNewKb) {
      if (this.kbNameSpaceid !== '') {
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.kbNameSpaceid]);
      } else {
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/0']);
      }

      // this.router.navigate(['project/' + this.project._id + '/knowledge-bases'])

    } else if (!this.areNewKb) {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases-pre'])
    }
  }


  openModalSubsExpired() {
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  // openModalTrialExpired() {
  //   if (this.USER_ROLE === 'owner') {  
  //       this.notify.displayTrialHasExpiredModal(this.projectId);
  //   } else {
  //     this.presentModalOnlyOwnerCanManageTheAccountPlan();
  //   }
  // }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  translateString() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
  }
  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });
  }
}
