import { Component, OnInit, isDevMode } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Location } from '@angular/common';
import { DepartmentService } from 'app/services/department.service';
import { Project } from 'app/models/project-model';
import { goToCDSVersion } from 'app/utils/util';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { User } from 'app/models/user-model';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifyService } from 'app/core/notify.service';

@Component({
  selector: 'appdashboard-community-template-dtls',
  templateUrl: './community-template-dtls.component.html',
  styleUrls: ['./community-template-dtls.component.scss']
})

export class CommunityTemplateDtlsComponent extends PricingBaseComponent implements OnInit {

  public templateId: string;
  public projectId: string;
  public template: any;
  description: any;
  public isChromeVerGreaterThan100: boolean;
  public UPLOAD_ENGINE_IS_FIREBASE: boolean;
  public storageBucket: string;
  public baseUrl: string;
  public botid: string;
  public TESTSITE_BASE_URL: string;
  public defaultDepartmentId: string;
  public chatBotCount: number;
  project: Project;
  USER_ROLE: string;
  user: User;
  public botname: string;
  projectName: string;

  constructor(
    private route: ActivatedRoute,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public location: Location,
    private router: Router,
    private departmentService: DepartmentService,
    public prjctPlanService: ProjectPlanService,
    private usersService: UsersService,
    public dialog: MatDialog,
    private notify: NotifyService
  ) {
    super(prjctPlanService);
  }

  ngOnInit(): void {
    this.getParamsAndTemplateDetails();
    this.getBrowserVersion();
    this.getProfileImageStorage();
    this.getDeptsByProjectId();
    this.getCurrentProject();
    this.getTestSiteUrl();
    this.getUserRole();
    this.getLoggedUser();
    this.getProjectBots();
    this.getProjectPlan();
  }

  getProjectBots() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      console.log('[COMMUNITY-TEMPLATE-DTLS] - GET CHATBOTS RES', faqKb);

      if (faqKb) {
        this.chatBotCount = faqKb.length;
        console.log('[COMMUNITY-TEMPLATE-DTLS] - COUNT OF CHATBOTS', this.chatBotCount);
      }
    }, (error) => {
      console.error('[COMMUNITY-TEMPLATE-DTLS] - GET CHATBOTS - ERROR ', error);

    }, () => {
      console.log('[COMMUNITY-TEMPLATE-DTLS] - GET CHATBOTS * COMPLETE *');
    });
  }

  getLoggedUser() {
    this.auth.user_bs
      .subscribe((user) => {
        if (user) {
          this.user = user;
        }
      });
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .subscribe((userRole) => {
        console.log('[COMMUNITY-TEMPLATE-DTLS] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getParamsAndTemplateDetails() {
    this.route.params.subscribe((params) => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] GET PARAMS - params ', params);
      if (params) {
        this.templateId = params.templateid
        this.projectId = params.projectid
        this.getCommunityTemplateDetails(this.templateId)
      }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getCommunityTemplateDetails(templateId) {
    this.faqKbService.getCommunityTemplateDetail(templateId)
      .subscribe((_template: any) => {
        console.log('[COMMUNITY-TEMPLATE-DTLS] GET COMMUNITY TEMPLATE - template ', _template);
        if (_template) {
          this.template = _template
          this.botname = _template.name
        }
      })
  }


  goBack() {
    this.location.back();
  }

  importTemplate() {
    // this.faqKbService.installTemplate(this.templateId, this.projectId, true, this.projectId).subscribe((res: any) => {
    //   this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - FORK TEMPLATE RES', res);
    //   this.botid = res.bot_id

    // }, (error) => {
    //   this.logger.error('[COMMUNITY-TEMPLATE-DTLS] FORK TEMPLATE - ERROR ', error);

    // }, () => {
    //   this.logger.log('[COMMUNITY-TEMPLATE-DTLS] FORK TEMPLATE COMPLETE');
    //   this.goToBotDetails()
    // });
    console.log('[COMMUNITY-TEMPLATE-DTLS] importTemplate chatBotCount ', this.chatBotCount, ' chatBotLimit ', this.chatBotLimit, ' USER_ROLE ', this.USER_ROLE, ' profile_name ', this.profile_name)
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit) {
        if (this.chatBotCount < this.chatBotLimit) {
          console.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  chatBotCount < chatBotLimit: RUN FORK')
          this.forkTemplate()
        } else if (this.chatBotCount >= this.chatBotLimit) {
          console.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (!this.chatBotLimit) {
        console.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  NO chatBotLimit: RUN FORK')
        this.forkTemplate()
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  forkTemplate() {
    this.faqKbService.installTemplate(this.templateId, this.projectId, true, this.projectId).subscribe((res: any) => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - FORK TEMPLATE RES', res);
      this.botid = res.bot_id

    }, (error) => {
      this.logger.error('[COMMUNITY-TEMPLATE-DTLS] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] FORK TEMPLATE COMPLETE');

      this.goToBotDetails();
      this.trackImportTemplate();
    });
  }

  presentDialogReachedChatbotLimit() {
    console.log('[COMMUNITY-TEMPLATE-DTLS] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
    const dialogRef = this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`[COMMUNITY-TEMPLATE-DTLS] Dialog result: ${result}`);
    });
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan('Agents can\'t manage chatbots', 'Learn more about default roles')
  }


  goToBotDetails() {
    // this.router.navigate(['project/' + this.projectId + '/cds/', this.botid, 'intent', '0'])
    let faqkb = {
      createdAt: new Date(),
      _id: this.botid
    }
    goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      this.projectName = project.name;
      console.log('[COMMUNITY-TEMPLATE-DTLS] project from AUTH service subscription  ', this.project)
    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - DEPT GET DEPTS ', departments);

      if (departments) {
        departments.forEach((dept: any) => {

          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            this.logger.log('[COMMUNITY-TEMPLATE-DTLS - DEFAULT DEPT ID ', this.defaultDepartmentId);
          }
        });
      }
    }, error => {

      this.logger.error('[COMMUNITY-TEMPLATE-DTLS] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[COMMUNITY-TEMPLATE-DTLS] - DEPT - GET DEPTS - COMPLETE')

    });
  }


  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[COMMUNITY-TEMPLATE-DTLS] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // this.logger.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    // this.logger.log('openTestSiteInPopupWindow testItOutBaseUrl' , testItOutBaseUrl )  
    const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.templateId + "&tiledesk_departmentID=" + this.defaultDepartmentId
    // this.logger.log('openTestSiteInPopupWindow URL ', url) 
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }

  trackImportTemplate() {
    if (!isDevMode()) {
      if (window['analytics']) {

        let userFullname = ''
        if (this.user.firstname && this.user.lastname) {
          userFullname = this.user.firstname + ' ' + this.user.lastname
        } else if (this.user.firstname && !this.user.lastname) {
          userFullname = this.user.firstname
        }

        try {
          window['analytics'].track('Import template', {
            "username": userFullname,
            "email": this.user.email,
            "userId": this.user._id,
            "chatbotName": this.botname,
            'chatbotId': this.botid,
            'page': 'Community templates',
            'button': 'Import Template',
          });
        } catch (err) {
          this.logger.error('track Import template (install template) event error', err);
        }

        try {
          window['analytics'].identify(this.user._id, {
            name: userFullname,
            email: this.user.email,
            logins: 5,

          });
        } catch (err) {
          this.logger.error('Identify Import template (install template) event error', err);
        }

        try {
          window['analytics'].group(this.projectId, {
            name: this.projectName,
            plan: this.prjct_profile_name,
          });
        } catch (err) {
          this.logger.error('Group Import template (install template) error', err);
        }

      }
    }
  }



}
