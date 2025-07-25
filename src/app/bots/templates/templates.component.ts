import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { MatDialog } from '@angular/material/dialog';
import { TemplateDetailComponent } from './template-detail/template-detail.component';
import { Router } from '@angular/router';
import { AppConfigService } from 'app/services/app-config.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { ChatbotModalComponent } from '../bots-list/chatbot-modal/chatbot-modal.component';
import { NotifyService } from 'app/core/notify.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { TranslateService } from '@ngx-translate/core';
import { WebhookService } from 'app/services/webhook.service';
import { BrandService } from 'app/services/brand.service';
import { CreateChatbotModalComponent } from '../bots-list/create-chatbot-modal/create-chatbot-modal.component';
import { containsXSS, formatBytesWithDecimal, goToCDSVersion } from 'app/utils/util';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { CreateFlowsModalComponent } from '../bots-list/create-flows-modal/create-flows-modal.component';
import { FaqService } from 'app/services/faq.service';
import { ProjectService } from 'app/services/project.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
// import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
const Swal = require('sweetalert2')


@Component({
  selector: 'appdashboard-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})

// interface certifiedTags {
//   name: string;
//   [others: string]: any;
// }

export class TemplatesComponent extends PricingBaseComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  isChromeVerGreaterThan100: boolean;
  templates: Array<any>
  communityTemplates: Array<any>;
  certfifiedTemplates: Array<any>;
  allTemplatesCount: number;
  allCommunityTemplatesCount: number;
  // kbCount: number;

  customerSatisfactionTemplates: Array<any>
  customerSatisfactionTemplatesCount: number;

  increaseSalesTemplates: Array<any>
  increaseSalesTemplatesCount: number;

  project: any;
  projectId: string
  route: string
  showSpinner: boolean
  myChatbotOtherCount: number;
  automationsCount: number;
  flowWebhooksCount: number;
  customerSatisfactionBotsCount: number;
  increaseSalesBotsCount: number;
  COMMUNITY_TEMPLATE: boolean = false;
  CERTIFIED_TEMPLATE: boolean = false;

  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  valueToSearch: string;
  public THERE_ARE_RESULTS: boolean = true;
  chatBotCount: any;
  public USER_ROLE: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  isVisiblePAY: boolean;
  public_Key: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean = true;
  pageTitle: string;

  public displayChatbotsCommunity: boolean;
  public displayTemplatesCategory: boolean;

  public BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE: boolean;
  chatbotName: string;
  user: any;
  botDefaultLangCode: string = 'en';
  isChatbotRoute: boolean = true;
  chatbotToImportSubtype: string;

  diplayTwilioVoiceChabotCard: boolean;
  diplayVXMLVoiceChabotCard:boolean;

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_ADD_FLOWS: boolean;

  constructor(
    private auth: AuthService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    public dialog: MatDialog,
    private router: Router,
    public appConfigService: AppConfigService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    public usersService: UsersService,
    private translate: TranslateService,
    private webhookService: WebhookService,
    public brandService: BrandService,
    private botLocalDbService: BotLocalDbService,
    private faqService: FaqService,
    private projectService: ProjectService,
    private roleService: RoleService,
    private rolesService: RolesService
    // private kbService: KnowledgeBaseService,
  ) {
    super(prjctPlanService, notify);

    const brand = brandService.getBrand();
    this.displayChatbotsCommunity = brand['display_chatbots_community']
    this.displayTemplatesCategory = brand['display_templates_category']
  }



  ngOnInit(): void {
    this.roleService.checkRoleForCurrentProject('flows')
    this.getBrowserVersion();
    this.getTemplates()
    this.getCommunityTemplates()
    this.getFlowWebhooks()
    this.getCurrentProject()
    // this.getAllNamespaces()
    // this.getAllFaqKbByProjectId();
    this.getFaqKbByProjectId()
    this.getRoutes();
    this.getProfileImageStorage();
    this.getProjectPlan();
    this.getUserRole();
    this.getOSCODE();
    this.getCurreURL();
    this.listenToProjectUser()
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);

    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.ROLE = status.role;
        this.PERMISSIONS = status.matchedPermissions;
        console.log('[BOTS-TEMPLATES] - this.ROLE:', this.ROLE);
        console.log('[BOTS-TEMPLATES] - this.PERMISSIONS', this.PERMISSIONS);
        this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
        console.log('[BOTS-TEMPLATES] - hasDefaultRole', this.hasDefaultRole);

        // PERMISSION_TO_ADD_FLOWS
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_ADD_FLOWS = true;
          console.log('[BOTS-TEMPLATES] - Project user is owner or admin (1)', 'PERMISSION_TO_ADD_FLOWS:', this.PERMISSION_TO_ADD_FLOWS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_ADD_FLOWS = false;
          console.log('[BOTS-TEMPLATES] - Project user is agent (2)', 'PERMISSION_TO_ADD_FLOWS:', this.PERMISSION_TO_ADD_FLOWS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_ADD_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_ADD);
          console.log('[BOTS-TEMPLATES] - Custom role (3)', status.role, 'PERMISSION_TO_ADD_FLOWS:', this.PERMISSION_TO_ADD_FLOWS);
        }
      });

  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[BOTS-TEMPLATES] - getLoggedUser USER ', user)

        this.user = user;
      })
  }

  getCurreURL() {
    const currentUrl = this.router.url;
    this.logger.log('[BOTS-TEMPLATES] - current URL »»» ', currentUrl)
    const currentUrlLastSegment = currentUrl.substring(currentUrl.lastIndexOf('/') + 1);
    this.logger.log('[BOTS-TEMPLATES] - current URL last segment ', currentUrlLastSegment);
    if (currentUrlLastSegment === 'all') {
      this.pageTitle = 'AllTemplates' //"All templates"
    } else if (currentUrlLastSegment === 'community') {
      this.pageTitle = "CommunityTemplates" // "Community templates"
    } else if (currentUrlLastSegment === 'increase-sales') {
      this.pageTitle = "IncreaseSales"//"Increase sales templates "
    } else if (currentUrlLastSegment === 'customer-satisfaction') {
      this.pageTitle = "CustomerSatisfaction" //"Customer satisfaction templates "
    }
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('AppConfigService getAppConfig (BOT LIST) public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (BOT LIST) keys', keys)
    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }
    })

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[BOTS-TEMPLATES] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;

      // this.logger.log('[BOTS-TEMPLATES] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getRoutes() {
    this.route = this.router.url
    if (this.route.indexOf('bots/templates/community') !== -1) {
      this.COMMUNITY_TEMPLATE = true
      this.CERTIFIED_TEMPLATE = false
      this.logger.log('[BOTS-TEMPLATES] COMMUNITY TEMPLATES ', this.COMMUNITY_TEMPLATE)
      this.logger.log('[BOTS-TEMPLATES] CERTIFIED TEMPLATES ', this.CERTIFIED_TEMPLATE)
    } else if ((this.route.indexOf('bots/templates/all') !== -1) || (this.route.indexOf('bots/templates/customer-satisfaction') !== -1) || (this.route.indexOf('bots/templates/increase-sales') !== -1)) {
      this.CERTIFIED_TEMPLATE = true
      this.COMMUNITY_TEMPLATE = false
      this.logger.log('[BOTS-TEMPLATES] CERTIFIED TEMPLATES ', this.CERTIFIED_TEMPLATE)
      this.logger.log('[BOTS-TEMPLATES] COMMUNITY TEMPLATES ', this.COMMUNITY_TEMPLATE)
    }

    if (this.route.indexOf('/bots/templates/all') !== -1) {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/increase-sales') !== -1) {
      this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/customer-satisfaction') !== -1) {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/community') !== -1) {
      this.BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE = true
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE = false
      // this.logger.log('[BOTS-TEMPLATES] - BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    }

  }


  goToBotAllTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/all']);
  }

  goToBotCommunityTemplates() {
     this.roleService.checkRoleForCurrentProject('flows')
    this.router.navigate(['project/' + this.project._id + '/bots/templates/community']);
  }

  goToBotIncreaseSalesTemplates() {
    this.roleService.checkRoleForCurrentProject('flows')
    this.router.navigate(['project/' + this.project._id + '/bots/templates/increase-sales']);
  }

  goToBotCustomerSatisfactionTemplates() {
    this.roleService.checkRoleForCurrentProject('flows')
    this.router.navigate(['project/' + this.project._id + '/bots/templates/customer-satisfaction']);
  }


  // Lead-gen ->  #a16300
  // Pre-sale -> #00699e
  //  Support -> #25833e
  // Self-serve -> #0049bd
  // Internal-Processes -> #a613ec

  // certified: true
  // mainCategory
  // bigImage
  // templateFeatures

  // nameOnSite

  // certifiedTags
  // "certifiedTags": [{ "color": "#00699e", "name": "Pre-Sale" }, { "color": "#a16300", "name": "Lead-Gen" }],

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project;
        this.projectId = project._id;
        this.getProjectById(this.projectId)
      }
    });
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => { 

      this.logger.log('[BOTS-TEMPLATES] - GET PROJECT BY ID - project ', project);
      const projectProfileData = project.profile
      this.logger.log('[BOTS-TEMPLATES] - GET PROJECT BY ID - projectProfileData ', projectProfileData);

      this.manageVoiceChatbotVisibility(projectProfileData)

    }, error => {
      this.logger.error('[BOTS-TEMPLATES] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] - GET PROJECT BY ID * COMPLETE *  this.project ', this.project);
    });
  }

  manageVoiceChatbotVisibility(projectProfileData: any): void {
    const customization = projectProfileData?.customization;
  
    if (!customization) {
      this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) No customization found.');
      this.diplayTwilioVoiceChabotCard = false;
      this.diplayVXMLVoiceChabotCard = false;
      this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) diplayTwilioVoiceChabotCard:', this.diplayTwilioVoiceChabotCard);
      this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) diplayVXMLVoiceChabotCard:', this.diplayVXMLVoiceChabotCard);
      return;
    }
  
    const voiceTwilio = customization['voice_twilio'] ?? false;
    const voice = customization['voice'] ?? false;
  
    this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) voice_twilio:', voiceTwilio);
    this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) voice:', voice);
  
    this.diplayTwilioVoiceChabotCard = voiceTwilio === true;
    this.diplayVXMLVoiceChabotCard = voice === true;
    this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) diplayTwilioVoiceChabotCard:', this.diplayTwilioVoiceChabotCard);
    this.logger.log('[BOTS-TEMPLATES] (manageVoiceChatbotVisibility) diplayVXMLVoiceChabotCard:', this.diplayVXMLVoiceChabotCard);
  }

  openDialog(template) {
    if (!this.PERMISSION_TO_ADD_FLOWS) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    this.logger.log('openDialog TemplateDetailComponent')
    const dialogRef = this.dialog.open(TemplateDetailComponent, {
      data: {
        template: template,
        projectId: this.projectId,
        callingPage: "Templates",
        projectProfile: this.prjct_profile_name
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.logger.log(`Dialog result: ${result}`);
    });
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      if (faqKb) {
        this.chatBotCount = faqKb.length
        // this.myChatbotOtherCount = faqKb.length
        this.logger.log('[BOTS-TEMPLATES] - GET BOTS BY PROJECT ID - myChatbotOtherCount', this.myChatbotOtherCount);
        this.logger.log('[BOTS-TEMPLATES] - GET BOTS BY PROJECT ID - faqKb', faqKb);
      }

      const myChatbot = faqKb.filter((obj) => {
        return !obj.subtype || obj.subtype === "chatbot" || obj.subtype === "voice" || obj.subtype === "voice_twilio";
      });
      this.logger.log('[BOTS-TEMPLATES]  - myChatbot', myChatbot);
      if (myChatbot) {
        this.myChatbotOtherCount = myChatbot.length;
        this.logger.log('[BOTS-TEMPLATES]  - myChatbot COUNT', this.customerSatisfactionTemplatesCount);
      }


      const automations = faqKb.filter((obj) => {
        return obj.subtype && ["webhook", "copilot"].includes(obj.subtype);
      });
      this.logger.log('[BOTS-TEMPLATES]  - automations', automations);
      if (automations) {
        this.automationsCount = automations.length;
        this.logger.log('[BOTS-TEMPLATES]  - automations COUNT', this.customerSatisfactionTemplatesCount);
      }

      const customerSatisfactionBots = faqKb.filter((obj) => {
        return obj.mainCategory === "Customer Satisfaction"
      });
      this.logger.log('[BOTS-TEMPLATES]  - Customer Satisfaction BOTS', customerSatisfactionBots);
      if (customerSatisfactionBots) {
        this.customerSatisfactionBotsCount = customerSatisfactionBots.length;
        this.logger.log('[BOTS-TEMPLATES]  - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
      }

      const increaseSalesBots = faqKb.filter((obj) => {
        return obj.mainCategory === "Increase Sales"
      });
      this.logger.log('[BOTS-TEMPLATES]  - Increase Sales BOTS ', increaseSalesBots);
      if (increaseSalesBots) {
        this.increaseSalesBotsCount = increaseSalesBots.length;
        this.logger.log('[BOTS-TEMPLATES] - Increase Sales BOTS COUNT', this.increaseSalesTemplatesCount);
      }


    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET BOTS COMPLETE');

    });

  }



  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  // No more used
  // getAllNamespaces() {
  //   this.kbService.getAllNamespaces().subscribe((res: any) => {
  //     if (res) {
  //       this.kbCount = res.length
  //       this.logger.log('[BOTS-TEMPLATES] - GET ALL NAMESPACES', res);

  //     }
  //   }, (error) => {
  //     this.logger.error('[BOTS-TEMPLATES]  GET GET ALL NAMESPACES ERROR ', error);

  //   }, () => {
  //     this.logger.log('[BOTS-TEMPLATES]  GET ALL NAMESPACES * COMPLETE *');

  //   });
  // }
  getFlowWebhooks() {
    this.showSpinner = true;
    this.webhookService.getFlowWebhooks().subscribe((res: any) => {
      this.logger.log('[BOTS-LIST] GET WH RES  ', res);
      if (res) {
        this.flowWebhooksCount = res.length
      }

    }, (error) => {
      this.logger.error('[BOTS-LIST] GET WH ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-LIST] GET WH COMPLETE');
      this.showSpinner = false;
    });
  }


  getCommunityTemplates() {
    this.showSpinner = true;
    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {

      if (res) {
        this.communityTemplates = res
        this.logger.log('[BOTS-TEMPLATES] - GET COMMUNITY TEMPLATES', this.communityTemplates);
        this.allCommunityTemplatesCount = this.communityTemplates.length;
        this.logger.log('[BOTS-TEMPLATES] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);

        // this.getUserCommunityProfile(this.communityTemplates)


        // let stripHere = 115;
        // this.communityTemplates.forEach(communityTemplate => {
        //   // this.logger.log('[BOTS-TEMPLATES] communityTemplate', communityTemplate);
        //   if (communityTemplate['description']) {
        //     communityTemplate['shortDescription'] = communityTemplate['description'].substring(0, stripHere) + '...';
        //   }
        // });

        this.route = this.router.url
        if (this.route.indexOf('bots/templates/community') !== -1) {
          this.templates = this.communityTemplates
          this.logger.log('[BOTS-TEMPLATES] ROUTE templates/community');
        }

        // this.generateTagsBackground(this.templates)
      }

    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET TEMPLATES ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET TEMPLATES COMPLETE');
      this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });

  }

  getUserCommunityProfile(communityTemplates) {
    this.logger.log('[BOTS-TEMPLATES] USER CMNTY PROFILE ', communityTemplates);
    communityTemplates.forEach(tmplt => {
      this.logger.log('BOTS-TEMPLATES] created by  ', tmplt.createdBy)

      this.usersService.getCurrentUserCommunityProfile(tmplt.createdBy)
        .subscribe((userCmntyProfile: any) => {
          let createdByFullName = ""
          if (userCmntyProfile.firstname && userCmntyProfile.lastname) {
            createdByFullName = userCmntyProfile.firstname + ' ' + userCmntyProfile.lastname
            this.communityTemplates['createdByFullName'] = createdByFullName
          } else if (userCmntyProfile.firstname && !userCmntyProfile.lastname) {
            createdByFullName = userCmntyProfile.firstname
            this.communityTemplates['createdByFullName'] = createdByFullName
          }

          this.logger.log('[BOTS-TEMPLATES] USER CMNTY PROFILE >  createdBy', createdByFullName);
          // this.logger.log('[BOTS-TEMPLATES] USER CMNTY PROFILE >  communityTemplates', this.communityTemplates);
        })
    });
  }

  getTemplates() {
    this.showSpinner = true;
    this.route = this.router.url
    this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES route', this.route);
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        this.certfifiedTemplates = res
        console.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES ', this.certfifiedTemplates);

        this.doShortDescription(this.certfifiedTemplates)
        // this.templates = res
        // this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES', this.templates);
        // this.allTemplatesCount = this.templates.length;
        this.allTemplatesCount = this.certfifiedTemplates.length;
        this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);
        if (this.route.indexOf('bots/templates/all') !== -1) {
          this.templates = this.certfifiedTemplates
        }

        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        this.customerSatisfactionTemplates = this.certfifiedTemplates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[BOTS-TEMPLATES] - Customer Satisfaction TEMPLATES', this.customerSatisfactionTemplates);
        if (this.customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = this.customerSatisfactionTemplates.length;
          this.logger.log('[BOTS-TEMPLATES] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
          // this.doShortDescription(this.customerSatisfactionTemplates)
        }



        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        this.increaseSalesTemplates = this.certfifiedTemplates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        this.logger.log('[BOTS-TEMPLATES] - Increase Sales TEMPLATES', this.increaseSalesTemplates);
        if (this.increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = this.increaseSalesTemplates.length;
          this.logger.log('[BOTS-TEMPLATES] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
          // this.doShortDescription(this.increaseSalesTemplates)
        }

        this.route = this.router.url
        // if (this.route.indexOf('bots/templates/all') !== -1) {
        //   this.templates = this.templates 
        //   this.logger.log('[BOTS-TEMPLATES] ROUTE templates/all');
        //   this.allTemplatesCount = this.templates.length;
        //   this.logger.log('[BOTS-TEMPLATES] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);
        // } else 
        if (this.route.indexOf('bots/templates/customer-satisfaction') !== -1) {
          this.templates = this.customerSatisfactionTemplates
          this.logger.log('[BOTS-TEMPLATES] ROUTE templates/customer-satisfaction templates ', this.templates);
        } else if (this.route.indexOf('bots/templates/increase-sales') !== -1) {

          this.templates = this.increaseSalesTemplates
          this.logger.log('[BOTS-TEMPLATES] ROUTE templates/increase-sales templates ', this.templates);
        }

        this.logger.log('[BOTS-TEMPLATES] - GET TEMPLATES - All TEMPLATES COUNT ', this.allTemplatesCount);
        if (this.templates) {
          this.generateTagsBackground(this.templates)
        }
      }

    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] GET TEMPLATES ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-TEMPLATES] GET TEMPLATES COMPLETE');
      this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
    });
  }

  doShortDescription(templates) {

    let stripHere = 115;
    templates.forEach(template => {
      this.logger.log('[BOTS-TEMPLATES] startChatBot', template);
      if (template['description']) {
        template['shortDescription'] = template['description'].substring(0, stripHere) + '...';
      }
    });
  }



  generateTagsBackground(templates) {
    templates.forEach(template => {
      // this.logger.log('generateTagsBackground template', template)
      if (template && template.certifiedTags) {
        template.certifiedTags.forEach(tag => {
          // this.logger.log('generateTagsBackground tag', tag)
          let tagbckgnd = ''
          if (tag.color === "#a16300" || tag.color === "#A16300") {
            tagbckgnd = 'rgba(255,221,167,1)'
          } else if (tag.color === "#00699E" || tag.color === "#00699e") {
            tagbckgnd = 'rgba(208,239,255, 1)'
          } else if (tag.color === "#25833e" || tag.color === "#25833E") {
            tagbckgnd = 'rgba(204,241,213, 1)'
          } else if (tag.color === "#0049bd" || tag.color === "#0049BD") {
            tagbckgnd = 'rgba(220,233,255, 1)'
          } else if (tag.color === "#a613ec" || tag.color === "#A613EC") {
            tagbckgnd = 'rgba(166, 19, 236, 0.2)'
          } else if (tag.color !== "#a16300" && tag.color !== "#A16300" && tag.color !== "#00699E" && tag.color !== "#00699e" && tag.color !== "#25833e" && tag.color !== "#25833E" && tag.color !== "#0049bd" && tag.color !== "#0049BD") {

            tagbckgnd = this.hexToRgba(tag.color)
            // this.logger.log('generateTagsBackground tagbckgnd ', tagbckgnd)
          }

          // let b = {background : tagbckgnd}

          tag.background = tagbckgnd
          // template.certifiedTags.find(t => t.color === t.background).background = tagbckgnd;

          // if (tag.color === tag.background) {
          //   // template.certifiedTags.push({ 'background': `${tagbckgnd}` })
          //   template.certifiedTags['background']=  tagbckgnd
          // }
        });
      }
    });
  }

  hexToRgba(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split('');
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.3)';
    }
    throw new Error('Bad Hex');

  }

  presentDialogCreateFlows(isChatbotRoute) {
    this.logger.log(`[BOTS-LIST] present Dialog Create Flows - isChatbotRoute :`, isChatbotRoute);
    const showTwilio = this.diplayTwilioVoiceChabotCard;
    const showVXML = this.diplayVXMLVoiceChabotCard;
    let dialogWidth = '800px';

    if (isChatbotRoute && !showTwilio && !showVXML) {
      dialogWidth = '550px';
    }

    const dialogRef = this.dialog.open(CreateFlowsModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: dialogWidth,
      data: {
        'isChatbotRoute': isChatbotRoute,
        'diplayTwilioVoiceChabotCard': this.diplayTwilioVoiceChabotCard,
        'diplayVXMLVoiceChabotCard': this.diplayVXMLVoiceChabotCard
      },
    });

    dialogRef.afterClosed().subscribe(subType => {
      this.logger.log(`[BOTS-LIST] Dialog Create Flows after Closed - subType :`, subType);
      this.logger.log(`[BOTS-LIST] Dialog Create Flows after Closed - subType typeof:`, typeof subType);
      if (subType && typeof subType !== 'object') {
        this.presentModalAddBotFromScratch(subType)
      } else if (subType && typeof subType === 'object') {
        this.fileChangeUploadChatbotFromJSON(subType)
      }
    });
  }

  presentModalAddBotFromScratch(subtype) {
    this.logger.log('[BOTS-LIST] - presentModalAddBotFromScratch subtype ', subtype);
    // const createBotFromScratchBtnEl = <HTMLElement>document.querySelector('#home-material-btn');
    // this.logger.log('[HOME-CREATE-CHATBOT] - presentModalAddBotFromScratch addKbBtnEl ', addKbBtnEl);
    // createBotFromScratchBtnEl.blur()
    const dialogRef = this.dialog.open(CreateChatbotModalComponent, {
      width: '400px',
      data: {
        'subtype': subtype
      },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[BOTS-LIST] Dialog result:`, result);

      if (result) {
        this.chatbotName = result.chatbotName;

        if (this.chatbotName) {
          this.createBlankTilebot(result.subType)
        }
      }
    });
  }


  createBlankTilebot(botSubtype?: string) {
  
    this.logger.log('[BOTS-TEMPLATES] createBlankTilebot chatBotCount ', this.chatBotCount, ' chatBotLimit ', this.chatBotLimit, ' USER_ROLE ', this.USER_ROLE)
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit || this.chatBotLimit === 0) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[BOTS-TEMPLATES] USECASE  chatBotCount < chatBotLimit: RUN NAVIGATE')

          this.createTilebotBotFromScratch(botSubtype)

        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[BOTS-TEMPLATES] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (this.chatBotLimit === null) {
        this.logger.log('[BOTS-TEMPLATES] USECASE  NO chatBotLimit: RUN Create')

        this.createTilebotBotFromScratch(botSubtype)
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }

  }

  createTilebotBotFromScratch(botSubtype) {
    this.faqKbService.createChatbotFromScratch(this.chatbotName, 'tilebot', botSubtype, this.botDefaultLangCode).subscribe((faqKb) => {
      this.logger.log('[BOT-LIST] createTilebotBotFromScratch - RES ', faqKb);
      if (faqKb) {
        // SAVE THE BOT IN LOCAL STORAGE
        this.botLocalDbService.saveBotsInStorage(faqKb['_id'], faqKb);

        let newfaqkb = {
          createdAt: new Date(),
          _id: faqKb['_id']
        }

        goToCDSVersion(this.router, newfaqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
        this.trackChatbotCreated(faqKb, 'Create')
      }

    }, (error) => {

      this.logger.error('[BOT-LIST] CREATE FAQKB - POST REQUEST ERROR ', error);


    }, () => {
      this.logger.log('[BOT-LIST] CREATE FAQKB - POST REQUEST * COMPLETE *');
      this.chatbotName = null;
      // this.getFaqKbByProjectId();
      // this.router.navigate(['project/' + this.project._id + '/cds/', this.newBot_Id, 'intent', '0']);
    })
  }

  // --------------------------------------------------------------------------
  // @ Import chatbot from json 
  // --------------------------------------------------------------------------
  async fileChangeUploadChatbotFromJSON(event) {

    this.logger.log('[BOT-LIST] - fileChangeUploadChatbotFromJSON $event ', event);
    // let fileJsonToUpload = ''
    // this.logger.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event  target', event.target);
    const selectedFile = event.target.files[0];
    this.logger.log('[BOT-LIST] - fileChangeUploadChatbotFromJSON selectedFile ', selectedFile);
    if (selectedFile && selectedFile.type === "application/json") {
      const fileReader = new FileReader();
      fileReader.readAsText(selectedFile, "UTF-8");
      fileReader.onload = () => {
        let fileJsonToUpload = JSON.parse(fileReader.result as string)
        this.logger.log('[BOT-LIST] - fileChangeUploadChatbotFromJSON  onload fileJsonToUpload CHATBOT 1', fileJsonToUpload);

        this.logger.log('[BOT-LIST] - fileChangeUploadChatbotFromJSON  isChatbotRoute ', this.isChatbotRoute)
        this.logger.log('[BOT-LIST] - fileChangeUploadChatbotFromJSON  fileJsonToUpload subtype ', fileJsonToUpload.subtype)
        this.chatbotToImportSubtype = fileJsonToUpload.subtype ?? 'chatbot';
      }

      const fileList: FileList = event.target.files;
      const file: File = fileList[0];
      this.logger.log('fileChangeUploadChatbotFromJSON ---> file', file)

      // Check for valid JSON
      let json = await this.readFileAsync(file).catch(e => { return; })
      if (!json) {
        this.notify.showToast(this.translate.instant('InvalidJSON'), 4, 'report_problem')
        return;
      }

      const jsonString = JSON.stringify(json)
      // Check for XSS patterns
      if (containsXSS(jsonString)) {
        // this.logger.log("Potential XSS attack detected!");
        this.notify.showToast(this.translate.instant('UploadedFileMayContainsDangerousCode'), 4, 'report_problem')
        return;
      }

      const formData: FormData = new FormData();
      // formData.set('id_faq_kb', this.id_faq_kb);
      formData.append('uploadFile', file, file.name);
      this.logger.log('[BOT-LIST] ---> FORM DATA ', formData)

      if (this.USER_ROLE !== 'agent') {
        if (this.chatBotLimit || this.chatBotLimit === 0) {
          if (this.chatBotCount < this.chatBotLimit) {
            // console.log('[BOT-LIST] USECASE  chatBotCount < chatBotLimit: RUN IMPORT CHATBOT FROM JSON chatbotToImportSubtype:', this.chatbotToImportSubtype, '- isChatbotRoute:', this.isChatbotRoute)
            // if (this.isChatbotRoute && (this.chatbotToImportSubtype === 'webhook' || this.chatbotToImportSubtype === 'copilot')) {
            //   console.log(`[BOT-LIST] You are importing a ${this.chatbotToImportSubtype} flow and it will be added to the Automations list. Do you want to continue? `)
            //   this.presentDialogImportMismatch(formData, this.chatbotToImportSubtype, 'automations')
            // }
            // if (!this.isChatbotRoute && (this.chatbotToImportSubtype !== 'webhook' && this.chatbotToImportSubtype !== 'copilot')) {
            //   console.log(`[BOT-LIST] You are importing a ${this.chatbotToImportSubtype} flow and it will be added to the Chatbots list. Do you want to continue? `)
            //   this.presentDialogImportMismatch(formData, this.chatbotToImportSubtype, 'chatbots')
            // }
            // if ((this.isChatbotRoute && (this.chatbotToImportSubtype !== 'webhook' && this.chatbotToImportSubtype !== 'copilot')) || (!this.isChatbotRoute && (this.chatbotToImportSubtype === 'webhook' || this.chatbotToImportSubtype === 'copilot'))) {
            //   this.importChatbotFromJSON(formData)
            // }
            this.importChatbotFromJSON(formData)
          } else if (this.chatBotCount >= this.chatBotLimit) {
            this.logger.log('[BOT-LIST] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
            this.presentDialogReachedChatbotLimit()
          }
        } else if (this.chatBotLimit === null) {
          this.logger.log('[BOT-LIST] USECASE  NO chatBotLimit: RUN IMPORT CHATBOT FROM JSON')
          this.importChatbotFromJSON(formData)
        }
      } if (this.USER_ROLE === 'agent') {
        this.presentModalAgentCannotManageChatbot()
      }
    } else {
      this.notify.presenModalAttachmentFileTypeNotSupported()
    }
  }

  presentDialogImportMismatch(formData: any, chatbotToImportSubtype: string, correctMatch: string) {
    this.logger.log(`[BOT-LIST] formData ${formData} chatbotToImportSubtype ${chatbotToImportSubtype} correctMatch ${correctMatch}`)
    Swal.fire({
      title: 'Are you sure',
      text: `You are about to import a  ${chatbotToImportSubtype} flow and it will be added to the ${correctMatch} list. Do you want to continue?`,
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancel', // this.translate.instant('Cancel'),
      confirmButtonText: 'Ok', // this.translate.instant('Ok'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.importChatbotFromJSON(formData)
      }
    })
  }


  importChatbotFromJSON(formData) {
    // this.showUploadingSpinner = true
    this.logger.log('[BOT-CREATE] - IMPORT CHATBOT FROM JSON formData ', formData)
    this.faqService.importChatbotFromJSONFromScratch(formData).subscribe((faqkb: any) => {
      this.logger.log('[BOT-CREATE] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        // this.showUploadingSpinner = false

        this.logger.log('[BOT-CREATE] - IMPORT CHATBOT FROM JSON  RES - importedChatbotid ', faqkb._id)
        this.botLocalDbService.saveBotsInStorage(faqkb._id, faqkb);

        let newfaqkb = {
          createdAt: new Date(),
          _id: faqkb['_id']
        }

        goToCDSVersion(this.router, newfaqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)

        this.trackChatbotCreated(faqkb, 'Import')
      }

    }, (error) => {
      // this.showUploadingSpinner = false
      this.logger.error('[BOT-CREATE] -  IMPORT CHATBOT FROM JSON- ERROR', error);
      this.manageUploadError(error)
      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('ThereHasBeenAnErrorProcessing'), 4, 'report_problem');
    }, () => {
      this.logger.log('[BOT-CREATE] - IMPORT CHATBOT FROM JSON - COMPLETE');
      this.notify.showWidgetStyleUpdateNotification("Chatbot was uploaded succesfully", 2, 'done')
      // this.getFaqKbByProjectId();
    });

  }

   manageUploadError(error) {
      if (error.status === 413) {
        this.logger.log(`[BOT-CREATE] - upload json error message 1`, error.error.err)
        this.logger.log(`[BOT-CREATE] - upload json error message 2`, error.error.limit_file_size)
        const uploadLimitInBytes = error.error.limit_file_size
        const uploadFileLimitSize = formatBytesWithDecimal(uploadLimitInBytes, 2)
        this.logger.log(`[BOT-CREATE] - upload json error limitInMB`, uploadFileLimitSize)
        this.notify.presentModalAttachmentFileSizeTooLarge(uploadFileLimitSize)
      }
    }

    private readFileAsync(file: File): Promise<{}> {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
  
        fileReader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            let fileJsonToUpload = JSON.parse(fileReader.result as string);
            this.logger.log('fileJsonToUpload CHATBOT readFileAsync', fileJsonToUpload);
            resolve(fileJsonToUpload)
          } catch (error) {
            this.logger.error('Error while parsing JSON:', error);
            reject(error)
          }
        };
  
        fileReader.onerror = (e) => {
          reject(e);
        };
  
        fileReader.readAsText(file);
      });
    }


    trackChatbotCreated(faqKb, action) {
      let userFullname = ''
      if (this.user.firstname && this.user.lastname) {
        userFullname = this.user.firstname + ' ' + this.user.lastname
      } else if (this.user.firstname && !this.user.lastname) {
        userFullname = this.user.firstname
      }
      if (!isDevMode()) {
        try {
          window['analytics'].track(action + ' ' + faqKb.subtype, {
            "type": "organic",
            "username": userFullname,
            "email": this.user.email,
            'userId': this.user._id,
            'chatbotName': faqKb['name'],
            'chatbotId': faqKb['_id'],
            'subtype': faqKb.subtype,
            'page': 'Templates',
            'button': action,
          });
        } catch (err) {
          // this.logger.error(`Track Create chatbot error`, err);
        }
  
        try {
          window['analytics'].identify(this.user._id, {
            username: userFullname,
            email: this.user.email,
            logins: 5,
  
          });
        } catch (err) {
          // this.logger.error(`Identify Create chatbot error`, err);
        }
  
        try {
          window['analytics'].group(this.project._id, {
            name: this.project.name,
            plan: this.prjct_profile_name
  
          });
        } catch (err) {
          // this.logger.error(`Group Create chatbot error`, err);
        }
      }
    }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.agentsCannotManageChatbots, this.learnMoreAboutDefaultRoles)
  }

  presentDialogReachedChatbotLimit() {
    this.logger.log('[BOTS-TEMPLATES] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
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
      this.logger.log(`Dialog result: ${result}`);
    });
  }

  goToCommunityTemplateDetail(templateid) {
    this.logger.log('[BOTS-TEMPLATES]  GO TO COMMUNITY TEMPLATE DTLS -  templateid ', templateid);
    this.router.navigate(['project/' + this.project._id + '/template-details/' + templateid]);
  }

  goToExternalCommunity() {
    const url = "https://tiledesk.com/community/"
    window.open(url, '_blank');
  }



  searchInCommunityTemplates() {
    this.logger.log('[BOTS-TEMPLATES]  SEARCH IN COMMUNITY TEMPLATE - value to search ', this.valueToSearch);
    this.faqKbService.searchInCommunityTemplates(this.valueToSearch).subscribe((searchedtemplates: any) => {
      if (searchedtemplates) {
        this.templates = searchedtemplates

        if (searchedtemplates.length === 0) {
          this.THERE_ARE_RESULTS = false;

        } else {
          this.THERE_ARE_RESULTS = true;
        }
      }

      this.logger.log('[BOTS-TEMPLATES]  SEARCH IN COMMUNITY TEMPLATE - RES  ', searchedtemplates);
    }, (error) => {
      this.logger.error('[BOTS-TEMPLATES] SEARCH IN COMMUNITY TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-TEMPLATES] SEARCH IN COMMUNITY TEMPLATE * COMPLETE * ');

    });
  }

  onChangeValueToSearch(valueToSearch) {
    this.logger.log('[BOTS-TEMPLATES] onChangeValueToSearch  valueToSearch ', valueToSearch);
    if (valueToSearch === '') {
      // this.getCommunityTemplates()
      this.templates = this.communityTemplates
    }

  }

  clearSearchInCommunityTemplates() {
    this.valueToSearch = ''
    this.templates = this.communityTemplates
  }


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
