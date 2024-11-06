import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef, isDevMode, AfterViewInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../core/auth.service'
import { Project } from '../models/project-model'
import { UsersService } from '../services/users.service'
import { NotifyService } from '../core/notify.service'
import { TranslateService } from '@ngx-translate/core'
import { ProjectPlanService } from '../services/project-plan.service'
import { Subscription } from 'rxjs'
import { AppConfigService } from '../services/app-config.service'
import { avatarPlaceholder, getColorBck, PLAN_SEATS, PLAN_NAME, APP_SUMO_PLAN_NAME, APPSUMO_PLAN_SEATS } from '../utils/util'
import { URL_understanding_default_roles } from '../utils/util'
import { LoggerService } from '../services/logger/logger.service'
import { BrandService } from 'app/services/brand.service'
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component'
import { takeUntil } from 'rxjs/operators'
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { UserModalComponent } from './user-modal/user-modal.component'
import { WsRequestsService } from 'app/services/websocket/ws-requests.service'
import { MessagesStatsModalComponent } from 'app/components/modals/messages-stats-modal/messages-stats-modal.component'
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar'
import * as moment from 'moment';
import { ProjectUser } from 'app/models/project-user'

const swal = require('sweetalert')

@Component({
  selector: 'appdashboard-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent extends PricingBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  private unsubscribe$: Subject<any> = new Subject<any>();
  PLAN_NAME = PLAN_NAME;
  PLAN_SEATS = PLAN_SEATS;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  APPSUMO_PLAN_SEATS = APPSUMO_PLAN_SEATS;


  public_Key: string
  showSpinner = true
  projectUsersList: any
  pendingInvitationList: any

  id_projectUser: string
  user_firstname: string
  user_lastname: string
  user_id: string

  // set to none the property display of the modal
  display = 'none'
  displayCancelInvitationModal = 'none'
  project: Project

  USER_ROLE: string
  CURRENT_USER_ID: string
  CURRENT_USER: any
  IS_AVAILABLE: boolean
  countOfPendingInvites: number

  changeAvailabilitySuccessNoticationMsg: string
  changeAvailabilityErrorNoticationMsg: string

  deleteProjectUserSuccessNoticationMsg: string
  deleteProjectUserErrorNoticationMsg: string

  id_project: string
  projectPlanAgentsNo: number
  prjct_profile_name: string
  browserLang: string
  prjct_profile_type: any;
  subscription_is_active: any
  subscription_end_date: any
  seatsLimit: any;
  trial_expired: any;
  tParamsFreePlanSeatsNum: any;
  tParamsPlanAndSeats: any;
  projectUsersLength: number


  HAS_FINISHED_GET_PROJECT_USERS = false
  HAS_FINISHED_GET_PENDING_USERS = false
  pendingInvitationEmail: string

  resendInviteSuccessNoticationMsg: string
  resendInviteErrorNoticationMsg: string

  pendingInvitationIdToCancel: string
  pendingInvitationEmailToCancel: string

  canceledInviteSuccessMsg: string
  canceledInviteErrorMsg: string
  subscription: Subscription
  isVisibleGroups: boolean;
  areActivePay: boolean;
  isVisibleAnalytics: boolean;
  storageBucket: string

  baseUrl: string

  CHAT_BASE_URL: string
  IS_BUSY: boolean

  @ViewChildren('divItem') divItems: QueryList<ElementRef>

  useTrackById = true

  onlyOwnerCanManageTheAccountPlanMsg: string
  learnMoreAboutDefaultRoles: string

  UPLOAD_ENGINE_IS_FIREBASE: boolean
  profile_name: string
  IS_OPEN_SETTINGS_SIDEBAR: boolean
  isChromeVerGreaterThan100: boolean
  prjct_id: string;
  prjct_name: string;
  appSumoProfile: string;
  displayInviteTeammateBtn: string;
  dialogRef: MatDialogRef<any>;
  public hideHelpLink: boolean;
  agentsCannotInvite: string;
  widthOfLargestDiv: any;
  // tagsArray: Array<any> = [];
  // displayAvatarNoProfileFoto: boolean = false

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    public notify: NotifyService,
    private translate: TranslateService,
    public prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public brandService: BrandService,
    public dialog: MatDialog,
    public wsRequestsService: WsRequestsService,
    private clipboard: Clipboard,
    private _snackBar: MatSnackBar

  ) {
    super(prjctPlanService, notify);
    this.tParamsFreePlanSeatsNum = { free_plan_allowed_seats_num: PLAN_SEATS.free }
    const brand = brandService.getBrand();
    this.displayInviteTeammateBtn = brand['display_invite_teammate_btn'];
    this.logger.log('[USERS] displayInviteTeammateBtn ', this.displayInviteTeammateBtn)
    this.hideHelpLink = brand['DOCS'];
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject()
    this.getUploadEgineAndProjectUsers()
    this.translateStrings()
    // this.getAllUsersOfCurrentProject(); // MOVED IN GET STORAGE BUCKET
    this.getCurrentProject()
    this.getProjectUserRole()
    this.getLoggedUser()
    this.hasChangedAvailabilityStatusInSidebar()
    this.getPendingInvitation()
    this.getProjectPlan()
    this.getOSCODE()
    this.getChatUrl()
    this.listenSidebarIsOpened();
    this.getBrowserVersion()
    this.getDashboardCurrentLang()
  }
  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   this.displayAvatarNoProfileFoto = true
    // }, 500);
  }

  getDashboardCurrentLang() {
    const browserLang = this.translate.getBrowserLang();
    if (this.auth.user_bs && this.auth.user_bs.value) {
      this.logger.log('[USERS] this.auth.user_bs.value._id ', this.auth.user_bs.value._id)
      const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
      this.logger.log('[USERS] stored_preferred_lang', stored_preferred_lang)
      let dshbrd_lang = ''
      if (browserLang && !stored_preferred_lang) {
        dshbrd_lang = browserLang
      } else if (browserLang && stored_preferred_lang) {
        dshbrd_lang = stored_preferred_lang
      }

      this.logger.log('[USERS] dshbrd_lang', dshbrd_lang)

      this.calculateWidthOfRoleDiv(dshbrd_lang)


      moment.locale(dshbrd_lang)
    }
  }

  // When a new language is added to obtain the width to be set, uncomment the method this.getWidthOfRoleDiv()
  calculateWidthOfRoleDiv(dshbrd_lang) {
    if (dshbrd_lang === 'ar') {
      this.widthOfLargestDiv = 55 + 'px'
    }
    if (dshbrd_lang === 'az' || dshbrd_lang === 'de' || dshbrd_lang === 'en' || dshbrd_lang === 'sv' || dshbrd_lang === 'uz') {
      this.widthOfLargestDiv = 105 + 'px'
    }

    if (dshbrd_lang === 'es' || dshbrd_lang === 'pt') {
      this.widthOfLargestDiv = 108 + 'px'
    }

    if (dshbrd_lang === 'fr') {
      this.widthOfLargestDiv = 112 + 'px'
    }

    if (dshbrd_lang === 'it') {
      this.widthOfLargestDiv = 117 + 'px'
    }

    if (dshbrd_lang === 'kk') {
      this.widthOfLargestDiv = 93 + 'px'
    }

    if (dshbrd_lang === 'ru' || dshbrd_lang === 'sr') {
      this.widthOfLargestDiv = 124 + 'px'
    }

    if (dshbrd_lang === 'tr') {
      this.widthOfLargestDiv = 70 + 'px'
    }

    if (dshbrd_lang === 'uk') {
      this.widthOfLargestDiv = 115 + 'px'
    }
  }





  ngOnDestroy() {
    // this.subscription.unsubscribe()
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  presentDialogResetBusy() {
    this.logger.log('[USERS] presentDialogResetBusy ')
    if (this.dialogRef) {
      this.dialogRef.close();
      return
    }
    this.dialogRef = this.dialog.open(UserModalComponent, {
      width: '600px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {},
    });



    this.dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[USERS] Dialog result: ${result}`);
      this.dialogRef = null
    });
  }

  opeUserMsgsStats(user) {
    this.logger.log('[USERS] opeUserMsgsStats  user', user)

    const statsDialogRef = this.dialog.open(MessagesStatsModalComponent, {
      width: '800px',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: { agent: user },
    });

    this.logger.log('[USERS] opeUserMsgsStats  statsDialogRef ', statsDialogRef)

    statsDialogRef.afterClosed().subscribe(agentId => {
      this.logger.log(`[USERS] Dialog afterClosed agentId: ${agentId}`);
      if (agentId) {
        const statBtnEl = <HTMLElement>document.querySelector('#btn-' + `${agentId}`);
        this.logger.log('[USERS] Dialog afterClosed statBtnEl', statBtnEl);
        statBtnEl.blur()
      }
    });
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log('[USERS] getAppConfig - public_Key', this.public_Key)

    let keys = this.public_Key.split('-')
    keys.forEach((key) => {
      if (key.includes('GRO')) {
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - key', key);
        let gro = key.split(':')
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro key&value', gro);

        if (gro[1] === 'F') {
          this.isVisibleGroups = false
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro isVisibleGroups', this.isVisibleGroups);
        } else {
          this.isVisibleGroups = true
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro isVisibleGroups', this.isVisibleGroups);
        }
      }

      if (key.includes('PAY')) {
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - key', key);
        let gro = key.split(':')
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro key&value', gro);

        if (gro[1] === 'F') {
          this.areActivePay = false
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - areActivePay', this.areActivePay);
        } else {
          this.areActivePay = true
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - areActivePay', this.areActivePay);
        }
      }

      if (key.includes("ANA")) {

        let ana = key.split(":");

        if (ana[1] === "F") {
          this.isVisibleAnalytics = false;
          this.logger.log('[USERS] - PUBLIC-KEY (Users) - isVisibleAnalytics', this.isVisibleAnalytics);
        } else {
          this.isVisibleAnalytics = true;
          this.logger.log('[USERS] - PUBLIC-KEY (Users) - isVisibleAnalytics', this.isVisibleAnalytics);
        }
      }

    })

    if (!this.public_Key.includes("GRO")) {
      this.isVisibleGroups = false;
    }

    if (!this.public_Key.includes("PAY")) {
      this.areActivePay = false;
    }

    if (!this.public_Key.includes("ANA")) {
      this.isVisibleAnalytics = false;
    }
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        if (project) {
          this.project = project;
          this.id_project = project._id;
          this.logger.log('[USERS] - GET CURRENT PROJECT -> project ID', this.id_project)
        }
      })
  }


  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[USERS] LOGGED USER GET IN USERS-COMP - USER', user)
        if (user) {
          this.CURRENT_USER = user;
          this.CURRENT_USER_ID = user._id;
          this.logger.log('[USERS] LOGGED USER GET IN USERS-COMP - Current USER ID ', this.CURRENT_USER_ID)
        }
      })
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.USER_ROLE = user_role
        this.logger.log('[USERS] - GET PROJECT USER ROLE - USER_ROLE : ', this.USER_ROLE)
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[USERS] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    })
  }

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL
    this.logger.log('[USERS] getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL)
  }

  chatWithAgent(agentId, agentFirstname, agentLastname) {
    this.logger.log('[USERS] - CHAT WITH AGENT - agentId: ', agentId, ' - agentFirstname: ', agentFirstname, ' - agentLastname: ', agentLastname)

    // https://support-pre.tiledesk.com/chat/index.html?recipient=5de9200d6722370017731969&recipientFullname=Nuovopre%20Pre
    // https://support-pre.tiledesk.com/chat/index.html?recipient=5dd278b8989ecd00174f9d6b&recipientFullname=Gian Burrasca
    // const url = this.CHAT_BASE_URL + '?' + 'recipient=' + agentId + '&recipientFullname=' + agentFirstname + ' ' + agentLastname;
    let agentFullname = ''
    if (agentLastname) {
      agentFullname = agentFirstname + ' ' + agentLastname
    } else {
      agentFullname = agentFirstname
    }
    const url = this.CHAT_BASE_URL + '#/conversation-detail/' + agentId + '/' + agentFullname + '/new'
    this.logger.log('[USERS] - CHAT WITH AGENT - CHAT URL ', url)
    window.open(url, '_blank')
  }

  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang()
    this.logger.log('[USERS] - BRS LANG ', this.browserLang)
  }


  // !! No more used - replaced by goToEditUser
  // goToMemberProfile(member_id: string) {
  //   this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
  // }

  goToEditUser(projectUser_id) {
    this.router.navigate(['project/' + this.id_project + '/user/edit/' + projectUser_id])
  }

  goToGroups() {
    this.logger.log('[USERS] - goToGroups')
    this.router.navigate(['project/' + this.id_project + '/groups'])
  }

  goToPendingInvitation() {
    this.logger.log('[USERS] - goToPendingInvitation')
    this.router.navigate(['project/' + this.id_project + '/users/pending'])
  }

  goToTeammatesRolesDoc() {
    const url = URL_understanding_default_roles
    window.open(url, '_blank')
  }

  goToPricing() {
    this.router.navigate(['project/' + this.id_project + '/pricing']);
  }

  getMoreOperatorsSeats() {
    if (this.USER_ROLE === 'owner') {
      if (this.prjct_profile_type === 'free') {


        if (this.projectUsersLength + this.countOfPendingInvites > this.seatsLimit) {

          this.notify._displayContactUsModal(true, 'seats_limit_reached')
        } else if (this.projectUsersLength + this.countOfPendingInvites <= this.seatsLimit) {
          this.router.navigate(['project/' + this.id_project + '/pricing']);
        }
      } else {
        if (this.projectUsersLength + this.countOfPendingInvites > this.seatsLimit) {
          this.notify._displayContactUsModal(true, 'seats_limit_exceed')
        } else if (this.projectUsersLength + this.countOfPendingInvites === this.seatsLimit) {
          this.notify._displayContactUsModal(true, 'seats_limit_reached');
        } else if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      }
    } else if (this.USER_ROLE === 'admin') {

      if (this.prjct_profile_type === 'free') {
        if (this.projectUsersLength + this.countOfPendingInvites > this.seatsLimit) {

          this.notify._displayContactOwnerModal(true, 'seats_limit_reached')
        } else if (this.projectUsersLength + this.countOfPendingInvites <= this.seatsLimit) {
          // this.router.navigate(['project/' + this.id_project + '/pricing']);
          this.notify._displayContactOwnerModal(true, 'upgrade_plan');
        }
      } else {
        this.logger.log('[USERS] getMoreOperatorsSeats USE CASE ADMIN')
        if (this.projectUsersLength + this.countOfPendingInvites > this.seatsLimit) {
          this.notify._displayContactOwnerModal(true, 'seats_limit_exceed')
        } else if (this.projectUsersLength + this.countOfPendingInvites === this.seatsLimit) {
          this.notify._displayContactOwnerModal(true, 'seats_limit_reached');
        } else if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
          this.notify._displayContactOwnerModal(true, 'upgrade_plan');
        }
      }
    }

  }

  presentContactUsModal() {
    if (this.USER_ROLE === 'owner') {
      this.notify._displayContactUsModal(true, 'seats_limit_exceed')
    } else {
      this.notify._displayContactOwnerModal(true, 'seats_limit_exceed')
    }
  }

  presentGoToPricingModal() {
    if (this.USER_ROLE === 'owner') {
      this.notify.displayGoToPricingModal('user_exceeds')
    } else {
      this.notify._displayContactOwnerModal(true, 'seats_limit_exceed')
    }
  }


  // openModalTrialExpired() {
  //   if (this.USER_ROLE === 'owner') {
  //     this.notify.displayTrialHasExpiredModal(this.id_project);
  //   } else {
  //     this.presentModalOnlyOwnerCanManageTheAccountPlan();
  //   }
  // }

  openModalSubsExpired() {
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(
          true,
          this.prjct_profile_name,
          this.subscription_end_date,
        )
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(
          true,
          this.prjct_profile_name,
          this.subscription_end_date,
        )
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  _getMoreOperatorsSeats() {
    if (this.USER_ROLE === 'owner') {
      if (!this.appSumoProfile) {
        this.notify._displayContactUsModal(true, 'upgrade_plan')
      } else {
        this.router.navigate(['project/' + this.prjct_id + '/project-settings/payments']);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }



  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(
      this.onlyOwnerCanManageTheAccountPlanMsg,
      this.learnMoreAboutDefaultRoles,
    )
    // https://github.com/t4t5/sweetalert/issues/845
  }
  presentModalAgentCannotInviteTeammates() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentsCannotInvite, this.learnMoreAboutDefaultRoles)
  }


  getUploadEgineAndProjectUsers() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true
      this.logger.log('[USERS] - UPLOAD ENGINE IS FIREBASE ? ', this.UPLOAD_ENGINE_IS_FIREBASE)
      this.getProjectUsersAndCheckIfPhotoExistOnFirebase()
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false
      this.logger.log('[USERS] - UPLOAD ENGINE IS FIREBASE ? ', this.UPLOAD_ENGINE_IS_FIREBASE)
      this.getProjectUsersAndCheckIfPhotoExistOnNative()
    }
  }

  getProjectUsersAndCheckIfPhotoExistOnFirebase() {
    const firebase_conf = this.appConfigService.getConfig().firebase
    this.storageBucket = firebase_conf['storageBucket']
    this.logger.log('[USERS] - IMAGE STORAGE URL (usecase FIREBASE) ', this.storageBucket,
    )

    this.getAllUsersOfCurrentProject(this.storageBucket)
  }

  getProjectUsersAndCheckIfPhotoExistOnNative() {
    this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL
    this.logger.log('[USERS] - IMAGE STORAGE URL (usecase NATIVE) ', this.baseUrl)
    this.getAllUsersOfCurrentProject(this.baseUrl)
  }

  getAllUsersOfCurrentProject(storage) {
    let users_id_array = [];
    this.usersService.getProjectUsersByProjectId().subscribe(
      (projectUsers: any) => {

        this.logger.log('[USERS] - GET PROJECT USERS - PROJECT-USERS ', projectUsers)

        if (projectUsers) {
          this.projectUsersList = projectUsers

          let order = { owner: 1, admin: 2, agent: 3 };
          this.projectUsersList.sort(function (a, b) {
            return order[a.role] - order[b.role];
          });

          this.projectUsersList.forEach((projectuser) => {
            // -----------------------------------------------------------------------------------------------
            // Used to get  the number of assigned conversatons (in realtime)
            // se the method this.getFlatMembersArrayFromAllRequestsAndRunGetOccurrence() - actually commented
            // -----------------------------------------------------------------------------------------------
            // const _user_id = projectuser['id_user']['_id']
            // users_id_array.push(_user_id);
            // this.logger.log('[USERS] - PROJECT-USER - users_id_array', users_id_array)

            let imgUrl = ''
            if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
              imgUrl = 'https://firebasestorage.googleapis.com/v0/b/' + storage + '/o/profiles%2F' + projectuser['id_user']['_id'] + '%2Fphoto.jpg?alt=media'
              // this.logger.log('[USERS] - PROJECT USERS imgUrl (usecase firebase)', imgUrl);
            } else {
              imgUrl = storage + 'images?path=uploads%2Fusers%2F' + projectuser['id_user']['_id'] + '%2Fimages%2Fthumbnails_200_200-photo.jpg'
              // this.logger.log('[USERS] - PROJECT USERS imgUrl (usecase native)', imgUrl);
            }

            this.checkImageExists(imgUrl, (existsImage) => {
              if (existsImage == true) {
                this.logger.log('[USERS] - IMAGE EXIST X PROJECT USERS', projectuser)
                projectuser.hasImage = true
              } else {
                this.logger.log('[USERS] - IMAGE NOT EXIST X PROJECT USERS', projectuser)
                projectuser.hasImage = false
              }
            })

            if (projectuser && projectuser['id_user']) {
              this.createProjectUserAvatar(projectuser['id_user'])
            }
          })

          this.projectUsersLength = projectUsers.length
          this.logger.log('[USERS] - GET PROJECT USERS (FILTERED FOR PROJECT ID) Length  ', this.projectUsersLength)
        }
      }, (error) => {
        this.showSpinner = false
        this.logger.error('[USERS] - GET PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error)
      }, () => {
        this.HAS_FINISHED_GET_PROJECT_USERS = true
        this.showSpinner = false;
        this.logger.log('[USERS] - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE')
        // setTimeout(() => {
        //   this.getWidthOfRoleDiv()
        // }, 2000);

        // this.getFlatMembersArrayFromAllRequestsAndRunGetOccurrence(users_id_array)
      },
    )
  }

  getFlatMembersArrayFromAllRequestsAndRunGetOccurrence(users_id_array) {
    this.logger.log('[USERS] CALL GET COUNT OF REQUEST FOR AGENT');

    // this.subscription = this.requestsService.allRequestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$.subscribe((requests) => {
      this.logger.log('[USERS] - !!!!! SUBSCRIPTION TO ALL-THE-REQUESTS-LIST-BS');

      if (requests) {
        this.logger.log('[USERS] - !!!!! REQUESTS LENGHT ', requests.length)

        /**
         * NK:
         * CREATES AN UNIQUE ARRAY FROM ALL THE ARRAYS OF 'MEMBERS' THAT ARE NESTED IN THE ITERATED REQUESTS  */
        let flat_members_array = [];

        for (let i = 0; i < requests.length; i++) {
          // flat_members_array = flat_members_array.concat(Object.keys(requests[i].members));
          flat_members_array = flat_members_array.concat(requests[i].participants);
        }
        // Result of the concatenation of the single arrays of members
        this.logger.log('[USERS] - !!!!! FLAT-MEMBERS-ARRAY  ', flat_members_array)
        this.logger.log('[USERS] - !!!!! USER_ID_ARRAY - LENGTH ', users_id_array.length);
        /**
         * FOR EACH USER-ID IN THE 'USER_ID_ARRAY' IS RUNNED 'getOccurrenceAndAssignToProjectUsers'
         * THAT RETURNS THE COUNT OF HOW MAMY TIMES THE USER-ID IS PRESENT IN THE 'flat_members_array' AND THEN
         * ASSIGN THE VALUE OF 'COUNT' TO THE PROPERTY 'VALUE' OF THE OBJECT 'PROJECT-USERS' */

        if (flat_members_array) {
          for (let i = 0; i < users_id_array.length; i++) {
            this.logger.log('[USERS] - !!!!! USER_ID_ARRAY - LENGTH ', users_id_array.length);
            this.getOccurrenceAndAssignToProjectUser(flat_members_array, users_id_array[i])
          }
        }
      }
    });
  }

  getOccurrenceAndAssignToProjectUser(array, value) {
    this.logger.log('[USERS] - !!!!! CALLING GET OCCURRENCE REQUESTS FOR AGENT AND ASSIGN TO PROJECT USERS');
    let count = 0;
    array.forEach((v) => (v === value && count++));
    this.logger.log('[USERS] - !!!!! #', count, ' REQUESTS ASSIGNED TO THE USER ', value);
    for (const p of this.projectUsersList) {
      if (value === p.id_user._id) {
        p.assigned_requests = count
      }
    }
    this.logger.log('[USERS]  GET OCCURRENCE REQUESTS FOR AGENT projectUsersList ', this.projectUsersList)
    // this.showSpinner = false;
    // this.logger.log('!!! ANALYTICS - !!!!! SHOW SPINNER', this.showSpinner);
    return count;
  }



  getWidthOfRoleDiv() {
    let roleDivEl = document.querySelectorAll<HTMLElement>("#pu-role");
    this.logger.log('[USERS] roleDivEl all', roleDivEl)
    let arrayUserRoleDivWidth = []
    for (var i = 0; i < roleDivEl.length; i++) {
      this.logger.log('roleDivEl: ', roleDivEl[i]);
      let roleDivElWidth = roleDivEl[i].offsetWidth;
      this.logger.log('[USERS] roleDivElWidth offsetWidth', roleDivElWidth)
      let roleDivElWidthPlusPadding = roleDivElWidth + 20
      arrayUserRoleDivWidth.push(roleDivElWidthPlusPadding)
    }
    this.logger.log('[USERS] arrayUserRoleDivWidth', arrayUserRoleDivWidth)
    this.widthOfLargestDiv = Math.max(...arrayUserRoleDivWidth) + 'px'
    this.logger.log('[USERS] widthOfLargestDiv', this.widthOfLargestDiv)

  }

  // imageOnError(event, userid) {
  //   this.logger.log('[USERS] - imageOnError event ', event)
  //   this.logger.log('[USERS] - imageOnError userid', userid)

  //   const photoProfileImageEl = <HTMLElement>document.querySelector('#img-' + `${userid}`);
  //   this.logger.log('[USERS] - imageOnError photoProfileImageEl', photoProfileImageEl)
  //   // photoProfileImageEl.classList.add('broken-image')
  //   photoProfileImageEl.style.display = 'none'
  // }

  createProjectUserAvatar(user) {
    this.logger.log('[USERS] - createProjectUserAvatar ', user)
    let fullname = ''
    if (user && user.firstname && user.lastname) {
      fullname = user.firstname + ' ' + user.lastname
      user['fullname_initial'] = avatarPlaceholder(fullname)
      user['fillColour'] = getColorBck(fullname)
    } else if (user && user.firstname) {
      fullname = user.firstname
      user['fullname_initial'] = avatarPlaceholder(fullname)
      user['fillColour'] = getColorBck(fullname)
    } else {
      user['fullname_initial'] = 'N/A'
      user['fillColour'] = 'rgb(98, 100, 167)'
    }
  }

  checkImageExists(imageUrl, callBack) {
    var imageData = new Image()
    imageData.onload = function () {
      callBack(true)
    }
    imageData.onerror = function () {
      callBack(false)
    }
    imageData.src = imageUrl
  }

  getPendingInvitation() {
    this.usersService.getPendingUsers().subscribe(
      (pendingInvitation: any) => {
        this.logger.log('[USERS] - GET PENDING INVITATION - RES', pendingInvitation)

        if (pendingInvitation) {
          this.pendingInvitationList = pendingInvitation
          this.countOfPendingInvites = pendingInvitation.length
          this.logger.log('[USERS] - GET PENDING INVITATION - # OF PENDING INVITATION ', this.countOfPendingInvites)
        }
      }, (error) => {
        // this.showSpinner = false
        this.logger.error('[USERS] - GET PENDING INVITATION - ERROR', error)
      }, () => {
        this.logger.log('[USERS] - GET PENDING INVITATION * COMPLETE * ')
        this.HAS_FINISHED_GET_PENDING_USERS = true
        // this.showSpinner = false
      },
    )
  }

  resendInvite(pendingInvitationId: string) {
    this.logger.log('[USERS] - RESEND INVITE TO PENDING INVITATION ID: ', pendingInvitationId)
    this.usersService
      .getPendingUsersByIdAndResendEmail(pendingInvitationId)
      .subscribe(
        (pendingInvitation: any) => {
          this.logger.log('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - RES ', pendingInvitation)

          this.pendingInvitationEmail = pendingInvitation['Resend invitation email to']['email']
          this.logger.log('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - RES  email', this.pendingInvitationEmail)
        }, (error) => {
          this.logger.error('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - ERROR', error)

          this.notify.showWidgetStyleUpdateNotification(this.resendInviteErrorNoticationMsg, 4, 'report_problem')
        }, () => {
          this.logger.log('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - COMPLETE')
          // =========== NOTIFY SUCCESS===========
          this.notify.showWidgetStyleUpdateNotification(this.resendInviteSuccessNoticationMsg + this.pendingInvitationEmail, 2, 'done')
        },
      )
  }

  copyInviteURL(pendingInvitationId) {
    const copyInviteUrlBtnEl = <HTMLElement>document.querySelector('#btn-copy-' + `${pendingInvitationId}`);
    this.logger.log('[USERS] copyInviteURL copyInviteUrlBtnEl ', copyInviteUrlBtnEl);
    copyInviteUrlBtnEl.blur()

    this.logger.log('[USERS] - copyInviteLink PENDING INVITATION ID: ', pendingInvitationId)
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL
    this.logger.log('[USERS] copyInviteLink CHAT_BASE_URL ', this.CHAT_BASE_URL)

    let domainURL = this.CHAT_BASE_URL.split('/').slice(0, -2).join('/')

    this.logger.log('[USERS] copyInviteLink domainURL ', domainURL)
    this.logger.log('[USERS] copyInviteLink CURRENT_USER ', this.CURRENT_USER)
    this.logger.log('[USERS] copyInviteLink project ', this.project)
    let projectName = this.project.name.trim()
    let userFirstname = ""
    let userLastmame = ""
    let inviteUrl = ""
    if (this.CURRENT_USER.firstname && this.CURRENT_USER.lastname !== "") {
      userFirstname = this.CURRENT_USER.firstname
      userLastmame = this.CURRENT_USER.lastname
      inviteUrl = domainURL + "/dashboard/#/handle-invitation/" + pendingInvitationId + '/' + projectName + '/' + userFirstname + '/' + userLastmame
    } else if (this.CURRENT_USER.firstname && this.CURRENT_USER.lastname == "") {
      userFirstname = this.CURRENT_USER.firstname
      inviteUrl = domainURL + "/dashboard/#/handle-invitation/" + pendingInvitationId + '/' + projectName + '/' + userFirstname
    }


    this.clipboard.copy(inviteUrl.trim())
    this._snackBar.open(" Copied to clipboard", null, {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'success-snackbar'
    });
  }


  openCancelInvitationModal(pendingInvitationId: string, pendingInvitationEmail: string) {
    this.displayCancelInvitationModal = 'block'
    this.logger.log('[USERS] openCancelInvitationModal pendingInvitationId: ', pendingInvitationId, ' pendingInvitationEmail: ', pendingInvitationEmail)

    this.pendingInvitationIdToCancel = pendingInvitationId
    this.pendingInvitationEmailToCancel = pendingInvitationEmail
  }

  closeCancelInvitationModal() {
    this.displayCancelInvitationModal = 'none'
  }

  deletePendinInvitation() {
    this.displayCancelInvitationModal = 'none'
    this.logger.log(
      '[USERS] - DELETE PENDING INVITATION - INVITATION ID ',
      this.pendingInvitationIdToCancel,
    )
    this.usersService
      .deletePendingInvitation(this.pendingInvitationIdToCancel)
      .subscribe(
        (pendingInvitation: any) => {
          this.logger.log(
            '[USERS] DELETE PENDING INVITATION  RES ',
            pendingInvitation,
          )
        }, (error) => {
          this.logger.error('[USERS] DELETE PENDING INVITATION - ERROR', error)
          this.notify.showWidgetStyleUpdateNotification(this.canceledInviteErrorMsg, 4, 'report_problem')
        }, () => {
          this.logger.log('[USERS] DELETE PENDING INVITATION * COMPLETE *')
          this.notify.showWidgetStyleUpdateNotification(this.canceledInviteSuccessMsg + this.pendingInvitationEmailToCancel, 2, 'done')
          this.getPendingInvitation()
        },
      )
  }

  goToAddUser() {
    this.logger.log('[USERS] INVITE USER (GOTO) No of Project Users ', this.projectUsersLength)
    this.logger.log('[USERS] INVITE USER (GOTO) No of Pending Invites ', this.countOfPendingInvites)
    this.logger.log('[USERS] INVITE USER (GOTO) No of Operators Seats (agents purchased)', this.projectPlanAgentsNo)

    // this.router.navigate(['project/' + this.id_project + '/user/add']);
    // if (this.prjct_profile_type === 'payment') {

    if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.id_project + '/user/add'])
      } else {
        this.presentModalAgentCannotInviteTeammates()
      }
    } else if (this.projectUsersLength + this.countOfPendingInvites === this.seatsLimit) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'free') {
          this.presentGoToPricingModal()
        } else if (this.prjct_profile_type === 'payment' && (this.subscription_is_active === false || this.subscription_is_active === true)) {
          this.notify._displayContactUsModal(true, 'seats_limit_reached')
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan()
      }

    } else if (this.projectUsersLength + this.countOfPendingInvites > this.seatsLimit) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'free') {
          this.presentGoToPricingModal()
        } else if (this.prjct_profile_type === 'payment' && (this.subscription_is_active === false || this.subscription_is_active === true)) {
          this.notify._displayContactUsModal(true, 'seats_limit_exceed')
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan()
      }
      // } else {
      //   this.router.navigate(['project/' + this.id_project + '/user/add'])
      // }
    }
  }




  openDeleteModal(
    projectUser_id: string,
    userID: string,
    userFirstname: string,
    userLastname: string,
  ) {
    this.display = 'block'
    this.id_projectUser = projectUser_id
    this.user_id = userID
    this.user_firstname = userFirstname
    this.user_lastname = userLastname

    this.logger.log(
      '[USERS] OPEN DELETE MODAL - PROJECT-USER with ID ',
      this.id_projectUser,
      ' - (Firstname: ',
      userFirstname,
      '; Lastname: ',
      userLastname,
      ')',
    )
  }

  onCloseDeleteModalHandled() {
    this.display = 'none'
    // this.logger.log('Confirm Delete Project-User');
    this.usersService.deleteProjectUser(this.id_projectUser).subscribe(
      (projectUsers: any) => {
        //  this.logger.log( '[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USERS - RES ', projectUsers,  )
        this.logger.log('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USER ID  ', this.id_projectUser,)
        // this.ngOnInit();
        if (!isDevMode()) {
          if (window['analytics']) {
            try {
              window['analytics'].page("Temmates list Page, Temmates", {

              });
            } catch (err) {
              this.logger.error('Account Deleted page error', err);
            }

            let userFullname = ''
            if (this.CURRENT_USER.firstname && this.CURRENT_USER.lastname) {
              userFullname = this.CURRENT_USER.firstname + ' ' + this.CURRENT_USER.lastname
            } else if (this.CURRENT_USER.firstname && !this.CURRENT_USER.lastname) {
              userFullname = this.CURRENT_USER.firstname
            }

            try {
              window['analytics'].identify(this.CURRENT_USER._id, {
                name: userFullname,
                email: this.CURRENT_USER.email,
                plan: this.prjct_profile_name

              });
            } catch (err) {
              this.logger.error('identify in Account Removed  error', err);
            }

            try {
              window['analytics'].track('Account Removed User', {
                "userId": projectUsers.id_user
              },
                {
                  "context": {
                    "groupId": this.id_project
                  }
                });
            } catch (err) {
              this.logger.error('track signin event error', err);
            }

            try {
              window['analytics'].group(this.project._id, {
                name: this.project.name,
                plan: this.prjct_profile_name,
              });
            } catch (err) {
              this.logger.error('group Signed Out error', err);
            }
          }
        }
      }, (error) => {
        this.showSpinner = false
        this.logger.error('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USERS - ERROR ', error)

        // NOTIFY ERROR
        this.notify.showWidgetStyleUpdateNotification(this.deleteProjectUserErrorNoticationMsg, 4, 'report_problem')
      }, () => {
        this.logger.log('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USERS * COMPLETE *')
        // NOTIFY SUCCESS
        this.notify.showWidgetStyleUpdateNotification(this.deleteProjectUserSuccessNoticationMsg, 2, 'done')

        for (let i = 0; i < this.projectUsersList.length; i++) {
          if (this.id_projectUser === this.projectUsersList[i]._id) {
            this.projectUsersList.splice(i, 1)
            this.projectUsersLength = this.projectUsersList.length
            localStorage.removeItem('dshbrd----' + this.id_projectUser)
          }
        }
      },
    )
  }

  onCloseModal() {
    this.display = 'none'
  }


  // New changeAvailabilityStatus(selecedstatusID: number, projectUser_id: string, ngselectid: number, $event: any) {
  changeAvailabilityStatus(selectedStatusValue: any, projectUser_id: string) {

    this.logger.log('[USERS] - UPDATE PROJECT USER STATUS - selectedStatusValue ', selectedStatusValue)
    this.logger.log('[USERS] - UPDATE PROJECT USER STATUS - PROJECT-USER ID ', projectUser_id)

    let IS_AVAILABLE = null
    let profilestatus = ''
    if (selectedStatusValue === 'available') {
      IS_AVAILABLE = true
    } else if (selectedStatusValue === 'unavailable') {
      IS_AVAILABLE = false
    } else if (selectedStatusValue === 'inactive') {
      IS_AVAILABLE = false
      profilestatus = 'inactive'
    }

    this.usersService.updateProjectUser(projectUser_id, IS_AVAILABLE, profilestatus)

      .subscribe((updatedProjectUser: any) => {
        this.logger.log('[USERS] - UPDATE PROJECT USER STATUS RES', updatedProjectUser)

        //  projectUser?.user_available === true && (projectUser?.profileStatus === ''
        //  projectUser?.user_available === false && (projectUser?.profileStatus === ''
        //  projectUser?.user_available === false && projectUser?.profileStatus === 'inactive'

        this.projectUsersList.forEach(projectUser => {
          if (projectUser._id === updatedProjectUser._id) {
            projectUser.user_available = updatedProjectUser.user_available
            if (updatedProjectUser.profileStatus) {
              projectUser.profileStatus = updatedProjectUser.profileStatus
            }
            else {
              projectUser.profileStatus = ''
            }
          }
        });


        // this.projectUsersList = this.projectUsersList.slice(0)
        this.logger.log('[USERS] - UPDATE PROJECT USER STATUS projectUsersList after update', this.projectUsersList)
        // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
        this.usersService.availability_switch_clicked(true)
      }, (error) => {
        this.logger.error('[USERS] - UPDATE PROJECT USER STATUS - ERROR ', error)

        //  NOTIFY ERROR
        this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem')
      }, () => {
        this.logger.log('[USERS] - UPDATE PROJECT USER STATUS * COMPLETE *')

        //  NOTIFY SUCCESS
        this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done')


        // this.getUploadEgineAndProjectUsers()
      },)
  }

  // IF THE AVAILABILITY STATUS IS CHANGED BY THE SIDEBAR AVAILABILITY / UNAVAILABILITY BUTTON
  // RE-RUN getAllUsersOfCurrentProject TO UPDATE THE LIST OF THE PROJECT' MEMBER
  hasChangedAvailabilityStatusInSidebar() {
    this.usersService.has_changed_availability_in_sidebar.subscribe(
      (has_changed_availability) => {
        // this.logger.log('[USERS] - SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE SIDEBAR', has_changed_availability)
        if (has_changed_availability === true) {
          this.getAllUsersOfCurrentProject(this.storageBucket)
        }
      },
    )
  }

  translateStrings() {
    this.translateChangeAvailabilitySuccessMsg()
    this.translateChangeAvailabilityErrorMsg()
    this.translateRemoveProjectUserSuccessMsg()
    this.translateRemoveProjectUserErrorMsg()
    this.translateResendInviteSuccessMsg()
    this.translateResendInviteErrorMsg()
    this.translateCanceledInviteSuccessMsg()
    this.translateCanceledInviteErrorMsg()

    this.translateModalOnlyOwnerCanManageProjectAccount()

  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate
      .get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation
      })

    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('PROJECT-EDIT-ADD  onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation
      })

    this.translate.get('TeammatesWithAgentRolesCannotInvite')
      .subscribe((translation: any) => {
        // this.logger.log('[USER-EDIT-ADD] - TRANSLATE onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.agentsCannotInvite = translation;
      });
  }


  // TRANSLATION
  translateChangeAvailabilitySuccessMsg() {
    this.translate
      .get('ChangeAvailabilitySuccessNoticationMsg')
      .subscribe((text: string) => {
        this.changeAvailabilitySuccessNoticationMsg = text
        // this.logger.log('[USERS] + + + change Availability Success Notication Msg', text)
      })
  }

  // TRANSLATION
  translateChangeAvailabilityErrorMsg() {
    this.translate
      .get('ChangeAvailabilityErrorNoticationMsg')
      .subscribe((text: string) => {
        this.changeAvailabilityErrorNoticationMsg = text
        // this.logger.log('[USERS] + + + change Availability Error Notication Msg', text)
      })
  }

  // TRANSLATION
  translateRemoveProjectUserSuccessMsg() {
    this.translate
      .get('RemoveProjectUserSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.deleteProjectUserSuccessNoticationMsg = text
        // this.logger.log('[USERS] + + + RemoveProjectUserSuccessNoticationMsg ', text)
      })
  }

  // TRANSLATION
  translateRemoveProjectUserErrorMsg() {
    this.translate
      .get('RemoveProjectUserErrorNoticationMsg')
      .subscribe((text: string) => {
        this.deleteProjectUserErrorNoticationMsg = text
        // this.logger.log('[USERS] + + + RemoveProjectUserErrorNoticationMsg ', text)
      })
  }


  translateCanceledInviteSuccessMsg() {
    this.translate
      .get('UsersPage.CanceledInviteSuccessMsg')
      .subscribe((text: string) => {
        this.canceledInviteSuccessMsg = text
        // this.logger.log('[USERS] + + + canceledInviteSuccessMsg Invite Success Notication Msg', text)
      })
  }

  translateCanceledInviteErrorMsg() {
    this.translate
      .get('UsersPage.CanceledInviteErrorMsg')
      .subscribe((text: string) => {
        this.canceledInviteErrorMsg = text
        // this.logger.log('[USERS] + + + canceledInviteErrorMsg Invite Success Notication Msg', text)
      })
  }

  translateResendInviteSuccessMsg() {
    this.translate
      .get('UsersPage.ResendInviteSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.resendInviteSuccessNoticationMsg = text
        // this.logger.log('[USERS] + + + resend Invite Success Notication Msg', text)
      })
  }

  translateResendInviteErrorMsg() {
    this.translate
      .get('UsersPage.ResendInviteErrorNoticationMsg')
      .subscribe((text: string) => {
        this.resendInviteErrorNoticationMsg = text
        // this.logger.log('[USERS] + + + resend Invite Error Notication Msg', text)
      })
  }





  // trackByFn(index, item) {
  //   this.logger.log('USER COMP ***** trackByFn ***** ', index)
  //   return index; // or
  //   // return item._id
  // }

  // trackImageId(index: number, projectUser: any) {
  //   this.logger.log('USER COMP ***** trackImageId ***** ',  projectUser['user_available'])
  //   return projectUser['user_available']
  // }

  // trackByIds = (index: number, item: any) => {
  //   this.logger.log('trackByIds', item)
  //   return this.useTrackById ? item.id : item;
  // }

}
