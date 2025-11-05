import { CHANNELS_NAME, checkAcceptedFile, formatBytesWithDecimal, isValidEmail } from './../../utils/util';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy, Input, OnChanges, SimpleChanges, isDevMode } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { WsMsgsService } from '../../services/websocket/ws-msgs.service';
import { Location } from '@angular/common';
import { LocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';
import { AppConfigService } from '../../services/app-config.service';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DepartmentService } from '../../services/department.service';
import { GroupService } from '../../services/group.service';
import { zip } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { TranslateService } from '@ngx-translate/core';
import { TagsService } from '../../services/tags.service';

import { UAParser } from 'ua-parser-js';
import { ContactsService } from '../../services/contacts.service';
import { APP_SUMO_PLAN_NAME, avatarPlaceholder, getColorBck, goToCDSVersion, PLAN_NAME } from '../../utils/util';
import { LoggerService } from '../../services/logger/logger.service';

import 'firebase/database';
import { ProjectService } from 'app/services/project.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AppStoreService } from 'app/services/app-store.service';
import moment from 'moment';

import { UploadImageService } from 'app/services/upload-image.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { TooltipOptions } from 'ng2-tooltip-directive';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { MatDialog } from '@angular/material/dialog';
import { UpgradePlanModalComponent } from 'app/components/modals/upgrade-plan-modal/upgrade-plan-modal.component';
import { BrandService } from 'app/services/brand.service';
import { ModalChatbotNameComponent } from 'app/knowledge-bases/modals/modal-chatbot-name/modal-chatbot-name.component';
import { ModalChatbotReassignmentComponent } from './modal-chatbot-reassignment/modal-chatbot-reassignment.component';
import { FaqService } from 'app/services/faq.service';
import { Chatbot } from 'app/models/faq_kb-model';
import { CacheService } from 'app/services/cache.service';
import { ImagePreviewModalComponent } from './image-preview-modal/image-preview-modal.component';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { RoleService } from 'app/services/role.service';
import { isOnlyEmoji, removeEmojis } from 'app/utils/utils-message';

const swal = require('sweetalert');
const Swal = require('sweetalert2')
// './ws-requests-msgs.component.html',
@Component({
  selector: 'appdashboard-ws-requests-msgs',
  templateUrl: './ws-requests-msgs.component.html',
  styleUrls: ['./ws-requests-msgs.component.scss']
})
export class WsRequestsMsgsComponent extends WsSharedComponent implements OnInit, OnDestroy, AfterViewInit {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;
  upgradePlan: string;
  currentUserIsInParticipants: any

  objectKeys = Object.keys;
  isVisiblePaymentTab: boolean;
  overridePay: boolean;
  @ViewChild('scrollMe', { static: false })
  private myScrollContainer: ElementRef;

  @ViewChild('navbarBrand', { static: false })
  private navbarBrand: ElementRef;

  @ViewChild('openChatBtn', { static: false })
  private openChatBtn: ElementRef;

  @ViewChild('sendMessageTexarea', { static: false }) sendMessageTexarea: ElementRef;

  @ViewChild('Selecter', { static: false }) ngselect: NgSelectComponent;
  
  @ViewChild('selecttagcombobox', { static: false }) selecttagcombobox: NgSelectComponent;
  // @ViewChild(NgSelectComponent, { static: false }) ngSelect: NgSelectComponent
  @ViewChild('ngSelect') ngSelect!: any;


  @ViewChild('fileUpload', { static: false }) fileUpload: any;

  @ViewChild('editFullnameDropdown', { static: false }) editFullnameDropdown: ElementRef;


  SERVER_BASE_PATH: string;
  CHAT_BASE_URL: string;

  // messagesList: WsMessage[] = [];
  messagesList: any;
  showSpinner = true;
  showViewedPages: boolean = false;
  showTicketAdvanced: boolean = false;
  ipAddress: string;
  // showSpinner = false;
  showSpinner_inModalUserList = true;
  id_project: string;

  IS_CURRENT_USER_JOINED: boolean;
  HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
  SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
  JOIN_TO_GROUP_HAS_ERROR = false;

  IS_CURRENT_USER_AGENT: boolean; // Not yet used

  firebase_token: any;
  currentUserID: string;
  request: any;
  requester_fullname: string;
  requester_id: string;
  user_name: string;
  user_email: string;
  logged_user_fullname: string;
  department_name: string;
  department_id: string;

  rating: string; // Not yet used
  rating_message: string; // Not yet used

  displayBtnScrollToBottom = 'none';
  displayArchiveRequestModal = 'none';
  displayConfirmReassignmentModal = 'none';
  displayDeptConfirmReassignmentModal = 'none';
  id_request_to_archive: string;
  SHOW_CIRCULAR_SPINNER = false;
  displayArchivingInfoModal = 'none';
  ARCHIVE_REQUEST_ERROR = false;
  LEAVE_CHAT_ERROR = false;
  newInnerWidth: any;
  newInnerHeight: any;
  users_list_modal_height: any
  main_content_height: any
  windowWidth: any;
  displayUsersListModal = 'none'
  displayLeaveChatModal = 'none'
  displayLeavingChatInfoModal = 'none'
  projectUsersList: any;
  userid_selected: string;
  userfirstname_selected: string;
  deptid_selected: string;
  deptname_selected: string;
  userlastname_selected: string;
  useremail_selected: string;
  REQUESTER_IS_VERIFIED = false;
  isMobile: boolean;
  action: any // used in template
  actionInModal: string;
  REQUESTER_IS_ONLINE = false;

  contact_id: string; // Not yet used
  NODEJS_REQUEST_CNTCT_FOUND: boolean;
  OPEN_RIGHT_SIDEBAR: boolean = false;
  OPEN_APPS_RIGHT_SIDEBAR: boolean = false;
  selectedQuestion: string;

  id_request: string;

  train_bot_sidebar_height: any;
  apps_sidebar_height: any;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  // isSubscribedToMsgs = false;
  clientStringCutted: string;
  showAllClientString = false;

  senderAuthInfoString: string;
  senderAuthInfoStringCutted: string;
  showAllsenderAuthInfoString = false;

  showAllSourcePageString = false;
  showAllIdRequest = false;
  sourcePage: string;
  sourcePageCutted: string;
  requestidCutted: string;
  departments: any;
  bots: any;
  subscribe: Subscription;
  bot_participant_id: string;
  selected_bot_id: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  viewedPages = [];
  timeout: any;

  attributesArray: Array<any>;
  attributesDecodedJWTArray: Array<any>
  attributesDecodedJWTAttributesArray: Array<any>
  attributesDecodedJWTArrayMerged: Array<any>
  preChatFormArray: Array<any>;
  botConversationArray: Array<any>;
  rightSidebarWidth: number;
  tag: any;
  tagcolor: any;
  tagsArray: Array<any>
  diplayAddTagInput = false;


  tagsList: Array<any>;
  typeALabelAndPressEnter: string;
  loadingTags: boolean;

  new_note: string;
  notesArray: Array<any>;
  displayModalDeleteNote = 'none';
  id_note_to_delete: string;
  main_panel_scrolltop: any;
  topPos: any;

  showSpinnerInAddNoteBtn: boolean = false;
  subscription: Subscription;
  CURRENT_USER_ROLE: any;

  CHAT_PANEL_MODE: boolean  // = true; // Nikola for test change color
  dshbrdBaseUrl: string;
  project_name: string;

  DISABLE_ADD_NOTE_AND_TAGS = false;
  DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = false;

  isVisibleLBS: boolean;
  isVisibleAPP: boolean;
  public_Key: string;

  DISPLAY_BTN_CREATE_JIRA_ISSUE: boolean
  jira_issue_types: any
  selectedJiraType: number;



  COUNT_OF_VISIBLE_DEPT: number;

  ALL_MSG_LENGTH: number;

  urls: any = /(\b(https?|http|ftp|ftps|Https|rtsp|Rtsp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim; // Find/Replace URL's in text  
  emails: any = /(\S+@\S+\.\S+)/gim; // Find/Replace email addresses in text
  FIREBASE_AUTH: boolean;
  browserLang: string;
  // = this.priority[2].name;
  selectedPriority: any;
  current_selected_prjct: any;
  imageStorage: any;
  tag_name: string;
  tag_selected_color = '#43B1F2';
  tag_new_selected_color: string;
  isChromeVerGreaterThan100: boolean;
  DISPLAY_EDIT_FULLNAME_ICON: boolean = false
  contactNewFirstName: string;
  contactNewLastName: string;
  contactNewEmail: string;
  EMAIL_IS_VALID: boolean = true
  chat_message: string;

  // for accordion Contact conversations
  contact_requests: any
  pageNo = 0;
  totalPagesNo_roundToUp: number;
  displaysFooterPagination: boolean;
  // HAS_OPENED_APPS: boolean = false;
  selectedResponseTypeID: number = 1;
  imageViewerModal: any;
  locationCity: string;
  locationCountry: string;
  locationLat: string;
  locationLng: string;

  OPEN_MAP_RIGHT_SIDEBAR: boolean = false
  conv_detail_map_sidebar_height: any;
  wsRequestsUnserved: any;
  wsRequestsServed: any;
  imageStorage$: string;
  calling_page: string = "conv_details"

  projectTeammates: any
  allProjectUsers: any
  hasClickedFollow: boolean = false;
  selected: any
  selectedFollowers: any
  followers: Array<any> = []
  CURRENT_USER_IS_A_FOLLOWER: boolean = false;
  displayModalTranscript: string = 'none'
  transcriptDwnldPreference: string;

  resolutionBotCount: number;
  previousUrl: string;
  hasSearchedBy: string;
  isOpenedAdvancedSearch: string;
  selectedDept: string;
  queryParams: any;
  ticketSubjectEditMode: boolean = false;
  ticketSubject: string;

  bannedVisitorsArray: Array<any>;
  visitorIsBanned: boolean = false;
  uploadedFiles: File;
  fileUploadAccept: string;
  uploadNativeAttachmentError: boolean = false;

  metadata: any;
  imgWidth: number;
  imgHeight: number;
  type: string;
  showSpinnerAttachmentUplolad: boolean = false

  existAnAttacment: boolean = false;
  HAS_SELECTED_SEND_AS_OPENED: boolean = true;
  HAS_SELECTED_SEND_AS_PENDING: boolean = false;
  HAS_SELECTED_SEND_AS_SOLVED: boolean = false;


  is0penDropDown = false
  isOpen: boolean;

  selected_sidebar_tab: boolean;
  tab0: boolean = true;
  tab1: boolean = false;
  tab2: boolean = false;
  tab3: boolean = false;
  tab4: boolean = false;

  otherTabs: boolean = false
  mainTabs: boolean = true

  tagContainerElementHeight: any;
  convTagContainerElementHeight: any
  requestInfoListElementHeight: any;
  displayAppsinSidebar: boolean = false
  dashboardApps: Array<any>
  webchatApps: Array<any>
  isSafari: any
  disableReopeRequest: boolean = false;

  isOpenEditContactFullnameDropdown: boolean = false;
  serveByTooltipOption: TooltipOptions = {
    'show-delay': 0,
    'tooltip-class': 'served-by-ng2-tooltip',
    'theme': 'light',
    'shadow': true,
    'hide-delay-mobile': 0,
    'hideDelayAfterClick': 3000,
    'hide-delay': 22222222220,
    'placement': 'left',
  }

  isOpenChatbotAttributesAccordion: boolean
  profile_name: string;
  subscription_is_active: any;
  trial_expired: any;
  prjct_profile_type: string;
  subscription_end_date: any;
  onlyAvailableWithEnterprisePlan: string;
  cPlanOnly: string;
  fPlanOnly: string;
  displayChatRatings: boolean = true;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  DASHBORD_BASE_URL: string;
  contact_details: any;
  whatsAppPhoneNumber: string;
  telegramPhoneNumber: string;
  mailtoBody: any;
  REQUEST_EXIST: boolean = true;
  botLogo: string;
  scrollYposition: any;
  storedRequestId: string;
  requestDuration: any;
  dialedNumberIdentificationService: string;

  CHANNELS_NAME = CHANNELS_NAME;
  HIDE_CHATBOT_ATTRIBUTES: boolean;

  ALLOW_TO_SEND_EMOJI: boolean;
  showEmojiWarning: boolean = false;

  IS_ENABLED_URLS_WHITELIST: boolean
  URLS_WITHELIST: string[] = [];
  warningMessage: string | null = null;

  panelOpenState = false;

  isDropdownOpen: boolean = false;

  public translationMap: Map<string, string> = new Map();
  imagePreview: string | null = null;

  private observer!: MutationObserver;
  @ViewChild('tagsContainer') tagsContainer!: ElementRef;

  PERMISSION_TO_ARCHIVE_REQUEST: boolean;
  PERMISSION_TO_SEND_REQUEST: boolean;
  PERMISSION_TO_JOIN_REQUEST: boolean;
  PERMISSION_TO_REOPEN: boolean;
  PERMISSION_TO_UPDATE_REQUEST_STATUS: boolean;
  PERMISSION_TO_UPDATE_REQUEST_PRIORITY: boolean;
  PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS: boolean;
  PERMISSION_TO_UPDATE_SMART_ASSIGNMENT: boolean;
  PERMISSION_TO_UPDATE_REQUEST_TAGS: boolean;
  PERMISSION_TO_READ_TAGS: boolean;
  PERMISSION_TO_UPDATE_REQUEST_NOTES: boolean;
  PERMISSION_TO_REASSIGN_REQUEST: boolean;
  PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST: boolean;
  PERMISSION_TO_LEFT_REQUEST: boolean;
  PERMISSION_TO_SEND_TRANSCRIPT: boolean;
  PERMISSION_TO_BAN_VISITOR: boolean;
  PERMISSION_TO_UPDATE_LEAD: boolean;
  PERMISSION_TO_EDIT_FLOWS: boolean;
  PERMISSION_TO_READ_TEAMMATE_DETAILS: boolean;
  PERMISSION_TO_UPDATE_APP: boolean;
  PERMISSION_TO_VIEW_RATING_SECTION: boolean;
  PERMISSION_TO_VIEW_CONTACT_SECTION: boolean;
  PERMISSION_TO_VIEW_TICKET_ID: boolean;
  PERMISSION_TO_VIEW_ALL_TAGS: boolean;

  /**
   * Constructor
   * @param router 
   * @param route 
   * @param wsRequestsService 
   * @param wsMsgsService 
   * @param _location 
   * @param botLocalDbService 
   * @param usersLocalDbService 
   * @param notify 
   * @param auth 
   * @param appConfigService 
   * @param departmentService 
   * @param groupsService 
   * @param usersService 
   * @param faqKbService 
   * @param translate 
   * @param tagsService 
   * @param contactsService 
   * @param logger 
   */
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public wsRequestsService: WsRequestsService,
    private wsMsgsService: WsMsgsService,
    private _location: Location,
    public botLocalDbService: BotLocalDbService,
    public usersLocalDbService: LocalDbService,
    public notify: NotifyService,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private departmentService: DepartmentService,
    private groupsService: GroupService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public translate: TranslateService,
    private tagsService: TagsService,
    public contactsService: ContactsService,
    public logger: LoggerService,
    private projectService: ProjectService,
    public appStoreService: AppStoreService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    private prjctPlanService: ProjectPlanService,
    public dialog: MatDialog,
    public brandService: BrandService,
    private faqService: FaqService,
    private cacheService: CacheService,
    public rolesService: RolesService,
    private roleService: RoleService,
  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate)
    this.jira_issue_types = [
      { id: 10002, name: 'Task', avatar: 'https://tiledesk.atlassian.net/secure/viewavatar?size=medium&avatarId=10318&avatarType=issuetype' },
      { id: 10004, name: 'Bug', avatar: 'https://tiledesk.atlassian.net/secure/viewavatar?size=medium&avatarId=10303&avatarType=issuetype' },
    ];

    const brand = brandService.getBrand();
    this.botLogo = brand['BASE_LOGO_NO_TEXT']
  }


  @ViewChild('cont', { static: false }) contEl: any;


  // -----------------------------------------------------------------------------------------------------
  // @ HostListener window:resize
  // -----------------------------------------------------------------------------------------------------
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[WS-REQUESTS-MSGS] - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    // this.logger.log('%%% Ws-REQUESTS-Msgs - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    if (elemMainContent) {
      this.main_content_height = elemMainContent.clientHeight
      this.logger.log('[WS-REQUESTS-MSGS]  - ON RESIZE ->  MAIN CONTENT HEIGHT', elemMainContent.clientHeight);
    } else {
      this.logger.log('[WS-REQUESTS-MSGS] - ON RESIZE ->  MAIN CONTENT HEIGHT  (else)', elemMainContent.clientHeight);
    }

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (this.newInnerWidth <= 991) {
      if (elemMainContent) {
        this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px';
        this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON RESIZE -> users_list_modal_height', this.users_list_modal_height);
        this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px';

        this.apps_sidebar_height = elemMainContent.clientHeight + 60 + 'px';
        this.logger.log('[WS-REQUESTS-MSGS] - MODAL HEIGHT ', this.users_list_modal_height);
      } else {
        this.logger.log('[WS-REQUESTS-MSGS] - ON RESIZE @media <= 991  ->  MAIN CONTENT HEIGHT  (else)', elemMainContent.clientHeight);
      }
    }

    // ------------------------------
    // Right sidebar width on resize
    // ------------------------------
    const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    if (rightSidebar) {
      this.rightSidebarWidth = rightSidebar.offsetWidth
    }

    this.getTagContainerElementHeight()
  }

  getTagContainerElementHeight() {
    const requestInfoListElement = <HTMLElement>document.querySelector('.request-info-list');
    this.logger.log('requestInfoListElement ', requestInfoListElement);
    if (requestInfoListElement) {
      this.logger.log('requestInfoListElement.offsetHeight ', requestInfoListElement.offsetHeight)
      this.requestInfoListElementHeight = requestInfoListElement.offsetHeight + 59
    }

    // const tagContainerElement = <HTMLElement>document.querySelector('.tags--container');
    // console.log('tagContainerElement ', tagContainerElement)
    // if (tagContainerElement) {
    //   this.logger.log('tagContainerElement.offsetHeight ', tagContainerElement.offsetHeight)

    //   this.tagContainerElementHeight = (this.requestInfoListElementHeight + tagContainerElement.offsetHeight) + 'px';
    //   console.log('this.tagContainerElementHeight ', this.tagContainerElementHeight)

    //   this.convTagContainerElementHeight = tagContainerElement.offsetHeight + 20 + 'px';
    //   this.logger.log('this.tagContainerElementHeight ', this.convTagContainerElementHeight)
    // }
     if (!this.tagsContainer) return;

  // Iniziale
  this.updateTagContainerHeight();

  // Osserva i cambiamenti nel DOM delle tag
  this.observer = new MutationObserver(() => {
    this.updateTagContainerHeight();
  });

  this.observer.observe(this.tagsContainer.nativeElement, {
    childList: true, // osserva aggiunte/rimozioni di elementi
    subtree: false
  });
  }


updateTagContainerHeight() {
  const element = this.tagsContainer.nativeElement as HTMLElement;
  const height = element.offsetHeight;

  // Piccolo margine extra per estetica
  this.convTagContainerElementHeight = height + 20 + 'px';
  // console.log('[TAG HEIGHT] Altezza aggiornata:', this.convTagContainerElementHeight);
}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit() {
    // this.roleService.checkRoleForCurrentProject('wsrequest-detail') moved in getWsRequestById$
    this.getParamRequestId();
    this.getCurrentProject();
    this.getLoggedUser();
    this.detectMobile();
    this.getProfileImageStorage();
    this.getBaseUrlsFromAppConfig()
    this.translateNotificationMsgs();
    this.getProjectUserRole();
    this.getIfRouteUrlIsRequestForPanel();
    this.getBaseUrl();
    this.getOSCODE();
    this.getFirebaseAuth();
    this.getBrowserLang();
    this.getBrowserVersion()
    this.getSafaryBrowser()
    this.setMomentLocale()
    this.getTeammates();
    this.getBots();
    this.listenToUpladAttachmentProgress();
    this.listenToUpladAttachmentRemoved();
    this.getRouteParams();
    this.getQueryParams();
    this.getProjectPlan();
    this.listenToProjectUser()

    this.fileUploadAccept = this.appConfigService.getConfig().fileUploadAccept
    // this.getClickOutEditContactFullname()
  }

   ngAfterViewInit() {
    // -----------------------------------
    // Right sidebar width after view init
    // -----------------------------------
    const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    this.logger.log('rightSidebar.offsetWidth ', rightSidebar.offsetWidth)
    if (rightSidebar) {
      this.rightSidebarWidth = rightSidebar.offsetWidth;
    }

    if (this.request) {
      this.getfromStorageIsOpenAppSidebar()
    }

    this.getAppsInstalledApps()
    this.getTagContainerElementHeight()
  }


  ngOnDestroy() {
    //  this.logger.log('[WS-REQUESTS-MSGS] - ngOnDestroy')
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.unsuscribeRequesterPresence(this.requester_id);
    if (this.id_request) {
      // this.logger.log('[WS-REQUESTS-MSGS] - ngOnDestroy 2 this.id_request ', this.id_request)
      this.unsuscribeRequestById(this.id_request);
      this.unsuscribeMessages(this.id_request);
    }

    if (this.observer) {
      this.observer.disconnect();
    }
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        console.log('[WS-REQUESTS-MSGS] - Role:', status.role);
        console.log('[WS-REQUESTS-MSGS] - Permissions:', status.matchedPermissions);

        // ---------------------------
        // PERMISSION_TO_UPDATE_LEAD 
        // --------------------------
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.LEAD_UPDATE)) {

            this.PERMISSION_TO_UPDATE_LEAD = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_LEAD ', this.PERMISSION_TO_UPDATE_LEAD);
          } else {
            this.PERMISSION_TO_UPDATE_LEAD = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_LEAD ', this.PERMISSION_TO_UPDATE_LEAD);
          }
        } else {
          this.PERMISSION_TO_UPDATE_LEAD = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_LEAD ', this.PERMISSION_TO_UPDATE_LEAD);
        }

        // PERMISSION_TO_ARCHIVE_REQUEST
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_CLOSE)) {
            console.log('[WS-REQUESTS-MSGS] PERMISSION_TO_ARCHIVE_REQUEST', PERMISSIONS.REQUEST_CLOSE)

            this.PERMISSION_TO_ARCHIVE_REQUEST = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_ARCHIVE_REQUEST 1 ', this.PERMISSION_TO_ARCHIVE_REQUEST);
          } else {
            this.PERMISSION_TO_ARCHIVE_REQUEST = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_ARCHIVE_REQUEST 2', this.PERMISSION_TO_ARCHIVE_REQUEST);
          }
        } else {
          this.PERMISSION_TO_ARCHIVE_REQUEST = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role 3', status.role, 'PERMISSION_TO_ARCHIVE_REQUEST ', this.PERMISSION_TO_ARCHIVE_REQUEST);
        }

        // PERMISSION_TO_SEND_REQUEST
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_SEND)) {
            // Enable update action
            this.PERMISSION_TO_SEND_REQUEST = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_SEND_REQUEST 1 ', this.PERMISSION_TO_SEND_REQUEST);
          } else {
            this.PERMISSION_TO_SEND_REQUEST = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_SEND_REQUEST 2', this.PERMISSION_TO_SEND_REQUEST);
          }
        } else {
          this.PERMISSION_TO_SEND_REQUEST = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_SEND_REQUEST ', this.PERMISSION_TO_SEND_REQUEST);
        }

        // PERMISSION_TO_JOIN_REQUEST
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_JOIN)) {
            console.log('[WS-REQUESTS-MSGS] PERMISSION_TO_JOIN_REQUEST', PERMISSIONS.REQUEST_JOIN)

            this.PERMISSION_TO_JOIN_REQUEST = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_JOIN_REQUEST 1 ', this.PERMISSION_TO_JOIN_REQUEST);
          } else {
            this.PERMISSION_TO_JOIN_REQUEST = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_JOIN_REQUEST 2', this.PERMISSION_TO_JOIN_REQUEST);
          }
        } else {
          this.PERMISSION_TO_JOIN_REQUEST = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role 3', status.role, 'PERMISSION_TO_JOIN_REQUEST ', this.PERMISSION_TO_JOIN_REQUEST);
        }

        // PERMISSION_TO_REOPEN
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_REOPEN)) {
            console.log('[WS-REQUESTS-MSGS] PERMISSION_TO_REOPEN', PERMISSIONS.REQUEST_REOPEN)

            this.PERMISSION_TO_REOPEN = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_REOPEN 1 ', this.PERMISSION_TO_REOPEN);
          } else {
            this.PERMISSION_TO_REOPEN = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_REOPEN 2', this.PERMISSION_TO_REOPEN);
          }
        } else {
          this.PERMISSION_TO_REOPEN = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role 3', status.role, 'PERMISSION_TO_REOPEN ', this.PERMISSION_TO_REOPEN);
        }


        // PERMISSION_TO_UPDATE_REQUEST_STATUS
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_UPDATE_STATUS)) {

            this.PERMISSION_TO_UPDATE_REQUEST_STATUS = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_STATUS 1 ', this.PERMISSION_TO_UPDATE_REQUEST_STATUS);
          } else {
            this.PERMISSION_TO_UPDATE_REQUEST_STATUS = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_STATUS 2', this.PERMISSION_TO_UPDATE_REQUEST_STATUS);
          }
        } else {
          this.PERMISSION_TO_UPDATE_REQUEST_STATUS = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_REQUEST_STATUS ', this.PERMISSION_TO_UPDATE_REQUEST_STATUS);
        }

        // PERMISSION_TO_UPDATE_REQUEST_PRIORITY
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_UPDATE_PRIORITY)) {

            this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_PRIORITY 1 ', this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY);
          } else {
            this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_PRIORITY 2', this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY);
          }
        } else {
          this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_REQUEST_PRIORITY ', this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY);
        }

        // PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_UPDATE_FOLLOWERS)) {

            this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS 1 ', this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS);
          } else {
            this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS 2', this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS);
          }
        } else {
          this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS ', this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS);
        }

        // PERMISSION_TO_UPDATE_SMART_ASSIGNMENT
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_UPDATE_SMART_ASSIGNMENT)) {

            this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_SMART_ASSIGNMENT 1 ', this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT);
          } else {
            this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_SMART_ASSIGNMENT 2', this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT);
          }
        } else {
          this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_SMART_ASSIGNMENT ', this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT);
        }

        // PERMISSION_TO_UPDATE_REQUEST_TAGS
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_UPDATE_TAGS)) {

            this.PERMISSION_TO_UPDATE_REQUEST_TAGS = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_TAGS 1 ', this.PERMISSION_TO_UPDATE_REQUEST_TAGS);
          } else {
            this.PERMISSION_TO_UPDATE_REQUEST_TAGS = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_TAGS 2', this.PERMISSION_TO_UPDATE_REQUEST_TAGS);
          }
        } else {
          this.PERMISSION_TO_UPDATE_REQUEST_TAGS = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_REQUEST_TAGS ', this.PERMISSION_TO_UPDATE_REQUEST_TAGS);
        }

        // PERMISSION_TO_UPDATE_REQUEST_NOTES
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_UPDATE_NOTES)) {

            this.PERMISSION_TO_UPDATE_REQUEST_NOTES = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_NOTES 1 ', this.PERMISSION_TO_UPDATE_REQUEST_NOTES);
          } else {
            this.PERMISSION_TO_UPDATE_REQUEST_NOTES = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_UPDATE_REQUEST_NOTES 2', this.PERMISSION_TO_UPDATE_REQUEST_NOTES);
          }
        } else {
          this.PERMISSION_TO_UPDATE_REQUEST_NOTES = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_UPDATE_REQUEST_NOTES ', this.PERMISSION_TO_UPDATE_REQUEST_NOTES);
        }

        // PERMISSION_TO_REASSIGN_REQUEST
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_REASSIGN)) {

            this.PERMISSION_TO_REASSIGN_REQUEST = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_REASSIGN_REQUEST 1 ', this.PERMISSION_TO_REASSIGN_REQUEST);
          } else {
            this.PERMISSION_TO_REASSIGN_REQUEST = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_REASSIGN_REQUEST 2', this.PERMISSION_TO_REASSIGN_REQUEST);
          }
        } else {
          this.PERMISSION_TO_REASSIGN_REQUEST = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_REASSIGN_REQUEST ', this.PERMISSION_TO_REASSIGN_REQUEST);
        }

        // PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_ADD)) {

            this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST 1 ', this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST);
          } else {
            this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST 2', this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST);
          }
        } else {
          this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST ', this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST);
        }

        // PERMISSION_TO_LEFT_REQUEST
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_LEFT)) {

            this.PERMISSION_TO_LEFT_REQUEST = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_LEFT_REQUEST 1 ', this.PERMISSION_TO_LEFT_REQUEST);
          } else {
            this.PERMISSION_TO_LEFT_REQUEST = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_LEFT_REQUEST 2', this.PERMISSION_TO_LEFT_REQUEST);
          }
        } else {
          this.PERMISSION_TO_LEFT_REQUEST = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_LEFT_REQUEST ', this.PERMISSION_TO_LEFT_REQUEST);
        }

        // PERMISSION_TO_SEND_TRANSCRIPT
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.REQUEST_TRANSCRIPT_SEND)) {

            this.PERMISSION_TO_SEND_TRANSCRIPT = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_SEND_TRANSCRIPT 1 ', this.PERMISSION_TO_SEND_TRANSCRIPT);
          } else {
            this.PERMISSION_TO_SEND_TRANSCRIPT = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_SEND_TRANSCRIPT 2', this.PERMISSION_TO_SEND_TRANSCRIPT);
          }
        } else {
          this.PERMISSION_TO_SEND_TRANSCRIPT = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_SEND_TRANSCRIPT ', this.PERMISSION_TO_SEND_TRANSCRIPT);
        }

        // PERMISSION_TO_READ_TAGS (IN TAGS SECTION )
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TAGS_READ)) {

            this.PERMISSION_TO_READ_TAGS = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_READ_TAGS 1 ', this.PERMISSION_TO_READ_TAGS);
          } else {
            this.PERMISSION_TO_READ_TAGS = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_READ_TAGS 2', this.PERMISSION_TO_READ_TAGS);
          }
        } else {
          this.PERMISSION_TO_READ_TAGS = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_READ_TAGS ', this.PERMISSION_TO_READ_TAGS);
        }


        // PERMISSION_TO_BAN_VISITOR
        if (status.role === 'owner') {
          // Owner always has permission
          this.PERMISSION_TO_BAN_VISITOR = true;
          console.log('[WS-REQUESTS-MSGS] - Project user is owner (1)', 'PERMISSION_TO_BAN_VISITOR:', this.PERMISSION_TO_BAN_VISITOR);

        } else if (status.role === 'admin' || status.role === 'agent') {
          // Admin and agent never have permission
          this.PERMISSION_TO_BAN_VISITOR = false;
          console.log('[WS-REQUESTS-MSGS] - Project user is admin or agent (2)', 'PERMISSION_TO_BAN_VISITOR:', this.PERMISSION_TO_BAN_VISITOR);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_BAN_VISITOR = status.matchedPermissions.includes(PERMISSIONS.LEAD_BAN);
          console.log('[WS-REQUESTS-MSGS] - Custom role (3)', status.role, 'PERMISSION_TO_BAN_VISITOR:', this.PERMISSION_TO_BAN_VISITOR);
        }

        // ---------------------------------
        // PERMISSION_TO_EDIT_FLOWS
        // ---------------------------------
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_EDIT_FLOWS = true;
          console.log('[WS-REQUESTS-MSGS] - Project user is owner or admin (1)', 'PERMISSION_TO_EDIT_FLOWS:', this.PERMISSION_TO_EDIT_FLOWS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_EDIT_FLOWS = false;
          console.log('[WS-REQUESTS-MSGS] - Project user agent (2)', 'PERMISSION_TO_EDIT_FLOWS:', this.PERMISSION_TO_EDIT_FLOWS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_EDIT_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_EDIT);
          console.log('[WS-REQUESTS-MSGS] - Custom role (3) role', status.role, 'PERMISSION_TO_EDIT_FLOWS:', this.PERMISSION_TO_EDIT_FLOWS);
        }


        // PERMISSION_TO_READ_TEAMMATE_DETAILS
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TEAMMATE_UPDATE)) {

            this.PERMISSION_TO_READ_TEAMMATE_DETAILS = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_READ_TEAMMATE_DETAILS ', this.PERMISSION_TO_READ_TEAMMATE_DETAILS);
          } else {
            this.PERMISSION_TO_READ_TEAMMATE_DETAILS = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_READ_TEAMMATE_DETAILS ', this.PERMISSION_TO_READ_TEAMMATE_DETAILS);
          }
        } else {
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_READ_TEAMMATE_DETAILS ', this.PERMISSION_TO_READ_TEAMMATE_DETAILS);
        }

        // PERMISSION_TO_VIEW_ALL_TAGS
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TAGS_READ_ALL)) {

            this.PERMISSION_TO_VIEW_ALL_TAGS = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_VIEW_ALL_TAGS ', this.PERMISSION_TO_VIEW_ALL_TAGS);
          } else {
            this.PERMISSION_TO_VIEW_ALL_TAGS = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_VIEW_ALL_TAGS ', this.PERMISSION_TO_VIEW_ALL_TAGS);
          }
        } else {
          this.PERMISSION_TO_VIEW_ALL_TAGS = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_ALL_TAGS ', this.PERMISSION_TO_VIEW_ALL_TAGS);
        }

        

        // PERMISSION TO UPDATE APP
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and admin always has permission
          this.PERMISSION_TO_UPDATE_APP = true;
          console.log('[WS-REQUESTS-MSGS] - Project user is owner or admin (1)', 'PERMISSION_TO_UPDATE_APP:', this.PERMISSION_TO_UPDATE_APP);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_UPDATE_APP = false;
          console.log('[WS-REQUESTS-MSGS] - Project user agent (2)', 'PERMISSION_TO_UPDATE_APP:', this.PERMISSION_TO_UPDATE_APP);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_UPDATE_APP = status.matchedPermissions.includes(PERMISSIONS.APPS_UPDATE);
          console.log('[WS-REQUESTS-MSGS] - Custom role (3) role', status.role, 'PERMISSION_TO_UPDATE_APP:', this.PERMISSION_TO_UPDATE_APP);
        }

        // PERMISSION_TO_VIEW_RATING_SECTION
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.RATING_READ)) {

            this.PERMISSION_TO_VIEW_RATING_SECTION = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_VIEW_RATING_SECTION ', this.PERMISSION_TO_VIEW_RATING_SECTION);
          } else {
            this.PERMISSION_TO_VIEW_RATING_SECTION = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_VIEW_RATING_SECTION ', this.PERMISSION_TO_VIEW_RATING_SECTION);
          }
        } else {
          this.PERMISSION_TO_VIEW_RATING_SECTION = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_RATING_SECTION ', this.PERMISSION_TO_VIEW_RATING_SECTION);
        }

        // PERMISSION_TO_VIEW_TICKET_ID
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          if (status.matchedPermissions.includes(PERMISSIONS.TICKET_ID_READ)) {

            this.PERMISSION_TO_VIEW_TICKET_ID = true
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_VIEW_TICKET_ID ', this.PERMISSION_TO_VIEW_TICKET_ID);
          } else {
            this.PERMISSION_TO_VIEW_TICKET_ID = false
            console.log('[WS-REQUESTS-MSGS] - PERMISSION_TO_VIEW_TICKET_ID ', this.PERMISSION_TO_VIEW_TICKET_ID);
          }
        } else {
          this.PERMISSION_TO_VIEW_TICKET_ID = true
          console.log('[WS-REQUESTS-MSGS] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_TICKET_ID ', this.PERMISSION_TO_VIEW_TICKET_ID);
        }

        

        // -----------------------------------
        // PERMISSION_TO_VIEW_CONTACT_SECTION
        // -----------------------------------
        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {

          if (status.matchedPermissions.includes(PERMISSIONS.LEADS_READ)) {
            this.PERMISSION_TO_VIEW_CONTACT_SECTION = true
            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_CONTACT_SECTION ', this.PERMISSION_TO_VIEW_CONTACT_SECTION);
          } else {
            this.PERMISSION_TO_VIEW_CONTACT_SECTION = false

            console.log('[SIDEBAR] - PERMISSION_TO_VIEW_CONTACT_SECTION ', this.PERMISSION_TO_VIEW_CONTACT_SECTION);
          }
        } else {
          this.PERMISSION_TO_VIEW_CONTACT_SECTION = true
          console.log('[SIDEBAR] - Project user has a default role ', status.role, 'PERMISSION_TO_VIEW_CONTACT_SECTION ', this.PERMISSION_TO_VIEW_CONTACT_SECTION);
        }



        // You can also check status.role === 'owner' if needed
      });

  }



  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      // this.logger.log('[WS-REQUESTS-MSGS] GET PROJECT PROFILE', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.trial_expired = projectProfileData.trial_expired;
        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.profile_name = projectProfileData.profile_name;

        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']
        }


        if (projectProfileData.profile_type === 'free') {
          if (projectProfileData.trial_expired === false) {
            this.displayChatRatings = true;
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.displayChatRatings)
          } else {
            this.displayChatRatings = false;
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.displayChatRatings)
          }
        } else if (projectProfileData.profile_type === 'payment') {
          if (projectProfileData.subscription_is_active === true) {
            this.displayChatRatings = true;
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.displayChatRatings)
          } else if (projectProfileData.subscription_is_active === false) {
            // this.logger.log('[WS-REQUESTS-MSGS] profile_type', projectProfileData.profile_type)
            this.displayChatRatings = false;
            // this.logger.log('[WS-REQUESTS-MSGS] displayChatRatings', this.displayChatRatings)
          }
        }

        if (projectProfileData.profile_name === 'free' && projectProfileData.trial_expired === true && this.selectedResponseTypeID === 2) {
          const elemTexareaSendMsg = <HTMLInputElement>document.querySelector('.send-message-texarea')
          // this.logger.log('[WS-REQUESTS-MSGS] GET PROJECT PLAN elemTexareaSendMsg USE CASE PRIVATE NOTE (ID 2)', elemTexareaSendMsg);
          if (elemTexareaSendMsg && this.isVisiblePaymentTab) {
            elemTexareaSendMsg.disabled = true;
            this.openUpgradePlanDialog(projectProfileData._id, PLAN_NAME.A)
          }
        }

        if (projectProfileData.profile_name === 'Sandbox' && projectProfileData.trial_expired === true && this.selectedResponseTypeID === 2) {
          const elemTexareaSendMsg = <HTMLInputElement>document.querySelector('.send-message-texarea')
          // this.logger.log('[WS-REQUESTS-MSGS] GET PROJECT PLAN elemTexareaSendMsg USE CASE PRIVATE NOTE (ID 2)', elemTexareaSendMsg);
          if (elemTexareaSendMsg && this.isVisiblePaymentTab) {
            elemTexareaSendMsg.disabled = true;
            this.openUpgradePlanDialog(projectProfileData._id, PLAN_NAME.D)
          }
        }
      }
    }, err => {
      this.logger.error('[WS-REQUESTS-MSGS] GET PROJECT PROFILE - ERROR', err);
    }, () => {
      // this.logger.log('[WS-REQUESTS-MSGS] GET PROJECT PROFILE * COMPLETE *');
    });
  }

  goToPricing() {
    if (this.isVisiblePaymentTab) {
      if (this.CURRENT_USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        } else {
          this.router.navigate(['project/' + this.id_project + '/pricing']);

        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }


  goToPricingFromChat() {
    if (this.isVisiblePaymentTab) {
      if (this.CURRENT_USER_ROLE === 'owner') {
        const href = window.location.href;
        this.logger.log('[PRICING] href ', href)

        const hrefArray = href.split('/#/');
        this.dshbrdBaseUrl = hrefArray[0]
        const pricingUrl = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/chat-pricing';
        window.open(pricingUrl, '_blank');
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(
      this.translationMap.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan'),
      this.translationMap.get('LearnMoreAboutDefaultRoles')
    )
  }

  openUpgradePlanDialog(projectid, planName) {
    const dialogRef = this.dialog.open(UpgradePlanModalComponent, {
      data: {
        featureAvailableFrom: planName,
        projectId: projectid,
        userRole: this.CURRENT_USER_ROLE
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // this.logger.log(`Dialog result: ${result}`);
      this.selectedResponseTypeID = 1
      const elemTexareaSendMsg = <HTMLInputElement>document.querySelector('.send-message-texarea')
      // this.logger.log('[WS-REQUESTS-MSGS] GET PROJECT PLAN elemTexareaSendMsg PUBLIC ANSWER (ID 1) afterClosed', elemTexareaSendMsg);

      if (elemTexareaSendMsg && elemTexareaSendMsg.disabled) {
        elemTexareaSendMsg.disabled = false;
        // this.logger.log('✅ element is disabled afterClosed');
      }

    });
  }

  getQueryParams() {
    this.route.queryParams
      .subscribe(params => {
        this.logger.log('[WS-REQUESTS-MSGS]  queryParams', params);
        this.queryParams = params
      });
  }

  getRouteParams() {
    this.route.params.subscribe((params) => {
      this.logger.log('[WS-REQUESTS-MSGS] params', params)

      if (params.scrollposition) {
        this.scrollYposition = params.scrollposition
      }

      if (params.isopenadvancedsearch) {
        this.isOpenedAdvancedSearch = params.isopenadvancedsearch
      }

      if (params.deptid) {
        this.selectedDept = params.deptid
      }

      if (params.calledby === '1') {
        this.previousUrl = 'wsrequests'
        console.log('[WS-REQUESTS-MSGS] this.previousUrl', this.previousUrl)
      }

      if (params.calledby === '2') {
        this.previousUrl = 'history',
          console.log('[WS-REQUESTS-MSGS] this.previousUrl', this.previousUrl)
        this.hasSearchedBy = params.hassearchedby
      }

      if (params.calledby === '3') {
        this.previousUrl = 'all-conversations',
          console.log('[WS-REQUESTS-MSGS] this.previousUrl', this.previousUrl)
        this.hasSearchedBy = params.hassearchedby
        this.logger.log('[WS-REQUESTS-MSGS] this.hasSearchedBy', this.hasSearchedBy)
      }

      if (!params.calledby) {
        this.previousUrl = undefined
      }

    })
  }

  goBack() {
    this.logger.log('[WS-REQUESTS-MSGS] goBack')
    if (this.previousUrl === 'wsrequests') {
      if (!this.scrollYposition) {
        this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl]);
      } else if (this.scrollYposition) {
        this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.scrollYposition]);
      }
      // && this.hasSearchedBy

      // Called by history with advanced search options opened 
      // } else if (this.previousUrl === 'history' && this.isOpenedAdvancedSearch) {
      //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.hasSearchedBy + '/' + this.isOpenedAdvancedSearch]);

      //   // Called by history with advanced search options closed 
      // } else if (this.previousUrl === 'history' && !this.isOpenedAdvancedSearch) {

      //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.hasSearchedBy]);
      //   // && this.hasSearchedBy

      // } else if (this.previousUrl === 'history' && this.isOpenedAdvancedSearch && this.selectedDept) {
      //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.hasSearchedBy + '/' + this.isOpenedAdvancedSearch + '/' + this.selectedDept]);

      // Called by all-conversations with advanced search options opened 
      // } else if (this.previousUrl === 'all-conversations' && this.isOpenedAdvancedSearch) {
      //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.hasSearchedBy + '/' + this.isOpenedAdvancedSearch]);

      // } else if (this.previousUrl === 'all-conversations' && this.isOpenedAdvancedSearch && this.selectedDept) {
      //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.hasSearchedBy + '/' + this.isOpenedAdvancedSearch + '/' + this.selectedDept]);

      //   // Called by all-conversations with advanced search options closed
      // } else if (this.previousUrl === 'all-conversations' && !this.isOpenedAdvancedSearch) {
      //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl + '/' + this.hasSearchedBy]);
    }

    if (this.previousUrl === 'all-conversations' && this.queryParams) {
      this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl], { queryParams: this.queryParams })
    }

    if (this.previousUrl === 'history' && this.queryParams) {
      this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl], { queryParams: this.queryParams })
    }

    if (this.previousUrl === undefined) {
      this._location.back();
    }


    // } else if (this.previousUrl === 'history' && !this.hasSearchedBy) {
    //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl]);
    // } else if (this.previousUrl === 'all-conversations' && !this.hasSearchedBy) {
    //   this.router.navigate(['project/' + this.id_project + '/' + this.previousUrl]);
    // }


  }


  getBots() {
    this.faqKbService.getFaqKbByProjectId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((bots) => {
        if (bots) {
          this.logger.log('[WS-REQUESTS-MSGS] GET bots  ', bots);
          let count = 0;
          bots.forEach(bot => {
            if (bot.type === 'internal' || bot.type === 'tilebot') {
              count = count + 1;
            }
          });
          this.resolutionBotCount = count
          this.logger.log('[WS-REQUESTS-MSGS] GET bots - count of resolution bot  ', this.resolutionBotCount);
        } else {
          this.resolutionBotCount = 0
        }

      }, (error) => {

        this.logger.error('[WS-REQUESTS-MSGS] GET bots - ERROR  ', error);

      }, () => {

        this.logger.log('[WS-REQUESTS-MSGS] GET bots  * COMPLETE *');

      });
  }


  addFollower(event) {
    if (this.PERMISSION_TO_UPDATE_REQUEST_FOLLOWERS) {

      this.logger.log('[WS-REQUESTS-MSGS]  ADD FOLLOWER event', event)
      this.wsRequestsService.addFollower(event.value, this.request.request_id)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res) => {
          console.log('[WS-REQUESTS-MSGS] ADD FOLLOWER  - RES  ', res);

        }, (error) => {

          this.notify.showWidgetStyleUpdateNotification(this.translate.instant("RequestMsgsPage.ThereWasProblemUpdatingTheConversation"), 4, 'report_problem');
          this.logger.log('[WS-REQUESTS-MSGS] ADD FOLLOWER  - ERROR  ', error);

        }, () => {

          this.notify.showWidgetStyleUpdateNotification(this.translate.instant("RequestMsgsPage.ConversationUpdatedSuccessfully"), 2, 'done');
          this.logger.log('[WS-REQUESTS-MSGS] ADD FOLLOWER  * COMPLETE *');

        });
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction()
    }
  }

  removeFollower(event) {
    this.logger.log('[WS-REQUESTS-MSGS] REMOVE FOLLOWER  - event  ', event);
    const projectUserId = event.value.value;
    // this.logger.log('removeFollower projectUserId', projectUserId)
    const userId = event.value.userid;
    // this.logger.log('removeFollower userId', userId)
    if (userId === this.currentUserID) {
      this.CURRENT_USER_IS_A_FOLLOWER = false;
    }
    this.wsRequestsService.removeFollower(projectUserId, this.request.request_id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {

        this.logger.log('[WS-REQUESTS-MSGS] REMOVE FOLLOWER  - RES  ', res);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] REMOVE FOLLOWER  - ERROR  ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] REMOVE FOLLOWER * COMPLETE *');

      });
  }

  removeAllFollowers(event) {
    this.logger.log('[WS-REQUESTS-MSGS]  REMOVE ALL FOLLOWERS event', event);
    this.followers = [];
    this.selectedFollowers = [];
    this.CURRENT_USER_IS_A_FOLLOWER = false;
    this.wsRequestsService.removeAllFollowers(this.request.request_id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((res) => {

        this.logger.log('[WS-REQUESTS-MSGS] REMOVE ALL FOLLOWERS  - RES  ', res);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] REMOVE ALL FOLLOWERS  - ERROR  ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] REMOVE ALL FOLLOWERS * COMPLETE *');

      });
  }


  getValues(event) {
    // this.logger.log('getValues event', event)
    this.followers = event
    if (this.followers)
      this.followers.forEach(follower => {
        // this.logger.log('getValues follower', follower)
      });
  }

  follow() {
    // this.logger.log('follow HERE Y ')
    this.projectTeammates.forEach(teammate => {
      // this.logger.log('follow teammate', teammate)
      // this.logger.log('follow currentUserID', this.currentUserID)
      if (teammate.userid === this.currentUserID) {
        // this.projectTeammates.push({label:  teammate['fullname'], value: teammate._id })
        this.followers.push({ label: teammate['label'], value: teammate['value'], userid: teammate['userid'] })
        this.CURRENT_USER_IS_A_FOLLOWER = true;
        const event = {}
        event['label'] = teammate['label']
        event['value'] = teammate['value']
        event['userid'] = teammate['userid']
        // this.logger.log(' follow  event object  ', event)
        // this.selected = followTeammate
        this.addFollower(event)
      }
    });
    // this.logger.log('followers ', this.followers)
    this.selectedFollowers = this.followers
    this.selectedFollowers = this.selectedFollowers.slice(0)
    // this.logger.log('selectedFollowers ', this.selectedFollowers)
  }

  unfollow() {
    for (var i = this.followers.length - 1; i >= 0; i--) {
      if (this.followers[i]['userid'] === this.currentUserID) {
        this.wsRequestsService.removeFollower(this.followers[i]['value'], this.request.request_id)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res) => {
            this.logger.log('[WS-REQUESTS-MSGS] REMOVE FOLLOWER  - res  ', res);

          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] REMOVE FOLLOWER  - ERROR  ', error);

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] REMOVE FOLLOWER  * COMPLETE *');

          });
        this.followers.splice(i, 1);
      }
    }
    //  this.logger.log( 'unfollow  this.followers ' ,  this.followers)
    this.selectedFollowers = this.followers
    this.selectedFollowers = this.selectedFollowers.slice(0)
    this.CURRENT_USER_IS_A_FOLLOWER = false
  }

  getTeammates() {
    this.usersService.getProjectUsersByProjectId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((prjctteammates) => {
        if (prjctteammates) {
          // this.projectTeammates = prjctteammates
          this.projectTeammates = []
          this.allProjectUsers = []


          prjctteammates.forEach(teammate => {
            this.logger.log('[WS-REQUESTS-MSGS] teammate', teammate)
            teammate['fullname'] = teammate['id_user']['firstname'] + ' ' + teammate['id_user']['lastname']
            this.projectTeammates.push({ label: teammate['fullname'], value: teammate._id, userid: teammate['id_user']['_id'] })
            this.allProjectUsers.push({ label: teammate['fullname'], value: teammate._id, userid: teammate['id_user']['_id'] })
          });
          console.log('[WS-REQUESTS-MSGS] ---> TEAMMATES ARRAY ', this.projectTeammates)
        }
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] GET TEAMMATES - ERROR  ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] GET TEAMMATES * COMPLETE *');

      });
  }

  // -------------------------------------------------------------
  // @ Subscribe to current USER
  // -------------------------------------------------------------
  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        if (user) {
          this.currentUserID = user._id
          // this.logger.log('[WS-REQUESTS-MSGS] - USER ', user);
          this.logger.log('[WS-REQUESTS-MSGS] GET LOGGED USER currentUserID', this.currentUserID)
          this.logged_user_fullname = user.firstname + ' ' + user.lastname
        }
      });
  }
  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    // this.logger.log('[REQUEST-DTLS-X-PANEL] - setMomentLocale browserLang', this.browserLang)

    let stored_preferred_lang = undefined
    if (this.auth.user_bs && this.auth.user_bs.value) {
      stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
    }
    // const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
    let dshbrd_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      dshbrd_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      dshbrd_lang = stored_preferred_lang
    }
    moment.locale(dshbrd_lang)

  }

  openImageViewerModal(imageMetadata) {
    // this.logger.log("[WS-REQUESTS-MSGS] downloadImage imageMetadata  ", imageMetadata);
    this.imageViewerModal = document.getElementById("image-viewer-modal");
    this.imageViewerModal.style.display = "block";
    var modalImg = <HTMLImageElement>document.getElementById("image-viewer-img");
    var captionText = document.getElementById("caption");
    modalImg.src = imageMetadata.src
    if (captionText) {

      captionText.innerHTML = imageMetadata.name ? imageMetadata.name : decodeURIComponent(decodeURIComponent(imageMetadata.name).split('/').pop());
      // this.logger.log('XXXX ', decodeURIComponent(decodeURIComponent(url).split('/').pop()))
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getSafaryBrowser() {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    // this.logger.log("[WS-REQUESTS-MSGS]] isSafari ",this.isSafari);
  }

 

  getAppsInstalledApps() {
    let promise = new Promise((resolve, reject) => {
      this.appStoreService.getInstallationWithApp(this.id_project).then((installations: any) => {
        // this.logger.log("[WS-REQUESTS-MSGS] Get Installation Response: ", installations);

        this.dashboardApps = []
        this.webchatApps = []

        installations.forEach(installation => {

          if (installation.app !== null && installation.app.version === 'v2') {

            this.logger.log('getInstallationsPopulateWithApp installation.app  where', installation.app.where)
            if (installation.app.where.dashboard === true) {
              this.dashboardApps.push(installation.app)
            }

            if (installation.app.where.webchat === true) {
              this.webchatApps.push(installation.app)
            }

          }
        });

        // this.logger.log("[WS-REQUESTS-MSGS] DASHBOARD APPS ARRAY: ", this.dashboardApps);
        // this.logger.log("[WS-REQUESTS-MSGS] WEBCHAT APPS ARRAY: ", this.webchatApps);



        if (this.dashboardApps && this.dashboardApps.length > 0 && this.CHAT_PANEL_MODE === false) {
          this.displayAppsinSidebar = true
          // this.logger.log("[WS-REQUESTS-MSGS] - DASHBOARD - DISPLAY APPS ", this.displayAppsinSidebar);
        }

        if (this.webchatApps && this.webchatApps.length > 0 && this.CHAT_PANEL_MODE === true) {
          this.displayAppsinSidebar = true
          // this.logger.log("[WS-REQUESTS-MSGS] - CHAT - DISPLAY APPS ", this.displayAppsinSidebar);
        }
        resolve(installations);
      }).catch((err) => {
        this.logger.error("[WS-REQUESTS-MSGS] Error getting installation: ", err);
        reject(err);
      })
    })
    return promise;

  }

  getfromStorageIsOpenAppSidebar() {
    const isOpenAppSidebar = this.usersLocalDbService.getStoredIsOpenAppSidebar();
    this.logger.log("[WS-REQUESTS-MSGS] isOpenAppSidebar ", isOpenAppSidebar);

    const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const elemRightSidebar = <HTMLElement>document.querySelector('.right-card');

    if (isOpenAppSidebar) {
      if (isOpenAppSidebar === 'true') {
        this.OPEN_APPS_RIGHT_SIDEBAR = true
        if (this.CHAT_PANEL_MODE === true) {


          _elemMainPanel.classList.add("main-panel-chat-appsidebar-open");
          elemRightSidebar.classList.add("right-card-appsidebar-open");
        }
        setTimeout(() => {
          const elemMainContent = <HTMLElement>document.querySelector('.main-content');
          this.apps_sidebar_height = elemMainContent.clientHeight + 60 + 'px'
        }, 250);
      } else {
        this.OPEN_APPS_RIGHT_SIDEBAR = false;

        if (this.CHAT_PANEL_MODE === true) {
          _elemMainPanel.classList.remove("main-panel-chat-appsidebar-open");
          elemRightSidebar.classList.remove("right-card-appsidebar-open");
        }
      }
    } else {
      this.logger.log("[WS-REQUESTS-MSGS] isOpenAppSidebar is null");
      this.OPEN_APPS_RIGHT_SIDEBAR = false;
      if (this.CHAT_PANEL_MODE === true) {
        _elemMainPanel.classList.remove("main-panel-chat-appsidebar-open");
        elemRightSidebar.classList.remove("right-card-appsidebar-open");
      }
    }
  }



  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[WS-REQUESTS-MSGS] browserLang', this.browserLang)
  }

  unsuscribeRequesterPresence(requester_id) {
    this.wsRequestsService.unsubscribeToWS_RequesterPresence(requester_id);
  }

  getFirebaseAuth() {
    this.logger.log('[WS-REQUESTS-MSGS] - this.appConfigService.getConfig().firebaseAuth  ', this.appConfigService.getConfig().firebaseAuth);
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.FIREBASE_AUTH = true;
      this.logger.log('[WS-REQUESTS-MSGS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    } else if (this.appConfigService.getConfig().firebaseAuth === false) {
      this.FIREBASE_AUTH = false;
      this.logger.log('[WS-REQUESTS-MSGS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    }
  }

  getBaseUrlsFromAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;

    const appID = this.appConfigService.getConfig().firebase.appId
    this.logger.log('[WS-REQUESTS-MSGS] getAppConfig - APP ID: ', appID);

    if (appID === "1:269505353043:web:b82af070572669e3707da6") {
      this.DISPLAY_BTN_CREATE_JIRA_ISSUE = false;
    } else {
      this.DISPLAY_BTN_CREATE_JIRA_ISSUE = false;
    }


    this.logger.log('[WS-REQUESTS-MSGS] getAppConfig - SERVER_BASE_PATH: ', this.SERVER_BASE_PATH);
    this.logger.log('[WS-REQUESTS-MSGS] getAppConfig - CHAT_BASE_URL: ', this.CHAT_BASE_URL);
  }

  getBaseUrl() {
    const href = window.location.href;
    // thia.logger.log('[WS-REQUESTS-MSGS] - getBaseUrl - href ', href)

    const hrefArray = href.split('/#/');
    this.dshbrdBaseUrl = hrefArray[0]
    // thia.logger.log('[WS-REQUESTS-MSGS] - getBaseUrl - dshbrdBaseUrl ', this.dshbrdBaseUrl)
  }

  getProfileImageStorage() {

    this.imageStorage$ = this.usersService.imageStorage$.value;
    this.logger.log('[WS-REQUESTS-LIST] - IMAGE STORAGE usersService BS value', this.imageStorage$);


    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.imageStorage = firebase_conf['storageBucket']
      this.logger.log('[WS-REQUESTS-MSGS] IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.imageStorage = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[WS-REQUESTS-MSGS] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[WS-REQUESTS-MSGS] - IS MOBILE ', this.isMobile);

    // CUSTOMIZE CARDS AND NAVBAR IF TILEDESK DASHBOARD IS RUNNED ON MOBILE
    if (this.isMobile) {
      const elemMainContent = <HTMLElement>document.querySelector('.main-content');
      elemMainContent.setAttribute('style', 'padding-right: 0px; padding-left: 0px; padding-top: 0px');
      this.logger.log('[WS-REQUESTS-MSGS] - MOBILE DETECTED - SET ATTIBUTE TO MAIN CONTENT ', elemMainContent);
    }

  }

  // --------------------------------------------------------------------------------------------------------------------------------
  // @ Get if the route url is request-for-panel (i.e. this component is displayed in the iframe of the right side panel of the chat )
  // --------------------------------------------------------------------------------------------------------------------------------
  getIfRouteUrlIsRequestForPanel() {
    this.CHAT_PANEL_MODE = false
    if (this.router.url.indexOf('/request-for-panel') !== -1) {
      this.CHAT_PANEL_MODE = true;
      // thia.logger.log('[WS-REQUESTS-MSGS] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);

      const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      // thia.logger.log('[WS-REQUESTS-MSGS] - CHAT_PANEL_MODE »»» _elemMainPanel', _elemMainPanel);
      _elemMainPanel.classList.add("main-panel-chat-panel-mode");

    } else {

      this.CHAT_PANEL_MODE = false;
      // this.CHAT_PANEL_MODE = true; // Nikola to test chat mode
      // thia.logger.log('[WS-REQUESTS-MSGS] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);
      const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      // thia.logger.log('[WS-REQUESTS-MSGS] - CHAT_PANEL_MODE »»» _elemMainPanel', _elemMainPanel);
      if (_elemMainPanel.classList.contains('main-panel-chat-panel-mode')) {
        _elemMainPanel.classList.remove("main-panel-chat-panel-mode");
      }
    }
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[WS-REQUESTS-MSGS]  getAppConfig public_Key', this.public_Key)

    let keys = this.public_Key.split("-");
    this.logger.log('[WS-REQUESTS-MSGS] - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('[WS-REQUESTS-MSGS] public_Key key', key)
      if (key.includes("LBS")) {
        // this.logger.log('[WS-REQUESTS-MSGS] - key', key);
        let lbs = key.split(":");
        // this.logger.log('[WS-REQUESTS-MSGS] - lbs key&value', lbs);

        if (lbs[1] === "F") {
          this.isVisibleLBS = false;
          // this.logger.log('[WS-REQUESTS-MSGS] - lbs is', this.isVisibleLBS);
        } else {
          this.isVisibleLBS = true;
          // this.logger.log('[WS-REQUESTS-MSGS] - lbs is', this.isVisibleLBS);
        }
      }

      if (key.includes("PAY")) {
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePaymentTab = false;
        } else {
          this.isVisiblePaymentTab = true;
        }
      }

      if (key.includes("OVP")) {
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.overridePay = false;
        } else {
          this.overridePay = true;
        }
      }

      if (key.includes("APP")) {
        let app = key.split(":");
        if (app[1] === "F") {
          this.isVisibleAPP = false;
        } else {
          this.isVisibleAPP = true;
        }
        //  thia.logger.log('PUBLIC-KEY (SIDEBAR) - IS VISIBLE APP ', this.isVisibleAPP);
      }
    });
    if (!this.public_Key.includes("LBS")) {
      // this.logger.log('PUBLIC-KEY (SIDEBAR) - key.includes("LBS")', this.public_Key.includes("LBS"));
      this.isVisibleLBS = false;
    }
    if (!this.public_Key.includes("APP")) {
      this.isVisibleAPP = false;
    }

    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePaymentTab = false;
    }

    if (!this.public_Key.includes("OVP")) {
      this.overridePay = false;
    }


  }

  // -------------------------------------------------------------
  // @ JIRA (CREATE A JIRA DISPLAYED ONLY IN PRE)
  // -------------------------------------------------------------
  selectJiraType() {
    this.logger.log('[WS-REQUESTS-MSGS] - Selected jira type ', this.selectedJiraType);
  }

  createJiraTicket() {
    const transcript_url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.html'
    const url = `https://tiledesk.atlassian.net/secure/CreateIssueDetails!init.jspa?summary=${this.request.first_text}&description=${this.request.first_text}` + "%0A" + `${transcript_url}&pid=10000&issuetype=${this.selectedJiraType}&reporter=5e21d01f010b260ca87b14ba`;
    window.open(url, '_blank');
  }


  // -------------------------------------------------------------
  // @ Subscribe to project user role
  // -------------------------------------------------------------
  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[WS-REQUESTS-MSGS] - GET CURRENT PTOJECT-USER ROLE - userRole ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.CURRENT_USER_ROLE = userRole;
      })
  }

  // -------------------------------------------------------------
  // @ Subscribe to current project
  // -------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        // this.logger.log('[WS-REQUESTS-MSGS GET CURRENT PROJECT - project: ', project)
        if (project) {
          this.logger.log('[WS-REQUESTS-MSGS] GET CURRENT PROJECT project._id (NEW)', project._id)
          this.logger.log('[WS-REQUESTS-MSGS] GET CURRENT PROJECT this.project_id (OLD)', this.id_project)

          this.id_project = project._id;
          this.project_name = project.name;
          this.findCurrentProjectAmongAll(this.id_project)
        }
      });
  }

  findCurrentProjectAmongAll(projectId: string) {
    this.cacheService.clearCache()
    this.bannedVisitorsArray = []
    this.projectService.getProjects().subscribe((projects: any) => {
      //  this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - projects ', projects);

      this.current_selected_prjct = projects.find(prj => prj.id_project.id === projectId);
      this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - current_selected_prjct ', this.current_selected_prjct);

      if (this.current_selected_prjct &&
        this.current_selected_prjct.id_project &&
        this.current_selected_prjct.id_project.settings) {
        console.log('[WS-REQUESTS-MSGS] - GET PROJECTS - projects > id_project > setting', this.current_selected_prjct.id_project.settings);
        if (this.current_selected_prjct.id_project.settings && this.current_selected_prjct.id_project.settings.chatbots_attributes_hidden) {

          this.HIDE_CHATBOT_ATTRIBUTES = this.current_selected_prjct.id_project.settings.chatbots_attributes_hidden;
          this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - HIDE_CHATBOT_ATTRIBUTES 1', this.HIDE_CHATBOT_ATTRIBUTES);

        } else {
          this.HIDE_CHATBOT_ATTRIBUTES = false;
          this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - HIDE_CHATBOT_ATTRIBUTES 2', this.HIDE_CHATBOT_ATTRIBUTES)
        }

        // Allow to send emoji
        const allowSendEmoji = this.current_selected_prjct.id_project.settings.allow_send_emoji;

        if (allowSendEmoji !== undefined) {
          this.ALLOW_TO_SEND_EMOJI = allowSendEmoji;
          console.log('[WS-REQUESTS-MSGS] - allow_send_emoji GET PROJECTS - ALLOW_TO_SEND_EMOJI 1', this.ALLOW_TO_SEND_EMOJI);
        } else {
          this.ALLOW_TO_SEND_EMOJI = true;
          console.log('[WS-REQUESTS-MSGS] - allow_send_emoji not set, defaulting to true ', this.ALLOW_TO_SEND_EMOJI);
        }

        // Is Enabled URLs Whitelist
        const isEnabledURLsWhitelist = this.current_selected_prjct.id_project.settings.allowed_urls;
        if (isEnabledURLsWhitelist !== undefined) {
          this.IS_ENABLED_URLS_WHITELIST = isEnabledURLsWhitelist;
          console.log('[WS-REQUESTS-MSGS] - IS_ENABLED_URLS_WHITELIST', this.IS_ENABLED_URLS_WHITELIST);
          if (this.IS_ENABLED_URLS_WHITELIST) {
            const urlsWitheList = this.current_selected_prjct.id_project.settings.allowed_urls_list
            if (urlsWitheList !== undefined) {
              this.URLS_WITHELIST = urlsWitheList;
              console.log('[WS-REQUESTS-MSGS] - URLS_WITHELIST', this.URLS_WITHELIST);
            }
            console.log('[WS-REQUESTS-MSGS] - URLS_WITHELIST (2) ', this.URLS_WITHELIST);
          }
        } else {
          this.IS_ENABLED_URLS_WHITELIST = false;
          console.log('[WS-REQUESTS-MSGS] - IS_ENABLED_URLS_WHITELIST not set, defaulting to false ', this.IS_ENABLED_URLS_WHITELIST);
        }


        // if (this.current_selected_prjct.id_project.settings && this.current_selected_prjct.id_project.settings.allow_send_emoji) {

        //   this.ALLOW_TO_SEND_EMOJI = this.current_selected_prjct.id_project.settings.allow_send_emoji;
        //   console.log('[WS-REQUESTS-MSGS] - allow_send_emoji GET PROJECTS - ALLOW_TO_SEND_EMOJI 1', this.ALLOW_TO_SEND_EMOJI);

        // } else {
        //   this.ALLOW_TO_SEND_EMOJI = true;
        //  console.log('[WS-REQUESTS-MSGS] - GET PROJECTS - HIDE_CHATBOT_ATTRIBUTES 2', this.HIDE_CHATBOT_ATTRIBUTES)
        // }
      } else {
        this.HIDE_CHATBOT_ATTRIBUTES = false;
        this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - HIDE_CHATBOT_ATTRIBUTES 3', this.HIDE_CHATBOT_ATTRIBUTES)

        this.ALLOW_TO_SEND_EMOJI = true
        console.log('[WS-REQUESTS-MSGS] - allow_send_emoji GET PROJECTS - ALLOW_TO_SEND_EMOJI 3', this.ALLOW_TO_SEND_EMOJI)
      }


      if (this.current_selected_prjct && this.current_selected_prjct.id_project && this.current_selected_prjct.id_project.bannedUsers) {
        this.bannedVisitorsArray = this.current_selected_prjct.id_project.bannedUsers;
        this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - projects > bannedVisitorsArray', this.bannedVisitorsArray);
      }


      this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS - projects ', projects);
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET PROJECTS - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET PROJECTS * COMPLETE * ');
    });
  }

  getRequesByIdRest(requestid) {
    this.wsRequestsService.getConversationByIDWithRestRequest(requestid)
      .subscribe((request: any) => {
        //  this.logger.log('[WS-REQUESTS-MSGS] - GET REQUEST BY ID (REST CALL) - RES NIKO ', request);
        if (request) {
          this.REQUEST_EXIST = true
        }

      }, (error) => {
        // this.showSpinner = false;
        this.logger.error('[WS-REQUESTS-MSGS] - GET REQUEST BY ID (REST CALL) - ERROR  ', error);
        this.REQUEST_EXIST = false
      }, () => {
        // this.showSpinner = false;
        this.logger.log('[WS-REQUESTS-MSGS] - GET REQUEST BY ID  (REST CALL) * COMPLETE *');
      });

  }


  // ----------------------------------------------------------------------------
  // Get the request id from url params and then with this
  // start the subscription to websocket request by id
  // ----------------------------------------------------------------------------
  getParamRequestId() {
    this.route.params.subscribe((params) => {
      // this.logger.log('[WS-REQUESTS-MSGS] - getParamRequestId  ', params);
      if (params.requestid) {
        this.getRequesByIdRest(params.requestid)
      }
      this.getBotConversationAttribute(params.requestid)
      if (this.id_request) {
        // this.logger.log('[WS-REQUESTS-MSGS] - getParamRequestId - id_request ', this.id_request);

        // Unsubcribe from old request
        this.unsuscribeRequestById(this.id_request);
        // Unsubcribe from old msgs
        this.unsuscribeMessages(this.id_request);
      }

      if (this.id_request !== undefined) { // this avoid to apply 'redirectTo' when the page is refreshed (indeed in this case this.id_request is undefined)
        if (this.id_request !== params.requestid) { // this occur when the user click on the in-app notification when is in the request' details page

          this.redirectTo('project/' + params.projectid + '/wsrequest/' + params.requestid + '/messages', params.projectid);
        }
      }

      this.id_request = params.requestid;

      // this.logger.log('[WS-REQUESTS-MSGS] request_id (new)', this.id_request);
    });

    if (this.id_request) {
      this.subscribeToWs_RequestById(this.id_request);
    }
  }


  getBotConversationAttribute(requestid) {
    // this.logger.log('HERE YES requestid', requestid)
    this.wsRequestsService.getBotConversationAttribute(requestid)
      .subscribe((data: any) => {
        if (data) {
          this.botConversationArray = []
          for (let [key, value] of Object.entries(data)) {

            // this.logger.log(`[WS-REQUESTS-MSGS] - GET CONVERSATION WITH BOT key : ${key} - value ${value}`);

            let _value: any;
            if (typeof value === 'object' && value !== null) {
              // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
              _value = JSON.stringify(value)
            } else {
              _value = value
            }

            // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
            let letterLength = {};
            let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

            for (let letter of letters) {
              let span = document.createElement('span');
              span.append(document.createTextNode(letter));
              span.style.display = "inline-block";
              document.body.append(span);
              letterLength[letter] = span.offsetWidth;
              span.remove();
            }
            let totalLength = 0;

            // for (let i = 0; i < _value.length; i++) {
            //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
            // }
            if (_value) {
              for (let i = 0; i < _value.length; i++) {
                if (letterLength[_value[i]] !== undefined) {
                  totalLength += letterLength[_value[i]];
                } else {
                  // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                  totalLength += letterLength['S'];
                }
              }
              // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

              let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
              // if (key !== 'decoded_jwt') {
              this.botConversationArray.push(entries)
            }
          }
          // this.logger.log('[WS-REQUESTS-MSGS] - GET CONVERSATION WITH BOT botConversationArray: ', this.botConversationArray);

        } else {
          // this.logger.log('[WS-REQUESTS-MSGS] - GET CONVERSATION WITH BOT -  DATA IS UNDEFINED ');
        }
        // this.logger.log('[WS-REQUESTS-MSGS] - GET CONVERSATION WITH BOT - RES: ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - GET CONVERSATION WITH BOT - ERROR: ', err);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - GET CONVERSATION WITH BOT * COMPLETE *');
      });
  }

  // https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
  redirectTo(uri: string, projectid: string) {
    this.router.navigateByUrl('project/' + projectid + '/wsrequest/loading', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri]));
  }


  /**
   * Unsuscribe Request-by-id
   * @param idrequest 
   */
  unsuscribeRequestById(idrequest) {
    // this.logger.log('[WS-REQUESTS-MSGS] - unsuscribeRequestById ', idrequest);
    this.wsRequestsService.unsubscribeTo_wsRequestById(idrequest);
  }

  /**
   * Unsuscribe Messages
   * @param idrequest 
   */
  unsuscribeMessages(idrequest) {
    this.wsMsgsService.unsubsToWS_MsgsByRequestId(idrequest);
  }



  // -----------------------------------------------------------------------------------------------------
  // @ Request-by-id ws-subscription (called On init > getParamRequestId) and get 
  // -----------------------------------------------------------------------------------------------------
  /**
   * Start subscription to Websocket request-by-id and get the request published by behaviourSubject
   * Note: in getWsRequestById$() is runned the sunscription to WS MSGS (subscribeToWs_MsgsByRequestId())
   * @param id_request 
   */
  subscribeToWs_RequestById(id_request) {
    // this.logger.log('[WS-REQUESTS-MSGS] - CALLING SUBSCRIBE to Request-By-Id: ', id_request)
    let _id_request = ''
    if (id_request.includes('%2B')) {
      // this.logger.log('[WS-REQUESTS-MSGS] - CALLING SUBSCRIBE to Request-By-Id id_request contains %2B' ,id_request.includes('%2B') ,' run replace' )
      _id_request = id_request.replace(/\%2B/g, '+')

    } else {
      // this.logger.log('[WS-REQUESTS-MSGS] - CALLING SUBSCRIBE to Request-By-Id id_request NOT contains %2B' ,id_request.includes('%2B') , )
      _id_request = id_request
    }


    // Start websocket subscription ro ws request by id
    // this.wsRequestsService.subscribeTo_wsRequestById(id_request);
    this.wsRequestsService.subscribeTo_wsRequestById(_id_request);

    // Subscribe to ws request by id
    this.getWsRequestById$();
  }

  // No more used -> replaced by google maps link
  openMapRightSideBar() {
    this.OPEN_MAP_RIGHT_SIDEBAR = true;
    this.logger.log('[WS-REQUESTS-LIST] »»»» OPEN RIGHT SIDEBAR ', this.OPEN_MAP_RIGHT_SIDEBAR);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WS-REQUESTS-LIST] - REQUEST-MAP - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT (MAIN-CONTENT)', elemMainContent.clientHeight);
    this.conv_detail_map_sidebar_height = elemMainContent.clientHeight + 60 + 'px';
    this.logger.log('[WS-REQUESTS-LIST] - REQUEST-MAP - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.conv_detail_map_sidebar_height);
    // if (this.CHAT_PANEL_MODE === true) {
    //   _elemMainPanel.classList.add("main-panel-map-open");
    // }
  }
  // No more used -> replaced by google maps link
  handleCloseMapRightSidebar(event) {
    this.logger.log('[WS-REQUESTS-LIST] »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_MAP_RIGHT_SIDEBAR = false;
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // if (this.CHAT_PANEL_MODE === true) {
    //   _elemMainPanel.classList.remove("main-panel-map-open");
    // }
  }

  viewInGooleMaps() {
    this.logger.log('this.locationLat', this.locationLat)
    this.logger.log('this.locationLng', this.locationLng)
    const url = `https://www.google.com/maps/search/?api=1&query=${this.locationLat},${this.locationLng}`
    window.open(url, '_blank');
  }

  // -----------------------------------
  // @ Subscribe to bs request by id
  // -----------------------------------

  editTicketSubjectFocusOut() {
    this.ticketSubjectEditMode = false
    // this.logger.log('[WS-REQUESTS-MSGS] - editTicketSubjectFocusOut  ticketSubjectEditMode', this.ticketSubjectEditMode)
  }

  saveEditInPlaceSubject() {
    // this.logger.log('[WS-REQUESTS-MSGS] - editTicketSubjectonFocusOut saveSubject ', this.ticketSubject)
    this.wsRequestsService.updateRequestsById_UpdateTicketSubject(this.id_request, this.ticketSubject)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] - UPDATE TICKET SUBJECT - RES: ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - UPDATE TICKET SUBJECT - ERROR: ', err);
        this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('UserEditAddPage.AnErrorHasOccurred'), 4, 'report_problem');
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - UPDATE TICKET SUBJECT * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('SubjectUpdatedSuccessfully'), 2, 'done');
        this.ticketSubjectEditMode = false
      });
  }

  removeTicket() {
    this.ticketSubject = ''
  }

  // getTagContainerElementHeightAfterViewInit() {
  //   setTimeout(() => {
  //     const tagContainerElement = <HTMLElement>document.querySelector('.tags--container');
  //     this.logger.log('tagContainerElement.offsetHeight ', tagContainerElement)
  //     if (tagContainerElement) {
  //       this.logger.log('tagContainerElement.offsetHeight ', tagContainerElement.offsetHeight)
  //       // this.tagContainerElementHeight = tagContainerElement.offsetHeight
  //       this.tagContainerElementHeight = (292 + tagContainerElement.offsetHeight) + 'px';
  //       this.logger.log('this.tagContainerElementHeight ', this.tagContainerElementHeight)
  //     }
  //   }, 1500);
  // }


  millisToMinutesAndSecondsNoFixedPoint(millis) {
    let seconds = (millis / 1000).toFixed();
    let minutes = (millis / (1000 * 60)).toFixed();
    let hours = (millis / (1000 * 60 * 60)).toFixed();
    let days = (millis / (1000 * 60 * 60 * 24)).toFixed();
    if (+seconds < 60) return seconds + " " + this.translate.instant('Analytics.Seconds');
    else if (+minutes < 60) return minutes + " " + this.translate.instant('Analytics.Minutes');
    else if (+hours < 24) return hours + " " + this.translate.instant('Analytics.Hours');
    else return days + " " + this.translate.instant('Analytics.Days');

  }

  millisToMinutesAndSeconds(millis) {
    // let minutes = Math.floor(millis / 60000);
    // let seconds = ((millis % 60000) / 1000).toFixed(0);
    // return minutes + ":" + (+seconds < 10 ? '0' : '') + seconds;

    // const seconds = milliseconds / 1000;
    // const minutes = seconds / 60;
    // return minutes;


    // let milliseconds = Math.floor((millis % 1000) / 100)
    // let seconds = Math.floor((millis / 1000) % 60)
    // let minutes = Math.floor((millis / (1000 * 60)) % 60)
    // let hours = Math.floor((millis / (1000 * 60 * 60)) % 24)

    // let h = (hours < 10) ? "0" + hours : hours;
    // let m = (minutes < 10) ? "0" + minutes : minutes;
    // let s = (seconds < 10) ? "0" + seconds : seconds;

    // return h + ":" + m + ":" + s + "." + milliseconds;

    let seconds = (millis / 1000).toFixed(1);
    let minutes = (millis / (1000 * 60)).toFixed(1);
    let hours = (millis / (1000 * 60 * 60)).toFixed(1);
    let days = (millis / (1000 * 60 * 60 * 24)).toFixed(1);
    if (+seconds < 60) return seconds + " " + this.translate.instant('Analytics.Seconds');
    else if (+minutes < 60) return minutes + " " + this.translate.instant('Analytics.Minutes');
    else if (+hours < 24) return hours + " " + this.translate.instant('Analytics.Hours');
    else return days + " " + this.translate.instant('Analytics.Days');

  }



  async getWsRequestById$() {
    this.wsRequestsService.wsRequest$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(async (wsrequest) => {

        console.log('[WS-REQUESTS-MSGS] - getWsRequestById$ *** wsrequest *** NIKO 2 ', wsrequest)
        this.request = wsrequest;

        console.log('[WS-REQUESTS-MSGS] wsrequest status this.request ', this.request.status)

        if (this.request.status !== 1000) {
          this.roleService.checkRoleForCurrentProject('wsrequest-detail')
        } else {
          this.roleService.checkRoleForCurrentProject('wsrequest-detail-history')
        }


        if (this.request) {
          this.getfromStorageIsOpenAppSidebar()

          //  this.currentUserIdIsInParticipants this.hasmeInParticipants( this.request.participants)

          // -----------------------------
          // Request dnis (called number) 
          // -----------------------------
          if (this.request.attributes && this.request.attributes.payload && this.request.attributes.payload.dnis) {
            this.dialedNumberIdentificationService = this.request.attributes.payload.dnis
          } else if (this.request.attributes && this.request.attributes && this.request.attributes.dnis) {
            this.dialedNumberIdentificationService = this.request.attributes.dnis
          } else {
            this.dialedNumberIdentificationService = "N/A"
          }


          // -----------------------------
          // Request duration 
          // -----------------------------
          if (this.request.duration) {
            const duration = this.request.duration;
            this.logger.log('[WS-REQUESTS-MSGS] - duration ', duration)
            this.requestDuration = this.millisToMinutesAndSecondsNoFixedPoint(duration)
            this.logger.log('[WS-REQUESTS-MSGS] - requestDuration ', this.requestDuration)
          } else {
            this.requestDuration = "N/A"
          }

          if (this.request.subject) {
            this.ticketSubject = this.request.subject
          }

          if (this.request.attributes && this.request.attributes.ipAddress) {
            this.ipAddress = this.request.attributes.ipAddress
          } else {
            this.ipAddress = "not available"
          }

          if (this.request['closed_at']) {
            const requestclosedAt = moment(this.request['closed_at']);
            // this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - requestclosedAt ', requestclosedAt)
            const currentTime = moment();
            this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - currentTime ', currentTime)


            const daysDiff = currentTime.diff(requestclosedAt, 'd');
            // this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - daysDiff ', daysDiff)


            if (daysDiff > 10) {
              this.disableReopeRequest = true;
              // this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - disableReopeRequest ', this.disableReopeRequest)
            }
          }

          // this.logger.log('[WS-REQUESTS-MSGS] - this.request: ', this.request);
          if (this.request.lead) {
            this.logger.log('[WS-REQUESTS-MSGS] request.lead ', this.request.lead)
            this.getContactRequests(this.request.lead._id)
            this.request.lead.email
          }


          if (this.request['closed_by']) {
            if (this.request['closed_by'] === "_bot_unresponsive") {
              this.request['closed_by_label'] = "auto closing Bot"
            } else if (this.request['closed_by'] === "_trigger") {
              this.request['closed_by_label'] = this.translate.instant('By') + ' ' + "Trigger"
            } else {
              const storedTeammate = this.usersLocalDbService.getMemberFromStorage(this.request['closed_by']) //  localStorage.getItem('dshbrd----' + this.request['closed_by'] )

              if (storedTeammate) {
                console.log('[WS-REQUESTS-MSGS] request >  closed_by storedTeammate ', storedTeammate)
                this.logger.log('[WS-REQUESTS-MSGS] request >  closed_by storedTeammateObjct ', storedTeammate)
                this.request['closed_by_label'] = this.translate.instant('By') + ' ' + storedTeammate['firstname'] + ' ' + storedTeammate['lastname']
                this.logger.log('[WS-REQUESTS-MSGS] request >  closed_by label ', this.request['closed_by_label'])
              } else {
                this.usersService.getProjectUserByUserId(this.request['closed_by'])
                  .subscribe((projectUser: any) => {
                    // this.logger.log('projectUser ', projectUser)
                    if (projectUser && projectUser[0] && projectUser[0].id_user) {
                      this.usersLocalDbService.saveMembersInStorage(projectUser[0].id_user._id, projectUser[0].id_user, 'ws-requests-msgs');
                      this.logger.log('WS-REQUESTS-MSGS] GET projectUser by USER-ID projectUser id', projectUser);
                      this.request['closed_by_label'] = this.translate.instant('By') + ' ' + projectUser[0].id_user.firstname + ' ' + projectUser[0].id_user.lastname
                    } else {
                      // this.logger.log('[WS-REQUESTS-MSGS] THE REQUEST HAS NOT BEEN CLOSED BY A PROJECT USER');
                      this.request['closed_by_label'] = this.translate.instant('By') + ' ' + this.request.requester_fullname
                    }
                  }, (error) => {
                    this.logger.error('[WS-REQUESTS-MSGS] GET projectUser by USER-ID - ERROR ', error);
                  }, () => {
                    this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID * COMPLETE *');
                  });
              }
            }
          }

          // -------------------------------------------------------------------
          // @ followers  && ( this.projectTeammates && this.projectTeammates.length > 0)
          // -------------------------------------------------------------------
          if ((this.request && this.request.followers && this.request.followers.length > 0)) {
            // this.logger.log('this.request.followers id', this.request.followers)
            const storedProjectUsersArray = []
            this.request.followers.forEach(requestfollowerid => {
              // this.logger.log('requestfollowerid ', requestfollowerid)
              let storedProjectUser = localStorage.getItem('dshbrd----' + requestfollowerid)
              // this.logger.log('follower from storage ', storedProjectUser)
              // this.logger.log('follower  parsed from storage ', storedProjectUser)
              if (storedProjectUser) {
                const parsedStoredProjectUser = JSON.parse(storedProjectUser)
                // this.logger.log('follower parsed from storage ', parsedStoredProjectUser)
                let fullname = parsedStoredProjectUser['firstname'] + ' ' + parsedStoredProjectUser['lastname']
                // this.logger.log('follower fullname' ,fullname ) 
                let id_user = parsedStoredProjectUser['_id']
                if (id_user === this.currentUserID) {
                  // this.logger.log('CURRENT USER IS A FOLLOWER')
                  this.CURRENT_USER_IS_A_FOLLOWER = true
                }
                // this.logger.log('follower id_user' ,id_user ) 
                //  this.projectTeammates.push({ label: teammate['fullname'], value: teammate._id, userid: teammate['id_user']['_id'] })
                storedProjectUsersArray.push({ label: fullname, value: requestfollowerid, userid: id_user })
              }
            });
            // this.logger.log('follower storedProjectUsersArray' ,storedProjectUsersArray ) 
            this.selectedFollowers = storedProjectUsersArray;
            this.followers = storedProjectUsersArray

            // Filter array of objects with another array of objects
            // https://stackoverflow.com/questions/31005396/filter-array-of-objects-with-another-array-of-objects 
            // const myArrayFiltered = this.projectTeammates.filter((el) => {
            //   return this.request.followers.some((f) => {
            //     return f === el.value
            //   });
            // });
            // this.selectedFollowers = myArrayFiltered;
            // this.followers = myArrayFiltered
            // this.logger.log('this.request. myArrayFiltered', myArrayFiltered)

          }


          // -------------------------------------------------------------------
          // Locaction: country & city
          // -------------------------------------------------------------------
          if (this.request.location) {
            this.request['dept'] = this.request.department;

            if (this.request.lead && this.request.lead.fullname) {
              this.request['requester_fullname'] = this.request.lead.fullname;
            } else {
              this.request['requester_fullname'] = 'N/A';
            }

            this.wsRequestsUnserved = []
            this.wsRequestsServed = []
            if (this.request.status === 200) {
              this.wsRequestsServed.push(this.request)
              this.request['participanting_Agents'] = this.doParticipatingAgentsArray(this.request.participants, this.request.first_text, this.imageStorage$, this.UPLOAD_ENGINE_IS_FIREBASE)
            } else {
              this.wsRequestsUnserved.push(this.request)
            }


            if (this.request.location.city) {
              this.locationCity = this.request.location.city;
              // this.logger.log('[WS-REQUESTS-MSGS] - this.request > locationCity: ', this.locationCity);
            }

            if (this.request.location.country) {
              this.locationCountry = this.request.location.country
              // this.logger.log('[WS-REQUESTS-MSGS] - this.request > locationCountry: ', this.locationCountry);
            }

            if (this.request.location.geometry && this.request.location.geometry.coordinates) {
              this.locationLat = this.request.location.geometry.coordinates[0]
              this.locationLng = this.request.location.geometry.coordinates[1]
              // this.logger.log('[WS-REQUESTS-MSGS] - this.request > locationCountry: ', this.locationCountry);
            }
          }


          // -------------------------------------------------------------------
          // User Agent
          // -------------------------------------------------------------------
          const user_agent_result = this.parseUserAgent(this.request.userAgent);
          //  this.logger.log('user_agent_result  ', user_agent_result)

          if (user_agent_result.browser.name) {
            if (user_agent_result.browser.version) {
              const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
              this.request['ua_browser'] = ua_browser;
            } else {
              const ua_browser = user_agent_result.browser.name;
              this.request['ua_browser'] = ua_browser;
            }
          } else {
            const ua_browser = "N/A";
            this.request['ua_browser'] = ua_browser;
          }

          if (user_agent_result.os.name) {
            if (user_agent_result.os.version) {
              const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version;
              this.request['ua_os'] = ua_os;
            } else {
              const ua_os = user_agent_result.os.name;
              this.request['ua_os'] = ua_os;
            }
          } else {
            const ua_os = "N/A"
            this.request['ua_os'] = ua_os
          }


          // -------------------------------------------------------------------
          // Members array
          // -------------------------------------------------------------------
          this.members_array = this.request.participants;
          this.logger.log('[WS-REQUESTS-MSGS] - *** PARTICIPANTS_ARRAY ', this.members_array)
          this.logger.log('[WS-REQUESTS-MSGS] - *** currentUserID ', this.currentUserID)
          console.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ROLE ', this.CURRENT_USER_ROLE);
          this.logger.log('[WS-REQUESTS-MSGS] - *** id_project ', this.request.id_project);



          // if (!this.CURRENT_USER_ROLE) {
          //   this.CURRENT_USER_ROLE = await this.getProjectUserInProject(this.currentUserID, this.request.id_project)
          //   this.logger.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ROLE 2 ', this.CURRENT_USER_ROLE);
          // }
          if (!this.CURRENT_USER_ROLE) {
            this.CURRENT_USER_ROLE = await this.getProjectUserInProject(this.currentUserID, this.request.id_project)
            console.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ROLE 2 ', this.CURRENT_USER_ROLE);
          }

          // this.members_array.forEach(member => {
          //   this.logger.log('[WS-REQUESTS-MSGS] - *** member', member)

          //   // ----------------------------------------------------------------------------------------------
          //   // disable notes and tags if the current user has agent role and is not among the participants
          //   // ----------------------------------------------------------------------------------------------

          //   this.logger.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ID ', this.currentUserID);
          //   this.logger.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ROLE 3 ', this.CURRENT_USER_ROLE);

          //   if (this.currentUserID !== member && this.CURRENT_USER_ROLE === 'agent') {
          //     console.log('[WS-REQUESTS-MSGS] - *** CURRENT USER NOT IN PARTICIPANT AND IS AGENT currentUserID', this.currentUserID, ' CURRENT_USER_ROLE ', this.CURRENT_USER_ROLE);
          //     this.DISABLE_ADD_NOTE_AND_TAGS = true;
          //     this.logger.log('[WS-REQUESTS-MSGS] - *** DISABLE_ADD_NOTE_AND_TAGS ', this.DISABLE_ADD_NOTE_AND_TAGS);
          //     this.DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = true;
          //   } else 
          //   if (this.currentUserID === member && this.CURRENT_USER_ROLE === 'agent') {
          //     console.log('[WS-REQUESTS-MSGS] - *** CURRENT USER IS IN PARTICIPANT AND IS CURRENT_USER_ROLE ', this.CURRENT_USER_ROLE);
          //     this.DISABLE_ADD_NOTE_AND_TAGS = false;
          //     this.logger.log('[WS-REQUESTS-MSGS] - *** DISABLE_ADD_NOTE_AND_TAGS ', this.DISABLE_ADD_NOTE_AND_TAGS);
          //     this.DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = false;
          //   }

          //   this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById member ', member);
          //   this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById member is bot?', member.includes('bot_'));


          //   if (member.includes('bot_')) {
          //     this.bot_participant_id = member.substr(4);
          //     this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById id bot in participants (substring) ', this.bot_participant_id);

          //   } else {
          //     this.bot_participant_id = ''
          //   }
          // });

          // ----------------------------------------------------------------------------------------------
          // check bot participants
          // ----------------------------------------------------------------------------------------------
          this.members_array.forEach(member => {
            this.logger.log('[WS-REQUESTS-MSGS] - *** member', member);
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById member ', member);
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById member is bot?', member.includes('bot_'));

            if (member.includes('bot_')) {
              this.bot_participant_id = member.substr(4);
              this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById id bot in participants (substring) ', this.bot_participant_id);
            } else {
              this.bot_participant_id = '';
            }
          });

          // ----------------------------------------------------------------------------------------------
          // disable notes and tags if the current user has agent role and is not among the participants
          // ----------------------------------------------------------------------------------------------
          this.logger.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ID ', this.currentUserID);
          this.logger.log('[WS-REQUESTS-MSGS] - *** CURRENT_USER_ROLE ', this.CURRENT_USER_ROLE);

          if (this.CURRENT_USER_ROLE === 'agent') {
          // if (this.CURRENT_USER_ROLE !== 'owner' && this.CURRENT_USER_ROLE !== 'admin') {
            const isCurrentUserParticipant = this.members_array.includes(this.currentUserID);

            if (isCurrentUserParticipant) {
              console.log('[WS-REQUESTS-MSGS] - *** CURRENT USER IS IN PARTICIPANTS AND IS AGENT');
              this.DISABLE_ADD_NOTE_AND_TAGS = false;
              this.DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = false;
            } else {
              console.log('[WS-REQUESTS-MSGS] - *** CURRENT USER NOT IN PARTICIPANTS AND IS AGENT');
              this.DISABLE_ADD_NOTE_AND_TAGS = true;
              this.DISABLE_BTN_AGENT_NO_IN_PARTICIPANTS = true;
            }

            this.logger.log('[WS-REQUESTS-MSGS] - *** DISABLE_ADD_NOTE_AND_TAGS ', this.DISABLE_ADD_NOTE_AND_TAGS);
          }


          // ---------------------------------------------------------
          // @ Tags
          // ---------------------------------------------------------
          if (this.request.tags) {
            this.tagsArray = this.request.tags // initialize the tagsArray with the existing tags
            this.logger.log('[WS-REQUESTS-MSGS] - onInit TAGS ARRAY: ', this.tagsArray);
            // if (this.tagsArray) {
            //   setTimeout(() => {
            //     this.getTagContainerElementHeight()
            //   }, 1500);
            // }

            this.getTag();


          }

          // ---------------------------------------------------------
          // @ Notes
          // ---------------------------------------------------------
          if (this.request.notes) {
            this.notesArray = this.request.notes.reverse()
            this.logger.log('[WS-REQUESTS-MSGS] - onInit NOTES ARRAY: ', this.notesArray)

            this.notesArray.forEach(note => {
              // -----------------------------------------------------
              // Get the user by id ('createdBy' matches the user id)
              // -----------------------------------------------------
              const user = this.usersLocalDbService.getMemberFromStorage(note.createdBy);

              if (user !== null) {
                note.createdBy_user = user;
              } else {

                // -----------------------------------------------------
                // From remote if not exist in the local storage
                // -----------------------------------------------------
                this.getMemberFromRemote(note, note.createdBy);
              }

            });
          }

          // ---------------------------------------------------------
          // @ Priority
          // ---------------------------------------------------------

          if (this.request.priority) {
            this.selectedPriority = this.request.priority
            this.logger.log('[WS-REQUESTS-MSGS] selectedPriority ', this.selectedPriority);
          } else {
            this.selectedPriority = 'medium'
          }

          // ---------------------------------------------------------
          // @ Source page stripped string -  NO MORE USED !!!
          // ---------------------------------------------------------
          let stripHere = 20;
          let sourcePageStripHere = 30;
          if (this.CHAT_PANEL_MODE) {
            stripHere = 10;
            sourcePageStripHere = 10;
          }
          if (this.request.sourcePage) {
            this.sourcePageCutted = this.request.sourcePage.substring(0, sourcePageStripHere) + '...';
          }

          // ---------------------------------------------------------
          // @ Request id stripped string -  NO MORE USED !!!
          // ---------------------------------------------------------
          if (this.CHAT_PANEL_MODE) {
            stripHere = 10;
          }
          if (this.request.request_id) {
            this.requestidCutted = this.request.request_id.substring(0, stripHere) + '...';
          }

          // ---------------------------------------------------------
          // Requester is authenticated
          // ---------------------------------------------------------
          if (this.request.requester != null && this.request.requester.isAuthenticated === true) {
            this.REQUESTER_IS_VERIFIED = true;
          } else {
            this.REQUESTER_IS_VERIFIED = false;
          }

          // ---------------------------------------------------------
          // Contact
          // ---------------------------------------------------------
          if (this.request.lead) {
            this.requester_id = this.request.lead.lead_id;

            if (this.request.lead.email && !isValidEmail(this.request.lead.email)) {
              this.request.lead.email = null; // Or 'N/A', depending on what you want to display
            }
            this.contact_details = this.request.lead;
            this.logger.log('[WS-REQUESTS-MSGS] - contact_details ', this.contact_details)
            this.logger.log('[WS-REQUESTS-MSGS] - requester_id ', this.requester_id)
            // this.logger.log('this.request.lead ' , this.request.lead)
            if (this.request.lead.lead_id && this.request.lead.lead_id.startsWith('wab-')) {
              this.logger.log('[WS-REQUESTS-MSGS] lead_id ', this.request.lead.lead_id)
              this.whatsAppPhoneNumber = this.request.lead.lead_id.slice(4);
              this.logger.log('[WS-REQUESTS-MSGS] whatsAppPhoneNumber ', this.whatsAppPhoneNumber)
            }


            if (this.request.lead.lead_id && this.request.lead.lead_id.startsWith('telegram-')) {
              this.logger.log('[WS-REQUESTS-MSGS] lead_id ', this.request.lead.lead_id)
              this.telegramPhoneNumber = this.request.lead.lead_id.slice(9);
              this.logger.log('[WS-REQUESTS-MSGS] telegramPhoneNumber ', this.telegramPhoneNumber)
            }

            if (this.request.lead && this.request.lead.email) {
              this.logger.log('this.request.lead email ', this.request.lead.email)

              // used to set as initial value the existing emai in the input displayed in the chat used to change the email on flyt
              this.contactNewEmail = this.request.lead.email
              this.logger.log('[WS-REQUESTS-MSGS] contactNewEmail ', this.contactNewEmail)
            }
            this.getRequesterAvailabilityStatus(this.requester_id);
          } else {
            this.requester_id = "N/A";
          }

          // ---------------------------------------------------------
          // Rating
          // ---------------------------------------------------------
          if (this.request.rating) {
            this.rating = this.request.rating + '/5'
            this.logger.log('<<<<  this.rating ', this.rating)
          } else {
            this.rating = 'N/A 5'
          }

          if (this.request.rating_message) {
            this.rating_message = this.request.rating_message
          } else {
            this.rating_message = 'n/a'
          }

          // ---------------------------------------------------------
          // Attributes
          // ---------------------------------------------------------
          if (this.request.attributes) {
            // ----------------------------------------
            // new: display all attributes dinamically
            // ----------------------------------------
            this.attributesArray = []
            for (let [key, value] of Object.entries(this.request.attributes)) {

              this.logger.log(`[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES key : ${key} - value ${value}`);

              let _value: any;
              if (typeof value === 'object' && value !== null) {
                // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                _value = JSON.stringify(value)
              } else {
                _value = value
              }

              // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
              let letterLength = {};
              let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

              for (let letter of letters) {
                let span = document.createElement('span');
                span.append(document.createTextNode(letter));
                span.style.display = "inline-block";
                document.body.append(span);
                letterLength[letter] = span.offsetWidth;
                span.remove();
              }
              let totalLength = 0;

              // for (let i = 0; i < _value.length; i++) {
              //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
              // }
              if (_value) {
                for (let i = 0; i < _value.length; i++) {
                  if (letterLength[_value[i]] !== undefined) {
                    totalLength += letterLength[_value[i]];
                  } else {
                    // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                    totalLength += letterLength['S'];
                  }
                }
                // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
                // if (key !== 'decoded_jwt') {
                this.attributesArray.push(entries)
              }
            }
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById attributesArray: ', this.attributesArray);

          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES IS UNDEFINED ', this.request.attributes);
          }

          // ---------------------------------------------------------
          // Attributes DECODED JWT
          // ---------------------------------------------------------
          if (this.request.attributes) {
            if (this.request.attributes.decoded_jwt) {
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT  (getWsRequestById)', this.request.attributes.decoded_jwt);
              this.attributesDecodedJWTArray = []
              for (let [key, value] of Object.entries(this.request.attributes.decoded_jwt)) {

                // this.logger.log(`WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT -key : ${key} - value ${value}`);

                let _value: any;
                if (typeof value === 'object' && value !== null) {

                  // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                  _value = JSON.stringify(value)
                } else {
                  _value = value
                }
                // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
                let letterLength = {};
                let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

                for (let letter of letters) {
                  let span = document.createElement('span');
                  span.append(document.createTextNode(letter));
                  span.style.display = "inline-block";
                  document.body.append(span);
                  letterLength[letter] = span.offsetWidth;
                  span.remove();
                }
                let totalLength = 0;

                // for (let i = 0; i < _value.length; i++) {
                //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
                // }
                if (_value) {
                  for (let i = 0; i < _value.length; i++) {
                    if (letterLength[_value[i]] !== undefined) {
                      totalLength += letterLength[_value[i]];
                    } else {
                      // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                      totalLength += letterLength['S'];
                    }
                  }

                  if (key !== 'attributes') {
                    let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
                    this.attributesDecodedJWTArray.push(entries)
                  }
                }
              }
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT (getWsRequestById) - attributesDecodedJWTArray: ', this.attributesDecodedJWTArray);

            } else {

              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT (getWsRequestById) IS UNDEFINED ');
            }
          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES IS UNDEFINED (getWsRequestById) (in decoded_jwt)');
          }

          // ---------------------------------------------------------
          // Attributes DECODED JWT Attributes
          // ---------------------------------------------------------
          if (this.request.attributes) {
            if (this.request.attributes.decoded_jwt && this.request.attributes.decoded_jwt.attributes) {
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT ATTRIBUTES  (getWsRequestById) (1))', this.request.attributes.decoded_jwt.attributes);

              this.attributesDecodedJWTAttributesArray = []
              // for (let [key, value] of Object.entries(this.request.attributes.decoded_jwt.attributes)) {
              for (const [index, [key, value]] of Object.entries(Object.entries(this.request.attributes.decoded_jwt.attributes))) {

                // this.logger.log(`WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT ATTRIBUTES index :${index}: -key  ${key} - value ${value}`);

                let _value: any;
                if (typeof value === 'object' && value !== null) {

                  // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                  _value = JSON.stringify(value)
                } else {
                  _value = value
                }

                // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
                let letterLength = {};
                let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

                for (let letter of letters) {
                  let span = document.createElement('span');
                  span.append(document.createTextNode(letter));
                  span.style.display = "inline-block";
                  document.body.append(span);
                  letterLength[letter] = span.offsetWidth;
                  span.remove();
                }
                let totalLength = 0;

                if (_value) {
                  for (let i = 0; i < _value.length; i++) {
                    this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT (getWsRequestById)  _value[i] (1)', _value[i] + ": " + letterLength[_value[i]])


                    for (let i = 0; i < _value.length; i++) {
                      if (letterLength[_value[i]] !== undefined) {
                        totalLength += letterLength[_value[i]];
                      } else {
                        // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                        totalLength += letterLength['S'];
                      }
                    }
                  }
                  // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                  let entries = { 'attributeName': key, 'attributeValue': _value, 'decodedJWTType': 'Attributes', 'attributeValueL': totalLength, 'index': index };

                  this.attributesDecodedJWTAttributesArray.push(entries)
                }
              }
              this.logger.log('[WS-REQUESTS-MSGS] -  ATTRIBUTES DECODED JWT ATTRIBUTES (getWsRequestById) - attributesDecodedJWTAttributesArray (1): ', this.attributesDecodedJWTAttributesArray);

              this.attributesDecodedJWTArrayMerged = [].concat(this.attributesDecodedJWTArray, this.attributesDecodedJWTAttributesArray);

              // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT  ATTRIBUTES - attributesDecodedJWTArrayMerged: ', this.attributesDecodedJWTArrayMerged);
              // --------------------------------------------------------------------------------------------------------------
            } else {
              this.attributesDecodedJWTArrayMerged = this.attributesDecodedJWTArray
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT ATTRIBUTES (getWsRequestById) IS UNDEFINED (in decoded_jwt) (1)');
              this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES DECODED JWT ATTRIBUTES (getWsRequestById) - attributesDecodedJWTArrayMerged (1): ', this.attributesDecodedJWTArrayMerged);
            }
          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - ATTRIBUTES IS UNDEFINED (getWsRequestById) (in  decoded_jwt) (1)');
          }

          // ---------------------------------------------------------
          // Attributes PRE-CHAT FORM
          // ---------------------------------------------------------
          if (this.request.attributes && this.request.attributes.preChatForm) {
            // ----------------------------------------
            // new: display all attributes dinamically
            // ----------------------------------------
            this.preChatFormArray = []
            for (let [key, value] of Object.entries(this.request.attributes.preChatForm)) {

              this.logger.log(`[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES > PRE-CHAT FORM key : ${key} - value ${value}`);

              let _value: any;
              if (typeof value === 'object' && value !== null) {
                // this.logger.log(`:-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value is an object :`, JSON.stringify(value));
                _value = JSON.stringify(value)
              } else {
                _value = value
              }

              // https://stackoverflow.com/questions/50463738/how-to-find-width-of-each-character-in-pixels-using-javascript
              let letterLength = {};
              let letters = ["", " ", " ?", "= ", " -", " :", " _", " ,", " ", " ", " ", "(", ")", "}", "{", "\"", " ", "/", ".", "a", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

              for (let letter of letters) {
                let span = document.createElement('span');
                span.append(document.createTextNode(letter));
                span.style.display = "inline-block";
                document.body.append(span);
                letterLength[letter] = span.offsetWidth;
                span.remove();
              }
              let totalLength = 0;

              // for (let i = 0; i < _value.length; i++) {
              //   this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById _value[i]', _value[i] + ": " + letterLength[_value[i]])
              // }
              if (_value) {
                for (let i = 0; i < _value.length; i++) {
                  if (letterLength[_value[i]] !== undefined) {
                    totalLength += letterLength[_value[i]];
                  } else {
                    // if the letter not is in dictionary letters letterLength[_value[i]] is undefined so add the witdh of the 'S' letter (8px)
                    totalLength += letterLength['S'];
                  }
                }
                // this.logger.log(':-D Ws-REQUESTS-Msgs - getWsRequestById ATTRIBUTES value LENGHT ', _value + " totalLength : " + totalLength)

                let entries = { 'attributeName': key, 'attributeValue': _value, 'attributeValueL': totalLength };
                // if (key !== 'decoded_jwt') {
                this.preChatFormArray.push(entries)
              }
            }
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById preChatFormArray: ', this.preChatFormArray);

          } else {
            this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById ATTRIBUTES > PRE-CHAT FORM IS UNDEFINED ');
          }



          // -----------------------------------------------------------------------------------------------------
          // @ Msgs ws-subscription
          // -----------------------------------------------------------------------------------------------------
          // if (this.CHAT_PANEL_MODE === false)  {
          this.subscribeToWs_MsgsByRequestId(this.id_request);
          // }

          // -----------------------------------------------------------
          // DISPLAY / HIDE THE VIEW 'CONTACT' DETAIL BUTTON 
          // AND GET THE CONTACT-ID USED TO GO TO THE CONTACT DETAILS
          // -----------------------------------------------------------

          this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > CONTACT ID ', this.request);
          if (this.request.lead) {
            this.contact_id = this.request.lead._id
            this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > CONTACT ID ', this.contact_id);
            this.NODEJS_REQUEST_CNTCT_FOUND = true;
            this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);
          } else {
            this.NODEJS_REQUEST_CNTCT_FOUND = false;
            this.logger.log('[WS-REQUESTS-MSGS]: NODEJS REQUEST > FOUND ? ', this.NODEJS_REQUEST_CNTCT_FOUND);
          }


          this.logger.log('[WS-REQUESTS-MSGS] members_array', this.members_array)
          this.createAgentsArrayFromParticipantsId(this.members_array, this.requester_id, this.UPLOAD_ENGINE_IS_FIREBASE, this.imageStorage)
          this.createRequesterAvatar(this.request.lead);
          this.logger.log('[WS-REQUESTS-MSGS] - IS_CURRENT_USER_JOINED this.request.participants? ', this.request.participants, 'this.currentUserID ', this.currentUserID)
          this.IS_CURRENT_USER_JOINED = this.currentUserIdIsInParticipants(this.request.participants, this.currentUserID, this.request.request_id);
          this.logger.log('[WS-REQUESTS-MSGS] - IS_CURRENT_USER_JOINED? ', this.IS_CURRENT_USER_JOINED)
        }
      }, error => {
        this.logger.error('[WS-REQUESTS-MSGS] - getWsRequestById$ - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsRequestById$ * COMPLETE *')
      });
  }

  onChangeContactEmail(event) {
    this.logger.log('[WS-REQUESTS-MSGS] - ON CHANGE CONTACT EMAIL event ', event)
    this.contactNewEmail = event;
  }

  goToEditContact() {
    const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/contact/_edit/' + this.request.lead._id;
    window.open(url, '_blank');
  }

  decreasePageNumber() {
    this.pageNo -= 1;

    this.logger.log('[CONTACTS-DTLS] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getContactRequests(this.request.lead._id)
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.logger.log('[CONTACTS-DTLS]  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getContactRequests(this.request.lead._id)
  }

  getContactRequests(lead_id) {
    this.contactsService.getRequestsByRequesterId(lead_id, this.pageNo)

      .subscribe((requests_object: any) => {

        if (requests_object) {
          this.logger.log('[WS-REQUESTS-MSGS]] - get CONTACT REQUESTS OBJECTS ', requests_object);
          this.contact_requests = requests_object['requests'];
          this.logger.log('[WS-REQUESTS-MSGS] - get CONTACT REQUESTS LIST (got by requester_id) ', this.contact_requests);

          this.contact_requests = requests_object['requests'];


          this.contact_requests.forEach(request => {
            request.currentUserIsJoined = false;
            this.logger.log('[WS-REQUESTS-MSGS] - CONTACT REQUEST ', request)
            request.participants.forEach(p => {
              this.logger.log('[WS-REQUESTS-MSGS] CONTACT REQUEST Participant ', p);
              if (p === this.currentUserID) {
                request.currentUserIsJoined = true;
                return
              }
            })
          });


          const requestsCount = requests_object['count'];
          this.logger.log('[WS-REQUESTS-MSGS] - CONTACT REQUESTS COUNT ', requestsCount);

          this.displayHideFooterPagination(requestsCount);

          const requestsPerPage = requests_object['perPage'];
          this.logger.log('[WS-REQUESTS-MSGS]] - CONTACT N° OF REQUESTS X PAGE ', requestsPerPage);

          const totalPagesNo = requestsCount / requestsPerPage;
          this.logger.log('[WS-REQUESTS-MSGS] - CONTACT REQUESTS TOTAL PAGES NUMBER', totalPagesNo);

          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          this.logger.log('[WS-REQUESTS-MSGS] - TOTAL PAGES NUMBER ROUND TO UP ', this.totalPagesNo_roundToUp);

        }
      }, (error) => {
        // this.showSpinner = false;
        this.logger.error('[WS-REQUESTS-MSGS] - GET REQUEST BY REQUESTER ID - ERROR ', error);
      }, () => {
        // this.showSpinner = false;
        this.logger.log('[WS-REQUESTS-MSGS] - GET REQUEST BY REQUESTER ID * COMPLETE *');
      });
  }

  displayHideFooterPagination(requests_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (requests_count >= 16) {
      this.displaysFooterPagination = true;

      this.logger.log('[CONTACTS-DTLS] ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;

      this.logger.log('[CONTACTS-DTLS] ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Messages ws-subscription and get msgs from BS subscription
  // -----------------------------------------------------------------------------------------------------
  subscribeToWs_MsgsByRequestId(id_request: string) {

    //  this.logger.log('[WS-REQUESTS-MSGS] - subscribe To WS MSGS ByRequestId ', id_request)
    this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);
    this.listenToGotAllMsg()
    this.getWsMsgs$();

  }

  // .pipe(filter((data) => data !== null))
  listenToGotAllMsg() {
    this.wsMsgsService.wsMsgsGotAllData$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data: any) => {
        if (data) {
          this.logger.log('[WS-REQUESTS-MSGS] - ALL MSGS LENGTH ', data.length)
          this.ALL_MSG_LENGTH = data.length
        }
      })
  }


  toggleViewedPages() {
    this.showViewedPages = !this.showViewedPages;
  }

  toggleTicketAdvanced() {
    this.showTicketAdvanced = !this.showTicketAdvanced;
  }


  getWsMsgs$() {
    this.wsMsgsService.wsMsgsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsmsgs) => {

        if (wsmsgs) {
          this.logger.log('[WS-REQUESTS-MSGS] getWsMsgs$ WSMSGS lenght', wsmsgs.length)
          this.messagesList = wsmsgs;
          this.logger.log('[WS-REQUESTS-MSGS] getWsMsgs$ *** this.messagesList *** ', this.messagesList);


          this.messagesList.forEach(message => {
            // this.logger.log('[WS-REQUESTS-MSGS] message attributes', message.attributes);
            let viewedPageTitleValue = ''
            if (message.attributes && message.attributes.sourceTitle) {
              viewedPageTitleValue = message.attributes.sourceTitle
            } else {
              viewedPageTitleValue = "Not available"
            }
            if (message.attributes && message.attributes.sourceTitle && message.attributes.sourcePage) {
              const index = this.viewedPages.findIndex((e) => e.viewedPageLink === message.attributes.sourcePage);
              this.logger.log('[WS-REQUESTS-MSGS] viewedPage index ', index)
              if (index === -1) {
                this.viewedPages.push({ viewedPageTitle: viewedPageTitleValue, viewedPageLink: message.attributes.sourcePage })
              }
            }
          });

          this.logger.log('[WS-REQUESTS-MSGS] message viewedPages array', this.viewedPages);

        }

        this.showSpinner = false;

        if (this.messagesList && this.messagesList.length !== this.ALL_MSG_LENGTH) {
          this.scrollCardContentToBottom();
        }

      }, error => {
        this.showSpinner = false;
        this.logger.error('[WS-REQUESTS-MSGS] - getWsMsgs$ - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsMsgs$ * COMPLETE * ')
      });
  }

  // -------------------------------------------------------------------------
  // Scroll
  // -------------------------------------------------------------------------
  scrollCardContentToBottom() {
    setTimeout(() => {
     console.log('[WS-REQUESTS-MSGS] SCROLL CONTAINER ')
      // CHECK THIS
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      // this.logger.log('[WS-REQUESTS-MSGS] SCROLL CONTAINER ', initialScrollPosition)

      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      // this.logger.log('[WS-REQUESTS-MSGS] SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);
  }

  getRequesterAvailabilityStatus(requester_id: string) {
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`

    // -----------------------------------------------------------------------------------------
    // No more used - replaced by Get Lead presence from websocket
    // -----------------------------------------------------------------------------------------
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`
    // const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);
    // this.logger.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

    // connectionsRef.on('value', (child) => {
    //   if (child.val()) {
    //     this.REQUESTER_IS_ONLINE = true;
    //     this.logger.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
    //   } else {
    //     this.REQUESTER_IS_ONLINE = false;

    //     this.logger.log('%%% Ws-REQUESTS-Msgs »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
    //   }
    // })


    // -----------------------------------------------------------------------------------------
    // New - Get Lead presence from websocket subscription (replace firebaseRealtimeDb)
    // -----------------------------------------------------------------------------------------
    this.wsRequestsService.subscribeToWS_RequesterPresence(requester_id);
    this.getWsRequesterPresence();
  }

  getWsRequesterPresence() {
    // this.contactsService.wsRequesterStatus$
    this.wsRequestsService.wsRequesterStatus$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {
        const user = data
        // this.logger.log("[WS-REQUESTS-MSGS] - getWsRequesterPresence user ", user);
        if (user && user.presence) {

          if (user.presence.status === "offline") {
            this.REQUESTER_IS_ONLINE = false;
          } else {
            this.REQUESTER_IS_ONLINE = true;
          }
        }
      }, error => {

        this.logger.error('[WS-REQUESTS-MSGS] - getWsRequesterPresence user - ERROR ', error)
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getWsRequesterPresence user * COMPLETE * ')
      });
  }


  getMemberFromRemote(note: any, userid: string) {
    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        this.logger.log('[WS-REQUESTS-MSGS] - getMemberFromRemote ID ', projectuser);

        note.createdBy_user = projectuser[0].id_user
        // this.usersLocalDbService.saveMembersInStorage(this.user['_id'], this.user);

      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - getMemberFromRemote - ERROR ', error);
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - getMemberFromRemote * COMPLETE *');
      });
  }


  parseUserAgent(uastring) {
    // https://github.com/faisalman/ua-parser-js
    var parser = new UAParser();
    parser.setUA(uastring);
    return parser.getResult();
  }


  // ---------------------------------------------------------------------------------------
  // @ Tags
  // ---------------------------------------------------------------------------------------
  // toggleAddTagInputAndGetTags() {
  //   const elem_add_tag_btn = <HTMLElement>document.querySelector('.add_tag_btn');
  //   this.logger.log('% Ws-REQUESTS-Msgs - elem_add_tag_btn ', elem_add_tag_btn);
  //   elem_add_tag_btn.blur();
  //   this.getTag();
  //   this.diplayAddTagInput = !this.diplayAddTagInput
  //   this.logger.log('[WS-REQUESTS-MSGS] - toggleAddTagInputAndGetTags - DISPLAY TAG INPUT : ', this.diplayAddTagInput);
  // }

  addTag() {
    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - this.tag TO ADD: ', this.tag);
    const foundtag = this.tagsList.filter((obj: any) => {
      return obj._id === this.tag;
    });

    this.ngSelect.close()
    this.ngSelect.blur()
    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - foundtag: ', foundtag);

    // No more used
    // let tagObject = {}
    // if (foundtag.length > 0) {
    //   tagObject = { tag: foundtag[0].tag, color: foundtag[0].color }
    // }
    // this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - tagObject: ', tagObject);
    const newTagArray = [{ tag: foundtag[0].tag, color: foundtag[0].color }]
    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - newTagArray: ', newTagArray);
    setTimeout(() => {
      this.tag = null;
    })
    this.manageRequestTags(this.id_request, newTagArray, 'add')

    // ----------------------------
    // No more used
    // ----------------------------
    // const tagObjectsize = Object.keys(tagObject).length
    // this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - tagObject LENGTH: ', tagObjectsize);
    // if (tagObjectsize > 0) {
    //   this.tagsArray.push(tagObject);
    // }

    // this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - TAGS ARRAY AFTER PUSH: ', this.tagsArray);
    // if (tagObjectsize > 0) {
    //   this.updateRequestTags(this.id_request, this.tagsArray, 'add')
    // }

  }

  manageRequestTags(id_request, tag, fromaction) {
    this.logger.log('[WS-REQUESTS-MSGS] - UPDATE REQUEST TAGS fromaction: ', fromaction);
    this.logger.log('[WS-REQUESTS-MSGS] - UPDATE REQUEST TAGS  tag: ', tag);
    this.wsRequestsService.updateRequestTags(id_request, tag)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - RES: ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - ADD TAG - ERROR: ', err);
        this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Tags.NotificationMsgs')['AddLabelError'], 4, 'report_problem');
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Tags.NotificationMsgs')['AddLabelSuccess'], 2, 'done');
        this.getTagContainerElementHeight()
      });
  }


  async getTag() {
  this.loadingTags = true;

  try {
    const tags: any[] = await this.tagsService.getTags().toPromise();
    console.log('[WS-REQUESTS-MSGS] - GET TAGS - tags ', tags);
    
    if (!tags) {
      this.loadingTags = false;
      return;
    }

    this.tagsList = tags;

    // Assicurati che allProjectUsers sia inizializzato
    if (!this.allProjectUsers) {
      this.allProjectUsers = [];
    }
    // console.log('[WS-REQUESTS-MSGS] - GET TAGS - allProjectUsers', this.allProjectUsers);


    // Creo un array di Promesse per recuperare utenti remoti
    const userPromises = this.tagsList.map(async (tag) => {

      //  console.log('[WS-REQUESTS-MSGS] - GET TAGS  - CONFRONTO:', {
      //   createdBy: tag.createdBy,
      //   allProjectUsers_ids: this.allProjectUsers.map(u => u.userid)
      // });
      // Controlla se l'utente è già in allProjectUsers
      let user = this.allProjectUsers.find(u => u.userid === tag.createdBy);
      // console.log('[WS-REQUESTS-MSGS] - GET TAGS - user ', user);
      
      if (!user) {
        // Controlla nello storage locale
        const localUser = this.usersLocalDbService.getMemberFromStorage(tag.createdBy);
        // console.log('[WS-REQUESTS-MSGS] - GET TAGS - user from storage', localUser);
      

        if (localUser) {
          localUser['fullname'] = localUser['id_user']['firstname'] + ' ' + localUser['id_user']['lastname']
          user = { 
            label:  localUser['fullname'], 
            value: localUser['_id'], 
            userid: localUser['id_user']['_id']
          };
          // Aggiungi a allProjectUsers
          this.allProjectUsers.push(user);
        } 
        
        // else {
        //   // Recupero l'utente da remoto
        //   const remoteUser = await this.getMemberFromRemoteForTag(tag.createdBy);
        //   if (remoteUser) {
        //     user = { 
        //       label: remoteUser['id_user']['firstname'] + ' ' + remoteUser['id_user']['lastname'], 
        //       value: remoteUser._id, 
        //       userid: remoteUser['id_user']['_id']
        //     };
        //     // Aggiorno l'array allProjectUsers
        //     this.allProjectUsers.push(user);
        //     // console.log('[WS-REQUESTS-MSGS] - GET TAGS - Added user to allProjectUsers:', user);
        //   }
        // }
      }
      
      return user;
    });

    // Aspetto che tutte le promesse siano completate
    await Promise.all(userPromises);

    // console.log('[WS-REQUESTS-MSGS] - GET TAGS - Final allProjectUsers ', this.allProjectUsers);

    // Filtro le tag solo se NON ho il permesso di vedere tutte
    if (!this.PERMISSION_TO_VIEW_ALL_TAGS) {
      const validUserIds = this.allProjectUsers.map(u => u.userid);
      this.tagsList = this.tagsList.filter(tag => validUserIds.includes(tag.createdBy));
      // console.log('[WS-REQUESTS-MSGS] - GET TAGS - Filtered tagsList ', this.tagsList);
    }

    // Copia array per trigger change detection
    this.tagsList = [...this.tagsList];

    this.typeALabelAndPressEnter = this.translate.instant('AddTagToConversation');
    this.removeTagFromTaglistIfAlreadyAssigned(this.tagsList, this.tagsArray);

  } catch (error) {
    this.logger.error('[TAGS] - GET TAGS - ERROR', error);
  } finally {
    this.loadingTags = false;
  }
}

getMemberFromRemoteForTag(userid: string): Promise<any> {
  // console.log('[TAGS] - GET TAGS - getMemberFromRemoteForTag', userid);
  return new Promise((resolve, reject) => {
    this.usersService.getProjectUserById(userid).subscribe(
      (projectUser: any) => {
        if (projectUser && projectUser.length > 0) {
          const user = projectUser[0];
          // console.log('[TAGS] - GET TAGS - Found remote user:', user);
          resolve(user);
        } else {
          // console.log('[TAGS] - GET TAGS - User not found:', userid);
          resolve(null);
        }
      },
      (error) => {
        this.logger.warn('[TAGS] - getMemberFromRemoteForTag - ERROR', error);
        // console.log('[TAGS] - GET TAGS - Error fetching user, resolving null');
        resolve(null);
      }
    );
  });
}


  // tag_name: string;
  // tag_selected_color = '#43B1F2';
  // tag_new_selected_color: string;

  tagSelectedColor(hex: any) {
    this.logger.log('[WS-REQUESTS-MSGS] - TAG SELECTED COLOR ', hex);
    this.tag_selected_color = hex;
  }
  // --------------------------------------------
  // No more used - replaced with createNewTag
  // --------------------------------------------
  // createTag(newTag) {
  //   this.logger.log("Create TAG Clicked - is used?: " + newTag)
  //   this.tag_selected_color = '#43B1F2'
  //   this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG - this.TAG: ', this.tag)
  //   this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG - TAG-NAME: ', this.tag, ' TAG-COLOR: ', this.tag_selected_color)
  //   this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG - this.ngselect: ', this.ngselect)
  //   this.tagsService.createTag(newTag, this.tag_selected_color)
  //     .subscribe((tag: any) => {
  //       this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG - RES ', tag);

  //       const tagObject = { tag: tag.tag, color: tag.color }
  //       this.tagsArray.push(tagObject);

  //       this.updateRequestTags(this.id_request, this.tagsArray, 'create')

  //     }, (error) => {
  //       this.logger.error('[WS-REQUESTS-MSGS] - CREATE TAG - ERROR  ', error);
  //       this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Tags.NotificationMsgs')['AddLabelError'], 4, 'report_problem');
  //     }, () => {
  //       this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG * COMPLETE *');
  //       // this.notify.showWidgetStyleUpdateNotification(this.create_label_success, 2, 'done');

  //       this.tag_name = '';
  //       this.tag_selected_color = '#43B1F2';

  //       this.getTag();
  //     });

  // }

  createNewTag = (newTag: string) => {
    // this.logger.log("Create New TAG Clicked : " + newTag)
    this.logger.log("Create New TAG Clicked - request tag: ", this.request.tags)

    var index = this.request.tags.findIndex(t => t.tag === newTag);
    if (index === -1) {
      this.logger.log("Create New TAG Clicked - Tag NOT exist")


      let self = this;
      this.logger.log(' this.ngSelect', this.ngSelect)
      if (self.ngSelect) {
        self.ngSelect.close()
        self.ngSelect.blur()
      }
      this.getTagContainerElementHeight()

      self.tag_selected_color = '#f0806f'

      self.tagsService.createTag(newTag, this.tag_selected_color)
        .subscribe((tag: any) => {
          this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG - RES ', tag);

          // const tagObject = { tag: tag.tag, color: tag.color } // no more used
          // self.tagsArray.push(tagObject); // no more used
          const newTagArray = [{ tag: tag.tag, color: tag.color }]


          self.manageRequestTags(this.id_request, newTagArray, 'create')

        }, (error) => {
          this.logger.error('[WS-REQUESTS-MSGS] - CREATE TAG - ERROR  ', error);
          self.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Tags.NotificationMsgs')['AddLabelError'], 4, 'report_problem');
        }, () => {
          this.logger.log('[WS-REQUESTS-MSGS] - CREATE TAG * COMPLETE *');

        });

    } else {
      this.logger.log("Create New TAG Clicked - Tag already exist ")
      this.presentModalTagAlredyAssigned()
    }
  }

  presentModalTagAlredyAssigned() {
    Swal.fire({
      title: this.translationMap.get('TagAlreadyAssigned'),
      text: this.translationMap.get('ThisTagHasBeenAlreadyAssignedPleaseEnterUniqueTag'),
      icon: "info",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonColor: "var(--primary-btn-background)",
      confirmButtonText: this.translate.instant('Ok'),
      // buttons: 'OK',
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
  }

  removeTag(tag: string) {
    if (!this.PERMISSION_TO_UPDATE_REQUEST_TAGS) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
      return;
    }
    if (this.DISABLE_ADD_NOTE_AND_TAGS === false) {
      console.log('[WS-REQUESTS-MSGS] - REMOVE TAG - tag TO REMOVE: ', tag);
      this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG - tag id TO REMOVE: ', tag['_id']);
      // ----------------------------
      // NO MORE USED
      // ----------------------------
      // var index = this.tagsArray.indexOf(tag);
      // if (index !== -1) {
      //   this.tagsArray.splice(index, 1);
      // }
      // this.removeTagFromTaglistIfAlreadyAssigned(this.tagsList, this.tagsArray);
      // this.logger.log('[WS-REQUESTS-MSGS] -  REMOVE TAG - TAGS ARRAY AFTER SPLICE: ', this.tagsArray);
      setTimeout(() => {
        this.getTagContainerElementHeight()
      }, 0);
      // this.getTag();


      // this.wsRequestsService.updateRequestsById_UpdateTag(this.id_request, this.tagsArray)
      this.wsRequestsService.deleteRequestTags(this.id_request, tag['_id'])
        .subscribe((data: any) => {

          this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG - RES: ', data);
        }, (err) => {
          this.logger.error('[WS-REQUESTS-MSGS] - REMOVE TAG - ERROR: ', err);
          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Tags.NotificationMsgs')['DeleteLabelError'], 4, 'report_problem');

        }, () => {
          this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAG * COMPLETE *');
          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Tags.NotificationMsgs')['DeleteLabelSuccess'], 2, 'done');

        });
    }
  }


  removeTagFromTaglistIfAlreadyAssigned(tagsList: any, tagsArray: any) {
    // remove from the taglist (tags that the administrator has set on the tag management page and that are displayed in the combo box 'Add tag' of this template)
    // the tag that are already in the tagArray (the tags present in the "this.request" object)
    if (tagsList) {
      for (var i = tagsList.length - 1; i >= 0; i--) {
        for (var j = 0; j < tagsArray.length; j++) {
          if (tagsList[i] && (tagsList[i].tag === tagsArray[j].tag)) {
            this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAGS FROM TAG LIST WHEN IS SELECTED-  tagsList - tagsList[i] ', tagsList[i]);
            tagsList.splice(i, 1);
          }
        }
      }
    } else {
      this.logger.log('[WS-REQUESTS-MSGS] - REMOVE TAGS FROM TAG LIST WHEN IS SELECTED -  tagsList undefined ', this.tagsList);
    }
    this.logger.log('[WS-REQUESTS-MSGS] - GET TAGS -  tagsList - AFTER SPLICE ', this.tagsList);
    this.tagsList = this.tagsList.slice(0);

  }



  // closeSelect(selecttagcombobox: NgSelectComponent) { 
  //   selecttagcombobox.close(); 
  // }

  closeSelectTagDropdown() {
    this.logger.log('closeSelectTagDropdown')
    this.ngSelect.close()
    this.ngSelect.blur()
  }



  onPressEnterInIputTypeNewTag() {
    this.logger.log('[WS-REQUESTS-MSGS] - ON PRESS ENTER IN INPUT TYPE NEW TAG');
    if (this.tag_name.length > 0) {
      // this.createTag();
      const inputElm = <HTMLElement>document.querySelector('.tag-name-in-conv-detail');
      this.logger.log('onPressEnterInIputTypeNewTag inputElm', inputElm)
      if (inputElm) {
        inputElm.blur();
      }
      this.ngselect.close()

    }
  }

  onFocusInIputTypeNewTag() {
    this.logger.log('[WS-REQUESTS-MSGS] - ON FOCUS IN INPUT TYPE NEW TAG tagsList', this.tagsList);
    for (let i = 0; i < this.tagsList.length; i++) {
      this.tagsList[i].disabled = true
      this.tagsList = this.tagsList.slice(0)
    }
  }

  onBlurIputTypeNewTag() {
    this.logger.log('[WS-REQUESTS-MSGS] - ON  BLUR TYPE NEW TAG tagsList', this.tagsList);
    for (let i = 0; i < this.tagsList.length; i++) {
      this.tagsList[i].disabled = false
      this.tagsList = this.tagsList.slice(0)
    }
  }

  @HostListener('window:click', ['$event.target'])
  onClick(targetElement: any) {

    if (targetElement.classList.contains('ng-option-disabled')) {
      this.logger.log('[WS-REQUESTS-MSGS] HostListener onClick', targetElement);
      for (let i = 0; i < this.tagsList.length; i++) {
        this.tagsList[i].disabled = false
        this.tagsList = this.tagsList.slice(0)
      }
      const inputElm = <HTMLElement>document.querySelector('.tag-name-in-conv-detail');
      this.logger.log(`inputElm`, inputElm);
      if (inputElm) {
        inputElm.blur()
      }

    }
  }


  // -----------------------------------------------------------------------------------
  // Splice tags from the tagslist the tags already present in the "this.request" object
  // ------------------------------------------------------------------------------------


  // ---------------------------------------------------------------------------------------
  // @ Ticket Accordion
  // ---------------------------------------------------------------------------------------
  openTicketAccordion() {
    var acc = <HTMLElement>document.querySelector('.ticket-accordion');
    this.logger.log('[WS-REQUESTS-MSGS] - openTicketAccordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.ticket-panel')
    this.logger.log('[WS-REQUESTS-MSGS] - openTicketAccordion -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {

      panel.style.maxHeight = "300px";

      panel.scrollTop = 0;

    }
  }


  // ---------------------------------------------------------------------------------------
  // @ Notes Accordion
  // ---------------------------------------------------------------------------------------
  openNotesAccordion() {
    var acc = <HTMLElement>document.querySelector('.accordion');
    this.logger.log('[WS-REQUESTS-MSGS] - openNotesAccordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.note-panel')
    this.logger.log('[WS-REQUESTS-MSGS] - openNotesAccordion -  panel ', panel);

    this.scrollTopWhenNewItemISAdded();
    // let ps = new PerfectScrollbar(panel);
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      // panel.style.maxHeight = panel.scrollHeight + "111px";
      panel.style.maxHeight = "300px";
      // panel.scrollTop = panel.scrollHeight; // scroll to bottom when the accordion is opened
      panel.scrollTop = 0;
      // setTimeout(function(){
      //   panel.scrollTop = 0;
      // }, 500);
    }
  }

  scrollTopWhenNewItemISAdded() {
    let current = this.contEl.nativeElement.offsetTop;
    this.contEl.scrollTop;
    this.logger.log('[WS-REQUESTS-MSGS] - scrollTopWhenNewItemISAdded - contEl.scrollTop ', this.contEl);
    this.logger.log('[WS-REQUESTS-MSGS] - scrollTopWhenNewItemISAdded - contEl.nativeElement.offsetTop; ', current);

  }




  addNote() {
    // this.disableMainPanelScroll();
    if (!this.PERMISSION_TO_UPDATE_REQUEST_NOTES) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE);
      return;
    }
    if (this.DISABLE_ADD_NOTE_AND_TAGS === false) {
      this.showSpinnerInAddNoteBtn = true;
      this.wsRequestsService.createNote(this.new_note, this.id_request)
        .subscribe((responses: any) => {
          this.logger.log('[WS-REQUESTS-MSGS] - CREATE NOTE - RES ', responses);
        }, (error) => {
          this.logger.error('[WS-REQUESTS-MSGS] - CREATE NOTE - ERROR ', error);
          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Notes.NotificationMsgs')['CreateNoteError'], 4, 'report_problem');
          this.showSpinnerInAddNoteBtn = false;
        }, () => {
          this.logger.error('[WS-REQUESTS-MSGS] - CREATE NOTE * COMPLETE *');
          this.new_note = ''
          // var panel = <HTMLElement>document.querySelector('.note-panel')
          // panel.scrollTop = panel.scrollHeight;
          // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - CREATE NOTE * COMPLETE *');

          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Notes.NotificationMsgs')['CreateNoteSuccess'], 2, 'done');
          this.showSpinnerInAddNoteBtn = false;
          // this.enableMainPanelScroll()

        });
    }

  }


  deleteNote(note_id) {
    if (!this.PERMISSION_TO_UPDATE_REQUEST_NOTES) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
      return
    }
    this.notify.operationinprogress(this.translationMap.get('Processing'));

    this.wsRequestsService.deleteNote(this.id_request, note_id)
      .subscribe((responses: any) => {
        this.logger.log('[WS-REQUESTS-MSGS]  - DELETE NOTE - RES ', responses);


      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS]  - DELETE NOTE - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('Notes.NotificationMsgs')['DeleteNoteError'], 4, 'report_problem');
      }, () => {

        var panel = <HTMLElement>document.querySelector('.note-panel')
        // panel.scrollTop = panel.scrollHeight;
        this.logger.log('[WS-REQUESTS-MSGS]  DELETE NOTE * COMPLETE *');
        // this.notify.showWidgetStyleUpdateNotification(this.delete_note_success, 2, 'done');
        this.notify.operationcompleted(this.translationMap.get('Notes.NotificationMsgs')['DeleteNoteSuccess']);

        // this.closeModalDeleteNote(); // no more used
      });
  }


  // ------------------------------------------------
  // @ Used in notes (CALLED FROM TEMPLATE)
  // ------------------------------------------------
  onScrollx(event: any): void {
    // // this.logger.log('SIDEBAR RICHIAMO ON SCROLL ');
    // this.elSidebarWrapper = <HTMLElement>document.querySelector('.sidebar-wrapper');
    // this.scrollpos = this.elSidebarWrapper.scrollTop
    // this.logger.log('SIDEBAR SCROLL POSITION', this.scrollpos)

    var panel = <HTMLElement>document.querySelector('.note-panel')
    const scrollpos = panel.scrollTop
    this.logger.log('[WS-REQUESTS-MSGS] - note panel - scrollpos onScrollx ', scrollpos);

    // window.scrollTo(0, 0);
    // let elBody = <HTMLElement>document.querySelector('body');
    // elBody.animate({ scrollTop: 0 }, 200);

    let elMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WS-REQUESTS-MSGS] - note panel -  elMainPanel: ', elMainPanel)
    this.logger.log('[WS-REQUESTS-MSGS] - note panel -  elMainPanel.scrollTop: ', elMainPanel.scrollTop)

    // elMainPanel.scrollTo(0,scrollpos)
  }


  handleBlockedSelectClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE);
  }


  onChangeSelectedPriority(selectedPriority) {
    if (this.PERMISSION_TO_UPDATE_REQUEST_PRIORITY) {
      this.logger.log('[WS-REQUESTS-MSGS] - onChangeSelectedPriority selectedPriority ', selectedPriority)
      this.selectedPriority = selectedPriority;

      this.wsRequestsService.updatePriority(this.id_request, selectedPriority)
        .subscribe((res: any) => {
          console.log('[WS-REQUESTS-MSGS] - onChangeSelectedPriority - UPDATED PRIORITY - RES ', res);

        }, (error) => {
          this.logger.error('[WS-REQUESTS-MSGS] - onChangeSelectedPriority -UPDATED PRIORITY - ERROR ', error);
          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('AnErrorOccurredWhileUpdatingTheCnversationPriority'), 4, 'report_problem');
        }, () => {
          // panel.scrollTop = panel.scrollHeight;
          console.log('[WS-REQUESTS-MSGS] - onChangeSelectedPriority - UPDATED PRIORITY  * COMPLETE *');
          this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('TheConversationPriorityHasBeenSuccessfullyUpdated'), 2, 'done');

        });
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction();
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes accordion
  // ---------------------------------------------------------------------------------------
  openAttributesAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-accordion');
    this.logger.log('[WS-REQUESTS-MSGS] - open attributes-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-panel')
    this.logger.log('[WS-REQUESTS-MSGS] -  open attributes-accordion  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes decoded jwt accordion
  // ---------------------------------------------------------------------------------------
  openAttributesDecodedJWTAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-decoded-jwt-accordion');
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-decoded-jwt-panel')
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

  // ---------------------------------------------------------------------------------------
  // @ Attributes PRE-CHAT FORM accordion
  // ---------------------------------------------------------------------------------------
  openAttributesPrechatFormAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.attributes-pre-chat-form-accordion');
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.attributes-pre-chat-form-accordion-panel')
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }

  // https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript see section Async + Fallback
  copyToClipboardPreChatFormValue(prechatAttributeValue: string, prechattooltipid: string): void {
    this.logger.log('copyToClipboardPreChatFormValue attributeValue', prechatAttributeValue)
    this.logger.log('copyToClipboardPreChatFormValue prechatAttributeName', prechattooltipid)
    const prechatTooltip = <HTMLElement>document.querySelector(`#${prechattooltipid}`)
    this.logger.log('copyToClipboardPreChatFormValue prechatTooltip ', prechatTooltip);

    let listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (prechatAttributeValue));
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      this.logger.log('copyToClipboardPreChatFormValue: Copying text command was ' + msg);

      if (successful) {
        prechatTooltip.classList.add('show-has-copied-tooltip');
        setTimeout(() => {
          prechatTooltip.classList.remove('show-has-copied-tooltip');
        }, 1000);
      }
    } catch (err) {
      this.logger.error('Fallback: Oops, unable to copy', err);
    }

    document.removeEventListener('copy', listener);
  }


  copyToClipboardContactEmail(contactemail) {
    this.logger.log('copyToClipboardContactEmail contactemail', contactemail)

    const prechatTooltip = <HTMLElement>document.querySelector(`#contact-email`)
    this.logger.log('Fallback: prechatTooltip ', prechatTooltip);

    let listener = (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (contactemail));
      e.preventDefault();
    };

    document.addEventListener('copy', listener);
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      this.logger.log('Fallback: Copying text command was ' + msg);

      if (successful) {
        prechatTooltip.classList.add('show-has-copied-tooltip');
        setTimeout(() => {
          prechatTooltip.classList.remove('show-has-copied-tooltip');
        }, 1000);
      }
    } catch (err) {
      this.logger.error('Fallback: Oops, unable to copy', err);
    }

    document.removeEventListener('copy', listener);

  }

  // ---------------------------------------------------------------------------------------
  // @ Chatbot attributes accordion
  // ---------------------------------------------------------------------------------------

  openChatbotAttributesAccordion(isOpenChatbotAttributesAccordion) {
    // this.logger.log('[WS-REQUESTS-MSGS] isOpenChatbotAttributesAccordion ', isOpenChatbotAttributesAccordion)

    // var footerEl = <HTMLElement>document.querySelector('footer')
    // this.logger.log('[WS-REQUESTS-MSGS] footerEl ', footerEl)
    // if (isOpenChatbotAttributesAccordion) {
    //   if (footerEl) {
    //     footerEl.style.display = 'none'
    //   }
    // } else if (!isOpenChatbotAttributesAccordion) {
    //   if (footerEl) {
    //     footerEl.style.display = 'block'
    //   }
    // }


    var acc = <HTMLElement>document.querySelector('.chatbot-conv-accordion');

    acc.classList.toggle("active");

    var panel = <HTMLElement>document.querySelector('.chatbot-conv-accordion-panel')


    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }




  // ---------------------------------------------------------------------------------------
  // @ Contact conversation accordion
  // ---------------------------------------------------------------------------------------
  openContactConversationAccordion() {
    // var acc = document.getElementsByClassName("accordion");
    var acc = <HTMLElement>document.querySelector('.contact-conversation-accordion');
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT - open attributes-decoded-jwt-accordion -  accordion elem ', acc);
    acc.classList.toggle("active");
    // var panel = acc.nextElementSibling ;
    var panel = <HTMLElement>document.querySelector('.contact-conversation-accordion-panel')
    // this.logger.log('WS-REQUESTS-MSGS - ATTRIBUTES DECODED JWT-  open attributes-decoded-jwt-panel  -  panel ', panel);

    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  }


  // ------------------------------------------------
  // LISTEN TO SCROLL POSITION (CALLED FROM TEMPLATE)
  // ------------------------------------------------
  onScrollMsgs(event: any): void {
    // this.logger.log('[WS-REQUESTS-MSGS] CALL ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    // this.logger.log('[WS-REQUESTS-MSGS] - SCROLL POSITION ', scrollPosition);
    // this.logger.log('[WS-REQUESTS-MSGS] - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    // this.logger.log('[WS-REQUESTS-MSGS] ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    if (scrollHeighLessScrollPosition > 500) {
      this.displayBtnScrollToBottom = 'block';
    } else {
      this.displayBtnScrollToBottom = 'none';
    }
  }



  // ------------------------------------------------
  // SCROLL TO BOTTOM (CALLED FROM TEMPLATE)
  // ------------------------------------------------
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      // tslint:disable-next-line:max-line-length
      // this.logger.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      this.logger.error('[WS-REQUESTS-MSGS] - scrollToBottom ERROR ', err);
    }
  }


  // train bot sidebar
  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    this.logger.log('[WS-REQUESTS-MSGS] »»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;
    // this not works if is commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px';


    this.logger.log('[WS-REQUESTS-MSGS] - REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);
  }

  handleCloseRightSidebar(event) {
    // this.logger.log('[WS-REQUESTS-MSGS] - CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;
    this.usersLocalDbService.storeIsOpenAppSidebar(false)
  }

  openAppsSidebar() {
    this.OPEN_APPS_RIGHT_SIDEBAR = true;
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.apps_sidebar_height = elemMainContent.clientHeight + 60 + 'px'

    const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const elemRightSidebar = <HTMLElement>document.querySelector('.right-card');


    // this.logger.log('[WS-REQUESTS-MSGS] ON OPEN APPS RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.apps_sidebar_height);

    this.usersLocalDbService.storeIsOpenAppSidebar(true)

    if (this.CHAT_PANEL_MODE === false) {
      this.navbarBrand.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    } else {
      this.appStoreService.hasOpenAppsSidebar(true);
      // _elemMainPanel.scrollIntoView();


      _elemMainPanel.classList.add("main-panel-chat-appsidebar-open");
      elemRightSidebar.classList.add("right-card-appsidebar-open");
    }
  }

  handleCloseAppsRightSidebar(event) {
    this.logger.log('[WS-REQUESTS-MSGS] - CLOSE APPS RIGHT SIDEBAR ', event);
    this.OPEN_APPS_RIGHT_SIDEBAR = event;
    this.usersLocalDbService.storeIsOpenAppSidebar(false)

    const elemRightSidebar = <HTMLElement>document.querySelector('.right-card');

    if (this.CHAT_PANEL_MODE === true) {
      const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      _elemMainPanel.classList.remove("main-panel-chat-appsidebar-open");
      elemRightSidebar.classList.remove("right-card-appsidebar-open");

    }
  }

  closeMoreOptionDropdown() {
    const elemDropdownMoreOption = <HTMLElement>document.querySelector('.dropdown__menu-more-options');
    this.logger.log('[WS-REQUESTS-MSGS] - elemDropdownMoreOption', elemDropdownMoreOption)
    if (elemDropdownMoreOption && elemDropdownMoreOption.classList.contains("dropdown__menu-more-options--active")) {
      elemDropdownMoreOption.classList.remove("dropdown__menu-more-options--active");
    }
  }

  openSelectUsersModal(actionSelected) {
    this.actionInModal = actionSelected
    if (this.actionInModal === 'reassign') {

      if (!this.PERMISSION_TO_REASSIGN_REQUEST) {
        this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
        return;
      }
    }

    if (this.actionInModal === 'invite') {
      if (!this.PERMISSION_TO_ADD_TEAMMATE_TO_REQUEST) {
        this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
        return;
      }
    }

    console.log('[WS-REQUESTS-MSGS] - ACTION IN MODAL ', this.actionInModal);
    this.closeMoreOptionDropdown();


    if (this.actionInModal === 'invite') {
      if (this.request.channel.name === 'email' || this.request.channel.name === 'form') {
        if (this.agents_array.length === 1 && this.agents_array[0].isBot === false) {
          let agentFullname = ""
          if (this.agents_array[0].firstname && this.agents_array[0].lastname) {
            agentFullname = this.agents_array[0].firstname + ' ' + this.agents_array[0].lastname
          } else if (this.agents_array[0].firstname && !this.agents_array[0].lastname) {
            agentFullname = this.agents_array[0].firstname
          }
          this.presentModalYouCannotAddAgents(agentFullname)
        } else if (this.agents_array.length === 1 && this.agents_array[0].isBot === true) {
          this.presentModalAddAgent()
        } else if (this.agents_array.length === 0) {
          this.presentModalAddAgent()
        }
      } else if (this.request.channel.name !== 'email' || this.request.channel.name !== 'form' || this.request.channel.name === 'telegram' || this.request.channel.name === 'whatsapp' || this.request.channel.name === 'messenger' || this.request.channel.name === 'chat21') {
        this.presentModalAddAgent()
      }
    } else {
      this.presentModalAddAgent()
    }
    // this.getAllUsersOfCurrentProject();

  }

  presentModalAddAgent() {
    this.getProjectUsersAndBots();
    this.getDepartments();
    this.displayUsersListModal = 'block'
    this.logger.log('[WS-REQUESTS-MSGS] - DISPLAY USERS LIST MODAL ', this.displayUsersListModal);
    const actualHeight = window.innerHeight;
    this.logger.log('[WS-REQUESTS-MSGS] - ON OPEN USER LIST MODAL -> ACTUAL WINDOW HEIGHT  ', actualHeight);
    const actualWidth = window.innerWidth;
    this.logger.log('[WS-REQUESTS-MSGS] - ON OPEN USER LIST MODAL -> ACTUAL WINDOW WIDTH  ', actualWidth);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON OPEN -> ACTUAL MAIN CONTENT HEIGHT', elemMainContent.clientHeight);

    this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON OPEN  > 991 - users_list_modal_height', this.users_list_modal_height);

    // determine the height of the modal when the width of the window is <= of 991px when is opened the modal
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (this.CHAT_PANEL_MODE === false) {
      if (actualWidth <= 991) {
        this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'
        // this.logger.log('%%% Ws-REQUESTS-Msgs - *** MODAL HEIGHT ***', this.users_list_modal_height);
        this.logger.log('[WS-REQUESTS-MSGS] - USER LIST MODAL - ON OPEN  <=991 - users_list_modal_height', this.users_list_modal_height);
      }
    }
  }
  // this.addAgentTitle
  presentModalYouCannotAddAgents(agentFullname) {
    Swal.fire({
      title: this.translationMap.get('YouCannotAddAgents'),
      text: this.translate.instant('ThisChatIsAlreadyServedBy', { agent_fullname: agentFullname }) + ' ' + this.translate.instant('EmailAndTicketCanOnlyBeServedByOneAgent') + '.',
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonColor: "var(--primary-btn-background)",
      confirmButtonText: this.translate.instant('Ok'),

      // buttons: 'OK',
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
  }

  closeSelectUsersModal() {
    this.displayUsersListModal = 'none'
    this.logger.log('[WS-REQUESTS-MSGS] - ON CLOSE USERS LIST MODAL ', this.displayUsersListModal);
  }


  // ------------------------------------------------------------------------------------------------------------------------
  // @ Get all project's Agents (project-users & bots) - called when the user open the SelectUsersModal (openSelectUsersModal)
  // ------------------------------------------------------------------------------------------------------------------------
  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getFaqKbByProjectId();


    zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        // this.logger.log('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

        if (pair && pair._projectUsers) {
          this.projectUsersList = pair._projectUsers;


          this.projectUsersList.sort(function compare(a: any, b: any) {
            if (a['id_user']['firstname'].toLowerCase() < b['id_user']['firstname'].toLowerCase()) {
              return -1;
            }
            if (a['id_user']['firstname'].toLowerCase() > b['id_user']['firstname'].toLowerCase()) {
              return 1;
            }
            return 0;
          });

          this.projectUsersList.forEach(projectUser => {

            projectUser['is_joined_to_request'] = this.currentUserIdIsInParticipants(this.request.participants, projectUser.id_user._id, this.request.request_id);
            this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS ID', projectUser.id_user._id, ' is JOINED ', projectUser['is_joined_to_request']);
          });
        }

        if (pair && pair._bots) {
          this.bots = pair._bots
            .filter(bot => {
              if (bot['trashed'] === false && bot['type'] === 'tilebot' && (!bot['subtype'] || bot['subtype'] === "chatbot" || bot['subtype'] === "voice" || bot['subtype'] === 'voice_twilio')) {
                return true
              } else {
                return false
              }
            })

          this.bots.sort(function compare(a: Chatbot, b: Chatbot) {
            if (a['name'].toLowerCase() < b['name'].toLowerCase()) {
              return -1;
            }
            if (a['name'].toLowerCase() > b['name'].toLowerCase()) {
              return 1;
            }
            return 0;
          });
        }
      }, error => {
        this.showSpinner_inModalUserList = false;
        this.logger.error('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.showSpinner_inModalUserList = false;
        this.logger.log('%% Ws-REQUESTS-Msgs - GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  // ----------------------------
  // GET DEPTS
  // ----------------------------
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((depts: any) => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET DEPTS RESPONSE ', depts);
      this.departments = depts;

      let count = 0;
      this.departments.forEach(dept => {
        if (dept.default === false && dept.status === 1) {
          count = count + 1;
        }
        let newInitials = '';
        let newFillColour = '';
        if (dept.name) {
          newInitials = avatarPlaceholder(dept.name);
          if (dept.default !== true) {
            newFillColour = getColorBck(dept.name);
          } else if (dept.default === true && this.departments.length === 1) {
            newFillColour = '#6264A7'
          } else if (dept.default === true && this.departments.length > 1) {
            newFillColour = 'rgba(98, 100, 167, 0.6) '
          }
        } else {
          newInitials = 'N/A.';
          newFillColour = '#eeeeee';
        }

        dept['dept_name_initial'] = newInitials;
        dept['dept_name_fillcolour'] = newFillColour;

        if (dept.routing === 'assigned' || dept.routing === 'pooled') {
          if (dept.id_group !== null && dept.id_group !== undefined) {
            this.getGroupById(dept.id_group)
          }
          if (dept.id_bot !== null && dept.id_bot !== undefined) {
            this.getBotById(dept.id_bot);
          }
        }
      });

      this.departments.sort(function compare(a: any, b: any) {
        if (a['name'].toLowerCase() < b['name'].toLowerCase()) {
          return -1;
        }
        if (a['name'].toLowerCase() > b['name'].toLowerCase()) {
          return 1;
        }
        return 0;
      });


      this.COUNT_OF_VISIBLE_DEPT = count;
      this.logger.log('[WS-REQUESTS-MSGS] - GET DEPTS - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET DEPTS * COMPLETE *')
    });
  }

  // ----------------------------
  // GET GROUP BY ID
  // ----------------------------
  getGroupById(id_group) {
    this.groupsService.getGroupById(id_group).subscribe((group: any) => {

      if (group) {
        this.logger.log('[WS-REQUESTS-MSGS] - GET GROUP RESPONSE', group);

        // this.groupName = group.name
        // this.groupIsTrashed = group.trashed
        // this.logger.log(' -- > GROUP NAME ', this.groupName, 'is TRASHED ', this.groupIsTrashed);
        for (const dept of this.departments) {
          if (dept.id_group === group._id) {
            if (dept.routing === 'assigned' || dept.routing === 'pooled') {
              dept.hasGroupName = group.name
              if (group.trashed === true) {
                dept.groupHasBeenTrashed = true
              }
            }
          }
        }
      }
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET GROUP - ERROR ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET GROUP * COMPLETE *')
    });
  }


  // ----------------------------
  // GET BOT BY ID 
  // ----------------------------
  getBotById(id_bot) {
    this.faqKbService.getFaqKbById(id_bot).subscribe((bot: any) => {
      if (bot) {
        this.logger.log('[WS-REQUESTS-MSGS] - BOT GET BY ID RES', bot);
        const botName = bot.name;

        for (const dept of this.departments) {
          if (dept.id_bot === bot._id) {
            dept.hasBotName = botName
            dept.botHasBeenTrashed = bot.trashed
          }
        }
      }
    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR', error);

      const errorMsg = error['error']['msg']
      this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR MSG', errorMsg);

      if (errorMsg === 'Object not found.') {
        this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR BODY MSG', errorMsg);
        this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR url', error.url);

        const IdOfBotNotFound = error.url.split('/').pop();
        this.logger.error('[WS-REQUESTS-MSGS] - BOT GET BY ID - ERROR - ID OF BOT NOT FOUND ', IdOfBotNotFound);
      }
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] - BOT GET BY ID * COMPLETE *')
    });
  }


  selectUser(user_id: string, user_firstname: string, user_lastname: string, user_email: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER ID ', user_id);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER FIRSTNAME ', user_firstname);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER LASTNAME ', user_lastname);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED USER EMAIL ', user_email);
    this.userid_selected = user_id;
    this.userfirstname_selected = user_firstname;
    this.userlastname_selected = user_lastname;
    this.useremail_selected = user_email;

    // const testDiv = <HTMLElement>document.querySelector('.swap_btn');
    // this.logger.log('REQUEST-MSGS - SELECTED USER ROW TOP OFFSET ', testDiv.offsetTop);
    // this.displayConfirmReassignmentModal = 'block';

    if (this.actionInModal === 'reassign') {
      this.logger.log('[WS-REQUESTS-MSGS] selectUser actionInModal ', this.actionInModal)
      this.presentSwalModalReassignConversationToAgent(this.userid_selected, this.userfirstname_selected, this.userlastname_selected);
    }

    if (this.actionInModal === 'invite') {
      this.logger.log('[WS-REQUESTS-MSGS] selectUser actionInModal ', this.actionInModal)
      this.presentSwalModalAddAgentToConversation(this.userid_selected, this.userfirstname_selected, this.userlastname_selected);
    }
  }

  presentSwalModalReassignConversationToAgent(userid, userfirstname, userlastname) {
    Swal.fire({
      title: this.translationMap.get('VisitorsPage.ReassignRequest'),
      text: this.translationMap.get('VisitorsPage.TheRequestWillBeReassignedTo') + ' ' + userfirstname + ' ' + userlastname,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Ok'),
      cancelButtonText: this.translate.instant('Cancel'),
      // confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,

      // buttons: true,
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent swal willReassign to User', result)


          this.wsRequestsService.setParticipants(this.id_request, userid).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent in swal willReassign to User setParticipants res ', res)

          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] ReassignConversationToAgent in swal willReassign to User setParticipants - ERROR ', error);

            Swal.fire({
              title: this.translate.instant('Oops') + '!',
              text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
              icon: "error",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonText: this.translate.instant('Ok'),
              confirmButtonColor: "var(--primary-btn-background)",
              customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent in swal willReassign to User setParticipants * COMPLETE *');

            Swal.fire({
              title: this.translationMap.get('Done') + "!",
              // text: 'Conversation successfully reassigned',
              icon: "success",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonColor: "var(--primary-btn-background)",
              confirmButtonText: this.translate.instant('Ok'),
              customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            }).then((okpressed) => {

              this.displayUsersListModal = 'none'
            });

          });
        } else {
          this.logger.log('[WS-REQUESTS-MSGS] + ReassignConversationToAgent  swal willReassign', confirm)
          // swal("Your imaginary file is safe!");
        }
      });
  }

  presentSwalModalAddAgentToConversation(userid, userfirstname, userlastname) {

    console.log('[WS-REQUESTS-MSGS] presentSwalModalAddAgentToConversation')
    Swal.fire({
      title: this.translationMap.get('VisitorsPage.AddAgent'),
      text: this.translate.instant('VisitorsPage.TheRequestWillBeAssignedTo', { user: userfirstname + ' ' + userlastname }),
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Ok'),
      cancelButtonText: this.translate.instant('Cancel'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      // buttons: true,
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation in wal willBeAdded to User', result)


          this.wsRequestsService.addParticipant(this.id_request, userid).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation in swal willBeAdded to User addParticipant res ', res)

          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] AddAgentToConversation in swal willBeAssigned to User addParticipant - ERROR ', error);

            Swal.fire({
              title: this.translate.instant('Oops') + '!',
              text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
              icon: "error",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonText: this.translate.instant('Ok'),
              confirmButtonColor: "var(--primary-btn-background)",
              customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation in swal willBeAssigned to User addParticipant * COMPLETE *');

            Swal.fire({
              title: this.translationMap.get('Done') + "!",
              icon: "success",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonColor: "var(--primary-btn-background)",
              confirmButtonText: this.translate.instant('Ok'),
              customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
            }).then((okpressed) => {

              this.displayUsersListModal = 'none'
            });

          });
        } else {
          this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation swal willReassign', result);
        }
      });

  }


  selectBot(botid: string, botname: string) {
    this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation - SELECTED BOT ID ', botid);
    this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation - SELECTED BOT NAME ', botname);
    this.userid_selected = 'bot_' + botid
    this.userfirstname_selected = botname;
    this.userlastname_selected = '';
    this.useremail_selected = '';
    this.displayConfirmReassignmentModal = 'block'
    let blocks = {}
    this.faqService.getAllFaqByFaqKbId(botid).subscribe((faqs: any) => {
      this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - GET ALL FAQ BY BOT ID', faqs);
      this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - GET ALL FAQ BY BOT ID CURRENT_USER_ROLE', this.CURRENT_USER_ROLE);

      // const intent_display_name_array = []

      if (faqs) {

        let processedItems = 0;
        // if (this.CURRENT_USER_ROLE === 'agent') {
        //   faqs = faqs.filter(faq => faq.agents_available === true);
        // }
        faqs.forEach((faq, index) => {
          processedItems++;
          blocks[faq.intent_display_name] = faq.intent_display_name
          // intent_display_name_array.push(block)

          if (processedItems === faqs.length) {
            this.logger.log('loop finished');
            this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - HERE 0 blocks', blocks);


            this.presentSwalModalReassignConversationToBot(this.userid_selected, this.userfirstname_selected, blocks)

          }

        });


        this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - blocks', blocks);
        // this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - intent_display_name_array', intent_display_name_array);
        // this.intent_display_name_array = this.intent_display_name_array.slice(0)
      }
    }, (error) => {
      this.logger.error('[MODAL-CHATBOT-REASSIGNMENT] >> FAQs GOT BY FAQ-KB ID - ERR ', error);
    }, () => {
      this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] >> FAQs GOT BY FAQ-KB ID - COMPLETE');

    });


  }

  // Select a block that will automatically execute when the chatbot joins the conversation
  async presentSwalModalReassignConversationToBot(botid, botname, blocks) {
    this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - blocks 2', blocks);
    const { value: block } = await Swal.fire({
      html: this.CHAT_PANEL_MODE === true ? `<label for="my-input"> ${this.translate.instant('SelectAblockThatWillAutomaticallyExecute')} </label>` : `${this.translationMap.get('VisitorsPage.TheRequestWillBeReassignedTo')} ${botname} <label for="my-input"> ${this.translate.instant('SelectAblockThatWillAutomaticallyExecute')} </label>`,
      title: this.translationMap.get('VisitorsPage.ReassignRequest'),
      // text: this.translationMap.get('VisitorsPage.TheRequestWillBeReassignedTo') + ' ' + botname, // if there is the html this is not diplayed
      // icon: "info",
      showCancelButton: true,
      backdrop: this.CHAT_PANEL_MODE === true ? 'rgba(0,0,0,.1)' : 'rgba(0, 0, 0, 0.4)',
      // buttons: true,
      // dangerMode: false,
      confirmButtonText: this.translate.instant('Ok'),
      cancelButtonText: this.translationMap.get('Cancel'),
      // confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
      input: "select",
      inputAttributes: {
        id: 'my-input'
      },
      inputPlaceholder: this.translate.instant('SelectAblock'), //"Select a block",
      inputOptions: blocks,
      inputValidator: (value: any) => {
        return new Promise((resolve) => {
          if (value === "") {
            resolve(this.translate.instant('YouNeedToSelectABlock'));
          } else {
            resolve(null);
          }
        });
      }
    });
    if (block) {
      // this.logger.log(`You selected: ${block}`);
      this.wsRequestsService.setParticipants(this.id_request, botid).subscribe((res: any) => {
        this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal result to Bot setParticipants res ', res)

      }, (error) => {
        this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal result to Bot setParticipants - ERROR ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToBot in swal willReassign to Bot setParticipants * COMPLETE *');
        this.sendMessage(block)
        this.trackReassignToBot(botid, botname)
      })
    }
  }

  sendMessage(block) {
    let message = '/' + block;
    this.selectedResponseTypeID = 3
    console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE ', message);
    this.wsMsgsService.sendChatMessage(this.id_project, this.id_request, message, this.selectedResponseTypeID, this.requester_id, this.IS_CURRENT_USER_JOINED, this.metadata, this.type)
      .subscribe((msg) => {

        console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE ', msg);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - ERROR ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - COMPLETE ');
        this.selectedResponseTypeID = 1
        // this.displayUsersListModal = 'none';
        this.presentDoneDialog()
      })

  }


  presentDoneDialog() {
    Swal.fire({
      title: this.translationMap.get('Done') + "!",
      icon: "success",
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    }).then((okpressed) => {
      this.displayUsersListModal = 'none';
    })
  }

  trackReassignToBot(botid, botname) {
    let userFullname = ''
    if (this.user.firstname && this.user.lastname) {
      userFullname = this.user.firstname + ' ' + this.user.lastname
    } else if (this.user.firstname && !this.user.lastname) {
      userFullname = this.user.firstname
    }
    if (!isDevMode()) {
      try {
        window['analytics'].track('Reassign to chatbot', {
          "type": "organic",
          "username": userFullname,
          "email": this.user.email,
          'userId': this.user._id,
          'chatbotName': botname,
          'chatbotId': botid,
          'page': 'Conversation detail, Reassign conversation',
          'button': 'Reassign',
        });
      } catch (err) {
        // this.logger.error(`Track Reassign to chatbot error`, err);
      }

      try {
        window['analytics'].identify(this.user._id, {
          username: userFullname,
          email: this.user.email,
          logins: 5,

        });
      } catch (err) {
        // this.logger.error(`Identify Reassign to chatbot error`, err);
      }

    }

  }


  presentModalSelectChatbotBlock(botname, botidNoPrefix) {
    // const dialogRef = this.dialog.open(ModalChatbotReassignmentComponent, {
    const dialogRef = this.dialog.open(ModalChatbotReassignmentComponent, {

      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        chatbot_id: botidNoPrefix,
        chatbot_name: botname
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      // if (editedChatbot) {
      //   this.logger.log(`[CNP-TEMPLATES] DIALOG CHATBOT NAME AFTER CLOSED editedChatbot:`, editedChatbot);
      //   this.importChatbotFromJSON(editedChatbot)

      //   this.logger.log(`[CNP-TEMPLATES] DIALOG CHATBOT NAME  AFTER CLOSE selectedNamespace:`, this.selectedNamespace);
      //   // this.selectedNamespace['name'] = editedChatbot['name']
      //   let body = { name: editedChatbot['name'] }
      //   this.updateNamespace(body)
      // }
    });

  }

  selectDept(deptname: string, deptid: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED DEPT ID ', deptname);
    this.logger.log('[WS-REQUESTS-MSGS] - SELECTED DEPT NAME ', deptid);

    this.deptid_selected = deptid
    this.deptname_selected = deptname

    this.presentSwalModalConfirmReassignToDept(deptid, deptname)
  }


  presentSwalModalConfirmReassignToDept(deptid, deptname) {
    Swal.fire({
      title: this.translationMap.get('VisitorsPage.ReassignRequest'),
      text: this.translationMap.get('VisitorsPage.TheRequestWillBeReassignedTo') + ' ' + deptname,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Ok'),
      cancelButtonText: this.translate.instant('Cancel'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,

      // buttons: true,
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept swal willReassign to dept', result)


          this.wsRequestsService.joinDept(deptid, this.id_request).subscribe((res: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept in swal joinDept res ', res)
          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] ConfirmReassignToDept in swal joinDept - ERROR ', error);

            Swal.fire({
              title: this.translate.instant('Oops') + '!',
              text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
              icon: "error",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonText: this.translate.instant('Ok'),
              confirmButtonColor: "var(--primary-btn-background)",
              customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
            });

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept in swal joinDept * COMPLETE *');

            Swal.fire({
              title: this.translationMap.get('Done') + "!",
              icon: "success",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonColor: "var(--primary-btn-background)",
              confirmButtonText: this.translate.instant('Ok'),
              customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
            }).then((okpressed) => {

              this.displayUsersListModal = 'none'
            });

          });
        } else {
          this.logger.log('[WS-REQUESTS-MSGS] ConfirmReassignToDept swal willReassign', result)
          // swal("Your imaginary file is safe!");
        }
      });
  }


  handleDropdownClick(event: MouseEvent): void {
    console.log('[WS-REQUESTS-MSGS] - handleDropdownClick ');
    if (!this.PERMISSION_TO_UPDATE_REQUEST_STATUS) {
      event.preventDefault(); // Prevent dropdown from opening
      // event.stopPropagation();
      event.stopImmediatePropagation();
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)

    }

    this.isDropdownOpen = !this.isDropdownOpen;
  }

  resolveRequest(requestid) {
    if (this.CHAT_PANEL_MODE) {
      this.archiveRequestWithConfimationDialog(requestid)
    } else {
      this.archiveRequest(requestid)
    }

  }


  archiveRequestWithConfimationDialog(requestid) {
    if (!this.PERMISSION_TO_ARCHIVE_REQUEST) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
      return
    }

    Swal.fire({
      title: this.translationMap.get('AreYouSure') + "?",
      text: this.translate.instant('TheConversationWillBeResolved'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('VisitorsPage.Resolve'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
      .then((result) => {
        if (result.isDenied) {

          this.wsRequestsService.closeSupportGroup(requestid).subscribe((data: any) => {
            this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - DATA ', data);
            this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - archiveRequest requestid', requestid);

            this.notify.showArchivingRequestNotification(this.translationMap.get('ArchivingRequestNoticationMsg'));

            this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
            this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP (archiveRequest) - storedRequestId ', this.storedRequestId);

            if (requestid === this.storedRequestId) {
              this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP (archiveRequest) - REMOVE FROM STOREGAE storedRequestId ', this.storedRequestId);
              this.usersLocalDbService.removeFromStorage('last-selection-id')
            }
          }, (err) => {
            this.logger.error('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - ERROR ', err);

            //  NOTIFY ERROR 
            this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('AnErrorHasOccurredArchivingTheRequest'), 4, 'report_problem')
          }, () => {

            this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - COMPLETE');
            //  NOTIFY SUCCESS
            this.notify.showRequestIsArchivedNotification(this.translationMap.get('RequestSuccessfullyClosed'));

            let convWokingStatus = ''
            this.updateRequestWorkingStatus(convWokingStatus)
          });

        } else {
          this.logger.log('[WS-REQUESTS-MSGS] AddAgentToConversation swal willReassign', result);
        }
      });

  }

  archiveRequest(requestid) {
    if (this.PERMISSION_TO_ARCHIVE_REQUEST) {
      this.notify.showArchivingRequestNotification(this.translationMap.get('ArchivingRequestNoticationMsg'));

      this.wsRequestsService.closeSupportGroup(requestid)
        .subscribe((data: any) => {
          this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - DATA ', data);
          this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - archiveRequest requestid', requestid);

          this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
          this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP (archiveRequest) - storedRequestId ', this.storedRequestId);

          if (requestid === this.storedRequestId) {
            this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP (archiveRequest) - REMOVE FROM STOREGAE storedRequestId ', this.storedRequestId);
            this.usersLocalDbService.removeFromStorage('last-selection-id')
          }
        },
          (err) => {
            this.logger.error('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - ERROR ', err);

            //  NOTIFY ERROR 
            this.notify.showWidgetStyleUpdateNotification(this.translationMap.get('AnErrorHasOccurredArchivingTheRequest'), 4, 'report_problem')
          }, () => {

            this.logger.log('[WS-REQUESTS-MSGS] - CLOSE SUPPORT GROUP - COMPLETE');
            //  NOTIFY SUCCESS
            this.notify.showRequestIsArchivedNotification(this.translationMap.get('RequestSuccessfullyClosed'));

            let convWokingStatus = ''
            this.updateRequestWorkingStatus(convWokingStatus)
          });
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
    }
  }

  reopenArchivedRequest(request, request_id) {
    if (!this.PERMISSION_TO_REOPEN) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE);
      return;
    }
    this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - REQUEST ID', request_id)
    this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - REQUEST ', request)
    // this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - REQUEST closed_at', request['closed_at'])
    // const formattedClosedAt = request['closed_at'].format('YYYY , MM,  DD')
    // const closedAtPlusTen = moment(new Date(request['closed_at'])).add(10, 'days').format("YYYY-MM-DD")
    // this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - REQUEST closedAtPlusTen', closedAtPlusTen)

    // const closedAt = moment(new Date(request['closed_at'])).toDate()
    // this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - closedAt ', closedAt)
    // const createdAt = moment(new Date(request['createdAt'])).format("YYYY-MM-DD") // for test
    // this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - createdAt ', createdAt) // for test
    // const today = moment(new Date()).format("YYYY-MM-DD")
    // this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - today is ', today)
    // unarchiveRequest


    const requestclosedAt = moment(request['closed_at']);
    this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - requestclosedAt ', requestclosedAt)
    const currentTime = moment();
    this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - currentTime ', currentTime)


    const daysDiff = currentTime.diff(requestclosedAt, 'd');
    this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - daysDiff ', daysDiff)


    if (daysDiff > 10) {
      this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST - THE CONVERSATION HAS BEEN ARCHIVED FOR MORE THAN 10 DAYS  ')
      this.presentModalReopenConvIsNotPossible()
    } else {
      // this.logger.log(moment(closedAtPlusTen).isSame(today))
      this.reopenConversation(request_id)

      let convWokingStatus = 'open'
      this.updateRequestWorkingStatus(convWokingStatus)

      this.logger.log('[WS-REQUESTS-MSGS] - REOPEN ARCHIVED REQUEST -  THE CONVERSATION HAS BEEN ARCHIVED FOR LESS THAN 10 DAYS  ')
    }



  }

  presentModalReopenConvIsNotPossible() {
    Swal.fire({
      title: this.translationMap.get('Warning'),
      text: this.translationMap.get('ConversationsArchivedCannotBeReopened'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--primary-btn-background)",
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
      // button: "OK",
      // dangerMode: false,
    })
  }


  reopenConversation(request_id) {
    this.wsRequestsService.unarchiveRequest(request_id).subscribe((res: any) => {
      this.logger.log('[WS-REQUESTS-MSGS]  REOPEN ARCHIVED REQUEST ', res)

    }, (error) => {
      this.logger.error('[WS-REQUESTS-MSGS]  REOPEN ARCHIVED REQUEST - ERROR ', error);


    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS]  REOPEN ARCHIVED REQUEST * COMPLETE *');

    })
  }


  getJoinTooltipMessage(): string {
    if (!this.PERMISSION_TO_JOIN_REQUEST) {
      return this.translate.instant('YonDontHavePermissionsToPerformThisAction');
    }

    if (this.request?.status !== 1000) {
      return this.translate.instant('ThisConversationIsNotAssignedToYou');
    }

    return this.translate.instant('ThisConversationIsClosedReopenItToJoin');
  }


  // JOIN TO CHAT GROUP
  onJoinHandled() {
    if (!this.PERMISSION_TO_JOIN_REQUEST) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
    if (this.request.channel.name === 'email' || this.request.channel.name === 'form') {
      if (this.agents_array.length === 1 && this.agents_array[0].isBot === false) {
        this.logger.log('[WS-REQUESTS-MSGS] onJoinHandled this.agents_array ', this.agents_array)
        this.logger.log('[WS-REQUESTS-MSGS] onJoinHandled this.agents_array 0 is a bot', this.agents_array[0].isBot)
        let agentFullname = ""
        if (this.agents_array[0].firstname && this.agents_array[0].lastname) {
          agentFullname = this.agents_array[0].firstname + ' ' + this.agents_array[0].lastname
        } else if (this.agents_array[0].firstname && !this.agents_array[0].lastname) {
          agentFullname = this.agents_array[0].firstname
        }
        this.presentModalYouCannotJoinChat(agentFullname)
      } else if (this.agents_array.length === 1 && this.agents_array[0].isBot === true) {
        this.joinChat()
      } else if (this.agents_array.length === 0) {
        this.joinChat()
      }
    } else if (this.request.channel.name !== 'email' || this.request.channel.name !== 'form' || this.request.channel.name === 'telegram' || this.request.channel.name === 'whatsapp' || this.request.channel.name === 'messenger' || this.request.channel.name === 'chat21') {
      this.joinChat()
    }

  }


  presentModalYouCannotJoinChat(agentFullname) {
    Swal.fire({
      title: this.translationMap.get('RequestMsgsPage.YouCannotJoinThisChat'),
      text: this.translate.instant('ThisChatIsAlreadyServedBy', { agent_fullname: agentFullname }) + ' ' + this.translate.instant('EmailAndTicketCanOnlyBeServedByOneAgent') + '.',
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonColor: "var(--primary-btn-background)",
      confirmButtonText: this.translate.instant('Ok'),
      // buttons: 'OK',
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
  }


  joinChat() {
    this.logger.log('[WS-REQUESTS-MSGS]- JOIN PRESSED');
    this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = true;

    this.wsRequestsService.addParticipant(this.id_request, this.currentUserID)
      .subscribe((data: any) => {

        this.logger.log('[WS-REQUESTS-MSGS] - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - addParticipant TO CHAT GROUP - ERROR ', err);
        this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
        this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
        this.JOIN_TO_GROUP_HAS_ERROR = true;
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - addParticipant TO CHAT GROUP * COMPLETE *');

        this.notify.showWidgetStyleUpdateNotification(this.translate.instant("RequestMsgsPage.YouHaveBeenSuccessfullyAddedToTheChat"), 2, 'done');
        this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
        this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = true;
      });
  }


  openleaveChatModal() {
    if (!this.PERMISSION_TO_LEFT_REQUEST) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE);
      return;
    }

    if (this.request.channel.name === 'email' || this.request.channel.name === 'form') {

      if (this.agents_array.length === 1) {
        this.presentModalYouCannotLeaveTheChat()
      } else if (this.agents_array.length > 1) {
        this.presentModalLeaveTheChat()
      }

    } else if (this.request.channel.name !== 'email' || this.request.channel.name !== 'form' || this.request.channel.name === 'telegram' || this.request.channel.name === 'whatsapp' || this.request.channel.name === 'messenger' || this.request.channel.name === 'chat21') {

      this.presentModalLeaveTheChat()

    }

    // this.displayLeaveChatModal = 'block'
  }
  // this.leaveChatTitle,
  presentModalYouCannotLeaveTheChat() {
    Swal.fire({
      title: this.translationMap.get('YouCannotLeaveTheChat'),
      text: this.translate.instant('EmailAndTicketSupportCannotBeUnserved'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--primary-btn-background)",
      // buttons: 'OK',
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : "",
    })
  }

  presentModalLeaveTheChat() {
    Swal.fire({
      // title: this.translationMap.get('VisitorsPage.AreYouSureLeftTheChat'),
      title: this.translationMap.get('AreYouSure') + "?",
      text: this.translate.instant('YouAreAboutToLeaveTheConversation'),
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Ok'),
      cancelButtonText: this.translate.instant('Cancel'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      // buttons: true,
      // dangerMode: false,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.logger.log('[WS-REQUESTS-MSGS] LEAVE THE CHAT', result)
          this.wsRequestsService.leaveTheGroup(this.id_request, this.currentUserID)
            .subscribe((data: any) => {

              this.logger.log('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - RESPONSE ', data);
            }, (err) => {
              this.logger.error('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - ERROR ', err);

              Swal.fire({
                title: this.translate.instant('Oops') + '!',
                text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
                icon: "error",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonText: this.translate.instant('Ok'),
                confirmButtonColor: "var(--primary-btn-background)",
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              });
            }, () => {
              Swal.fire({
                title: this.translationMap.get('Done') + "!",
                icon: "success",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonColor: "var(--primary-btn-background)",
                confirmButtonText: this.translate.instant('Ok'),

                // button: "OK",
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              }).then((okpressed) => {
                this.logger.log('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - COMPLETE  okpressed ', okpressed);
                this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
              });
            });

        } else {
          this.logger.log('[WS-REQUESTS-MSGS] ReassignConversationToAgent  swal willRwillleaveeassign', result)
          // swal("Your imaginary file is safe!");
        }
      });
  }

  leaveChat() {
    this.displayLeaveChatModal = 'none'
    this.displayLeavingChatInfoModal = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;
    this.wsRequestsService.leaveTheGroup(this.id_request, this.currentUserID)
      .subscribe((data: any) => {

        this.logger.log('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - RESPONSE ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-MSGS] - LEAVE THE GROUP - ERROR ', err);
        this.SHOW_CIRCULAR_SPINNER = false;
        this.LEAVE_CHAT_ERROR = true;

      }, () => {
        this.notify.showWidgetStyleUpdateNotification(`You have successfully left the chat`, 2, 'done');
        this.logger.log('[WS-REQUESTS-MSGS] - LEAVE THE GROUP * COMPLETE');
        this.SHOW_CIRCULAR_SPINNER = false;
        this.LEAVE_CHAT_ERROR = false;
        this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
      });
  }

  closeLeaveChatModal() {
    this.displayLeaveChatModal = 'none'
  }

  closeLeavingChatInfoModal() {
    this.displayLeavingChatInfoModal = 'none';
  }

  // -------------------------------------------------------------
  // Toggle methods
  // -------------------------------------------------------------
  toggleShowAllClientString() {
    this.showAllClientString = !this.showAllClientString;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL TEXT OF THE ATTRIBUTES > CLIENT ', this.showAllClientString)
  }

  toggleShowAllsenderAuthInfoString() {
    this.showAllsenderAuthInfoString = !this.showAllsenderAuthInfoString;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL TEXT OF THE ATTRIBUTES > SENDER AUTH INFO ', this.showAllsenderAuthInfoString);
  }

  toggleShowAllSourcePageString() {
    this.showAllSourcePageString = !this.showAllSourcePageString;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL TEXT OF THE ATTRIBUTES > SOURCR PAGE ', this.showAllSourcePageString);

    const sourcepageArrowIconElem = <HTMLElement>document.querySelector('#source_page_arrow_down');

    if (this.showAllSourcePageString === true) {
      sourcepageArrowIconElem.classList.add("up");
    }
    if (this.showAllSourcePageString === false) {
      sourcepageArrowIconElem.className = sourcepageArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }

  toggleShowAllRequestId() {
    this.showAllIdRequest = !this.showAllIdRequest;
    this.logger.log('[WS-REQUESTS-MSGS] - SHOW ALL REQUEST ID ', this.showAllIdRequest);

    const requestIdArrowIconElem = <HTMLElement>document.querySelector('#request_id_arrow_down');
    // this.logger.log('SHOW ALL REQUEST ID requestIdArrowIconElem', this.showAllIdRequest);
    if (this.showAllIdRequest === true) {
      requestIdArrowIconElem.classList.add("up");
    }
    if (this.showAllIdRequest === false) {
      requestIdArrowIconElem.className = requestIdArrowIconElem.className.replace(/\bup\b/g, "");
    }
  }


  toggleShowAllString(elementAttributeValueId: any, elementArrowIconId: any, index) {
    this.logger.log(`[WS-REQUESTS-MSGS] - ATTRIBUTES toggleShowAllString - element Attribute Value Id:`, elementAttributeValueId);
    this.logger.log(`[WS-REQUESTS-MSGS] - ATTRIBUTES toggleShowAllString - element Arrow Icon id:`, elementArrowIconId);

    // -------------------------------------------------------------
    // get the element that contains the attribute's value
    // -------------------------------------------------------------
    const attributeValueElem = <HTMLElement>document.querySelector(`#${elementAttributeValueId}`);
    // this.logger.log(`[WS-REQUESTS-MSGS] ATTRIBUTES toggleShowAllString - attributeValueElem :`, attributeValueElem);
    // -------------------------------------------------------------
    // get the element arrow icon 
    // -------------------------------------------------------------
    const arrowIconElem = <HTMLElement>document.querySelector(`#${elementArrowIconId}`);
    // this.logger.log(`[WS-REQUESTS-MSGS] ATTRIBUTES toggleShowAllString - arrowIconElem :`, arrowIconElem);
    // -------------------------------------------------------------
    // get the value of aria-expanded
    // -------------------------------------------------------------
    let isAriaExpanded = attributeValueElem.getAttribute('aria-expanded')
    // this.logger.log(`[WS-REQUESTS-MSGS] ATTRIBUTES toggleShowAllString - element  isAriaExpanded:`, isAriaExpanded);

    if (isAriaExpanded === 'false') {
      // -----------------------------------------------------------------------------------
      // Replace class to the div that contains the attribute's value
      // -----------------------------------------------------------------------------------
      attributeValueElem.className = attributeValueElem.className.replace(/\battribute_cutted_text\b/g, "attribute_full_text")
      // -----------------------------------------------------------------------------------
      // Add class to the arrow icon
      // -----------------------------------------------------------------------------------
      arrowIconElem.classList.add("up");
      // -----------------------------------------------------------------------------------
      // Set aria-expanded attribute to true
      // -----------------------------------------------------------------------------------
      attributeValueElem.setAttribute('aria-expanded', 'true');
    }

    if (isAriaExpanded === 'true') {
      // -----------------------------------------------------------------------------------
      // Replace class to the div that contains the attribute's value 
      // -----------------------------------------------------------------------------------
      attributeValueElem.className = attributeValueElem.className.replace(/\battribute_full_text\b/g, "attribute_cutted_text")

      // -----------------------------------------------------------------------------------
      // Remove the class 'up' to the arrow icon (note: Remove Class Cross-browser solution)
      // ------------------------------------------------------------------------------------
      arrowIconElem.className = arrowIconElem.className.replace(/\bup\b/g, "");

      // -----------------------------------------------------------------------------------
      // Set aria-expanded attribute to false
      // -----------------------------------------------------------------------------------
      attributeValueElem.setAttribute('aria-expanded', 'false');
    }
  }


  checkPlanAndPresentModal() {

    if ((this.profile_name === PLAN_NAME.A) ||
      (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
      (this.profile_name === 'free' && this.trial_expired === true)) {
      if (!this.appSumoProfile) {

        // this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromBPlan)
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      } else {
        this.presentModalAppSumoFeautureAvailableFromBPlan()
        return false
      }
    } else if ((this.profile_name === PLAN_NAME.D) ||
      (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.EE && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
      (this.profile_name === 'Sandbox' && this.trial_expired === true)) {

      if (!this.appSumoProfile) {
        this.presentModalFeautureAvailableFromTier2Plan(this.featureAvailableFromEPlan)
        return false
      }
    }
  }

  checkPlanAndPresentModalContactUs() {

    if ((this.profile_name === PLAN_NAME.A) ||
      (this.profile_name === PLAN_NAME.B && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.C && this.subscription_is_active === false) ||
      (this.profile_name === 'free' && this.trial_expired === true)) {

      this.notify._displayContactUsModal(true, 'upgrade_plan');
      return false

    } else if ((this.profile_name === PLAN_NAME.D) ||
      (this.profile_name === PLAN_NAME.E && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.EE && this.subscription_is_active === false) ||
      (this.profile_name === PLAN_NAME.F && this.subscription_is_active === false) ||
      (this.profile_name === 'Sandbox' && this.trial_expired === true)) {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
      return false
    }
  }



  displayModalDownloadTranscript() {
    console.log('[WS-REQUESTS-MSGS] displayModalDownloadTranscript PERMISSION_TO_SEND_TRANSCRIPT ', this.PERMISSION_TO_SEND_TRANSCRIPT)
    if (!this.PERMISSION_TO_SEND_TRANSCRIPT) {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE);
      return
    }

    if (!this.overridePay) {
      if (this.isVisiblePaymentTab) {

        const isAvailable = this.checkPlanAndPresentModal()
        this.logger.log('[WS-REQUESTS-MSGS] feature is available ', isAvailable, 'overridePay ', this.overridePay)
        if (isAvailable === false) {
          return
        }

        this.displayModalTranscript = 'block'


      } else {
        this.notify._displayContactUsModal(true, 'upgrade_plan');
      }
    } else {

      const isAvailable = this.checkPlanAndPresentModalContactUs()
      this.logger.log('[WS-REQUESTS-MSGS] feature is available ', isAvailable, 'overridePay ', this.overridePay)
      if (isAvailable === false) {
        return
      }

      this.displayModalTranscript = 'block'

    }
  }


  closeModalTranscript() {
    this.displayModalTranscript = 'none'
  }

  openTranscriptAsHtml() {
    this.closeModalTranscript();
    const url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.html';
    this.logger.log('[WS-REQUESTS-MSGS] openTranscript url ', url);
    window.open(url, '_blank');
  }

  sendTranscriptByEmail() {
    this.closeModalTranscript();
    this.wsMsgsService.getTranscriptAsText(this.id_request).subscribe((emailBody) => {
      this.logger.log('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT emailBody:', emailBody);
      if (emailBody) {
        this.sendTrancriptEmail(emailBody)
      }

      this.logger.log('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT emailBody type of', typeof emailBody);
      // let emailBodyStingify = JSON.stringify(emailBody)

    }, error => {
      this.logger.error('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT ERROR', error);
    }, () => {

      this.logger.log('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT - COMPLETE');
    });
  }

  sendTrancriptEmail(emailBody) {
    const date = moment().format('ll');
    this.logger.log('[WS-REQUESTS-MSGS] SEND TRANSCRIT EMAIL - date ', date)
    this.logger.log('[WS-REQUESTS-MSGS] SEND TRANSCRIT EMAIL - CONTACT EMAIL ', this.contactNewEmail)
    this.mailtoBody = emailBody
    let contactEmail = ""
    if (this.contactNewEmail) {
      contactEmail = this.contactNewEmail
    }
    window.open(`mailto:` + contactEmail + `?subject=Chat transcript&body=` + encodeURIComponent(this.mailtoBody))
  }

  downloadTranscriptAsPDF() {
    this.closeModalTranscript();
    const url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.pdf'
    window.open(url, '_blank');
  }

  downloadTranscriptAsCSV() {
    this.closeModalTranscript();
    this.exportTranscriptToCSV()
  }

  exportTranscriptToCSV() {
    this.wsRequestsService.exportTranscriptAsCSVFile(this.id_request).subscribe((res: any) => {
      // this.logger.log('[WS-REQUESTS-MSGS - EXPORT TRANSCRIPT TO CSV', res);
      if (res) {
        this.downloadTranscriptAsCSVFile(res)
      }
    }, (error) => {
      // this.logger.error('[WS-REQUESTS-MSGS - EXPORT TRANSCRIPT TO CSV - ERROR  ', error);
    }, () => {
      // this.logger.log('[WS-REQUESTS-MSGS - EXPORT TRANSCRIPT TO CSV * COMPLETE *');
    });
  }

  downloadTranscriptAsCSVFile(data) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'transcript.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  // No more used
  onChangeTranscriptDownloadPreference(value) {
    this.logger.log(" Value is : ", value);
    this.transcriptDwnldPreference = value
  }
  // No more used
  downloadTranscript() {
    this.closeModalTranscript();
    // this.logger.log('transcriptDwnldPreference', this.transcriptDwnldPreference)
    if (this.transcriptDwnldPreference === 'CSV') {
      this.exportTranscriptToCSV()
    }

    if (this.transcriptDwnldPreference === 'PDF') {
      this.logger.log('[WS-REQUESTS-MSGS] - PDF HERE 1');
      // this.exportTranscriptToPDF()
      const url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.pdf'
      window.open(url, '_blank');
    }

    if (this.transcriptDwnldPreference === 'TXT') {
      this.logger.log('[WS-REQUESTS-MSGS] - TXT HERE 1');
      this.logger.log('[WS-REQUESTS-MSGS] - TXT HERE this.request.lead.email ', this.request.lead.email);

      // this.exportTranscriptToPDF()
      // const url = this.SERVER_BASE_PATH + 'public/requests/' + this.id_request + '/messages.txt'
      // window.open(url, '_blank');
      this.wsMsgsService.getTranscriptAsText(this.id_request).subscribe((emailBody) => {
        this.logger.log('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT emailBody:', emailBody);
        if (emailBody) {
          this.sendTrancriptEmail(emailBody)
        }

        this.logger.log('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT emailBody type of', typeof emailBody);
        // let emailBodyStingify = JSON.stringify(emailBody)

      }, error => {
        this.logger.error('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT ERROR', error);
      }, () => {

        this.logger.log('[WS-REQUESTS-MSGS] - GET TRANSCRIPT AS TXT - COMPLETE');
      });
    }

  }
  // No more used
  exportTranscriptToPDF() {
    this.logger.log('[WS-REQUESTS-MSGS - PDF HERE 2');
    this.wsRequestsService.exportTranscriptAsPDFFile(this.id_request).subscribe((res: any) => {
      // this.logger.log('[WS-REQUESTS-MSGS - EXPORT TRANSCRIPT TO PDF', res);
      if (res) {
        this.downloadTranscriptAsPDFFile(res)
      }
    }, (error) => {
      // this.logger.error('[WS-REQUESTS-MSGS - EXPORT TRANSCRIPT TO PDF - ERROR  ', error);
    }, () => {
      // this.logger.log('[WS-REQUESTS-MSGS - EXPORT TRANSCRIPT TO PDF * COMPLETE *');
    });
  }
  // No more used
  downloadTranscriptAsPDFFile(data) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'transcript.pdf');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  // ---------------------------
  // Ban Visitor
  // ---------------------------
  displayModalBanVisitor(leadid: string, ipaddress: string) {
    // this.logger.log('[WS-REQUESTS-MSGS] displayModalBanVisitor profile_name: ', this.profile_name)
    // this.logger.log('[WS-REQUESTS-MSGS] displayModalBanVisitor PLAN_NAME.C: ', PLAN_NAME.C)
    // this.logger.log('[WS-REQUESTS-MSGS] displayModalBanVisitor subscription_is_active: ', this.subscription_is_active)
    // if ((this.profile_name === PLAN_NAME.B && this.subscription_is_active === true) || (this.prjct_profile_type === 'free' && this.trial_expired === false)) {
    this.logger.log('displayModalBanVisitor leadid ', leadid)
    this.logger.log('displayModalBanVisitor bannedVisitorsArray ', this.bannedVisitorsArray)


    if (this.CURRENT_USER_ROLE === 'owner' || this.PERMISSION_TO_BAN_VISITOR === true) {
      if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.logger.log('displayModalBanVisitor HERE 1 ')
        if (this.subscription_is_active === true) {
          this.banVisitors(leadid, ipaddress)
        } else if (this.subscription_is_active === false) {
          // this.logger.log('displayModalBanVisitor HERE 3 ')
          if (this.profile_name === PLAN_NAME.C) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F, this.subscription_end_date);
          } else if (this.profile_name === PLAN_NAME.F) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F, this.subscription_end_date);
          }
        }
      } else if (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.B || this.profile_name === 'free') {
        this.logger.log('displayModalBanVisitor HERE 4 ')
        // this.presentModalFeautureAvailableOnlyWithTier3Plans(this.cPlanOnly)
        this.presentModalFeautureAvailableOnlyWithTier3Plans(this.fPlanOnly)
      } else if (this.profile_name === PLAN_NAME.D || this.profile_name === PLAN_NAME.E || this.profile_name === PLAN_NAME.EE || this.profile_name === 'Sandbox') {
        this.presentModalFeautureAvailableOnlyWithTier3Plans(this.fPlanOnly)
        this.logger.log('displayModalBanVisitor HERE 5 ')
      }
    } else {
      // this.logger.log('displayModalBanVisitor HERE 5 ')
      // this.presentModalOnlyOwnerCanManageAdvancedProjectSettings();
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE);
    }

  }


  presentModalOnlyOwnerCanManageAdvancedProjectSettings() {
    this.notify.presentModalOnlyOwnerCanManageAdvancedProjectSettings(
      this.translationMap.get('OnlyUserWithOwnerRoleCanManageAdvancedProjectSettings'),
      this.translationMap.get('LearnMoreAboutDefaultRoles')
    )
  }

  banVisitors(leadid: string, ipaddress: string) {
    const index = this.bannedVisitorsArray.findIndex((v) => v.id === leadid);
    this.logger.log("displayModalBanVisitor bannedVisitorsArray index", index)
    this.logger.log("displayModalBanVisitor bannedVisitorsArray", this.bannedVisitorsArray)
    // if (this.visitorIsBanned === false) {
    if (index === -1) {
      Swal.fire({
        title: this.translationMap.get('AreYouSure') + '?',
        icon: "warning",
        showCloseButton: false,
        showCancelButton: true,
        showConfirmButton: false,
        showDenyButton: true,
        denyButtonText: this.translate.instant('YesBanVisitor'),
        cancelButtonText: this.translate.instant('Cancel'),
        focusConfirm: false,
        reverseButtons: true,
        // buttons: [this.translationMap.get('Cancel'), this.translationMap.get('YesBanVisitor')],
        // dangerMode: true,
        customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      })
        .then((result) => {
          if (result.isDenied) {
            // this.logger.log('[WS-REQUESTS-MSGS] BAN VISITOR swal willBan ', willBan)

            this.projectService.banVisitor(leadid, ipaddress).subscribe((res: any) => {
              this.logger.log('[WS-REQUESTS-MSGS]  BAN VISITOR in swal - RES ', res)

            }, (error) => {
              // this.logger.error('[WS-REQUESTS-MSGS] BAN VISITOR in swal  - ERROR ', error);

              Swal.fire({
                title: this.translate.instant('Oops') + '!',
                text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
                icon: "error",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonText: this.translate.instant('Ok'),
                confirmButtonColor: "var(--primary-btn-background)",
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              });
            }, () => {
              // this.logger.log('[WS-REQUESTS-MSGS] BAN VISITOR in swal * COMPLETE *');
              Swal.fire({
                title: this.translationMap.get('Done') + "!",
                icon: "success",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonColor: "var(--primary-btn-background)",
                confirmButtonText: this.translate.instant('Ok'),
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              }).then((result) => {
                if (result.isConfirmed) {
                  this.cacheService.clearCache()
                  this.findCurrentProjectAmongAll(this.id_project)
                }
              });

            });
          } else {
            // this.logger.log('[WS-REQUESTS-MSGS] BAN VISITOR in swal  willBan', willBan)
            // swal("Your imaginary file is safe!");
          }
        });
    } else {
      this.presentModalVisitorAlreadyBanned()
    }
  }


  // Download transcript
  presentModalFeautureAvailableFromTier2Plan(planName) {
    // const el = document.createElement('div')
    // el.innerHTML = planName // this.featureAvailableFromBPlan
    Swal.fire({
      title: this.translationMap.get('Pricing.UpgradePlan'),
      text: planName,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translationMap.get('Pricing.UpgradePlan'),
      cancelButtonText: this.translationMap.get('Cancel'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      // content: el,
      // buttons: {
      //   cancel: this.translationMap.get('Cancel'),
      //   catch: {
      //     text: this.translationMap.get('Pricing.UpgradePlan'),
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // this.logger.log('featureAvailableFromBPlan value', value)
        // this.router.navigate(['project/' + this.id_project + '/pricing']);
        if (this.isVisiblePaymentTab) {

          if (this.CURRENT_USER_ROLE === 'owner') {
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
                this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
              } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
                this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
              }
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.profile_name === 'free') {  // 
              this.router.navigate(['project/' + this.id_project + '/pricing']);

            }

          } else {
            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  presentModalAppSumoFeautureAvailableFromBPlan() {
    // const el = document.createElement('div')
    // el.innerHTML = 'Available with ' + this.appSumoProfilefeatureAvailableFromBPlan
    Swal.fire({
      icon: "info",
      title: this.translationMap.get('Pricing.UpgradePlan'),
      text: 'Available from ' + this.appSumoProfilefeatureAvailableFromBPlan,
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translationMap.get('Pricing.UpgradePlan'),
      cancelButtonText: this.translationMap.get('Cancel'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      // content: el,
      // buttons: {
      //   cancel: this.translationMap.get('Cancel'),
      //   catch: {
      //     text: this.translationMap.get('Pricing.UpgradePlan'),
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.CURRENT_USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.id_project + '/project-settings/payments']);
        } else {
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }
    });
  }


  // Banned visitors 
  presentModalFeautureAvailableOnlyWithTier3Plans(planName) {
    // const el = document.createElement('div')
    // el.innerHTML = planName // this.cPlanOnly
    Swal.fire({
      icon: "info",
      title: this.translationMap.get('Pricing.UpgradePlan'),
      text: planName,
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.translationMap.get('Pricing.UpgradePlan'),
      cancelButtonText: this.translationMap.get('Cancel'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""

      // content: el,
      // buttons: {
      //   cancel: this.translationMap.get('Cancel'),
      //   catch: {
      //     text: this.translationMap.get('Pricing.UpgradePlan'),
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        // this.logger.log('featureAvailableFromPlanC value', value)
        if (this.isVisiblePaymentTab) {
          if (this.CURRENT_USER_ROLE === 'owner') {
            if (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.B || this.profile_name === PLAN_NAME.D || this.profile_name === PLAN_NAME.E || this.profile_name === PLAN_NAME.EE) {
              // if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free') {
              this.router.navigate(['project/' + this.id_project + '/pricing']);

            }
          } else {
            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }

    });
  }

  presentModalAgentCannotManageAvancedSettings() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(
      this.translationMap.get('UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject'),
      this.translationMap.get('LearnMoreAboutDefaultRoles')
    )
  }

  presentModalVisitorAlreadyBanned() {
    Swal.fire({
      title: this.translationMap.get('Warning'),
      text: this.translationMap.get('VisitorAlreadyBanned'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--primary-btn-background)",
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      // button: "OK",
      // dangerMode: false,
    })
  }


  goToTags() {
    this.router.navigate(['project/' + this.id_project + '/labels']);
  }


  openChatAtSelectedConversation() {
    this.openChatBtn.nativeElement.blur();
    localStorage.setItem('last_project', JSON.stringify(this.current_selected_prjct))
    this.openChatToTheSelectedConversation(this.CHAT_BASE_URL, this.id_request, this.request.lead.fullname)
  }

  // openChatInNewWindow() {
  //   // RESOLVE THE BUG: THE BUTTON 'OPEN THE CHAT' REMAIN FOCUSED AFTER PRESSED
  //   this.openChatBtn.nativeElement.blur();

  //   this.logger.log('[WS-REQUESTS-MSGS] openChatInNewWindow CHAT_BASE_URL ', this.CHAT_BASE_URL);
  //   // let url = '';
  //   // if (this.FIREBASE_AUTH === false) {
  //   //   url = this.CHAT_BASE_URL + "/" + this.id_request + "/" + this.request.lead.fullname + "/active"
  //   // } else if (this.FIREBASE_AUTH === true)  {
  //   //   url = this.CHAT_BASE_URL + '?recipient=' + this.id_request;
  //   // } else {
  //   //   url = this.CHAT_BASE_URL + '#/conversation-detail/'+ this.id_request + "/" + this.request.lead.fullname + "/active"
  //   // }
  //   const url = this.CHAT_BASE_URL + '#/conversation-detail/' + this.id_request + "/" + this.request.lead.fullname + "/active"
  //   this.logger.log('[WS-REQUESTS-MSGS] openChatInNewWindow url ', url);
  //   window.open(url, '_blank');
  //   // this.openWindow('Tiledesk - Open Source Live Chat', url)
  //   // this.focusWin('Tiledesk - Open Source Live Chat')
  // }

  openWindow(winName: any, winURL: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      alert('window already exists');
    } else {
      myWindows[winName] = window.open(winURL, winName);
    }
  }

  focusWin(winName: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      myWindows[winName].focus();
    } else {
      // alert('cannot focus closed or nonexistant window');
      this.logger.log('[HOME] - cannot focus closed or nonexistant window');
    }
  }


  chatWithAgent(agentId, agentFirstname, agentLastname) {
    this.logger.log('[WS-REQUESTS-MSGS] - CHAT WITH AGENT - agentId: ', agentId, ' - agentFirstname: ', agentFirstname, ' - agentLastname: ', agentLastname);

    // https://support-pre.tiledesk.com/chat/index.html?recipient=5de9200d6722370017731969&recipientFullname=Nuovopre%20Pre
    // https://support-pre.tiledesk.com/chat/index.html?recipient=5dd278b8989ecd00174f9d6b&recipientFullname=Gian Burrasca

    // let _agentLastName = ''
    // if (agentLastname) {
    //   _agentLastName = agentLastname
    // }
    // const url = this.CHAT_BASE_URL + '?' + 'recipient=' + agentId + '&recipientFullname=' + agentFirstname + ' ' + _agentLastName;

    let agentFullname = ''
    if (agentLastname) {
      agentFullname = agentFirstname + ' ' + agentLastname
    } else {
      agentFullname = agentFirstname
    }
    // const url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    // this.logger.log('[WS-REQUESTS-MSGS] - chatWithAgent - CHAT URL ', url);
    // window.open(url, '_blank');


    // ---- new
    localStorage.setItem('last_project', JSON.stringify(this.current_selected_prjct))
    let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
    let url = baseUrl + agentId + '/' + agentFullname + '/new'
    const myWindow = window.open(url, '_self', 'Tiledesk - Open Source Live Chat');
    myWindow.focus();


    // const chatTabCount = localStorage.getItem('tabCount')
    // this.logger.log('[WS-REQUESTS-MSGS] chatWithAgent chatTabCount ', chatTabCount)
    // let url = ''
    // if (chatTabCount) {
    //   if (+chatTabCount > 0) {
    //     this.logger.log('[WS-REQUESTS-MSGS]  chatWithAgent chatTabCount > 0 ')
    //     url = this.CHAT_BASE_URL + '#/conversation-detail?contact_id=' + agentId + '&contact_fullname=' + agentFullname
    //     this.openWindow('Tiledesk - Open Source Live Chat', url)
    //   } else if (chatTabCount && +chatTabCount === 0) {
    //     this.logger.log('[WS-REQUESTS-MSGS]  chatWithAgent chatTabCount = 0 ')
    //     url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    //     this.openWindow('Tiledesk - Open Source Live Chat', url)
    //   }
    // } else {
    //   url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    //   this.openWindow('Tiledesk - Open Source Live Chat', url)
    // }

  }

  goToContactDetails() {
    if (this.CHAT_PANEL_MODE === false) {
      this.router.navigate(['project/' + this.id_project + '/contact', this.contact_id]);
    }
  }

  openContactDetailsInNewWindow() {
    const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/contact/' + this.contact_id;
    window.open(url, '_blank');
  }

  goToMemberProfile(member, member_id: any) {
    this.logger.log('[WS-REQUESTS-MSGS] - goToMemberProfile - has clicked GO To MEMBER member ', member);

    if (this.CHAT_PANEL_MODE === false) {
      if (member_id.indexOf('bot_') !== -1) {
        this.logger.log('[WS-REQUESTS-MSGS] IS A BOT !');

        const id_bot = member_id.substring(4);
        // this.router.navigate(['project/' + this.id_project + '/botprofile/' + member_id]);
        const bot = this.botLocalDbService.getBotFromStorage(id_bot);
        this.logger.log('[WS-REQUESTS-MSGS] - goToMemberProfile - BOT FROM STORAGE ', bot)

        let botType = ''
        if (bot.type === 'internal') {

          botType = 'native'
          if (this.CURRENT_USER_ROLE !== 'agent') {
            this.router.navigate(['project/' + this.id_project + '/bots/intents/', id_bot, botType]);
          }

        } else if (bot.type === 'tilebot') {
          botType = 'tilebot'

          if (!this.PERMISSION_TO_EDIT_FLOWS) {
            this.notify.presentDialogNoPermissionToPermomfAction()
            return;
          }
          if (this.CURRENT_USER_ROLE !== 'agent') {
            // this.router.navigate(['project/' + this.id_project + '/tilebot/intents/', id_bot, botType]);
            goToCDSVersion(this.router, bot, this.id_project, this.appConfigService.getConfig().cdsBaseUrl)
          }
        } else if (bot.type === 'tiledesk-ai') {
          botType = 'tiledesk-ai'

          if (!this.PERMISSION_TO_EDIT_FLOWS) {
            this.notify.presentDialogNoPermissionToPermomfAction()
            return;
          }
          if (this.CURRENT_USER_ROLE !== 'agent') {
            goToCDSVersion(this.router, bot, this.id_project, this.appConfigService.getConfig().cdsBaseUrl)
          }
        } else {

          if (!this.PERMISSION_TO_UPDATE_APP) {
            this.notify.presentDialogNoPermissionToPermomfAction()
            return;
          }

          if (this.CURRENT_USER_ROLE !== 'agent') {
            this.router.navigate(['project/' + this.id_project + '/bots', id_bot, botType]);
          }
          botType = bot.type
        }

      } else {
        if (!this.PERMISSION_TO_READ_TEAMMATE_DETAILS) {
          this.notify.presentDialogNoPermissionToPermomfAction()
          return;
        }
        // this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
        this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
      }
    }
  }


  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id).subscribe((projectUser: any) => {
      this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER - projectUser', projectUser)
      if (projectUser) {
        this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER - projectUser id', projectUser[0]._id);

        this.router.navigate(['project/' + this.id_project + '/user/edit/' + projectUser[0]._id]);
      }
    }, (error) => {
      this.logger.error('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER - ERROR ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-MSGS] GET projectUser by USER-ID & GO TO EDIT PROJECT USER * COMPLETE *');
    });
  }

  // dispalyed only if CHAT_PANEL_MODE === true
  goToRequestInNewTab() {
    // target="_blank" routerLink="project/{{id_project}}/wsrequest/{{id_request}}/messages"
    const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/wsrequest/' + this.id_request + '/messages'
    window.open(url, '_blank');
  }

  goToProjectHomeInNewTab() {
    // target="_blank" routerLink="project/{{id_project}}/wsrequest/{{id_request}}/messages"
    const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/home'
    window.open(url, '_blank');
  }

  goToContactDetailsInNewTab() {
    // this.router.navigate(['project/' + this.id_project + '/contact', this.contact_id]);
    if (this.NODEJS_REQUEST_CNTCT_FOUND === true) {
      const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/contact/' + this.contact_id
      window.open(url, '_blank');
    }
  }

  goToEvents() {
    if (this.request.requester) {
      this.router.navigate(['project/' + this.id_project + '/events/', this.request.requester.id]);
    }
  }

  // ----------------------------------
  // No used
  // ----------------------------------
  // openUserList() {
  //   this.router.navigate(['project/' + this.id_project + '/userslist']);
  // }

  // ----------------------------------
  // No used
  // ----------------------------------
  disableMainPanelScroll() {
    let elMainPanel = <HTMLElement>document.querySelector('.main-panel');
    elMainPanel.setAttribute('style', 'overflow-anchor: none;');
    //   this.main_panel_scrolltop = elMainPanel.scrollTop;
    //   this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elMainPanel scrollTop: ', this.main_panel_scrolltop);

    //  let el_ws_msgs_note__textarea = <HTMLElement>document.querySelector('.ws_msgs_note__textarea');
    //  this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit el_ws_msgs_note__textarea: ', el_ws_msgs_note__textarea.scrollTop);

    //  this.topPos = el_ws_msgs_note__textarea.getBoundingClientRect().top + window.scrollY;
    //  this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit el_ws_msgs_note__textarea topPos: ', this.topPos);


    // let scrollbarWidth =  elMainPanel.scrollWidth - elMainPanel.clientWidth;
    // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elMainPanel scrollbarWidth elMainPanel: ', scrollbarWidth);

    let elBody = <HTMLElement>document.querySelector('body');
    // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elBody: ', elBody);
    // elBody.setAttribute('style', 'overflow-anchor: none;');


    // let scrollbarWidthb =  elBody.scrollWidth - elBody.clientWidth;
    // this.logger.log('% Ws-REQUESTS-Msgs - note-wf - onInit elMainPanel scrollbarWidthb elBody: ', scrollbarWidthb);
  }

  // ----------------------------------
  // No used
  // ----------------------------------
  enableMainPanelScroll() {
    let elMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('% Ws-REQUESTS-Msgs - note-wf - completed add note - elMainPanel: ', elMainPanel);
    // elMainPanel.style.overflow-x = 'overflow-x: hidden !important';
    // elMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
    this.logger.log('% Ws-REQUESTS-Msgs - note-wf - enableMainPanelScroll elMainPanel scrollTop: ', this.main_panel_scrolltop);
    // elMainPanel.scrollTop = this.main_panel_scrolltop

    elMainPanel.scrollIntoView()
    // elMainPanel.scrollTop = this.topPos
  }



  // -----------------------------------------------
  // @ Translate strings
  // -----------------------------------------------
  translateNotificationMsgs() {

    let keys = [
      'Tags.NotificationMsgs',
      'Notes.NotificationMsgs',
      'Processing',
      'TheRequestHasBeenMovedToHistory',
      'AnErrorHasOccurredArchivingTheRequest',
      'ArchivingRequestNoticationMsg',
      'RequestSuccessfullyClosed',
      'VisitorsPage.ReassignRequest',
      'VisitorsPage.TheRequestWillBeReassignedTo',
      'VisitorsPage.AddAgent',
      'VisitorsPage.TheRequestWillBeAssignedTo',
      'UserEditAddPage.AnErrorHasOccurred',
      'Done',
      'TheConversationPriorityHasBeenSuccessfullyUpdated',
      'AnErrorOccurredWhileUpdatingTheCnversationPriority',
      'VisitorsPage.LeaveChat',
      'VisitorsPage.AreYouSureLeftTheChat',
      'Warning',
      'ConversationsArchivedCannotBeReopened',
      'SubjectUpdatedSuccessfully',
      'UserEditAddPage.AnErrorHasOccurred',
      'AreYouSure',
      'Cancel',
      'YesBanVisitor',
      'TheMessageCouldNotBeSent',
      'YouCannotLeaveTheChat',
      'YouCannotAddAgents',
      'VisitorsPage.AddAgent',
      'YouCannotJoinChat',
      'RequestMsgsPage.Enter',
      'RequestMsgsPage.YouCannotJoinThisChat',
      'VisitorAlreadyBanned',
      'SmartReassignmentForThisConversationWillBeDisabled',
      'ConvertToOffline',
      'ConvertToOnline',
      'SmartReassignmentForThisConversationWillBeEnabled',
      'TagAlreadyAssigned',
      'ThisTagHasBeenAlreadyAssignedPleaseEnterUniqueTag',
      'UsersWiththeAgentroleCannotManageTheAdvancedOptionsOfTheProject',
      'LearnMoreAboutDefaultRoles',
      'OnlyUserWithOwnerRoleCanManageAdvancedProjectSettings',
      'Pricing.UpgradePlan',
      'OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan',
      'SorryFileTypeNotSupported',
    ]

    this.translate.get(keys).subscribe({
      next: (translation) => {
        Object.keys(translation).forEach(key => {
          this.translationMap.set(key, translation[key])
        })
      }
    })


    this.translate.get('AvailableWithThePlan', { plan_name: PLAN_NAME.F })
      .subscribe((translation: any) => {
        this.cPlanOnly = translation;
      });

    this.translate.get('AvailableWithThePlan', { plan_name: PLAN_NAME.F })
      .subscribe((translation: any) => {
        this.fPlanOnly = translation;
      });

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });


    this.translate.get('AvailableFromThePlans', { plan_name_1: PLAN_NAME.E, plan_name_2: PLAN_NAME.EE })
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
      });

  }


  openDropDown() {
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu');
    this.logger.log('openDropDown ', elemDropDown)
    elemDropDown.classList.add("dropdown__menu--active");
    this.contactNewFirstName = undefined;
    this.contactNewLastName = undefined;
  }

  openDropDownEditEmail() {
    const elemDropDownEditEmail = <HTMLElement>document.querySelector('.dropdown__menu_edit_email');
    this.logger.log('elemDropDownEditEmail ', elemDropDownEditEmail)
    elemDropDownEditEmail.classList.add("dropdown__menu_edit_email--active");

  }

  closeDropdown() {
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu');
    elemDropDown.classList.remove("dropdown__menu--active");
  }

  closeDropdownEditEmail() {
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu_edit_email');
    elemDropDown.classList.remove("dropdown__menu_edit_email--active");
  }

  // updateContactEmail() {
  //   const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu_edit_email');
  //   elemDropDown.classList.remove("dropdown__menu_edit_email--active");
  //   this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  contactNewEmail', this.contactNewEmail)
  //   this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  request', this.request)
  //   this.request.lead.email = this.contactNewEmail

  //   this.updateContactemail(this.request.lead._id, this.contactNewEmail);
  // }





  // formatBytesWithDecimal(bytes, decimals) {
  //   if (bytes == 0) return '0 Bytes';
  //   let k = 1000, //1024,          
  //     dm = decimals || 2,
  //     sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
  //     i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  // }

  formatBytes(bytes) {
    var marker = 1024; // Change to 1000 if required
    var decimal = 3; // Change as required
    var kiloBytes = marker; // One Kilobyte is 1024 bytes
    var megaBytes = marker * marker; // One MB is 1024 KB
    var gigaBytes = marker * marker * marker; // One GB is 1024 MB

    // return bytes if less than a KB
    if (bytes < kiloBytes) return bytes + " Bytes";
    // return KB if less than a MB
    else if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
    // return MB if less than a GB
    else if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
    // return GB if less than a TB
    else return (bytes / gigaBytes).toFixed(decimal) + " GB";
  }

  removeAttachment(downloadURL: string, filename: string) {
    this.logger.log(`[WS-REQUESTS-MSGS] - Remove Attachment filename`, filename);
    this.logger.log(`[WS-REQUESTS-MSGS] - Remove Attachment downloadURL`, downloadURL);
    const downloadURLSegment = downloadURL.split('/');
    this.logger.log(`[WS-REQUESTS-MSGS] - Remove Attachment downloadURLSegment`, downloadURLSegment);
    const pushUpload = downloadURLSegment[7]
    this.logger.log(`[WS-REQUESTS-MSGS] - Remove Attachment pushUpload`, pushUpload);
    const pushUploadSegment = pushUpload.split('%2F');
    this.logger.log(`[WS-REQUESTS-MSGS] - Remove Attachment pushUploadSegment`, pushUploadSegment);
    const fileUID = pushUploadSegment[3];
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.removeUploadedAttachment(this.currentUserID, fileUID, filename)
    }

  }


  removeNativeAttachment(downloadURL: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - delete Attachment downloadURL', downloadURL)
    this.uploadImageNativeService.deleteImageUploadAttachment_Native(downloadURL)
      .then(res => {
        this.logger.log(`[WS-REQUESTS-MSGS] - delete native Attachment res `, res);
        if (res === true) {

          this.logger.log('[WS-REQUESTS-MSGS] - delete Attachment downloadURL', downloadURL)
          this.uploadedFiles = undefined;
          this.metadata = undefined
          this.type = undefined
          this.existAnAttacment = false

        }
      })
  }

  removeNativeDocumentAttachment(downloadURL: string) {
    this.logger.log('[WS-REQUESTS-MSGS] - delete doc Attachment downloadURL', downloadURL)
    this.uploadedFiles = undefined;
    this.metadata = undefined
    this.type = undefined
    this.existAnAttacment = false
    // this.uploadImageNativeService.deleteDocumentUploadAttachment_Native(downloadURL)
    //   .then(res => {
    //     this.logger.log(`[WS-REQUESTS-MSGS] - delete doc native Attachment res `, res);
    //     if (res === true) {

    //       this.logger.log('[WS-REQUESTS-MSGS] - delete Attachment downloadURL', downloadURL)
    //       this.uploadedFiles = undefined;
    //       this.metadata = undefined
    //       this.type = undefined
    //       this.existAnAttacment = false

    //     }
    //   })
  }



  listenToUpladAttachmentRemoved() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.attachmentDeleted$.subscribe((attachementDeleted) => {
        this.logger.log(`[WS-REQUESTS-MSGS] - Remove Attachment attachementDeleted`, attachementDeleted);
        if (attachementDeleted === true) {
          this.uploadedFiles = undefined;
          this.metadata = undefined
          this.type = undefined
          this.existAnAttacment = false
        }
      });
    }
  }


  listenToUpladAttachmentProgress() {
    this.logger.log('listenToUpladAttachmentProgress ...')
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadAttachment$.subscribe((progress) => {
        this.logger.log('[WS-REQUESTS-MSGS UPLOADING ATTACMENT %  ', progress, '(usecase Firebase)');
        if (progress !== null && progress !== 100) {
          this.showSpinnerAttachmentUplolad = true
        }
        if (progress === 100) {
          this.showSpinnerAttachmentUplolad = false
        }
      });
    } else {
      this.uploadImageNativeService.uploadAttachment$.subscribe((progress) => {
        this.logger.log('[WS-REQUESTS-MSGS UPLOADING ATTACMENT %  ', progress, '(usecase native)');
        if (progress !== null && progress !== 100) {
          this.showSpinnerAttachmentUplolad = true
        }
        if (progress === 100) {
          this.showSpinnerAttachmentUplolad = false
        }
      });
    }
  }

  // removeEmojis(text: string): string {
  //   // Remove all emoji characters including ZWJ sequences and modifiers
  //   return text.replace(
  //     /([\u231A-\u231B]|\u23E9|\u23EA|\u23EB|\u23EC|\u23F0|\u23F3|\u25FD|\u25FE|\u2614|\u2615|\u2648-\u2653|\u267F|\u2693|\u26A1|\u26AA|\u26AB|\u26BD|\u26BE|\u26C4|\u26C5|\u26CE|\u26D4|\u26EA|\u26F2|\u26F3|\u26F5|\u26FA|\u26FD|\u2705|\u270A|\u270B|\u2728|\u274C|\u274E|\u2753|\u2754|\u2755|\u2757|\u2795|\u2796|\u2797|\u27B0|\u27BF|\u2B1B|\u2B1C|\u2B50|\u2B55|\u3030|\u303D|\u3297|\u3299|\uD83C[\uDC04-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF]|\uFE0F|\u200D)+/gu,
  //     ''
  //   );
  // }

  // not used - used the check availble in utils-message
  removeEmojis(text: string): string {
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\p{Emoji}\u200d]+/gu;
    return text.replace(emojiRegex, '');
  }

  onMessageChange(msg: string) {
    // console.log('[WS-REQUESTS-MSGS] onMessageChange msg', msg)
    // if (!this.ALLOW_TO_SEND_EMOJI) {
    //   this.chat_message = removeEmojis(msg);
    // }
    this.checkEmojiContent(msg)
  }

  checkEmojiContent(message: string): void {
    if (!this.ALLOW_TO_SEND_EMOJI && message.trim()) {
      const messageWithoutEmojis = removeEmojis(message).trim();
      this.showEmojiWarning = messageWithoutEmojis.length !== message.trim().length;
      if (this.showEmojiWarning === true) {
        this.triggerEmojiWarning();
      }
    } else {
      this.showEmojiWarning = false;
    }
  }



extractUrls(text: string): string[] {
  // Rileva URL con o senza protocollo (http/https)
  const urlRegex = /\b((https?:\/\/)?(www\.)?[a-z0-9.-]+\.[a-z]{2,})(\/[^\s]*)?/gi;
  const matches = text.match(urlRegex) || [];
  // Normalizza: aggiunge https:// se manca, così il parsing con new URL() funziona
  return matches.map((url) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'https://' + url;
    }
    return url;
  });
}



  triggerWarning(message: string) {
    this.warningMessage = message;

    setTimeout(() => {
      this.warningMessage = null;
    }, 3000);
  }

  triggerEmojiWarning() {
    this.showEmojiWarning = true;
    setTimeout(() => {
      this.showEmojiWarning = false;
    }, 3000); // 3000 =3 seconds
  }

  sendChatMessage() {
    if (this.PERMISSION_TO_SEND_REQUEST) {
      // this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - IS_CURRENT_USER_JOINED ', this.IS_CURRENT_USER_JOINED)
      console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - request ', this.request)
      console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE -  chat_message', this.chat_message)
      this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE -  ID REQUEST ', this.id_request)
      this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE -  ID PROJECT ', this.id_project)
      this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE -  selectedResponseTypeID ', this.selectedResponseTypeID)

      const requestclosedAt = moment(this.request?.closed_at);
      this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - requestclosedAt ', requestclosedAt)
      const currentTime = moment();
      this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - currentTime ', currentTime);

      const daysDiff = currentTime.diff(requestclosedAt, 'd');
      this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - daysDiff ', daysDiff)

       console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - HAS_SELECTED_SEND_AS_SOLVED?', this.HAS_SELECTED_SEND_AS_SOLVED)

      if (this.request?.status === 1000 && daysDiff > 10) {
        this.presenModalMessageCouldNotBeSent();
      } else {

        if (this.selectedResponseTypeID && this.IS_CURRENT_USER_JOINED === false) {
          this.reopenConversation(this.id_request)
        }
        console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - type', this.type)
       


        // if (this.HAS_SELECTED_SEND_AS_SOLVED) {
        //   if (this.CHAT_PANEL_MODE) {
        //     this.archiveRequestWithConfimationDialog(this.id_request)
        //   } else {
        //     this.archiveRequest(this.id_request)
        //   }

        // } 

        let _chat_message = ''
        if (this.type !== 'file') {
          _chat_message = this.chat_message
        } else if (this.type === 'file') {
          if (this.chat_message) {
            _chat_message = `[${this.metadata.name}](${this.metadata.src})` + '\n' + this.chat_message
          } else {
            _chat_message = `[${this.metadata.name}](${this.metadata.src})`
          }
        }

        console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - _chat_message', _chat_message)
        console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - uploadedFiles ', this.uploadedFiles)

        if ((_chat_message === '' || !_chat_message?.trim()) && !this.uploadedFiles) {
          console.log('[WS-REQUESTS-MSGS] - Messaggio vuoto senza file');
          this.chat_message = '';
          return;
        }

        if (!this.ALLOW_TO_SEND_EMOJI) {
          if (_chat_message && _chat_message.trim().length > 0) {
            const messageWithoutEmojis = removeEmojis(_chat_message).trim();
            console.log('[WS-REQUESTS-MSGS] messageWithoutEmojis - SEND CHAT MESSAGE ', messageWithoutEmojis)
            // 🚫 Block if only emojis OR if original message is different from cleaned one (i.e., it had emojis)
            if (messageWithoutEmojis === '' || messageWithoutEmojis.length !== _chat_message?.trim()?.length) {
              this.triggerEmojiWarning();
              return;
            }
            _chat_message = messageWithoutEmojis;
          }
        }


        // if (_chat_message === '' && !this.uploadedFiles) {
        //    console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - _chat_message 2', _chat_message)
        //    console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - _chat_message 2 uploadedFiles', this.uploadedFiles)

        //   //  this.chat_message = _chat_message
        //   this.chat_message = ''
        //   return;
        // }


        // const normalizedMessage = _chat_message?.trim() || '';

        // if (normalizedMessage === '' && (!this.uploadedFiles)) {
        //   console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - messaggio vuoto', _chat_message);
        //   console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - uploadedFiles', this.uploadedFiles);

        //   // reset textarea
        //   this.chat_message = '';
        //   return;
        // }

        // // Se arrivi qui, il messaggio o i file sono validi
        // _chat_message = normalizedMessage;

        // if (this.IS_ENABLED_URLS_WHITELIST) {
        //   if (_chat_message && _chat_message?.length > 0) { 
        //     const urlsInMessage = this.extractUrls(_chat_message);
        //     console.log('[WS-REQUESTS-MSGS] urlsInMessage ++++ :', urlsInMessage);
        //     console.log('[WS-REQUESTS-MSGS] URLS_WITHELIST ++++ :', this.URLS_WITHELIST);


        //     const nonWhitelistedDomains = urlsInMessage.filter((url) => {
        //       try {
        //         const domain = new URL(url).hostname.toLowerCase();

        //         // Check if domain matches any whitelist rule
        //         const isWhitelisted = this.URLS_WITHELIST.some(whitelisted => {
        //           whitelisted = whitelisted.toLowerCase().trim();

        //           // Match exact domain
        //           if (whitelisted === domain) return true;

        //           // Match wildcard domain (*.example.com)
        //           if (whitelisted.startsWith('*.')) {
        //             const baseDomain = whitelisted.substring(2); // remove '*.'
        //             return domain === baseDomain || domain.endsWith(`.${baseDomain}`);
        //           }

        //           return false;
        //         });

        //         return !isWhitelisted;
        //       } catch (e) {
        //         // Invalid URL - consider it not allowed
        //         return true;
        //       }
        //     });

        //     if (nonWhitelistedDomains.length > 0) {
        //       console.warn('Message blocked: Non-whitelisted domain(s):', nonWhitelistedDomains);
        //       this.triggerWarning(this.translate.instant('ThisMessageContainsURLFromDomainNotAllowed'));
        //       return;
        //     }
        //   }
        // }

        if (this.IS_ENABLED_URLS_WHITELIST) {
          if (_chat_message && _chat_message.trim().length > 0) {
            const urlsInMessage = this.extractUrls(_chat_message);
            console.log('[WS-REQUESTS-MSGS] urlsInMessage ++++ :', urlsInMessage);
            console.log('[WS-REQUESTS-MSGS] URLS_WITHELIST ++++ :', this.URLS_WITHELIST);

            // INTERNAL WHITELIST dinamica basata sull'URL del file (se presente)
            let internalWhitelist: string[] = [];
            if (this.type === 'file' && this.metadata?.src) {
              try {
                const fileDomain = new URL(this.metadata.src).hostname.toLowerCase();
                internalWhitelist = [fileDomain];
                console.log('[WS-REQUESTS-MSGS] INTERNAL_WHITELIST ++++ :', internalWhitelist);
              } catch (e) {
                console.error('[WS-REQUESTS-MSGS] Errore parsing dominio da metadata.src', e);
              }
            }

            const nonWhitelistedDomains = urlsInMessage.filter((url) => {
              try {
                const domain = new URL(url).hostname.toLowerCase();

                // unisci whitelist configurata e interna
                const combinedWhitelist = [...this.URLS_WITHELIST, ...internalWhitelist];

                // Check if domain matches any whitelist rule
                const isWhitelisted = combinedWhitelist.some(whitelisted => {
                  whitelisted = whitelisted.toLowerCase().trim();

                  // Match exact domain
                  if (whitelisted === domain) return true;

                  // Match wildcard domain (*.example.com)
                  if (whitelisted.startsWith('*.')) {
                    const baseDomain = whitelisted.substring(2); // remove '*.'
                    return domain === baseDomain || domain.endsWith(`.${baseDomain}`);
                  }

                  return false;
                });

                return !isWhitelisted;
              } catch (e) {
                // Invalid URL - consider it not allowed
                return true;
              }
            });

            if (nonWhitelistedDomains.length > 0) {
              console.warn('Message blocked: Non-whitelisted domain(s):', nonWhitelistedDomains);
              this.triggerWarning(this.translate.instant('ThisMessageContainsURLFromDomainNotAllowed'));
              return;
            }
          }
        }


        this.wsMsgsService.sendChatMessage(this.id_project, this.id_request, _chat_message, this.selectedResponseTypeID, this.requester_id, this.IS_CURRENT_USER_JOINED, this.metadata, this.type)
          .subscribe((msg) => {

            console.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE RESP ', msg);
          }, (error) => {
            this.logger.error('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE - ERROR ', error);

          }, () => {
            this.logger.log('[WS-REQUESTS-MSGS] - SEND CHAT MESSAGE * COMPLETE *');
            this.chat_message = undefined;
            this.uploadedFiles = undefined;
            this.metadata = undefined;
            this.type = undefined;
            this.existAnAttacment = false;
            this.sendMessageTexarea.nativeElement.style.height = null;
            let convWokingStatus = ""
            if (this.HAS_SELECTED_SEND_AS_OPENED === true && this.HAS_SELECTED_SEND_AS_PENDING === false && this.HAS_SELECTED_SEND_AS_SOLVED === false) {
              convWokingStatus = 'open'
              
              this.updateRequestWorkingStatusAndReopen(convWokingStatus)
              
            } else if (this.HAS_SELECTED_SEND_AS_OPENED === false && this.HAS_SELECTED_SEND_AS_PENDING === true && this.HAS_SELECTED_SEND_AS_SOLVED === false) {
              convWokingStatus = 'pending'
             
              this.updateRequestWorkingStatusAndReopen(convWokingStatus)
             
            } else if (this.HAS_SELECTED_SEND_AS_OPENED === false && this.HAS_SELECTED_SEND_AS_PENDING === false && this.HAS_SELECTED_SEND_AS_SOLVED === true) {
              convWokingStatus = ''
              if (this.CHAT_PANEL_MODE) {
                this.archiveRequestWithConfimationDialog(this.id_request)
              } else {
                this.archiveRequest(this.id_request)
              }

            }

            

          });
      }
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction()

      this.chat_message = undefined;
      this.uploadedFiles = undefined;
      this.metadata = undefined;
      this.type = undefined;
      this.existAnAttacment = false;
      this.sendMessageTexarea.nativeElement.style.height = null
    }
  }

   updateRequestWorkingStatusAndReopen(convWokingStatus) {
    console.log('-----> updateRequestWorkingStatusAndReopen ', convWokingStatus)
    this.wsRequestsService.updateRequestWorkingStatus(this.id_request, convWokingStatus)
      .subscribe((request) => {

        console.log('[WS-REQUESTS-MSGS] - UPDATE REQUEST WORKING STATUS ', request);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] -  UPDATE REQUEST WORKING STATUS - ERROR ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] -  UPDATE REQUEST WORKING STATUS  * COMPLETE');
        this.reopenConversation(this.id_request)
      })
  }
  

  updateRequestWorkingStatus(convWokingStatus) {
    console.log('-----> convWokingStatus ', convWokingStatus)
    this.wsRequestsService.updateRequestWorkingStatus(this.id_request, convWokingStatus)
      .subscribe((request) => {

        console.log('[WS-REQUESTS-MSGS] - UPDATE REQUEST WORKING STATUS ', request);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] -  UPDATE REQUEST WORKING STATUS - ERROR ', error);

      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] -  UPDATE REQUEST WORKING STATUS  * COMPLETE');
        // if (this.HAS_SELECTED_SEND_AS_OPENED === false && this.HAS_SELECTED_SEND_AS_PENDING === false && this.HAS_SELECTED_SEND_AS_SOLVED === true) {

        // }
      })
  }

  hasSelectedOpen(calledby, request) {
    this.logger.log('[WS-REQUESTS-MSGS] HAS SELECTED OPEN calledby', calledby)
    this.logger.log('[WS-REQUESTS-MSGS] HAS SELECTED OPEN request', request)
    this.HAS_SELECTED_SEND_AS_OPENED = true;
    this.HAS_SELECTED_SEND_AS_PENDING = false;
    this.HAS_SELECTED_SEND_AS_SOLVED = false;
    if (calledby === 'updatedWorkingStatus') {

      if (request.status === 1000) {
        this.reopenConversation(request.request_id)
      }
      let convWokingStatus = 'open'
      this.updateRequestWorkingStatus(convWokingStatus)
    }
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_OPENED ', this.HAS_SELECTED_SEND_AS_OPENED)
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_PENDING ', this.HAS_SELECTED_SEND_AS_PENDING)
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_SOLVED ', this.HAS_SELECTED_SEND_AS_SOLVED)
  }

  hasSelectedPending(calledby, request) {
    this.logger.log('[WS-REQUESTS-MSGS] HAS SELECTED PENDING calledby', calledby)
    this.logger.log('[WS-REQUESTS-MSGS] HAS SELECTED PENDING request', request)
    this.HAS_SELECTED_SEND_AS_OPENED = false;
    this.HAS_SELECTED_SEND_AS_PENDING = true;
    this.HAS_SELECTED_SEND_AS_SOLVED = false;
    if (calledby === 'updatedWorkingStatus') {

      if (request.status === 1000) {
        this.reopenConversation(request.request_id)
      }
      let convWokingStatus = 'pending'
      this.updateRequestWorkingStatus(convWokingStatus)
    }
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_OPENED ', this.HAS_SELECTED_SEND_AS_OPENED)
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_PENDING ', this.HAS_SELECTED_SEND_AS_PENDING)
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_SOLVED ', this.HAS_SELECTED_SEND_AS_SOLVED)
  }

  hasSelectedSolved(calledby) {
    console.log('[WS-REQUESTS-MSGS] HAS SELECTED SOLVED ', calledby)
    this.HAS_SELECTED_SEND_AS_OPENED = false;
    this.HAS_SELECTED_SEND_AS_PENDING = false;
    this.HAS_SELECTED_SEND_AS_SOLVED = true;
    if (calledby === 'updatedWorkingStatus') {
      let convWokingStatus = ''
      this.updateRequestWorkingStatus(convWokingStatus)
    

      if (this.CHAT_PANEL_MODE) {
        this.archiveRequestWithConfimationDialog(this.id_request)
      } else {
        this.archiveRequest(this.id_request)
      }

    }



    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_OPENED ', this.HAS_SELECTED_SEND_AS_OPENED)
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_PENDING ', this.HAS_SELECTED_SEND_AS_PENDING)
    // this.logger.log('[WS-REQUESTS-MSGS] HAS_SELECTED_SEND_AS_SOLVED ', this.HAS_SELECTED_SEND_AS_SOLVED)
  }

  isOpenDropdown(_is0penDropDown) {
    if (this.PERMISSION_TO_UPDATE_REQUEST_STATUS) {
      this.is0penDropDown = _is0penDropDown
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction()
    }

    // this.logger.log('[WS-REQUESTS-MSGS] this.is0penDropDown ',this.is0penDropDown)  
  }

  presenModalMessageCouldNotBeSent() {
    Swal.fire({
      title: this.translationMap.get('Warning'),
      text: this.translationMap.get('TheMessageCouldNotBeSent'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--primary-btn-background)",
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      // button: "OK",
      // dangerMode: false,
    })
  }

  presenModalAttachmentFileTypeNotSupported() {
    Swal.fire({
      title: this.translationMap.get('Warning'),
      text: this.translationMap.get('SorryFileTypeNotSupported'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--primary-btn-background)",
      customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      // button: "OK",
      // dangerMode: false,
    })
  }

  // onKeydownEnter(e: any) {
  //   this.logger.log("[WS-REQUESTS-MSGS] - returnChangeTextArea - onKeydown in MSG-TEXT-AREA event", e)

  //   // e.preventDefault(); // Prevent press enter from creating new line 
  //   if (this.chat_message && this.chat_message.length > 0) {
  //     // this.sendChatMessage()
  //   }
  // }


  // onPasteInSendMsg($event) {
  //  this.logger.log('[WS-REQUESTS-MSGS] ON PASTE IN SEND MSG sendMessageTexarea scrollHeight', this.sendMessageTexarea.nativeElement.scrollHeight);
  //   setTimeout(() => {
  //     this.sendMessageTexarea.nativeElement.style.height = `${this.sendMessageTexarea.nativeElement.scrollHeight + 3}px`;
  //   }, 250);
  // }

  // onChangeTextInSendMsg($event) {
  //   let newHeight = this.sendMessageTexarea.nativeElement.scrollHeight;
  //   this.logger.log('[WS-REQUESTS-MSGS] ON Change IN SEND MSG sendMessageTexarea scrollHeight (newHeight)', newHeight);
  //   this.sendMessageTexarea.nativeElement.style.height = `${newHeight}px`;
  //   // setTimeout(() => {
  //   //  this.logger.log('[WS-REQUESTS-MSGS] ON Change IN SEND MSG sendMessageTexarea scrollHeight', this.sendMessageTexarea.nativeElement.scrollHeight);
  //   // // this.logger.log('[WS-REQUESTS-MSGS] ON Change IN SEND MSG sendMessageTexarea offsetHeight', this.sendMessageTexarea.nativeElement.offsetHeight);
  //   //   this.sendMessageTexarea.nativeElement.style.height = `${47}px`;
  //   //   this.sendMessageTexarea.nativeElement.style.height = `${this.sendMessageTexarea.nativeElement.scrollHeight + 3}px`;
  //   // }, 250);
  // }

  resizeTextArea() {
    this.logger.log('resizeTextArea sendMessageTexarea', this.sendMessageTexarea)
    this.sendMessageTexarea.nativeElement.style.height = 'auto'; // Reset height to recalculate
    const maxHeight = 196; // Maximum height limit
    this.sendMessageTexarea.nativeElement.style.height = Math.min(this.sendMessageTexarea.nativeElement.scrollHeight, maxHeight) + 'px';
  }



  onChangeReplyType(selectedResponseTypeID) {
    // this.logger.log('[WS-REQUESTS-MSGS] ON CHANGE REPLY TYPE selectedResponseTypeID', selectedResponseTypeID)
    this.selectedResponseTypeID = selectedResponseTypeID;
    if (this.selectedResponseTypeID === 2) { // Private note
      this.getProjectPlan();
    }
    if (this.selectedResponseTypeID === 1) {
      const elemTexareaSendMsg = <HTMLInputElement>document.querySelector('.send-message-texarea')
      // this.logger.log('[WS-REQUESTS-MSGS] GET PROJECT PLAN elemTexareaSendMsg PUBLIC ANSWER (ID 1)', elemTexareaSendMsg);

      if (elemTexareaSendMsg && elemTexareaSendMsg.disabled) {
        elemTexareaSendMsg.disabled = false;
        // this.logger.log('✅ element is disabled');
      } else {
        // this.logger.log('⛔️ element is not disabled');
      }


    }
    const selectResponseTypeElem = <HTMLElement>document.querySelector('.select-response-type');
    selectResponseTypeElem.blur();
  }

  // -------------------------------------------
  // Attachments
  // -------------------------------------------
  onPasteInSendMsg(event: ClipboardEvent) {

    //  if (!this.ALLOW_TO_SEND_EMOJI) {
    //   this.chat_message = removeEmojis(this.chat_message);
    // }

    const items = event.clipboardData?.items;
    // const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    Array.from(items).forEach((item) => {
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item ", item);
      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste item.type ", item.type);
      // if (!item.type.startsWith("text/")) {


      if (item.type.startsWith("image/")) {
        event.preventDefault();  // Prevent the default paste behavior
        const file = item.getAsFile();
        this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste file ", file);


        if (file) {
          const canUploadFile = checkAcceptedFile(file.type, this.fileUploadAccept)

          if (!canUploadFile || file.type.includes('svg')) {
            this.uploadedFiles = null;
            this.presenModalAttachmentFileTypeNotSupported();
            return;
          }
          this.manageImageUploadOnPaste(file)


        }
      }
      else if (item.type.startsWith("application/")) {
        event.preventDefault();  // Prevent the default paste behavior
        this.logger.log('cannnnnnnn is fileeee')
        const file = item.getAsFile();
        this.uploadedFiles = file
        if (this.uploadedFiles) {
          const canUploadFile = checkAcceptedFile(this.uploadedFiles.type, this.fileUploadAccept)

          if (!canUploadFile) {
            this.uploadedFiles = null;
            this.presenModalAttachmentFileTypeNotSupported();
            return;
          }

          const uploadedFilesSize = this.uploadedFiles.size

          const formattedBytes = this.formatBytes(uploadedFilesSize)
          this.uploadedFiles['formattedBytes'] = formattedBytes
          this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED formattedBytes', formattedBytes);
          this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED uploadedFilesSize', uploadedFilesSize);
          this.type = 'file'
          const reader = new FileReader()
          reader.onloadend = () => {
            const file = reader.result.toString()
            this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success file', file)
            const uid = file.substring(file.length - 16)
            this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success uid', uid)
            this.imgWidth = 110;
            this.imgHeight = 110;
            this.metadata = {
              name: this.uploadedFiles.name,
              type: this.uploadedFiles.type,
              uid: uid,
            }
          }
          reader.readAsDataURL(this.uploadedFiles)
        }
      }

      this.logger.log(`[WS-REQUESTS-MSGS] - ++ before to call service uploadedFiles `, this.uploadedFiles);
      if (this.uploadedFiles) {
        this.logger.log(`[WS-REQUESTS-MSGS] - ++ before to call service uploadedFiles TYPE`, this.uploadedFiles.type);
      }
      if (this.uploadedFiles) {
        this.uploadAttachmentRestRequest(this.uploadedFiles, 'on-paste')

      }
    })
  }

  manageImageUploadOnPaste(file) {
    // this.uploadedFiles = file

    // const uploadedFilesSize = this.uploadedFiles.size

    // const formattedBytes = this.formatBytes(uploadedFilesSize)
    // this.uploadedFiles['formattedBytes'] = formattedBytes
    // this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED formattedBytes', formattedBytes);
    // this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED uploadedFilesSize', uploadedFilesSize);
    this.type = 'image'
    const reader = new FileReader()

    reader.onload = () => { // file is loaded
      var img = new Image;
      img.onload = () => { // image is loaded; sizes are available
        this.logger.log('img.width ', img.width, 'img.height ', img.height)
        this.imgWidth = img.width;
        this.imgHeight = img.height;
      };
      img.src = reader.result.toString(); // is the data URL because called with readAsDataURL
      this.imagePreview = reader.result.toString();

      this.openImagePreviewModal(this.imagePreview, file);

      // const uid = img.src.substring(img.src.length - 16)
      // this.logger.log(`[WS-REQUESTS-MSGS] - upload uid `, uid);

      // this.metadata = {
      //   name: this.uploadedFiles.name,
      //   type: this.uploadedFiles.type,
      //   uid: uid,
      // }
    };

    reader.readAsDataURL(file)
  }



  openImagePreviewModal(imagePreview, file) {
    const dialogRef = this.dialog.open(ImagePreviewModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '400px',
      data: {
        imagePreview: imagePreview,
        file: file
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logger.log(`[WS-REQUESTS-MSGS] AFTER CLOSED MODAL PREVIEW IMAGE result: `, result);
        const file = result.file
        const image = result.imagePreview

        this.uploadedFiles = file

        const uploadedFilesSize = this.uploadedFiles.size

        const formattedBytes = this.formatBytes(uploadedFilesSize)
        this.uploadedFiles['formattedBytes'] = formattedBytes
        this.logger.log('[WS-REQUESTS-MSGS] AFTER CLOSED MODAL PREVIEW IMAGE formattedBytes', formattedBytes);
        this.logger.log('[WS-REQUESTS-MSGS] AFTER CLOSED MODAL PREVIEW IMAGE  uploadedFilesSize', uploadedFilesSize);
        this.type = 'image'

        const uid = image.substring(image.length - 16)
        this.logger.log(`[WS-REQUESTS-MSGS] - AFTER CLOSED MODAL PREVIEW IMAGE  uid `, uid);

        this.metadata = {
          name: this.uploadedFiles.name,
          type: this.uploadedFiles.type,
          uid: uid
        }

        if (this.uploadedFiles) {
          this.uploadAttachmentRestRequest(this.uploadedFiles, 'after-closed-modal')
        }
      }
    });
  }

  _onFileSelected($event) {
    this.uploadNativeAttachmentError = false;
    this.existAnAttacment = false
    const upload_btn = <HTMLElement>document.querySelector('.upload-btn');
    upload_btn.blur();

    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED - event ', $event);
    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTEDl change e.target ', $event.target);
    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED e.target.files', $event.target.files);
    this.uploadedFiles = $event.target.files[0];
    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED uploadedFiles', this.uploadedFiles);
    if (this.uploadedFiles) {

      // const isAccepted = this.checkAcceptedFile(mimeType)
      const canUploadFile = checkAcceptedFile(this.uploadedFiles.type, this.fileUploadAccept)
      if (!canUploadFile || this.uploadedFiles.type.includes('svg')) {
        this.uploadedFiles = null;
        this.presenModalAttachmentFileTypeNotSupported();
        return;
      }

      const uploadedFilesSize = this.uploadedFiles.size

      const formattedBytes = this.formatBytes(uploadedFilesSize)
      this.uploadedFiles['formattedBytes'] = formattedBytes
      this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED formattedBytes', formattedBytes);

      this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED uploadedFilesSize', uploadedFilesSize);

      if (this.uploadedFiles.type.startsWith('image') && !this.uploadedFiles.type.includes('svg')) {
        this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED uploadedFiles', this.uploadedFiles);
        this.type = 'image'
        const reader = new FileReader()

        reader.onload = () => { // file is loaded
          var img = new Image;
          img.onload = () => { // image is loaded; sizes are available
            this.logger.log('img.width ', img.width, 'img.height ', img.height)
            this.imgWidth = img.width;
            this.imgHeight = img.height;
          };
          img.src = reader.result.toString(); // is the data URL because called with readAsDataURL
          const uid = img.src.substring(img.src.length - 16)
          this.logger.log(`[WS-REQUESTS-MSGS] - upload img.src `, img.src);
          this.logger.log(`[WS-REQUESTS-MSGS] - upload uid `, uid);

          this.metadata = {
            name: this.uploadedFiles.name,
            type: this.uploadedFiles.type,
            uid: uid,
          }
        };

        reader.readAsDataURL($event.target.files[0])
      } else if (this.uploadedFiles.type.startsWith('image') && this.uploadedFiles.type.includes('svg')) {
        this.type = 'image'

        this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file TYPE', this.uploadedFiles.type)
        this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file ', this.uploadedFiles)


        const reader = new FileReader()
        const that = this
        reader.addEventListener('load', () => {
          var img = new Image;
          img.onload = () => { // image is loaded; sizes are available
            this.logger.log('img.width ', img.width, 'img.height ', img.height)
            this.imgWidth = img.width;
            this.imgHeight = img.height;
          };

          img.src = reader.result.toString();
          const uid = img.src.substring(img.src.length - 16)
          this.logger.log(`[WS-REQUESTS-MSGS] - upload uid `, uid);
          this.metadata = {
            name: this.uploadedFiles.name,
            type: this.uploadedFiles.type,
            uid: uid,
          }

        }, false)


        reader.readAsDataURL($event.target.files[0])

      } else {
        this.logger.log('cannnnnnnn is fileeee')
        this.type = 'file'
        const reader = new FileReader()
        reader.onloadend = () => {
          const file = reader.result.toString()
          this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success file', file)
          const uid = file.substring(file.length - 16)
          this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success uid', uid)
          this.imgWidth = 110;
          this.imgHeight = 110;
          this.metadata = {
            name: this.uploadedFiles.name,
            type: this.uploadedFiles.type,
            uid: uid,
          }
        }
        reader.readAsDataURL($event.target.files[0])
      }

      if (this.uploadedFiles) {
        this.uploadAttachmentRestRequest(this.uploadedFiles, 'on-file-selected')

      }

    }
  }

  onFileSelected($event) {
    if (!this.PERMISSION_TO_SEND_REQUEST) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return
    }
    this.uploadNativeAttachmentError = false;
    this.existAnAttacment = false
    const upload_btn = <HTMLElement>document.querySelector('.upload-btn');
    upload_btn.blur();

    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED - event ', $event);
    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTEDl change e.target ', $event.target);
    console.log('[WS-REQUESTS-MSGS] ON FILE SELECTED e.target.files', $event.target.files);
    this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED e.target.files[0]', $event.target.files[0]);
    // this.uploadedFiles = $event.target.files[0];
    // this.logger.log('[WS-REQUESTS-MSGS] ON FILE SELECTED uploadedFiles', this.uploadedFiles);
    if ($event.target.files[0].type.startsWith("image/")) {

      this.logger.log("[CONVS-DETAIL][MSG-TEXT-AREA] onPaste file ", $event.target.files[0]);


      if ($event.target.files[0]) {
        const canUploadFile = checkAcceptedFile($event.target.files[0].type, this.fileUploadAccept)

        if (!canUploadFile || $event.target.files[0].type.includes('svg')) {
          // this.uploadedFiles = null;
          this.presenModalAttachmentFileTypeNotSupported();
          return;
        }
        this.manageImageUploadOnPaste($event.target.files[0])

      }
    } else if ($event.target.files[0].type.startsWith("application/") || ($event.target.files[0].type === 'text/plain')) {


      this.uploadedFiles = $event.target.files[0];

      if (this.uploadedFiles) {

        const canUploadFile = checkAcceptedFile(this.uploadedFiles.type, this.fileUploadAccept)

        if (!canUploadFile) {
          this.uploadedFiles = null;
          this.presenModalAttachmentFileTypeNotSupported();
          return;
        }

        const uploadedFilesSize = this.uploadedFiles.size

        const formattedBytes = this.formatBytes(uploadedFilesSize)
        this.uploadedFiles['formattedBytes'] = formattedBytes

        this.logger.log('cannnnnnnn is fileeee')
        this.type = 'file'
        const reader = new FileReader()
        reader.onloadend = () => {
          const file = reader.result.toString()
          this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success file', file)
          const uid = file.substring(file.length - 16)
          this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success uid', uid)
          this.imgWidth = 110;
          this.imgHeight = 110;
          this.metadata = {
            name: this.uploadedFiles.name,
            type: this.uploadedFiles.type,
            uid: uid,
          }
        }
        reader.readAsDataURL($event.target.files[0])
        this.uploadAttachmentRestRequest(this.uploadedFiles, 'on-file-selected')
      }
    }

  }

  uploadAttachmentRestRequest(uploadedFiles, calledBy) {
    this.logger.log('uploadAttachmentRestRequest -----> calledBy', calledBy)
    this.logger.log('uploadAttachmentRestRequest uploadedFiles', uploadedFiles)
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadAttachment(this.currentUserID, uploadedFiles).then(downloadURL => {
        this.logger.log(`[WS-REQUESTS-MSGS] - upload downloadURL `, downloadURL);

        if (downloadURL) {
          this.existAnAttacment = true

          this.uploadedFiles['downloadURL'] = downloadURL
        }
        this.metadata.src = downloadURL
        this.metadata.width = this.imgWidth;
        this.metadata.height = this.imgHeight;
        // this.logger.log(`[WS-REQUESTS-MSGS] - upload metadata `, this.metadata);

        this.fileUpload.nativeElement.value = '';

      }).catch(error => {

        this.logger.error(`[WS-REQUESTS-MSGS] - upload Failed to upload file and get link `, error);
      });
    }
    else {
      this.uploadImageNativeService.uploadAttachment_Native(uploadedFiles).then(downloadURL => {
        this.logger.log(`[WS-REQUESTS-MSGS] - upload native downloadURL `, downloadURL);

        if (downloadURL) {
          this.existAnAttacment = true

          this.uploadedFiles['downloadURL'] = downloadURL
        }
        this.metadata.src = downloadURL
        this.metadata.width = this.imgWidth;
        this.metadata.height = this.imgHeight;
        this.logger.log(`[WS-REQUESTS-MSGS] - upload native metadata `, this.metadata);

        this.fileUpload.nativeElement.value = '';

      }).catch(error => {
        this.uploadNativeAttachmentError = true;
        this.uploadedFiles = undefined;
        this.metadata = undefined
        this.type = undefined
        this.existAnAttacment = false
        this.logger.error(`[WS-REQUESTS-MSGS] - upload native Failed to upload file and get link `, error);
        this.logger.log(`[WS-REQUESTS-MSGS] - upload native error status `, error.status)

      });

    }
  }

  smartAssignmentOff() {
    if (this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT) {
      Swal.fire({
        title: this.translationMap.get('AreYouSure') + '?',
        text: this.translationMap.get('SmartReassignmentForThisConversationWillBeDisabled'),
        icon: "info",
        showCloseButton: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('ConvertToOffline'),
        cancelButtonText: this.translate.instant('Cancel'),
        confirmButtonColor: "var(--blue-light)",
        focusConfirm: true,
        reverseButtons: true,
        customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""


        // buttons: [this.translationMap.get('Cancel'), this.translationMap.get('ConvertToOffline')],
        // dangerMode: true,
        // className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      })
        .then((result) => {
          if (result.isConfirmed) {

            this.wsMsgsService.updateConversationSmartAssigment(this.request.request_id, false).subscribe((res) => {
              this.logger.log('[WS-REQUESTS-MSGS] ON SMART ASSIGNMENT OFF - RES ', res);

            }, (error) => {
              this.logger.error('[WS-REQUESTS-MSGS] ON SMART ASSIGNMENT OFF - ERROR ', error);

              Swal.fire({
                title: this.translate.instant('Oops') + '!',
                text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
                icon: "error",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonText: this.translate.instant('Ok'),
                confirmButtonColor: "var(--primary-btn-background)",
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              });

            }, () => {
              this.logger.log('[WS-REQUESTS-MSGS] ON SMART ASSIGNMENT OFF - COMPLETE ');

              Swal.fire({
                title: this.translationMap.get('Done') + "!",
                icon: "success",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonColor: "var(--primary-btn-background)",
                confirmButtonText: this.translate.instant('Ok'),
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              }).then((okpressed) => {

              });

            });
          } else {
            // this.logger.log('[WS-REQUESTS-MSGS] BAN VISITOR in swal  willBan', willBan)
            // swal("Your imaginary file is safe!");
          }
        });
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
    }
  }

  smartAssignmentOn() {
    if (this.PERMISSION_TO_UPDATE_SMART_ASSIGNMENT) {
      Swal.fire({
        title: this.translationMap.get('AreYouSure') + '?',
        text: this.translationMap.get('SmartReassignmentForThisConversationWillBeEnabled'),
        icon: "info",
        showCloseButton: false,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('ConvertToOnline'),
        cancelButtonText: this.translate.instant('Cancel'),
        confirmButtonColor: "var(--blue-light)",
        focusConfirm: true,
        reverseButtons: true,
        customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""

        // buttons: [this.translationMap.get('Cancel'), this.translationMap.get('ConvertToOnline')],
        // dangerMode: true,
        // className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
      })
        .then((result) => {
          if (result.isConfirmed) {

            this.wsMsgsService.updateConversationSmartAssigment(this.request.request_id, true).subscribe((res) => {
              this.logger.log('[WS-REQUESTS-MSGS] ON SMART ASSIGNMENT ON - RES ', res);

            }, (error) => {
              this.logger.error('[WS-REQUESTS-MSGS] ON SMART ASSIGNMENT ON - ERROR ', error);

              Swal.fire({
                title: this.translate.instant('Oops') + '!',
                text: this.translate.instant('UserEditAddPage.AnErrorHasOccurred'),
                icon: "error",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonText: this.translate.instant('Ok'),
                confirmButtonColor: "var(--primary-btn-background)",
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              });

            }, () => {
              this.logger.log('[WS-REQUESTS-MSGS] ON SMART ASSIGNMENT ON - COMPLETE ');

              Swal.fire({
                title: this.translationMap.get('Done') + "!",
                icon: "success",
                showCloseButton: false,
                showCancelButton: false,
                confirmButtonColor: "var(--primary-btn-background)",
                confirmButtonText: this.translate.instant('Ok'),
                customClass: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""

                // button: "OK",
                // className: this.CHAT_PANEL_MODE === true ? "swal-size-sm" : ""
              }).then((okpressed) => {

              });

            });
          } else {
            // this.logger.log('[WS-REQUESTS-MSGS] BAN VISITOR in swal  willBan', willBan)
            // swal("Your imaginary file is safe!");
          }
        });
    } else {
      this.notify.presentDialogNoPermissionToPermomfAction(this.CHAT_PANEL_MODE)
    }
  }

  // --------------------------------------------------
  // New sidebar method
  // --------------------------------------------------

  openAddContactNameForm($event) {
    console.log('[WS-REQUESTS-MSGS] - openAddContactNameForm PERMISSION_TO_UPDATE_LEAD', this.PERMISSION_TO_UPDATE_LEAD)
    if (this.PERMISSION_TO_UPDATE_LEAD === false) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }
    $event.stopPropagation();
    this.isOpenEditContactFullnameDropdown = !this.isOpenEditContactFullnameDropdown
    this.logger.log('[WS-REQUESTS-MSGS] - isOpenEditContactFullnameDropdown', this.isOpenEditContactFullnameDropdown)
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu-form');
    this.logger.log('[WS-REQUESTS-MSGS] elemDropDown EDIT CONTACT NAME ', elemDropDown)
    if (!elemDropDown.classList.contains("dropdown__menu-form--active")) {

      elemDropDown.classList.add("dropdown__menu-form--active");
      this.logger.log('here 1')
    } else if (elemDropDown.classList.contains("dropdown__menu-form--active")) {
      elemDropDown.classList.remove("dropdown__menu-form--active");
      this.logger.log('here 2')
    }

    this.contactNewFirstName = undefined;
    this.contactNewLastName = undefined;
  }


  @HostListener('document:click', ['$event'])
  clickout(event) {

    this.logger.log('[WS-REQUESTS-MSGS] clickout event.target.id)', event.target.id)

    const clicked_element_id = event.target.id


    if (clicked_element_id.startsWith("edit-fullname")) {
      this.logger.log('>>> click inside')
    } else {
      this.logger.log('[WS-REQUESTS-MSGS] >>> click outside')
      this.closeEditContactFullnameDropdown()
    }
  }

  closeEditContactFullnameDropdown() {
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu-form');
    if (elemDropDown && elemDropDown.classList.contains("dropdown__menu-form--active")) {
      elemDropDown.classList.remove("dropdown__menu-form--active");
    }
  }


  openTabMoreOption(isOpen) {
    this.logger.log('openTabMoreOption isOpen', isOpen)
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu-more-options');
    if (isOpen === true) {
      this.logger.log('elemDropDown tab more options ', elemDropDown)
      elemDropDown.classList.add("dropdown__menu-more-options--active");
    } else if (isOpen === false) {
      elemDropDown.classList.remove("dropdown__menu-more-options--active");
    }
  }

  openViewOtherServedByDropdown(isOpen) {
    this.logger.log('openViewOtherServedByDropdown isOpen', isOpen)
    const elemDropDown = <HTMLElement>document.querySelector('.dropdown--menu-others-agents-dropdow');
    if (isOpen === true) {
      this.logger.log('elemDropDown tab more options ', elemDropDown)
      elemDropDown.classList.add("dropdown--menu-others-agents-dropdow--active");
    } else if (isOpen === false) {
      elemDropDown.classList.remove("dropdown--menu-others-agents-dropdow--active");
    }

  }


  updateContactFullName() {
    // const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu');
    // elemDropDown.classList.remove("dropdown__menu--active");

    const elemDropDown = <HTMLElement>document.querySelector('.dropdown__menu-form');
    elemDropDown.classList.remove("dropdown__menu-form--active");
    this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  contactNewFirstName', this.contactNewFirstName)
    this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  contactNewLastName', this.contactNewLastName)
    this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName  request', this.request)
    // request?.lead?.fullname
    if (this.contactNewFirstName && !this.contactNewLastName) {

      const lead_fullname = this.contactNewFirstName
      // this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName usecase only contactNewFirstName - lead_fullname', lead_fullname)
      this._createRequesterAvatar(lead_fullname)

      this.request.lead.fullname = lead_fullname
      this.updateContactName(this.request.lead._id, lead_fullname);
    } else if (this.contactNewFirstName && this.contactNewLastName) {

      const lead_fullname = this.contactNewFirstName + ' ' + this.contactNewLastName
      // this.logger.log('[WS-REQUESTS-MSGS] saveContactFullName usecase  contactNewFirstName & contactNewLastName - lead_fullname', lead_fullname)
      this.request.lead.fullname = lead_fullname
      this._createRequesterAvatar(lead_fullname)
      this.updateContactName(this.request.lead._id, lead_fullname);
    }
  }
  _createRequesterAvatar(lead_fullname) {
    if (lead_fullname) {
      this.requester_fullname_initial = avatarPlaceholder(lead_fullname);
      this.fillColour = getColorBck(lead_fullname)
    } else {

      this.requester_fullname_initial = 'N/A';
      this.fillColour = 'rgb(98, 100, 167)';
    }

  }

  updateContactName(lead_id, lead_fullname) {
    this.contactsService.updateLeadFullname(lead_id, lead_fullname)
      .subscribe((contact) => {
        this.logger.log('[WS-REQUESTS-MSGS] - UPDATED CONTACT ', contact);
      }, (error) => {
        this.logger.error('[WS-REQUESTS-MSGS] - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      }, () => {
        this.logger.log('[WS-REQUESTS-MSGS] - UPDATE CONTACT * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully updated', 2, 'done')
      });
  }

  onClickTagConversation() {
    this.logger.log('[WS-REQUESTS-MSGS] - HAS CLICKED TAG CONVS');
    this.hasSelectedTab1()
  }



  hasSelectedTab0() {
    this.tab0 = true;
    this.tab1 = false
    this.tab2 = false
    this.tab3 = false;
    this.tab4 = false;
    this.logger.log('haSelectedTab0 ', this.tab0)
  }
  hasSelectedTab1() {
    this.tab0 = false;
    this.tab1 = true;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = false;
    this.logger.log('haSelectedTab1 ', this.tab1)
    // this.getTag();
    // setTimeout(() => {
    //   this.getTagContainerElementHeight()
    // }, 1000);
  }

  hasSelectedTab2() {
    this.tab0 = false;
    this.tab1 = false;
    this.tab2 = true;
    this.tab3 = false;
    this.tab4 = false;
    this.logger.log('haSelectedTab2 ', this.tab2)
  }

  hasSelectedTab3() {
    this.tab0 = false;
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = true;
    this.tab4 = false;
  }
  hasSelectedTab4() {
    this.tab0 = false;
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = true;
  }

  hasSelectMainTabs() {
    this.mainTabs = true;
    this.otherTabs = false;
    this.logger.log('hasSelectMainTabs otherTabs', this.otherTabs)
    this.logger.log('hasSelectMainTabs mainTabs', this.mainTabs)
    this.tab0 = true;
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = false;
  }

  hasSelectedMoreTabs() {
    this.otherTabs = true;
    this.mainTabs = false;
    this.logger.log('hasSelectedMoreTabs otherTabs', this.otherTabs)
    this.logger.log('hasSelectedMoreTabs mainTabs', this.mainTabs)
    this.tab0 = false;
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = true;
    this.tab4 = false;
  }

  goToRequestMsgs(request_recipient: string) {
    if (this.CHAT_PANEL_MODE === false) {
      this.router.navigate(['project/' + this.id_project + '/wsrequest/' + request_recipient + '/messages']);
    } else if (this.CHAT_PANEL_MODE === true) {
      const url = this.dshbrdBaseUrl + '/#/project/' + this.id_project + '/wsrequest/' + request_recipient + '/messages'
      window.open(url, '_blank');
    }
  }

  // emailChange(event) {
  //   this.EMAIL_IS_VALID = this.validateEmail(event)
  //   this.logger.log('ON EMAIL CHANGE EMAIL_IS_VALID ', this.EMAIL_IS_VALID)
  //   // this.getTagContainerElementHeight()
  // }
  // validateEmail(email) {
  //   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   return re.test(String(email).toLowerCase());
  // }

  // editContactEmail() {
  //   this.logger.log('editContactEmail contactNewEmail', this.contactNewEmail)
  //   if (this.EMAIL_IS_VALID && this.contactNewEmail !== undefined) {
  //     this.updateContactemail(this.request.lead._id, this.contactNewEmail);
  //   }
  // }

  // updateContactemail(lead_id, lead_email) {
  //   this.contactsService.updateLeadEmail(lead_id, lead_email)
  //     .subscribe((contact) => {
  //       this.logger.log('[WS-REQUESTS-MSGS] - UPDATED CONTACT ', contact);
  //     }, (error) => {
  //       this.logger.error('[WS-REQUESTS-MSGS] - UPDATE CONTACT - ERROR ', error);
  //       // =========== NOTIFY ERROR ===========
  //       // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
  //     }, () => {
  //       this.logger.log('[WS-REQUESTS-MSGS] - UPDATE CONTACT * COMPLETE *');
  //       // =========== NOTIFY SUCCESS===========
  //       this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
  //     });
  // }

  // removeEmailAnUpdateContact() {
  //   this.contactNewEmail = ''
  //   this.logger.log('removeEmailAnUpdateContact contactNewEmail', this.contactNewEmail)
  //   this.updateContactemail(this.request.lead._id, this.contactNewEmail);
  // }

  openSourcePage(sorurcePageURL) {
    this.logger.log('openSourcePage sorurcePageURL ', sorurcePageURL)
    window.open(sorurcePageURL, '_blank');
  }

  hasClikedImage() {
    this.logger.log('hasClikedImage ')
  }


  // NO MORE USED - REPLACED BY getProjectUsersAndBots
  // ------------------------------------------------------------------------------------------------------------------------
  // @ Get all project's Agents (i.e., project-users) - called when the user open the SelectUsersModal (openSelectUsersModal)
  // ------------------------------------------------------------------------------------------------------------------------
  // getAllUsersOfCurrentProject() {
  //   this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
  //     this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

  //     this.projectUsersList = projectUsers;

  //     this.projectUsersList.forEach(projectUser => {

  //       projectUser['is_joined_to_request'] = this.currentUserIdIsInParticipants(this.request.participants, projectUser.id_user._id, this.request.request_id);
  //       this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS ID', projectUser.id_user._id, ' is JOINED ', projectUser['is_joined_to_request']);
  //     });

  //   }, error => {
  //     this.showSpinner_inModalUserList = false;
  //     this.logger.error('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
  //   }, () => {
  //     this.showSpinner_inModalUserList = false;
  //     this.logger.log('%%% Ws-REQUESTS-Msgs - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
  //   });
  // }


  // assignRequest(userid_selected) {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST TO USER ID ', userid_selected);
  //   this.displayConfirmReassignmentModal = 'none';
  //   this.displayUsersListModal = 'none'
  //   this.joinAnotherAgent(userid_selected);
  // }


  /// new RIASSIGN REQUEST
  // joinAnotherAgentLeaveCurrentAgents(userid_selected) {
  //   // this.getFirebaseToken(() => {
  //   this.wsRequestsService.setParticipants(this.id_request, userid_selected)
  //     .subscribe((joinToGroupRes: any) => {

  //       this.logger.log('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

  //     }, (err) => {
  //       this.logger.error('%%% Ws-REQUESTS-Msgs - RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

  //       //  NOTIFY ERROR 
  //       this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
  //     }, () => {
  //       this.logger.log('%%% Ws-REQUESTS-Msgs- RIASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

  //       //  NOTIFY SUCCESS
  //       this.notify.showNotification(`request reassigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

  //     });
  // }

  // end new

  // -----------------------------------------------------------------------------------------
  // Add Agent
  // -----------------------------------------------------------------------------------------
  // joinAnotherAgent(userid_selected) {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - USER ID SELECTED ', userid_selected);
  //   // this.getFirebaseToken(() => {

  //   this.wsRequestsService.addParticipant(this.id_request, userid_selected)
  //     .subscribe((joinToGroupRes: any) => {

  //       this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP ', joinToGroupRes);

  //     }, (err) => {
  //       this.logger.error('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - ERROR ', err);

  //       //  NOTIFY ERROR 
  //       this.notify.showNotification('An error has occurred assigning the request', 4, 'report_problem')
  //     }, () => {
  //       this.logger.log('%%% Ws-REQUESTS-Msgs - ASSIGN REQUEST - JOIN ANOTHER USER TO CHAT GROUP - COMPLETE');

  //       //  NOTIFY SUCCESS
  //       this.notify.showNotification(`request assigned to ${this.userfirstname_selected}  ${this.userlastname_selected}`, 2, 'done');

  //     });
  //   // });
  // }

  // ARCHIVE REQUEST - OPEN THE POPUP !!! NO MORE USED
  // openArchiveRequestModal(request_recipient: string) {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - ID OF REQUEST TO ARCHIVE ', request_recipient)
  //   this.id_request_to_archive = request_recipient;
  //   this.displayArchiveRequestModal = 'block'
  // }

  // // MODAL ArchiveRequest !!! NO MORE USED
  // onCloseArchiveRequestModal() {
  //   this.displayArchiveRequestModal = 'none'
  // }

  // onCloseArchivingInfoModal() {
  //   this.displayArchivingInfoModal = 'none'
  // }



  // archiveTheRequestHandler() {
  //   this.logger.log('%%% Ws-REQUESTS-Msgs - HAS CLICKED ARCHIVE REQUEST archiveTheRequestHandler');

  //   this.displayArchiveRequestModal = 'none';

  //   this.SHOW_CIRCULAR_SPINNER = true;

  //   this.displayArchivingInfoModal = 'block'

  //   this.wsRequestsService.closeSupportGroup(this.id_request_to_archive)
  //     .subscribe((data: any) => {
  //       this.logger.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - DATA ', data);
  //     },
  //       (err) => {
  //         this.logger.error('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - ERROR ', err);
  //         this.SHOW_CIRCULAR_SPINNER = false;
  //         this.ARCHIVE_REQUEST_ERROR = true;
  //         //  NOTIFY ERROR 
  //         // tslint:disable-next-line:quotemark
  //         this.notify.showNotification(this.request_archived_err_msg, 4, 'report_problem')
  //       },
  //       () => {
  //         // this.ngOnInit();
  //         this.logger.log('%%% Ws-REQUESTS-Msgs - CLOSE SUPPORT GROUP - COMPLETE');
  //         this.SHOW_CIRCULAR_SPINNER = false;
  //         this.ARCHIVE_REQUEST_ERROR = false;

  //         //  NOTIFY SUCCESS
  //         // with id: ${this.id_request_to_archive}
  //         this.notify.showNotification(this.request_archived_msg, 2, 'done');
  //       });

  // }

  // closeConfirmReassignmentModal() {
  //   this.displayConfirmReassignmentModal = 'none'
  // }

  // closeDeptConfirmReassignmentModal() {
  //   this.displayDeptConfirmReassignmentModal = 'none'
  // }

  // verifyImageURL(image_url, callBack) {
  //   const img = new Image();
  //   img.src = image_url;
  //   img.onload = function () {
  //     callBack(true);
  //   };
  //   img.onerror = function () {
  //     callBack(false);
  //   };
  // }

  // NOT USED (was used for tag)
  //  stringToColour(tag: string) {
  //   // var hash = 0;
  //   // for (var i = 0; i < str.length; i++) {
  //   //   hash = str.charCodeAt(i) + ((hash << 5) - hash);
  //   // }
  //   // var colour = '#';
  //   // for (var i = 0; i < 3; i++) {
  //   //   var value = (hash >> (i * 8)) & 0xFF;
  //   //   colour += ('00' + value.toString(16)).substr(-2);
  //   // }
  //   // return colour;

  //   const tagColor = ['#FF5C55', '#F89D34', '#F3C835', '#66C549', '#43B1F2', '#CB80DD'];
  //   let num = 0;
  //   if (tag) {

  //     const code = tag.charCodeAt(0) + tag.charCodeAt(1);
  //     // this.logger.log('% Ws-REQUESTS-Msgs - tag-wf - stringToColour - code',code);
  //     num = Math.round(code % tagColor.length);

  //   }
  //   // this.logger.log('% Ws-REQUESTS-Msgs - tag-wf - stringToColour - tagColor[num]', arrayBckColor[num]);
  //   return tagColor[num];

  // }

  // !!!! No more used
  // presentModalDeleteNote(note_id) {
  //   this.id_note_to_delete = note_id
  //   this.displayModalDeleteNote = 'block'
  // }

  // !!!! No more used
  // closeModalDeleteNote() {
  //   this.displayModalDeleteNote = 'none'
  // }

}
