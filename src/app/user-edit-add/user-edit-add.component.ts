// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { NotifyService } from '../core/notify.service';
import { ProjectPlanService } from '../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { Location } from '@angular/common';
import { BrandService } from '../services/brand.service';
import { APPSUMO_PLAN_SEATS, APP_SUMO_PLAN_NAME, PLAN_NAME, PLAN_SEATS, URL_understanding_default_roles } from '../utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggerService } from '../services/logger/logger.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
const swal = require('sweetalert');

@Component({
  selector: 'app-user-edit-add',
  templateUrl: './user-edit-add.component.html',
  styleUrls: ['./user-edit-add.component.scss']
})
export class UserEditAddComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  // tparams = brand;
  PLAN_NAME = PLAN_NAME;
  PLAN_SEATS = PLAN_SEATS;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  APPSUMO_PLAN_SEATS = APPSUMO_PLAN_SEATS;
  tParamsFreePlanSeatsNum: any;
  tParamsPlanAndSeats: any;
  seatsLimit: any;
  trial_expired: any;
  tparams: any;

  CREATE_VIEW = false;
  EDIT_VIEW = false;

  project: Project;
  project_name: string;
  id_project: string;

  user_email: string;
  role: string;
  ROLE_NOT_SELECTED = true

  admin: string;
  agent: string;
  selected: any;

  display = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  INVITE_YOURSELF_ERROR: boolean;
  INVITE_OTHER_ERROR: boolean;
  INVITE_USER_ALREADY_MEMBER_ERROR: boolean;
  INVITE_USER_NOT_FOUND: boolean;
  PENDING_INVITATION_ALREADY_EXIST: boolean;

  project_user_id: string;
  user_role: string;
  EMAIL_IS_VALID = true;

  selectedRole: string;
  projectUsersLength: number;
  projectPlanAgentsNo: number;
  prjct_profile_type: any;
  countOfPendingInvites: number;
  subscription_is_active: any;
  subscription_end_date: any;
  prjct_profile_name: string;
  browserLang: string;
  subscription: Subscription;
  showSpinner = true;

  storageBucket: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  baseUrl: string;

  user_id: string;
  user_fullname: string;
  projectUser: any;
  IS_AVAILABLE: boolean;
  CURRENT_USER_ID: string;
  CURRENT_USER: any;
  changeAvailabilitySuccessNoticationMsg: string;
  changeAvailabilityErrorNoticationMsg: string;
  CURRENT_USER_ROLE: string;
  max_assigned_chat: number;
  currentUser_projectUserID: string;

  anErrorOccurredWhileUpdatingNoticationMsg: string;
  successfullyUpdatedNoticationMsg: string;

  public_Key: string;
  isVisibleAdvancedFeatureChatLimit: boolean;
  areActivePay: boolean;
  isUNIS: boolean = false;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotInvite: string;
  KNOWLEDGE_BASE_USER_ROLE_URL = URL_understanding_default_roles;
  profile_name: string;

  private unsubscribe$: Subject<any> = new Subject<any>();
  tagname: string;
  tag_selected_color = '#43B1F2';
  display_tag_name_required: boolean = false;

  tagsArray: Array<any> = [];
  tagColor = [
    { name: 'red', hex: '#FF5C55' },
    { name: 'orange', hex: '#F89D34' },
    { name: 'yellow', hex: '#F3C835' },
    { name: 'green', hex: '#66C549' },
    { name: 'blue', hex: '#43B1F2' },
    { name: 'violet', hex: '#CB80DD' },
  ];
  createLabelSuccess_mgs: string;
  createLabelError_mgs: string;
  deleteLabelSuccess_mgs: string;
  deleteLabelError_mgs: string;
  isChromeVerGreaterThan100: boolean;

  selectedStatus: any;
  teammateStatus = [
    { id: 1, name: 'Available', avatar: 'assets/img/teammate-status/avaible.svg' },
    { id: 2, name: 'Unavailable', avatar: 'assets/img/teammate-status/unavaible.svg' },
    { id: 3, name: 'Inactive', avatar: 'assets/img/teammate-status/inactive.svg' },
  ];

  currentUser: any;
  invitedProjectUser: any
  profile_name_for_segment: string;
  appSumoProfile: string;
  public hideHelpLink: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    public notify: NotifyService,
    public prjctPlanService: ProjectPlanService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,

  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.tparams = brand;
    this.tParamsFreePlanSeatsNum = { free_plan_allowed_seats_num: PLAN_SEATS.free }
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit() {

    this.logger.log('on init Selected Role ', this.role);
    this.selectedRole = 'ROLE_NOT_SELECTED';

    if (this.router.url.indexOf('/add') !== -1) {
      this.logger.log('[USER-EDIT-ADD] HAS CLICKED INVITES ');
      this.CREATE_VIEW = true;
      this.EDIT_VIEW = false;
    } else {
      this.logger.log('[USER-EDIT-ADD] HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      this.CREATE_VIEW = false;

      this.getParamsProjectUserIdAndThenGetProjectUsersById()
    }

    this.getCurrentProject();
    this.getAllUsersOfCurrentProject();
    this.getProjectPlan();
    this.getPendingInvitation();
    this.getBrowserLang();
    this.getProfileImageStorage();
    this.getTranslations();
    this.getLoggedUser();
    this.getUserRole();
    this.hasChangedAvailabilityStatusInSidebar();
    this.getOSCODE();
    this.getCurrentUrl();
    this.translateTagNotificationMsgs();
    this.getBrowserVersion();
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Invite Temmates Page , Invite temmate", {

          });
        } catch (err) {
          this.logger.error('Signin page error', err);
        }
      }
    }
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }


  translateTagNotificationMsgs() {
    this.translate.get('Tags.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('% »»» WebSocketJs WF >>> ws-m  translateNotificationMsgs text', translation)
        this.createLabelSuccess_mgs = translation.CreateLabelSuccess;
        this.createLabelError_mgs = translation.CreateLabelError;
        this.deleteLabelSuccess_mgs = translation.DeleteLabelSuccess;
        this.deleteLabelError_mgs = translation.DeleteLabelError;
      });
  }


  getCurrentUrl() {
    const currentUrl = this.router.url;
    this.logger.log('[USER-EDIT-ADD] - GET CURRENT URL - current_url ', currentUrl);

    const url_segments = currentUrl.split('/');
    this.logger.log('[USER-EDIT-ADD] - GET CURRENT URL - url_segments ', url_segments);

    const nav_project_id = url_segments[2];
    this.logger.log('[USER-EDIT-ADD] - GET CURRENT URL - nav_project_id ', nav_project_id);

    if (nav_project_id === '5ec688ed13400f0012c2edc2') {
      this.isUNIS = true;
      this.logger.log('[USER-EDIT-ADD] - GET CURRENT URL - isUNIS ', this.isUNIS);
    } else {
      this.isUNIS = false;
      this.logger.log('[USER-EDIT-ADD] - GET CURRENT URL - isUNIS ', this.isUNIS);
    }
  }

  getOSCODE() {

    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[USER-EDIT-ADD] getAppConfig - public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[USER-EDIT-ADD] - keys', keys)
    keys.forEach(key => {
      if (key.includes("PSA")) {
        // this.logger.log('[USER-EDIT-ADD] PUBLIC-KEY - key', key);
        let psa = key.split(":");
        // this.logger.log('[USER-EDIT-ADD] PUBLIC-KEY - pay key&value', psa);
        if (psa[1] === "F") {
          this.isVisibleAdvancedFeatureChatLimit = false;
        } else {
          this.isVisibleAdvancedFeatureChatLimit = true;
        }
      }

      if (key.includes("PAY")) {
        // this.logger.log('[USER-EDIT-ADD] PUBLIC-KEY - key', key);
        let psa = key.split(":");
        // this.logger.log('[USER-EDIT-ADD] PUBLIC-KEY - pay key&value', psa);
        if (psa[1] === "F") {
          this.areActivePay = false;
        } else {
          this.areActivePay = true;
        }
      }
    });


    if (!this.public_Key.includes("PSA")) {
      // this.logger.log('[USER-EDIT-ADD] PUBLIC-KEY - key.includes("PSA")', this.public_Key.includes("PSA"));
      this.isVisibleAdvancedFeatureChatLimit = false;
    }

    if (!this.public_Key.includes("PAY")) {
      this.areActivePay = false;
    }


  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      //  console.log('[USER-EDIT-ADD] - LOGGED USER ', user)
      if (user) {
        this.CURRENT_USER = user
        this.CURRENT_USER_ID = user._id;
        this.logger.log('[USER-EDIT-ADD] - CURRENT USER ID ', this.CURRENT_USER_ID)
      }
    });
  }

  getUserRole() {
    this.subscription = this.usersService.project_user_role_bs.subscribe((userRole) => {

      this.logger.log('[USER-EDIT-ADD] - PROJECT-USER DETAILS - CURRENT USER ROLE »»» ', userRole)
      // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
      this.CURRENT_USER_ROLE = userRole;
    })
  }

  hasChangedAvailabilityStatusInSidebar() {
    this.usersService.has_changed_availability_in_sidebar.subscribe((has_changed_availability) => {
      this.logger.log('[USER-EDIT-ADD] SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE SIDEBAR', has_changed_availability)
      if (has_changed_availability === true) {
        this.getParamsProjectUserIdAndThenGetProjectUsersById();
      }
    })
  }

  // TRANSLATION
  getTranslations() {
    this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
      .subscribe((text: string) => {
        this.changeAvailabilitySuccessNoticationMsg = text;
        // this.logger.log('[USER-EDIT-ADD] + + + change Availability Success Notication Msg', text)
      });

    this.translate.get('ChangeAvailabilityErrorNoticationMsg')
      .subscribe((text: string) => {
        this.changeAvailabilityErrorNoticationMsg = text;
        // this.logger.log('[USER-EDIT-ADD] + + + change Availability Error Notication Msg', text)
      });

    this.translate.get('SuccessfullyUpdated')
      .subscribe((text: string) => {
        this.successfullyUpdatedNoticationMsg = text;
        // this.logger.log('[USER-EDIT-ADD] + + + change Availability Error Notication Msg', text)
      });

    this.translate.get('AnErrorOccurredWhileUpdating')
      .subscribe((text: string) => {
        this.anErrorOccurredWhileUpdatingNoticationMsg = text;
        // this.logger.log('[USER-EDIT-ADD] + + + change Availability Error Notication Msg', text)
      });

    this.translateModalOnlyOwnerCanManageProjectAccount()
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        // this.logger.log('[USER-EDIT-ADD] - TRANSLATE onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });


    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        // this.logger.log('[USER-EDIT-ADD] - TRANSLATE onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.learnMoreAboutDefaultRoles = translation;
      });

      this.translate.get('TeammatesWithAgentRolesCannotInvite')
      .subscribe((translation: any) => {
        // this.logger.log('[USER-EDIT-ADD] - TRANSLATE onlyOwnerCanManageTheAccountPlanMsg text', translation)
        this.agentsCannotInvite = translation;
      });
      
  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[USER-EDIT-ADD] IMAGE STORAGE  ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[USER-EDIT-ADD] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[USER-EDIT-ADD] - GET ALL PROJECT USERS OF THE PROJECT - RES ', projectUsers);

      if (projectUsers) {
        this.projectUsersLength = projectUsers.length;
        this.logger.log('[USER-EDIT-ADD] - GET ALL PROJECT USERS OF THE PROJECT - PROJECT USERS Length ', this.projectUsersLength);

        const filteredProjectUser = projectUsers.filter((obj: any) => {
          return obj.id_user._id === this.CURRENT_USER_ID;
        });
        this.logger.log('[USER-EDIT-ADD] - GET ALL PROJECT USERS OF THE PROJECT - filteredProjectUser FOR CURRENT_USER_ID ', filteredProjectUser);
        this.currentUser_projectUserID = filteredProjectUser[0]._id

      }
    }, error => {
      this.logger.error('[USER-EDIT-ADD] - GET ALL PROJECT USERS OF THE PROJECT - ERROR', error);
    }, () => {
      this.logger.log('[USER-EDIT-ADD] - GET ALL PROJECT USERS OF THE PROJECT * COMPLETE *');
    });
  }



  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
      // this.presentModalOnlyOwnerCanManageTheAccountPlan()
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

  openModalSubsExpired() {
    this.logger.log('[USER-EDIT-ADD] - openModalSubsExpired ');

    // if (this.CURRENT_USER_ROLE === 'owner') {
    //   this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    // } else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan();
    // }

    if (this.CURRENT_USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }


  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
    // https://github.com/t4t5/sweetalert/issues/845
  }


  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[USER-EDIT-ADD] - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.countOfPendingInvites = pendingInvitation.length
          this.logger.log('[USER-EDIT-ADD] - # OF PENDING INVITATION ', this.countOfPendingInvites);
        }

      }, error => {

        this.logger.error('[USER-EDIT-ADD] - GET PENDING INVITATION - ERROR', error);
      }, () => {
        this.logger.log('[USER-EDIT-ADD] - GET PENDING INVITATION * COMPLETE *');
      });
  }

  getParamsProjectUserIdAndThenGetProjectUsersById() {
    this.project_user_id = this.route.snapshot.params['projectuserid'];
    this.logger.log('[USER-EDIT-ADD] - GET PARAMS PROJ-USER ID ', this.project_user_id);

    if (this.project_user_id) {
      this.getProjectUsersById();
    }
  }


  getProjectUsersById() {
    this.usersService.getProjectUsersById(this.project_user_id).subscribe((projectUser: any) => {

      // console.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById): ', projectUser);
      if (projectUser) {
        this.projectUser = projectUser;
        if (projectUser.user_available === false && projectUser.profileStatus === 'inactive') {

          this.selectedStatus = this.teammateStatus[2].id;
          // console.log('[USER-EDIT-ADD] - PROFILE_STATUS selected option', this.teammateStatus[2].name);
        } else if (projectUser.user_available === false && (projectUser.profileStatus === '' || !projectUser.profileStatus)) {
          this.selectedStatus = this.teammateStatus[1].id;
          // console.log('[USER-EDIT-ADD] - PROFILE_STATUS selected option', this.teammateStatus[1].name);
        } else if (projectUser.user_available === true && (projectUser.profileStatus === '' || !projectUser.profileStatus)) {
          this.selectedStatus = this.teammateStatus[0].id
          // console.log('[USER-EDIT-ADD] - PROFILE_STATUS selected option', this.teammateStatus[0].name);
        }

        this.teammateStatus = this.teammateStatus.slice(0)


        this.tagsArray = projectUser.tags
        this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) projectUser > tags ', this.tagsArray);
        this.user_id = projectUser.id_user._id;
        this.user_fullname = projectUser.id_user.firstname + ' ' + projectUser.id_user.lastname

        this.user_email = projectUser.id_user.email;
        this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) - EMAIL: ', this.user_email);

        this.user_role = projectUser.role;
        this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) - ROLE: ', this.user_role);

        if (projectUser && projectUser.max_assigned_chat) {
          this.max_assigned_chat = projectUser.max_assigned_chat;
        }
      }
    }, (error) => {
      this.logger.error('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) - ERR  ', error);
      this.showSpinner = false;
    }, () => {
      this.showSpinner = false;
      this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) * COMPLETE *');
    });
  }

  changeAvailabilityStatus(selecedstatusID: number, projectUser_id: string) {
    // console.log('[USER-EDIT-ADD] PROJECT-USER DETAILS - CHANGE STATUS -  selecedstatusID ', selecedstatusID , 'PROJECT-USER ID ', projectUser_id);

    let IS_AVAILABLE = null
    let profilestatus = ''
    if (selecedstatusID === 1) {
      IS_AVAILABLE = true
    } else if (selecedstatusID === 2) {
      IS_AVAILABLE = false
    } else if (selecedstatusID === 3) {
      IS_AVAILABLE = false
      profilestatus = 'inactive'
    }

    this.usersService.updateProjectUser(projectUser_id, IS_AVAILABLE, profilestatus).subscribe((projectUser: any) => {
      this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS - PROJECT-USER UPDATED ', projectUser)

      // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
      this.usersService.availability_switch_clicked(true)

    }, (error) => {
      this.logger.error('[USER-EDIT-ADD] PROJECT-USER DETAILS - PROJECT-USER UPDATED - ERROR  ', error);
      // =========== NOTIFY ERROR ============
      // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
      this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS - PROJECT-USER UPDATED  * COMPLETE *');
      // =========== NOTIFY SUCCESS ==========
      // this.notify.showNotification('status successfully updated', 2, 'done');
      this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');

    });
  }

  tagSelectedColor(hex: any) {
    this.logger.log('[USER-EDIT-ADD] - TAG SELECTED COLOR ', hex);
    this.tag_selected_color = hex;
  }

  onPressEnterInIputTypeNewTag() {
    this.logger.log('[USER-EDIT-ADD] - has press ENTER key tagname ', this.tagname);

    if (this.tagname === undefined || (this.tagname !== undefined && this.tagname.length === 0)) {
      this.logger.log('[USER-EDIT-ADD] - Display tag name is required ');
      this.display_tag_name_required = true
    } else {
      this.addTagToProjectUser();
    }
  }

  onChangeTagname($event) {
    this.logger.log('[USER-EDIT-ADD] - onChangeTagname $event ', $event);
    if ($event && $event.length > 0) {
      if (this.display_tag_name_required === true) {
        this.display_tag_name_required = false;
      }
    }
  }


  addTagToProjectUser() {
    const add_tag_to_pu_btn = <HTMLElement>document.querySelector('.add-tag-to-pu-btn');
    this.logger.log('[USER-EDIT-ADD] - ADD TAG - add_tag_to_pu_btn: ', add_tag_to_pu_btn);
    add_tag_to_pu_btn.blur();

    this.logger.log('[USER-EDIT-ADD] - ADD TAG - tag name TO ADD: ', this.tagname);
    this.logger.log('[USER-EDIT-ADD] - ADD TAG - tag color TO ADD: ', this.tag_selected_color);

    let tagObject = {}
    tagObject = { tag: this.tagname, color: this.tag_selected_color }
    this.logger.log('[USER-EDIT-ADD] - ADD TAG - tagObject: ', tagObject);

    const tagObjectsize = Object.keys(tagObject).length
    this.logger.log('[WS-REQUESTS-MSGS] - ADD TAG - tagObject LENGTH: ', tagObjectsize);
    if (tagObjectsize > 0) {
      this.tagsArray.push(tagObject);
    }
    this.upadateProjectUserTag(this.tagsArray, 'add')
    this.logger.log('[USER-EDIT-ADD] - ADD TAG - TAGS ARRAY AFTER PUSH: ', this.tagsArray);
    this.tagname = undefined;
    this.tag_selected_color = '#43B1F2';
  }


  removeTagFromProjectUser(tag: string) {
    var index = this.tagsArray.indexOf(tag);
    if (index !== -1) {
      this.tagsArray.splice(index, 1);
    }
    this.logger.log('[USER-EDIT-ADD] - this.tagsArray After REMOVE: ', this.tagsArray);
    this.upadateProjectUserTag(this.tagsArray, 'remove')
  }

  updateUserRoleAndMaxchat() {
    const update_project_user_btn = <HTMLElement>document.querySelector('.update-pu-btn');
    this.logger.log('[USER-EDIT-ADD] - UPDATE PROJECT USER BTN ', update_project_user_btn)
    update_project_user_btn.blur();

    this.logger.log('USER-EDIT-ADD] PROJECT-USER DETAILS - updateUserRoleAndMaxchat - this.max_assigned_chat', this.max_assigned_chat)
    this.logger.log('USER-EDIT-ADD] PROJECT-USER DETAILS - updateUserRoleAndMaxchat - current user id', this.CURRENT_USER_ID)
    this.logger.log('USER-EDIT-ADD] PROJECT-USER DETAILS - updateUserRoleAndMaxchat - project_user_id', this.project_user_id)
    this.logger.log('USER-EDIT-ADD] PROJECT-USER DETAILS - updateUserRoleAndMaxchat - user_id  from project-user object', this.user_id)


    let maxassignedchat = -1
    if (this.max_assigned_chat !== null && this.max_assigned_chat !== undefined) {
      maxassignedchat = this.max_assigned_chat;
    }

    if (this.role === undefined) {
      this.role = this.user_role
    }

    // if the update is performed by the current user, the project-user-id must not be used
    // the same was done for updating the available / unavailable status (see in user service the callbacks updateCurrentUserAvailability() and updateProjectUser() )
    let projectuserid = "";
    if (this.CURRENT_USER_ID !== this.user_id) {
      this.logger.log('[USER-EDIT-ADD] - updateUserRoleAndMaxchat - PROJECT-USER DETAILS - IT IS NOT THE CURRENT USER WHO IS UPDATING HIS PROJECT-USER PROFILE ')
      projectuserid = this.project_user_id
    } else {
      this.logger.log('[USER-EDIT-ADD] - updateUserRoleAndMaxchat - PROJECT-USER DETAILS - THE CURRENT USER IS UPDATING HIS PROJECT-USER PROFILE ')
    }

    this.usersService.updateProjectUserRoleAndMaxchat(projectuserid, this.role, maxassignedchat)
      .subscribe((projectUser: any) => {
        this.logger.log('[USER-EDIT-ADD] - updateUserRoleAndMaxchat - PROJECT-USER DETAILS - PROJECT-USER UPDATED - RES ', projectUser)

      }, (error) => {
        this.logger.error('[USER-EDIT-ADD] - updateUserRoleAndMaxchat - PROJECT-USER DETAILS - PROJECT-USER UPDATED ERROR  ', error);

        // -----------------------
        // NOTIFY ERROR 
        // -----------------------
        this.notify.showWidgetStyleUpdateNotification(this.anErrorOccurredWhileUpdatingNoticationMsg, 4, 'report_problem')
      }, () => {
        this.logger.log('[USER-EDIT-ADD] - updateUserRoleAndMaxchat - PROJECT-USER DETAILS - PROJECT-USER UPDATED  * COMPLETE *');

        // -----------------------
        // NOTIFY SUCCESS 
        // -----------------------
        this.notify.showWidgetStyleUpdateNotification(this.successfullyUpdatedNoticationMsg, 2, 'done');

      });
  }

  upadateProjectUserTag(tagsArray: any, action: string) {
    this.usersService.updateProjectUserTags(this.project_user_id, tagsArray)
      .subscribe((projectUser: any) => {
        this.logger.log('[USER-EDIT-ADD] - updateProjectUserTags - PROJECT-USER DETAILS - PROJECT-USER UPDATED - RES ', projectUser)

      }, (error) => {
        this.logger.error('[USER-EDIT-ADD] - updateProjectUserTags - PROJECT-USER DETAILS - PROJECT-USER UPDATED ERROR  ', error);

        if (action === 'add') {
          this.notify.showWidgetStyleUpdateNotification(this.createLabelError_mgs, 4, 'report_problem');
        } else if (action === 'remove') {
          this.notify.showWidgetStyleUpdateNotification(this.deleteLabelError_mgs, 4, 'report_problem');
        }

      }, () => {
        if (action === 'add') {
          this.notify.showWidgetStyleUpdateNotification(this.createLabelSuccess_mgs, 2, 'done');
        } else if (action === 'remove') {
          this.notify.showWidgetStyleUpdateNotification(this.deleteLabelSuccess_mgs, 2, 'done');
        }

        this.logger.log('[USER-EDIT-ADD] - updateUserRoleAndMaxchat - PROJECT-USER DETAILS - PROJECT-USER UPDATED  * COMPLETE *');

      });

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      this.logger.log('[USER-EDIT-ADD] - GET CURRENT PROJECT ', this.project)
      if (this.project) {
        this.project_name = project.name;
        this.id_project = project._id;
        this.logger.log('[USER-EDIT-ADD] - GET CURRENT PROJECT - PROJECT-NAME ', this.project_name, ' PROJECT-ID ', this.id_project)
      }
    });
  }

  // !! No more used
  // goBackToUsersList() {
  //   this.router.navigate(['project/' + this.id_project + '/users']);
  // }

  goBack() {
    this.location.back();
  }

  setSelected(role) {
    this.role = role;
    this.logger.log('[USER-EDIT-ADD] - setSelected Selected ROLE ', this.role)

    if (role !== 'ROLE_NOT_SELECTED') {
      this.ROLE_NOT_SELECTED = false;
    } else {
      this.ROLE_NOT_SELECTED = true;
    }
  }

  emailChange(event) {
    this.EMAIL_IS_VALID = this.validateEmail(event)
    // this.logger.log('[USER-EDIT-ADD] !!!!! INVITE THE USER - EMAIL IS VALID ', this.EMAIL_IS_VALID);
  }

  validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }

  invite() {
    // console.log('[USER-EDIT-ADD] - INVITE USER  Project Users Length', this.projectUsersLength)
    // console.log('[USER-EDIT-ADD] - INVITE USER Pending Invites Count ', this.countOfPendingInvites)
    // console.log('[USER-EDIT-ADD] - INVITE USER No of Operators Seats (agents purchased)', this.projectPlanAgentsNo)
    // console.log('[USER-EDIT-ADD] - INVITE USER PROJECT PROFILE TYPE ', this.prjct_profile_type)
    // console.log('[USER-EDIT-ADD] - INVITE USER Seats Limit ', this.seatsLimit)
    // console.log('[USER-EDIT-ADD] - INVITE USER projectUsersLength + countOfPendingInvites', this.projectUsersLength + this.countOfPendingInvites)


    // if (this.prjct_profile_type === 'payment') {
    // this.seatsLimit
    // if (this.CURRENT_USER_ROLE === 'owner') {
    //   if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
    //     this.doInviteUser();
    //   } else if ((this.projectUsersLength + this.countOfPendingInvites) >= this.seatsLimit) {

    //     // this.notify._displayContactUsModal(true, 'seats_limit_reached')
    //     if (this.prjct_profile_type === 'free') {
    //       this.presentGoToPricingModal()
    //     } else if (this.prjct_profile_type === 'payment' && (this.subscription_is_active === false || this.subscription_is_active === true)) {
    //       this.notify._displayContactUsModal(true, 'seats_limit_reached')
    //     }
    //   }
    // } else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan()
    // }



    if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
      if (this.CURRENT_USER_ROLE !== 'agent') {
        this.doInviteUser();
      } else {
        this.presentModalAgentCannotInviteTeammates()
      }
    } else if ((this.projectUsersLength + this.countOfPendingInvites) >= this.seatsLimit) {
      if (this.CURRENT_USER_ROLE === 'owner') {
        // this.notify._displayContactUsModal(true, 'seats_limit_reached')
        if (this.prjct_profile_type === 'free') {
          this.presentGoToPricingModal()
        } else if (this.prjct_profile_type === 'payment' && (this.subscription_is_active === false || this.subscription_is_active === true)) {
          this.notify._displayContactUsModal(true, 'seats_limit_reached')
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan()
      }
    }


    // } 

    // else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan()
    // }
    /* IN THE "FREE TYPE PLAN" THERE ISN'T LIMIT TO THE NUMBER OF INVITED USER */
  }

  presentModalAgentCannotInviteTeammates() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.agentsCannotInvite, this.learnMoreAboutDefaultRoles)
  }

  doInviteUser() {
    this.display = 'block';

    this.SHOW_CIRCULAR_SPINNER = true

    setTimeout(() => {
      this.SHOW_CIRCULAR_SPINNER = false
    }, 1000);

    this.logger.log('[USER-EDIT-ADD] - INVITE THE USER EMAIL ', this.user_email)
    this.logger.log('[USER-EDIT-ADD] - INVITE THE USER ROLE ', this.role)

    if (this.role === 'ROLE_NOT_SELECTED') {
      this.role = ''
    }

    this.usersService.inviteUser(this.user_email, this.role).subscribe((project_user: any) => {
      // console.log('[USER-EDIT-ADD] - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES project_user)', project_user);
      // console.log('[USER-EDIT-ADD] - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES project_user.id_project', project_user.id_project);
      // console.log('[USER-EDIT-ADD] - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES project_user.role', project_user.role);

      if (project_user) {
        this.invitedProjectUser = project_user
      }


      // HANDLE THE ERROR "Pending Invitation already exist"
      if (project_user.success === false && project_user.msg === 'Pending Invitation already exist.') {

        this.PENDING_INVITATION_ALREADY_EXIST = true;
        this.logger.error('[USER-EDIT-ADD] - INVITE USER SUCCESS = FALSE ', project_user.msg, ' PENDING_INVITATION_ALREADY_EXIST', this.PENDING_INVITATION_ALREADY_EXIST);
      } else {
        this.PENDING_INVITATION_ALREADY_EXIST = false;
      }

    }, (error) => {
      this.logger.error('[USER-EDIT-ADD] - INVITE USER  ERROR ', error);

      const invite_error = error['error']
      // console.error('[USER-EDIT-ADD] - INVITE USER  ERROR BODY ', invite_error);

      if ((invite_error['success'] === false) && (invite_error['code'] === 4000)) {
        this.logger.error('[USER-EDIT-ADD] !!! Forbidden, you can not invite yourself')

        this.INVITE_YOURSELF_ERROR = true;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_USER_NOT_FOUND = false;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_error['success'] === false) && (invite_error['code'] === 4001)) {
        this.logger.error('[USER-EDIT-ADD] !!! Forbidden, user is already a member')

        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = true;
        this.INVITE_USER_NOT_FOUND = false;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_error['success'] === false) && (error['status'] === 404)) {
        this.logger.error('[USER-EDIT-ADD] !!! USER NOT FOUND ')
        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_USER_NOT_FOUND = true;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if (invite_error['success'] === false) {

        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_USER_NOT_FOUND = false;
        this.INVITE_OTHER_ERROR = true;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      }
    }, () => {
      this.logger.log('[USER-EDIT-ADD] - INVITE USER  * COMPLETE *');
      this.INVITE_YOURSELF_ERROR = false;
      this.INVITE_OTHER_ERROR = false;
      this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
      this.INVITE_USER_NOT_FOUND = false;
      // this.PENDING_INVITATION_ALREADY_EXIST = false;

      this.getAllUsersOfCurrentProject();
      this.getPendingInvitation();
      if (!isDevMode()) {
        if (window['analytics']) {
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
              plan: this.profile_name_for_segment

            });
          } catch (err) {
            this.logger.error('identify Invite Sent Profile error', err);
          }

          try {
            window['analytics'].track('Invite Sent', {
              "invitee_email": this.user_email,
              "invitee_role": this.invitedProjectUser.role,
              "page": "Invite Temmates Page"
            }, {
              "context": {
                "groupId": this.invitedProjectUser.id_project
              }
            });
          } catch (err) {
            this.logger.error('track Invite Sent event error', err);
          }

          try {
            window['analytics'].group(this.invitedProjectUser.id_project, {
              name: this.project_name,
              plan: this.profile_name_for_segment,
            });
          } catch (err) {
            this.logger.error('group Invite Sent error', err);
          }
        }
      }
    });
  }

  onCloseModalHandled() {
    this.logger.log('[USER-EDIT-ADD] - onCloseModalHandled - CONTINUE PRESSED ');
    // this.logger.log('CONTINUE PRESSED Selected ROLE ', this.role);
    // this.role = 'ROLE_NOT_SELECTED';
    this.selectedRole = 'ROLE_NOT_SELECTED';
    this.user_email = '';
    this.role = '';
    this.display = 'none';

    // this.router.navigate(['project/' + this.id_project + '/users']);
  }

  onCloseModal() {
    this.display = 'none';
  }
}
