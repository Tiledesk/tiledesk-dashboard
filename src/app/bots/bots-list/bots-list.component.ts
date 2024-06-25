import { Component, isDevMode, OnInit, OnDestroy } from '@angular/core';
import { FaqKbService } from '../../services/faq-kb.service';
import { Chatbot, FaqKb } from '../../models/faq_kb-model';
import { Router } from '@angular/router';
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
import { CHATBOT_MAX_NUM, goToCDSVersion, PLAN_NAME } from 'app/utils/util';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { UsersService } from 'app/services/users.service';
import { ChatbotModalComponent } from './chatbot-modal/chatbot-modal.component';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessagesStatsModalComponent } from 'app/components/modals/messages-stats-modal/messages-stats-modal.component';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';

const swal = require('sweetalert');
const Swal = require('sweetalert2')
@Component({
  selector: 'bots-list',
  templateUrl: './bots-list.component.html',
  styleUrls: ['./bots-list.component.scss'],
})

export class BotListComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  CHATBOT_MAX_NUM = CHATBOT_MAX_NUM;
  private unsubscribe$: Subject<any> = new Subject<any>();
  tparams: any;

  faqkbList: FaqKb[];
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

  allTemplatesCount: number;
  allCommunityTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;
  customerSatisfactionBotsCount: number;
  myChatbotOtherCount: number;
  increaseSalesBotsCount: number;
  kbCount: number;

  customerSatisfactionBots: any;
  increaseSalesBots: any;

  route: string
  dev_mode: boolean;
  isPanelRoute: boolean = false;
  botLogo: string;
  public selectedProjectId: string;
  public projectname: string;
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
  salesEmail: string;
  WIDGET_BASE_URL: string;
  defaultDeptId: string;
  is0penDropDown: boolean = false
  isOpen: boolean;

  orderBylastUpdated: boolean = true;
  orderByCreationDate: boolean = false;
  orderByChatbotName: boolean = false;
  pageName: string;
  isVisiblePAY: boolean;
  chatbotNumExceedChatbotLimit: boolean = false

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
    private kbService: KnowledgeBaseService,
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.botLogo = brand['BASE_LOGO_NO_TEXT']
    this.dev_mode = isDevMode()
    this.logger.log('[BOTS-LIST] is dev mode ', this.dev_mode)
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];

  }

  ngOnInit() {
    this.getBrowserVersion();
    this.auth.checkRoleForCurrentProject();
    this.getProfileImageStorage();

    this.getCurrentProject();
    this.getOSCODE();
    // this.getFaqKb();
    this.getFaqKbByProjectId();
    this.getTranslations();
    this.getTemplates()
    this.getCommunityTemplates()
    this.getAllNamespaces()
    this.getNavigationBaseUrl()
    this.getProjectPlan();
    this.getUserRole();
    this.getDefaultDeptId();
    // this.checkChatbotLimit()
    //  this.logger.log('[BOTS-LIST] - chatBotLimit »»» ',   this.chatBotLimit)
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  // checkChatbotLimit() {
  //   this.logger.log('[BOTS-LIST] - checkChatbotLimit »»» 1' ,this.chatBotLimit)
  //   if (this.chatBotLimit || this.chatBotLimit === 0) {
  //     this.logger.log('[BOTS-LIST] - checkChatbotLimit »»» 2')
  //     if (this.chatBotCount > this.chatBotLimit || this.chatBotLimit === 0) {
  //       this.chatbotNumExceedChatbotLimit = true;
  //       this.logger.log('[BOTS-LIST] - chatbotNumExceedChatbotLimit »»» ', this.chatbotNumExceedChatbotLimit)
  //     }
  //   }
  // }

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
  getAllNamespaces() {
    this.kbService.getAllNamespaces().subscribe((res: any) => {
      if (res) {
        this.kbCount = res.length
        this.logger.log('[BOTS-LIST] - GET ALL NAMESPACES', res);
        
      }
    }, (error) => {
      this.logger.error('[BOTS-LIST]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-LIST]  GET ALL NAMESPACES * COMPLETE *');
      
    });
  }

  getCommunityTemplates() {

    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {
      if (res) {
        const communityTemplates = res
        this.logger.log('[BOTS-LIST] - GET COMMUNITY TEMPLATES', communityTemplates);
        this.allCommunityTemplatesCount = communityTemplates.length;
        this.logger.log('[[BOTS-LIST] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);
      }
    }, (error) => {
      this.logger.error('[BOTS-LIST]  GET COMMUNITY TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[BOTS-LIST]  GET COMMUNITY TEMPLATES COMPLETE');

    });
  }

  getTemplates() {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        const templates = res
        //  this.logger.log('[BOTS-LIST] - GET ALL TEMPLATES', templates);
        this.allTemplatesCount = templates.length;
        this.logger.log('[BOTS-LIST] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);

        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        const customerSatisfactionTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[BOTS-LIST] - Customer Satisfaction TEMPLATES', customerSatisfactionTemplates);
        if (customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = customerSatisfactionTemplates.length;
          this.logger.log('[BOTS-LIST] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }

        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        const increaseSalesTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        //  this.logger.log('[BOTS-LIST] - Increase Sales TEMPLATES', increaseSalesTemplates);
        if (increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = increaseSalesTemplates.length;
          this.logger.log('[BOTS-LIST] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
        }
      }

    }, (error) => {
      this.logger.error('[BOTS-LIST] GET TEMPLATES ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[BOTS-LIST] GET TEMPLATES COMPLETE');
      // this.showSpinner = false;
      // this.generateTagsBackground(this.templates)
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
    this.logger.log('[BOTS-LIST] - UPDATED CHATBOT - shareWithLink botid', botid);
    this.logger.log('[BOTS-LIST] - UPDATED CHATBOT - shareWithLink botname', botname);
    // https://widget.tiledesk.com/v6/assets/twp/chatbot-panel.html?tiledesk_projectid=64959b8a6998ee001399056e&tiledesk_participants=bot_65bc881f4bc2250013ca8832&tiledesk_departmentID=64959b8a6998ee0013990572&tiledesk_hideHeaderCloseButton=true&tiledesk_widgetTitle=Showcase%20Deals&tiledesk_preChatForm=false&td_draft=true
    // https://widget-pre.tiledesk.com/v5/assets/twp/chatbot-panel.html?tiledesk_projectid=65cb48c7b6343a002fce77de&tiledesk_participants=bot_65cb48d5b6343a002fce7845&tiledesk_departmentID=65cb48c7b6343a002fce77e2&tiledesk_hideHeaderCloseButton=true&tiledesk_widgetTitle=Nikola&tiledesk_preChatForm=false&td_draft=true
    // WIDGET_BASE_URL = 'https://widget.tiledesk.com/v6/' (prod)
    // WIDGET_BASE_URL = ''https://widget-pre.tiledesk.com/v5/' (pre)
    this.WIDGET_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL;
    const botLink = this.WIDGET_BASE_URL + "assets/twp/chatbot-panel.html?tiledesk_projectid=" + this.currentProjectId + "&tiledesk_participants=bot_" + botid + "&tiledesk_departmentID=" + this.defaultDeptId + "&tiledesk_hideHeaderCloseButton=true&tiledesk_widgetTitle=" + botname + "&tiledesk_preChatForm=false&td_draft=true"
    this.clipboard.copy(botLink)
    this._snackBar.open(" Copied to clipboard", null, {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'success-snackbar'
    });
  }

  openTestSiteInPopupWindow(botid) {
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
      }
    });
  }



  openBotMsgsStats(bot) {
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

  /**
   * GETS ONLY THE FAQ-KB WITH THE CURRENT PROJECT ID
   * NOTE: THE CURRENT PROJECT-ID IS OBTAINED IN THE FAQ-KB SERVICE
   */
  getFaqKbByProjectId() {
    this.showSpinner = true
    // this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[BOTS-LIST] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {

        this.faqkbList = faqKb;
        this.chatBotCount = this.faqkbList.length;
        this.myChatbotOtherCount = faqKb.length

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
            this.logger.error('[BOTS-LIST] bot not has url ', bot)
          }

          this.getBotProfileImage(bot)

          this.logger.log('[BOTS-LIST] - orderBylastUpdated', this.orderBylastUpdated);
          this.logger.log('[BOTS-LIST] - orderByCreationDate', this.orderByCreationDate);
        });



        // ---------------------------------------------------------------------
        // Bot forked from Customer Satisfaction templates
        // ---------------------------------------------------------------------
        this.customerSatisfactionBots = this.faqkbList.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[BOTS-LIST] - Customer Satisfaction BOTS', this.customerSatisfactionBots);
        if (this.customerSatisfactionBots) {
          this.customerSatisfactionBotsCount = this.customerSatisfactionBots.length;
          this.logger.log('[BOTS-LIST] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }


        // ---------------------------------------------------------------------
        // Bot forked from Customer Increase Sales
        // ---------------------------------------------------------------------
        this.increaseSalesBots = this.faqkbList.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        this.logger.log('[BOTS-LIST] - Increase Sales BOTS ', this.increaseSalesBots);
        if (this.increaseSalesBots) {
          this.increaseSalesBotsCount = this.increaseSalesBots.length;
          this.logger.log('[BOTS-LIST] - Increase Sales BOTS COUNT', this.increaseSalesTemplatesCount);
        }

        this.route = this.router.url
        if (this.route.indexOf('/bots/my-chatbots/all') !== -1) {
          this.faqkbList = this.faqkbList
          this.pageName = "ALL MY CHATBOTS"
          this.logger.log('[BOTS-LIST] ROUTE my-chatbots/all');
        } else if (this.route.indexOf('/bots/my-chatbots/customer-satisfaction') !== -1) {
          this.faqkbList = this.customerSatisfactionBots
          this.pageName = "CUSTOMER SATISFACTION CHATBOTS"
          this.logger.log('[BOTS-LIST] ROUTE my-chatbots/customer-satisfaction faqkbList ', this.faqkbList);
        } else if (this.route.indexOf('/bots/my-chatbots/increase-sales') !== -1) {
          this.pageName = "INCREASE SALES CHATBOTS"
          this.faqkbList = this.increaseSalesBots
          this.logger.log('[BOTS-LIST] ROUTE my-chatbots/increase-sales faqkbList ', this.faqkbList);
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

          for (let bot of this.faqkbList) {
            // this.logger.log("BOT LIST - GET NUM OF MESSAGE - BOT : ", bot);
            this.faqKbService.getNumberOfMessages(bot._id, bot.type).subscribe((res: any) => {
              this.logger.log("[BOTS-LIST] Messages sent from bot: ", res);
              if (res.length == 0) {
                bot.message_count = 0;
              } else {
                bot.message_count = res[0].totalCount;
              }
            })
          }
        }
      }

      /* this.showSpinner = false moved in getAllFaqByFaqKbId:
       * in this callback stop the spinner only if there isn't faq-kb and
       * if there is an error */
      // this.showSpinner = false;
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
        self.logger.log('[BOTS-LIST] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
        bot.botImage = imageUrl + '&' + new Date().getTime();
        // this.botProfileImageurl = this.sanitizer.bypassSecurityTrustUrl(_botProfileImageurl)
        // self.setImageProfileUrl_Native(baseUrl)

      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[CDS-CHATBOT-DTLS] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

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
    })

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

    if (!this.public_Key.includes("ANA")) {
      this.isVisibleAnalytics = false;
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



  getAllFaqByFaqKbId() {
    // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    let i: number;
    for (i = 0; i < this.faqkbList.length; i++) {
      this.logger.log('[BOTS-LIST] getFaqByFaqKbId ID FAQ KB ', this.faqkbList[i]._id);
      this.faqKbId = this.faqkbList[i]._id;

      this.faqService.getAllFaqByFaqKbId(this.faqKbId).subscribe((faq: any) => {
        this.logger.log('[BOTS-LIST] getAllFaqByFaqKbId GET BOT FAQs - FAQs ARRAY ', faq);

        if (faq) {
          let j: number;
          for (j = 0; j < faq.length; j++) {
            // this.logger.log('MONGO DB FAQ - FAQ ID', faq[j]._id);
            // this.logger.log('MONGO DB FAQ - FAQ-KB ID', faq[j].id_faq_kb);

            // this.logger.log('WITH THE FAQ-KB ID ', faq[j].id_faq_kb, 'FOUND FAQ WITH ID ', faq[j]._id)
            this.faq_faqKbId = faq[j].id_faq_kb;

            for (const faqkb of this.faqkbList) {

              if (faqkb._id === this.faq_faqKbId) {
                // this.logger.log('+> ID COINCIDONO');
                faqkb.faqs_number = faq.length
                // this.logger.log('»»» BOT ID', faqkb._id, 'FAQ LENGHT ', faq.length);
                // set in the json the value true to the property has_faq
                faqkb.has_faq = true;
              }
            }
          }
        }
      }, (error) => {
        this.logger.error('[BOTS-LIST] GET BOT FAQs - ERROR ', error)
        // this.showSpinner = false;
      }, () => {
        this.logger.log('[BOTS-LIST] GET BOT FAQs - COMPLETE ');
        // setTimeout(() => {
        //   this.showSpinner = false;
        // }, 100);
      });
    }
  }


  /**
   * MODAL DELETE FAQ KB
   * @param id
   */
  openDeleteModal(id: string, bot_name: string, HAS_FAQ_RELATED: boolean, botType: string) {
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
        if (foundDeptsArray.length === 1) {
          Swal.fire({
            title: this.warning,
            text: this.botIsAssociatedWithTheDepartment + ' ' + this.deptsNameAssociatedToBot + '. ' + this.disassociateTheBot,
            icon: "warning",
            showCancelButton: false,
            confirmButtonText: this.translate.instant('Ok') ,
            confirmButtonColor: "var(--blue-light)",
            focusConfirm: false,
            // reverseButtons: true
            // button: true,
            // dangerMode: false,
          })
        }

        if (foundDeptsArray.length > 1) {
          Swal.fire({
            title: this.warning,
            text: this.botIsAssociatedWithDepartments + ' ' + this.deptsNameAssociatedToBot + '. ' + this.disassociateTheBot,
            icon: "warning",
            showCancelButton: false,
            confirmButtonText: this.translate.instant('Ok') ,
            confirmButtonColor: "var(--blue-light)",
            focusConfirm: false,
            // button: true,
            // dangerMode: false,
          })

        }

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
  }

  createBlankTilebot() {
    this.logger.log('[BOTS-LIST] createBlankTilebot chatBotCount ', this.chatBotCount, ' chatBotLimit ', this.chatBotLimit)


    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit || this.chatBotLimit === 0) {
        if (this.chatBotCount < this.chatBotLimit) {
          this.logger.log('[BOTS-LIST] USECASE  chatBotCount < chatBotLimit: RUN NAVIGATE')
          this.router.navigate(['project/' + this.project._id + '/bots/create/tilebot/blank']);
        } else if (this.chatBotCount >= this.chatBotLimit) {
          this.logger.log('[BOTS-LIST] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (this.chatBotLimit === null) {
        this.logger.log('[BOTS-LIST] USECASE  NO chatBotLimit: RUN NAVIGATE')
        this.router.navigate(['project/' + this.project._id + '/bots/create/tilebot/blank'])
      }
    } if (this.USER_ROLE === 'agent') {
      this.presentModalAgentCannotManageChatbot()
    }
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
