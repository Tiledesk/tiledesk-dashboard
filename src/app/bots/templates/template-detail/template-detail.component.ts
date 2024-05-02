import { Component, OnInit, Inject, isDevMode } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { FaqKb } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { UsersService } from 'app/services/users.service';

import { CHATBOT_MAX_NUM, PLAN_NAME, goToCDSVersion } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { NotifyService } from 'app/core/notify.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-template-detail',
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.scss']
})


export class TemplateDetailComponent extends PricingBaseComponent implements OnInit {
  // public templateName: string;
  // public templateDescription: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  public template: any

  public TESTSITE_BASE_URL: string;
  public project: any;
  public projectId: string;
  public projectName: string;
  public USER_ROLE: string;
  public bot: FaqKb
  public botid: string;
  public botname: string;
  public templateid: string;
  public projectid: string;
  public templateProjectId: string;
  public _newlyCreatedProject: boolean;
  public defaultDeptID: string;
  public user: any;
  public callingPage: string;
  public prjct_profile_name: string;
  public projectPlanAgentsNo: any;
  public prjct_profile_type: string;
  public subscription_is_active: any;
  public subscription_end_date: string;
  public profile_name: string;
  public trial_expired: any;
  public chatBotLimit: any;
  public chatBotCount: any;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  // public depts_length: number;
  // public DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  // public dept_id: string;
  // public PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  // public depts_without_bot_array = [];
  // public displayInfoModal = 'none';
  // public SHOW_CIRCULAR_SPINNER = false;
  // public CREATE_BOT_ERROR: boolean;
  // public displayModalAttacchBotToDept: string;
  // public HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  // public HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  // public HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  // public HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;
  // public selected_dept_id: string;
  // public selected_dept_name: string;
  // translateparamBotName: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TemplateDetailComponent>,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public auth: AuthService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private router: Router,
    public dialog: MatDialog,
    private departmentService: DepartmentService,
    private botLocalDbService: BotLocalDbService,
    private projectService: ProjectService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private translate: TranslateService,
  ) {
    super(prjctPlanService, notify);
    this.logger.log('[TEMPLATE DETAIL] data ', data)
    this.projectid = data.projectId
    this.template = data.template;
    this._newlyCreatedProject = data.newlyCreatedProject
    this.callingPage = data.callingPage;
    this.prjct_profile_name = data.projectProfile
    this.logger.log('[TEMPLATE DETAIL] prjct_profile_name ', this.prjct_profile_name)
    // this.logger.log('[TEMPLATE DETAIL] template ', this.template)
    // this.logger.log('[TEMPLATE DETAIL] projectid ', this.projectid)
    if (this.template) {
      this.bot = this.template
      this.botname = this.template.name
      this.templateid = this.template._id
      this.templateProjectId = this.template.id_project
      // this.translateparamBotName = { bot_name: this.botname }
    }
    // this.templateName = data.name
    // this.logger.log('TemplateDetailComponent templateName ' ,this.templateName)
    // this.templateDescription = data.description
  }

  ngOnInit(): void {
    this.getTestSiteUrl()
    this.getCurrentProjectAndThenGetDeptsByProjectId()
    this.getProjectUserRole()
    this.getLoggedUser();
    this.getImageBaseUrl()
    this.getProjectPlan()
    this.getFaqKbByProjectId();
    this.traslateString()
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getFaqKbByProjectId() {
    // this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[TEMPLATE DETAIL] - GET BOTS BY PROJECT ID > RES', faqKb);
      if (faqKb) {
        this.chatBotCount = faqKb.length;
        this.logger.log('[TEMPLATE DETAIL] - GET BOTS BY PROJECT ID > chatBotCount', this.chatBotCount);
      }
    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[TEMPLATE DETAIL] GET BOTS COMPLETE');
    })
  }


  getImageBaseUrl() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[TEMPLATE DETAIL] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')


    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[TEMPLATE DETAIL] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
    
    }
  }

  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
          // this.logger.log('[TEMPLATE DETAIL]  - user ', this.user)
        }
      });
  }

  getCurrentProjectAndThenGetDeptsByProjectId() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
        // this.logger.log('[TEMPLATE DETAIL] project from AUTH service subscription ', this.project);
        this.projectId = project._id;
        this.projectName = project.name;
        this.getDeptsByProjectId()
        this.getProjectById(this.project._id)
      }
    });
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {
      this.logger.log('[TEMPLATE DETAIL] - GET PROJECT BY ID - PROJECT: ', project);
      // this.prjct_profile_name = project.profile.name
      // this.logger.log('[TEMPLATE DETAIL] - GET PROJECT BY ID - PROJECT > prjct_profile_name: ', this.prjct_profile_name);
    }, error => {
      this.logger.error('[TEMPLATE DETAIL] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] - GET PROJECT BY ID * COMPLETE * ');
    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      // this.logger.log('[FAQ-EDIT-ADD] - DEPT - GET DEPTS  - RES', departments);
      if (departments) {
        departments.forEach((dept: any) => {
          // this.logger.log('[FAQ-EDIT-ADD] - DEPT', dept);

          if (dept.default === true) {
            this.defaultDeptID = dept._id;
            // this.logger.log('[FAQ-EDIT-ADD] - DEFAULT DEPT ID ', this.defaultDepartmentId);
          }
        });
      }

    }, error => {

      this.logger.error('[TEMPLATE DETAIL] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] - DEPT - GET DEPTS - COMPLETE')

    });
  }


  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .subscribe((user_role) => {
        if (user_role) {
          this.USER_ROLE = user_role
          // this.logger.log('[TEMPLATE DETAIL] user_role ', user_role);
        }
      });
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[TEMPLATE DETAIL] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // this.logger.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    // const url = testItOutUrl + '?tiledesk_projectid=' + "635b97cc7d7275001a2ab3e0" + '&tiledesk_participants=bot_' + this.templateid + "&tiledesk_departmentID=635b97cc7d7275001a2ab3e4"
    const url = testItOutUrl + '?tiledesk_projectid=' + this.templateProjectId + '&tiledesk_participants=bot_' + this.templateid + "&tiledesk_departmentID=" + "63d7911ca7b3d3001a4a9408"
    // this.logger.log('openTestSiteInPopupWindow URL ', url)
    let left = (screen.width - 830) / 2;
    let top = (screen.height - 727) / 4;

    // let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    let params = `toolbar=no,menubar=no,width=830,height=727,left=${left},top=${top}`;
    window.open(url, '_blank', params);
  }


  importTempalte() {
    this.logger.log('[TEMPLATE DETAIL] importTempalte chatBotCount ',this.chatBotCount ,' chatBotLimit ', this.chatBotLimit, ' USER_ROLE ', this.USER_ROLE) 
    // if (this.chatBotCount < this.chatBotLimit) {
    //   this.forkTemplate()
    // } else if (this.chatBotCount >= this.chatBotLimit) {

    //   if (this.USER_ROLE !== 'agent') {
    //     this.presentDialogReachedChatbotLimit()
    //   } else if (this.USER_ROLE === 'agent')  {
    //     this.presentModalOnlyOwnerCanManageTheAccountPlan()
    //   }
    // }

    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit || this.chatBotLimit === 0) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[INSTALL-TEMPLATE] USECASE  chatBotCount < chatBotLimit: RUN FORK')
          this.forkTemplate()
        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[INSTALL-TEMPLATE] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (this.chatBotLimit === null) {
        this.logger.log('[INSTALL-TEMPLATE] USECASE  NO chatBotLimit: RUN FORK')
        this.forkTemplate()
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }
  }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.agentsCannotManageChatbots, this.learnMoreAboutDefaultRoles)
  }

  presentDialogReachedChatbotLimit() {
    this.closeDialog()
    this.logger.log('[TEMPLATE DETAIL] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
    const dialogRef = this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
        subscriptionIsActive: this.subscription_is_active,
        prjctProfileType: this.prjct_profile_type,
        trialExpired: this.trial_expired,
        chatBotLimit: this.chatBotLimit
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[TEMPLATE DETAIL] Dialog result: ${result}`);
    });
  }


  forkTemplate() {
    this.faqKbService.installTemplate(this.templateid, this.projectid, true, this.templateid).subscribe((res: any) => {
      this.logger.log('[TEMPLATE DETAIL] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[TEMPLATE DETAIL] FORK TEMPLATE COMPLETE');
      if (this._newlyCreatedProject) {
        this.hookBotToDept()
      }

      this.getFaqKbById(this.botid);
      this.goToBotDetails()
      if (!isDevMode()) {
        if (window['analytics']) {

          let userFullname = ''
          if (this.user.firstname && this.user.lastname)  {
            userFullname = this.user.firstname + ' ' + this.user.lastname
          } else if (this.user.firstname && !this.user.lastname) {
            userFullname = this.user.firstname
          }

          try {
            window['analytics'].track('Create chatbot', {
              "username": userFullname,
              "email": this.user.email,
              "userId": this.user._id,
              "chatbotName": this.botname,
              "chatbotId": this.botid,
              'page': this.callingPage,
              'button': 'Import Template'
            });
          } catch (err) {
            this.logger.error('track Import template error', err);
          }

          try {
            window['analytics'].identify(this.user._id, {
              name: userFullname,
              email: this.user.email,
              logins: 5,

            });
          } catch (err) {
            this.logger.error('Identify Import template error', err);
          }

          try {
            window['analytics'].group(this.projectId, {
              name: this.projectName,
              plan: this.prjct_profile_name

            });
          } catch (err) {
            this.logger.error('Group Import template error', err);
          }

        }
      }

    });
  }

  hookBotToDept() {
    this.departmentService.updateExistingDeptWithSelectedBot(this.defaultDeptID, this.botid).subscribe((res) => {
      this.logger.log('[TEMPLATE DETAIL] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] Bot Create - UPDATE DEFAULT DEPT WITH FORKED BOT - COMPLETE ');
    });
  }

  getFaqKbById(botid) {
    this.faqKbService.getFaqKbById(botid).subscribe((faqkb: any) => {
      this.logger.log('[TEMPLATE DETAIL] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.botLocalDbService.saveBotsInStorage(botid, faqkb);

    }, (error) => {
      this.logger.error('[TEMPLATE DETAIL] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
    }, () => {
      this.logger.log('[TEMPLATE DETAIL] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
    });
  }


  goToBotDetails() {
    this.logger.log('[TEMPLATE DETAIL] GO TO  BOT DETAILS - isDevMode() ', isDevMode());
    // this.router.navigate(['project/' + this.project._id + '/cds/', this.botid, 'intent', '0']);
    let faqkb = {
      createdAt: new Date(),
      _id : this.botid
    }
    goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)

    this.closeDialog();
    // this.closeCreateBotInfoModal();
    // } else {
    //   this.present_modal_attacch_bot_to_dept()
    // }
  }

  closeDialog() {
    this.dialogRef.close()
  }

  // closeCreateBotInfoModal() {
  //   this.displayInfoModal = 'none';
  //   this.CREATE_BOT_ERROR = null;
  // }




  // present_modal_attacch_bot_to_dept() {
  //   this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
  //   this.displayModalAttacchBotToDept = 'block'
  //   this.closeCreateBotInfoModal();
  // }


  // onSelectDepartment() {
  //   this.logger.log('[TEMPLATE DETAIL] - selected_dept_id ', this.selected_dept_id);
  //   this.dept_id = this.selected_dept_id
  //   const hasFound = this.depts_without_bot_array.filter((obj: any) => {
  //     return obj.id === this.selected_dept_id;
  //   });
  //   this.logger.log('[TEMPLATE DETAIL] private logger: LoggerService --->  onSelectBotId dept found', hasFound);

  //   if (hasFound.length > 0) {
  //     this.selected_dept_name = hasFound[0]['name']
  //   }
  // }

  // onCloseModalAttacchBotToDept() {
  //   this.router.navigate(['project/' + this.projectid + '/tilebot/intents/', this.botid, 'tilebot']);
  //   this.closeDialog();
  //   this.displayModalAttacchBotToDept = 'none'
  // }

  // hookBotGoToBotDetails() {
  //   this.router.navigate(['project/' + this.projectid + '/tilebot/intents/', this.botid, 'tilebot']);
  //   this.closeDialog();
  //   this.displayModalAttacchBotToDept = 'none'
  // }

  traslateString() {
    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation
      })

    this.translate
      .get('AgentsCannotManageChatbots')
      .subscribe((translation: any) => {
        this.agentsCannotManageChatbots = translation
      })
  }


}
