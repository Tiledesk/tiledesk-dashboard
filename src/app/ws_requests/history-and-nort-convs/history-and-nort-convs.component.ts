import { CHANNELS_NAME } from './../../utils/util';
import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Request } from '../../models/request-model';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
// import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import { DepartmentService } from '../../services/department.service';
import { trigger, state, style, animate, transition, query, animateChild } from '@angular/animations';
import { LocalDbService } from '../../services/users-local-db.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { APP_SUMO_PLAN_NAME, avatarPlaceholder, CHANNELS, getColorBck, goToCDSVersion, PLAN_NAME } from '../../utils/util';
import { Subscription } from 'rxjs';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../../core/notify.service';
import { AppConfigService } from '../../services/app-config.service';
// import * as moment from 'moment';
import moment from "moment";
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { UAParser } from 'ua-parser-js';
import { WsSharedComponent } from '../../ws_requests/ws-shared/ws-shared.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { Location } from '@angular/common';
import { SelectOptionsTranslatePipe } from '../../selectOptionsTranslate.pipe';
import { TagsService } from '../../services/tags.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ProjectService } from 'app/services/project.service';
import { WsMsgsService } from 'app/services/websocket/ws-msgs.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { BrandService } from 'app/services/brand.service';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};
// import swal from 'sweetalert';
// https://github.com/t4t5/sweetalert/issues/890 <- issue ERROR in node_modules/sweetalert/typings/sweetalert.d.ts(4,9): error TS2403

// https://www.npmjs.com/package/sweetalert
const swal = require('sweetalert');
const Swal = require('sweetalert2')

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
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})


export class HistoryAndNortConvsComponent extends WsSharedComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  private unsubscribe$: Subject<any> = new Subject<any>();

  // @ViewChild('advancedoptionbtn') private advancedoptionbtnRef: ElementRef;
  // @ViewChild('searchbtn') private searchbtnRef: ElementRef;
  @ViewChild('searchbtnbottom', { static: false }) private searchbtnbottomRef?: ElementRef;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  requestList: Request[];
  projectId: string;
  showSpinner: boolean;
  startDate: any;
  startDateDefaultValue: any;

  startDateFormatted: string;
  startDateFormatted_temp: string;

  endDate: any;
  endDateDefaultValue: any;
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
  preflight: boolean;
  _preflight: boolean;
  preflightValue: boolean;

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
  loadingTags: boolean;
  selecteTagName: string;
  selecteTagNameValue: string;
  selecteTagColor: string; // used in applied filter
  selecteTagColor_temp: string; // used in applied filter
  selecteTagName_temp: string;  // used in applied filter

  conversation_type: any = 'all';
  // conversation_type: any;
  conversationTypeValue: string;  // used in applied filter

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
  USER_ROLE: string;
  IS_HERE_FOR_HISTORY: boolean;

  request_selected = [];
  allChecked = false;
  selectAllCheckbox = false;
  indeterminateStatus = true;
  showIndeterminate = false;
  has_searched = false;
  has_searched_from_left_filter = false;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;


  joinToChatMsg: string;
  youAreAboutToJoinMsg: string;
  cancelMsg: string;
  warningMsg: string;
  conversationsCannotBeReopened: string;
  // public myDatePickerOptions: IMyDpOptions = {
  //   // other options...
  //   dateFormat: 'dd/mm/yyyy',
  //   // dateFormat: 'yyyy, mm , dd',
  // };


  // public endDatePickerOptions: IMyDpOptions = {
  //   // other options...
  //   dateFormat: 'dd/mm/yyyy',
  //   disableUntil: { year: 0, month: 0, day: 0 },
  //   // dateFormat: 'yyyy, mm , dd',
  // };


  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  imageStorage: string;

  isMobile: boolean;

  operator: string;
  requests_status: any;
  requests_statuses: any;
  requests_status_temp: string;
  selectedDeptName: string;
  selectedDeptName_temp: string;
  selectedAgentFirstname: string;
  selectedAgentLastname: string;
  selectedAgentFirstname_temp: string;
  selectedAgentLastname_temp: string;

  disableUntilDate: any;


  // duration_in_table_test: any

  status = [
    { id: '100', name: 'Unserved' },
    { id: '200', name: 'Served' },
    { id: '150', name: 'Abandoned' },
    { id: 'all', name: 'All' },
  ];

  statusInHistory = [
    { id: '1000', name: 'Closed' },
    { id: '100', name: 'Unserved' },
    { id: '200', name: 'Served' }
  ];

  // { id: '50', name: 'Temporary' }

  conversationType = [
    { id: 'all', name: 'All' },
    ...CHANNELS
  ];



  CHANNELS_NAME = CHANNELS_NAME;

  request_duration_operator_array = [
    { id: '0', name: '>=' },
    { id: '1', name: '<=' }
  ]

  duration: any;
  duration_operator_temp
  duration_op: any;
  duration_in_table: any


  caller_phone: string;
  called_phone: string;
  call_id: string;

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
  overridePay: boolean;
  public_Key: any;
  current_selected_prjct: any;
  isChromeVerGreaterThan100: boolean;
  SEARCH_FOR_TICKET_ID: boolean = false;
  queryParams: any;
  allDeptsLabel: string;
  qs_tags_value: string;
  qs_teammate_id: string;
  qs_dept_id: string;
  requests_status_selected_from_left_filter: string;
  requests_status_selected_from_advanced_option: string;
  youCannotJoinChat: string;
  joinChatTitle: string;

  upgradePlan: string;
  cancel: string;
  featureAvailableFromBPlan: string;
  featureAvailableFromEPlan: string;

  appSumoProfile: string;
  appSumoProfilefeatureAvailableFromBPlan: string;
  botLogo: string;
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
    public logger: LoggerService,
    private projectService: ProjectService,
    private wsMsgsService: WsMsgsService,
    public route: ActivatedRoute,
    public brandService: BrandService,
  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);

    const brand = brandService.getBrand();
    this.botLogo = brand['BASE_LOGO_NO_TEXT']
    this.duration_operator_temp = this.request_duration_operator_array[0]['id']
    this.duration_op = 'gt'

    this.logger.log('[HISTORY & NORT-CONVS] duration_op (on init)', this.duration_op)

  }

  ngOnInit() {
    this.getOSCODE();
    this.getTag();
    this.getCurrentUrlLoadRequests();
    this.getImageStorageAndChatBaseUrl();
    // selectedDeptId is assigned to empty so in the template will be selected the custom option ALL DEPARTMENTS
    this.selectedDeptId = '';
    // selectedAgentId is assigned to empty so in the template will be selected the custom option ALL AGENTS
    this.selectedAgentId = '';
    this.getCurrentUser();

    this.getCurrentProject();
    this.getDepartments();
    this.getAllProjectUsers();
    this.getProjectPlan();
    this.getBrowserLang();
    // this.createBotsAndUsersArray();

    this.getTranslations();
    this.getProjectUserRole();
    this.detectMobile();

    this.getFirebaseAuth();
    this.getBrowserVersion()

    this.getQueryParams();

    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  fullText_applied_filter', this.fullText_applied_filter);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  startDateFormatted', this.startDateFormatted);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  selectedAgentFirstname', this.selectedAgentFirstname);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  selectedDeptName', this.selectedDeptName);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  requests_status', this.requests_status);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  selecteTagColor', this.selecteTagColor);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  conversation_type', this.conversation_type);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  conversationTypeValue', this.conversationTypeValue);
    // this.logger.log('[HISTORY & NORT-CONVS]  ngOnInit  has_searched', this.has_searched);

  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[HISTORY & NORT-CONVS] - USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role
          this.manageStatusInHistoryForAgentAndExpiredPlan(this.USER_ROLE)
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

  manageStatusInHistoryForAgentAndExpiredPlan(USER_ROLE) {
    this.logger.log('[HISTORY & NORT-CONVS] manageStatusInHistoryForAgentAndExpiredPlan statusInHistory', this.statusInHistory)
    if (USER_ROLE === 'agent') {
      let unservedIndex = this.statusInHistory.findIndex(x => x.id === '100');
      this.logger.log('[HISTORY & NORT-CONVS] manageStatusInHistoryForAgentAndExpiredPlan unservedIndex', unservedIndex)
      this.statusInHistory.splice(unservedIndex, 1)
      let servedIndex = this.statusInHistory.findIndex(x => x.id === '200');
      this.logger.log('[HISTORY & NORT-CONVS] manageStatusInHistoryForAgentAndExpiredPlan servedIndex', servedIndex)
      this.statusInHistory.splice(servedIndex, 1)
      this.statusInHistory = this.statusInHistory.slice(0)
    }

  }

  getQueryParams() {
    this.route.queryParamMap
      .subscribe(params => {
        this.logger.log('[HISTORY & NORT-CONVS]  queryParams', params['params']);
        this.queryParams = params['params']
        // this.logger.log('[HISTORY & NORT-CONVS]  this.queryParams', this.queryParams);

        // WHEN THE NORT LIST IS FILTERRD BY THE LEFT FILTER 
        if (this.queryParams && this.queryParams.leftfilter) {
          // this.logger.log('[HISTORY & NORT-CONVS]  queryParams WHEN THE NORT LIST IS FILTERRD BY THE LEFT FILTER leftfilter:', this.queryParams.leftfilter);
          if (this.queryParams.leftfilter === '100') {
            this.requests_status = '100'
            this.requestsStatusSelect(this.requests_status)
          }

          if (this.queryParams.leftfilter === '200') {
            this.requests_status = '200'
            this.requestsStatusSelect(this.requests_status)
          }

          if (this.queryParams.leftfilter === '150') {
            this.requests_status = '150'
            this.requestsStatusSelect(this.requests_status)
          }
        }

        if (this.queryParams && this.queryParams.qs) {
          const qsString = JSON.parse(this.queryParams.qs)
          this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString:', qsString);
          const searchedForArray = qsString.split('&');
          this.logger.log('[HISTORY & NORT-CONVS] - QUERY STRING FROM SUBSCRIPTION searchedForArray: ', searchedForArray)
          searchedForArray.forEach(param => {
            const paramArray = param.split('=');
            this.logger.log('paramArray[0] ', paramArray[0], '- paramArray[1]: ', paramArray[1])

            if (paramArray[0] === 'ticket_id' && paramArray[1] !== '') {
              const ticket_id_value = paramArray[1]
              // this.logger.log('[HISTORY & NORT-CONVS]  queryParams ticket_id value', ticket_id_value)
              if (ticket_id_value) {
                this.fullText = '#' + ticket_id_value;
                // this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > this.fullText:', this.fullText)
                this.fullText_temp = this.fullText
              }
            }

            if (paramArray[0] === 'full_text' && paramArray[1] !== '') {
              const full_text_value = paramArray[1]
              // this.logger.log('[HISTORY & NORT-CONVS]  queryParams full_text value', full_text_value)
              if (full_text_value) {
                this.fullText = full_text_value;
                // this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > this.fullText:', this.fullText)
                this.fullText_temp = this.fullText;
              }
            }

            if (paramArray[0] === 'dept_id' && paramArray[1] !== '') {
              this.qs_dept_id = paramArray[1]
              // this.logger.log('[HISTORY & NORT-CONVS]  queryParams qs_dept_id ', this.qs_dept_id)
              if (this.qs_dept_id) {
                this.selectedDeptId = this.qs_dept_id;
                this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > selectedDeptId:', this.selectedDeptId)

              }
            }

            if (paramArray[0] === 'start_date' && paramArray[1] !== '') {
              const start_date_value = paramArray[1]
              this.logger.log('[HISTORY & NORT-CONVS] queryParams start_date_value ', start_date_value)
              if (start_date_value) {
                // this.startDate = {}
                this.startDate = start_date_value;
                this.startDateFormatted_temp = this.startDate
                this.start_date_is_null = false;

                const start_date_value_segment = start_date_value.split('/')
                this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > start_date_value_segment:', start_date_value_segment)

                this.startDateDefaultValue = new Date(start_date_value_segment[1] + '/' + start_date_value_segment[0] + '/' + start_date_value_segment[2])
                this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > startDateDefaultValue:', this.startDateDefaultValue)
              }
            }


            if (paramArray[0] === 'end_date' && paramArray[1] !== '') {
              const end_date = paramArray[1]
              this.logger.log('[HISTORY & NORT-CONVS] queryParams end_date', end_date)
              if (end_date) {
                // this.endDate = {}
                this.endDate = end_date;
                this.endDateFormatted_temp = this.endDate
                this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > endDate:', this.endDate)
                const end_date_segment = end_date.split('/')
                this.logger.log('[HISTORY & NORT-CONVS] queryParams qsString > _enddate', end_date_segment)
                this.endDateDefaultValue = new Date(end_date_segment[1] + '/' + end_date_segment[0] + '/' + end_date_segment[2])
                this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > endDateDefaultValue:', this.endDateDefaultValue)
              }
            }

            if (paramArray[0] === 'channel' && paramArray[1] !== '') {
              const channel_value = paramArray[1]
              this.logger.log('[HISTORY & NORT-CONVS] queryParams channel value ', channel_value)
              if (channel_value) {
                this.conversation_type = channel_value
                this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > conversation_type:', this.conversation_type)
              }
            }

            if (paramArray[0] === 'participant' && paramArray[1] !== '') {
              this.qs_teammate_id = paramArray[1]
              this.logger.log('[HISTORY & NORT-CONVS] queryParams qs_teammate_id  ', this.qs_teammate_id)
              if (this.qs_teammate_id) {
                this.selectedAgentId = this.qs_teammate_id
                // this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > selectedAgentId:', this.selectedAgentId)
                // this.logger.log('[HISTORY & NORT-CONVS]  queryParams qsString > user_and_bot_array:', this.user_and_bot_array)

              }
            }

            if (paramArray[0] === 'tags' && paramArray[1] !== '') {
              this.qs_tags_value = paramArray[1]
              // this.logger.log('[HISTORY & NORT-CONVS] queryParams qs_tags_value ', this.qs_tags_value)
              // this.logger.log('[HISTORY & NORT-CONVS] queryParams this.tags_array ', this.tags_array)

              this.selecteTagName = this.qs_tags_value;
              this.selecteTagNameValue = this.selecteTagName

            }

            if (paramArray[0] === 'duration' && paramArray[1] !== '') {
              this.duration = paramArray[1]

            }

            if (paramArray[0] === 'duration_op' && paramArray[1] !== '') {
              this.duration_op = paramArray[1]
            }

            if (paramArray[0] === 'caller' && paramArray[1] !== '') {
              this.caller_phone = paramArray[1]
            }

            if (paramArray[0] === 'called' && paramArray[1] !== '') {
              this.called_phone = paramArray[1]
            }

            if (paramArray[0] === 'call_id' && paramArray[1] !== '') {
              this.call_id = paramArray[1]
            }


            if (paramArray[0] === 'rstatus' && paramArray[1] !== '') {
              const requetStatusValue = paramArray[1]
              this.logger.log('[HISTORY & NORT-CONVS] queryParams requetStatusValue ', requetStatusValue)
              this.logger.log("[HISTORY & NORT-CONVS] queryParams requetStatusValue includes(',')", requetStatusValue.includes(','))

              if (!requetStatusValue.includes(',') && requetStatusValue !== '1000') {
                this.requests_status_selected_from_advanced_option = null
                if (requetStatusValue === 'all') {

                  this.requests_status = 'all'
                  this.requests_status_selected_from_advanced_option = 'all'
                } else if (requetStatusValue === '100') {
                  this.operator = '='
                  this.requests_status = '100'
                  this.requests_status_selected_from_advanced_option = '100'
                } else if (requetStatusValue === '200') {
                  this.operator = '='
                  this.requests_status_selected_from_advanced_option = '200'
                  this.requests_status = '200'
                }
                // else if (requetStatusValue === '1000') {
                //   this.operator = '='
                //   this.requests_status_selected_from_advanced_option = '1000'
                //   this.requests_status = '1000'
                // }
              } else {
                this.logger.log('[HISTORY & NORT-CONVS] queryParams requetStatusValue 2 requetStatusValue >', requetStatusValue)
                if (requetStatusValue !== '1000') {

                  this.operator = '='
                  this.requests_status_selected_from_advanced_option = requetStatusValue
                  this.requests_status = requetStatusValue
                  const requetStatusValueArray = requetStatusValue.split(',')
                  this.logger.log('[HISTORY & NORT-CONVS] queryParams requetStatusValueArray ', requetStatusValueArray)
                  this.requests_statuses = requetStatusValueArray

                } else if (requetStatusValue === '1000') {
                  this.operator = '='
                  this.requests_statuses = ['1000']
                  this.requests_status = '1000'
                  this.requests_status_selected_from_advanced_option = '1000'
                }
              }

              // if () 

            }
          });

        }
        // || this.requests_status !== 'all'
        if (this.fullText || this.selectedDeptId || this.startDate || this.endDate || (this.conversation_type && this.conversation_type !== 'all') || this.selectedAgentId || this.selecteTagName || this.requests_status_selected_from_advanced_option) {
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search fullText ', this.fullText)
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search selectedDeptId ', this.selectedDeptId)
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search startDate ', this.startDate)
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search endDate ', this.endDate)
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search conversation_type ', this.conversation_type)
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search selectedAgentId ', this.selectedAgentId)
          // this.logger.log('[HISTORY & NORT-CONVS] queryParams call search selecteTagName ', this.selecteTagName)
          this.search();
        }

      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[HISTORY & NORT-CONVS] - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)
      if (project) {
        this.projectId = project._id;
        this.findCurrentProjectAmongAll(this.projectId)
      }
    });
  }

  findCurrentProjectAmongAll(projectId: string) {

    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - projects ', projects);
      // const current_selected_prjct = projects.filter(prj => prj.id_project.id === projectId);
      // this.logger.log('[SIDEBAR] - GET PROJECTS - current_selected_prjct ', current_selected_prjct);

      this.current_selected_prjct = projects.find(prj => prj.id_project.id === projectId);
      this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct ', this.current_selected_prjct);
      if (this.current_selected_prjct.id_project.profile) {
        const projectProfile = this.current_selected_prjct.id_project.profile
        //  this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct > projectProfile ', projectProfile);
        //  this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct > conversationType ', this.conversationType);
        // && projectProfile.customization.voice && projectProfile.customization.voice === true
        if (projectProfile && projectProfile.customization) {

          this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct > projectProfile.customization.voice ', projectProfile.customization.voice);
          if (projectProfile.customization.voice && projectProfile.customization.voice === true) {
            let voice_twilio_index = this.conversationType.findIndex(x => x['id'] === CHANNELS_NAME.VOICE_TWILIO);
            this.conversationType.splice(voice_twilio_index, 1);
          } 
          else if (projectProfile.customization['voice-twilio'] && projectProfile.customization['voice-twilio'] === true) {
            let voice_vxml_index = this.conversationType.findIndex(x => x['id'] === CHANNELS_NAME.VOICE_VXML);
            this.conversationType.splice(voice_vxml_index, 1);
          }



          //   let voice_vxml_index = this.conversationType.findIndex(x => x['id'] === CHANNELS_NAME.VOICE_VXML);
          //   this.conversationType.splice(voice_vxml_index, 1);
          // } else {
          // let voice_twilio_index = this.conversationType.findIndex(x => x['id'] === CHANNELS_NAME.VOICE_TWILIO);
          // this.conversationType.splice(voice_twilio_index, 1);
          // }



        } else {
          this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct > projectProfile.customization ', projectProfile.customization);
          this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - conversationType ', this.conversationType);
          let voice_vxml_index = this.conversationType.findIndex(x => x['id'] === CHANNELS_NAME.VOICE_VXML);
          let voice_twilio_index = this.conversationType.findIndex(x => x['id'] === CHANNELS_NAME.VOICE_TWILIO);
          this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct > CHANNELS_NAME.VOICE_VXML ++++ 1 index', voice_vxml_index);
          this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - current_selected_prjct > CHANNELS_NAME.VOICE_TWILIO ++++ 1 index', voice_twilio_index);
          this.conversationType.splice(voice_vxml_index, 1);
          this.conversationType.splice(voice_twilio_index, 1);
        }

      }

      this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS - projects ', projects);
    }, error => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET PROJECTS - ERROR: ', error);
    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECTS * COMPLETE * ');
    });
  }

  getCurrentUrlLoadRequests() {
    const currentUrl = this.router.url;
    // this.logger.log('[HISTORY & NORT-CONVS] current_url ', currentUrl);

    if (currentUrl.indexOf('/all-conversations') !== -1) {
      this.IS_HERE_FOR_HISTORY = false;
      // this.logger.log('[HISTORY & NORT-CONVS] - IS_HERE_FOR_HISTORY ? ', this.IS_HERE_FOR_HISTORY);
      this.requests_status = 'all'
      if (currentUrl.indexOf('?') === -1) {
        this._preflight = false;
        // this.logger.log('[HISTORY & NORT-CONVS] - >>>>> getCurrentUrlLoadRequests ');
        this.getRequests();
      }

    } else {
      this.IS_HERE_FOR_HISTORY = true;
      // this.logger.log('[HISTORY & NORT-CONVS] - IS_HERE_FOR_HISTORY ? ', this.IS_HERE_FOR_HISTORY);
      this.operator = '='
      this.requests_status_temp = '1000'
      this.requests_status = '1000'
      this.requests_statuses = ['1000']
      // this.requests_status_temp === '1000'
      this._preflight = true;
      // this.preflight = true;
      // this.queryString = 'preflight=' + true

      if (currentUrl.indexOf('?') === -1) {
        // this.logger.log('[HISTORY & NORT-CONVS] - >>>>> getCurrentUrlLoadRequests ');
        this.getRequests();

      }
    }
  }

  goToRequestMsgs(request_recipient: string) {
    // this.logger.log('HERE IN goToRequestMsgs this.requests_status_selected_from_left_filter', this.requests_status_selected_from_left_filter)

    this.logger.log('goToRequestMsgs - has_searched', this.has_searched)
    this.logger.log('goToRequestMsgs - queryString', this.queryString)


    if (this.IS_HERE_FOR_HISTORY) {


      if (this.has_searched === true) {
        this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/2/' + '/messages'], { queryParams: { qs: JSON.stringify(this.queryString) } })
      } else if (this.has_searched === false) {
        this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/2/' + '/messages'])
      }
    }
    else {
      this.logger.log('showAdvancedSearchOption goToRequestMsgs', this.showAdvancedSearchOption)

      if (this.has_searched === true) {
        this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/3/' + '/messages'], { queryParams: { qs: JSON.stringify(this.queryString) } })
      } else if (this.has_searched === false) {
        this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/3/' + '/messages'])
      }

      // this.logger.log('goToRequestMsgs requests_status_selected_from_left_filter ', this.requests_status_selected_from_left_filter)
      // this.logger.log('goToRequestMsgs requests_status_selected_from_advanced_option ', this.requests_status_selected_from_advanced_option)
      if (this.requests_status_selected_from_left_filter && !this.requests_status_selected_from_advanced_option) {
        if (this.requests_status_selected_from_left_filter === '100' || this.requests_status_selected_from_left_filter === '200') {
          this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_recipient + '/3/' + '/messages'], { queryParams: { leftfilter: this.requests_status_selected_from_left_filter } })
        }
      }
    }
  }

  goBackToMonitorPage() {
    // this.location.back();
    this.router.navigate(['project/' + this.projectId + '/wsrequests'])
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();

    // if (this.requestList.length > 0) {
    //   this.requestList.forEach(request => {
    //     this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges request id', request.request_id)
    //     this.subscribeToWs_MsgsByRequestId(request, request.request_id)
    //     this.unsuscribeRequestById(request.request_id);
    //     this.unsuscribeMessages(request.request_id);
    //   });
    // }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");

    keys.forEach(key => {

      if (key.includes("PAY")) {
        this.logger.log('[HISTORY & NORT-CONVS] PUBLIC-KEY - key', key);
        let pay = key.split(":");

        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[HISTORY & NORT-CONVS] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[HISTORY & NORT-CONVS] - pay isVisible', this.payIsVisible);
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
    });

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      this.logger.log('[HISTORY & NORT-CONVS] - pay isVisible', this.payIsVisible);
    }

    if (!this.public_Key.includes("OVP")) {
      this.overridePay = false;
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

    this.translate.get('Pricing.UpgradePlan')
      .subscribe((translation: any) => {
        this.upgradePlan = translation;
      });

    this.translate.get('Cancel')
      .subscribe((translation: any) => {
        this.cancel = translation;
      });

    this.translate.get('AvailableFromThePlan', { plan_name: PLAN_NAME.B })
      .subscribe((translation: any) => {
        this.featureAvailableFromBPlan = translation;
      });

    this.translate.get('AvailableFromThePlans', { plan_name_1: PLAN_NAME.E, plan_name_2: PLAN_NAME.EE })
      .subscribe((translation: any) => {
        this.featureAvailableFromEPlan = translation;
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
    this.translateWarningMsg();
    this.translateConversationsCannotBeReopened();
    this.translaAllDepts();
    this.translateModalYouCannotJoinChat();
  }
  translaAllDepts() {
    this.translate.get('HistoryPage.AllDepts').subscribe((text: string) => {
      this.allDeptsLabel = text;
      // this.logger.log('+ + + allDeptsLabel', this.allDeptsLabel)
    });
  }

  translateWarningMsg() {
    this.translate.get('Warning').subscribe((text: string) => {
      this.warningMsg = text;
      // this.logger.log('+ + + warningMsg', text)
    });
  }
  translateConversationsCannotBeReopened() {
    this.translate.get('ConversationsArchivedCannotBeReopened').subscribe((text: string) => {
      this.conversationsCannotBeReopened = text;
      // this.logger.log('+ + + warningMsg', text)
    });
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

  translateModalYouCannotJoinChat() {
    this.translate.get('YouCannotJoinChat')
      .subscribe((text: string) => {
        this.youCannotJoinChat = text
      })

    this.translate.get('RequestMsgsPage.Enter').subscribe((text: string) => {
      this.joinChatTitle = text;
    });
  }


  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(request, request_id: string) {

    // this._onJoinHandled(request_id, this.currentUserID, request);
    //  this.logger.log('[HISTORY & NORT-CONVS] joinRequest request', request)
    //  this.logger.log('[HISTORY & NORT-CONVS] joinRequest request.participanting_Agents', request.participanting_Agents)

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
        if (request.channel.name === 'email' || request.channel.name === 'form') {
          if (request.participanting_Agents.length === 1) {
            this.presentModalYouCannotJoinChat()
          } else if (request.participanting_Agents.length === 0) {
            this.displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id, request);
          }
        } else if (request.channel.name !== 'email' || request.channel.name !== 'form' || request.channel.name === 'telegram' || request.channel.name === 'whatsapp' || request.channel.name === 'messenger' || request.channel.name === 'chat21') {
          this.displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id, request);
        }
      }
    }
  }

  presentModalYouCannotJoinChat() {
    swal({
      title: this.joinChatTitle,
      text: this.youCannotJoinChat,
      icon: "info",
      buttons: 'OK',
      dangerMode: false,
    })
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

      });
    // });
  }

  openChatAtSelectedConversation(requestid: string, requester_fullanme: string) {
    localStorage.setItem('last_project', JSON.stringify(this.current_selected_prjct))
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

  requestsStatusSelect(request_status) {
    const currentUrl = this.router.url;
    // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - requestsStatusSelect', request_status);
    if (request_status === '200') {
      this.requests_status_selected_from_left_filter = '200'
      this.requests_status_selected_from_advanced_option = null

      // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - requestsStatusSelect requests_status_selected_from_left_filter', this.requests_status_selected_from_left_filter);
      this.getServedRequests();

    } else if (request_status === '100') {
      this.requests_status_selected_from_left_filter = '100'
      this.requests_status_selected_from_advanced_option = null
      // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - requestsStatusSelect requests_status_selected_from_left_filter', this.requests_status_selected_from_left_filter);
      this.getUnservedRequests();

    } else if (request_status === '150') {
      this.requests_status_selected_from_left_filter = '150'
      this.requests_status_selected_from_advanced_option = null
      // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - requestsStatusSelect requests_status_selected_from_left_filter', this.requests_status_selected_from_left_filter);
      this.getAbandonedRequests();

    } else if (request_status === 'all') {
      this.requests_status_selected_from_left_filter = 'all'
      // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - requestsStatusSelect requests_status_selected_from_left_filter', this.requests_status_selected_from_left_filter);

      // this.logger.log('[HISTORY & NORT-CONVS] requestsStatusSelect  currentUrl', currentUrl);

      if (currentUrl.indexOf('?') !== -1) {
        // this.logger.log('[HISTORY & NORT-CONVS] requestsStatusSelect  currentUrl has query string');
        this.router.navigate(['project/' + this.projectId + '/' + 'all-conversations']);
      }

      this.getAllRequests();
    }
  }


  onChangePreflight($event) {
    // this.logger.log('[HISTORY & NORT-CONVS] - onChangePreflight - checked', $event.target.checked);
    this.preflight = $event.target.checked
    if ($event.target.checked === true) {
      this._preflight = true
      // this.logger.log('[HISTORY & NORT-CONVS] - onChangePreflight - this._preflight', this._preflight);
    } else {
      this._preflight = false
      // this.logger.log('[HISTORY & NORT-CONVS] - onChangePreflight - this._preflight', this._preflight);
    }
  }

  requestsStatusSelectFromAdvancedOption(request_status) {

    // this.logger.log('[HISTORY & NORT-CONVS] - requestsStatusSelectFromAdvancedOption', this.showAdvancedSearchOption);
    // this.logger.log('[HISTORY & NORT-CONVS] - requestsStatusSelectFromAdvancedOption', request_status);


    if (request_status === 'all') {
      this.requests_status = 'all'
      this.requests_status_selected_from_advanced_option = 'all'
    } else if (request_status === '100') {
      this.operator = '='
      this.requests_status = '100'
      this.requests_status_selected_from_advanced_option = '100'
    } else if (request_status === '200') {
      this.operator = '='
      this.requests_status_selected_from_advanced_option = '200'
      this.requests_status = '200'
    }

    // else if (request_status === '50') {
    //   this.operator = '='
    //   this.requests_status_selected_from_advanced_option = '50'
    //   this.requests_status = '50'
    // }

  }

  requestsStatusesSelectFromAdvancedOption(requests_statuses) {
    this.logger.log('[HISTORY & NORT-CONVS] - requestsStatusesSelectFromAdvancedOption requests_statuses', this.requests_statuses);

    if (this.requests_statuses.length === 0) {
      this.logger.log('[HISTORY & NORT-CONVS] - requestsStatusesSelectFromAdvancedOption requests_statuses 2', this.requests_statuses);
      // this.requests_statuses = ['1000', '100', '200', '50']
      // this.requests_status = "1000,100,200,50"
      this.requests_status = "1000,100,200"
      this.getRequests()
    }
    this.requests_status = requests_statuses.join()
    this.logger.log('[HISTORY & NORT-CONVS] - requestsStatusesSelectFromAdvancedOption requests_status', this.requests_status);
  }

  getAllRequests() {
    //  this.operator = '='
    this.requests_status = 'all'
    //  this.requests_status = '100,150,200'
    // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getAllRequests', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getServedRequests() {
    this.operator = '='
    this.requests_status = '200'
    // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getServedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getUnservedRequests() {
    this.operator = '='
    this.requests_status = '100'
    // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getUnservedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  getAbandonedRequests() {
    this.operator = '='
    this.requests_status = '150'
    // this.logger.log('[HISTORY & NORT-CONVS] - WsRequests NO-RT - getUnservedRequests status ', this.requests_status, 'operator ', this.operator);
    this.getRequests()
  }

  // unsuscribeRequestById(idrequest) {
  //   this.wsRequestsService.unsubscribeTo_wsRequestById(idrequest);
  // }

  // unsuscribeMessages(idrequest) {
  //   this.wsMsgsService.unsubsToWS_MsgsByRequestId(idrequest);
  // }

  // subscribeToWs_MsgsByRequestId(request, id_request: string) {
  //   this.logger.log('[WS-REQUESTS-MSGS] - subscribe To WS MSGS ByRequestId ', id_request)
  //   this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);

  //   this.getWsMsgs$(request, id_request);
  // }

  // getWsMsgs$(request, id_request) {
  //   this.wsMsgsService.wsMsgsList$
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((wsmsgs) => {

  //       if (wsmsgs) {
  //         this.logger.log('[WS-REQUESTS-MSGS] getWsMsgs$ request', request)
  //         const msgsArray = []
  //         wsmsgs.forEach((msgs, index) => {
  //           if ((msgs)) {
  //             if ((msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info') || (msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info/support')) {
  //               this.logger.log('>>>> msgs subtype does not push ', msgs['attributes']['subtype'])
  //             } else {
  //               msgsArray.push(msgs)
  //             }
  //           }
  //         });
  //         this.logger.log('[WS-REQUESTS-MSGS] msgsArray ',msgsArray)



  //         request['msgsArray'] = msgsArray.sort(function compare(a, b) {
  //           if (a['createdAt'] > b['createdAt']) {
  //             return -1;
  //           }
  //           if (a['createdAt'] < b['createdAt']) {
  //             return 1;
  //           }
  //           return 0;
  //         });
  //       }
  //     }, error => {
  //       this.showSpinner = false;
  //       this.logger.error('[WS-REQUESTS-MSGS] - getWsMsgs$ - ERROR ', error)
  //     }, () => {
  //       this.logger.log('[WS-REQUESTS-MSGS] - getWsMsgs$ * COMPLETE * ')
  //     });
  // }

  overfirstTextGetRequestMsg(request) {
    this.logger.log('[HISTORY & NORT-CONVS] overfirstText request_id', request);
    this.getRequestMsg(request)
  }

  getRequestMsg(request) {
    this.wsMsgsService.geRequestMsgs(request.request_id).subscribe((msgs: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] -  GET REQUESTS MSGS - RES: ', msgs);
      if (msgs) {
        const msgsArray = [];
        msgs.forEach((msgs, index) => {
          if ((msgs)) {
            if ((msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info') || (msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info/support')) {
              // this.logger.log('>>>> msgs subtype does not push ', msgs['attributes']['subtype'])
            } else {
              msgsArray.push(msgs)
            }
          }
          request['msgsArray'] = msgsArray.sort(function compare(a, b) {
            if (a['createdAt'] > b['createdAt']) {
              return -1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return 1;
            }
            return 0;
          });
        });
      }
      // this.logger.log('[WS-REQUESTS-MSGS] -  GET REQUESTS MSGS - request: ', request);
    }, (err) => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET REQUESTS MSGS - ERROR: ', err);

    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] * COMPLETE *');
    });
  }


  millisToMinutesAndSeconds(millis) {
    let seconds = (millis / 1000).toFixed(1);
    let minutes = (millis / (1000 * 60)).toFixed(1);
    let hours = (millis / (1000 * 60 * 60)).toFixed(1);
    let days = (millis / (1000 * 60 * 60 * 24)).toFixed(1);
    if (+seconds < 60) return seconds + " " + this.translate.instant('Analytics.Seconds');
    else if (+minutes < 60) return minutes + " " + this.translate.instant('Analytics.Minutes');
    else if (+hours < 24) return hours + " " + this.translate.instant('Analytics.Hours');
    else return days + " " + this.translate.instant('Analytics.Days');

  }

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

  // GET REQUEST COPY - START
  getRequests() {
    this.logger.log('getRequests queryString', this.queryString)
    // this.logger.log('getRequests _preflight' , this._preflight) 
    this.logger.log('getRequests requests_statuses ', this.requests_statuses)
    this.logger.log('getRequests requests_status ', this.requests_status)

    this.showSpinner = true;
    let promise = new Promise((resolve, reject) => {
      this.wsRequestsService.getHistoryAndNortRequests(this.operator, this.requests_status, this.requests_statuses, this._preflight, this.queryString, this.pageNo).subscribe((requests: any) => {
        this.logger.log('[HISTORY & NORT-CONVS] - GET REQUESTS RES ', requests);
        // this.logger.log('[HISTORY & NORT-CONVS] - GET REQUESTS ', requests['requests']);
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
          this.logger.log('requestList ', this.requestList)
          for (const request of this.requestList) {

            if (request) {

              request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.auth.user_bs.value._id, request.request_id);

              // -------------------------------------------------------------------
              // User Agent
              // -------------------------------------------------------------------
              const user_agent_result = this.parseUserAgent(request.userAgent);
              //  this.logger.log('[HISTORY & NORT-CONVS] - user_agent_result ', user_agent_result);
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

              if (request['duration']) {

                // this.logger.log('[HISTORY & NORT-CONVS] duration ', request['duration']) 
                this.duration_in_table = this.millisToMinutesAndSecondsNoFixedPoint(request['duration'])
                // this.logger.log('[HISTORY & NORT-CONVS] duration_in_table ', this.duration_in_table) 
                request['duration_in_table'] = this.duration_in_table

                // this.duration_in_table_test = this.millisToMinutesAndSecondsNoFixedPoint(request['duration'])
                // request['duration_in_table_test'] = this.duration_in_table_test
              } else {
                request['duration_in_table'] = "N/A"
              }



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
        this.trial_expired = projectProfileData.trial_expired;
        this.profile_name = projectProfileData.profile_name;

        if (projectProfileData.extra3) {
          this.appSumoProfile = APP_SUMO_PLAN_NAME[projectProfileData.extra3]
          this.appSumoProfilefeatureAvailableFromBPlan = APP_SUMO_PLAN_NAME['tiledesk_tier3']
        }





        // this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

        // tslint:disable-next-line:max-line-length
        // if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
        //   this.date_picker_is_disabled = true;
        //   // this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
        // } else {
        //   this.date_picker_is_disabled = false;
        // }
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
    // this.logger.log('[HISTORY & NORT-CONVS] this.profile_name ', this.profile_name)
    // this.logger.log('[HISTORY & NORT-CONVS]  this.trial_expired ', this.trial_expired)
    // if (this.USER_ROLE === 'owner') {
    //   if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
    //     this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    //   }
    //   if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //     this.router.navigate(['project/' + this.projectId + '/pricing']);
    //   }
    // } else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan();
    // }
    // this.logger.log('openModalSubsExpiredOrGoToPricing this.payIsVisible ', this.payIsVisible) 
    if (this.payIsVisible) {

      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
            this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
          } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, this.profile_name, this.subscription_end_date);
          }

        } else if (this.profile_name === 'free' || this.profile_name === 'Sandbox') {  // && this.trial_expired === true
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
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)

  }


  getAllProjectUsers() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[HISTORY & NORT-CONVS]  - GET PROJECT-USERS ', projectUsers);

      if (projectUsers) {
        this.projectUsersArray = projectUsers;
        projectUsers.forEach(user => {
          // this.logger.log('getAllProjectUsers user ', user)
          this.user_and_bot_array.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
        });

        this.logger.log('[HISTORY & NORT-CONVS] - !!!! USERS ARRAY ', this.user_and_bot_array);
        this.user_and_bot_array = this.user_and_bot_array.slice(0)
      }
    }, (error) => {
      this.logger.error('[HISTORY & NORT-CONVS] - GET PROJECT-USERS ', error);
    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET PROJECT-USERS * COMPLETE *');

      // if (this.qs_teammate_id) {

      //     this.logger.log('esist qs_teammate_id in getAllProjectUsers selectedAgent ', this.user_and_bot_array)
      //     const selectedAgent = this.user_and_bot_array.filter((agent: any) => {
      //       return agent._id === this.qs_teammate_id;
      //     });
      //     this.logger.log('esist qs_teammate_id in getAllProjectUsers selectedAgent ', selectedAgent)

      //     if (selectedAgent.length > 0) {
      //       this.selectedAgentFirstname_temp = selectedAgent[0].firstname
      //       this.selectedAgentLastname_temp = selectedAgent[0].lastname

      //       this.selectedAgentFirstname = this.selectedAgentFirstname_temp;
      //       this.selectedAgentLastname = this.selectedAgentLastname_temp;
      //       this.logger.log('[HISTORY & NORT-CONVS] - getAllProjectUsers selectedAgentFirstname  ', this.selectedAgentFirstname, ' selectedAgentLastname: ', this.selectedAgentLastname);
      //     }

      // }


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

      if (this.qs_teammate_id) {

        // this.logger.log('[HISTORY & NORT-CONVS] exist qs_teammate_id in getAllBot selectedAgent ', this.user_and_bot_array)
        const selectedAgent = this.user_and_bot_array.filter((agent: any) => {
          return agent._id === this.qs_teammate_id;
        });
        // this.logger.log('[HISTORY & NORT-CONVS] exist qs_teammate_id in getAllBot selectedAgent ', selectedAgent)

        if (selectedAgent.length > 0) {
          this.selectedAgentFirstname_temp = selectedAgent[0].firstname
          this.selectedAgentLastname_temp = selectedAgent[0].lastname

          this.selectedAgentFirstname = this.selectedAgentFirstname_temp;
          this.selectedAgentLastname = this.selectedAgentLastname_temp;
          // this.logger.log('[HISTORY & NORT-CONVS] - getAllBot selectedAgentFirstname  ', this.selectedAgentFirstname, ' selectedAgentLastname: ', this.selectedAgentLastname);
        }
      }
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

      if (this.qs_dept_id) {
        const selectedDept = this.departments.filter((dept: any) => {
          return dept._id === this.qs_dept_id;
        });
        // this.logger.log('[HISTORY & NORT-CONVS] - GET DEPTS - exist qs_dept_id: ', this.qs_dept_id);
        // this.logger.log('[HISTORY & NORT-CONVS] - GET DEPTS - exist selectedDept: ', selectedDept);
        this.selectedDeptName_temp = selectedDept[0].name
        this.selectedDeptName = this.selectedDeptName_temp;
      }

      this.logger.log('[HISTORY & NORT-CONVS] - GET DEPTS * COMPLETE *')
    });
  }

  // ------------------------------------------------------------------------------
  // @ Tags - get tags
  // ------------------------------------------------------------------------------
  getTag() {
    this.loadingTags = true;
    this.tagsService.getTags().subscribe((tags: any) => {
      this.logger.log('[HISTORY & NORT-CONVS] - GET TAGS - RES ', tags);

      tags.forEach(tag => {
        this.logger.log('[HISTORY & NORT-CONVS] - TAG', tag);

        this.tags_array.push({ 'id': tag._id, 'name': tag.tag, 'color': tag.color })
      });
      this.tags_array = this.tags_array.slice(0)

      // this.logger.log('[HISTORY & NORT-CONVS] - TAG-ARRAY', this.tags_array);
    }, error => {
      this.loadingTags = false
      this.logger.error('[HISTORY & NORT-CONVS] - GET TAGS - ERROR: ', error);
    }, () => {
      this.loadingTags = false
      // this.logger.log('[HISTORY & NORT-CONVS] - GET TAGS * COMPLETE *')

      if (this.qs_tags_value) {
        // this.logger.log('[HISTORY & NORT-CONVS] - GET TAGS * COMPLETE > this.qs_tags_value ', this.qs_tags_value)

        const selecteTag = this.tags_array.filter((tag: any) => {
          return tag.name === this.qs_tags_value;
        });

        if (selecteTag.length > 0) {
          // this.selecteTagName = selecteTag[0]['name']
          this.selecteTagColor_temp = selecteTag[0]['color']
          this.selecteTagColor = this.selecteTagColor_temp
          // this.logger.log('[HISTORY & NORT-CONVS] - selecteTag ', selecteTag)
        }
      }
    });
  }

  // ------------------------------------------------------------------------------
  // @ Departments - get selected department name
  // ------------------------------------------------------------------------------
  depSelected(deptid) {
    // this.logger.log('[HISTORY & NORT-CONVS] - selectedDeptId ', this.selectedDeptId);
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
    // this.logger.log('agentSelected selectedagentid selectedagentid', selectedagentid)
    const selectedAgent = this.user_and_bot_array.filter((agent: any) => {
      return agent._id === selectedagentid;
    });

    // this.logger.log('[HISTORY & NORT-CONVS] - selectedAgent ', selectedAgent);
    if (selectedAgent.length > 0) {

      this.selectedAgentFirstname_temp = selectedAgent[0].firstname
      this.selectedAgentLastname_temp = selectedAgent[0].lastname
      // this.logger.log('[HISTORY & NORT-CONVS] - selectedAgentFirstname TEMP ', this.selectedAgentFirstname_temp, ' selectedAgentLastname TEMP: ', this.selectedAgentLastname_temp);
    } else {
      this.selectedAgentId = ''
    }
  }

  // ------------------------------------------------------------------------------
  // @ Tags - on change tags get selected tag name
  // ------------------------------------------------------------------------------
  tagNameSelected() {
    // this.logger.log('[HISTORY & NORT-CONVS] - selecteTagName ', this.selecteTagName);

    const selecteTag = this.tags_array.filter((tag: any) => {
      return tag.name === this.selecteTagName;
    });
    // this.logger.log('[HISTORY & NORT-CONVS] - selecteTag ', selecteTag);
    if (selecteTag.length > 0) {
      this.selecteTagColor_temp = selecteTag[0]['color']
    }
  }

  requestsTypeSelectFromAdvancedOption() {
    // this.logger.log('this.conversationTypeValue: ', this.conversationTypeValue)
    this.logger.log('this.conversation_type: ', this.conversation_type)
    if (this.conversation_type === 'all') {
      // this.conversationTypeValue = 'all'
      this.conversation_type = 'all'
    }

    if (this.conversation_type === 'chat21') {
      // this.conversationTypeValue = 'chat21'
      this.conversation_type = 'chat21'
    }


    if (this.conversation_type === 'telegram') {
      // this.conversationTypeValue = 'telegram'
      this.conversation_type = 'telegram'
    }

    if (this.conversation_type === 'messenger') {
      // this.conversationTypeValue = 'messenger'
      this.conversation_type = 'messenger'
    }

    if (this.conversation_type === 'messenger') {
      // this.conversationTypeValue = 'messenger'
      this.conversation_type = 'messenger'
    }

    if (this.conversation_type === 'email') {
      // this.conversationTypeValue = 'email'
      this.conversation_type = 'email'
    }

    if (this.conversation_type === 'form') {
      // this.conversationTypeValue = 'form'
      this.conversation_type = 'form'
    }

    if (this.conversation_type === 'whatsapp') {
      // this.conversationTypeValue = 'whatsapp'
      this.conversation_type = 'whatsapp'
    }


    if (this.conversation_type === 'voice-vxml') {
      // this.conversationTypeValue = 'whatsapp'
      this.conversation_type = 'voice-vxml'
    }

    if (this.conversation_type === 'voice-twilio') {
      // this.conversationTypeValue = 'whatsapp'
      this.conversation_type = 'voice-twilio'
    }
  }


  onChangeDurationOperator() {

    if (this.duration_operator_temp === '0') {
      this.duration_op = "gt";
      this.logger.log('[HISTORY & NORT-CONVS] - onChangeDurationOperator duration_op', this.duration_op);
    } else if (this.duration_operator_temp === '1') {
      this.duration_op = "lt";
      this.logger.log('[HISTORY & NORT-CONVS] - onChangeDurationOperator duration_op', this.duration_op);
    }
  }

  fulltextChange($event) {
    //  this.logger.log('[HISTORY & NORT-CONVS] - fulltextChange ', $event);
    //  this.logger.log('[HISTORY & NORT-CONVS] - fulltextChange length ', $event.length);
    if ($event.length === 0) {
      this.clearFullText()

    }
    this.fullText_temp = $event
  }


  addEventStartDate(value) {
    this.logger.log('[HISTORY & NORT-CONVS] - startDateSelected value', value);
    this.startDateFormatted_temp = moment(value).format('DD/MM/YYYY')
    this.logger.log('[HISTORY & NORT-CONVS] - startDateFormatted_temp', this.startDateFormatted_temp);

    if (this.startDateFormatted_temp) {
      this.start_date_is_null = false;
      this.startDate = this.startDateFormatted_temp;
      this.logger.log('[HISTORY & NORT-CONVS] - startDate', this.startDate);
    } else {
      this.start_date_is_null = true;
      this.startDate = ''
      this.endDate = ''

    }
  }

  addEventEndDate(value) {
    this.logger.log('[HISTORY & NORT-CONVS] - endDateSelected value', value);
    this.endDateFormatted_temp = moment(value).format('DD/MM/YYYY')

    this.logger.log('[HISTORY & NORT-CONVS] - endDateFormatted_temp', this.endDateFormatted_temp);
    if (!this.endDateFormatted_temp) {
      this.endDate = ''
    } else {
      this.endDate = this.endDateFormatted_temp
      this.logger.log('[HISTORY & NORT-CONVS] - endDate', this.endDate);
    }
  }
  onChangeStartDate($event) {
    this.logger.log('[HISTORY & NORT-CONVS] - onChangeStartDate event', $event);
    this.startDateDefaultValue = moment($event).format('DD/MM/YYYY')
    this.logger.log('[HISTORY & NORT-CONVS] - onChangeStartDate this.startDateDefaultValue', this.startDateDefaultValue);
  }

  clearDateRange() {
    this.logger.log('[HISTORY & NORT-CONVS] - CLEAR DATE RANGE');
    this.startDateDefaultValue = null
    this.endDateDefaultValue = null
    this.startDate = null
    this.endDate = null
  }

  // ------------------------------------------------------------------------------
  // @ Date - on change start date get selected start date formatted
  // ------------------------------------------------------------------------------
  startDateSelected($event) {
    // this.logger.log('[HISTORY & NORT-CONVS] - startDateSelected event', $event);
    this.startDateFormatted_temp = $event['formatted'];

    // this.logger.log('[HISTORY & NORT-CONVS] - startDateFormatted TEMP ', this.startDateFormatted_temp);

    // const startDateLessOneDay =  moment($event['jsdate']).subtract(1, 'days').format('DD/MM/YYYY'); 
    const startDateLessOneDay = moment($event['jsdate']).subtract(1, 'days').format('DD/MM/YYYY');

    const startDateLessOneDaySegment = startDateLessOneDay.split('/');

    this.logger.log('[HISTORY & NORT-CONVS] - startDateLessOneDay ', startDateLessOneDay);
    this.logger.log('[HISTORY & NORT-CONVS] - startDateLessOneDaySegment ', startDateLessOneDaySegment);


    // this.disableUntilDate = $event.date;
    this.disableUntilDate = { year: startDateLessOneDaySegment[2], month: startDateLessOneDaySegment[1], day: startDateLessOneDaySegment[0] }

    this.logger.log('[HISTORY & NORT-CONVS] - disableUntilDate ', this.disableUntilDate);

    // let copy = this.getCopyOfOptions();

    // copy.disableUntil = this.disableUntilDate;

    // this.endDatePickerOptions = copy;

    // this.logger.log('[HISTORY & NORT-CONVS] - endDatePickerOptions ', this.endDatePickerOptions);

    if (this.startDateFormatted_temp) {
      this.start_date_is_null = false;
    } else {
      this.start_date_is_null = true;
      this.startDate = ''
      this.endDate = ''

    }
  }

  // ------------------------------------------------------------------------------
  // @ Date - on change end date get selected end date formatted
  // ------------------------------------------------------------------------------
  endDateSelected($event) {
    this.logger.log('[HISTORY & NORT-CONVS] - endDateSelected ', $event);

    this.endDateFormatted_temp = $event['formatted'];
    // this.logger.log('[HISTORY & NORT-CONVS] - endDateFormatted TEMP', this.endDateFormatted_temp);

    // this.endDatePickerOptions.disableUntil = this.disableUntilDate;

    // let copy = this.getCopyOfOptions();
    // copy.disableUntil = this.disableUntilDate;
    // this.endDatePickerOptions = copy;
    // this.logger.log('!!! NEW REQUESTS HISTORY - endDatePickerOptions ', this.endDatePickerOptions);

    if (!this.endDateFormatted_temp) {
      this.endDate = ''
    }
  }




  // ------------------------------------------------------------------------------
  // @ Toggle advanced options
  // ------------------------------------------------------------------------------
  toggle() {
    // this.advancedoptionbtnRef.nativeElement.blur();
    this.showAdvancedSearchOption = !this.showAdvancedSearchOption;
    // this.logger.log('[HISTORY & NORT-CONVS] - TOGGLE DIV ', this.showAdvancedSearchOption);
    this.displayHideFooterPagination();
    // this.logger.log('[HISTORY & NORT-CONVS] - TOGGLE DIV this.requests_status_selected_from_left_filter ', this.requests_status_selected_from_left_filter);

    if (this.requests_status_selected_from_left_filter) {
      this.requests_status_selected_from_advanced_option = this.requests_status_selected_from_left_filter
      // this.logger.log('[HISTORY & NORT-CONVS] - TOGGLE DIV this.requests_status_selected_from_advanced_option ', this.requests_status_selected_from_advanced_option);
    }

    // this.requests_status_selected_from_left_filter = '200'
    // this.requests_status_selected_from_advanced_option = null
  }

  searchOnEnterPressed(event: any) {
    //  this.logger.log('searchOnEnterPressed event', event);

    //  if( event.key === "#" )
    //  this.logger.log('searchOnEnterPressed event', event);


    if (event.key === "Enter") {
      this.search()
    }
  }

  onlyNumbers(stringWithoutHash) {
    return /^[0-9]+$/.test(stringWithoutHash);
  }

  search() {
    this.logger.log('HERE IN SEARCH duration operator ', this.duration_op)
    this.logger.log('HERE IN SEARCH duration ', this.duration)
    this.logger.log('HERE IN SEARCH duration called_phone ', this.called_phone)
    this.logger.log('HERE IN SEARCH duration caller_phone ', this.caller_phone)
    this.logger.log('HERE IN SEARCH duration call_id ', this.call_id)
    // this.logger.log('HERE IN SEARCH calledBy ', calledBy)
    this.logger.log('HERE IN SEARCH this.preflight', this.preflight)
    this.logger.log('HERE IN SEARCH this.fullText', this.fullText)
    this.logger.log('HERE IN SEARCH this.startDate', this.startDate)
    this.logger.log('HERE IN SEARCH this.endDate', this.endDate)
    this.logger.log('HERE IN SEARCH this.requests_status', this.requests_status)
    this.logger.log('HERE IN SEARCH this.requests_status_selected_from_advanced_option', this.requests_status_selected_from_advanced_option)


    this.requests_status_temp = this.requests_status

    // this.logger.log('HERE IN SEARCH this.requests_status', this.requests_status_temp)

    this.has_searched = true;
    // this.logger.log('search has_searched ' + this.has_searched)
    this.pageNo = 0




    if (this.fullText) {
      // this.logger.log('searchOnEnterPressed this.fullText ', this.fullText)
      if (this.fullText.indexOf('#') !== -1) {
        // this.logger.log('String contains # ');
        const indexOfHash = this.fullText.indexOf("#");
        // this.logger.log('indexOfHash # ', indexOfHash);
        if (indexOfHash === 0) {
          const stringWithoutHash = this.fullText.substring(1);
          // this.logger.log('string Without Hash ', stringWithoutHash);
          const stringWithoutHashHasOnlyNumbers = this.onlyNumbers(stringWithoutHash)
          // this.logger.log('stringWithoutHashHasOnlyNumbers ', stringWithoutHashHasOnlyNumbers);
          if (stringWithoutHashHasOnlyNumbers === true) {
            this.SEARCH_FOR_TICKET_ID = true
            // this.logger.log('SEARCH_FOR_TICKET_ID ', this.SEARCH_FOR_TICKET_ID) 
          } else {
            this.SEARCH_FOR_TICKET_ID = false
          }
        }
      } else {
        // this.logger.log('String Not contains # ');
        this.SEARCH_FOR_TICKET_ID = false
      }

      if (this.SEARCH_FOR_TICKET_ID === false) {
        this.fullTextValue = this.fullText;
      } else if (this.SEARCH_FOR_TICKET_ID === true) {
        this.fullTextValue = this.fullText.substring(1);
      }

      this.fullText_applied_filter = this.fullText_temp;
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR FULL TEXT fullText_applied_filter', this.fullText_applied_filter);
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      // this.logger.log('[HISTORY & NORT-CONVS] -  SEARCH FOR FULL TEXT (else) ', this.fullText);
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
      // this.logger.log('[HISTORY & NORT-CONVS] - START DATE - EPOC ', this.startDate['epoc']);

      // this.startDateValue = this.startDate['formatted'] moment(value).format('DD/MM/YYYY')
      this.startDateValue = this.startDate;

      this.startDateFormatted = this.startDateFormatted_temp;

      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR START DATE ', this.startDateValue);
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR START DATE FORMATTED', this.startDateFormatted);
    } else {
      this.startDateValue = '';
      this.startDateFormatted = null
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR START DATE ', this.startDate);
    }

    if (this.endDate) {
      this.logger.log('[HISTORY & NORT-CONVS] - END DATE ', this.endDate);
      // this.logger.log('[HISTORY & NORT-CONVS] - END DATE - FORMATTED ', this.endDate['formatted']);
      // this.logger.log('[HISTORY & NORT-CONVS] - END DATE - EPOC ', this.endDate['epoc']);

      // this.endDateValue = this.endDate['formatted'];
      this.endDateValue = this.endDate;

      this.endDateFormatted = this.endDateFormatted_temp;
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR END DATE FORMATTED', this.endDateFormatted);
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR END DATE ', this.endDateValue);
    } else {
      this.endDateValue = '';
      this.endDateFormatted = null
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR END DATE ', this.endDate)
    }


    if (this.selectedAgentId) {
      this.selectedAgentValue = this.selectedAgentId;
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selectedAgentId ', this.selectedAgentValue);

      this.selectedAgentFirstname = this.selectedAgentFirstname_temp;
      this.selectedAgentLastname = this.selectedAgentLastname_temp;
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selectedAgentId ', this.selectedAgentValue);
    } else {
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selectedAgentFirstname ', this.selectedAgentFirstname);
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selectedAgentLastname ', this.selectedAgentLastname);
      this.selectedAgentValue = '';

      this.selectedAgentFirstname = null;
      this.selectedAgentLastname = null;
    }

    if (this.selecteTagName) {
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selecteTagName ', this.selecteTagName);
      this.selecteTagNameValue = this.selecteTagName
      this.selecteTagColor = this.selecteTagColor_temp
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selecteTagNameValue ', this.selecteTagNameValue);
      // this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR selecteTagColor ', this.selecteTagColor);
    } else {
      this.selecteTagNameValue = '';
      this.selecteTagColor = null
    }

    this.logger.log('search this.conversation_type ', this.conversation_type)
    this.logger.log('search this.conversationTypeValue ', this.conversationTypeValue)
    if (this.conversation_type && this.conversation_type !== 'all') {
      this.conversationTypeValue = this.conversation_type
      this.logger.log('search this.conversation_type ', this.conversation_type)
      // this.logger.log('search this.conversationTypeValue ', this.conversationTypeValue)
    } else {
      this.conversationTypeValue = '';
    }

    if (this.requester_email) {
      this.emailValue = this.requester_email;
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR email ', this.emailValue);
    } else {
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR email ', this.requester_email);
      this.emailValue = ''
    }
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR preflight 1', this.preflight);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR IS_HERE_FOR_HISTORY ', this.IS_HERE_FOR_HISTORY);
    if (this.preflight === undefined) {
      if (this.IS_HERE_FOR_HISTORY) {
        this._preflight = true;
      } else {
        this._preflight = false;
      }
      this.logger.log('[HISTORY & NORT-CONVS] - SEARCH FOR ._preflight 2', this._preflight);
    }

    // if (this.fullText !== undefined && this.deptName !== undefined && this.startDate !== undefined || this.endDate !== undefined) {
    // tslint:disable-next-line:max-line-length
    let variable_parameter = 'full_text='
    if (this.SEARCH_FOR_TICKET_ID === true) {
      variable_parameter = "ticket_id="
    }

    if (!this.duration) {
      this.logger.log('[HISTORY & NORT-CONVS] - here y');
      this.duration_op = ""
      this.duration = ""
    }

    if (!this.called_phone) {
      this.called_phone = ""
    }

    if (!this.caller_phone) {
      this.caller_phone = ""
    }
    if (!this.call_id) {
      this.call_id = ""
    }


    this.queryString =
      variable_parameter
      + this.fullTextValue + '&'
      + 'dept_id=' + this.deptIdValue + '&'
      + 'start_date=' + this.startDateValue + '&'
      + 'end_date=' + this.endDateValue + '&'
      + 'participant=' + this.selectedAgentValue + '&'
      + 'requester_email=' + this.emailValue + '&'
      + 'tags=' + this.selecteTagNameValue + '&'
      + 'channel=' + this.conversationTypeValue + '&'
      + 'rstatus=' + this.requests_status + '&'
      + 'duration_op=' + this.duration_op + '&'
      + 'duration=' + this.duration + '&'
      + 'called=' + this.called_phone + '&'
      + 'caller=' + this.caller_phone + '&'
      + 'call_id=' + this.call_id

    // + 'called_phone=' + this.called_phone + '&'
    // + 'caller_phone=' + this.caller_phone
    // + '&'
    // + 'preflight=' + this.preflightValue


    this.logger.log('[HISTORY & NORT-CONVS] - QUERY STRING ', this.queryString);

    // REOPEN THE ADVANCED OPTION DIV IF IT IS CLOSED BUT ONE OF SEARCH FIELDS IN IT CONTAINED ARE VALORIZED
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 > showAdvancedSearchOption', this.showAdvancedSearchOption);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 selectedDeptId > ', this.selectedDeptId);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 startDate > ', this.startDate);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 endDate > ', this.endDate);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 requester_email > ', this.requester_email);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 selecteTagName > ', this.selecteTagName);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 conversation_type > ', this.conversation_type);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 fullText', this.fullText)
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 requests_status_selected_from_advanced_option > ', this.requests_status_selected_from_advanced_option);
    this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 1 requests_status_selected_from_left_filter > ', this.requests_status_selected_from_left_filter);

    // ||
    // this.requests_status_selected_from_left_filter !== undefined ||
    // this.requests_status_selected_from_advanced_option  !== undefined

    if (this.showAdvancedSearchOption === false) {

      if (this.selectedDeptId ||
        this.startDate ||
        this.endDate ||
        this.selectedAgentId ||
        this.requester_email ||
        this.selecteTagName ||
        this.conversation_type !== 'all' ||
        (this.requests_status_selected_from_left_filter && this.requests_status_selected_from_left_filter === '100') ||
        (this.requests_status_selected_from_left_filter && this.requests_status_selected_from_left_filter === '200') ||
        (this.requests_status_selected_from_advanced_option && this.requests_status_selected_from_advanced_option !== 'all')

      ) {

        this.showAdvancedSearchOption = true;
        this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 2 ', this.showAdvancedSearchOption);
      } else {
        this.showAdvancedSearchOption = false;
        this.logger.log('[HISTORY & NORT-CONVS] - SEARCH  showAdvancedSearchOption 3 ', this.showAdvancedSearchOption);
      }
    }
    this.getRequests();
  }

  clearFullText() {
    this.has_searched = false;
    const currentUrl = this.router.url;
    this.logger.log('[HISTORY & NORT-CONVS] clearFullText current_url ', currentUrl);
    this.logger.log('[HISTORY & NORT-CONVS] clearFullText this.conversation_type ', this.conversation_type);
    this.logger.log('[HISTORY & NORT-CONVS] clearFullText this.conversationTypeValue ', this.conversationTypeValue);
    const url_segments = currentUrl.split('/');
    url_segments.shift(); // removes the first element of the array which is an empty string created due to the first slash present in the URL
    // this.logger.log('[HISTORY & NORT-CONVS] clearFullText url_segments ', url_segments);
    // this.logger.log('[HISTORY & NORT-CONVS] clearFullText url_segments lenght', url_segments.length);

    let currentRoute = ""
    if (url_segments[2].indexOf('all-conversations') !== -1) {
      currentRoute = 'all-conversations'
    } else {
      currentRoute = 'history'
    }



    // this.logger.log('[HISTORY & NORT-CONVS] clearFullText current_route ', current_route);
    this.router.navigate(['project/' + this.projectId + '/' + currentRoute]);


    // this.logger.log('clearFullText has_searched', this.has_searched)
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

    // if (this.conversation_type && this.conversation_type !== 'all') {
    //   this.conversationTypeValue = this.conversation_type

    // } else {
    //   this.conversationTypeValue = '';

    // }


    if (this.requester_email) {
      this.emailValue = this.requester_email;
    } else {
      this.emailValue = ''
    }

    if (this.call_id) {
      this.call_id = ''
    }

    if (this.called_phone) {
      this.called_phone = ''
    }

    if (this.caller_phone) {
      this.caller_phone = ''
    }

    if (this.called_phone) {
      this.called_phone = ''
    }

    if (this.duration_op) {
      this.duration_op = 'gt'
    }

    this.duration_operator_temp = this.request_duration_operator_array[0]['id']

    if (this.duration) {
      this.duration = ''
    }



    if (this.IS_HERE_FOR_HISTORY) {
      this.requests_statuses = ['1000']
      this.requests_status = '1000'
    }
    // tslint:disable-next-line:max-line-length

    this.conversationTypeValue = 'all'
    this.conversation_type = 'all'

    this.queryString =
      // 'full_text='
      // + '&' +
      // 'dept_id=' + this.deptIdValue
      // + '&' +
      // 'start_date=' + this.startDateValue
      // + '&' +
      // 'end_date=' + this.endDateValue
      // + '&' +
      // 'participant=' + this.selectedAgentValue
      // + '&' +
      // 'requester_email=' + this.emailValue
      // + '&' +
      // 'tags=' + this.selecteTagNameValue
      // + '&' +
      // 'channel=' + this.conversationTypeValue, 
      // + 'rstatus=' + '&' 
      // + 'duration_op='  + '&'
      // + 'duration='  + '&'
      // + 'called='  + '&'
      // + 'caller='  + '&'
      // + 'call_id='

      'full_text=' + '&'
      + 'dept_id=' + '&'
      + 'start_date=' + '&'
      + 'end_date=' + '&'
      + 'participant=' + '&'
      + 'requester_email=' + '&'
      + 'tags=' + '&'
      + 'channel=' + '&'
      + 'rstatus=' + '&'
      + 'duration_op=' + '&'
      + 'duration=' + '&'
      + 'called=' + '&'
      + 'caller=' + '&'
      + 'call_id='


    // this.logger.log('clearFullText queryString ' , this.queryString ) 
    this.pageNo = 0
    this.getRequests();

  }

  clearSearch() {
    this.logger.log('[HISTORY & NORT-CONVS] clearSearch this.conversation_type ', this.conversation_type);
    this.logger.log('[HISTORY & NORT-CONVS] clearSearch this.conversationTypeValue ', this.conversationTypeValue);
    this.has_searched = false;
    const currentUrl = this.router.url;
    // this.logger.log('[HISTORY & NORT-CONVS] clearSearch current_url ', currentUrl);
    const url_segments = currentUrl.split('/');
    url_segments.shift(); // removes the first element of the array which is an empty string created due to the first slash present in the URL
    // this.logger.log('[HISTORY & NORT-CONVS] clearSearch url_segments ', url_segments);
    // this.logger.log('[HISTORY & NORT-CONVS] clearSearch url_segments lenght', url_segments.length);

    let currentRoute = ""
    if (url_segments[2].indexOf('all-conversations') !== -1) {
      currentRoute = 'all-conversations';
      // this.logger.log('[HISTORY & NORT-CONVS] clearSearch currentRoute ', currentRoute);
    } else {
      currentRoute = 'history';
      // this.logger.log('[HISTORY & NORT-CONVS] clearSearch currentRoute ', currentRoute);
    }

    this.router.navigate(['project/' + this.projectId + '/' + currentRoute]);

    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    this.logger.log('[HISTORY & NORT-CONVS]- CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()
    this.startDateDefaultValue = null
    this.endDateDefaultValue = null
    this.fullText = '';
    this.selectedDeptId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedAgentId = '';
    this.requester_email = '';
    this.selecteTagName = '';
    this.conversation_type = 'all';
    this.duration = '';
    this.duration_op = 'gt';
    this.duration_operator_temp = this.request_duration_operator_array[0]['id']
    this.caller_phone = '';
    this.called_phone = '';
    this.call_id = "";


    if (!this.IS_HERE_FOR_HISTORY) {
      this.requests_status = 'all'
    }

    if (this.IS_HERE_FOR_HISTORY) {
      this.requests_statuses = ['1000']
      this.requests_status = '1000'
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
    this.conversationTypeValue = 'all'
    this.conversation_type = 'all'
    // tslint:disable-next-line:max-line-length
    this.queryString =
      'full_text=' + '&'
      + 'dept_id=' + '&'
      + 'start_date=' + '&'
      + 'end_date=' + '&'
      + 'participant=' + '&'
      + 'requester_email=' + '&'
      + 'tags=' + '&'
      + 'channel=';
    + 'rstatus=' + '&'
      + 'duration_op=' + '&'
      + 'duration=' + '&'
      + 'called=' + '&'
      + 'caller=' + '&'
      + 'call_id='
    this.pageNo = 0;
    this.logger.log('[HISTORY & NORT-CONVS] - CLEAR SEARCH fullTextValue ', this.fullTextValue)
    // this.logger.log('[HISTORY & NORT-CONVS] - CLEAR SEARCH fullTextValue ', this.queryString)

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

  presentModalFeautureAvailableFromTier2Plan(planName) {
    // const el = document.createElement('div')
    // el.innerHTML = planName
    Swal.fire({
      // content: el,
      title: this.upgradePlan,
      text: planName,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan,
      cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,


      // buttons: {
      //   cancel: this.cancel,
      //   catch: {
      //     text: this.upgradePlan,
      //     value: "catch",
      //   },
      // },
      dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.payIsVisible) {
          this.logger.log('[HISTORY & NORT-CONVS] HERE 1')
          if (this.USER_ROLE === 'owner') {
            this.logger.log('[HISTORY & NORT-CONVS] HERE 2')
            if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
              this.logger.log('[HISTORY & NORT-CONVS] HERE 3')
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true && (this.profile_name === PLAN_NAME.A || this.profile_name === PLAN_NAME.D)) {
              this.notify._displayContactUsModal(true, 'upgrade_plan');
            } else if (this.prjct_profile_type === 'free') { // && this.trial_expired === true
              this.logger.log('[HISTORY & NORT-CONVS] HERE 4')
              this.router.navigate(['project/' + this.projectId + '/pricing']);
            }
          } else {
            this.logger.log('[HISTORY & NORT-CONVS] HERE 5')
            this.presentModalOnlyOwnerCanManageTheAccountPlan();
          }
        } else {
          this.logger.log('[DEPT-EDIT-ADD] HERE 6')
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    });
  }

  // Export CSV
  exportRequestsToCSV() {
    if (!this.overridePay) {
      if (this.payIsVisible) {
        const isAvailable = this.checkPlanAndPresentModal()
        this.logger.log('[HISTORY & NORT-CONVS] isAvaibleFromPlan ', isAvailable)
        if (isAvailable === false) {
          return
        }
        this.dwnldCSV()


      } else {
        this.notify._displayContactUsModal(true, 'upgrade_plan');
      }
    } else {

      const isAvailable = this.checkPlanAndPresentModalContactUs()
      this.logger.log('[WS-REQUESTS-MSGS] feature is available ', isAvailable, 'overridePay ', this.overridePay)
      if (isAvailable === false) {
        return
      }
      this.dwnldCSV()
    }
  }

  dwnldCSV() {
    this.wsRequestsService.downloadHistoryRequestsAsCsv(this.requests_status, this.queryString, this._preflight, 0).subscribe((requests: any) => {
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
    // this.logger.log('[HISTORY & NORT-CONVS] - EXPORT DATA IS AVAILABLE '
  }

  presentModalAppSumoFeautureAvailableFromBPlan() {
    // const el = document.createElement('div')
    // el.innerHTML = 'Available with ' + this.appSumoProfilefeatureAvailableFromBPlan
    Swal.fire({
      title: this.upgradePlan,
      text: 'Available with ' + this.appSumoProfilefeatureAvailableFromBPlan,
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      confirmButtonText: this.upgradePlan,
      cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      reverseButtons: true,

      // content: el,
      // buttons: {
      //   cancel: this.cancel,
      //   catch: {
      //     text: this.upgradePlan,
      //     value: "catch",
      //   },
      // },
      // dangerMode: false,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.USER_ROLE === 'owner') {
          this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
        } else {
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }
    });
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

  goToBotProfile(bot, bot_id, bot_type) {
    this.logger.log('[HISTORY & NORT-CONVS] - goToBotProfile  ', bot)
    let botType = ''
    if (bot_type === 'internal') {
      botType = 'native'
      if (this.ROLE_IS_AGENT === false) {
        this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot_id, botType]);
      }

    } else if (bot_type === 'tilebot') {
      botType = 'tilebot'
      if (this.ROLE_IS_AGENT === false) {
        // this.router.navigate(['project/' + this.projectId + '/tilebot/intents/', bot_id, botType]);
        goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)
      }
    } else {
      botType = bot_type
      if (this.ROLE_IS_AGENT === false) {
        this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);
      }
    }
  }




  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
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

  reopenArchivedRequest(request, request_id) {
    this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - REQUEST ID', request_id)
    this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - REQUEST ', request)
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

    const requestclosedAt = moment(request['closed_at']);
    this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - requestclosedAt ', requestclosedAt)
    const currentTime = moment();
    this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - currentTime ', currentTime)


    const daysDiff = currentTime.diff(requestclosedAt, 'd');
    this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - daysDiff ', daysDiff)


    if (daysDiff > 10) {
      this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST - THE CONVERSATION HAS BEEN ARCHIVED FOR MORE THAN 10 DAYS  ')
      this.presentModalReopenConvIsNotPossible()
    } else {
      // this.logger.log(moment(closedAtPlusTen).isSame(today))
      this.reopenConversation(request_id)

      this.logger.log('[HISTORY & NORT-CONVS] - REOPEN ARCHIVED REQUEST -  THE CONVERSATION HAS BEEN ARCHIVED FOR LESS THAN 10 DAYS  ')
    }
  }

  presentModalReopenConvIsNotPossible() {
    swal({
      title: this.warningMsg,
      text: this.conversationsCannotBeReopened,
      icon: "warning",
      button: "OK",
      dangerMode: false,
    })
  }


  reopenConversation(request_id) {
    this.wsRequestsService.unarchiveRequest(request_id).subscribe((res: any) => {
      this.logger.log('[HISTORY & NORT-CONVS]  REOPEN ARCHIVED REQUEST ', res)

    }, (error) => {
      this.logger.error('[HISTORY & NORT-CONVS]  REOPEN ARCHIVED REQUEST - ERROR ', error);


    }, () => {
      this.logger.log('[HISTORY & NORT-CONVS]  REOPEN ARCHIVED REQUEST * COMPLETE *');
      for (var i = 0; i < this.requestList.length; i++) {

        if (this.requestList[i].request_id === request_id) {
          // this.logger.log('[HISTORY & NORT-CONVS]  REOPEN ARCHIVED  id of the REQUEST  REOPENED ', this.requestList[i].request_id);
          this.requestList.splice(i, 1);
        }

      }
    })
  }

}
