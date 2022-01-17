import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Request } from '../../models/request-model';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import { DepartmentService } from '../../services/department.service';
import { trigger, state, style, animate, transition, query, animateChild } from '@angular/animations';
import { LocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { avatarPlaceholder, getColorBck } from '../../utils/util';
import { Subscription } from 'rxjs';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';
import { AppConfigService } from '../../services/app-config.service';
import * as moment from 'moment';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { UAParser } from 'ua-parser-js';
import { WsSharedComponent } from '../../ws_requests/ws-shared/ws-shared.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { Location } from '@angular/common';
import { SelectOptionsTranslatePipe } from '../../selectOptionsTranslate.pipe';
import { TagsService } from '../../services/tags.service';
import { LoggerService } from '../../services/logger/logger.service';
// import swal from 'sweetalert';
// https://github.com/t4t5/sweetalert/issues/890 <- issue ERROR in node_modules/sweetalert/typings/sweetalert.d.ts(4,9): error TS2403

// https://www.npmjs.com/package/sweetalert
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-requests-list-history-new',
  templateUrl: './history-and-nort-convs.component.html',
  styleUrls: ['./history-and-nort-convs.component.scss'],
  animations: [
    trigger('ngIfAnimation', [
      transition(':enter, :leave', [
        query('@*', animateChild())
      ])
    ]),
    trigger('easeInOut', [
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate('1s ease-in-out', style({
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          opacity: 1
        }),
        animate('1s ease-in-out', style({
          opacity: 0
        }))
      ])
    ])
  ]
})


export class HistoryAndNortConvsComponent extends WsSharedComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<any> = new Subject<any>();

  // @ViewChild('advancedoptionbtn') private advancedoptionbtnRef: ElementRef;
  // @ViewChild('searchbtn') private searchbtnRef: ElementRef;
  @ViewChild('searchbtnbottom') private searchbtnbottomRef?: ElementRef;

  requestList: Request[];
  projectId: string;
  showSpinner: boolean;
  startDate: any;
  startDateFormatted: string;
  startDateFormatted_temp: string;

  endDate: any;
  endDateFormatted: string;
  endDateFormatted_temp: string;
  deptName: string;
  fullText: string;
  fullText_applied_filter: string
  fullText_temp: string;
  queryString: string;
  startDateValue: any;
  endDateValue: any;
  deptNameValue: string;
  deptIdValue: string;
  fullTextValue: string;
  selectedAgentValue: string;
  emailValue: string;

  showAdvancedSearchOption = false;
  hasFocused = false;
  departments: any;
  selectedDeptId: string;
  pageNo = 0
  totalPagesNo_roundToUp: number;
  displaysFooterPagination: boolean;
  currentUserID: string;
  requestsCount: number;

  user_and_bot_array = [];
  selectedAgentId: string;
  requester_email: string;
  REQUESTER_IS_VERIFIED = false;

  tags_array = [];
  selecteTagName: string;
  selecteTagNameValue: string;
  selecteTagColor: string; // used in applied filter
  selecteTagColor_temp: string; // used in applied filter
  selecteTagName_temp: string;  // used in applied filter

  subscription: Subscription;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  trial_expired: boolean;
  browserLang: string;

  date_picker_is_disabled: boolean;
  projectUsersArray: any;
  requestWillBePermanentlyDeleted: string;
  selectedRequestWillBePermanentDeleted: string;
  selectedRequestsWasSuccessfullyDeleted: string;
  deletingException: string;
  areYouSure: string;
  done_msg: string;
  error_msg: string;
  requestWasSuccessfullyDeleted: string;
  errorDeleting: string;
  pleaseTryAgain: string;
  CURRENT_USER_ROLE: string;
  IS_HERE_FOR_HISTORY: boolean;

  request_selected = [];
  allChecked = false;
  selectAllCheckbox = false;
  indeterminateStatus = true;
  showIndeterminate = false;
  has_searched = false;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;


  joinToChatMsg: string;
  youAreAboutToJoinMsg: string;
  cancelMsg: string;

  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    // dateFormat: 'yyyy, mm , dd',
  };


  public endDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    disableUntil: { year: 0, month: 0, day: 0 },
    // dateFormat: 'yyyy, mm , dd',
  };


  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  imageStorage: string;

  isMobile: boolean;

  operator: string;
  requests_status: any;
  selectedDeptName: string;
  selectedDeptName_temp: string;
  selectedAgentFirstname: string;
  selectedAgentLastname: string;
  selectedAgentFirstname_temp: string;
  selectedAgentLastname_temp: string;

  disableUntilDate: any;

  status = [
    { id: '100', name: 'Unserved' },
    { id: '200', name: 'Served' },
    { id: 'all', name: 'All' },
  ];
  start_date_is_null = true


  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;
  allConversationsaveBeenArchivedMsg: string;
  ROLE_IS_AGENT: boolean;
  CHAT_BASE_URL: string;
  FIREBASE_AUTH: boolean;
  profile_name: string;
  payIsVisible: boolean;
  public_Key: any;

  /**
   * 
   * @param router 
   * @param auth 
   * @param usersLocalDbService 
   * @param botLocalDbService 
   * @param departmentService 
   * @param usersService 
   * @param faqKbService 
   * @param prjctPlanService 
   * @param translate 
   * @param notify 
   * @param appConfigService 
   * @param wsRequestsService 
   * @param location 
   * @param selectOptionsTranslatePipe 
   * @param tagsService 
   * @param logger 
   */
  constructor(
    public router: Router,
    public auth: AuthService,
    public usersLocalDbService: LocalDbService,
    public botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    private prjctPlanService: ProjectPlanService,
    public translate: TranslateService,
    public notify: NotifyService,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService,
    public location: Location,
    public selectOptionsTranslatePipe: SelectOptionsTranslatePipe,
    private tagsService: TagsService,
    public logger: LoggerService
  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);
  }

  ngOnInit() {
    this.getOSCODE();
    this.getCurrentUrlLoadRequests();
    this.getImageStorageAndChatBaseUrl();
    // this.auth.checkRoleForCurrentProject();
    // selectedDeptId is assigned to empty so in the template will be selected the custom option ALL DEPARTMENTS
    this.selectedDeptId = '';
    // selectedAgentId is assigned to empty so in the template will be selected the custom option ALL AGENTS
    this.selectedAgentId = '';
    this.getCurrentUser();
    // this.getRequests();
    this.getCurrentProject();
    this.getDepartments();
    this.getAllProjectUsers();
    this.getProjectPlan();
    this.getBrowserLang();
    // this.createBotsAndUsersArray();

    this.getTranslations();
    this.getProjectUserRole();
    this.detectMobile();
    this.getTag();
    this.getFirebaseAuth();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");

    keys.forEach(key => {

      if (key.includes("PAY")) {
        this.logger.log('[CONTACTS-COMP] PUBLIC-KEY - key', key);
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[CONTACTS-COMP] - pay isVisible', this.payIsVisible);
    }
  }

  getFirebaseAuth() {
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.FIREBASE_AUTH = true;
      this.logger.log('[HISTORY & NORT-CONVS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    } else if (this.appConfigService.getConfig().firebaseAuth === false) {
      this.FIREBASE_AUTH = false;
      this.logger.log('[HISTORY & NORT-CONVS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    }
  }

  getTranslations() {
    this.translate.get('DeleteRequestForever')
      .subscribe((text: string) => {
        this.requestWillBePermanentlyDeleted = text["TheRequestWillBePermanentlyDeleted"];
        this.selectedRequestWillBePermanentDeleted = text["SelectedRequestsWillBePermanentlyDeleted"];
        this.requestWasSuccessfullyDeleted = text["TheRequestWasSuccessfullyDeleted"];
        //this.selectedRequestsWasSuccessfullyDeleted = text["SelectedRequestsWasSuccessfullyDeleted"];
        //this.deletingException = text["DeletingException"];        
        this.errorDeleting = text["ErrorDeleting"];
        this.pleaseTryAgain = text["PleaseTryAgain"];
        this.done_msg = text["Done"];
        // this.logger.log('+ + + DeleteRequestForever', text)
      });

    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSure = text;
        // this.logger.log('+ + + areYouSure', text)
      });

    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();
    this.translateAllConversationsHaveBeenArchived();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.translateYouAreAboutToJoin();
    this.translateCancel();
    this.translateJoinToChat();
  }

  translateYouAreAboutToJoin() {
    this.translate.get('YouAreAboutToJoinThisChatAlreadyAssignedTo')
      .subscribe((text: string) => {
        this.youAreAboutToJoinMsg = text;

      });
  }

  translateCancel() {
    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancelMsg = text;
      });
  }

  translateJoinToChat() {
    this.translate.get('RequestMsgsPage.Enter')
      .subscribe((text: string) => {
        this.joinToChatMsg = text;
      });
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });
  }

  translateAllConversationsHaveBeenArchived() {
    this.translate.get('AllConversationsaveBeenArchived')
      .subscribe((text: string) => {
        this.allConversationsaveBeenArchivedMsg = text
      })

  }


  // TRANSLATION
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {
        this.archivingRequestNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }


  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(request, request_id: string) {

    // this._onJoinHandled(request_id, this.currentUserID, request);
    this.logger.log('[HISTORY & NORT-CONVS] joinRequest request', request)
    // this.getRequests();

    let chatAgent = '';
    if (request && request.participanting_Agents) {

      const participantingagentslength = request.participanting_Agents.length
      request.participanting_Agents.forEach((agent, index) => {
        this.logger.log('[HISTORY & NORT-CONVS] - joinRequest forEach agent', agent);
        let stringEnd = ' '


        if (participantingagentslength - 1 === index) {
          stringEnd = '.';
        } else {
          stringEnd = ', ';
        }

        if (agent.firstname && agent.lastname) {
          chatAgent += agent.firstname + ' ' + agent.lastname + stringEnd
        }

        if (agent.name) {
          chatAgent += agent.name + stringEnd
        }

      });


      this.logger.log('[HISTORY & NORT-CONVS] - joinRequest chatAgent', chatAgent);

      if (request && request.currentUserIsJoined === false) {
        this.displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id, request);
      }
    }
  }

  displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id, request) {
    swal({
      title: this.areYouSure,
      text: this.youAreAboutToJoinMsg + ': ' + chatAgent,

      icon: "info",
      buttons: {
        cancel: this.cancelMsg,
        catch: {
          text: this.joinToChatMsg,
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('[HISTORY & NORT-CONVS] ARE YOU SURE TO JOIN THIS CHAT ... value', value)

        if (value === 'catch') {
          this._onJoinHandled(request_id, this.currentUserID, request);
        }
      })
  }

  _onJoinHandled(id_request: string, currentUserID: string, request: any) {
    // this.getFirebaseToken(() => {
    this.logger.log('[HISTORY & NORT-CONVS] - JOIN PRESSED');


    this.wsRequestsService.addParticipant(id_request, currentUserID)
      .subscribe((data: any) => {

        this.logger.log('[HISTORY & NORT-CONVS] - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        this.logger.error('[HISTORY & NORT-CONVS] - addParticipant TO CHAT GROUP ERROR ', err);

      }, () => {
        this.logger.log('[HISTORY & NORT-CONVS] - addParticipant TO CHAT GROUP COMPLETE');
        request.currentUserIsJoined = true
        request.participants.push(this.currentUserID)
        request.participantsAgents.push(this.currentUserID)
        request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.imageStorage, this.UPLOAD_ENGINE_IS_FIREBASE)
        this.logger.log('[HISTORY & NORT-CONVS] - JOIN PRESSED request ', request);
        this.notify.showWidgetStyleUpdateNotification(`You are successfully added to the chat`, 2, 'done');
        // this.getRequests();
      });
    // });
  }



  openChatAtSelectedConversation(requestid: string, requester_fullanme: string) {
    this.openChatToTheSelectedConversation(this.CHAT_BASE_URL, requestid, requester_fullanme)
  }

  // openChatInNewWindow(requestid: string, requester_fullanme: string) {
  //   this.logger.log('[HISTORY & NORT-CONVS] - openChatInNewWindow - requestid ', requestid);
  //   this.logger.log('[HISTORY & NORT-CONVS] - openChatInNewWindow - requestid ', requester_fullanme);
  //   // const url = this.CHAT_BASE_URL + '?recipient=' + requestid;

  //   // let url = '';
  //   // if (this.FIREBASE_AUTH === false) {
  //   //   url = this.CHAT_BASE_URL + "/" + requestid + "/" + requester_fullanme + "/active"
  //   // } else if (this.FIREBASE_AUTH === true) {
  //   //   url = this.CHAT_BASE_URL + '?recipient=' + requestid;
  //   // } else {
  //   //   url = this.CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
  //   // }
  //   const url = this.CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
  //   window.open(url, '_blank');

  //   // this.openWindow('Tiledesk - Open Source Live Chat', url)
  //   // this.focusWin('Tiledesk - Open Source Live Chat')
  // }

  // openWindow(winName: any, winURL: any) {
  //   const myWindows = new Array();
  //   if (myWindows[winName] && !myWindows[winName].closed) {
  //     alert('window already exists');
  //   } else {
  //     myWindows[winName] = window.open(winURL, winName);
  //   }
  // }

  // focusWin(winName: any) {
  //   const myWindows = new Array();
  //   if (myWindows[winName] && !myWindows[winName].closed) {
  //     myWindows[winName].focus();
  //   } else {
  //     // alert('cannot focus closed or nonexistant window');
  //     this.logger.log('[HOME] - cannot focus closed or nonexistant window');
  //   }
  // }







  getCurrentUrlLoadRequests() {
    const currentUrl = this.router.url;
    this.logger.log('[HISTORY & NORT-CONVS] current_url ', currentUrl);

    if (currentUrl.indexOf('/all-conversations') !== -1) {
      this.IS_HERE_FOR_HISTORY = false;
      this.logger.log('[HISTORY & NORT-CONVS] - IS_HERE_FOR_HISTORY ? ', this.IS_HERE_FOR_HISTORY);
      this.requests_status = 'all'
      this.getRequests();

    } else {
      this.IS_HERE_FOR_HISTORY = true;
      this.logger.log('[HISTORY & NORT-CONVS] - IS_HERE_FOR_HISTORY ? ', this.IS_HERE_FOR_HISTORY);
      this.operator = '='
      this.requests_status = '1000'
      this.getRequests();
    }
  }

  requestsStatusSelect(request_status) {
    this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - requestsStatusSelect', request_status);
    if (request_status === '200') {
      this.getServedRequests();
    } else if (request_status === '100') {
      this.getUnservedRequests();
    } else if (request_status === 'all') {
      this.getAllRequests();
    }
  }

  requestsStatusSelectFromAdvancedOption(request_status) {
    if (request_status === 'all') {

      this.requests_status = 'all'

    } else if (request_status === '100') {
      this.operator = '='
      this.requests_status = '100'
    } else if (request_status === '200') {
      this.operator = '='
      this.requests_status = '200'
    }

  }


  getAllRequests() {
    // this.operator = '<'
    this.requests_status = 'all'
    this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getAllRequests', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getServedRequests() {
    this.operator = '='
    this.requests_status = '200'
    this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getServedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getUnservedRequests() {
    this.operator = '='
    this.requests_status = '100'
    this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getUnservedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }



  // GET REQUEST COPY - START
  getRequests() {
    this.showSpinner = true;

    let promise = new Promise((resolve, reject) => {


      this.wsRequestsService.getHistoryAndNortRequests(this.operator, this.requests_status, this.queryString, this.pageNo).subscribe((requests: any) => {
        this.logger.log('[HISTORY & NORT-CONVS] - GET REQUESTS RES ', requests);
        this.logger.log('[HISTORY & NORT-CONVS] - GET REQUESTS ', requests['requests']);
        this.logger.log('[HISTORY & NORT-CONVS] - GET REQUESTS COUNT ', requests['count']);


        if (requests) {
          this.requestsCount = requests['count'];
          this.logger.log('[HISTORY & NORT-CONVS]- GET REQUESTS COUNT ', this.requestsCount);
          this.displayHideFooterPagination();
          const requestsPerPage = requests['perPage'];
          this.logger.log('[HISTORY & NORT-CONVS] - TOTAL PAGES REQUESTS X PAGE', requestsPerPage);
          const totalPagesNo = this.requestsCount / requestsPerPage;
          this.logger.log('[HISTORY & NORT-CONVS] - TOTAL PAGES NUMBER', totalPagesNo);
          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          this.logger.log('[HISTORY & NORT-CONVS] - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

          this.requestList = requests['requests'];

          for (const request of this.requestList) {

            if (request) {
              request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

              // -------------------------------------------------------------------
              // User Agent
              // -------------------------------------------------------------------
              const user_agent_result = this.parseUserAgent(request.userAgent);
              const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
              request['ua_browser'] = ua_browser;
              const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
              request['ua_os'] = ua_os;
              // -------------------------------------------------------------------
              // Contact's avatar
              // -------------------------------------------------------------------
              let newInitials = '';
              let newFillColour = '';

              if (request.lead && request.lead.fullname) {
                newInitials = avatarPlaceholder(request.lead.fullname);
                newFillColour = getColorBck(request.lead.fullname)
              } else {
                newInitials = 'N/A';
                newFillColour = 'rgb(98, 100, 167)';
              }
              request.requester_fullname_initial = newInitials;
              request.requester_fullname_fillColour = newFillColour;

              const date = moment.localeData().longDateFormat(request.createdAt);
              request.fulldate = date;

              if (request.participants.length > 0) {
                this.logger.log('[HISTORY & NORT-CONVS] participants length', request.participants.length);
                if (!request['participanting_Agents']) {

                  this.logger.log('[HISTORY & NORT-CONVS] request[participanting_Agents] IS ', request['participanting_Agents'], ' - RUN DO-PARTICIPATING-AGENTS-ARRAY ');

                  request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.imageStorage, this.UPLOAD_ENGINE_IS_FIREBASE)

                } else {

                  this.logger.log('[HISTORY & NORT-CONVS] request[participanting_Agents] IS DEFINED');
                }
              } else {
                this.logger.log('[HISTORY & NORT-CONVS] participants length', request.participants.length);
                request['participanting_Agents'] = [{ _id: 'no_agent', email: 'NoAgent', firstname: 'NoAgent', lastname: 'NoAgent' }]
              }

              // ------------------------------------------------------------------------------------------------------------
              //  OLD !!! to get if the requester is authenticated the 'isAuthenticated' property is obtained from snapshot.requester
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


              // ------------------------------------------------------------------------------------------------------------
              //  to get if the requester is authenticated the 'isAuthenticated' property is obtained directly from requester
              // ------------------------------------------------------------------------------------------------------------
              if (request && request.requester && request.requester.isAuthenticated) {
                if (request.requester.isAuthenticated === true) {
                  request['requester_is_verified'] = true;
                } else {
                  request['requester_is_verified'] = false;
                }
              } else {
                request['requester_is_verified'] = false;
              }

              if (request.department) {
                const deptHasName = request.department.hasOwnProperty('name')
                if (deptHasName) {
                  this.logger.log('[HISTORY & NORT-CONVS] - REQ DEPT HAS NAME', deptHasName)
                  request['dept'] = request.department
                } else {
                  this.logger.log('[HISTORY & NORT-CONVS] - REQ DEPT HAS NAME ', deptHasName)

                  // in this case department is an object (i.e.  department: {_id: "5df26badde7e1c001743b63e"} )
                  if (request.department.hasOwnProperty('_id')) {
                    if (this.departments) {
                      request['dept'] = this.getDeptObj(request.department._id, this.departments);
                    } else {
                      request['dept'] = this.getDeptById(request.department._id, request)
                    }
                  } else {
                    // in this case department is a string equivalent to the department id (i.e. department: "5df26badde7e1c001743b63e" )
                    if (this.departments) {
                      this.getDeptObj(request['department'], this.departments)
                    } else {
                      this.getDeptById(request['department'], request)
                    }
                  }
                }
              }
            }
          }
        }
      }, error => {
        this.showSpinner = false;
        this.logger.error('[HISTORY & NORT-CONVS] - GET REQUESTS - ERROR: ', error);
        reject(error);
      }, () => {
        this.showSpinner = false;
        this.logger.log('[HISTORY & NORT-CONVS] - GET REQUESTS * COMPLETE *')
        resolve(true);
      });

    }) // promise end
    return promise;
  }
  // GET REQUEST COPY - END

  getDeptObj(departmentid: string, department: any) {
    this.logger.log('[HISTORY & NORT-CONVS] - getDeptObj departmentid', departmentid)
    this.logger.log('[HISTORY & NORT-CONVS] - getDeptObj department', departmentid)
    // const deptObjct =  this.departments.findIndex((e) => e.department === departmentid);

    const deptObjct = department.filter((obj: any) => {
      return obj._id === departmentid;
    });
    // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- service -  X-> DEPT OBJECT <-X', deptObjct)
    return deptObjct[0]
  }

  getDeptById(departmentid: string, request: any) {

    this.departmentService.getDeptById(departmentid).subscribe((dept: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET DEPT BY ID - RES ', dept);
      request['dept'] = dept

    }, (error) => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET DEPT BY ID - ERROR ', error);

    }, () => {

      this.logger.log('[HISTORY & NORT-CONVS] - GET DEPT BY ID - COMPLETE ');
    })
  }


  detectMobile() {
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[HISTORY & NORT-CONVS] - detectMobile IS MOBILE ', this.isMobile);
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[HISTORY & NORT-CONVS] - USER ROLE ', user_role);
        if (user_role) {
          this.CURRENT_USER_ROLE = user_role
        }
        if (user_role) {
          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true

          } else {
            this.ROLE_IS_AGENT = false
          }
        }
      });
  }


  // requestWillBePermanentlyDeleted

  getImageStorageAndChatBaseUrl() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];

      this.imageStorage = this.storageBucket

      this.logger.log('[HISTORY & NORT-CONVS] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.imageStorage = this.baseUrl
      this.logger.log('[HISTORY & NORT-CONVS] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }

    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] getProjectPlan - project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired
        this.profile_name = projectProfileData.profile_name
        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

        // tslint:disable-next-line:max-line-length
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
          this.date_picker_is_disabled = true;
          // this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
        } else {
          this.date_picker_is_disabled = false;
        }
      }
    })
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    if (planType === 'payment') {

      this.getPaidPlanTranslation(planName)
      // if (browserLang === 'it') {
      //   this.prjct_profile_name = 'Piano ' + planName;
      //   return this.prjct_profile_name
      // } else if (browserLang !== 'it') {
      //   this.prjct_profile_name = planName + ' Plan';
      //   return this.prjct_profile_name
      // }
    }
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }

  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(requestid) {
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - id request ", requestid);
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("[HISTORY & NORT-CONVS] ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("[HISTORY & NORT-CONVS] ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";
  }

  // --------------------------------------------------
  // @ Tags - display less tags
  // --------------------------------------------------
  displayLessTag(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("% [HISTORY & NORT-CONVS] ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("[HISTORY & NORT-CONVS] ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";
  }

  openModalSubsExpiredOrGoToPricing() {
    // console.log('[HISTORY & NORT-CONVS] this.profile_name ', this.profile_name)
    // console.log('[HISTORY & NORT-CONVS]  this.trial_expired ', this.trial_expired)

    // if (this.CURRENT_USER_ROLE === 'owner') {

    //   if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
    //     this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    //   }
    //   if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //     this.router.navigate(['project/' + this.projectId + '/pricing']);
    //   }
    // } else {

    //   this.presentModalOnlyOwnerCanManageTheAccountPlan();
    // }
    // console.log('openModalSubsExpiredOrGoToPricing this.payIsVisible ', this.payIsVisible) 
    if (this.payIsVisible) {

      if (this.CURRENT_USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.profile_name !== 'enterprise') {
            this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
          } else if (this.profile_name === 'enterprise') {
            this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
          }

        } else if (this.profile_name === 'free' && this.trial_expired === true) {
          this.router.navigate(['project/' + this.projectId + '/pricing']);
        }

      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }


  presentModalOnlyOwnerCanManageTheAccountPlan() {
    // https://github.com/t4t5/sweetalert/issues/845
    const el = document.createElement('div')
    el.innerHTML = this.onlyOwnerCanManageTheAccountPlanMsg + '. ' + "<a href='https://docs.tiledesk.com/knowledge-base/understanding-default-roles/' target='_blank'>" + this.learnMoreAboutDefaultRoles + "</a>"

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


  getAllProjectUsers() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[HISTORY & NORT-CONVS]  - GET PROJECT-USERS ', projectUsers);

      if (projectUsers) {
        this.projectUsersArray = projectUsers;
        projectUsers.forEach(user => {
          this.user_and_bot_array.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
        });

        this.logger.log('[HISTORY & NORT-CONVS] - !!!! USERS ARRAY ', this.user_and_bot_array);
      }
    }, (error) => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET PROJECT-USERS ', error);
    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECT-USERS * COMPLETE *');
      this.getAllBot();
    });
  }

  getAllBot() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET  BOT ', bots);

      if (bots) {
        bots.forEach(bot => {
          this.user_and_bot_array.push({ '_id': 'bot_' + bot._id, 'firstname': bot.name + ' (bot)', 'descrip': bot.description });
        });
      }
      this.logger.log('[HISTORY & NORT-CONVS]  - BOTS & USERS ARRAY ', this.user_and_bot_array);
    }, (error) => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET  BOT ', error);
    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET  BOT * COMPLETE *');
    });
  }



  getCurrentUser() {
    const user = this.auth.user_bs.value
    this.logger.log('[HISTORY & NORT-CONVS] - LOGGED USER ', user);
    if (user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = user._id
      this.logger.log('[HISTORY & NORT-CONVS] - USER UID ', this.currentUserID);
      // this.getToken();
    } else {
      // this.logger.log('No user is signed in');
    }
  }


  // ------------------------------------------------------------------------------
  // @ Departments - get Departments
  // ------------------------------------------------------------------------------
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET DEPTS RES ', _departments);
      this.departments = _departments

    }, error => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET DEPTS * COMPLETE *')
    });
  }

  // ------------------------------------------------------------------------------
  // @ Tags - get tags
  // ------------------------------------------------------------------------------
  getTag() {
    this.tagsService.getTags().subscribe((tags: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET TAGS - RES ', tags);

      tags.forEach(tag => {
        this.logger.log('[HISTORY & NORT-CONVS] - TAG', tag);

        this.tags_array.push({ 'id': tag._id, 'name': tag.tag, 'color': tag.color })
      });

      this.logger.log('[HISTORY & NORT-CONVS] - TAG-ARRAY', this.tags_array);
    }, error => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET TAGS - ERROR: ', error);
    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET TAGS * COMPLETE *')
    });
  }

  // ------------------------------------------------------------------------------
  // @ Departments - get selected department name
  // ------------------------------------------------------------------------------
  depSelected(deptid) {
    this.logger.log('[HISTORY & NORT-CONVS] - selectedDeptId ', this.selectedDeptId);

    const selectedDept = this.departments.filter((dept: any) => {

      return dept._id === deptid;
    });
    this.logger.log('[HISTORY & NORT-CONVS] - selectedDept ', selectedDept);
    if (selectedDept.length > 0) {

      this.selectedDeptName_temp = selectedDept[0].name
      this.logger.log('[HISTORY & NORT-CONVS] - selectedDeptName_temp ', this.selectedDeptName_temp);
    } else {
      // this.selectedDeptName = null;
      this.selectedDeptId = '';
    }
  }

  // ------------------------------------------------------------------------------
  // @ Agents (project-users + bots) - on change agent get selected agent name
  // ------------------------------------------------------------------------------
  agentSelected(selectedagentid) {
    const selectedAgent = this.user_and_bot_array.filter((agent: any) => {
      return agent._id === selectedagentid;
    });

    this.logger.log('[HISTORY & NORT-CONVS] - selectedAgent ', selectedAgent);
    if (selectedAgent.length > 0) {
      this.selectedAgentFirstname_temp = selectedAgent[0].firstname
      this.selectedAgentLastname_temp = selectedAgent[0].lastname
      this.logger.log('[HISTORY & NORT-CONVS] - selectedAgentFirstname TEMP ', this.selectedAgentFirstname_temp, ' selectedAgentLastname TEMP: ', this.selectedAgentLastname_temp);
    } else {
      this.selectedAgentId = ''
    }
  }

  // ------------------------------------------------------------------------------
  // @ Tags - on change tags get selected tag name
  // ------------------------------------------------------------------------------
  tagNameSelected() {
    this.logger.log('[HISTORY & NORT-CONVS] - selecteTagName ', this.selecteTagName);
    // this.selecteTagNameValue = this.selecteTagName

    const selecteTag = this.tags_array.filter((tag: any) => {
      return tag.name === this.selecteTagName;
    });
    this.logger.log('[HISTORY & NORT-CONVS] - selecteTag ', selecteTag);

    if (selecteTag.length > 0) {
      this.selecteTagColor_temp = selecteTag[0]['color']
    }
  }

  fulltextChange($event) {
    this.logger.log('[HISTORY & NORT-CONVS] - fulltextChange ', $event);
    this.fullText_temp = $event
  }


  // ------------------------------------------------------------------------------
  // @ Date - on change start date get selected start date formatted
  // ------------------------------------------------------------------------------
  startDateSelected($event) {
    this.logger.log('[HISTORY & NORT-CONVS] - startDateSelected ', $event);
    this.startDateFormatted_temp = $event['formatted'];

    this.logger.log('[HISTORY & NORT-CONVS] - startDateFormatted TEMP ', this.startDateFormatted_temp);

    // const startDateLessOneDay =  moment($event['jsdate']).subtract(1, 'days').format('DD/MM/YYYY'); 
    const startDateLessOneDay = moment($event['jsdate']).subtract(1, 'days').format('DD/MM/YYYY');

    const startDateLessOneDaySegment = startDateLessOneDay.split('/');

    this.logger.log('[HISTORY & NORT-CONVS] - startDateLessOneDay ', startDateLessOneDay);
    this.logger.log('[HISTORY & NORT-CONVS] - startDateLessOneDaySegment ', startDateLessOneDaySegment);


    // this.disableUntilDate = $event.date;
    this.disableUntilDate = { year: startDateLessOneDaySegment[2], month: startDateLessOneDaySegment[1], day: startDateLessOneDaySegment[0] }

    this.logger.log('[HISTORY & NORT-CONVS] - disableUntilDate ', this.disableUntilDate);

    let copy = this.getCopyOfOptions();

    copy.disableUntil = this.disableUntilDate;

    this.endDatePickerOptions = copy;

    this.logger.log('[HISTORY & NORT-CONVS] - endDatePickerOptions ', this.endDatePickerOptions);

    if (this.startDateFormatted_temp) {
      this.start_date_is_null = false;
    } else {
      this.start_date_is_null = true;
      this.startDate = ''
      this.endDate = ''
      // this.search()
    }
  }

  // ------------------------------------------------------------------------------
  // @ Date - on change end date get selected end date formatted
  // ------------------------------------------------------------------------------
  endDateSelected($event) {
    this.logger.log('[HISTORY & NORT-CONVS] - endDateSelected ', $event);

    this.endDateFormatted_temp = $event['formatted'];
    this.logger.log('[HISTORY & NORT-CONVS] - endDateFormatted TEMP', this.endDateFormatted_temp);

    // this.endDatePickerOptions.disableUntil = this.disableUntilDate;

    // let copy = this.getCopyOfOptions();
    // copy.disableUntil = this.disableUntilDate;
    // this.endDatePickerOptions = copy;
    // this.logger.log('!!! NEW REQUESTS HISTORY - endDatePickerOptions ', this.endDatePickerOptions);

    if (!this.endDateFormatted_temp) {
      this.endDate = ''
    }
  }

  getCopyOfOptions(): IMyDpOptions {
    return JSON.parse(JSON.stringify(this.endDatePickerOptions));
  }


  // ------------------------------------------------------------------------------
  // @ Toggle advanced options
  // ------------------------------------------------------------------------------
  toggle() {
    // this.advancedoptionbtnRef.nativeElement.blur();
    this.showAdvancedSearchOption = !this.showAdvancedSearchOption;
    this.logger.log('[HISTORY & NORT-CONVS] - TOGGLE DIV ', this.showAdvancedSearchOption);
    this.displayHideFooterPagination();
  }

  searchOnEnterPressed(event: any) {
    this.logger.log('searchOnEnterPressed event', event);

    if (event.key === "Enter") {
      this.search()
    }
  }


  search() {
    this.has_searched = true;
    this.pageNo = 0

    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED (doesn't works - so is used the below code)
    // this.searchbtnRef.nativeElement.blur();

    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    // const searchTopBtn = <HTMLElement>document.querySelector('.searchTopBtn');
    // this.logger.log('!!! NEW REQUESTS HISTORY - TOP SEARCH BTN ', searchTopBtn)
    // searchTopBtn.blur()

    // if (this.searchbtnbottomRef) {
    //   this.searchbtnbottomRef.nativeElement.blur();
    // }

    if (this.fullText) {

      this.fullTextValue = this.fullText;
      this.fullText_applied_filter = this.fullText_temp;
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR DEPT TEXT ', this.fullText);
      this.fullTextValue = '';
      this.fullText_applied_filter = null;
    }

    if (this.selectedDeptId) {
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR DEPT ID selectedDeptId', this.selectedDeptId);
      this.deptIdValue = this.selectedDeptId;
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR DEPT ID ', this.deptIdValue);
      this.selectedDeptName = this.selectedDeptName_temp;
    } else {
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR DEPT ID ', this.selectedDeptId);
      this.deptIdValue = ''
      this.selectedDeptName = null;
    }

    if (this.startDate) {
      this.logger.log('[HISTORY & NORT-CONVS] - START DATE ', this.startDate);
      this.logger.log('[HISTORY & NORT-CONVS] - START DATE - FORMATTED ', this.startDate['formatted']);
      this.logger.log('[HISTORY & NORT-CONVS] - START DATE - EPOC ', this.startDate['epoc']);

      this.startDateValue = this.startDate['formatted']

      this.startDateFormatted = this.startDateFormatted_temp;

      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR START DATE ', this.startDateValue);
    } else {
      this.startDateValue = '';
      this.startDateFormatted = null
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR START DATE ', this.startDate);
    }

    if (this.endDate) {
      this.logger.log('[HISTORY & NORT-CONVS] - END DATE ', this.endDate);
      this.logger.log('[HISTORY & NORT-CONVS] - END DATE - FORMATTED ', this.endDate['formatted']);
      this.logger.log('[HISTORY & NORT-CONVS] - END DATE - EPOC ', this.endDate['epoc']);

      this.endDateValue = this.endDate['formatted']
      this.endDateFormatted = this.endDateFormatted_temp;

      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR END DATE ', this.endDateValue);
    } else {
      this.endDateValue = '';
      this.endDateFormatted = null
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR END DATE ', this.endDate)
    }


    if (this.selectedAgentId) {
      this.selectedAgentValue = this.selectedAgentId;
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selectedAgentId ', this.selectedAgentValue);

      this.selectedAgentFirstname = this.selectedAgentFirstname_temp;
      this.selectedAgentLastname = this.selectedAgentLastname_temp;
    } else {
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selectedAgentId ', this.selectedAgentId);
      this.selectedAgentValue = '';

      this.selectedAgentFirstname = null;
      this.selectedAgentLastname = null;
    }

    if (this.selecteTagName) {
      this.selecteTagNameValue = this.selecteTagName
      this.selecteTagColor = this.selecteTagColor_temp
    } else {
      this.selecteTagNameValue = '';
      this.selecteTagColor = null
    }


    // !!!!! NOT USED ????
    if (this.requester_email) {
      this.emailValue = this.requester_email;
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR email ', this.emailValue);
    } else {
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR email ', this.requester_email);
      this.emailValue = ''
    }



    // if (this.fullText !== undefined && this.deptName !== undefined && this.startDate !== undefined || this.endDate !== undefined) {
    // tslint:disable-next-line:max-line-length
    this.queryString =
      'full_text=' + this.fullTextValue + '&'
      + 'dept_id=' + this.deptIdValue + '&'
      + 'start_date=' + this.startDateValue + '&'
      + 'end_date=' + this.endDateValue + '&'
      + 'participant=' + this.selectedAgentValue + '&'
      + 'requester_email=' + this.emailValue + '&'
      + 'tags=' + this.selecteTagNameValue

    this.logger.log('[HISTORY & NORT-CONVS] - QUERY STRING ', this.queryString);

    // REOPEN THE ADVANCED OPTION DIV IF IT IS CLOSED BUT ONE OF SEARCH FIELDS IN IT CONTAINED ARE VALORIZED
    if (this.showAdvancedSearchOption === false) {
      if (this.selectedDeptId || this.startDate || this.endDate || this.selectedAgentId || this.requester_email || this.selecteTagName) {
        this.showAdvancedSearchOption = true;
      }
    }
    this.getRequests();
  }

  clearFullText() {
    this.fullText = '';
    this.fullText_applied_filter = null;

    if (this.selectedDeptId) {
      this.deptIdValue = this.selectedDeptId;
    } else {
      this.deptIdValue = ''
      this.selectedDeptName = null;
    }

    if (this.startDate) {
      this.startDateValue = this.startDate['formatted']
    } else {
      this.startDateValue = '';
      this.startDateFormatted = null;
    }

    if (this.endDate) {
      this.endDateValue = this.endDate['formatted']
    } else {
      this.endDateValue = ''
      this.endDateFormatted = null;
    }

    if (this.selectedAgentId) {
      this.selectedAgentValue = this.selectedAgentId;
    } else {
      this.selectedAgentValue = ''
      this.selectedAgentFirstname = null;
      this.selectedAgentLastname = null;
    }

    if (this.selecteTagName) {
      this.selecteTagNameValue = this.selecteTagName

    } else {
      this.selecteTagNameValue = '';
      this.selecteTagColor = null
    }

    if (this.requester_email) {
      this.emailValue = this.requester_email;
    } else {
      this.emailValue = ''
    }
    // tslint:disable-next-line:max-line-length

    this.queryString =
      'full_text='
      + '&' +
      'dept_id=' + this.deptIdValue
      + '&' +
      'start_date=' + this.startDateValue
      + '&' +
      'end_date=' + this.endDateValue
      + '&' +
      'participant=' + this.selectedAgentValue
      + '&' +
      'requester_email=' + this.emailValue
      + '&' +
      'tags=' + this.selecteTagNameValue

    this.pageNo = 0
    this.getRequests();

  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    this.logger.log('[HISTORY & NORT-CONVS]- CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()

    this.fullText = '';
    this.selectedDeptId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedAgentId = '';
    this.requester_email = '';
    this.selecteTagName = '';

    if (!this.IS_HERE_FOR_HISTORY) {
      this.requests_status = 'all' // I comment this because it causes bugs
    }

    // this.fullTextValue = '';
    // this.deptIdValue = '';
    // this.startDateValue = '';
    // this.endDateValue = '';

    // ------------------------------------
    // used in APPLIED FILTERS
    // ------------------------------------
    this.selectedAgentFirstname = null;
    this.selectedAgentLastname = null;
    this.selectedDeptName = null;
    this.startDateFormatted = null;
    this.endDateFormatted = null;
    this.fullText_applied_filter = null;
    this.selecteTagName = null
    this.selecteTagColor = null


    // tslint:disable-next-line:max-line-length
    this.queryString = 'full_text=' + '&' + 'dept_id=' + '&' + 'start_date=' + '&' + 'end_date=' + '&' + 'participant=' + '&' + 'requester_email=' + '&' + 'tags=';
    this.pageNo = 0;
    this.logger.log('[HISTORY & NORT-CONVS] - CLEAR SEARCH fullTextValue ', this.fullTextValue)

    this.getRequests();

  }


  // ------------------------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------------------------
  decreasePageNumber() {
    this.pageNo -= 1;

    this.logger.log('[HISTORY & NORT-CONVS] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.logger.log('[HISTORY & NORT-CONVS] - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  displayHideFooterPagination() {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if ((this.showAdvancedSearchOption === true && this.requestsCount >= 10) || (this.requestsCount >= 16)) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[HISTORY & NORT-CONVS] ', this.requestsCount, 'ADVANCED OPTION IS OPEN ', this.showAdvancedSearchOption, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      this.logger.log('[HISTORY & NORT-CONVS] - REQST COUNT ', this.requestsCount, 'ADVANCED OPTION IS OPEN ', this.showAdvancedSearchOption, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }

  exportRequestsToCSV() {
    // tslint:disable-next-line:max-line-length
    // console.log('exportRequestsToCSV this.payIsVisible ', this.payIsVisible) 
    if (this.payIsVisible) {
      if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
        this.notify.openDataExportNotAvailable()
      } else {
        const exportToCsvBtn = <HTMLElement>document.querySelector('.export-to-csv-btn');
        this.logger.log('[HISTORY & NORT-CONVS] - EXPORT TO CSV BTN', exportToCsvBtn)
        exportToCsvBtn.blur()

        this.wsRequestsService.downloadHistoryRequestsAsCsv(this.queryString, 0).subscribe((requests: any) => {
          if (requests) {
            this.logger.log('[HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV - RES ', requests);

            // const reqNoLineBreaks = requests.replace(/(\r\n\t|\n|\r\t)/gm, ' ');
            // this.logger.log('!!! DOWNLOAD REQUESTS AS CSV - REQUESTS NO NEW LINE ', reqNoLineBreaks);
            this.downloadFile(requests)
          }
        }, error => {
          this.logger.error('[HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV - ERROR: ', error);
        }, () => {
          this.logger.log('[HISTORY & NORT-CONVS] - DOWNLOAD REQUESTS AS CSV * COMPLETE *')
        });

      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }


  downloadFile(data) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'requests.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }


  parseUserAgent(uastring) {
    // https://github.com/faisalman/ua-parser-js
    var parser = new UAParser();
    parser.setUA(uastring);
    return parser.getResult();
  }


  goToAgentProfile(member_id) {
    this.logger.log('[HISTORY & NORT-CONVS] goToAgentProfile (AFTER GET PROJECT-USER-ID BY ID)', member_id)
    // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }

  // SERVED_BY: add this if not exist -->
  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[HISTORY & NORT-CONVS] GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          this.logger.log('[HISTORY & NORT-CONVS] GET projectUser by USER-ID > projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        this.logger.error('[HISTORY & NORT-CONVS] GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        this.logger.log('[HISTORY & NORT-CONVS] GET projectUser by USER-ID * COMPLETE *');
      });
  }

  goToBotProfile(bot_id, bot_type) {
    let botType = ''
    if (bot_type === 'internal') {
      botType = 'native'
    } else {
      botType = bot_type
    }

    if (this.ROLE_IS_AGENT === false) {
      this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);
    }
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[HISTORY & NORT-CONVS] - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)
      if (project) {
        this.projectId = project._id;
      }
    });
  }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_recipient: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/messages']);
  }


  selectAll(e) {
    this.logger.log("[HISTORY & NORT-CONVS] **++ Is checked: ", e.target.checked)
    var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
    this.logger.log("[HISTORY & NORT-CONVS] **++ checkbox Indeterminate: ", checkbox.indeterminate);


    if (e.target.checked == true) {
      this.allChecked = true;
      for (let request of this.requestList) {
        const index = this.request_selected.indexOf(request.request_id);
        if (index > -1) {
          this.logger.log("[HISTORY & NORT-CONVS] **++ Already present")
        } else {
          this.logger.log("[HISTORY & NORT-CONVS] *+*+ Request Selected: ", request.request_id);
          this.request_selected.push(request.request_id);
        }
      }
      this.logger.log('[HISTORY & NORT-CONVS] - ARRAY OF SELECTED REQUEST ', this.request_selected);
      this.logger.log('[HISTORY & NORT-CONVS] - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    } else {
      this.allChecked = false;
      this.request_selected = [];
      this.logger.log('[HISTORY & NORT-CONVS] - ARRAY OF SELECTED REQUEST ', this.request_selected);
      this.logger.log('[HISTORY & NORT-CONVS] - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    }

  }

  // --------------------------------------------------------------
  // On selected request by the checkbox
  // --------------------------------------------------------------
  change(requestId) {
    var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
    this.logger.log("[HISTORY & NORT-CONVS] -  change - checkbox Indeterminate: ", checkbox.indeterminate);

    this.logger.log('[HISTORY & NORT-CONVS] - change - SELECTED REQUEST ID: ', requestId);
    const index = this.request_selected.indexOf(requestId);
    this.logger.log("[HISTORY & NORT-CONVS] - change - request selected INDEX: ", index);

    if (index > -1) {
      this.request_selected.splice(index, 1);
      checkbox.indeterminate = true;
      this.logger.log("[HISTORY & NORT-CONVS] - change - checkbox Indeterminate: ", checkbox.indeterminate);
      if (this.request_selected.length == 0) {
        checkbox.indeterminate = false;
        this.logger.log("[HISTORY & NORT-CONVS] - change - checkbox Indeterminate: ", checkbox.indeterminate);
        this.allChecked = false;
      }
    } else {
      this.request_selected.push(requestId);
      checkbox.indeterminate = true;
      this.logger.log("[HISTORY & NORT-CONVS] - change - checkbox Indeterminate: ", checkbox.indeterminate);
      if (this.request_selected.length == this.requestList.length) {
        checkbox.indeterminate = false;
        this.logger.log("[HISTORY & NORT-CONVS] - change - checkbox Indeterminate: ", checkbox.indeterminate);
        this.allChecked = true;
      }
    }
    this.logger.log('[HISTORY & NORT-CONVS] - ARRAY OF SELECTED REQUEST ', this.request_selected);
    this.logger.log('[HISTORY & NORT-CONVS] - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
  }


  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[HISTORY & NORT-CONVS] - HAS CLICKED ARCHIVE REQUEST request_id ', request_id);


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('[HISTORY & NORT-CONVS] - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        this.logger.error('[HISTORY & NORT-CONVS] - CLOSE SUPPORT GROUP - ERROR ', err);


        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        this.logger.log('[HISTORY & NORT-CONVS] +- CLOSE SUPPORT GROUP - COMPLETE');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

        // this.onArchiveRequestCompleted()

        this.getRequests();
      });
  }


  archiveSelected() {
    this.logger.log("[HISTORY & NORT-CONVS] - ARRAY OF ARCHIVE SELECTED: ", this.request_selected);
    this.logger.log("[HISTORY & NORT-CONVS] - ARRAY OF ARCHIVE SELECTED INITILA LENGHT : ", this.request_selected.length);
    let count = 0;
    const promises = [];

    this.request_selected.forEach((requestid, index) => {
      promises.push(this.wsRequestsService.archiveRequestOnPromise(requestid)
        .then((res) => {

          this.logger.log("[HISTORY & NORT-CONVS] - then res : ", res);

          this.logger.log("[HISTORY & NORT-CONVS] - then res _body : ", JSON.parse(res['_body']));

          count = index + 1;
          this.logger.log("[HISTORY & NORT-CONVS] - count Of ARCHIVE SELECTED : ", count)
          this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg + count + '/' + this.request_selected.length);

        }).catch((error) => {

          this.logger.error('[HISTORY & NORT-CONVS] PROMISE ERROR: ', error);
        })
      );
    });

    Promise.all(promises).then((res) => {
      this.logger.log("[HISTORY & NORT-CONVS] - ALL PROMISE RESOLVED", res);
      this.notify.showAllRequestHaveBeenArchivedNotification(this.allConversationsaveBeenArchivedMsg)
      this.allChecked = false;
      this.getRequests();
    });
  }


  deleteSelected() {
    this.logger.log("[HISTORY & NORT-CONVS] - REQUESTS TO DELETE: ", this.request_selected);
    let nRequestsBefore = this.requestList.length;
    //let correctnessCheck = (this.requestList.length - this.request_selected.length);

    swal({
      title: this.areYouSure + "?",
      text: this.selectedRequestWillBePermanentDeleted,
      icon: "warning",
      buttons: true,
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.logger.log("swal willDelete", willDelete);
        // loop to delete the selected request

        const promises = [];

        for (let requestId of this.request_selected) {
          this.logger.log("[HISTORY & NORT-CONVS] - Delete request whit ID: ", requestId);
          promises.push(this.wsRequestsService.deleteRequestOnPromise(requestId));
        }

        Promise.all(promises).then((res) => {
          this.logger.log("[HISTORY & NORT-CONVS] - RESULT PROMISE ALL: ", res);
          let deleted = res.length;

          // if all request have been deleted
          if (deleted == this.request_selected.length) {
            this.translate.get('DeleteRequestForever.SelectedRequestsWasSuccessfullyDeleted', { num_conv: deleted }).subscribe((text: string) => {
              this.selectedRequestsWasSuccessfullyDeleted = text;
            })

            swal(this.done_msg, this.selectedRequestsWasSuccessfullyDeleted, {
              icon: "success",
            }).then((okpressed) => {
              this.allChecked = false;
              this.getRequests();
            })
          }

        }).catch((err) => {

          this.logger.error("[HISTORY & NORT-CONVS] Error Promise.all: ", err);

          this.getRequests().then((res) => {

            // if no requests have been deleted
            if (this.requestList.length == nRequestsBefore) {
              swal(this.errorDeleting, this.pleaseTryAgain, {
                icon: "error",
              });
            } else if (this.requestList.length < nRequestsBefore) {

              let deleted = (nRequestsBefore - this.requestList.length);
              let remaining = (this.request_selected.length - deleted);
              this.translate.get('DeleteRequestForever.SelectedRequestsWasPartiallyDeleted', { num_conv: deleted, num_conv_exc: remaining }).subscribe((text: string) => {
                this.selectedRequestsWasSuccessfullyDeleted = text;

                swal(this.done_msg, this.selectedRequestsWasSuccessfullyDeleted, {
                  icon: "warning",
                }).then((okpressed) => {
                  // do something?
                  //this.getRequests();
                })

              })
            }

          }).catch((err) => {
            this.logger.error("[HISTORY & NORT-CONVS] Error getting request.", err)
          })
        })
      } else {
        this.logger.log('[HISTORY & NORT-CONVS] swal willDelete', willDelete)
      }
    })
  }

  goBack() {
    this.location.back();
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  deleteArchivedRequest(request_id) {
    this.logger.log('[HISTORY & NORT-CONVS] - deleteArchivedRequest request_id ', request_id)

    swal({
      title: this.areYouSure + "?",
      text: this.requestWillBePermanentlyDeleted,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          this.logger.log('[HISTORY & NORT-CONVS] swal willDelete', willDelete)

          this.wsRequestsService.deleteRequest(request_id).subscribe((res: any) => {
            this.logger.log('[HISTORY & NORT-CONVS] in swal deleteRequest res ', res)

          }, (error) => {
            this.logger.error('[HISTORY & NORT-CONVS] in swal deleteRequest res - ERROR ', error);

            swal(this.errorDeleting, this.pleaseTryAgain, {
              icon: "error",
            });
          }, () => {
            this.logger.log('[HISTORY & NORT-CONVS] in swal deleteRequest res* COMPLETE *');
            swal(this.done_msg, this.requestWasSuccessfullyDeleted, {
              icon: "success",
            }).then((okpressed) => {
              this.getRequests();
            });

          });
        } else {
          this.logger.log('[HISTORY & NORT-CONVS] swal willDelete', willDelete)
          // swal("Your imaginary file is safe!");
        }
      });
  }

}
