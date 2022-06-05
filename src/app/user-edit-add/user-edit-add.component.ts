// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { URL_understanding_default_roles } from '../utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggerService } from '../services/logger/logger.service';
const swal = require('sweetalert');

@Component({
  selector: 'app-user-edit-add',
  templateUrl: './user-edit-add.component.html',
  styleUrls: ['./user-edit-add.component.scss']
})
export class UserEditAddComponent implements OnInit, OnDestroy {
  // tparams = brand;
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
  prjct_profile_type: string;
  countOfPendingInvites: number;
  subscription_is_active: string;
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
  changeAvailabilitySuccessNoticationMsg: string;
  changeAvailabilityErrorNoticationMsg: string;
  CURRENT_USER_ROLE: string;
  max_assigned_chat: number;
  currentUser_projectUserID: string;

  anErrorOccurredWhileUpdatingNoticationMsg: string;
  successfullyUpdatedNoticationMsg: string;

  public_Key: string;
  isVisibleAdvancedFeatureChatLimit: boolean
  isUNIS: boolean = false;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
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
  constructor(
    private router: Router,
    private auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private notify: NotifyService,
    private prjctPlanService: ProjectPlanService,
    private translate: TranslateService,
    public appConfigService: AppConfigService,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService
  ) {
    const brand = brandService.getBrand();
    this.tparams = brand;
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
    this.getBrowserVersion()
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
    });


    if (!this.public_Key.includes("PSA")) {
      // this.logger.log('[USER-EDIT-ADD] PUBLIC-KEY - key.includes("PSA")', this.public_Key.includes("PSA"));
      this.isVisibleAdvancedFeatureChatLimit = false;
    }
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[USER-EDIT-ADD] - LOGGED USER ', user)
      if (user) {
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

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectProfileData: any) => {
        this.logger.log('[USER-EDIT-ADD] - GET PROJECT PROFILE - RES', projectProfileData)
        if (projectProfileData) {

          this.projectPlanAgentsNo = projectProfileData.profile_agents;
          this.logger.log('[USER-EDIT-ADD] - GET PROJECT PROFILE - projectPlanAgentsNo ', this.projectPlanAgentsNo);

          this.prjct_profile_type = projectProfileData.profile_type;
          this.logger.log('[USER-EDIT-ADD] - GET PROJECT PROFILE - prjct_profile_type ', this.prjct_profile_type);

          this.subscription_is_active = projectProfileData.subscription_is_active;
          this.subscription_end_date = projectProfileData.subscription_end_date
          this.profile_name = projectProfileData.profile_name

          this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
        }
      }, err => {
        this.logger.error('[USER-EDIT-ADD] GET PROJECT PROFILE - ERROR', err);
      }, () => {
        this.logger.log('[USER-EDIT-ADD] GET PROJECT PROFILE * COMPLETE *');
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MODAL 'YOU SUBSCRIPTION HAS EXPIRED' IS NOT DISPLAYED
  buildPlanName(planName: string, browserLang: string, planType: string) {
    this.logger.log('[USER-EDIT-ADD] buildPlanName - planName ', planName, ' browserLang  ', browserLang);

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

  getMoreOperatorsSeats() {
    this.notify._displayContactUsModal(true, 'upgrade_plan');
  }

  openModalSubsExpired() {
    this.logger.log('[USER-EDIT-ADD] - openModalSubsExpired ');

    // if (this.CURRENT_USER_ROLE === 'owner') {
    //   this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    // } else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan();
    // }

    if (this.CURRENT_USER_ROLE === 'owner') {
      if (this.profile_name !== 'enterprise') {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === 'enterprise') {
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

      this.projectUser = projectUser;

      this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById): ', projectUser);
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

    }, (error) => {
      this.logger.error('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) - ERR  ', error);
      this.showSpinner = false;
    }, () => {
      this.showSpinner = false;
      this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS (GET getProjectUsersById) * COMPLETE *');
    });
  }

  changeAvailabilityStatus(event, projectUser_id: string) {
    this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS - CHANGE STATUS - WHEN CLICK USER IS AVAILABLE event.target.checked ', event.target.checked);
    this.IS_AVAILABLE = event.target.checked

    this.logger.log('[USER-EDIT-ADD] PROJECT-USER DETAILS- CHANGE STATUS - WHEN CLICK USER PROJECT-USER ID ', projectUser_id);

    this.usersService.updateProjectUser(projectUser_id, this.IS_AVAILABLE).subscribe((projectUser: any) => {
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
    this.upadateProjectUserTag(this.tagsArray, 'remove' )
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
          this.notify.showWidgetStyleUpdateNotification(this.deleteLabelSuccess_mgs,2, 'done');
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
    this.logger.log('[USER-EDIT-ADD] - INVITE USER No of Project Users ', this.projectUsersLength)
    this.logger.log('[USER-EDIT-ADD] - INVITE USER No of Pending Invites ', this.countOfPendingInvites)
    this.logger.log('[USER-EDIT-ADD] - INVITE USER No of Operators Seats (agents purchased)', this.projectPlanAgentsNo)
    this.logger.log('[USER-EDIT-ADD] - INVITE USER No of PROJECT PROFILE TYPE ', this.prjct_profile_type)


    if (this.prjct_profile_type === 'payment') {
      if ((this.projectUsersLength + this.countOfPendingInvites) < this.projectPlanAgentsNo) {
        this.doInviteUser();
      } else {
        this.notify._displayContactUsModal(true, 'operators_seats_unavailable');
      }
      /* IN THE "FREE TYPE PLAN" THERE ISN'T LIMIT TO THE NUMBER OF INVITED USER */
    } else {
      this.doInviteUser();
    }
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
      this.logger.log('[USER-EDIT-ADD] - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES ', project_user);

      // HANDLE THE ERROR "Pending Invitation already exist"
      if (project_user.success === false && project_user.msg === 'Pending Invitation already exist.') {

        this.PENDING_INVITATION_ALREADY_EXIST = true;
        this.logger.error('[USER-EDIT-ADD] - INVITE USER SUCCESS = FALSE ', project_user.msg, ' PENDING_INVITATION_ALREADY_EXIST', this.PENDING_INVITATION_ALREADY_EXIST);
      } else {
        this.PENDING_INVITATION_ALREADY_EXIST = false;
      }

    }, (error) => {
      this.logger.error('[USER-EDIT-ADD] - INVITE USER  ERROR ', error);

      const invite_errorbody = JSON.parse(error._body)
      this.logger.error('[USER-EDIT-ADD] - INVITE USER  ERROR BODY ', invite_errorbody);

      if ((invite_errorbody['success'] === false) && (invite_errorbody['code'] === 4000)) {
        this.logger.error('[USER-EDIT-ADD] !!! Forbidden, you can not invite yourself')

        this.INVITE_YOURSELF_ERROR = true;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_USER_NOT_FOUND = false;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_errorbody['success'] === false) && (invite_errorbody['code'] === 4001)) {
        this.logger.error('[USER-EDIT-ADD] !!! Forbidden, user is already a member')

        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = true;
        this.INVITE_USER_NOT_FOUND = false;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_errorbody['success'] === false) && (error['status'] === 404)) {
        this.logger.error('[USER-EDIT-ADD] !!! USER NOT FOUND ')
        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_USER_NOT_FOUND = true;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if (invite_errorbody['success'] === false) {

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

      // WHEN AN USER CLICK ON INVITE DISABLE THE BTN INVITE
      // this.ROLE_NOT_SELECTED = true;
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
