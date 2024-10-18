import { Component, OnInit, OnDestroy, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener, ViewEncapsulation } from '@angular/core';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { LocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { avatarPlaceholder, getColorBck, PLAN_NAME } from '../../utils/util';
import { NotifyService } from '../../core/notify.service';

import { TranslateService } from '@ngx-translate/core';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import { Request } from '../../models/request-model';
import { UsersService } from '../../services/users.service';
import { UAParser } from 'ua-parser-js'
import { FaqKbService } from '../../services/faq-kb.service';
import { AppConfigService } from '../../services/app-config.service';
import { Subscription, zip } from 'rxjs'
import { DepartmentService } from '../../services/department.service';
import { Subject } from 'rxjs';
import { skip, takeUntil, throttleTime } from 'rxjs/operators'
import { browserRefresh } from '../../app.component';
import * as uuid from 'uuid';
import { Chart } from 'chart.js';
import { ContactsService } from '../../services/contacts.service';
import { Observable } from 'rxjs';
import { ProjectUser } from '../../models/project-user';
import { ProjectService } from '../../services/project.service';
import { ProjectPlanService } from '../../services/project-plan.service';
import { LoggerService } from '../../services/logger/logger.service';
import { GroupService } from '../../services/group.service';
import { Group } from 'app/models/group-model';
import { debounceTime } from 'rxjs/operators';

const swal = require('sweetalert');
const Swal = require('sweetalert2')

@Component({
  selector: 'appdashboard-ws-requests-list',
  templateUrl: './ws-requests-list.component.html',
  styleUrls: ['./ws-requests-list.component.scss']
  // ,
  // encapsulation: ViewEncapsulation.None
})
export class WsRequestsListComponent extends WsSharedComponent implements OnInit, AfterViewInit, OnDestroy {
  changeValues = new Subject<string>();
  PLAN_NAME = PLAN_NAME;
  trial_expired: string;
  profile_name: string;
  subscription_end_date: any;

  CHAT_BASE_URL: string;

  // used to unsuscribe from behaviour subject
  private unsubscribe$: Subject<any> = new Subject<any>();

  @ViewChild('teamContent', { static: false }) private teamContent: ElementRef;
  @ViewChild('testwidgetbtn', { static: false }) private testwidgetbtnRef: ElementRef;
  @ViewChild('widgetsContent', { static: false }) public widgetsContent: ElementRef;

  wsRequestsUnserved: any;
  wsRequestsServed: any;
  countRequestsServedByHumanRr: number = 0;
  countRequestsServedByBotRr: number = 0;
  countRequestsUnservedRr: number = 0;
  requestCountResp: any
  ws_requests: any;
  projectId: string;
  zone: NgZone;
  SHOW_SIMULATE_REQUEST_BTN = false;
  showSpinner = true;
  firebase_token: any;
  currentUserID: string;
  ONLY_MY_REQUESTS: boolean = false;
  displayAgentsSelect: boolean = true;
  ROLE_IS_AGENT: boolean;
  displayBtnLabelSeeYourRequets = false;

  totalRequests: any;
  i = 0
  Xlength: number

  user_and_bot_array = [];
  team_ids_array = [];

  seeAll: any;
  subscription: Subscription;
  storageBucket: string;

  departments: any;
  selectedDeptId: string;
  selectedAgentId: any;
  selectedConversationTypeId: string;

  TESTSITE_BASE_URL: string;
  projectName: string;

  participantsInRequests: any;
  deptsArrayBuildFromRequests: any;

  filter: any[] = [{ 'deptId': null }, { 'agentId': null }, { 'conversationTypeId': null }];
  hasFiltered = false;
  public browserRefresh: boolean;
  displayInternalRequestModal = 'none';
  internalRequest_subject: string;
  // internalRequest_deptId: string;
  internalRequest_message: string;
  showSpinner_createInternalRequest = false;
  hasClickedCreateNewInternalRequest = false;
  createNewInternalRequest_hasError: boolean;
  internal_request_id: string;

  displayCreateNewUserModal = 'none';

  // deptIdSelectedInRequuestsXDepts
  ws_requestslist_deptIdSelected: string
  display_dept_sidebar = false;
  imageStorage$: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  OPERATING_HOURS_ACTIVE: boolean;
  served_unserved_sum: any;

  displayRequestsMap: boolean = false;
  OPEN_RIGHT_SIDEBAR: boolean = false;
  map_sidebar_height: any;

  projectUserArray: Array<any> = []
  tempProjectUserArray: Array<any> = []

  project_user_length: number;
  display_teammates_in_scroll_div = false;
  showRealTeammates = false

  projectUserAndLeadsArray = []
  projectUserBotsAndDeptsArray = []

  selectedRequester: any;

  page_No = 0
  items = [];
  HAS_CLICKED_CREATE_NEW_LEAD: boolean = false;
  HAS_COMPLETED_CREATE_NEW_LEAD: boolean = false;
  new_user_name: string;
  new_user_email: string;
  assignee_id: string

  assignee_participants_id: string;
  assignee_dept_id: string;
  loadingAssignee: boolean;
  loadingRequesters: boolean;
  new_requester_email_is_valid: boolean;
  newRequesterCreatedSuccessfullyMsg: string;

  requester_type: string;
  id_for_view_requeter_dtls: string

  project_users: ProjectUser[]
  filteredProjectUsersArray: ProjectUser[]
  other_project_users_that_has_abandoned_array: Array<any>

  CHAT_REASSIGNMENT_IS_ENABLED: boolean // reassignment_on
  reassignment_timeout: number; // reassignment_delay
  CHAT_LIMIT_IS_ENABLED: boolean // key chat_limit_on
  maximum_chats: number; // key max_agent_assigned_chat
  AUTOMATIC_UNAVAILABLE_STAUS_IS_ENABLED: boolean; // automatic_unavailable_status_on
  chats_reassigned: number // key automatic_idle_chats
  AGENTS_CAN_SEE_ONLY_OWN_CONVS: boolean
  // DISPLAY_MODAL_UPGRADE_PLAN: boolean; // NOT USED
  // DISPLAY_MODAL_SUBSCRIPTION_PROBLEM: boolean; // NOT USED
  CURRENT_USER_ROLE: string;
  agentCannotManageAdvancedOptions: string;
  learnMoreAboutDefaultRoles: string;
  featureIsAvailableWithTheProPlan: string;
  public_Key: string;
  isVisibleSmartAssignOption: boolean;
  isVisibleOPH: boolean;
  prjct_profile_type: string;
  prjct_trial_expired: boolean;
  subscription_is_active: boolean;
  DISPLAY_OPH_AS_DISABLED: boolean;
  project_id: string;

  selectedPriority: string;
  current_selected_prjct: any;
  isChromeVerGreaterThan100: boolean;

  calling_page: string = "conv_list"
  groupsList: Group[];
  DISPLAY_ALL_TEAMMATES_TO_AGENT: boolean;
  newTicketRequestId: string;
  onlyAvailableWithEnterprisePlan: string;
  isVisiblePay: boolean;
  cancelLbl: string;
  upgradePlan: string;
  cPlanOnly: string;
  prjct_profile_name: string;
  onlyUserWithOwnerRoleCanManageAdvancedProjectSettings: string;
  /**
   * 
   * @param wsRequestsService 
   * @param router 
   * @param usersLocalDbService 
   * @param botLocalDbService 
   * @param auth 
   * @param translate 
   * @param usersService 
   * @param faqKbService 
   * @param appConfigService 
   * @param departmentService 
   * @param notify 
   * @param contactsService 
   * @param projectService 
   * @param prjctPlanService 
   * @param logger 
   */
  constructor(
    public wsRequestsService: WsRequestsService,
    public router: Router,
    public usersLocalDbService: LocalDbService,
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public translate: TranslateService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    public notify: NotifyService,
    public contactsService: ContactsService,
    private projectService: ProjectService,
    private prjctPlanService: ProjectPlanService,
    public logger: LoggerService,
    public groupService: GroupService
  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit() {
    // this.logger.log('SELECTED PRIORITY ', this.selectedPriority)
    this.getBrowserVersion()
    this.getOSCODE();
    this.getImageStorageAndThenProjectUsers();
    this.getDepartments();
    // this.getActiveContacts();
    this.getCurrentProject();
    this.getProjectPlan();
    this.getLoggedUser();
    // this.getProjectUserRole();
    this.detectBrowserRefresh();
    this.getChatUrl();
    this.getTestSiteUrl();
    this.translateString()
    this.getRestRequestConversationCount()
    this.getWsConv$()
    // this.listenToParentPostMessage()
    // this.getGroupsByProjectId();
  }
  





  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      // this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  // listenToParentPostMessage() {
  //   window.addEventListener("message", (event) => {
  //     this.logger.log("[WS-REQUESTS-LIST] message event ", event);

  //     if (event && event.data && event.data.action && event.data.parameter && event.data.calledBy) {
  //       if (event.data.action === 'hasArchived' && event.data.calledBy === 'ws_unserved_for_panel') {
  //         this.logger.log("[WS-REQUESTS-LIST] message event ", event.data.action);
  //         this.logger.log("[WS-REQUESTS-LIST] message parameter ", event.data.parameter);
  //         this.logger.log("[WS-REQUESTS-LIST] currentUserID ", this.currentUserID);

  //       }
  //     }
  //   })
  // }

  // getActiveContacts() {
  //   this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
  //     this.logger.log('WS-REQUEST-LIST - GET ACTIVE LEADS RES ', activeleads)

  //   });
  // }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.logger.log('[WS-REQUESTS-LIST] - ngOnDestroy')
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.projectUserArray.forEach(projectuser => {
      this.wsRequestsService.unsubsToToWsAllProjectUsersOfTheProject(projectuser.id_user._id)
    });
  }

  openChat() {
    // const url = this.CHAT_BASE_URL;
    // this.openWindow('Tiledesk - Open Source Live Chat', url)
    // this.focusWin('Tiledesk - Open Source Live Chat')
    // --- new 
    localStorage.setItem('last_project', JSON.stringify(this.current_selected_prjct))
    let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
    let url = baseUrl
    const myWindow = window.open(url, '_self', 'Tiledesk - Open Source Live Chat');
    myWindow.focus();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-PLAN - project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.project_id = projectProfileData._id;
        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.prjct_profile_name = projectProfileData.profile_name;

        this.trial_expired = projectProfileData.trial_expired
        this.profile_name = projectProfileData.profile_name;
        this.subscription_end_date = projectProfileData.subscription_end_date;

        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.prjct_trial_expired === true) {
          this.DISPLAY_OPH_AS_DISABLED = true;
        } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true || this.prjct_profile_type === 'free' && this.prjct_trial_expired === false) {
          this.DISPLAY_OPH_AS_DISABLED = false;
        }
      }
    }, err => {
      this.logger.error('[WS-REQUESTS-LIST] - GET PROJECT-PLAN - ERROR', err);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-PLAN * COMPLETE *');
    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[WS-REQUESTS-LIST] getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - keys', keys)
    keys.forEach(key => {


      if (key.includes("PSA")) {
        // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - key', key);
        let psa = key.split(":");
        // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - pay key&value', psa);
        if (psa[1] === "F") {
          this.isVisibleSmartAssignOption = false;
        } else {
          this.isVisibleSmartAssignOption = true;
        }
      }

      if (key.includes("OPH")) {
        // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - key', key);
        let oph = key.split(":");
        // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - pay key&value', oph);

        if (oph[1] === "F") {
          this.isVisibleOPH = false;
          // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - isVisibleOPH', this.isVisibleOPH);
        } else {
          this.isVisibleOPH = true;
          // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - isVisibleOPH', this.isVisibleOPH);
        }
      }

      if (key.includes("PAY")) {
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePay = false;
        } else {
          this.isVisiblePay = true;
        }
      }

    });


    if (!this.public_Key.includes("PSA")) {
      // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - key.includes("PSA")', this.public_Key.includes("PSA"));
      this.isVisibleSmartAssignOption = false;
    }

    if (!this.public_Key.includes("OPH")) {
      // this.logger.log('[WS-REQUESTS-LIST] PUBLIC-KEY - key.includes("OPH")', this.public_Key.includes("OPH"));
      this.isVisibleOPH = false;
    }
    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePay = false;
    }
  }

  translateString() {
    this.translate.get('NewRequesterCreatedSuccessfully')
      .subscribe((translation: any) => {
        this.newRequesterCreatedSuccessfullyMsg = translation;
      });


    this.translate.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject')
      .subscribe((translation: any) => {
        this.agentCannotManageAdvancedOptions = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translate.get('ThisFeatureIsAvailableWithTheProPlan')
      .subscribe((translation: any) => {
        this.featureIsAvailableWithTheProPlan = translation;
      });

    this.translate.get('ProjectEditPage.FeatureOnlyAvailableWithTheEnterprisePlan')
      .subscribe((translation: any) => {
        // this.logger.log('[PRJCT-EDIT-ADD] onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyAvailableWithEnterprisePlan = translation;
      });

    this.translate.get('Cancel').subscribe((text: string) => {
      this.cancelLbl = text;
    });

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('AvailableWithThePlan', { plan_name: PLAN_NAME.F })
      .subscribe((translation: any) => {
        this.cPlanOnly = translation;
      });

    this.translate.get('OnlyUserWithOwnerRoleCanManageAdvancedProjectSettings')
      .subscribe((translation: any) => {
        this.onlyUserWithOwnerRoleCanManageAdvancedProjectSettings = translation;
      });

  }


  getImageStorageAndThenProjectUsers() {
    // storage bucket from user service subscription 
    this.imageStorage$ = this.usersService.imageStorage$.value;
    this.logger.log('[WS-REQUESTS-LIST] - IMAGE STORAGE usersService BS value', this.imageStorage$);

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;

      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[WS-REQUESTS-LIST] - IMAGE STORAGE (getImageStorageAndThenProjectUsers)', this.storageBucket, 'usecase firebase');

      this.getAllProjectUsers(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE);

    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[WS-REQUESTS-LIST] - IMAGE STORAGE (getImageStorageAndThenProjectUsers) ', this.baseUrl, 'usecase native')
      this.getAllProjectUsers(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE);
    }

    this.displayProjectUserImageSkeleton()
  }

  displayProjectUserImageSkeleton() {
    setTimeout(() => {
      this.showRealTeammates = true;
    }, 2500);
  }


  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[WS-REQUESTS-LIST] getAppConfig - TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[WS-REQUESTS-LIST] getAppConfig - CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  goToNoRealtimeConversations() {
    this.router.navigate(['project/' + this.projectId + '/all-conversations']);
  }

  showRequestsMap() {
    this.displayRequestsMap = true;
  }

  openRightSideBar() {
    this.OPEN_RIGHT_SIDEBAR = true;
    this.logger.log('[WS-REQUESTS-LIST] »»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.logger.log('[WS-REQUESTS-LIST] - REQUEST-MAP - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT (MAIN-CONTENT)', elemMainContent.clientHeight);
    this.map_sidebar_height = elemMainContent.clientHeight - 100 + 'px';
    this.logger.log('[WS-REQUESTS-LIST] - REQUEST-MAP - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.map_sidebar_height);

  }

  handleCloseRightSidebar(event) {
    this.logger.log('[WS-REQUESTS-LIST] »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = false;
  }

  detectBrowserRefresh() {
    this.logger.log('[WS-REQUESTS-LIST] CALLING browserRefresh')
    this.browserRefresh = browserRefresh;

    if (this.browserRefresh) {

      this.listenToRequestsLength();
    } else {
      this.wsRequestsService.wsRequestsList$.value
    }
  }

  getProjectUserRole() {
    // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-USER ROLE calling getProjectUserRole ');
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-USER ROLE user_role ', user_role);
        if (user_role) {
          this.CURRENT_USER_ROLE = user_role;
          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true
            this.displayBtnLabelSeeYourRequets = true

            this.ONLY_MY_REQUESTS = true;
            // if (this.ONLY_MY_REQUESTS === false && this.AGENTS_CAN_SEE_ONLY_OWN_CONVS === true) { 
            //   this.displayAgentsSelect = true
            //   this.logger.log('[WS-REQUESTS-LIST] - seeIamAgentRequests - displayAgentsSelect ', this.displayAgentsSelect);
            // } else 
            // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-USER ROLE  AGENTS_CAN_SEE_ONLY_OWN_CONVS', this.AGENTS_CAN_SEE_ONLY_OWN_CONVS);
            if (this.ONLY_MY_REQUESTS === true && this.AGENTS_CAN_SEE_ONLY_OWN_CONVS === true) {

              this.displayAgentsSelect = false
              this.logger.log('[WS-REQUESTS-LIST] - seeIamAgentRequests - displayAgentsSelect ', this.displayAgentsSelect);
            }

            this.getWsRequests$();
          } else {
            this.ROLE_IS_AGENT = false
            this.displayBtnLabelSeeYourRequets = false;
            this.getWsRequests$();
          }
        }
      });
  }

  // https://stackoverflow.com/questions/48955095/horizontal-scroll-using-buttons-on-angular2
  public scrollLeftTeammates(): void {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }

  public scrollRightTeammates() {
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  getAllProjectUsers(imagestorage: string, isfirebaseuploadengine: boolean) {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((_projectUsers: any) => {
      // this.logger.log('% »»» WebSocketJs WF WS-RL - +++ GET PROJECT-USERS ', projectUsers);
      //  this.logger.log('[WS-REQUESTS-LIST]- GET PROJECT-USERS RES ', _projectUsers);
      if (_projectUsers) {
        this.project_users = _projectUsers
        this.project_user_length = _projectUsers.length;
        // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-USERS LENGTH ', this.project_user_length);
        // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT-USERS project_users ', this.project_users);
        this.projectUserArray = _projectUsers;

        _projectUsers.forEach(projectuser => {

          this.logger.log('WS-REQUESTS-LIST - GET PROJECT-USERS forEach projectuser ', projectuser);
          let imgUrl = ''
          if (isfirebaseuploadengine === true) {
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + imagestorage + "/o/profiles%2F" + projectuser.id_user._id + "%2Fphoto.jpg?alt=media";
          } else {
            imgUrl = imagestorage + "images?path=uploads%2Fusers%2F" + projectuser.id_user._id + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }

          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              projectuser.hasImage = true
            }
            else {
              projectuser.hasImage = false
            }
          });

          this.wsRequestsService.subscriptionToWsAllProjectUsersOfTheProject(projectuser.id_user._id);


          this.listenToAllProjectUsersOfProject$(projectuser)

          this.createAgentAvatarInitialsAnfBckgrnd(projectuser.id_user)

        });

        // this.logger.log('% »»» WebSocketJs WF WS-RL - +++ USERS & BOTS ARRAY (1) ', this.user_and_bot_array);
      }
    }, (error) => {
      this.logger.error('[WS-REQUESTS-LIST] - GET PROJECT-USERS - ERROR ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST]T - GET PROJECT-USERS * COMPLETE *');

    });
  }

  createAgentAvatarInitialsAnfBckgrnd(agent) {
    let fullname = '';
    if (agent && agent.firstname && agent.lastname) {
      fullname = agent.firstname + ' ' + agent.lastname
      agent['fullname_initial'] = avatarPlaceholder(fullname);
      agent['fillColour'] = getColorBck(fullname)
    } else if (agent && agent.firstname) {

      fullname = agent.firstname
      agent['fullname_initial'] = avatarPlaceholder(fullname);
      agent['fillColour'] = getColorBck(fullname)
    } else {
      agent['fullname_initial'] = 'N/A';
      agent['fillColour'] = 'rgb(98, 100, 167)';
    }

  }

  listenToAllProjectUsersOfProject$(projectuser) {
    this.wsRequestsService.projectUsersOfProject$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectUser_from_ws_subscription) => {
        // this.logger.log('[WS-REQUESTS-LIST] $UBSC TO WS PROJECT-USERS (listenTo) projectUser_from_ws_subscription', projectUser_from_ws_subscription);
        // this.logger.log('WS-REQUESTS-LIST PROJECT-USERS ', projectuser);

        if (projectuser['_id'] === projectUser_from_ws_subscription['_id']) {
          // projectUser_from_ws_subscription['email'] = projectuser['id_user']['email']
          // projectUser_from_ws_subscription['firstname'] = projectuser['id_user']['firstname']
          // projectUser_from_ws_subscription['lastname'] = projectuser['id_user']['lastname']

          projectuser['number_assigned_requests_rt'] = projectUser_from_ws_subscription['number_assigned_requests'];
          projectuser['user_available_rt'] = projectUser_from_ws_subscription['user_available'];
          projectuser['isBusy_rt'] = projectUser_from_ws_subscription['isBusy'];
          projectuser['updatedAt_rt'] = projectUser_from_ws_subscription['updatedAt'];
          if (projectUser_from_ws_subscription['profileStatus']) {
            projectuser['profileStatus_rt'] = projectUser_from_ws_subscription['profileStatus']
          }

        }

        this.tempProjectUserArray.indexOf(projectuser) === -1 ? this.tempProjectUserArray.push(projectuser) : this.logger.log("PUSH PROJECT-USER IN tempProjectUserArray: This item already exists");

        this.tempProjectUserArray.sort(function (a, b) { return a.user_available_rt - b.user_available_rt });
        this.tempProjectUserArray.reverse();
        this.projectUserArray = this.tempProjectUserArray;
        // this.logger.log('[WS-REQUESTS-LIST] this.projectUserArray ', this.projectUserArray)

        // COMMENTED NK
        // this.getDeptsByProjectId(this.projectUserArray)

      }, (error) => {
        this.logger.error('[WS-REQUESTS-LIST] $UBSC TO WS PROJECT-USERS - ERROR ', error);
      }, () => {
        this.logger.log('[WS-REQUESTS-LIST] $UBSC TO WS PROJECT-USERS * COMPLETE *');
      })

  }

  getDeptsByProjectId(projectUserArray) {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      // this.logger.log('[WS-REQUESTS-LIST] - GET ALL DEPTS (FILTERED FOR PROJECT ID)', departments);

      const activeDepartments = departments.filter(dept => dept.status !== 0);
      // this.logger.log('[WS-REQUESTS-LIST] - ONLY ACYIVE DEPTS ', activeDepartments);
      if (activeDepartments) {
        const departmentsCount = activeDepartments.length;

        // this.logger.log('[WS-REQUESTS-LIST] - GET DEPTS active departmentsCount ', departmentsCount)
        let count = 0
        activeDepartments.forEach((dept: any) => {

          if (departmentsCount > 1) {
            // this.logger.log('»»» »»» DEPTS PAGE - DEPT)', dept);
            if (dept && dept.default !== true) {
              // this.logger.log('[DEPTS] - GET DEPTS -  DEPT NAME: ', dept.name, 'dept object', dept);

              if (!dept.id_group || dept.id_group === undefined) {
                count = count + 1;
                // this.logger.log('[WS-REQUESTS-LIST] display all teammates')
              }
            }
          } else if (departmentsCount === 1) {
            // this.logger.log('[WS-REQUESTS-LIST] USECASE: THERE IS ONLY A DEPT  -  DEPT NAME ', dept.name, 'dept object', dept);


            if (!dept.id_group || dept.id_group === undefined) {
              // this.logger.log('[WS-REQUESTS-LIST] (only default dept) ')
              count = count + 1;
            }
          }
        });
        // this.logger.log('[DEPTS] - COUNT OF DEPT WITHOUT GROUP', count);
        if (count > 0) {
          // this.DISPLAY_ALL_TEAMMATES_TO_AGENT = true;
          this.filteredProjectUsersArray = projectUserArray

        } else if (count === 0) {
          // this.DISPLAY_ALL_TEAMMATES_TO_AGENT = false;
          this.getGroupsByProjectId(projectUserArray)
        }
      }
    }, error => {

      this.logger.error('[WS-REQUESTS-LIST] (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST] (FILTERED FOR PROJECT ID) - COMPLETE')

    });
  }

  getGroupsByProjectId(projectUserArray) {
    // this.logger.log('[WS-REQUESTS-LIST] - GROUPS - ALL PROJECT USERS ', projectUserArray)
    this.groupService.getGroupsByProjectId().subscribe((groups: any) => {
      // this.logger.log('[WS-REQUESTS-LIST] - GROUPS GET BY PROJECT ID', groups);
      const memberOfAllGroups = []
      if (groups) {
        this.groupsList = groups;

        // this.logger.log('[DEPT-EDIT-ADD] - GROUP ID SELECTED', this.selectedGroupId);
        this.groupsList.forEach(group => {
          // this.logger.log('[WS-REQUESTS-LIST] - GROUP ', group);

          if (group.members.includes(this.currentUserID)) {
            // this.logger.log('[WS-REQUESTS-LIST] - GROUPS MEMBERS INCLUDES CURRENT USER');
            group.members.forEach(member => {
              memberOfAllGroups.indexOf(member) === -1 ? memberOfAllGroups.push(member) : this.logger.log("PUSH MEMBER ID IN memberOfAllGroups : This item already exists");
            });

            // this.logger.log('[WS-REQUESTS-LIST] - ARRAY OF ALL MEMBERS OF GROUPS ', memberOfAllGroups);

            this.filteredProjectUsersArray = projectUserArray.filter(projectUser => memberOfAllGroups.includes(projectUser.id_user._id))
            // this.logger.log('[WS-REQUESTS-LIST] - PROJECT USER FILTERED FOR MEMBERS OF THE GROUPS IN WICH IS PRESENT THE CURRENT USER ', this.filteredProjectUsersArray);
          } else {
            // this.logger.log('[WS-REQUESTS-LIST] - GROUPS MEMBERS NOT INCLUDES CURRENT USER  - SHOW ALL TEAMMATES');
            this.filteredProjectUsersArray = projectUserArray
          }
        });

      } else {
        // this.logger.log('[WS-REQUESTS-LIST] - THE PROJECT NOT HAS GROUPS - SHOW ALL TEAMMATES');
        this.filteredProjectUsersArray = projectUserArray
      }
    }, (error) => {
      this.logger.error('[DEPT-EDIT-ADD] - GET GROUPS - ERROR ', error);
      // this.HAS_COMPLETED_GET_GROUPS = false
      // this.showSpinner = false;
    }, () => {
      this.logger.log('[DEPT-EDIT-ADD] - GET GROUPS * COMPLETE');
    });
  }

  // getAllBot() {
  //   this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
  //     this.logger.log('[WS-REQUESTS-LIST] - GET BOT ', bots);

  //     if (bots) {
  //       bots.forEach(bot => {
  //         if (bot) {
  //           this.user_and_bot_array.push({ '_id': 'bot_' + bot._id, 'firstname': bot.name + ' (bot)' });
  //           this.team_ids_array.push('bot_' + bot._id);
  //         }
  //       });
  //     }

  //     this.logger.log('[WS-REQUESTS-LIST] -  GET BOT - TEAM ARRAY (user_and_bot_array) ', this.user_and_bot_array);


  //   }, (error) => {
  //     this.logger.error('[WS-REQUESTS-LIST] - GET BOT - ERROR ', error);
  //   }, () => {
  //     this.logger.log('[WS-REQUESTS-LIST] - GET BOT * COMPLETE *');
  //   });
  // }


  listenToRequestsLength() {
    this.subscription = this.wsRequestsService.ws_All_RequestsLength$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((totalrequests: number) => {
        this.logger.log('[WS-REQUESTS-LIST] - $UBS TO WS REQUEST LENGTH', totalrequests)

        if (totalrequests === 0) {
          this.SHOW_SIMULATE_REQUEST_BTN = true
          this.showSpinner = false;
          this.logger.log('[WS-REQUESTS-LIST] - $UBS TO WS REQUEST LENGTH (usecase totalrequests = 0) - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          this.logger.log('[WS-REQUESTS-LIST] - $UBS TO WS REQUEST LENGTH (usecase totalrequests = 0) - showSpinner ', this.showSpinner)

        } else if (totalrequests > 0) {

          this.showSpinner = false;
          this.SHOW_SIMULATE_REQUEST_BTN = false
          this.logger.log('[WS-REQUESTS-LIST] - $UBS TO WS REQUEST LENGTH (usecase totalrequests > 0) - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          this.logger.log('[WS-REQUESTS-LIST] - $UBS TO WS REQUEST LENGTH (usecase totalrequests > 0)-  showSpinner ', this.showSpinner)

        }
      })
  }

  public generateFake(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[WS-REQUESTS-LIST] GET CURRENT-USER  USER ', user)
      if (user) {
        this.currentUserID = user._id
        this.logger.log('[WS-REQUESTS-LIST] GET CURRENT-USER > currentUser ID', this.currentUserID);
      }
    });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published current project (called On init)
  // -----------------------------------------------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[WS-REQUESTS-LIST] GET CURRENT-PRJCT AND THEN GET PROJECT BY ID - CURRENT-PRJCT', project)
      if (project) {
        this.projectId = project._id;
        this.logger.log('[WS-REQUESTS-LIST] GET CURRENT-PRJCT AND THEN GET PROJECT BY ID - CURRENT-PRJCT > projectId', this.projectId)
        this.projectName = project.name;
        this.OPERATING_HOURS_ACTIVE = project.activeOperatingHours
        this.logger.log('[WS-REQUESTS-LIST] OPERATING_HOURS_ACTIVE', this.OPERATING_HOURS_ACTIVE ) 

        this.getProjectById(this.projectId)
        this.findCurrentProjectAmongAll(this.projectId)
      }
    });
  }

  findCurrentProjectAmongAll(projectId: string) {

    this.projectService.getProjects().subscribe((projects: any) => {
      // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECTS - projects ', projects);
      // const current_selected_prjct = projects.filter(prj => prj.id_project.id === projectId);
      // this.logger.log('[SIDEBAR] - GET PROJECTS - current_selected_prjct ', current_selected_prjct);

      this.current_selected_prjct = projects.find(prj => prj.id_project.id === projectId);
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECTS - current_selected_prjct ', this.current_selected_prjct);

      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECTS - projects ', projects);
    }, error => {
      this.logger.error('[WS-REQUESTS-LIST] - GET PROJECTS - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECTS * COMPLETE * ');
    });
  }


  getProjectById(projectid) {
    this.projectService.getProjectById(projectid).subscribe((project: any) => {
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT BY ID - project: ', project);
      // this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT BY ID - project > settings: ', project.settings);


      if (project && project.activeOperatingHours === true) {
        let operatingHoursObj = JSON.parse(project.operatingHours)
        const operatingHoursSizeObj = Object.keys(operatingHoursObj).length;
        this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT BY ID operatingHoursSizeObj: ', operatingHoursSizeObj);
      }


      if (project && project.settings) {
        if (project.settings.reassignment_on === true) {
          this.CHAT_REASSIGNMENT_IS_ENABLED = true;
          this.reassignment_timeout = project.settings.reassignment_delay
        } else {
          this.CHAT_REASSIGNMENT_IS_ENABLED = false
        }

        if (project.settings.chat_limit_on === true) {
          this.CHAT_LIMIT_IS_ENABLED = true;
          this.maximum_chats = project.settings.max_agent_assigned_chat
        } else {
          this.CHAT_LIMIT_IS_ENABLED = false
        }

        if (project.settings.automatic_unavailable_status_on === true) {
          this.AUTOMATIC_UNAVAILABLE_STAUS_IS_ENABLED = true;
          this.chats_reassigned = project.settings.automatic_idle_chats
        } else {
          this.AUTOMATIC_UNAVAILABLE_STAUS_IS_ENABLED = false
        }

        if (project.settings.current_agent_my_chats_only === true) {
          this.AGENTS_CAN_SEE_ONLY_OWN_CONVS = true;

        } else {
          this.AGENTS_CAN_SEE_ONLY_OWN_CONVS = false
        }

      } else {
        this.CHAT_REASSIGNMENT_IS_ENABLED = false;
        this.CHAT_LIMIT_IS_ENABLED = false;
        this.AUTOMATIC_UNAVAILABLE_STAUS_IS_ENABLED = false;
        this.AGENTS_CAN_SEE_ONLY_OWN_CONVS = false
      }
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT BY ID - project > settings > AGENTS_CAN_SEE_ONLY_OWN_CONVS: ', this.AGENTS_CAN_SEE_ONLY_OWN_CONVS);
    }, error => {
      // this.showSpinner = false;
      this.logger.error('[WS-REQUESTS-LIST] - GET PROJECT BY ID - ERROR', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST] - GET PROJECT BY ID - * COMPLETE *');
      this.getProjectUserRole();
    });
  }

  goToOperatingHours() {
    this.logger.log('[WS-REQUESTS-LIST] HAS CLICKED goToOperatingHours');
    if (this.CURRENT_USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/hours']);
    } else {
      this.presentModalAgentCannotManageAvancedSettings();
    }
  }


  goToProjectSettings_Smartassignment() {
    this.logger.log('[WS-REQUESTS-LIST] HAS CLICKED goToProjectSettings_Smartassignment');

    if (this.CURRENT_USER_ROLE === 'owner') {
      if ((this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) && this.subscription_is_active === true) {

        // this.logger.log('[PRJCT-EDIT-ADD] - HAS CLICKED goToProjectSettings_Smartassignment');
        this.router.navigate(['project/' + this.projectId + '/project-settings/smartassignment']);

      } else if ((this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) && this.subscription_is_active === false) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C, this.subscription_end_date);
      } else if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.presentModalFeautureAvailableOnlyWithPlanC()
      }

    } else {
      this.presentModalAgentCannotManageAvancedSettings()
    }


    // if (this.CURRENT_USER_ROLE !== 'agent') {
    //   this.router.navigate(['project/' + this.projectId + '/project-settings/advanced']);

    // } else if (this.CURRENT_USER_ROLE === 'agent') {
    //   this.presentModalAgentCannotManageAvancedSettings();
    // }
  }

  presentModalFeautureAvailableOnlyWithEnterprisePlan() {
    const el = document.createElement('div')
    el.innerHTML = this.onlyAvailableWithEnterprisePlan
    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      button: {
        text: "OK",
      },
      dangerMode: false,
    })
  }

  presentModalFeautureAvailableOnlyWithPlanC() {
    // const el = document.createElement('div')
    // el.innerHTML = this.cPlanOnly
    Swal.fire({

      title: this.upgradePlan,
      text: this.cPlanOnly,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan,
      cancelButtonText: this.cancelLbl,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,

      // content: el,
      // icon: "info",
      // buttons: {
      //   cancel: this.cancelLbl,
      //   catch: {
      //     text: this.upgradePlan,
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // this.logger.log('featureAvailableFromPlanC value', value)
        if (this.isVisiblePay) {
          if (this.CURRENT_USER_ROLE === 'owner') {
            if (this.prjct_profile_type === 'payment') {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free') {
              this.router.navigate(['project/' + this.projectId + '/pricing']);

            }
          } else {
            this.presentModalAgentCannotManageAvancedSettings();
          }
        } else {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageAdvancedProjectSettings(this.onlyUserWithOwnerRoleCanManageAdvancedProjectSettings, this.learnMoreAboutDefaultRoles)
  }

  // NOT USED 
  presentModalFeatureAvailableWithProPlanUserRoleAdmin() {
    Swal.fire({
      title: this.translate.instant('Warning'),
      text: this.featureIsAvailableWithTheProPlan,
      icon: "info",
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok') ,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
      // button: {
      //   text: "OK",
      // },
      // dangerMode: false,
    })
  }

  // NOT USED 
  presentModalFeatureAvailableWithProPlanUserRoleOwner() {
    swal({
      text: this.featureIsAvailableWithTheProPlan,
      icon: "info",
      buttons: ["Cancel", "Upgrade Plan"],
      dangerMode: false,
    })
      .then((upgradePlan) => {
        if (upgradePlan) {
          this.logger.log('[WS-REQUESTS-LIST] swal upgradePlan', upgradePlan)
          this.router.navigate(['project/' + this.projectId + '/pricing']);

        } else {
          this.logger.log('[WS-REQUESTS-LIST] swal upgradePlan (else)', upgradePlan)
        }
      });
  }

  seeIamAgentRequests(seeIamAgentReq) {
    this.ONLY_MY_REQUESTS = seeIamAgentReq
    if (this.ONLY_MY_REQUESTS === false && this.AGENTS_CAN_SEE_ONLY_OWN_CONVS === true) {
      this.displayAgentsSelect = true
      this.logger.log('[WS-REQUESTS-LIST] - seeIamAgentRequests - displayAgentsSelect ', this.displayAgentsSelect);
    } else if (this.ONLY_MY_REQUESTS === true && this.AGENTS_CAN_SEE_ONLY_OWN_CONVS === true) {

      this.displayAgentsSelect = false
      this.logger.log('[WS-REQUESTS-LIST] - seeIamAgentRequests - displayAgentsSelect ', this.displayAgentsSelect);
    }
    this.logger.log('[WS-REQUESTS-LIST] - seeIamAgentRequests - ONLY_MY_REQUESTS ', this.ONLY_MY_REQUESTS);
    if (seeIamAgentReq === false) {
      this.displayBtnLabelSeeYourRequets = false;
    } else {
      this.displayBtnLabelSeeYourRequets = true;
    }
    this.getWsRequests$()
  }

  goToDept(deptid) {
    this.router.navigate(['project/' + this.projectId + '/department/edit/' + deptid]);
  }

  parseUserAgent(uastring) {
    // https://github.com/faisalman/ua-parser-js
    var parser = new UAParser();
    // var uastring = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36";
    parser.setUA(uastring);
    return parser.getResult();
  }

  hasmeInAgents(agents, wsrequest) {
    // this.logger.log('[WS-REQUESTS-LIST] - hasmeInAgents - AGENTS ', agents, ' IN THE REQUEST ', wsrequest);
    this.logger.log("[WS-REQUESTS-LIST] - hasmeInAgents - currentUserID ", this.currentUserID);
    if (agents) {
      for (let j = 0; j < agents.length; j++) {
        if (this.currentUserID === agents[j].id_user) {
          return true;
        }
      }
    } else {
      this.logger.log("[WS-REQUESTS-LIST] - hasmeInAgents Oops!!!! THERE ARE NOT AGENTS ");
    }
  }

  // this check fix the bug: the request is assigned to a agent or admin od the dept A 
  // the the same requets is reassigned to an agent or admin of the dept B
  // the agent or admin doesn't see the request
  hasmeInParticipants(participants) {
    let iAmThere = false
    participants.forEach(participant => {
      this.logger.log('[WS-REQUESTS-LIST] - hasmeInParticipants - currentUserID', this.currentUserID)
      this.logger.log('[WS-REQUESTS-LIST] - hasmeInParticipants - participant', participant)
      if (participant === this.currentUserID) {
        iAmThere = true;
        return
      }
    });
    this.logger.log('[WS-REQUESTS-LIST] - hasmeInParticipants - iAmThere', iAmThere);
    return iAmThere;

  }

  // DEPTS_LAZY: add this 
  addDeptObject(wsrequests) {
    this.departmentService.getDeptsByProjectIdToPromise().then((_departments: any) => {
      //  this.logger.log('[WS-REQUESTS-LIST] - (DEPTS_LAZY) GET DEPTS BY PROJECT-ID toPromise', _departments);

      wsrequests.forEach(request => {
        if (request.department) {
          const deptHasName = request.department.hasOwnProperty('name')
          if (deptHasName) {

            // this.logger.log('[WS-REQUESTS-LIST] - (DEPTS_LAZY) GET DEPTS BY PROJECT-ID toPromise - REQ DEPT HAS PROPERTY NAME', deptHasName);
            request['dept'] = request.department
          } else {
            this.logger.log('[WS-REQUESTS-LIST] - (DEPTS_LAZY) GET DEPTS BY PROJECT-ID toPromise - REQ DEPT NOT HAS PROPERTY NAME', deptHasName);

            if (request.department.hasOwnProperty('_id')) {
              this.logger.log('[WS-REQUESTS-LIST] - (DEPTS_LAZY) GET DEPTS BY PROJECT-ID toPromise - REQ DEPT HAS PROPERTY ID ', request.department._id, ' - RUN getDeptObj');

              request['dept'] = this.getDeptObj(request.department._id, _departments)

            } else {
              this.logger.log('[WS-REQUESTS-LIST] - (DEPTS_LAZY) GET DEPTS BY PROJECT-ID toPromise - REQ DEPT NOT HAS PROPERTY ID ', request.department._id, ' - RUN getDeptObj');
              // in this case department is a string equivalent to the department id (i.e. department: "5df26badde7e1c001743b63e" )
              request['dept'] = this.getDeptObj(request['department'], _departments)
            }
          }
        }

      });

      this.getDeptsAndCountOfDeptsInRequests(wsrequests);
    });
  }
  // DEPTS_LAZY: add this 
  getDeptObj(departmentid: string, deparments: any) {
    this.logger.log('[WS-REQUESTS-LIST] - (DEPTS_LAZY) getDeptObj departmentid', departmentid)
    const deptObjct = deparments.filter((obj: any) => {
      return obj._id === departmentid;
    });
    return deptObjct[0]
  }

  onChangeDepts() {
    this.hasFiltered = true
    // this.logger.log('% »»» WebSocketJs WF WS-RL - on Change Depts - dept id', this.selectedDeptId);
    this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-DEPTS selectedDeptId', this.selectedDeptId)
    this.filter[0]['deptId'] = this.selectedDeptId

    this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-DEPTS - filter', this.filter)
    this.getWsRequests$();
  }

  clearDeptFilter() {
    this.filter[0]['deptId'] = null;
    this.hasFiltered = false
    this.logger.log('[WS-REQUESTS-LIST] - CLEAR DEPT FILTER - selectedDeptId', this.selectedDeptId)
  }

  onChangeAgent() {
    this.hasFiltered = true;

    this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-AGENT - filter', this.filter)
    this.filter[1]['agentId'] = this.selectedAgentId;

    this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-AGENT - selectedAgentId', this.selectedAgentId)


    if (this.selectedAgentId === 1) {
      this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-AGENT - >> HUMAN Agents Id Array', this.humanAgentsIdArray)
    }

    if (this.selectedAgentId === 2) {
      this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-AGENT - >> BOT Agents Id Array', this.botAgentsIdArray)
    }
    this.getWsRequests$();

  }


  clearAgentFilter() {
    this.filter[1]['agentId'] = null;
    this.hasFiltered = false
    this.logger.log('[WS-REQUESTS-LIST] - CLEAR AGENT FILTER - selectedAgentId', this.selectedAgentId)
  }

  onChangeConversationType() {
    this.hasFiltered = true;

    this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-CONVERSAION-TYPE - filter', this.filter)
    this.filter[2]['conversationTypeId'] = this.selectedConversationTypeId;

    this.logger.log('[WS-REQUESTS-LIST] - ON-CHANGE-AGENT - selectedAgentId', this.selectedConversationTypeId)

    this.getWsRequests$();
  }

  clearConversationTypeFilter() {
    this.filter[2]['conversationTypeId'] = null;
    this.hasFiltered = false
    this.logger.log('[WS-REQUESTS-LIST] - CLEAR CONVERSAION-TYPE FILTER - selectedConversationTypeId', this.selectedConversationTypeId)
  }




  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {
    this.logger.log("[WS-REQUESTS-LIST] - enter NOW in getWsRequests$");
    this.wsRequestsService.wsRequestsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )

      .subscribe((wsrequests) => {
        this.logger.log("[WS-REQUESTS-LIST] - enter subscribe to  getWsRequests$", wsrequests);
        if (wsrequests) {
          this.logger.log("[WS-REQUESTS-LIST] - getWsRequests > if (wsrequests) ", wsrequests);
          this.browserRefresh = browserRefresh;

          if ((this.browserRefresh === false) || (this.browserRefresh === true && this.wsRequestsService.wsRequestsList$.value.length > 0)) {
            if (wsrequests.length > 0) {

              this.SHOW_SIMULATE_REQUEST_BTN = false;
              this.logger.log('[WS-REQUESTS-LIST] - getWsRequests$ (USECASE wsrequests.length > 0) - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN);
              this.showSpinner = false;
              this.logger.log('[WS-REQUESTS-LIST] - getWsRequests$ (USECASE wsrequests.length > 0) - SHOW_SPINNER ', this.showSpinner);


            } else if (wsrequests.length === 0) {
              this.SHOW_SIMULATE_REQUEST_BTN = true;
              this.logger.log('[WS-REQUESTS-LIST] - getWsRequests$ (USECASE wsrequests.length = 0) - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN);
              this.showSpinner = false;
              this.logger.log('[WS-REQUESTS-LIST] - getWsRequests$ (USECASE wsrequests.length = 0) - SHOW_SPINNER ', this.showSpinner);
            }
          }


          if (this.ONLY_MY_REQUESTS === false) {
            this.ws_requests = wsrequests;
            // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- list - ONLY_MY_REQUESTS: ', this.ONLY_MY_REQUESTS, ' - this.ws_requests: ', this.ws_requests)
            this.addDeptObject(this.ws_requests)
          }

          if (this.ONLY_MY_REQUESTS === true && this.AGENTS_CAN_SEE_ONLY_OWN_CONVS === false) {

            this.ws_requests = [];
            wsrequests.forEach(wsrequest => {
              if (wsrequest !== null && wsrequest !== undefined) {
                this.logger.log('[WS-REQUESTS-LIST] - AGENTS_CAN_SEE_ONLY_OWN_CONVS ', this.AGENTS_CAN_SEE_ONLY_OWN_CONVS);
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS ? ', this.ONLY_MY_REQUESTS);
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS - hasmeInAgents ', this.hasmeInAgents(wsrequest.agents, wsrequest));
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS - hasmeInParticipants ', this.hasmeInParticipants(wsrequest.participants))

                if (this.hasmeInAgents(wsrequest.agents, wsrequest) === true || this.hasmeInParticipants(wsrequest.participants) === true) {
                  this.ws_requests.push(wsrequest);
                }
              }
            });
            this.addDeptObject(this.ws_requests)
            // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- list - ONLY_MY_REQUESTS  ', this.ONLY_MY_REQUESTS, 'this.ws_requests', this.ws_requests)
          }

          if (this.ONLY_MY_REQUESTS === true && this.AGENTS_CAN_SEE_ONLY_OWN_CONVS === true) {

            this.ws_requests = [];
            wsrequests.forEach(wsrequest => {
              if (wsrequest !== null && wsrequest !== undefined) {
                this.logger.log('[WS-REQUESTS-LIST] - AGENTS_CAN_SEE_ONLY_OWN_CONVS ', this.AGENTS_CAN_SEE_ONLY_OWN_CONVS);
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS? ', this.ONLY_MY_REQUESTS);
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS ? ', this.ONLY_MY_REQUESTS);
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS - hasmeInAgents ', this.hasmeInAgents(wsrequest.agents, wsrequest));
                this.logger.log('[WS-REQUESTS-LIST] - ONLY_MY_REQUESTS - hasmeInParticipants ', this.hasmeInParticipants(wsrequest.participants))

                if (this.hasmeInParticipants(wsrequest.participants) === true) {
                  this.ws_requests.push(wsrequest);
                }
              }
            });
            this.addDeptObject(this.ws_requests)
            // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- list - ONLY_MY_REQUESTS  ', this.ONLY_MY_REQUESTS, 'this.ws_requests', this.ws_requests)
          }


          this.getParticipantsInRequests(this.ws_requests);
          this.getConversationTypeInRequests(this.ws_requests);

          if (this.hasFiltered === true) {
            this.ws_requests = this.ws_requests.filter(r => {
              // this.logger.log('[WS-REQUESTS-LIST] - request: ', r);
              this.logger.log('[WS-REQUESTS-LIST] - filter: ', this.filter);
              this.logger.log('[WS-REQUESTS-LIST] - filter filter[0]: ', this.filter[0]);
              this.logger.log('[WS-REQUESTS-LIST] - filter filter[1]: ', this.filter[1]);
              this.logger.log('[WS-REQUESTS-LIST] - filter filter[2]: ', this.filter[2]);


              // -----------------------------------------------------------------------------------------------------------------------------------------------------------
              // USECASE: filter only for department
              // -----------------------------------------------------------------------------------------------------------------------------------------------------------
              if (this.filter[0] !== undefined && this.filter[0]['deptId'] !== null && this.filter[1]['agentId'] === null && this.filter[2]['conversationTypeId'] === null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 1 - filter only for department ');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 1 - filter[deptId] ', this.filter[0]['deptId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 1 - r[dept] ', r['dept']);

                if (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId']) {
                  return true
                } else {
                  return false
                }
              }



              // -----------------------------------------------------------------------------------------------------------------------------------------------------------
              // USECASE: filter only for participant
              // -----------------------------------------------------------------------------------------------------------------------------------------------------------
              if (this.filter[1] !== undefined && this.filter[1]['agentId'] !== null && this.filter[0]['deptId'] === null && this.filter[2]['conversationTypeId'] === null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 1 - filter only for participant');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 1 - filter[agentId] ', this.filter[1]['agentId']);

                // -----------------------------------------------------------------------------------------------------------
                // USECASE: filter only for participant --- only all human 
                // -----------------------------------------------------------------------------------------------------------

                if (this.filter[1]['agentId'] === 1) {

                  // note  some is equivalent to r['participants'].includes('5dd278b8989ecd00174f9d6b') || r['participants'].includes('5e05f5c07be85e0017e4fc92') || r['participants'].includes('5ddd30bff0195f0017f72c6d')
                  if (this.humanAgentsIdArray.some(participantid => r['participants'].includes(participantid))) {
                    return true;
                  } else {
                    return false;
                  }


                  // -----------------------------------------------------------------------------------------------------------
                  // USECASE: filter only for participant --- only all bot 
                  // -----------------------------------------------------------------------------------------------------------
                } else if (this.filter[1]['agentId'] === 2) {

                  if (this.botAgentsIdArray.some(participantid => r['participants'].includes(participantid))) {
                    return true;
                  } else {
                    return false;
                  }

                  // -----------------------------------------------------------------------------------------------------------
                  // USECASE: filter only for participant --- only one participant (human or bot)
                  // -----------------------------------------------------------------------------------------------------------
                } else if (r['participants'].includes(this.filter[1]['agentId'])) {
                  return true;
                } else {
                  return false;
                }
              }

              // -----------------------------------------------------------------------------------------------------------------------------------------------------------
              // USECASE: filter only for conversation type
              // -----------------------------------------------------------------------------------------------------------------------------------------------------------
              if (this.filter[2] !== undefined && this.filter[2]['conversationTypeId'] !== null && this.filter[1]['agentId'] === null && this.filter[0]['deptId'] === null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter only for conversation type ');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[conversationTypeId] ', this.filter[2]['conversationTypeId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - [channel][name]] ', r['channel']['name']);

                if (r['channel']['name'] === this.filter[2]['conversationTypeId']) {
                  return true
                } else {
                  return false
                }
              }

              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter for department & participant
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1] !== undefined && this.filter[1]['agentId'] !== null && this.filter[0] !== undefined && this.filter[0]['deptId'] !== null && this.filter[2]['conversationTypeId'] === null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 3 - filter for dept & participant');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[agentId] ', this.filter[1]['agentId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[deptId] ', this.filter[0]['deptId']);

                if (this.filter[1]['agentId'] === 1) {
                  if (this.humanAgentsIdArray.some(participantid => r['participants'].includes(participantid)) && (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId'])) {
                    return true;
                  } else {
                    return false;
                  }

                } else if (this.filter[1]['agentId'] === 2) {
                  if (this.botAgentsIdArray.some(participantid => r['participants'].includes(participantid)) && (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId'])) {
                    return true;
                  } else {
                    return false;
                  }


                } else if (r['participants'].includes(this.filter[1]['agentId']) && (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId'])) {
                  return true;
                } else {
                  return false;
                }

              }



              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter for department &  participant & conversationType 
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1] !== undefined && this.filter[1]['agentId'] !== null && this.filter[0] !== undefined && this.filter[0]['deptId'] !== null && this.filter[2] !== undefined && this.filter[2]['conversationTypeId'] !== null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter for dept & participant & conversationTypeId');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[agentId] ', this.filter[1]['agentId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[deptId] ', this.filter[0]['deptId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[deptId] ', this.filter[2]['conversationTypeId']);

                if (this.filter[1]['agentId'] === 1) {
                  if (this.humanAgentsIdArray.some(participantid => r['participants'].includes(participantid)) && (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId']) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                    return true;
                  } else {
                    return false;
                  }

                } else if (this.filter[1]['agentId'] === 2) {
                  if (this.botAgentsIdArray.some(participantid => r['participants'].includes(participantid)) && (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId']) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                    return true;
                  } else {
                    return false;
                  }


                } else if (r['participants'].includes(this.filter[1]['agentId']) && (r['dept'] && r['dept']['_id'] === this.filter[0]['deptId']) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                  return true;
                } else {
                  return false;
                }

              }

              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter for department & conversationType 
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1]['agentId'] === null && this.filter[0] !== undefined && this.filter[0]['deptId'] !== null && this.filter[2] !== undefined && this.filter[2]['conversationTypeId'] !== null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter for dept &  conversationTypeId');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[agentId] ', this.filter[1]['agentId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[deptId] ', this.filter[0]['deptId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[deptId] ', this.filter[2]['conversationTypeId']);


                if ((r['dept'] && r['dept']['_id'] === this.filter[0]['deptId']) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                  return true;
                } else {
                  return false;
                }

              }



              // -----------------------------------------------------------------------------------------------------------
              // USECASE: filter for participant conversationType
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1] !== undefined && this.filter[1]['agentId'] !== null && this.filter[2] !== undefined && this.filter[2]['conversationTypeId'] !== null && this.filter[0]['deptId'] === null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter for participant conversationType');
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[agentId] ', this.filter[1]['agentId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[deptId] ', this.filter[0]['deptId']);
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE  - filter[conversationTypeId] ', this.filter[2]['conversationTypeId']);

                if (this.filter[1]['agentId'] === 1) {
                  if (this.humanAgentsIdArray.some(participantid => r['participants'].includes(participantid)) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                    return true;
                  } else {
                    return false;
                  }

                } else if (this.filter[1]['agentId'] === 2) {
                  if (this.botAgentsIdArray.some(participantid => r['participants'].includes(participantid)) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                    return true;
                  } else {
                    return false;
                  }


                } else if (r['participants'].includes(this.filter[1]['agentId']) && (r['channel']['name'] === this.filter[2]['conversationTypeId'])) {
                  return true;
                } else {
                  return false;
                }

              }

              // -----------------------------------------------------------------------------------------------------------
              // USECASE: all filters have been canceled
              // -----------------------------------------------------------------------------------------------------------
              if (this.filter[1]['agentId'] === null && this.filter[0]['deptId'] === null && this.filter[2]['conversationTypeId'] === null) {
                this.logger.log('[WS-REQUESTS-LIST] FILTER USECASE 4 - * all filters has been cleared *');
                this.hasFiltered = false
                return true
              }



            });
          }
        }



        this.ws_requests.forEach((request) => {

          // this.logger.log('[WS-REQUESTS-LIST] - request ', request)

          const user_agent_result = this.parseUserAgent(request.userAgent)
          // console.log('[WS-REQUESTS-LIST] - request userAgent - USER-AGENT RESULT ', user_agent_result)

          const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version

          request['ua_browser'] = ua_browser;

          const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version

          request['ua_os'] = ua_os;

          // ------------------------------------------------------------------------------------------
          // for the tooltip on the icon of unserved conversations showing last users who have left the chat
          // ------------------------------------------------------------------------------------------
          if (request.attributes && request.attributes.last_abandoned_by_project_user) {

            this.logger.log('[WS-REQUESTS-LIST] - for the tooltip - request.attributes', request.attributes)
            this.logger.log('[WS-REQUESTS-LIST] - for the tooltip - project_users', this.project_users)

            const project_user_id = request.attributes.last_abandoned_by_project_user;
            this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED project_user_id', project_user_id)

            const users_found_in_storage_by_projectuserid = this.usersLocalDbService.getMemberFromStorage(project_user_id);
            this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED project_users_found_in_storage', users_found_in_storage_by_projectuserid)

            if (users_found_in_storage_by_projectuserid !== null) {
              this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED project_users_found_in_storage 1', users_found_in_storage_by_projectuserid)
              this.createArrayLast_abandoned_by_project_user(users_found_in_storage_by_projectuserid, request)
            } else {

              this.usersService.getProjectUserByProjecUserId(project_user_id)
                .subscribe((projectuser) => {
                  this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED getProjectUserById RES', projectuser)

                  let imgUrl = ''
                  if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
                    imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + projectuser['id_user']._id + "%2Fphoto.jpg?alt=media"
                  } else {
                    imgUrl = this.baseUrl + "images?path=uploads%2Fusers%2F" + projectuser['id_user']._id + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
                    this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED has image ', imgUrl)
                  }
                  this.checkImageExists(imgUrl, (existsImage) => {
                    if (existsImage == true) {
                      projectuser['id_user'].hasImage = true
                    }
                    else {
                      projectuser['id_user'].hasImage = false

                      this.createAgentAvatarInitialsAnfBckgrnd(projectuser['id_user'])
                    }

                    this.usersLocalDbService.saveMembersInStorage(projectuser['id_user']._id, projectuser['id_user'], 'ws-requests-list');
                    this.usersLocalDbService.saveUserInStorageWithProjectUserId(projectuser['_id'], projectuser['id_user']);

                    this.createArrayLast_abandoned_by_project_user(projectuser['id_user'], request);
                  })
                }, error => {
                  // this.showSpinner = false;
                  this.logger.error('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED getProjectUserById - ERROR', error);
                }, () => {
                  this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED getProjectUserById - COMPLETE')
                });
            }
          }

          // ------------------------------------------------------------------------------------------
          // for the tooltip on the icon of unserved conversations showing users who have left the chat
          // ------------------------------------------------------------------------------------------
          if (request.attributes && request.attributes && request.attributes.abandoned_by_project_users) {
            this.other_project_users_that_has_abandoned_array = []
            for (const [key, value] of Object.entries(request.attributes.abandoned_by_project_users)) {
              this.logger.log('[WS-REQUESTS-LIST] - OTHERS PROJECT-USER THAT HAVE ABANDONED key:value ', `${key}: ${value}`);

              if (key !== request.attributes.last_abandoned_by_project_user) {

                const other_project_users_found = this.usersLocalDbService.getMemberFromStorage(key);

                this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED other_project_users_found', other_project_users_found)
                if (other_project_users_found !== null) {
                  this.logger.log('[WS-REQUESTS-LIST] - OTHER PROJECT-USER THAT HAS ABANDONED other_project_users_found 1', other_project_users_found)
                  this.createArrayOther_project_users_that_has_abandoned(other_project_users_found)

                } else {

                  this.usersService.getProjectUserByProjecUserId(key)
                    .subscribe((projectuser) => {
                      this.logger.log('[WS-REQUESTS-LIST] - OTHER PROJECT-USER THAT HAS ABANDONED getProjectUserById RES', projectuser)

                      let imgUrl = ''
                      if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
                        imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + projectuser['id_user']._id + "%2Fphoto.jpg?alt=media"
                      } else {
                        imgUrl = this.baseUrl + "images?path=uploads%2Fusers%2F" + projectuser['id_user']._id + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
                        this.logger.log('[WS-REQUESTS-LIST] - OTHER PROJECT-USER THAT HAS ABANDONED has image ', imgUrl)
                      }
                      this.checkImageExists(imgUrl, (existsImage) => {
                        if (existsImage == true) {
                          projectuser['id_user'].hasImage = true
                        }
                        else {
                          projectuser['id_user'].hasImage = false

                          this.createAgentAvatarInitialsAnfBckgrnd(projectuser['id_user'])
                        }

                        this.usersLocalDbService.saveMembersInStorage(projectuser['id_user']._id, projectuser['id_user'], 'ws-requests-list');
                        this.usersLocalDbService.saveUserInStorageWithProjectUserId(projectuser['_id'], projectuser['id_user']);
                      })

                    }, error => {

                      this.logger.error('[WS-REQUESTS-LIST] - OTHER PROJECT-USER THAT HAS ABANDONED getProjectUserById - ERROR', error);
                    }, () => {
                      this.logger.log('[WS-REQUESTS-LIST] - OTHER PROJECT-USER THAT HAS ABANDONED getProjectUserById - COMPLETE')

                      const _other_project_users_found = this.usersLocalDbService.getMemberFromStorage(key);
                      this.logger.log('[WS-REQUESTS-LIST] - OTHER PROJECT-USER THAT HAS ABANDONED other_project_users_found 2', _other_project_users_found)

                      if (_other_project_users_found) {
                        this.createArrayOther_project_users_that_has_abandoned(_other_project_users_found)
                      }
                    });
                }
                this.logger.log('[WS-REQUESTS-LIST] - LAST PROJECT-USER THAT HAS ABANDONED other_project_users_that_has_abandoned_array', this.other_project_users_that_has_abandoned_array)
                request['attributes']['other_project_users_that_has_abandoned_array'] = this.other_project_users_that_has_abandoned_array
              }
            }
          }

          //  replace this.currentUserID with this.auth.user_bs.value._id  because at the go back from the request's details this.currentUserID at the moment in which is passed in currentUserIdIsInParticipants is undefined 
          request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

          if (request.status === 200) {
            // USE CASE: L'ARRAY new_participants is UNDEFINED e.g. to the page refresh or when the user enter im the page (also when back from the detail) or to the UPDATE
            if (!request['participanting_Agents']) {

              this.logger.log('[WS-REQUESTS-LIST] - PARTICIPATING-AGENTS IS ', request['participanting_Agents'], ' - RUN doParticipatingAgentsArray ');

              request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.imageStorage$, this.UPLOAD_ENGINE_IS_FIREBASE)

            } else {

              this.logger.log('[WS-REQUESTS-LIST] - PARTICIPATING-AGENTS IS DEFINED');
            }
          }

          // if (typeof request.lead === 'object' && request.lead !== null) {
          if (request.lead && request.lead.fullname) {
            request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
            request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
            request['requester_fullname'] = request.lead.fullname;
          } else {
            request['requester_fullname_initial'] = 'N/A';
            request['requester_fullname_fillColour'] = '#6264a7';
            request['requester_fullname'] = 'N/A';
          }
          // } else {
          //   this.logger.log('WS-REQUEST-LIST LEAD ',request.lead);

          // }


          // ------------------------------------------------------------------------------------------------------------
          // !!!! REQUESTER IS VERIFIED - OLD METHOD - No more used
          // ------------------------------------------------------------------------------------------------------------
          //   if (request.lead
          //     && request.lead.attributes
          //     && request.lead.attributes.senderAuthInfo
          //     && request.lead.attributes.senderAuthInfo.authVar
          //     && request.lead.attributes.senderAuthInfo.authVar.token
          //     && request.lead.attributes.senderAuthInfo.authVar.token.firebase
          //     && request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider
          //   ) {
          //     if (request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {

          //       // this.logger.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
          //       request['requester_is_verified'] = true;
          //     } else {
          //       // this.logger.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
          //       request['requester_is_verified'] = false;
          //     }

          //   } else {
          //     request['requester_is_verified'] = false;
          //   }

          // if (request.requester && request.requester.isAuthenticated === true) {
          //   request['requester_is_verified'] = true;
          // } else {
          //   request['requester_is_verified'] = false;
          // }

          // ------------------------------------------------------------------------------------------------------------
          //  to get if the requester is authenticated the 'isAuthenticated' property is obtained from snapshot.requester
          // ------------------------------------------------------------------------------------------------------------
          // if (request.snapshot && request.snapshot.requester && request.snapshot.requester.isAuthenticated) {

          //   if (request.snapshot.requester.isAuthenticated === true) {
          //     request['requester_is_verified'] = true;
          //   } else {
          //     request['requester_is_verified'] = false;
          //   }
          // } else {
          //   request['requester_is_verified'] = false;
          // }

          // -------------------------------------------------------------------------------------------------------------------------------------
          //  REQUESTER IS VERIFIED -  to get if the requester is authenticated the 'isAuthenticated' property is obtained directly from requester
          // -------------------------------------------------------------------------------------------------------------------------------------
          if (request && request.requester && request.requester.isAuthenticated) {

            if (request.requester.isAuthenticated === true) {
              request['requester_is_verified'] = true;
            } else {
              request['requester_is_verified'] = false;
            }
          } else {
            request['requester_is_verified'] = false;
          }
        });


        // -----------------------------------------     
        //  Sort requests
        // ----------------------------------------- 
        if (this.ws_requests) {
  
          // this.logger.log('[WS-REQUESTS-LIST] - getWsRequests - sort requests  * ws_requests *', this.ws_requests);
          this.wsRequestsUnserved = this.ws_requests
            .filter(r => {
              if (r['status'] === 100) {

                return true
              } else {
                return false
              }
            }).sort(function compare(a: Request, b: Request) {
              if (a['createdAt'] > b['createdAt']) {
                return 1;
              }
              if (a['createdAt'] < b['createdAt']) {
                return -1;
              }
              return 0;
            });

          this.wsRequestsServed = this.ws_requests
            .filter(r => {
              if (r['status'] !== 100) {

                return true
              } else {
                return false
              }
            }).sort(function compare(a: Request, b: Request) {
              if (a['createdAt'] > b['createdAt']) {
                return -1;
              }
              if (a['createdAt'] < b['createdAt']) {
                return 1;
              }
              return 0;
            });

        } else {
          // this.showSpinner = false;
        }
        this.logger.log('[WS-REQUESTS-LIST] getWsRequests - served ', this.wsRequestsServed);
        this.logger.log('[WS-REQUESTS-LIST] - getWsRequests - unserved ', this.wsRequestsUnserved);
      

        // const sum = this.wsRequestsServed.length + this.wsRequestsUnserved.length

        //  
        const sum = this.countRequestsServedByHumanRr + this.countRequestsServedByBotRr +  this.countRequestsUnservedRr
        this.served_unserved_sum = sum;
        // this.logger.log('[WS-REQUESTS-LIST] getWsRequests sum SERVED + UNSERVED', this.served_unserved_sum);

        // ---------------------------------------------
        // @ Init dognut chart - to do 
        // ---------------------------------------------
        // this.initRequestsDoughnutChart();

        // this.initStackedBarChart();
        // this.initStackedBarChart_two();

        // var self = this
        // // https://stackoverflow.com/questions/8267857/how-to-wait-until-array-is-filled-asynchronous
        // var isFinished = false;
        // var count = 0 
        // // if (self.wsRequestsServed !== undefined) {
        //   var timeout = setInterval(function () {
        //     count++
        //     this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests$ (served) isFinished ', count);
        //     if (self.checkIfFinished(self.wsRequestsServed)) {
        //       this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests$ (served) isFinished 2', count);
        //       clearInterval(timeout);
        //       isFinished = true;
        //       this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- list getWsRequests$ (served) isFinished ', isFinished, 'wsRequestsServed length ', self.wsRequestsServed.length);
        //     }
        //   }, 100);
        // }

      }, error => {
        this.logger.error('[WS-REQUESTS-LIST] getWsRequests$ - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-LIST] getWsRequests$ */* COMPLETE */*')
      })
  }

  getWsConv$() {
    this.wsRequestsService.wsConv$
      .pipe(throttleTime(5000))
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsConv) => {
        // this.logger.log("[WS-REQUESTS-LIST] - ** wsConv ",  wsConv);
        this.getRestRequestConversationCount()
      
        // this.logger.log("[WS-REQUESTS-LIST] - ** wsConv ",  wsConv);
        //   if (wsConv['status'] === 100) {
        //     this.logger.log('[WS-REQUESTS-MSGS] - countRequestsUnservedRestCall - Rest Request + RT ', this.countRequestsUnservedRr + 1);
        //   }
        //   if (wsConv['status'] !== 100 && wsConv['hasBot'] === false) {
        //     this.logger.log('[WS-REQUESTS-MSGS] - countRequestsServedByHuman - Rest Request + RT ', this.countRequestsServedByHumanRr + 1);
        //   }
        //   if (wsConv['status'] !== 100 && wsConv['hasBot'] === true) {
        //     this.logger.log('[WS-REQUESTS-MSGS] - countRequestsServedByBot - Rest Request + RT ', this.countRequestsServedByBotRr + 1);
        //   }
        
      })

    }


    getRestRequestConversationCount() {
      this.wsRequestsService.getConversationCount()
        .subscribe((requests: any) => {
        // this.logger.log('[WS-REQUESTS-MSGS] - ************* getRestRequestConversationCount - requests  ', requests);
          if (requests) {
            this.requestCountResp = requests
            this.countRequestsServedByHumanRr = requests.assigned;
            this.countRequestsServedByBotRr = requests.bot_assigned;
            this.countRequestsUnservedRr= requests.unassigned;
  
            // this.logger.log('[WS-REQUESTS-MSGS] - countRequestsServedByHumanRestCall ', this.countRequestsServedByHumanRr);
            // this.logger.log('[WS-REQUESTS-MSGS] - countRequestsServedByBotRestCall ', this.countRequestsServedByBotRr);
            // this.logger.log('[WS-REQUESTS-MSGS] - countRequestsUnservedRestCall ', this.countRequestsUnservedRr);
          }
  
        }, (error) => {
      
          this.logger.error('[WS-REQUESTS-MSGS] - getRestRequestConversationCount - ERROR  ', error);
         
        }, () => {
        
          this.logger.log('[WS-REQUESTS-MSGS] -getRestRequestConversationCount * COMPLETE *');
        });
    }

  
  // getWsRequest$() {
  //   this.logger.log("[WS-REQUESTS-LIST] - enter NOW in getWsRequest$");
  //   this.wsRequestsService.wsRequestList$
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //   }

  // checkIfFinished(wsRequestsServed) {
  //   return (wsRequestsServed.length > 0);
  // }


  createArrayLast_abandoned_by_project_user(user, request) {
    let imgUrl = ''
    if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
      imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + user['_id'] + "%2Fphoto.jpg?alt=media"
    } else {
      imgUrl = this.baseUrl + "images?path=uploads%2Fusers%2F" + user['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
    }

    const last_abandoned_by_project_user_array = []
    last_abandoned_by_project_user_array.push(
      {
        _id: user['_id'],
        firstname: user['firstname'],
        lastname: user['lastname'],
        has_image: user['hasImage'],
        img_url: imgUrl,
        fillColour: user['fillColour'],
        fullname_initial: user['fullname_initial']
      }
    )
    request['attributes']['last_abandoned_by_project_user_array'] = last_abandoned_by_project_user_array
  }

  createArrayOther_project_users_that_has_abandoned(other_project_users_found) {

    this.logger.log('[WS-REQUESTS-LIST] createArrayOther_project_users_that_has_abandoned other_project_users_found', other_project_users_found)
    let imgUrl = ''
    if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
      imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + other_project_users_found['_id'] + "%2Fphoto.jpg?alt=media"
    } else {
      imgUrl = this.baseUrl + "images?path=uploads%2Fusers%2F" + other_project_users_found['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
    }

    this.other_project_users_that_has_abandoned_array.push(
      {
        _id: other_project_users_found['_id'],
        firstname: other_project_users_found['firstname'],
        lastname: other_project_users_found['lastname'],
        has_image: other_project_users_found['hasImage'],
        img_url: imgUrl,
        fillColour: other_project_users_found['fillColour'],
        fullname_initial: other_project_users_found['fullname_initial']
      }
    )
  }


  // SEEMS NOT USED 
  replace_recipient(request_recipient: string) {
    if (request_recipient) {
      return request_recipient.replace('support-group-', '');
    }
  }


  testWidgetPage() {
    this.testwidgetbtnRef.nativeElement.blur();
    // const url = 'http://support.tiledesk.com/testsite/?projectid=' + this.projectId;
    // + '&projectname=' + this.projectName
    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + ' &projectid=' + this.projectId
    // '&isOpen=true'
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.projectId + '&project_name=' + encodeURIComponent(this.projectName) + '&role=' + this.CURRENT_USER_ROLE
    // + '&prechatform=' + false + '&callout_timer=' + false + '&align=right';
    window.open(url, '_blank');
  }



  presentCreateInternalRequestModal() {
    this.selectedPriority = this.priority[2].name;
    this.displayInternalRequestModal = 'block'
    this.hasClickedCreateNewInternalRequest = false;
    this.projectUserBotsAndDeptsArray = [];
    this.projectUserAndLeadsArray = [];
    this.newTicketRequestId = null;
    this.getProjectUsersAndContacts();
    this.getProjectUserBotsAndDepts();

  }

  closeInternalRequestModal() {
    this.displayInternalRequestModal = 'none'
    this.hasClickedCreateNewInternalRequest = false
    this.resetCreateInternalRequest()

  }

  createNewInternalRequest() {
    this.hasClickedCreateNewInternalRequest = true
    this.showSpinner_createInternalRequest = true


    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - internalRequest_message ', this.internalRequest_message);
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - assignee_dept_id ', this.assignee_dept_id);
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - assignee_participants_id ', this.assignee_participants_id);
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - internalRequest_subject', this.internalRequest_subject);

    const uiid = uuid.v4();
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - uiid', uiid);
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - uiid typeof', typeof uiid);
    const uiid_no_dashes = uiid.replace(/-/g, "");;
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - uiid_no_dash', uiid_no_dashes);
    // Note: the request id must be in the form "support-group-" + "-" + "project_id" + "uid" <- uid without dash
    // this.logger.log('% WsRequestsList createTicket - UUID', uiid);
    this.internal_request_id = 'support-group-' + this.project_id + '-' + uiid_no_dashes
    this.logger.log('[WS-REQUESTS-LIST] create internalRequest - internal_request_id', this.internal_request_id);
    // (request_id:string, subject: string, message:string, departmentid: string)
    this.wsRequestsService.createInternalRequest(this.selectedRequester,
      this.internal_request_id,
      this.internalRequest_subject,
      this.internalRequest_message,
      this.assignee_dept_id,
      this.assignee_participants_id,
      this.selectedPriority
    ).subscribe((newticket: any) => {
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest - RES ', newticket);
      this.newTicketRequestId = newticket.recipient
      this.logger.log('[WS-REQUESTS-LIST] create newTicketRequestId  ', this.newTicketRequestId);

    }, error => {
      this.showSpinner_createInternalRequest = false;
      this.createNewInternalRequest_hasError = true
      this.logger.error('[WS-REQUESTS-LIST] create internalRequest  - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST] create internalRequest * COMPLETE *')
      this.showSpinner_createInternalRequest = false;
      this.createNewInternalRequest_hasError = false;
      this.wsRequestsService.updateRequestWorkingStatus(this.newTicketRequestId, 'new')
        .subscribe((request) => {

          this.logger.log('[WS-REQUESTS-MSGS] - create internalRequest WORKING STATUS ', request);
        }, (error) => {
          this.logger.error('[WS-REQUESTS-MSGS] - create internalRequest WORKING STATUS - ERROR ', error);

        }, () => {
          this.logger.log('[WS-REQUESTS-MSGS] - create internalRequestT WORKING STATUS  * COMPLETE');
        });
    });
  }

  // NOT MORE USED  - REPLACED WITH goToInternalRequestDetails
  openTheChaForInternalRequest() {
    this.displayInternalRequestModal = 'none'
    // + '?recipient=' + this.internal_request_id;
    const url = this.CHAT_BASE_URL
    window.open(url, '_blank');

    this.resetCreateInternalRequest();
  }


  goToInternalRequestDetails() {
    this.logger.log("[WS-REQUESTS-LIST] goToInternalRequestDetails")
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + this.internal_request_id + '/messages']);

    this.resetCreateInternalRequest();
  }

  resetCreateInternalRequest() {
    this.hasClickedCreateNewInternalRequest = false
    this.showSpinner_createInternalRequest = false
    this.createNewInternalRequest_hasError = null;
    this.internalRequest_message = undefined;
    this.assignee_dept_id = undefined;
    this.assignee_participants_id = undefined;
    this.internalRequest_subject = undefined;
    this.assignee_id = undefined;
    this.selectedRequester = undefined;
    this.id_for_view_requeter_dtls = undefined;

  }


  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[WS-REQUESTS-LIST] - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments
    }, error => {
      this.logger.error('[WS-REQUESTS-LIST] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST] - GET DEPTS * COMPLETE *')
    });
  }

  selectedAssignee() {
    this.logger.log('[WS-REQUESTS-LIST] - SELECT ASSIGNEE: ', this.assignee_id);
    this.logger.log('[WS-REQUESTS-LIST] - DEPTS: ', this.departments);

    const hasFound = this.departments.filter((obj: any) => {
      return obj.id === this.assignee_id;
    });

    this.logger.log("[WS-REQUESTS-LIST] - SELECT ASSIGNEE HAS FOUND IN DEPTS: ", hasFound);

    if (hasFound.length === 0) {
      this.logger.log("[WS-REQUESTS-LIST] - SELECT ASSIGNEE NOT HAS FOUND IN DEPTS: ", hasFound);
      this.assignee_dept_id = undefined
      this.assignee_participants_id = this.assignee_id
    } else {

      this.assignee_dept_id = this.assignee_id
      this.assignee_participants_id = undefined
    }
  }

  onChangeSelectedPriority(selectedPriority) {
    this.logger.log('[WS-REQUESTS-LIST] onChangeSelectedPriority selectedPriority ', selectedPriority)
    this.selectedPriority = selectedPriority;
  }



  // used nella select requester OF CREATE TICKET
  selectRequester($event) {
    this.logger.log('[WS-REQUESTS-LIST] - SELECT REQUESTER ID', this.selectedRequester);
    this.logger.log('[CREATE-TICKET] - SELECT REQUESTER $event requester_id ', $event.requester_id)
    this.logger.log('[CREATE-TICKET] - SELECT REQUESTER $event requestertype ', $event.requestertype)

    this.id_for_view_requeter_dtls = $event.requester_id
    this.requester_type = $event.requestertype

    //   const hasFound = this.projectUserAndLeadsArray.filter((obj: any) => {

    //     return obj.id === this.selectedRequester;

    //   });

    //  this.logger.log('[WS-REQUESTS-LIST] - hasFound REQUESTER ', hasFound);

    //   if (hasFound.length > 0)

    //     this.id_for_view_requeter_dtls = hasFound[0]['requester_id'],
    //       this.logger.log('[WS-REQUESTS-LIST] - hasFound REQUESTER id_for_view_requeter_dtls', this.id_for_view_requeter_dtls);

    //   if (hasFound[0]['requestertype'] === "agent") {

    //     this.requester_type = "agent"
    //     this.logger.log('[WS-REQUESTS-LIST] - hasFound REQUESTER requester_type', this.requester_type);
    //   } else {
    //     this.requester_type = "lead"
    //     this.logger.log('[WS-REQUESTS-LIST] - hasFound REQUESTER requester_type', this.requester_type);
    //   }
  }

  openRequesterDetails() {
    // this.logger.log('[WS-REQUESTS-LIST] - OPEN REQUESTER DTLS - selectedRequester ',this.selectedRequester) 
    // this.logger.log('[WS-REQUESTS-LIST] - OPEN REQUESTER DTLS - requester_type ',this.requester_type) 
    // this.logger.log('[WS-REQUESTS-LIST] - OPEN REQUESTER DTLS - id_for_view_requeter_dtls ',this.id_for_view_requeter_dtls) 
    if (this.selectedRequester) {
      if (this.requester_type === "agent") {
        // this.router.navigate(['project/' + this.projectId + '/user/edit/' + this.id_for_view_requeter_dtls]);
        this.logger.log('[WS-REQUESTS-LIST] - hasFound go to ', this.requester_type, ' details')

        const url = this.router.createUrlTree(['project/' + this.projectId + '/user/edit', this.id_for_view_requeter_dtls])
        this.logger.log('[WS-REQUESTS-LIST] - hasFound go to url', url);
        this.logger.log('[WS-REQUESTS-LIST] - hasFound go to url.toString()', url.toString());
        window.open('#' + url.toString(), '_blank');

      } else if (this.requester_type === "lead") {
        // this.router.navigate(['project/' + this.projectId + '/contact', this.id_for_view_requeter_dtls]);
        this.logger.log('[WS-REQUESTS-LIST] - hasFound  go to ', this.requester_type, ' details')

        const url = this.router.createUrlTree(['project/' + this.projectId + '/contact', this.id_for_view_requeter_dtls])
        this.logger.log('[WS-REQUESTS-LIST] - hasFound go to url.toString()', url.toString());
        window.open('#' + url.toString(), '_blank');
      }
    }
  }

  presentModalAddNewRequester() {
    this.logger.log('[WS-REQUESTS-LIST] - open modal presentModalAddNewRequester ');
    this.new_requester_email_is_valid = false;
    this.displayCreateNewUserModal = 'block'
    this.displayInternalRequestModal = 'none'
    this.new_user_name = undefined;
    this.new_user_email = undefined;
    this.HAS_CLICKED_CREATE_NEW_LEAD = false
    this.HAS_COMPLETED_CREATE_NEW_LEAD = false
    this.id_for_view_requeter_dtls = undefined;
    this.requester_type = undefined;
  }

  closeCreateNewUserModal() {
    this.displayCreateNewUserModal = 'none'
    this.displayInternalRequestModal = 'block'
  }


  createProjectUserAndThenNewLead() {
    this.HAS_CLICKED_CREATE_NEW_LEAD = true;
    this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER name ', this.new_user_name);
    this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER email ', this.new_user_email);


    this.contactsService.createNewProjectUserToGetNewLeadID().subscribe(res => {
      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER ', res);
      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER UUID ', res['uuid_user']);
      if (res) {
        if (res['uuid_user']) {
          let new_lead_id = res['uuid_user']
          this.createNewContact(new_lead_id, this.new_user_name, this.new_user_email)
        }
      }
    }, error => {

      this.logger.error('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER - ERROR: ', error);
    }, () => {

      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-PROJECT-USER - COMPLETE');
    });
  }


  createNewContact(lead_id: string, lead_name: string, lead_email: string) {
    this.contactsService.createNewLead(lead_id, lead_name, lead_email).subscribe(lead => {
      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD -  RES ', lead);
      this.projectUserAndLeadsArray.push({ id: lead['lead_id'], name: lead['fullname'], role: 'lead', email: lead_email, requestertype: 'lead', requester_id: lead['_id'] });
      // this.projectUserAndLeadsArray.push({ id: lead.lead_id, name: lead.fullname + ' (lead)' });

      this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0);
      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD projectUserAndLeadsArray after PUSH', this.projectUserAndLeadsArray)
      this.id_for_view_requeter_dtls = lead['_id'];
      this.requester_type = "lead";
    }, error => {
      this.logger.error('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD - ERROR: ', error);
    }, () => {
      this.HAS_COMPLETED_CREATE_NEW_LEAD = true;
      // -------------------------------------------------
      // When is cmpleted the creation of the new reqester
      // -------------------------------------------------
      this.displayCreateNewUserModal = 'none'
      this.displayInternalRequestModal = 'block'

      // Auto select the new lead crerated in the select Requester
      this.selectedRequester = lead_id

      this.notify.showWidgetStyleUpdateNotification(this.newRequesterCreatedSuccessfullyMsg, 2, 'done');

      this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD * COMPLETE *');
    });
  }

  onChangeNewRequesterEmail($event) {
    this.logger.log('[WS-REQUESTS-LIST]- CREATE-NEW-USER - CREATE-NEW-LEAD ON CHANGE EMAIL: ', $event);
    this.new_requester_email_is_valid = this.validateEmail($event)
    this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD ON CHANGE EMAIL - EMAIL IS VALID ', this.new_requester_email_is_valid);
  }

  validateEmail(mail) {
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
      return (true)
    }
    this.logger.log('[WS-REQUESTS-LIST] - CREATE-NEW-USER - CREATE-NEW-LEAD - validateEmail - You have entered an invalid email address! ');
    return (false)
  }


  // https://www.freakyjolly.com/ng-select-multiple-property-search-using-custom-filter-function/#.YDEDaJP0l7g
  // https://stackblitz.com/edit/so-angular-ng-select-searchfunc?file=app%2Fapp.component.ts
  customSearchFn(term: string, item: any) {
    // this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - customSearchFn term : ', term);

    term = term.toLocaleLowerCase();
    // this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - customSearchFn item : ', item);

    // this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - customSearchFn item.name.toLocaleLowerCase().indexOf(term) : ', item.name.toLocaleLowerCase().indexOf(term) > -1);

    return item.name.toLocaleLowerCase().indexOf(term) > -1 || item.email.toLocaleLowerCase().indexOf(term) > -1;
  }

  // Create an array of project user & conatct when is opened the modal create ticket
  getProjectUsersAndContacts() {
    this.loadingRequesters = true;
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const leads = this.contactsService.getAllLeadsActiveWithLimit(10000);


    zip(projectUsers, leads, (_projectUsers: any, _leads: any) => ({ _projectUsers, _leads }))
      .subscribe(pair => {
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - LEADS RES: ', pair._leads);
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - LEADS: ', pair._leads['leads']);

        if (pair && pair._projectUsers) {
          pair._projectUsers.forEach(p_user => {
            this.projectUserAndLeadsArray.push({ id: p_user.id_user._id, name: p_user.id_user.firstname + ' ' + p_user.id_user.lastname, role: p_user.role, email: p_user.id_user.email, requestertype: 'agent', requester_id: p_user._id });
          });
        }

        if (pair && pair._leads['leads']) {
          pair._leads.leads.forEach(lead => {

            let e_mail = 'N/A'
            if (lead.email) {
              e_mail = lead.email
            }
            this.projectUserAndLeadsArray.push({ id: lead.lead_id, name: lead.fullname, role: 'lead', email: e_mail, requestertype: 'lead', requester_id: lead._id });
          });
        }

        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS - PROJECT-USER-&-LEAD-ARRAY: ', this.projectUserAndLeadsArray);

        this.projectUserAndLeadsArray = this.projectUserAndLeadsArray.slice(0);

      }, error => {
        this.loadingRequesters = false;
        this.logger.error('[WS-REQUESTS-LIST]- GET P-USERS-&-LEADS - ERROR: ', error);
      }, () => {
        this.loadingRequesters = false;
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-LEADS * COMPLETE *');
      });

  }

  getProjectUserBotsAndDepts() {
    this.loadingAssignee = true;
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();
    const depts = this.departmentService.getDeptsByProjectId();


    zip(projectUsers, bots, depts, (_projectUsers: any, _bots: any, _depts: any) => ({ _projectUsers, _bots, _depts }))
      .subscribe(pair => {
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-BOTS-&-DEPTS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-BOTS-&-DEPTS - BOTS : ', pair._bots);
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-BOTS-&-DEPTS - DEPTS: ', pair._depts);

        // projectUserAndLeadsArray

        if (pair && pair._projectUsers) {
          pair._projectUsers.forEach(p_user => {
            this.projectUserBotsAndDeptsArray.push({ id: p_user.id_user._id, name: p_user.id_user.firstname + ' ' + p_user.id_user.lastname + ' (' + p_user.role + ')' });
          });
        }

        if (pair && pair._bots) {
          pair._bots.forEach(bot => {
            if (bot['trashed'] === false && bot['type'] !== "identity") {
              this.projectUserBotsAndDeptsArray.push({ id: 'bot_' + bot._id, name: bot.name + ' (bot)' })
            }
          });
        }

        if (pair && pair._depts) {
          pair._depts.forEach(dept => {
            this.projectUserBotsAndDeptsArray.push({ id: dept._id, name: dept.name + ' (dept)' })
          });
        }

        this.projectUserBotsAndDeptsArray = this.projectUserBotsAndDeptsArray.slice(0);
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-BOTS-&-DEPTS ARRAY: ', this.projectUserBotsAndDeptsArray);
      }, error => {
        this.loadingAssignee = false;
        this.logger.error('[WS-REQUESTS-LIST] - GET P-USERS-&-BOTS-&-DEPTS - ERROR: ', error);
      }, () => {
        this.loadingAssignee = false;
        this.logger.log('[WS-REQUESTS-LIST] - GET P-USERS-&-BOTS-&-DEPTS * COMPLETE *');
      });

  }


  // ----------------------------------------
  // TODO: StackedBar CHART 2
  // ----------------------------------------
  // initStackedBarChart_two() {
  //   var config = {
  //     type: 'horizontalBar',
  //     data: {
  //       labels: ['Conversations'],
  //       datasets: [{
  //         label: "Assigned",
  //         backgroundColor: "#05BDD4",
  //         // hoverBackgroundColor: "rgba(154,178,96,1)",
  //         data: [this.wsRequestsServed.length],
  //       }, {
  //         label: "Unassigned",
  //         backgroundColor: "#ED4537",
  //         // hoverBackgroundColor: "rgba(197,213,167,1)",
  //         data: [this.wsRequestsUnserved.length]
  //       }]
  //     },
  //     options: {
  //       scales: {
  //         xAxes: [{
  //           stacked: true
  //         }],
  //         yAxes: [{
  //           stacked: true
  //         }]
  //       }
  //     }
  //   };

  //   const canvas = <HTMLCanvasElement>document.getElementById('stackedbarChart');
  //   const ctx = canvas.getContext('2d');
  //   // var ctx =  <HTMLCanvasElement> document.getElementById("stackedbarChart").getContext("2d");;
  //   new Chart(ctx, config);
  // }

  // ----------------------------------------
  // TODO: StackedBar
  // ----------------------------------------
  // initStackedBarChart() {
  //   var ctx = document.getElementById("stackedbarChart");
  //   var myChart = new Chart(ctx, {
  //     type: 'horizontalBar',
  //     data: {
  //       // labels: ["2014", "2013", "2012", "2011"],

  //       datasets: [{
  //         label: "Dataset 1",
  //         data: [this.wsRequestsServed.length,],
  //         backgroundColor: "rgba(63,103,126,1)",
  //         hoverBackgroundColor: "rgba(50,90,100,1)"
  //       }, {
  //         label: "Unassigned",
  //         data: [this.wsRequestsUnserved.length],
  //         backgroundColor: "rgba(163,103,126,1)",
  //         hoverBackgroundColor: "rgba(140,85,100,1)"
  //       }]
  //     },

  //     options: {
  //       tooltips: {
  //         enabled: true
  //       },
  //       hover: {
  //         animationDuration: 0
  //       },
  //       scales: {
  //         xAxes: [{
  //           ticks: {
  //             beginAtZero: true,
  //             fontFamily: "'Open Sans Bold', sans-serif",
  //             fontSize: 11
  //           },
  //           scaleLabel: {
  //             display: false
  //           },
  //           gridLines: {
  //           },
  //           stacked: true
  //         }],
  //         yAxes: [{
  //           gridLines: {
  //             display: false,
  //             color: "#fff",
  //             zeroLineColor: "#fff",
  //             zeroLineWidth: 0
  //           },
  //           ticks: {
  //             fontFamily: "'Open Sans Bold', sans-serif",
  //             fontSize: 11
  //           },
  //           stacked: true
  //         }]
  //       },
  //       legend: {
  //         display: false
  //       }

  //     }
  //   });
  // }



  // ----------------------------------------
  // TODO: Doughnut chart
  // ----------------------------------------
  // initRequestsDoughnutChart() {
  //   var myDoughnutChart = new Chart('doughnutChart', {
  //     type: 'doughnut',
  //     data: {
  //       labels: ["Assigned", "Unassigned"],
  //       datasets: [
  //         {

  //           backgroundColor: ["#05BDD4", "#ED4537"],
  //           data: [this.wsRequestsServed.length, this.wsRequestsUnserved.length]
  //         }
  //       ]
  //     },

  //     options: {
  //       aspectRatio: 1,
  //       cutoutPercentage: 60,
  //       legend: {
  //         display: false,
  //       },
  //       title: {
  //         display: false,
  //         text: 'Requests'
  //       }
  //     }
  //   });
  // }


  // _getWsRequests$() {
  //   this.wsRequestsService.messages.subscribe((websocketResponse) => {

  //     if (websocketResponse) {
  //       this.logger.log('% WsRequestsList getWsRequests$websocket Response', websocketResponse)

  //       const wsRequests = websocketResponse['payload']['message']
  //       this.logger.log('% WsRequestsList getWsRequests$websocket Requests (all)', wsRequests);

  //       this.wsRequestsUnserved = wsRequests
  //         .filter(r => {
  //           if (r['status'] === 100) {

  //             return true
  //           } else {
  //             return false
  //           }
  //         }).sort(function compare(a: Request, b: Request) {
  //           if (a['createdAt'] > b['createdAt']) {
  //             return 1;
  //           }
  //           if (a['createdAt'] < b['createdAt']) {
  //             return -1;
  //           }
  //           return 0;
  //         });

  //       this.wsRequestsServed = wsRequests
  //         .filter(r => {
  //           if (r['status'] !== 100) {

  //             return true
  //           } else {
  //             return false
  //           }
  //         });
  //     }

  //     this.logger.log('% WsRequestsList getWsRequests$ (served)', this.wsRequestsServed);
  //     this.logger.log('% WsRequestsList getWsRequests$ (unserved)', this.wsRequestsUnserved);

  //   }, error => {
  //     this.logger.error('% WsRequestsList getWsRequests$ * error * ', error)
  //   });
  // }

}



