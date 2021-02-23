import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Request } from '../models/request-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import { DepartmentService } from '../services/department.service';
import { trigger, state, style, animate, transition, query, animateChild } from '@angular/animations';
import { LocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { UsersService } from '../services/users.service';
import { FaqKbService } from '../services/faq-kb.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { Subscription } from 'rxjs';
import { ProjectPlanService } from '../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { AppConfigService } from '../services/app-config.service';
import * as moment from 'moment';
// import { RequestsService } from '../services/requests.service';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { UAParser } from 'ua-parser-js';

import { WsSharedComponent } from '../ws_requests/ws-shared/ws-shared.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { Location } from '@angular/common';
import { SelectOptionsTranslatePipe } from '../selectOptionsTranslate.pipe';
import { request } from 'http';

// import swal from 'sweetalert';
// https://github.com/t4t5/sweetalert/issues/890 <- issue ERROR in node_modules/sweetalert/typings/sweetalert.d.ts(4,9): error TS2403

// https://www.npmjs.com/package/sweetalert
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-requests-list-history-new',
  templateUrl: './requests-list-history-new.component.html',
  styleUrls: ['./requests-list-history-new.component.scss'],
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


export class RequestsListHistoryNewComponent extends WsSharedComponent implements OnInit, OnDestroy {

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

  constructor(
    // private requestsService: RequestsService,
    public router: Router,
    public auth: AuthService,
    public usersLocalDbService: LocalDbService,
    public botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    private prjctPlanService: ProjectPlanService,
    private translate: TranslateService,
    public notify: NotifyService,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService,
    public location: Location,
    public selectOptionsTranslatePipe: SelectOptionsTranslatePipe
  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify);
  }

  ngOnInit() {
    this.getCurrentUrlLoadRequests();

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
    this.getStorageBucketAndChatBaseUrl();
    this.getTranslations();
    this.getProjectUserRole();
    this.detectMobile();

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
        // console.log('+ + + DeleteRequestForever', text)
      });

    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSure = text;
        // console.log('+ + + areYouSure', text)
      });

    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();

    this.translateAllConversationsHaveBeenArchived()
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
        // console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // console.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }


  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(request_id: string) {
    this.currentUserID
    this._onJoinHandled(request_id, this.currentUserID);

    this.getRequests();
  }

  openChatInNewWindow(requestid) {
    const url = this.CHAT_BASE_URL + '?recipient=' + requestid;
    window.open(url, '_blank');
  }

  _onJoinHandled(id_request: string, currentUserID: string) {
    // this.getFirebaseToken(() => {
    console.log('%%% Ws-REQUESTS-Msgs - JOIN PRESSED');


    this.wsRequestsService.addParticipant(id_request, currentUserID)
      .subscribe((data: any) => {

        console.log('%%% Ws-REQUESTS-Msgs - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        console.log('%%% Ws-REQUESTS-Msgs - addParticipant TO CHAT GROUP ERROR ', err);

      }, () => {
        console.log('%%% Ws-REQUESTS-Msgs - addParticipant TO CHAT GROUP COMPLETE');

        this.notify.showWidgetStyleUpdateNotification(`You are successfully added to the chat`, 2, 'done');
        this.getRequests();
      });
    // });
  }





  getCurrentUrlLoadRequests() {
    const currentUrl = this.router.url;
    console.log('!!! NEW REQUESTS HISTORY  current_url ', currentUrl);

    if (currentUrl.indexOf('/all-conversations') !== -1) {
      this.IS_HERE_FOR_HISTORY = false;
      console.log('!!! NEW REQUESTS HISTORY  IS_HERE_FOR_HISTORY ', this.IS_HERE_FOR_HISTORY);
      this.requests_status = 'all'
      this.getRequests();

    } else {
      this.IS_HERE_FOR_HISTORY = true;
      console.log('!!! NEW REQUESTS HISTORY  IS_HERE_FOR_HISTORY ', this.IS_HERE_FOR_HISTORY);
      this.operator = '='
      this.requests_status = '1000'
      this.getRequests();
    }
  }

  requestsStatusSelect(request_status) {
    console.log('WsRequests NO-RT - requestsStatusSelect', request_status);
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
    console.log('WsRequests NO-RT - getAllRequests', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getServedRequests() {
    this.operator = '='
    this.requests_status = '200'
    console.log('WsRequests NO-RT - getServedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getUnservedRequests() {
    this.operator = '='
    this.requests_status = '100'
    console.log('WsRequests NO-RT - getUnservedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  /**
   * Nota: la funzione seguente è stata sostituita dalla sua versione promise, quindi non è
   * più usata.
   * Verificare eventuali malfunzionamenti prima di eliminarla definitivamente.
   */
  _getRequests() {
    this.showSpinner = true;
    // this.wsRequestsService.getNodeJsHistoryRequests(this.queryString, this.pageNo).subscribe((requests: any) => {
    this.wsRequestsService.getNodeJsWSRequests(this.operator, this.requests_status, this.queryString, this.pageNo).subscribe((requests: any) => {

      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS ', requests['requests']);
      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', requests['count']);
      if (requests) {

        // this.requestsCount = 18; // for test
        this.requestsCount = requests['count'];
        console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', this.requestsCount);

        this.displayHideFooterPagination();

        const requestsPerPage = requests['perPage'];
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES REQUESTS X PAGE', requestsPerPage);

        const totalPagesNo = this.requestsCount / requestsPerPage;
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES NUMBER', totalPagesNo);

        this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);



        // const firstIndex = requestsPerPage * this.pageNo;
        // console.log('!!! NEW REQUESTS HISTORY - firstIndex ', firstIndex);

        // const lastIndex = requestsPerPage * (this.pageNo + 1) - 1
        // console.log('!!! NEW REQUESTS HISTORY - lastIndex ', lastIndex);

        this.requestList = requests['requests'];

        for (const request of this.requestList) {

          if (request) {
            // console.log('!!! NEW REQUESTS HISTORY - request ', request);

            request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

            // -------------------------------------------------------------------
            // User Agent
            // -------------------------------------------------------------------
            const user_agent_result = this.parseUserAgent(request.userAgent);
            const ua_browser = user_agent_result.browser.name + ' ' + user_agent_result.browser.version
            // console.log('!!! NEW REQUESTS HISTORY  - USER-AGENT BROWSER ', ua_browser)
            request['ua_browser'] = ua_browser;

            const ua_os = user_agent_result.os.name + ' ' + user_agent_result.os.version
            // console.log('!!! NEW REQUESTS HISTORY - USER-AGENT OPERATING SYSTEM ', ua_os)
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
            // .authVar.token.firebase.sign_in_provider
            // console.log('---- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo);

            const date = moment.localeData().longDateFormat(request.createdAt);
            request.fulldate = date;
            // if (this.browserLang === 'it') {
            //   // moment.locale('it')
            //   const date = moment(request.createdAt).format('dddd, DD MMM YYYY - HH:mm:ss');
            //   console.log('!!! NEW REQUESTS HISTORY - createdAt date', date);
            //   request.fulldate = date;
            // } else {
            //   const date = moment(request.createdAt).format('dddd, MMM DD, YYYY - HH:mm:ss');
            //   console.log('!!! NEW REQUESTS HISTORY - createdAt date', date);
            //   request.fulldate = date;
            // }


            if (request.participants.length > 0) {
              console.log('!! Ws SHARED  (from request list history) participants length', request.participants.length);
              if (!request['participanting_Agents']) {

                console.log('!! Ws SHARED  (from request list history) PARTICIPATING-AGENTS IS ', request['participanting_Agents'], ' - RUN DO ');

                request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.storageBucket)

              } else {

                console.log('!! Ws SHARED  (from request list history) PARTICIPATING-AGENTS IS DEFINED');
              }
            } else {
              console.log('!! Ws SHARED  (from request list history) participants length', request.participants.length);
              request['participanting_Agents'] = [{ _id: 'no_agent', email: 'NoAgent', firstname: 'NoAgent', lastname: 'NoAgent' }]
            }

            // if (request.lead
            //   && request.lead.attributes
            //   && request.lead.attributes.senderAuthInfo
            //   && request.lead.attributes.senderAuthInfo.authVar
            //   && request.lead.attributes.senderAuthInfo.authVar.token
            //   && request.lead.attributes.senderAuthInfo.authVar.token.firebase
            //   && request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider
            // ) {
            //   if (request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {

            //     // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
            //     this.REQUESTER_IS_VERIFIED = true;
            //   } else {
            //     // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
            //     this.REQUESTER_IS_VERIFIED = false;
            //   }
            // } else {
            //   this.REQUESTER_IS_VERIFIED = false;
            // }
            // request.requester_is_verified = this.REQUESTER_IS_VERIFIED
          }
        }
      }
    }, error => {
      this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS - ERROR: ', error);
    }, () => {
      this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS * COMPLETE *')
    });
  }


  // GET REQUEST COPY - START
  getRequests() {
    this.showSpinner = true;

    let promise = new Promise((resolve, reject) => {


      this.wsRequestsService.getNodeJsWSRequests(this.operator, this.requests_status, this.queryString, this.pageNo).subscribe((requests: any) => {

        console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS ', requests['requests']);
        console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', requests['count']);
        if (requests) {
          this.requestsCount = requests['count'];
          console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', this.requestsCount);
          this.displayHideFooterPagination();
          const requestsPerPage = requests['perPage'];
          console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES REQUESTS X PAGE', requestsPerPage);
          const totalPagesNo = this.requestsCount / requestsPerPage;
          console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES NUMBER', totalPagesNo);
          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

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
                console.log('!! Ws SHARED  (from request list history) participants length', request.participants.length);
                if (!request['participanting_Agents']) {

                  console.log('!! Ws SHARED  (from request list history) PARTICIPATING-AGENTS IS ', request['participanting_Agents'], ' - RUN DO ');

                  request['participanting_Agents'] = this.doParticipatingAgentsArray(request.participants, request.first_text, this.storageBucket)

                } else {

                  console.log('!! Ws SHARED  (from request list history) PARTICIPATING-AGENTS IS DEFINED');
                }
              } else {
                console.log('!! Ws SHARED  (from request list history) participants length', request.participants.length);
                request['participanting_Agents'] = [{ _id: 'no_agent', email: 'NoAgent', firstname: 'NoAgent', lastname: 'NoAgent' }]
              }
            }
          }
        }
      }, error => {
        this.showSpinner = false;
        console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS - ERROR: ', error);
        reject(error);
      }, () => {
        this.showSpinner = false;
        console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS * COMPLETE *')
        resolve(true);
      });

    }) // promise end
    return promise;
  }
  // GET REQUEST COPY - END


  detectMobile() {
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    console.log('WS-REQUEST-SERVED - IS MOBILE ', this.isMobile);
  }




  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        console.log('!!! NEW REQUESTS HISTORY - USER ROLE ', user_role);
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

  getStorageBucketAndChatBaseUrl() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Requests-List-History-new ', this.storageBucket)

    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (RequestsListHistoryNewComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

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
      if (browserLang === 'it') {
        this.prjct_profile_name = 'Piano ' + planName;
        return this.prjct_profile_name
      } else if (browserLang !== 'it') {
        this.prjct_profile_name = planName + ' Plan';
        return this.prjct_profile_name
      }
    }
  }

  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(requestid) {
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - id request ", requestid);
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";

    // const lessTagsBtn = <HTMLElement>document.querySelector(`#less_tags_btn_for_request_${requestid}`);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - lessTagsBtn ", lessTagsBtn);
    // lessTagsBtn.style.display = "inline-block";
  }

  // --------------------------------------------------
  // @ Tags - display ledd tags
  // --------------------------------------------------
  displayLessTag(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";

    // const lessTagsBtn = <HTMLElement>document.querySelector(`#less_tags_btn_for_request_${requestid}`);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - lessTagsBtn ", lessTagsBtn);
    // lessTagsBtn.style.display = "none";
  }

  openModalSubsExpiredOrGoToPricing() {
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
      this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    }
    if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.router.navigate(['project/' + this.projectId + '/pricing']);
    }
  }


  getAllProjectUsers() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('!!! NEW REQUESTS HISTORY  - GET PROJECT-USERS ', projectUsers);

      if (projectUsers) {
        this.projectUsersArray = projectUsers;
        projectUsers.forEach(user => {
          this.user_and_bot_array.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
        });

        console.log('!!! NEW REQUESTS HISTORY  - !!!! USERS ARRAY ', this.user_and_bot_array);
      }
    }, (error) => {
      console.log('!!! NEW REQUESTS HISTORY - GET PROJECT-USERS ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET PROJECT-USERS * COMPLETE *');
      this.getAllBot();
    });
  }

  getAllBot() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      console.log('!!! NEW REQUESTS HISTORY  - GET  BOT ', bots);

      if (bots) {
        bots.forEach(bot => {
          this.user_and_bot_array.push({ '_id': 'bot_' + bot._id, 'firstname': bot.name + ' (bot)', 'descrip': bot.description });
        });
      }
      console.log('!!! NEW REQUESTS HISTORY  - BOTS & USERS ARRAY ', this.user_and_bot_array);
    }, (error) => {
      console.log('!!! NEW REQUESTS HISTORY - GET  BOT ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET  BOT * COMPLETE *');
    });
  }



  getCurrentUser() {
    const user = this.auth.user_bs.value
    console.log('!!! NEW REQUESTS HISTORY - LOGGED USER ', user);
    if (user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = user._id
      console.log('!!! NEW REQUESTS HISTORY - USER UID ', this.currentUserID);
      // this.getToken();
    } else {
      // console.log('No user is signed in');
    }
  }


  // ------------------------------------------------------------------------------
  // @ Departments - get Departments
  // ------------------------------------------------------------------------------
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments

    }, error => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS * COMPLETE *')
    });
  }

  // ------------------------------------------------------------------------------
  // @ Departments - get selected department name
  // ------------------------------------------------------------------------------
  depSelected(deptid) {
    console.log('!!! NEW REQUESTS HISTORY - selectedDeptId ', this.selectedDeptId);

    const selectedDept = this.departments.filter((dept: any) => {

      return dept._id === deptid;
    });
    console.log('!!! NEW REQUESTS HISTORY - selectedDept ', selectedDept);
    if (selectedDept.length > 0) {

      this.selectedDeptName_temp = selectedDept[0].name
      console.log('!!! NEW REQUESTS HISTORY - selectedDeptName ', this.selectedDeptName);
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

    console.log('!!! NEW REQUESTS HISTORY - selectedAgent ', selectedAgent);
    if (selectedAgent.length > 0) {
      this.selectedAgentFirstname_temp = selectedAgent[0].firstname
      this.selectedAgentLastname_temp = selectedAgent[0].lastname
      console.log('!!! NEW REQUESTS HISTORY - selectedAgentFirstname TEMP ', this.selectedAgentFirstname_temp, ' selectedAgentLastname TEMP: ', this.selectedAgentLastname_temp);
    } else {
      this.selectedAgentId = ''
    }
  }

  fulltextChange($event) {
    console.log('!!! NEW REQUESTS HISTORY - fulltextChange ', $event);
    this.fullText_temp = $event
  }


  // ------------------------------------------------------------------------------
  // @ Date - on change start date get selected start date formatted
  // ------------------------------------------------------------------------------
  startDateSelected($event) {
    console.log('!!! NEW REQUESTS HISTORY - startDateSelected ', $event);
    this.startDateFormatted_temp = $event['formatted'];

    console.log('!!! NEW REQUESTS HISTORY - startDateFormatted TEMP ', this.startDateFormatted_temp);

    // const startDateLessOneDay =  moment($event['jsdate']).subtract(1, 'days').format('DD/MM/YYYY'); 
    const startDateLessOneDay = moment($event['jsdate']).subtract(1, 'days').format('DD/MM/YYYY');

    const startDateLessOneDaySegment = startDateLessOneDay.split('/');

    console.log('!!! NEW REQUESTS HISTORY - startDateLessOneDay ', startDateLessOneDay);
    console.log('!!! NEW REQUESTS HISTORY - startDateLessOneDaySegment ', startDateLessOneDaySegment);


    // this.disableUntilDate = $event.date;
    this.disableUntilDate = { year: startDateLessOneDaySegment[2], month: startDateLessOneDaySegment[1], day: startDateLessOneDaySegment[0] }

    console.log('!!! NEW REQUESTS HISTORY - disableUntilDate ', this.disableUntilDate);

    let copy = this.getCopyOfOptions();

    copy.disableUntil = this.disableUntilDate;

    this.endDatePickerOptions = copy;

    console.log('!!! NEW REQUESTS HISTORY - endDatePickerOptions ', this.endDatePickerOptions);

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
    console.log('!!! NEW REQUESTS HISTORY - endDateSelected ', $event);

    this.endDateFormatted_temp = $event['formatted'];
    console.log('!!! NEW REQUESTS HISTORY - endDateFormatted TEMP', this.endDateFormatted_temp);

    // this.endDatePickerOptions.disableUntil = this.disableUntilDate;

    // let copy = this.getCopyOfOptions();
    // copy.disableUntil = this.disableUntilDate;
    // this.endDatePickerOptions = copy;
    // console.log('!!! NEW REQUESTS HISTORY - endDatePickerOptions ', this.endDatePickerOptions);

    if (!this.endDateFormatted_temp) {
      this.endDate = ''
    }
  }

  getCopyOfOptions(): IMyDpOptions {
    return JSON.parse(JSON.stringify(this.endDatePickerOptions));
  }



  toggle() {
    // this.advancedoptionbtnRef.nativeElement.blur();
    this.showAdvancedSearchOption = !this.showAdvancedSearchOption;
    console.log('!!! NEW REQUESTS HISTORY - TOGGLE DIV ', this.showAdvancedSearchOption);
    this.displayHideFooterPagination();
  }




  // onDateStartChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - START DATE ', event.formatted);
  // }
  // onDateEndChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - END DATE ', event.formatted);
  // }
  // advancedOptions() {
  //   console.log('!!! NEW REQUESTS HISTORY - HAS CLICKED ADAVANCED OPTION');
  //   this.advancedoptionbtnRef.nativeElement.blur();
  // }

  // focusOnFullText() {
  //   console.log('!!! NEW REQUESTS HISTORY - FOCUS ON FULL TEXT');
  //   this.hasFocused = true;
  //   // event.stopPropagation();​
  // }

  searchOnEnterPressed(event: any) {
    console.log('searchOnEnterPressed event', event);

    if (event.key === "Enter") {
      this.search()
    }
  }


  search() {
    this.pageNo = 0

    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED (doesn't works - so is used the below code)
    // this.searchbtnRef.nativeElement.blur();

    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    // const searchTopBtn = <HTMLElement>document.querySelector('.searchTopBtn');
    // console.log('!!! NEW REQUESTS HISTORY - TOP SEARCH BTN ', searchTopBtn)
    // searchTopBtn.blur()

    // if (this.searchbtnbottomRef) {
    //   this.searchbtnbottomRef.nativeElement.blur();
    // }

    if (this.fullText) {

      this.fullTextValue = this.fullText;
      this.fullText_applied_filter = this.fullText_temp;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT TEXT ', this.fullText);
      this.fullTextValue = '';
      this.fullText_applied_filter = null;
    }

    if (this.selectedDeptId) {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID selectedDeptId', this.selectedDeptId);
      this.deptIdValue = this.selectedDeptId;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID ', this.deptIdValue);
      this.selectedDeptName = this.selectedDeptName_temp;
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID ', this.selectedDeptId);
      this.deptIdValue = ''
      this.selectedDeptName = null;
    }

    if (this.startDate) {
      console.log('!!! NEW REQUESTS HISTORY - START DATE ', this.startDate);
      console.log('!!! NEW REQUESTS HISTORY - START DATE - FORMATTED ', this.startDate['formatted']);
      console.log('!!! NEW REQUESTS HISTORY - START DATE - EPOC ', this.startDate['epoc']);
      // console.log('!!! NEW REQUESTS HISTORY - START DATE - GETS TIME ', new Date((this.startDate['jsdate'].getTime())));


      // this.startDateValue = this.startDate['epoc']
      // this.startDateValue = this.startDate['epoc'] * 1000
      this.startDateValue = this.startDate['formatted']

      this.startDateFormatted = this.startDateFormatted_temp;

      // console.log('!!! NEW REQUESTS HISTORY - START DATE - TIMESTAMP ', new Date(this.startDate['formatted']).getTime());
      // this.startDateValue = this.startDate['jsdate'].getTime()
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDateValue);
    } else {
      this.startDateValue = '';
      this.startDateFormatted = null
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDate);
    }

    if (this.endDate) {
      console.log('!!! NEW REQUESTS HISTORY - END DATE ', this.endDate);
      console.log('!!! NEW REQUESTS HISTORY - END DATE - FORMATTED ', this.endDate['formatted']);
      console.log('!!! NEW REQUESTS HISTORY - END DATE - EPOC ', this.endDate['epoc']);

      // this.endDateValue = this.endDate['epoc'];
      // this.endDateValue = this.endDate['epoc'] * 1000;
      this.endDateValue = this.endDate['formatted']
      this.endDateFormatted = this.endDateFormatted_temp;
      // this.endDateValue = this.endDate['jsdate'].getTime()
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDateValue);
    } else {
      this.endDateValue = '';
      this.endDateFormatted = null
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDate)
    }


    if (this.selectedAgentId) {

      this.selectedAgentValue = this.selectedAgentId;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentValue);

      this.selectedAgentFirstname = this.selectedAgentFirstname_temp;
      this.selectedAgentLastname = this.selectedAgentLastname_temp;
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentId);
      this.selectedAgentValue = '';

      this.selectedAgentFirstname = null;
      this.selectedAgentLastname = null;
    }

    // if (this.selectedAgentId) {
    //   this.selectedAgentValue = this.selectedAgentId;
    //   console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentValue);
    // } else {
    //   console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentId);
    //   this.selectedAgentValue = ''

    // }

    if (this.requester_email) {
      this.emailValue = this.requester_email;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR email ', this.emailValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR email ', this.requester_email);
      this.emailValue = ''
    }
    // console.log('!!! NEW REQUESTS HISTORY - DEPT NAME ', this.deptame);


    // if (this.fullText !== undefined && this.deptName !== undefined && this.startDate !== undefined || this.endDate !== undefined) {
    // tslint:disable-next-line:max-line-length
    this.queryString =
      'full_text=' + this.fullTextValue + '&'
      + 'dept_id=' + this.deptIdValue + '&'
      + 'start_date=' + this.startDateValue + '&'
      + 'end_date=' + this.endDateValue + '&'
      + 'participant=' + this.selectedAgentValue + '&'
      + 'requester_email=' + this.emailValue

    console.log('!!! NEW REQUESTS HISTORY - QUERY STRING ', this.queryString);

    // REOPEN THE ADVANCED OPTION DIV IF IT IS CLOSED BUT ONE OF SEARCH FIELDS IN IT CONTAINED ARE VALORIZED
    if (this.showAdvancedSearchOption === false) {
      if (this.selectedDeptId || this.startDate || this.endDate || this.selectedAgentId || this.requester_email) {
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

    this.pageNo = 0
    this.getRequests();

  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    console.log('!!! NEW REQUESTS HISTORY - CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()

    this.fullText = '';
    this.selectedDeptId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedAgentId = '';
    this.requester_email = '';

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

    // tslint:disable-next-line:max-line-length
    this.queryString = 'full_text=' + '&' + 'dept_id=' + '&' + 'start_date=' + '&' + 'end_date=' + '&' + 'participant=' + '&' + 'requester_email=';
    this.pageNo = 0;
    console.log('!!! NEW REQUESTS HISTORY - CLEAR SEARCH fullTextValue ', this.fullTextValue)

    this.getRequests();

  }


  // ------------------------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------------------------
  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('!!! NEW REQUESTS HISTORY - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    console.log('!!! NEW REQUESTS HISTORY - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  displayHideFooterPagination() {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if ((this.showAdvancedSearchOption === true && this.requestsCount >= 10) || (this.requestsCount >= 16)) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      console.log('!!! NEW REQUESTS HISTORY - REQST COUNT ', this.requestsCount, 'ADVANCED OPTION IS OPEN ', this.showAdvancedSearchOption, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      console.log('!!! NEW REQUESTS HISTORY - REQST COUNT ', this.requestsCount, 'ADVANCED OPTION IS OPEN ', this.showAdvancedSearchOption, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }

  exportRequestsToCSV() {
    // tslint:disable-next-line:max-line-length
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.notify.openDataExportNotAvailable()
    } else {
      const exportToCsvBtn = <HTMLElement>document.querySelector('.export-to-csv-btn');
      console.log('!!! NEW REQUESTS HISTORY - EXPORT TO CSV BTN', exportToCsvBtn)
      exportToCsvBtn.blur()

      this.wsRequestsService.downloadNodeJsHistoryRequestsAsCsv(this.queryString, 0).subscribe((requests: any) => {
        if (requests) {
          console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV - RES ', requests);

          // const reqNoLineBreaks = requests.replace(/(\r\n\t|\n|\r\t)/gm, ' ');
          // console.log('!!! DOWNLOAD REQUESTS AS CSV - REQUESTS NO NEW LINE ', reqNoLineBreaks);
          this.downloadFile(requests)
        }
      }, error => {
        console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV - ERROR: ', error);
      }, () => {
        console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *')
      });

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
    console.log('WsRequestsServedComponent goToAgentProfile ', member_id)
    // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }

  // SERVED_BY: add this if not exist -->
  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        console.log('% Ws-REQUESTS-Msgs GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          console.log('% Ws-REQUESTS-Msgs projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        console.log('% Ws-REQUESTS-Msgs GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        console.log('% Ws-REQUESTS-Msgs GET projectUser by USER-ID * COMPLETE *');
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

  // NO more used
  members_replace(member_id) {
    // console.log('!!! NEW REQUESTS HISTORY  - SERVED BY ID ', member_id)
    // console.log(' !!! NEW REQUESTS HISTORY underscore found in the participant id  ', member_id, member_id.includes('bot_'));

    const participantIsBot = member_id.includes('bot_')

    if (participantIsBot === true) {

      const bot_id = member_id.slice(4);
      // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (bot) {

        let botType = "";
        if (bot.type === 'internal') {

          botType = 'native'
        } else {
          botType = bot.type
        }
        // ${botType} 
        return member_id = bot['name'] + ` (bot)`;
      } else {
        return member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)

        if (user['lastname']) {
          const lastnameInizial = user['lastname'].charAt(0);
          // '- ' +
          return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
        }
      } else {
        // '- ' +
        return member_id
      }
    }
  }

  // no more used
  goToMemberProfile(member_id: any) {
    console.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!! NEW REQUESTS HISTORY IS A BOT !');

      const bot_id = member_id.slice(4);
      const bot = this.botLocalDbService.getBotFromStorage(bot_id);

      let botType = ''
      if (bot.type === 'internal') {
        botType = 'native'
      } else {
        botType = bot.type
      }
      // this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
      this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);

    } else {
      // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

      const filteredProjectUser = this.projectUsersArray.filter((obj: any) => {
        return obj.id_user._id === member_id;
      });

      this.router.navigate(['project/' + this.projectId + '/user/edit/' + filteredProjectUser[0]._id]);
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('00 -> NEW REQUEST-LIST HISTORY - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)
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


  // selectAll() {
  //   console.log("*+*+ Starting All Checked Status: ", this.allChecked);
  //   console.log("*+*+ Starting Select all checbok Status: ", this.selectAllCheckbox);
  //   if (this.selectAllCheckbox == false) {
  //     this.selectAllCheckbox = true;
  //     this.allChecked = true;
  //     console.log("*+*+ All Checked Status: ", this.allChecked);
  //     console.log("*+*+ Select all checbok Status: ", this.selectAllCheckbox);

  //     for (let request of this.requestList) {
  //       const index = this.request_selected.indexOf(request.request_id);
  //       if (index > -1) {
  //         console.log("*+*+ Già presente")
  //       } else {
  //         console.log("*+*+ Request Selected: ", request.request_id);
  //         this.request_selected.push(request.request_id);
  //       }
  //     }
  //   } else {
  //     this.request_selected = [];
  //     this.selectAllCheckbox = false;
  //     this.allChecked = false;
  //     console.log("*+*+ All Checked Status: ", this.allChecked);
  //     console.log("*+*+ Select all checbok Status: ", this.selectAllCheckbox);
  //   }
  //   console.log('*+*+ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
  //   console.log('*+*+ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);

  // }

  selectAll(e) {
    
      console.log("**++ Is checked: ", e.target.checked)
      var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
      console.log("**++ Indeterminate: ", checkbox.indeterminate);
   

    if (e.target.checked == true) {
      this.allChecked = true;
      for (let request of this.requestList) {
        const index = this.request_selected.indexOf(request.request_id);
        if (index > -1) {
          console.log("**++ Già presente")
        } else {
          console.log("*+*+ Request Selected: ", request.request_id);
          this.request_selected.push(request.request_id);
        }
      }
      console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
      console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    } else {
      this.allChecked = false;
      this.request_selected = [];
      console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
      console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    }


    // if (checkbox.indeterminate == true) {
    //   console.log("**++ Azzero l'array delle richieste selezionate")
    //   checkbox.indeterminate = false;
    //   this.allChecked = false;
    //   this.request_selected = [];
    //   console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
    //   console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    // } else {
    //   if (e.target.checked == true) {
    //     this.allChecked = true;
    //     for (let request of this.requestList) {
    //       const index = this.request_selected.indexOf(request.request_id);
    //       if (index > -1) {
    //         console.log("**++ Già presente")
    //       } else {
    //         console.log("*+*+ Request Selected: ", request.request_id);
    //         this.request_selected.push(request.request_id);
    //       }
    //     }
    //     console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
    //     console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    //   } else {
    //     this.allChecked = false;
    //     this.request_selected = [];
    //     console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
    //     console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);
    //   }
    // }

  }

  change(requestId) {
    var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
    console.log("**++  Indeterminate: ", checkbox.indeterminate);

    console.log('**++ SELECTED REQUEST ID: ', requestId);
    const index = this.request_selected.indexOf(requestId);
    console.log("**++ INDEX: ", index);

    if (index > -1) {
      this.request_selected.splice(index, 1);
      checkbox.indeterminate = true;
      console.log("**++  Indeterminate: ", checkbox.indeterminate);
      if (this.request_selected.length == 0) {
        checkbox.indeterminate = false;
        console.log("**++ Indeterminate: ", checkbox.indeterminate);
        this.allChecked = false;
      }
    } else {
      this.request_selected.push(requestId);
      checkbox.indeterminate = true;
      console.log("**++  Indeterminate: ", checkbox.indeterminate);
      if (this.request_selected.length == this.requestList.length) {
        checkbox.indeterminate = false;
        console.log("**++  Indeterminate: ", checkbox.indeterminate);
        this.allChecked = true;
      }
    }

    console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
    console.log('**++ REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);

  }

  change2(requestId) {
    console.log('SELECTED REQUEST ID: ', requestId);
    const index = this.request_selected.indexOf(requestId);
    console.log("INDEX: ", index);

    if (index > -1) {
      this.request_selected.splice(index, 1);
      var checkbox = document.getElementById("allCheckbox") as HTMLInputElement;
      checkbox.indeterminate = true;
      console.log("*** CB3: ", checkbox.indeterminate)

      if (this.request_selected.length == 0) {
        this.allChecked = false;
        checkbox.indeterminate = false;
      }

    } else {
      this.request_selected.push(requestId);
      var checkbox = document.getElementById("allCheckbox") as HTMLInputElement;
      checkbox.indeterminate = true;
      console.log("*** CB2: ", checkbox.indeterminate)
      if (this.request_selected.length == this.requestList.length) {
        this.allChecked = true;
        checkbox.indeterminate = false;
      }
    }

    console.log('REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST ', this.request_selected);
    console.log('REQUEST-LIST-HISTORY-NEW - ARRAY OF SELECTED REQUEST lenght ', this.request_selected.length);

  }



  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('REQUEST-LIST-HISTORY-NEW - HAS CLICKED ARCHIVE REQUEST request_id ', request_id);


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        console.log('REQUEST-LIST-HISTORY-NEW - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        console.log('REQUEST-LIST-HISTORY-NEW - CLOSE SUPPORT GROUP - ERROR ', err);


        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        console.log('REQUEST-LIST-HISTORY-NEW  +- CLOSE SUPPORT GROUP - COMPLETE');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

        // this.onArchiveRequestCompleted()

        this.getRequests();
      });
  }


  archiveSelected() {

    console.log("REQUEST-LIST-HISTORY-NEW - ARRAY OF ARCHIVE SELECTED: ", this.request_selected);
    console.log("REQUEST-LIST-HISTORY-NEW - ARRAY OF ARCHIVE SELECTED INITILA LENGHT : ", this.request_selected.length);
    let count = 0;
    const promises = [];

    this.request_selected.forEach((requestid, index) => {
      promises.push(this.wsRequestsService.archiveRequestOnPromise(requestid)
        .then((res) => {

          console.log("REQUEST-LIST-HISTORY-NEW - then res : ", res);

          console.log("REQUEST-LIST-HISTORY-NEW - then res _body : ", JSON.parse(res['_body']));
          // console.log("REQUEST-LIST-HISTORY-NEW - ARRAY OF ARCHIVE SELECTED: ", this.request_selected);

          // this.request_selected.forEach(el => {
          //   if (requestid === el.request_id ) {

          //   }

          // });
          count = index + 1;
          console.log("REQUEST-LIST-HISTORY-NEW - count: ", count)
          this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg + count + '/' + this.request_selected.length);

        }).catch((error) => {

          console.log('REQUEST-LIST-HISTORY-NEW PROMISE ERROR: ', error);
        })
      );
    });

    Promise.all(promises).then((res) => {
      console.log("REQUEST-LIST-HISTORY-NEW - ALL PROMISE RESOLVED", res);
      this.notify.showAllRequestHaveBeenArchivedNotification(this.allConversationsaveBeenArchivedMsg)
      this.allChecked = false;
      this.getRequests();
    });
  }


  deleteSelected() {
    console.log("REQUEST-LIST-HISTORY-NEW - REQUESTS TO DELETE: ", this.request_selected);
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
        console.log("swal willDelete", willDelete);
        // loop to delete the selected request

        const promises = [];

        for (let requestId of this.request_selected) {
          console.log("Delete request whit ID: ", requestId);
          promises.push(this.wsRequestsService.deleteRequestOnPromise(requestId));
        }

        Promise.all(promises).then((res) => {
          console.log("RESULT PROMISE ALL: ", res);
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

          console.log("Error Promise.all: ", err);

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
            console.log("Error getting request.")
          })


        })

      } else {
        console.log('swal willDelete', willDelete)
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
    console.log('NEW REQUEST-LIST HISTORY - deleteArchivedRequest request_id ', request_id)

    swal({
      title: this.areYouSure + "?",
      text: this.requestWillBePermanentlyDeleted,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          console.log('swal willDelete', willDelete)

          this.wsRequestsService.deleteRequest(request_id).subscribe((res: any) => {
            console.log('in swal deleteRequest res ', res)

          }, (error) => {
            console.log('in swal deleteRequest res - ERROR ', error);

            swal(this.errorDeleting, this.pleaseTryAgain, {
              icon: "error",
            });


          }, () => {
            console.log('in swal deleteRequest res* COMPLETE *');



            swal(this.done_msg, this.requestWasSuccessfullyDeleted, {
              icon: "success",
            }).then((okpressed) => {
              this.getRequests();
            });

          });
        } else {
          console.log('swal willDelete', willDelete)
          // swal("Your imaginary file is safe!");
        }
      });
  }

}
