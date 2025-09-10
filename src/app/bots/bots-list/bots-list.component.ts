import { Component, isDevMode, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FaqKbService } from '../../services/faq-kb.service';
import { Chatbot, FaqKb } from '../../models/faq_kb-model';
import { ActivatedRoute, Router } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { NotifyService } from '../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';
import { DepartmentService } from '../../services/department.service';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { MatDialog } from '@angular/material/dialog';
import { CloneBotComponent } from './clone-bot/clone-bot.component';
import { CHATBOT_MAX_NUM, containsXSS, formatBytesWithDecimal, goToCDSVersion, PLAN_NAME } from 'app/utils/util';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { UsersService } from 'app/services/users.service';
import { ChatbotModalComponent } from './chatbot-modal/chatbot-modal.component';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessagesStatsModalComponent } from 'app/components/modals/messages-stats-modal/messages-stats-modal.component';
// import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { SatPopover } from '@ncstate/sat-popover';
import { WebhookService } from 'app/services/webhook.service';
import { CreateFlowsModalComponent } from './create-flows-modal/create-flows-modal.component';
import { CreateChatbotModalComponent } from './create-chatbot-modal/create-chatbot-modal.component';
import { aiAgents, automations } from 'app/integrations/utils';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
// import { KnowledgeBaseService } from 'app/services/knowledge-base.service';


const swal = require('sweetalert');
const Swal = require('sweetalert2')
@Component({
  selector: 'bots-list',
  templateUrl: './bots-list.component.html',
  styleUrls: ['./bots-list.component.scss'],
})

export class BotListComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  // @ViewChild('botAvailableForAgents') botAvailableForAgents!: SatPopover;
  closeTimeout: any;
  popoverCloseTimeout: any;
  PLAN_NAME = PLAN_NAME;
  CHATBOT_MAX_NUM = CHATBOT_MAX_NUM;
  private unsubscribe$: Subject<any> = new Subject<any>();
  tparams: any;

  faqkbList: FaqKb[];
  pagedFaqkbList: any[] = [];
  myChatbotAllCount: number;
  navigationBaseUrl: string;
  // set to none the property display of the modal
  display = 'none';  // NO MORE USED (IS THE OLD MODAL USED TO DELETE THE BOT)
  displayDeleteBotModal = 'none'; // THE NEW MODAL USED TO DELETE THE BOT
  displayDeleteInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;

  id_toDelete: string;
  botIdToRename: string = '';
  botToRename: any;
  newBotName: string;
  faqKbId: string;
  faq_faqKbId: string;

  HAS_FAQ_RELATED = false;

  project: Project;
  showSpinner: boolean = false;

  NUMBER_OF_CICLE: number;

  DELETE_BOT_ERROR = false;
  bot_id_typed: string;
  ID_BOT_TYPED_MATCHES_THE_BOT_ID: boolean;
  bot_name_to_delete: string;

  trashBotSuccessNoticationMsg: string;
  trashBotErrorNoticationMsg: string;
  is_external_bot: boolean;
  text_is_truncated = true;
  rowIndexSelected: number;

  storageBucket: string;
  baseUrl: string;
  _botType: string;

  deptsNameAssociatedToBot: any

  botIsAssociatedWithDepartments: string;
  botIsAssociatedWithTheDepartment: string;
  disassociateTheBot: string;
  warning: string;

  public_Key: string;
  isVisibleAnalytics: boolean;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean = true;
  isChromeVerGreaterThan100: boolean;


  flowWebhooksCount: number;

  myChatbot: any
  myChatbotOtherCount: number;

  automations: any
  automationsCount: number;

  route: string
  dev_mode: boolean;
  isPanelRoute: boolean = false;
  botLogo: string;

  user: any;

  public selectedProjectId: string;
  public projectname: string;
  public project_name: string;

  public currentProjectId: string;
  public botProfileImageExist: boolean;
  public botProfileImageurl: string;

  public projectPlanAgentsNo: any;
  public prjct_profile_type: any;
  public subscription_is_active: any;
  public subscription_end_date: any;
  public profile_name: any;
  public trial_expired: any;
  public prjct_profile_name: string;
  // public chatBotLimit: any;

  public chatBotCount: any;
  public USER_ROLE: string;
  public contactUs: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  salesEmail: string;
  WIDGET_BASE_URL: string;
  defaultDeptId: string;
  is0penDropDown: boolean = false
  is0penSelectFlowDropDown: boolean = false
  isOpen: boolean;

  orderBylastUpdated: boolean = true;
  orderByCreationDate: boolean = false;
  orderByChatbotName: boolean = false;
  pageName: string;
  isVisiblePAY: boolean;
  isVisibleCOP: boolean;
  chatbotNumExceedChatbotLimit: boolean = false;

  isAllFlowRoute: boolean
  isChatbotRoute: any
  currentRoute: string;

  botDefaultLangCode: string = 'en'
  chatbotName: string;
  chatbotToImportSubtype: string;
  showUploadingSpinner: boolean = false;

  diplayTwilioVoiceChabotCard: boolean;
  diplayVXMLVoiceChabotCard: boolean;
  displayDialogCreateFlowsOnInit: boolean = false;

  botSubType: string
  automationIsAssociatedWithTheDepartment: string
  automationIsAssociatedWithDepartments: string
  disassociateTheAutomation: string
  automationCopilotIsEnabled: boolean;
  automationCopilotIsAvailable: boolean;
  t_params: any

  pageSize = 20;
  currentPage = 1;
  totalPagesNo_roundToUp: number;

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_ADD_FLOWS: boolean;
  PERMISSION_TO_EDIT_FLOWS: boolean;
  PERMISSION_TO_TEST_FLOW: boolean;
  PERMISSION_TO_DUPLICATE_FLOW: boolean;
  PERMISSION_TO_DELETE_FLOW: boolean;
  PERMISSION_TO_SHARE_FLOW: boolean;
  PERMISSION_TO_EXPORT_FLOW: boolean;
  PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH: boolean;
  PERMISSION_TO_VIEW_ANALYTICS: boolean;
  
 

  // editBotName: boolean = false;
  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private faqService: FaqService,
    private auth: AuthService,
    private _location: Location,
    public notify: NotifyService,
    public appConfigService: AppConfigService,
    private translate: TranslateService,
    public brandService: BrandService,
    public departmentService: DepartmentService,
    private logger: LoggerService,
    private projectService: ProjectService,
    private botLocalDbService: BotLocalDbService,
    public dialog: MatDialog,
    public prjctPlanService: ProjectPlanService,
    public usersService: UsersService,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    private webhookService: WebhookService,
    private activatedroute: ActivatedRoute,
    private roleService: RoleService,
    private rolesService: RolesService,
    // private kbService: KnowledgeBaseService,
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.botLogo = brand['BASE_LOGO_NO_TEXT']
    this.dev_mode = isDevMode()
    this.logger.log('[BOTS-LIST] is dev mode ', this.dev_mode)
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];


    this.currentRoute = this.router.url;
    this.logger.log('[BOTS-LIST] - currentRoute ', this.currentRoute)

    if (this.currentRoute.indexOf('/bots/my-chatbots/all') !== -1 || this.currentRoute.indexOf('/bots') !== -1 ) {
      this.isChatbotRoute = 'all'

      this.logger.log('[BOTS-LIST] - currentRoute isChatbotRoute ', this.isChatbotRoute)
    } else if (this.currentRoute.indexOf('/flows/flow-aiagent') !== -1) {
      this.isChatbotRoute = true
    } else if (this.currentRoute.indexOf('/flows/flow-automations') !== -1) {
      this.isChatbotRoute = false
    }
  }

  // openPopover() {
  //   this.botAvailableForAgents.open();
  // }

  // scheduleClosePopover() {
  //   this.logger.log('scheduleClosePopover botAvailableForAgents ', this.botAvailableForAgents )
  //   this.closeTimeout = setTimeout(() => {
  //     this.botAvailableForAgents.close();
  //   }, 100); // Delay before closing (adjust as needed)
  // }

  // cancelClosePopover() {
  //   clearTimeout(this.closeTimeout); // Cancel close if mouse re-enters
  // }


  ngOnInit() {
    this.roleService.checkRoleForCurrentProject('flows')
    // this.getCommunityTemplates()
    // this.getTemplates()
    // this.getAllNamespaces()
    // this.getFaqKb();
    // this.getQueryParams()
    // this.getBrowserVersion();
    this.isChromeVerGreaterThan100 = this.checkChromeVersion();
  
    this.getProfileImageStorage();
    this.getCurrentProject();
    this.getOSCODE();
    this.getFaqKbByProjectId();
    this.getTranslations();
    this.getFlowWebhooks()
    this.getNavigationBaseUrl()
    this.getProjectPlan();
    this.getUserRole();
    this.getDefaultDeptId();
    this.getLoggedUser();
    this.listenToProjectUser()
  }

  // getQueryParams() {
  //   this.activatedroute.queryParams.subscribe(params => {
  //     this.logger.log('[BOTS-LIST] GET QUERY PARAMS params ', params )
  //     if (params && params.fl === '1') {
  //       this.displayDialogCreateFlowsOnInit = true
  //     }

  //   });
  // }

  ngOnDestroy() {
    this.faqkbList = [];
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
        console.log('BOT-LIST] - this.ROLE:', this.ROLE);
        console.log('BOT-LIST] - this.PERMISSIONS', this.PERMISSIONS);
        this.hasDefaultRole = ['owner', 'admin', 'agent'].includes(status.role);
        console.log('BOT-LIST] - hasDefaultRole', this.hasDefaultRole);

        // PERMISSION_TO_ADD_FLOWS
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_ADD_FLOWS = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_ADD_FLOWS:', this.PERMISSION_TO_ADD_FLOWS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_ADD_FLOWS = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_ADD_FLOWS:', this.PERMISSION_TO_ADD_FLOWS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_ADD_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_ADD);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_ADD_FLOWS:', this.PERMISSION_TO_ADD_FLOWS);
        }

        // PERMISSION_TO_EDIT_FLOWS
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_EDIT_FLOWS = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_EDIT_FLOWS:', this.PERMISSION_TO_EDIT_FLOWS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_EDIT_FLOWS = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_EDIT_FLOWS:', this.PERMISSION_TO_EDIT_FLOWS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_EDIT_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_EDIT);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_EDIT_FLOWS:', this.PERMISSION_TO_EDIT_FLOWS);
        }


        

        // PERMISSION_TO_TEST_FLOW
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_TEST_FLOW = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_TEST_FLOW:', this.PERMISSION_TO_TEST_FLOW);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_ADD_FLOWS = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_TEST_FLOW:', this.PERMISSION_TO_TEST_FLOW);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_TEST_FLOW = status.matchedPermissions.includes(PERMISSIONS.FLOW_TEST);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_TEST_FLOW:', this.PERMISSION_TO_TEST_FLOW);
        }


        // PERMISSION_TO_DUPLICATE_FLOW
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_DUPLICATE_FLOW = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_DUPLICATE_FLOW:', this.PERMISSION_TO_DUPLICATE_FLOW);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_DUPLICATE_FLOW = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_DUPLICATE_FLOW:', this.PERMISSION_TO_DUPLICATE_FLOW);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_DUPLICATE_FLOW = status.matchedPermissions.includes(PERMISSIONS.FLOW_DUPLICATE);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_DUPLICATE_FLOW:', this.PERMISSION_TO_DUPLICATE_FLOW);
        }

        // PERMISSION_TO_DELETE_FLOW
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_DELETE_FLOW = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_DELETE_FLOW:', this.PERMISSION_TO_DELETE_FLOW);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_DELETE_FLOW = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_DELETE_FLOW:', this.PERMISSION_TO_DELETE_FLOW);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_DELETE_FLOW = status.matchedPermissions.includes(PERMISSIONS.FLOW_DELETE);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_DELETE_FLOW:', this.PERMISSION_TO_DELETE_FLOW);
        }

           if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_DUPLICATE_FLOW = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_DUPLICATE_FLOW:', this.PERMISSION_TO_DUPLICATE_FLOW);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_DUPLICATE_FLOW = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_DUPLICATE_FLOW:', this.PERMISSION_TO_DUPLICATE_FLOW);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_DUPLICATE_FLOW = status.matchedPermissions.includes(PERMISSIONS.FLOW_DUPLICATE);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_DUPLICATE_FLOW:', this.PERMISSION_TO_DUPLICATE_FLOW);
        }

        // PERMISSION_TO_SHARE_FLOW
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_SHARE_FLOW = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_SHARE_FLOW:', this.PERMISSION_TO_SHARE_FLOW);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_SHARE_FLOW = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_SHARE_FLOW:', this.PERMISSION_TO_SHARE_FLOW);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_SHARE_FLOW = status.matchedPermissions.includes(PERMISSIONS.FLOW_SHARE);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_SHARE_FLOW:', this.PERMISSION_TO_SHARE_FLOW);
        }


        // PERMISSION_TO_EXPORT_FLOW
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_EXPORT_FLOW = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_EXPORT_FLOW:', this.PERMISSION_TO_EXPORT_FLOW);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_EXPORT_FLOW = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_EXPORT_FLOW:', this.PERMISSION_TO_EXPORT_FLOW);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_EXPORT_FLOW = status.matchedPermissions.includes(PERMISSIONS.FLOW_EXPORT);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_EXPORT_FLOW:', this.PERMISSION_TO_EXPORT_FLOW);
        }


        // PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH
        // if (status.role === 'owner' || status.role === 'admin') {
        //   // Owner and Admin always has permission
        //   this.PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH = true;
        //   console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH:', this.PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH);

        // } else if (status.role === 'agent') {
        //   // Agent never have permission
        //   this.PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH = false;
        //   console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH:', this.PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH);

        // } else {
        //   // Custom roles: permission depends on matchedPermissions
        //   this.PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH = status.matchedPermissions.includes(PERMISSIONS.FLOW_VIEW_MESSAGE_GRAPH);
        //   console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH:', this.PERMISSION_TO_VIEW_FLOW_MESSAGES_COUNT_GRAPH);
        // }

        // PERMISSION_TO_VIEW_ANALYTICS
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_VIEW_ANALYTICS = true;
          console.log('[BOT-LIST] - Project user is owner or admin (1)', 'PERMISSION_TO_VIEW_ANALYTICS:', this.PERMISSION_TO_VIEW_ANALYTICS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_VIEW_ANALYTICS = false;
          console.log('[BOT-LIST] - Project user is agent (2)', 'PERMISSION_TO_VIEW_ANALYTICS:', this.PERMISSION_TO_VIEW_ANALYTICS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_VIEW_ANALYTICS = status.matchedPermissions.includes(PERMISSIONS.ANALYTICS_READ);
          console.log('BOT-LIST] - Custom role (3)', status.role, 'PERMISSION_TO_VIEW_ANALYTICS:', this.PERMISSION_TO_VIEW_ANALYTICS);
        }

      });

  }

  checkChromeVersion(): boolean {
    const ua = navigator.userAgent;
    const match = ua.match(/Chrome\/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10) > 100;
    }
    return false;
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[BOT-LIST] - USER GET IN HOME ', user)

        this.user = user;
      })
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[BOTS-LIST] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getNavigationBaseUrl() {
    const href = window.location.href;
    //  this.logger.log('[BOTS-LIST] href ', href)
    const hrefArray = href.split('/#/');

    this.navigationBaseUrl = hrefArray[0];
    if (this.navigationBaseUrl === "https://panel.tiledesk.com/v3/dashboard") {
      this.isPanelRoute = true
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //   this.logger.log("[BOTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }


  getFlowWebhooks() {
   
    this.webhookService.getFlowWebhooks().subscribe((res: any) => {
      this.logger.log('[BOTS-LIST] GET WH RES  ', res);
      if (res) {
        this.flowWebhooksCount = res.length
      }

    }, (error) => {
      this.logger.error('[BOTS-LIST] GET WH ERROR ', error);
    
    }, () => {
      this.logger.log('[BOTS-LIST] GET WH COMPLETE');
     
    });
  }


  renameChatbot(bot) {
    this.botIdToRename = bot._id;
    this.logger.log('[BOTS-LIST] botIdToRename', this.botIdToRename)
    this.botToRename = bot
    this.logger.log('[BOTS-LIST] botToRename', this.botToRename)
    // this.editBotName = true;
  }

  onPressEnterUpdateChatBotName(event) {
    this.logger.log('[BOTS-LIST] onPressEnterUpdateChatBotName event ', event)
    if (event.code === 'Enter' || event.which === 13) {
      this.updateChatbot()
    }
  }

  changeChatBotName(event) {
    this.logger.log('[BOTS-LIST] changeChatBotName event ', event)
    this.newBotName = event
  }



  shareWithLink(botid, botname) {
    if(!this.PERMISSION_TO_SHARE_FLOW) {
      this.notify.presentDialogNoPermissionToPermomfAction() 
      return;  
    }
    this.logger.log('[BOTS-LIST] - UPDATED CHATBOT - shareWithLink botid', botid);
    this.logger.log('[BOTS-LIST] - UPDATED CHATBOT - shareWithLink botname', botname);
    // https://widget.tiledesk.com/v6/assets/twp/chatbot-panel.html?tiledesk_projectid=64959b8a6998ee001399056e&tiledesk_participants=bot_65bc881f4bc2250013ca8832&tiledesk_departmentID=64959b8a6998ee0013990572&tiledesk_hideHeaderCloseButton=true&tiledesk_widgetTitle=Showcase%20Deals&tiledesk_preChatForm=false&td_draft=true
    // https://widget-pre.tiledesk.com/v5/assets/twp/chatbot-panel.html?tiledesk_projectid=65cb48c7b6343a002fce77de&tiledesk_participants=bot_65cb48d5b6343a002fce7845&tiledesk_departmentID=65cb48c7b6343a002fce77e2&tiledesk_hideHeaderCloseButton=true&tiledesk_widgetTitle=Nikola&tiledesk_preChatForm=false&td_draft=true
    // WIDGET_BASE_URL = 'https://widget.tiledesk.com/v6/' (prod)
    // WIDGET_BASE_URL = ''https://widget-pre.tiledesk.com/v5/' (pre)
    this.WIDGET_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL;
    const botLink = this.WIDGET_BASE_URL + "assets/twp/chatbot-panel.html?tiledesk_projectid=" + this.currentProjectId + "&tiledesk_participants=bot_" + botid + "&tiledesk_departmentID=" + this.defaultDeptId + "&tiledesk_hideHeaderCloseButton=true&tiledesk_widgetTitle=" + encodeURIComponent(botname) + "&tiledesk_preChatForm=false&td_draft=true"
    this.clipboard.copy(botLink)
    this._snackBar.open(" Copied to clipboard", null, {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'success-snackbar'
    });
  }

  openTestSiteInPopupWindow(botid) {
    if (!this.PERMISSION_TO_TEST_FLOW) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    // https://widget.tiledesk.com/v6/assets/twp/chatbot-panel.html?tiledesk_projectid=63d7911ca7b3d3001a4a9404&tiledesk_participants=bot_65605e3dfb23780013b92711&tiledesk_departmentID=63d7911ca7b3d3001a4a9408
    // this.logger.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    this.WIDGET_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL;

    const testItOutUrl = this.WIDGET_BASE_URL + "assets/twp/chatbot-panel.html?tiledesk_projectid=" + this.currentProjectId + '&tiledesk_participants=bot_' + botid + "&tiledesk_departmentID=" + this.defaultDeptId
    // this.logger.log('openTestSiteInPopupWindow testItOutUrl ', testItOutUrl)
    let left = (screen.width - 830) / 2;
    let top = (screen.height - 727) / 4;

    let params = `toolbar=no,menubar=no,width=830,height=727,left=${left},top=${top}`;
    window.open(testItOutUrl, '_blank', params);
  }

  // -------------------------------------------------------------------------------------- 
  // Export chatbot to JSON
  // -------------------------------------------------------------------------------------- 
  exportChatbotToJSON(faqkb) {
    if(!this.PERMISSION_TO_EXPORT_FLOW) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    // const exportFaqToJsonBtnEl = <HTMLElement>document.querySelector('.export-chatbot-to-json-btn');
    // exportFaqToJsonBtnEl.blur();
    this.faqService.exportChatbotToJSON(faqkb._id).subscribe((faq: any) => {
      // this.logger.log('[TILEBOT] - EXPORT CHATBOT TO JSON - FAQS', faq)
      // this.logger.log('[TILEBOT] - EXPORT FAQ TO JSON - FAQS INTENTS', faq.intents)
      if (faq) {
        this.downloadObjectAsJson(faq, faq.name);
      }
    }, (error) => {
      this.logger.error('[BOTS-LIST] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[BOTS-LIST] - EXPORT BOT TO JSON - COMPLETE');
    });
  }

  downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }


  updateChatbot() {
    this.botToRename.name = this.newBotName
    this.faqKbService.updateChatbot(this.botToRename)
      .subscribe((chatbot: any) => {
        this.logger.log('[BOTS-LIST] - UPDATED CHATBOT - RES ', chatbot);

      }, (error) => {
        this.logger.error('[BOTS-LIST] - UPDATED CHATBOT - ERROR  ', error);
      }, () => {
        this.logger.log('[BOTS-LIST] - UPDATED CHATBOT * COMPLETE *');
        this.botIdToRename = '';
        this.botToRename = null;
      });
  }

  duplicateChatbot(bot_id, bot_name) {
    if (!this.PERMISSION_TO_DUPLICATE_FLOW) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    this.logger.log('[BOTS-LIST] duplicateChatbot chatBotCount ', this.chatBotCount, ' chatBotLimit ', this.chatBotLimit, ' USER_ROLE ', this.USER_ROLE, ' profile_name ', this.profile_name)
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[BOTS-LIST] USECASE  chatBotCount < chatBotLimit: RUN GET PRJCTS')
          this.getProjects(bot_id, bot_name)
        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[BOTS-LIST] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (!this.chatBotLimit) {
        this.logger.log('[BOTS-LIST] USECASE  NO chatBotLimit: RUN PRJCTS')
        this.getProjects(bot_id, bot_name)
      }
    } else if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }
  }

  getProjects(bot_id, bot_name) {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[BOTS-LIST] - duplicateChatbot - GET PROJECTS ', projects);
      if (projects) {

        if (projects && projects.length === 1) {
          this.projectname = projects[0].id_project.name
          this.selectedProjectId = projects[0].id_project._id
          this.forkTemplate(bot_id, this.selectedProjectId)
        } else if (projects && projects.length > 1) {

          this.openDialogCloneBot(projects, bot_id, bot_name)
        }

      }
    }, error => {

      this.logger.error('[BOTS-LIST] - duplicateChatbot - GET PROJECTS - ERROR ', error)
    }, () => {
      this.logger.log('[BOTS-LIST] - duplicateChatbot - GET PROJECTS * COMPLETE *')
    });
  }

  openDialogCloneBot(projects, bot_id, bot_name) {
    const dialogRef = this.dialog.open(CloneBotComponent, {
      data: {
        botName: bot_name,
        projects: projects,
        currentProjectId: this.currentProjectId,

      },
    });

    dialogRef.afterClosed().subscribe(selectedProjectId => {
      this.logger.log(`Dialog afterClosed result (selectedProjectId): ${selectedProjectId}`);
      if (selectedProjectId) {
        this.forkTemplate(bot_id, selectedProjectId)
      }
    });
  }



  forkTemplate(bot_id, selectedProjectId) {
    this.faqKbService.installTemplate(bot_id, this.currentProjectId, false, selectedProjectId).subscribe((res: any) => {
      this.logger.log('[BOTS-LIST] - FORK TEMPLATE RES', res);
      // this.botid = res.bot_id
      this.getFaqKbById(res.bot_id, selectedProjectId);
    }, (error) => {
      this.logger.error('[BOTS-LIST] FORK TEMPLATE - ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-LIST] FORK TEMPLATE COMPLETE');
    });
  }

  getFaqKbById(botid, selectedProjectId) {
    this.faqKbService.getFaqKbById(botid).subscribe((faqkb: any) => {
      this.logger.log('[BOTS-LIST] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);
      if (selectedProjectId === this.currentProjectId) {
        this.getFaqKbByProjectId();
      }
      this.botLocalDbService.saveBotsInStorage(botid, faqkb);

    }, (error) => {
      this.logger.error('[BOTS-LIST] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
    }, () => {
      this.logger.log('[BOTS-LIST] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
    });
  }


  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[BOTS-LIST] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;

      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;


      this.logger.log('[BOTS-LIST] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      if (this.project) {
        this.currentProjectId = this.project._id
        // this.logger.log('[BOTS-LIST] 00 -> FAQKB COMP project ID from AUTH service subscription  ', this.project._id)
        this.getProjectById(this.currentProjectId)
      }
    });
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {

      this.logger.log('[BOTS-LIST] - GET PROJECT BY ID - project ', project);
      this.project_name = project.name;
      const projectProfileData = project.profile
      this.logger.log('[BOTS-LIST] - GET PROJECT BY ID - projectProfileData ', projectProfileData);
      this.profile_name = project.profile.name;
      const isActiveSubscription = project.isActiveSubscription
      const trialExpired = project.trialExpired
      const projectProfileType = project.profile.type
      this.manageVoiceChatbotVisibility(projectProfileData)
      this.getIfAutomationCopilotIsEnabled(projectProfileData)
      this.managePlanAutomationCopilotAvailability(this.profile_name, isActiveSubscription, trialExpired, projectProfileType)

    }, error => {
      this.logger.error('[BOTS-LIST] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[BOTS-LIST] - GET PROJECT BY ID * COMPLETE *  this.project ', this.project);
    });
  }

  managePlanAutomationCopilotAvailability(profileName, isActiveSubscription, trialExpired, projectProfileType) {
    this.logger.log('[BOTS-LIST] - managePlanRefreshRateAvailability - profile_name: ', profileName);
    this.logger.log('[BOTS-LIST] - managePlanRefreshRateAvailability - isActiveSubscription: ', isActiveSubscription);
    this.logger.log('[BOTS-LIST] - managePlanRefreshRateAvailability - isActiveSubscription: ', trialExpired);
    this.logger.log('[BOTS-LIST] - managePlanRefreshRateAvailability - isActiveSubscription: ', projectProfileType);
    this.t_params = { 'plan_name': PLAN_NAME.EE }
    if (projectProfileType === 'free') {
      if (trialExpired === false) {
        // Trial active
        if (profileName === 'free') {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)


        } else if (profileName === 'Sandbox') {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      } else {
        // Trial expired
        if (profileName === 'free') {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        } else if (this.profile_name === 'Sandbox') {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  isAvailableRefreshRateFeature', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      }
    } else if (projectProfileType === 'payment') {

      if (isActiveSubscription === true) {
        // Growth sub active
        if (profileName === PLAN_NAME.A) {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Scale sub active
        } else if (profileName === PLAN_NAME.B) {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Plus sub active
        } else if (profileName === PLAN_NAME.C) {

          this.automationCopilotIsAvailable = true;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Basic sub active
        } else if (profileName === PLAN_NAME.D) {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Premium sub active
        } else if (profileName === PLAN_NAME.E) {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Team sub active
        } else if (profileName === PLAN_NAME.EE) {
          this.automationCopilotIsAvailable = true;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Custom sub active
        } else if (profileName === PLAN_NAME.F) {
          this.automationCopilotIsAvailable = true;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      } else if (isActiveSubscription === false) {
        // Growth sub expired
        if (profileName === PLAN_NAME.A) {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Scale sub expired
        } else if (profileName === PLAN_NAME.B) {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Plus sub expired
        } else if (profileName === PLAN_NAME.C) {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Basic sub expired
        } else if (profileName === PLAN_NAME.D) {
          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Premium sub expired
        } else if (profileName === PLAN_NAME.E) {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Team sub expired
        } else if (profileName === PLAN_NAME.EE) {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Custom sub expired
        } else if (profileName === PLAN_NAME.F) {

          this.automationCopilotIsAvailable = false;
          this.logger.log('[BOTS-LIST]  automationCopilotIsAvailable', this.automationCopilotIsAvailable, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      }
    }
  }

  

  getIfAutomationCopilotIsEnabled(projectProfile) {
    this.logger.log('[BOT-CREATE] - getIfAutomationCopilotIsEnabled - projectProfile: ', projectProfile);
    if (projectProfile && projectProfile['customization']) {

      if (projectProfile && projectProfile['customization']['webhook'] && projectProfile['customization']['webhook'] !== undefined) {

        if (projectProfile && projectProfile['customization']['webhook'] && projectProfile['customization']['webhook'] === true) {

          this.automationCopilotIsEnabled = true
          this.logger.log('[BOT-CREATE] - getIfBotSubtypeAreEnabled - automationCopilotIsEnabled 1: ', this.automationCopilotIsEnabled);

        } else if (projectProfile && projectProfile['customization']['webhook'] && projectProfile['customization']['webhook'] === false) {

          this.automationCopilotIsEnabled = false;
          this.logger.log('[BOT-CREATE] - getIfBotSubtypeAreEnabled - automationCopilotIsEnabled 2: ', this.automationCopilotIsEnabled);
        }

      } else {
        this.automationCopilotIsEnabled = false
        this.logger.log('[BOT-CREATE] - getIfBotSubtypeAreEnabled - automationCopilotIsEnabled 3: ', this.automationCopilotIsEnabled);
      }

    } else {
      this.automationCopilotIsEnabled = false
      this.logger.log('[BOTS-LIST] - getIfBotSubtypeAreEnabled - automationCopilotIsEnabled 4: ', this.automationCopilotIsEnabled);
    }
  }

  manageVoiceChatbotVisibility(projectProfileData: any): void {
    const customization = projectProfileData?.customization;

    if (!customization) {
      this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) No customization found.');
      this.diplayTwilioVoiceChabotCard = false;
      this.diplayVXMLVoiceChabotCard = false;
      this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) diplayTwilioVoiceChabotCard:', this.diplayTwilioVoiceChabotCard);
      this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) diplayVXMLVoiceChabotCard:', this.diplayVXMLVoiceChabotCard);
      return;
    }

    const voiceTwilio = customization['voice_twilio'] ?? false;
    const voice = customization['voice'] ?? false;

    this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) voice_twilio:', voiceTwilio);
    this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) voice:', voice);

    this.diplayTwilioVoiceChabotCard = voiceTwilio === true;
    this.diplayVXMLVoiceChabotCard = voice === true;
    this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) diplayTwilioVoiceChabotCard:', this.diplayTwilioVoiceChabotCard);
    this.logger.log('[BOTS-LIST] (manageVoiceChatbotVisibility) diplayVXMLVoiceChabotCard:', this.diplayVXMLVoiceChabotCard);

    // if (this.displayDialogCreateFlowsOnInit)  {
    //   this.presentDialogCreateFlows(true)
    // }
  }


  openBotMsgsStats(bot) {
    if(!this.PERMISSION_TO_VIEW_ANALYTICS) {
      this.notify.presentDialogNoPermissionToViewReports()
      return;
    }

    this.logger.log('[BOTS-LIST] openBotStats  ')

    const statsDialogRef = this.dialog.open(MessagesStatsModalComponent, {
      width: '800px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: { agent: bot },
    });

    this.logger.log('[BOTS-LIST] openBotStats  statsDialogRef ', statsDialogRef)

    statsDialogRef.afterClosed().subscribe(agentId => {
      this.logger.log(`[BOTS-LIST] Dialog afterClosed agentId: ${agentId}`);
      if (agentId) {
        const statBtnEl = <HTMLElement>document.querySelector('#btn-' + `${agentId}`);
        this.logger.log('[BOTS-LIST] Dialog afterClosed statBtnEl', statBtnEl);
        statBtnEl.blur()
      }
    });
  }

  isOpenDropdown(_is0penDropDown) {
    this.is0penDropDown = _is0penDropDown
    this.logger.log('[BOTS-LIST] this.is0penDropDown ', this.is0penDropDown)
  }

  isOpenSelecFlowTypeDropdown(_is0penSelectFlowDropDown) {
    this.is0penSelectFlowDropDown = _is0penSelectFlowDropDown
  }

  orderBy(sortfor) {
    this.logger.log('[BOTS-LIST] - orderBy', sortfor);
    if (sortfor === 'lastUpdates') {
      this.orderBylastUpdated = true;
      this.orderByCreationDate = false;
      this.orderByChatbotName = false;
      this.getFaqKbByProjectId()
    } else if (sortfor === 'creationDate') {
      this.orderBylastUpdated = false;
      this.orderByCreationDate = true;
      this.orderByChatbotName = false;
      this.getFaqKbByProjectId()
    } else if (sortfor === 'botname') {
      this.orderBylastUpdated = false;
      this.orderByCreationDate = false;
      this.orderByChatbotName = true;
      this.getFaqKbByProjectId()
    }
  }

  // ----------------------------------------------------------------
  // GETS ONLY THE FAQ-KB WITH THE CURRENT PROJECT ID
  // NOTE: THE CURRENT PROJECT-ID IS OBTAINED IN THE FAQ-KB SERVICE
  // ----------------------------------------------------------------
 getFaqKbByProjectId() {
    this.showSpinner = true
    // this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
    this.faqKbService.getFaqKbByProjectId()
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((faqKb: any) => {
     this.logger.log('[BOTS-LIST] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {

        this.faqkbList = faqKb;
        this.currentPage = 1
        this.updatePagedFaqkbList();

        console.log('[BOTS-LIST] - GET BOTS BY PROJECT ID  - PAGED',   this.faqkbList);
        this.chatBotCount = this.faqkbList.length;

        if (this.orderBylastUpdated) {
          this.logger.log('[BOTS-LIST] - orderBylastUpdated Here yes');
          this.faqkbList.sort(function compare(a: Chatbot, b: Chatbot) {
            if (a['updatedAt'] > b['updatedAt']) {
              return -1;
            }
            if (a['updatedAt'] < b['updatedAt']) {
              return 1;
            }
            return 0;
          });
        }


        if (this.orderByCreationDate) {
          this.logger.log('[BOTS-LIST] - orderByCreationDate Here yes');
          this.faqkbList.sort(function compare(a: Chatbot, b: Chatbot) {
            if (a['createdAt'] > b['createdAt']) {
              return -1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return 1;
            }
            return 0;
          });
        }

        if (this.orderByChatbotName) {
          this.logger.log('[BOTS-LIST] - orderByChatbotName Here yes');
          this.faqkbList.sort(function compare(a: Chatbot, b: Chatbot) {
            if (a['name'].toLowerCase() < b['name'].toLowerCase()) {
              return -1;
            }
            if (a['name'].toLowerCase() > b['name'].toLowerCase()) {
              return 1;
            }
            return 0;
          });
        }

        if (this.orderByChatbotName) {
          this.logger.log('[BOTS-LIST] - orderByChatbotName Here yes');
          this.faqkbList.sort(function compare(a: Chatbot, b: Chatbot) {
            if (a['name'].toLowerCase() < b['name'].toLowerCase()) {
              return -1;
            }
            if (a['name'].toLowerCase() > b['name'].toLowerCase()) {
              return 1;
            }
            return 0;
          });
        }

        this.faqkbList.forEach(bot => {
          this.logger.log('[BOTS-LIST] getFaqKbByProjectId bot ', bot)
          if (bot && bot.url) {
            this.logger.log('[BOTS-LIST] getFaqKbByProjectId bot url', bot.url)

            let parts = bot.url.split("/");
            let botId_FromDeployUrl = parts[parts.length - 1];
            this.logger.log('[BOTS-LIST] getFaqKbByProjectId botIdFromDeployUrl ', botId_FromDeployUrl)
            let botId = bot._id;
            this.logger.log('[BOTS-LIST] getFaqKbByProjectId botId ', botId)
            if (botId_FromDeployUrl === botId) {
              this.logger.log('The bot has not been published')
              bot['published'] = false

            } else if (botId_FromDeployUrl !== botId) {
              this.logger.log('The bot has been published')
              bot['published'] = true
            }
          } else {
            this.logger.log('[BOTS-LIST] bot not has url ', bot)
          }

          this.getBotProfileImage(bot)

          this.logger.log('[BOTS-LIST] - orderBylastUpdated', this.orderBylastUpdated);
          this.logger.log('[BOTS-LIST] - orderByCreationDate', this.orderByCreationDate);
        });

        // this.faqkbList = this.faqkbList

        // ---------------------------------------------------------------------
        // Chatbot
        // ---------------------------------------------------------------------
        this.myChatbot = this.faqkbList.filter((obj) => {
          return !obj.subtype || obj.subtype === "chatbot" || obj.subtype === "voice" || obj.subtype === "voice_twilio";
        });
        this.logger.log('[BOTS-LIST] - myChatbot', this.myChatbot);
        if (this.myChatbot) {
          this.myChatbotOtherCount = this.myChatbot.length;
          this.logger.log('[BOTS-LIST] - myChatbot COUNT', this.myChatbotOtherCount);
        }

        // ---------------------------------------------------------------------
        // Automations (e.g. are the chatbot with subtipe copilot or webhook)
        // ---------------------------------------------------------------------
        this.automations = this.faqkbList.filter((obj) => {
          return obj.subtype && ["webhook", "copilot"].includes(obj.subtype);
        });
        this.logger.log('[BOTS-LIST] - automations', this.automations);
        if (this.automations) {
          this.automationsCount = this.automations.length;
          this.logger.log('[BOTS-LIST] - automations COUNT', this.automationsCount);
        }


        this.route = this.router.url
        if (this.route.indexOf('/bots/my-chatbots/all') !== -1 || this.route.indexOf('/bots') !== -1) {
          this.faqkbList = this.faqkbList
          this.pageName = "All";
          this.currentPage = 1; // <--- reset
          this.updatePagedFaqkbList();
          this.logger.log('[BOTS-LIST] ROUTE my-chatbots/all');
        } else if (this.route.indexOf('/flows/flow-aiagent') !== -1) {
          this.faqkbList = this.myChatbot
          this.pageName = "AIAgents"
          this.currentPage = 1; // <--- reset
          this.updatePagedFaqkbList();
          this.logger.log('/flows/flow-aiagent ', this.faqkbList);
        } else if (this.route.indexOf('/flows/flow-automations') !== -1) {
          this.faqkbList = this.automations
          this.pageName = "Automations";
          this.currentPage = 1; // <--- reset
          this.updatePagedFaqkbList();
          this.logger.log('/flows/automations ', this.faqkbList);
        } 
        
        if (this.faqkbList) {
          if (this.faqkbList.length === 0) {
            this.showSpinner = false;
          }

          // ------------------------------------------------------------------------------------
          // FOR PRE
          // ------------------------------------------------------------------------------------
          let i: number;
          for (i = 0; i < this.faqkbList.length; i++) {
            if (this.faqkbList[i].type === 'external') {
              this.faqkbList[i].external = true;
            } else if (this.faqkbList[i].type === 'internal') {
              this.faqkbList[i].external = false;
            }
            if (this.faqkbList[i].description) {
              let stripHere = 40;
              this.faqkbList[i]['truncated_desc'] = this.faqkbList[i].description.substring(0, stripHere) + '...';
            }
            if (this.faqkbList[i].createdBy === 'system' && this.faqkbList[i].type === 'identity') {
              this.faqkbList[i]['is_system_identity_bot'] = true;
            }
          }


          const messageRequests = this.faqkbList.map(bot =>
            this.faqKbService.getNumberOfMessages(bot._id, bot.type)
          );

          forkJoin(messageRequests)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((results: any[]) => {
            results.forEach((res, i) => {
              if (res.length === 0) {
                this.faqkbList[i].message_count = 0;
              } else {
                this.faqkbList[i].message_count = res[0].totalCount;
              }
            });
          });
        }
      }

     
    }, (error) => {
      this.logger.error('[BOTS-LIST] GET BOTS ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-LIST] GET BOTS COMPLETE');
      // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
      this.showSpinner = false;
      // this.getAllFaqByFaqKbId();
    });
  }

    updatePagedFaqkbList() {
    if (!this.faqkbList || this.faqkbList?.length === 0) {
      this.totalPagesNo_roundToUp = 1;
      this.pagedFaqkbList = [];
      return;
    }

    const totalPagesNo = this.faqkbList?.length / this.pageSize;
    this.logger.log('[BOTS-LIST] - TOTAL PAGES NUMBER', totalPagesNo);

    this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
    this.logger.log('[BOTS-LIST]] - TOTAL PAGES NUMBER ROUND TO UP ', this.totalPagesNo_roundToUp);

    const start = (this.currentPage - 1) * this.pageSize;
    console.log('[BOTS-LIST] pagedFaqkbList start ', start )
    this.logger.log('[BOTS-LIST] pagedFaqkbList end ', start + this.pageSize )
    this.logger.log('[BOTS-LIST] pagedFaqkbList this.faqkbList ', this.faqkbList.slice(start, start + this.pageSize) )
    // return this.faqkbList.slice(start, start + this.pageSize);
    this.pagedFaqkbList = this.faqkbList.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage * this.pageSize < this.faqkbList.length) {
      this.currentPage++;
      this.updatePagedFaqkbList();
    }
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedFaqkbList();
    }
  }

  

  trackByFaqkbId(_index: number, faqkb: FaqKb) { 
    return faqkb._id; 
  }

  getBotProfileImage(bot) {
    const baseUrl = this.appConfigService.getConfig().baseImageUrl;
    const imageUrl = baseUrl + 'images?path=uploads%2Fusers%2F' + bot._id + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    this.botProfileImageExist = false;
    this.botProfileImageurl = "assets/img/avatar_bot_tiledesk.svg"
    bot.botImage = this.botProfileImageurl
    // bot.botImage = imageUrl + '&' + new Date().getTime();
    const self = this;
    this.logger.log('[BOTS-LIST] HERE YES 1')
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists
        // this.logger.log('[BOTS-LIST] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
        bot.botImage = imageUrl + '&' + new Date().getTime();
        // this.botProfileImageurl = this.sanitizer.bypassSecurityTrustUrl(_botProfileImageurl)
        // self.setImageProfileUrl_Native(baseUrl)

      } else {
        self.botProfileImageExist = imageExists

        // this.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

      }
    })
  }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('AppConfigService getAppConfig (BOT LIST) public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (BOT LIST) keys', keys)
    keys.forEach(key => {

      if (key.includes("ANA")) {
        // this.logger.log('PUBLIC-KEY (BOT LIST) - key', key);
        let ana = key.split(":");
        // this.logger.log('PUBLIC-KEY (BOT LIST) - ana key&value', ana);
        if (ana[1] === "F") {
          this.isVisibleAnalytics = false;
        } else {
          this.isVisibleAnalytics = true;
        }
      }

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }

      if (key.includes("COP")) {
        let cop = key.split(":");
        this.logger.log('PUBLIC-KEY [BOTS-LIST] - cop key&value', cop);
        if (cop[1] === "F") {
          this.isVisibleCOP = false;
          this.logger.log("[BOTS-LIST] isVisibleCOP: ", this.isVisibleCOP)
        } else {
          this.isVisibleCOP = true;
          this.logger.log("[BOTS-LIST] isVisibleCOP: ", this.isVisibleCOP)
        }
      }


    })

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

    if (!this.public_Key.includes("ANA")) {
      this.isVisibleAnalytics = false;
    }

    if (!this.public_Key.includes("COP")) {
      this.isVisibleCOP = false;
      this.logger.log("[BOTS-LIST] isVisibleCOP: ", this.isVisibleCOP)
    }

  }

  goToBotExternalUrl(botExternalUrl) {
    this.logger.log('[BOTS-LIST] botExternalUrl ', botExternalUrl);
    window.open(botExternalUrl, '_blank');
  }

  disableTruncateText(i: number) {
    this.text_is_truncated = false;
    // this.logger.log('toggleShowUrl ', this.truncate_text);
    this.rowIndexSelected = i;
    this.logger.log('[BOTS-LIST] toggleShowUrl index ', i);
  }

  enableTruncateText() {
    this.text_is_truncated = true;
    this.rowIndexSelected = undefined;
  }




  /**
   * MODAL DELETE AI agent / Automation
   * @param id
   */
  openDeleteModal(id: string, bot_name: string, HAS_FAQ_RELATED: boolean, botType: string, botSubType: string) {
    if(!this.PERMISSION_TO_DELETE_FLOW) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }

    this.logger.log('[BOTS-LIST] »» ON MODAL DELETE OPEN - botSubType', botSubType);
    const deptsArray = this.getDepartments(id)

    this.logger.log('[BOTS-LIST] »» ON MODAL DELETE OPEN - deptsArray', deptsArray);
    // FIX THE BUG: WHEN THE MODAL IS OPENED, IF ANOTHER BOT HAS BEEN DELETED PREVIOUSLY, IS DISPLAYED THE ID OF THE BOT DELETED PREVIOUSLY
    this.bot_id_typed = '';
    // FIX THE BUG: WHEN THE MODAL IS OPENED, IF ANOTHER BOT HAS BEEN DELETED PREVIOUSLY, THE BUTTON 'DELETE BOT' IS ACTIVE
    this.ID_BOT_TYPED_MATCHES_THE_BOT_ID = false;

    this.logger.log('[BOTS-LIST] »» ON MODAL DELETE OPEN - BOT ID TYPED BY USER', this.bot_id_typed);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> FAQ-KB ID ', id);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> FAQ-KB NAME ', bot_name);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> HAS_FAQ_RELATED ', HAS_FAQ_RELATED);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> botType ', botType);
    this._botType = botType
    this.HAS_FAQ_RELATED = HAS_FAQ_RELATED;

    // this.display = 'block'; // NO MORE USED (IS THE OLD MODAL USED TO DELETE THE BOT
    this.botSubType = botSubType
    this.id_toDelete = id;
    this.bot_name_to_delete = bot_name;
  }

  getDefaultDeptId() {
    this.departmentService.getDeptsByProjectId().subscribe((depts: any) => {
      this.logger.log('[BOTS-LIST] - GET DEPTS RES', depts);


      depts.forEach(dept => {
        if (dept.default === true) {
          this.defaultDeptId = dept._id
        }
      });

    }, error => {
      this.logger.error('[BOTS-LIST] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[BOTS-LIST] - GET DEPTS * COMPLETE *')
    });

  }

  getDepartments(selectedBotId?: string) {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - GET DEPTS RES', _departments);
      // this.departments = _departments

      const foundDeptsArray = _departments.filter((obj: any) => {
        return obj.id_bot === selectedBotId;
      });

      if (foundDeptsArray.length === 0) {
        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - BOT NOT ASSOCIATED');
        this.displayDeleteBotModal = 'block'; // THE NEW MODAL USED TO DELETE THE BOT
      } else {
        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - BOT !!! ASSOCIATED');
        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - foundDeptsArray', foundDeptsArray);

        this.deptsNameAssociatedToBot = []

        foundDeptsArray.forEach(dept => {
          this.deptsNameAssociatedToBot.push(dept.name)
        });

        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - depts Names Associated To Bot', this.deptsNameAssociatedToBot);

        // this.botIsAssociatedWithDepartments = text['TheBotIsAssociatedWithDepartments'];
        // this.botIsAssociatedWithTheDepartment = text['TheBotIsAssociatedWithTheDepartment'];
        this.logger.log('[BOTS-LIST] -  GET DEPTS botSubType', this.botSubType)
        const subtype = this.botSubType || '';
        let warningText = '';
        let warningTextPartTwo = '';
        if (foundDeptsArray.length > 1) {
          if (automations.includes(subtype)) {
            this.logger.log('[BOTS-LIST] use case dept array > 1 - Automation: webhook or copilot')
            warningText = this.automationIsAssociatedWithDepartments;
          } else if (!subtype || aiAgents.includes(subtype)) {
            this.logger.log('[BOTS-LIST] use case dept array > 1 - AI Agent (chatbot, voice, voice_twilio) or undefined')
            warningText = this.botIsAssociatedWithDepartments;
            warningTextPartTwo = this.disassociateTheBot;
          }
        } else if (foundDeptsArray.length === 1) {
          if (automations.includes(subtype)) {

            warningText = this.automationIsAssociatedWithTheDepartment;
            warningTextPartTwo = this.disassociateTheAutomation;
            this.logger.log('[BOTS-LIST] use case dept array = 1 - Automation: webhook or copilot warningText ', warningText)
          } else if (!subtype || aiAgents.includes(subtype)) {
            this.logger.log('[BOTS-LIST] use case dept array = 1 -  AI Agent (chatbot, voice, voice_twilio) or undefined')

            warningText = this.botIsAssociatedWithTheDepartment;
            warningTextPartTwo = this.disassociateTheBot
          }
        }

        Swal.fire({
          title: this.warning,
          text: warningText + ' ' + this.deptsNameAssociatedToBot + '. ' + warningTextPartTwo,
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: this.translate.instant('Ok'),
          // confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
          // reverseButtons: true
          // button: true,
          // dangerMode: false,
        })


        // if (foundDeptsArray.length > 1) {
        //   Swal.fire({
        //     title: this.warning,
        //     text: this.botIsAssociatedWithDepartments + ' ' + this.deptsNameAssociatedToBot + '. ' + this.disassociateTheBot,
        //     icon: "warning",
        //     showCancelButton: false,
        //     confirmButtonText: this.translate.instant('Ok'),
        //     focusConfirm: false,
        //   })
        // }

      }

    }, error => {
      this.logger.error('[BOTS-LIST] ON MODAL DELETE OPEN - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - GET DEPTS * COMPLETE *')
    });


  }

  /**
   * ********************* NEW DELETE BOT *********************
   * THE BOT (AND THE ANY RELATED FAQ) ARE NO MORE REALLY DELETED
   * BUT THE BOT IS ONLY EDITED WITH THE PROPERTY trashed = true
   */

  onCloseDeleteBotModal() {
    this.displayDeleteBotModal = 'none';
  }

  // ENABLED THE BUTTON 'DELETE BOT' IF THE BOT ID TYPED BY THE USER
  // MATCHES TO THE BOT ID
  checkIdBotTyped() {
    this.logger.log('[BOTS-LIST] BOT ID TYPED BY USER', this.bot_id_typed);
    if (this.id_toDelete === this.bot_id_typed) {
      this.ID_BOT_TYPED_MATCHES_THE_BOT_ID = true;
      this.logger.log('[BOTS-LIST] »» BOT ID TYPED MATCHES THE BOT ID ', this.ID_BOT_TYPED_MATCHES_THE_BOT_ID)
    } else {
      this.ID_BOT_TYPED_MATCHES_THE_BOT_ID = false;
      this.logger.log('[BOTS-LIST] »» BOT ID TYPED MATCHES THE BOT ID ', this.ID_BOT_TYPED_MATCHES_THE_BOT_ID)
    }
  }

  trashTheBot() {
    this.showSpinner = true;
    if (this._botType !== 'dialogflow' && this._botType !== 'rasa') {

      this.updateBotAsTrashed();
    } else if (this._botType === 'dialogflow') {
      this.deleteDlflwBotCredentialAndUpdateBotAsTrashed();
    } else if (this._botType === 'rasa') {
      this.deleteRasaBotDataAndUpdateBotAsTrashed();
    }
  }


  deleteRasaBotDataAndUpdateBotAsTrashed() {
    this.faqKbService.deleteRasaBotData(this.id_toDelete).subscribe((res: any) => {
      this.logger.log('[BOTS-LIST] deleteRasaBotData - RES ', res);

    }, (error) => {
      this.logger.error('[BOTS-LIST] deleteRasaBotData - ERROR ', error);

      // =========== NOTIFY ERROR ===========
      this.notify.showWidgetStyleUpdateNotification(this.trashBotErrorNoticationMsg, 4, 'report_problem');

    }, () => {
      this.logger.log('[BOTS-LIST] deleteRasaBotData * COMPLETE *');

      // ------------------------------------------------------------------
      // Update as trashed the bot on our db
      // ------------------------------------------------------------------
      this.updateBotAsTrashed()
    });
  }

  deleteDlflwBotCredentialAndUpdateBotAsTrashed() {
    // ------------------------------------------------------------------
    // Delete Dialogflow Bot Credetial
    // ------------------------------------------------------------------
    this.faqKbService.deleteDialogflowBotCredetial(this.id_toDelete).subscribe((res: any) => {
      this.logger.log('[BOTS-LIST] deleteDlflwBotCredentialAndUpdateBotAsTrashed - RES ', res);

    }, (error) => {
      this.logger.error('[BOTS-LIST] deleteDlflwBotCredentialAndUpdateBotAsTrashed - ERROR ', error);

      // =========== NOTIFY ERROR ===========
      this.notify.showWidgetStyleUpdateNotification(this.trashBotErrorNoticationMsg, 4, 'report_problem');

    }, () => {
      this.logger.log('[BOTS-LIST] deleteDlflwBotCredentialAndUpdateBotAsTrashed * COMPLETE *');

      // ------------------------------------------------------------------
      // Update as trashed the bot on our db
      // ------------------------------------------------------------------
      this.updateBotAsTrashed()
    });
  }


  updateBotAsTrashed() {
    this.faqKbService.updateFaqKbAsTrashed(this.id_toDelete, true).subscribe((updatedFaqKb: any) => {
      this.logger.log('[BOTS-LIST] TRASH THE BOT - UPDATED FAQ-KB ', updatedFaqKb);
    }, (error) => {
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while deleting the bot', 4, 'report_problem');
      this.notify.showWidgetStyleUpdateNotification(this.trashBotErrorNoticationMsg, 4, 'report_problem');

      this.logger.error('[BOTS-LIST] TRASH THE BOT - ERROR ', error);
      this.showSpinner = false;
      this.displayDeleteBotModal = 'none'
    }, () => {
      this.logger.log('[BOTS-LIST] TRASH THE BOT - COMPLETE');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('bot successfully deleted', 2, 'done');
      this.notify.showWidgetStyleUpdateNotification(this.trashBotSuccessNoticationMsg, 2, 'done');

      this.getFaqKbByProjectId();
      this.getFlowWebhooks()

      this.displayDeleteBotModal = 'none';
      setTimeout(() => {
        this.showSpinner = false;
      }, 100);
    });
  }


  onCloseInfoModalHandled() {
    this.displayDeleteInfoModal = 'none';
    this.ngOnInit()
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
    this.displayDeleteInfoModal = 'none';
  }

  // !!!! NO MORE USED IN THIS COMPONENT - when the user click 'ADD BOT' is redirected to bot-type-select
  /* GO TO THE COMPONENT FAQ-KB-EDIT-ADD */
  // goToEditAddPage_CREATE() {
  //   this.router.navigate(['project/' + this.project._id + '/createfaqkb']);
  // }

  // ---------------------------------------------------
  // Go to select bot type
  // ---------------------------------------------------
  // goToSelectBotType() {
  //   this.router.navigate(['project/' + this.project._id + '/bots/bot-select-type']);
  // }

  goToBotAllTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/all']);
    // this.router.navigate(['project/' + this.project._id + '/templates/all']);
  }

  // --------------------------------------------------------------------------
  // @ Create Chatbots / Automations
  // --------------------------------------------------------------------------
  createBlankTilebot(botSubtype?: string, namespaceid?: string) {
    this.logger.log('[BOTS-LIST] createBlankTilebot chatBotCount ', this.chatBotCount, '- chatBotLimit:', this.chatBotLimit, '- botSubtype:', botSubtype, '- chatbotName:', this.chatbotName, '- botDefaultLangCode:', this.botDefaultLangCode, '- namespaceid: ', namespaceid)
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit || this.chatBotLimit === 0) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[BOTS-LIST] USECASE  chatBotCount < chatBotLimit: RUN CREATE FROM SCRATCH')
          
          this.createTilebotBotFromScratch(botSubtype, namespaceid)
          this.logger.log('[BOTS-LIST] createBlankTilebot isChatbotRoute ', this.isChatbotRoute)
       
        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[BOTS-LIST] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (this.chatBotLimit === null) {
        this.logger.log('[BOTS-LIST] USECASE  NO chatBotLimit: RUN CREATE FROM SCRATCH')
        this.logger.log('[BOTS-LIST] createBlankTilebot isChatbotRoute ', this.isChatbotRoute)
        this.createTilebotBotFromScratch(botSubtype, namespaceid)
      
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }
  }

  createTilebotBotFromScratch(botSubtype, namespaceid) {
    this.faqKbService.createChatbotFromScratch(this.chatbotName, 'tilebot', botSubtype, this.botDefaultLangCode, namespaceid).subscribe((faqKb) => {
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
            this.logger.log('[BOT-LIST] USECASE  chatBotCount < chatBotLimit: RUN IMPORT CHATBOT FROM JSON chatbotToImportSubtype:', this.chatbotToImportSubtype, '- isChatbotRoute:', this.isChatbotRoute)
            // if (this.isChatbotRoute && (this.chatbotToImportSubtype === 'webhook' || this.chatbotToImportSubtype === 'copilot')) {
            //   this.logger.log(`[BOT-LIST] You are importing a ${this.chatbotToImportSubtype} flow and it will be added to the Automations list. Do you want to continue? `)
            //   this.presentDialogImportMismatch(formData, this.chatbotToImportSubtype, 'automations')
            // }
            // if (!this.isChatbotRoute && (this.chatbotToImportSubtype !== 'webhook' && this.chatbotToImportSubtype !== 'copilot')) {
            //   this.logger.log(`[BOT-LIST] You are importing a ${this.chatbotToImportSubtype} flow and it will be added to the Chatbots list. Do you want to continue? `)
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
          'page': 'Chatbot list',
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


  presentDialogCreateFlows(isChatbotRoute) {
    if (!this.PERMISSION_TO_ADD_FLOWS) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }

    this.logger.log(`[BOTS-LIST] present Dialog Create Flows - isChatbotRoute :`, isChatbotRoute);
    const showTwilio = this.diplayTwilioVoiceChabotCard;
    const showVXML = this.diplayVXMLVoiceChabotCard;

    let dialogWidth = '800px';

    if (isChatbotRoute && !showTwilio && !showVXML) {
      dialogWidth = '550px';
    }

    if (!isChatbotRoute && !this.isVisibleCOP) {
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
        if (subType !== 'copilot') {
        this.presentModalAddBotFromScratch(subType)
        } else if (subType === 'copilot' && (this.automationCopilotIsAvailable === false || this.automationCopilotIsEnabled === false)) { 
          this.logger.log(`[BOTS-LIST] Dialog Create Flows after Closed - subType :`, subType, ' automationCopilotIsAvailable ' , this.automationCopilotIsAvailable);
          
          this.presentModalAddBotFromScratch(subType, this.automationCopilotIsAvailable, this.automationCopilotIsEnabled, this.t_params, this.salesEmail, this.project_name, this.currentProjectId, this.isVisiblePAY)
          
        } else if (subType === 'copilot' && (this.automationCopilotIsAvailable === true && this.automationCopilotIsEnabled === true)) {
          this.presentModalAddBotFromScratch(subType)
        }
      } else if (subType && typeof subType === 'object') {
        this.fileChangeUploadChatbotFromJSON(subType)
      }
    });
  }

  presentModalAddCopilot(subtype) {
     this.logger.log('[BOTS-LIST] - presentModalAddBotFromScratch subtype ', subtype);
    
    if(this.automationCopilotIsAvailable === false || this.automationCopilotIsEnabled === false) {
      this.presentModalAddBotFromScratch(subtype, this.automationCopilotIsAvailable, this.automationCopilotIsEnabled, this.t_params, this.salesEmail, this.project_name, this.currentProjectId, this.isVisiblePAY)
    } else if (this.automationCopilotIsAvailable === true && this.automationCopilotIsEnabled === true) {
      this.presentModalAddBotFromScratch(subtype)
    }
  }


  presentModalAddBotFromScratch(subtype: string, automationCopilotIsAvailable?:boolean, automationCopilotIsEnabled?:boolean ,t_params?: any,salesEmail?:string, project_name?:string, currentProjectId?: string, isVisiblePAY?:boolean) {
    this.logger.log('[BOTS-LIST] - presentModalAddBotFromScratch subtype ', subtype, 'automationCopilotIsAvailable ' , automationCopilotIsAvailable, 'automationCopilotIsEnabled ', automationCopilotIsEnabled);
    // const createBotFromScratchBtnEl = <HTMLElement>document.querySelector('#home-material-btn');
    // this.logger.log('[HOME-CREATE-CHATBOT] - presentModalAddBotFromScratch addKbBtnEl ', addKbBtnEl);
    // createBotFromScratchBtnEl.blur()
    const dialogRef = this.dialog.open(CreateChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '400px',
      data: {
        'subtype': subtype,
        "automationCopilotIsAvailable": automationCopilotIsAvailable,
        "automationCopilotIsEnabled": automationCopilotIsEnabled,
         "t_params": t_params,
         "salesEmail": salesEmail,
         "project_name": project_name,
         "currentProjectId":currentProjectId,
         "isVisiblePAY":isVisiblePAY
      },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[BOTS-LIST] Dialog result:`, result);

      if (result && result !== 'upgrade-plan') {
        this.chatbotName = result.chatbotName;

        if (this.chatbotName && result.subType !== 'copilot') {
          this.createBlankTilebot(result.subType)
        } else if (this.chatbotName && result.subType === 'copilot' && result.namespace_id) {
          this.createBlankTilebot(result.subType, result.namespace_id)
        }
      } else if (result && result === 'upgrade-plan') {
        this.goToPricing()
      }
    });
  }

   goToPricing() {
    if (this.isVisiblePAY) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.profile_name === PLAN_NAME.C) {
            this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 1 ')
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);

          } else if (this.profile_name === PLAN_NAME.F) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 2 ')
          } else if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
            // this.notify._displayContactUsModal(true, 'upgrade_plan');
            this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
            this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 3 ')
          }
        } else if (this.prjct_profile_type === 'free') {
          this.router.navigate(['project/' + this.currentProjectId + '/pricing']);
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE

        ) {
          this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 4 ')
          // this.presentModalFeautureAvailableOnlyWithPlanC()
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
        this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 5 ')
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
      this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 6 ')
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  presentDialogReachedChatbotLimit() {
    this.logger.log('[BOTS-LIST] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
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
      this.logger.log(`[BOTS-LIST] Dialog result: ${result}`);
    });
  }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.agentsCannotManageChatbots, this.learnMoreAboutDefaultRoles)
  }

  contacUsViaEmail() {
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
  }

  // goToEditAddPage_EDIT(faq_id: string) {
  //   this.logger.log('[TILEBOT] ID OF FAQ ', faq_id);
  //   this.router.navigate(['project/' + this.project._id + '/editfaq', this.id_faq_kb, faq_id, this.botType]);
  // }
  // ---------------------------------------------------------------------------
  // Go to faq.component to: Add / Edit FAQ, Edit Bot name
  // ---------------------------------------------------------------------------
  goToBotDtls(faqkb: FaqKb) {

    if(! this.PERMISSION_TO_EDIT_FLOWS){
        this.notify.presentDialogNoPermissionToEditFlow();
        return;
    }
    // this.goToCDS(faqkb)
    // if (this.isPanelRoute === false) {
    //   this.goToOldBotDtls(idFaqKb, botType, botname)
    // } else {
    //   this.goToCDS(idFaqKb, botType, botname) 
    // }

    let _botType = ""
    if (faqkb.type === 'internal') {
      _botType = 'native'

      // -------------------------------------------------------------------------------------------
      // Publish the bot name to be able to check in the native bot sidebar if the bot name changes,
      // to prevent the bot name from updating every time a bot sidebar menu item is clicked
      // -------------------------------------------------------------------------------------------
      // this.faqKbService.publishBotName(botname)

      this.router.navigate(['project/' + this.project._id + '/bots/intents/', faqkb._id, _botType]);

    } else if (faqkb.type === 'tilebot') {
      _botType = 'tilebot'
      // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', idFaqKb, _botType]);
      // this.router.navigate(['project/' + this.project._id + '/createfaq', idFaqKb, _botType, 'en']);
      this.goToCDS(faqkb)

    } else if (faqkb.type === 'tiledesk-ai') {
      _botType = 'tiledesk-ai'
      // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', idFaqKb, _botType]);
      // this.router.navigate(['project/' + this.project._id + '/createfaq', idFaqKb, _botType, 'en']);
      this.goToCDS(faqkb)

    } else {
      _botType = faqkb.type
      this.router.navigate(['project/' + this.project._id + '/bots', faqkb._id, _botType]);
    }

    this.logger.log('[BOTS-LIST] ID OF THE BOT (FAQKB) SELECTED ', faqkb._id, 'bot type ', faqkb.type);
  }

  goToOldBotDtls(idFaqKb: string, botType: string, botname: string) {
    this.logger.log('[BOTS-LIST] NAME OF THE BOT SELECTED ', botname);
    let _botType = ""
    if (botType === 'internal') {
      _botType = 'native'

      // -------------------------------------------------------------------------------------------
      // Publish the bot name to be able to check in the native bot sidebar if the bot name changes,
      // to prevent the bot name from updating every time a bot sidebar menu item is clicked
      // -------------------------------------------------------------------------------------------
      // this.faqKbService.publishBotName(botname)

      this.router.navigate(['project/' + this.project._id + '/bots/intents/', idFaqKb, _botType]);

    } else if (botType === 'tilebot') {
      _botType = 'tilebot'
      this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', idFaqKb, _botType]);
      // this.router.navigate(['project/' + this.project._id + '/createfaq', idFaqKb, _botType, 'en']);


    } else {
      _botType = botType
      this.router.navigate(['project/' + this.project._id + '/bots', idFaqKb, _botType]);
    }

    this.logger.log('[BOTS-LIST] ID OF THE BOT (FAQKB) SELECTED ', idFaqKb, 'bot type ', botType);

  }

  goToCDS(faqKb: FaqKb) {
    // this.router.navigate(['project/' + this.project._id + '/cds/', faqKb._id, 'intent', '0']);
    goToCDSVersion(this.router, faqKb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  }


  // to  check if is used 
  goToTestFaqPage(remoteFaqKbKey: string) {
    this.logger.log('[BOTS-LIST] REMOTE FAQKB KEY SELECTED ', remoteFaqKbKey);
    this.router.navigate(['project/' + this.project._id + '/faq/test', remoteFaqKbKey]);
  }

  getTranslations() {
    this.translate.get('BotsPage')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.logger.log('[BOTS-LIST] getTranslations BotsPage : ', text)

        this.botIsAssociatedWithDepartments = text['TheBotIsAssociatedWithDepartments'];
        this.botIsAssociatedWithTheDepartment = text['TheBotIsAssociatedWithTheDepartment'];
        this.disassociateTheBot = text['DisassociateTheBot'];
        this.automationIsAssociatedWithTheDepartment = text['TheAutomationIsAssociatedWithTheDepartment'];
        this.automationIsAssociatedWithDepartments = text['TheAutomationIsAssociatedWithDepartments'];
        this.disassociateTheAutomation = text['DisassociateTheAutomation'];
      });


    this.translate.get('Warning')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BotsPage translation: ', text)
        this.warning = text;
      });

    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation
      })

      this.translate
      .get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate
      .get('AgentsCannotManageChatbots')
      .subscribe((translation: any) => {
        this.agentsCannotManageChatbots = translation
      })

    this.translateTrashBotSuccessMsg();
    this.translateTrashBotErrorMsg();
  }

  translateTrashBotSuccessMsg() {
    this.translate.get('TrashBotSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.trashBotSuccessNoticationMsg = text;
        // this.logger.log('+ + + TrashBotSuccessNoticationMsg', text)
      });
  }

  translateTrashBotErrorMsg() {
    this.translate.get('TrashBotErrorNoticationMsg')
      .subscribe((text: string) => {

        this.trashBotErrorNoticationMsg = text;
        // this.logger.log('+ + + TrashBotErrorNoticationMsg', text)
      });
  }

}
