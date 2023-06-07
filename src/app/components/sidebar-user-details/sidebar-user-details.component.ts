import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadImageService } from 'app/services/upload-image.service';
import { UploadImageNativeService } from 'app/services/upload-image-native.service';
import { WsRequestsService } from 'app/services/websocket/ws-requests.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotifyService } from '../../core/notify.service';
import { ProjectService } from 'app/services/project.service';
import { PLAN_NAME, tranlatedLanguage } from 'app/utils/util';
import { avatarPlaceholder, getColorBck } from '../../utils/util'
// import { slideInOutAnimation } from '../../../_animations/index';
@Component({
  selector: 'appdashboard-sidebar-user-details',
  templateUrl: './sidebar-user-details.component.html',
  styleUrls: ['./sidebar-user-details.component.scss'],

})
export class SidebarUserDetailsComponent implements OnInit {
  PLAN_NAME = PLAN_NAME
  public HAS_CLICKED_OPEN_USER_DETAIL: boolean = false;
  // @Output() onCloseUserDetailsSidebar = new EventEmitter();
  public _prjct_profile_name: string;
  public plan_subscription_is_active: boolean;
  public plan_name: string;
  public plan_type: string;
  public isVisiblePAY: boolean;
  public prjct_name: string;

  flag_url: string;
  dsbrd_lang: string;
  user: any;
  browserLang: string;
  tlangparams: any;
  projectId: string;

  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  imageUrl: any;
  IS_INACTIVE: boolean;
  IS_AVAILABLE: boolean;
  PROFILE_STATUS: string;
  IS_BUSY: boolean;
  USER_ROLE: string;
  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  timeStamp: any;
  userProfileImageurl: string;
  project; any
  youAreCurrentlySetToUnavailable: string
  private unsubscribe$: Subject<any> = new Subject<any>();
  current_selected_prjct: any;
  public_Key: any;
  currentUserId: string;
  selectedStatus: any;
  teammateStatus = [
    { id: 1, name: 'Available', avatar: 'assets/img/teammate-status/avaible.svg' },
    { id: 2, name: 'Unavailable', avatar: 'assets/img/teammate-status/unavaible.svg' },
    { id: 3, name: 'Inactive', avatar: 'assets/img/teammate-status/inactive.svg' },
  ];

  constructor(
    public auth: AuthService,
    private logger: LoggerService,
    private translate: TranslateService,
    private router: Router,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    public snackBar: MatSnackBar,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public wsRequestsService: WsRequestsService,
    private eRef: ElementRef,
    private notify: NotifyService,
    private projectService: ProjectService,
  ) { }


  ngOnInit() {
    this.getOSCODE();
    this.logger.log('HELLO SIDEBAR-USER-DETAILS')
    this.getLoggedUserAndCurrentDshbrdLang();
    this.getCurrentProject();
    this.getProfileImageStorage();
    this.getTeammateStatus();
    
    this.getUserUserIsBusy();
    this.checkUserImageExist();
    this.hasChangedAvailabilityStatusInUsersComp();
    this.checkUserImageUploadIsComplete();
    this.listenHasDeleteUserProfileImage();
    this.getUserRole();
    this.getTranslations();
    // this.getProjectUser()
    // this.listenTocurrentProjectUserUserAvailability$();
    this.getWsCurrentUserAvailability$()
  }





  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[SIDEBAR] AppConfigService getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    this.logger.log('[SIDEBAR] PUBLIC-KEY - public_Key keys', keys)
    keys.forEach(key => {
      if (key.includes("PAY")) {
        let pay = key.split(":");
        if (pay[1] === "F") {
          this.isVisiblePAY = false;
        } else {
          this.isVisiblePAY = true;
        }
      }
    });
    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
  }

  getCurrentProject() {
    // this.project = this.auth.project_bs.value;
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project = project
        this.projectId = project._id;
        this.logger.log('[SIDEBAR-USER-DETAILS] projectId ', this.projectId);
        this.findCurrentProjectAmongAll(this.projectId)
        // this.projectName = project.name;
      }
    });
  }

  findCurrentProjectAmongAll(projectId: string) {
    this.projectService.getProjects().subscribe((projects: any) => {

      this.current_selected_prjct = projects.find(prj => prj.id_project.id === projectId);
      this.logger.log('[SIDEBAR] - GET PROJECTS - _current_selected_prjct ', this.current_selected_prjct);


      if (this.current_selected_prjct) {
        this.logger.log('[SIDEBAR] PROJECT PROFILE TYPE', this.current_selected_prjct.id_project.profile.type);
        this.logger.log('[SIDEBAR] PROJECT PROFILE NAME', this.current_selected_prjct.id_project.profile.name);
        this.logger.log('[SIDEBAR] PROJECT TRIAL EXPIRED', this.current_selected_prjct.id_project.trialExpired);
        this.logger.log('[SIDEBAR] PROJECT SUBSCRIPTION IS ACTIVE', this.current_selected_prjct.id_project.isActiveSubscription);
        this.plan_subscription_is_active = this.current_selected_prjct.id_project.isActiveSubscription;
        this.plan_name = this.current_selected_prjct.id_project.profile.name;
        this.plan_type = this.current_selected_prjct.id_project.profile.type;
        this.prjct_name = this.current_selected_prjct.id_project.name;
        if (this.current_selected_prjct.id_project.profile.type === 'free') {
          if (this.current_selected_prjct.id_project.trialExpired === false) {
            // this.getProPlanTrialTranslation();
            this._prjct_profile_name = PLAN_NAME.B + " plan (trial)"
          } else {
            this._prjct_profile_name = "Free plan";
            // this.getPaidPlanTranslation(this.current_selected_prjct.id_project.profile.name);
          }
        } else if (this.current_selected_prjct.id_project.profile.type === 'payment') {
    
          // this.getPaidPlanTranslation(this.current_selected_prjct.id_project.profile.name);

          if (this.plan_name === PLAN_NAME.A) {
            this._prjct_profile_name = PLAN_NAME.A + " plan";

          } else if (this.plan_name === PLAN_NAME.B) {
            this._prjct_profile_name = PLAN_NAME.B + " plan";

          } else if (this.plan_name === PLAN_NAME.C) {
            this._prjct_profile_name = PLAN_NAME.C + " plan";
          }

        }
      }
      this.logger.log('[SIDEBAR-USER-DETAILS] - GET PROJECTS - projects ', projects);
    }, error => {
      this.logger.error('[SIDEBAR-USER-DETAILS] - GET PROJECTS - ERROR: ', error);
    }, () => {
      this.logger.log('[SIDEBAR-USER-DETAILS] - GET PROJECTS * COMPLETE * ');
    });
  }

  getProPlanTrialTranslation() {
    this.translate.get('ProPlanTrial')
      .subscribe((translation: any) => {
        this._prjct_profile_name = translation;

        this.logger.log('[SIDEBAR] PLAN NAME ', this._prjct_profile_name)
      });
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this._prjct_profile_name = text;
        this.logger.log('[SIDEBAR] PLAN NAME ', this._prjct_profile_name)
      });
  }


  getTranslations() {
    this.translate.get('YouAreCurrentlySetToUnavailable')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BotsPage translation: ', text)
        this.youAreCurrentlySetToUnavailable = text;
      });
  }

  logout() {
    this.closeUserDetailSidePanel()
    this.notify.presentLogoutModal()
  }


  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        // this.logger..log('[SIDEBAR-USER-DETAILS] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.USER_ROLE = userRole;
      })
  }


  @HostListener('document:click', ['$event'])
  clickout(event) {
    //   this.logger..log('[SIDEBAR-USER-DETAILS] clickout event.target)', event.target)
    //  this.logger..log('[SIDEBAR-USER-DETAILS] clickout event.target.id)', event.target.id)
    //  this.logger..log('[SIDEBAR-USER-DETAILS] clickout event.target.className)', event.target.classList)
    const clicked_element_id = event.target.id
    if (this.eRef.nativeElement.contains(event.target)) {
      this.logger.log('[SIDEBAR-USER-DETAILS] clicked inside')
    } else {
      const elSidebarUserDtls = <HTMLElement>document.querySelector('#user-details');
      this.logger.log('[SIDEBAR-USER-DETAILS] clicked outside elSidebarUserDtls ', elSidebarUserDtls)

      this.logger.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL ', this.HAS_CLICKED_OPEN_USER_DETAIL)
      // && (!event.target.classList.contains('ng-option'))
      // clicked_element_id !== 'a0da04ac7772' && 
      if (!clicked_element_id.startsWith("sidebaravatar") && (!event.target.classList.contains('ng-option'))) {
        this.closeUserDetailSidePanel();
        // }
        this.logger.log('[SIDEBAR-USER-DETAILS] clicked outside')
      }
    }
  }


  hasChangedAvailabilityStatusInUsersComp() {
    this.usersService.has_changed_availability_in_users.subscribe((has_changed_availability) => {
      this.logger.log('[SIDEBAR-USER-DETAILS] SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE USERS COMP', has_changed_availability)

      if (this.project) {
        this.getProjectUser()
      }
      // this.getWsCurrentUserAvailability$()
    })
  }


  
  getTeammateStatus() {

    this.usersService.projectUser_bs.subscribe((projectUser_bs) => {
      // this.PROFILE_STATUS = projectUser_bs;
      //  this.logger..log('[SIDEBAR-USER-DETAILS] - projectUser_bs ', projectUser_bs);

      if (projectUser_bs) {
        if (projectUser_bs.user_available === false && projectUser_bs.profileStatus === 'inactive') {
          // this.logger..log('teammateStatus ', this.teammateStatus) 
          this.selectedStatus = this.teammateStatus[2].id;
          //  this.logger..log('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[2].name);
          this.teammateStatus = this.teammateStatus.slice(0)
        } else if (projectUser_bs.user_available === false && (projectUser_bs.profileStatus === '' || !projectUser_bs.profileStatus)) {
          this.selectedStatus = this.teammateStatus[1].id;
          //  this.logger..log('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[1].name);
          this.teammateStatus = this.teammateStatus.slice(0)
        } else if (projectUser_bs.user_available === true && (projectUser_bs.profileStatus === '' || !projectUser_bs.profileStatus)) {
          this.selectedStatus = this.teammateStatus[0].id
          this.teammateStatus = this.teammateStatus.slice(0)
          // this.logger..log('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[0].name);
        }
      }
      //  this.teammateStatus = this.teammateStatus.slice(0)
    });

  }

  getUserUserIsBusy() {
    this.usersService.user_is_busy$.subscribe((user_isbusy) => {
      this.IS_BUSY = user_isbusy;
      // THE VALUE OS  IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
      // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
      this.logger.log('[SIDEBAR-USER-DETAILS] - USER IS BUSY (from db)', this.IS_BUSY);
    });
  }

  getProjectUser() {
    this.logger.log('[SIDEBAR-USER-DETAILS]  !!! SIDEBAR CALL GET-PROJECT-USER')
    this.usersService.getProjectUserByUserId(this.user._id).subscribe((projectUser: any) => {

      this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER GET BY USER-ID - PROJECT-ID ', this.projectId);
      this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER GET BY USER-ID - CURRENT-USER-ID ', this.user._id);
      // this.logger..log('[SIDEBAR-USER-DETAILS] PROJECT-USER GET BY USER-ID - PROJECT USER ', projectUser);
      this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER GET BY USER-ID - PROJECT USER LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {
        // this.logger.log('[SIDEBAR] PROJECT-USER ID ', projectUser[0]._id)
        // this.logger.log('[SIDEBAR] USER IS AVAILABLE ', projectUser[0].user_available)
        // this.logger.log('[SIDEBAR] USER IS BUSY (from db)', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        // NOTE_nk: comment this this.subsTo_WsCurrentUser(projectUser[0]._id)
        this.subsTo_WsCurrentUser(projectUser[0]._id)

        if (projectUser[0].user_available !== undefined) {

          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy, projectUser[0])

        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          this.logger.log('[SIDEBAR-USER-DETAILS] GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

          // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
          this.USER_ROLE = projectUser[0].role;

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      this.logger.error('[SIDEBAR-USER-DETAILS] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
    }, () => {
      this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }


  changeAvailabilityState(selecedstatusID) {
    // this.logger..log('[SIDEBAR-USER-DETAILS] - CHANGE STATUS - USER SELECTED STATUS ID ', selecedstatusID);

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


    this.usersService.updateCurrentUserAvailability(this.projectId, IS_AVAILABLE, profilestatus)
      .subscribe((projectUser: any) => {


        // this.logger..log('[SIDEBAR-USER-DETAILS] changeAvailabilityState PROJECT-USER UPDATED  RES ', projectUser)

        // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
        this.usersService.availability_btn_clicked(true)

      }, (error) => {
        this.logger.error('[SIDEBAR-USER-DETAILS] PROJECT-USER UPDATED ERR  ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
        // this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER UPDATED  * COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('status successfully updated', 2, 'done');
        // this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');



        // this.getProjectUser();
      });
  }

  // changeAvailabilityState(IS_AVAILABLE) {
  //   this.logger.log('[SIDEBAR-USER-DETAILS] - CHANGE STATUS - USER IS AVAILABLE ? ', IS_AVAILABLE);

  //   this.usersService.updateCurrentUserAvailability(this.projectId, IS_AVAILABLE).subscribe((projectUser: any) => { // non 

  //   //  this.logger..log('[SIDEBAR-USER-DETAILS] PROJECT-USER UPDATED ', projectUser)

  //     if (projectUser.user_available === false) {
  //       // this.openSnackBar()
  //     }

  //     // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
  //     this.usersService.availability_btn_clicked(true)

  //   }, (error) => {
  //     this.logger.error('[SIDEBAR-USER-DETAILS] PROJECT-USER UPDATED ERR  ', error);
  //     // =========== NOTIFY ERROR ===========
  //     // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
  //     // this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

  //   }, () => {
  //     this.logger.log('[SIDEBAR-USER-DETAILS] PROJECT-USER UPDATED  * COMPLETE *');

  //     // =========== NOTIFY SUCCESS===========
  //     // this.notify.showNotification('status successfully updated', 2, 'done');
  //     // this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');


  //     // this.getUserAvailability()
  //     // this.getProjectUser();
  //   });
  // }




  subsTo_WsCurrentUser(currentuserprjctuserid) {
    this.logger.log('[SIDEBAR-USER-DETAILS] - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
    // this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
    this.wsRequestsService.subscriptionToWsCurrentUser(currentuserprjctuserid);

    this.getWsCurrentUserAvailability$();
    this.getWsCurrentUserIsBusy$();
  }



  getWsCurrentUserAvailability$() {
    // this.usersService.currentUserWsAvailability$
    this.wsRequestsService.currentUserWsAvailability$
        .pipe(
            takeUntil(this.unsubscribe$)
        )
        .subscribe((projectUser) => {
            // this.logger..log('[SIDEBAR] - GET WS CURRENT-USER - data ', data);
            if (projectUser) {
              if (projectUser['user_available'] === false && projectUser['profileStatus'] === 'inactive') {
                // this.logger..log('teammateStatus ', this.teammateStatus) 
                this.selectedStatus = this.teammateStatus[2].id;
                //  this.logger..log('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[2].name);
                this.teammateStatus = this.teammateStatus.slice(0)
              } else if (projectUser['user_available'] === false && (projectUser['profileStatus'] === '' || !projectUser['profileStatus'])) {
                this.selectedStatus = this.teammateStatus[1].id;
                //  this.logger..log('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[1].name);
                this.teammateStatus = this.teammateStatus.slice(0)
              } else if (projectUser['user_available'] === true && (projectUser['profileStatus'] === '' || !projectUser['profileStatus'])) {
                this.selectedStatus = this.teammateStatus[0].id
                this.teammateStatus = this.teammateStatus.slice(0)
                // this.logger..log('[SIDEBAR-USER-DETAILS] - PROFILE_STATUS selected option', this.teammateStatus[0].name);
              }
    
            }
        }, error => {
            this.logger.error('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY * error * ', error)
        }, () => {
            this.logger.log('[SIDEBAR] - GET WS CURRENT-USER AVAILABILITY *** complete *** ')
        });
}

  getWsCurrentUserIsBusy$() {
    // this.usersService.currentUserWsIsBusy$
    this.wsRequestsService.currentUserWsIsBusy$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_isbusy) => {
        // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER - currentuser_isbusy? ', currentuser_isbusy);
        if (currentuser_isbusy !== null) {
          this.IS_BUSY = currentuser_isbusy;
          // this.logger.log('[SIDEBAR] - GET WS CURRENT-USER (from ws)- this.IS_BUSY? ', this.IS_BUSY);
        }
      }, error => {
        this.logger.error('[SIDEBAR-USER-DETAILS] - GET WS CURRENT-USER IS BUSY * error * ', error)
      }, () => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - GET WS CURRENT-USER IS BUSY *** complete *** ')
      });
  }



  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('[SIDEBAR-USER-DETAILS] - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;

      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        if (this.storageBucket && this.userProfileImageExist === true) {
          this.logger.log('[SIDEBAR-USER-DETAILS] - USER PROFILE EXIST - BUILD userProfileImageurl');
          this.setImageProfileUrl(this.storageBucket)
        }
      } else {
        if (this.baseUrl && this.userProfileImageExist === true) {
          this.setImageProfileUrl_Native(this.baseUrl)
        }
      }
    });
  }

  setImageProfileUrl_Native(storage) {
    this.userProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.user._id + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    this.logger.log('[SIDEBAR-USER-DETAILS] PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.user._id + '%2Fphoto.jpg?alt=media';
    this.timeStamp = (new Date()).getTime();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      // this.logger.log('PROFILE IMAGE (USER-PROFILE IN SIDEBAR-COMP) - getUserProfileImage ', this.userProfileImageurl);
      return this.userProfileImageurl + '&' + this.timeStamp;
    }
    return this.userProfileImageurl
  }

  checkUserImageUploadIsComplete() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.userImageWasUploaded.subscribe((image_exist) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Firebase)');
        this.userImageHasBeenUploaded = image_exist;
        if (this.storageBucket && this.userImageHasBeenUploaded === true) {
          this.logger.log('[SIDEBAR-USER-DETAILS] - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');
          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {

      // NATIVE
      this.uploadImageNativeService.userImageWasUploaded_Native.subscribe((image_exist) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] USER PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist, '(usecase Native)');

        this.userImageHasBeenUploaded = image_exist;
        this.uploadImageNativeService.userImageDownloadUrl_Native.subscribe((imageUrl) => {
          this.userProfileImageurl = imageUrl
          this.timeStamp = (new Date()).getTime();
        })
      })
    }
  }

  listenHasDeleteUserProfileImage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - hasDeletedImage ? ', hasDeletedImage, '(usecase Firebase)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    } else {
      this.uploadImageNativeService.hasDeletedUserPhoto.subscribe((hasDeletedImage) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] - hasDeletedImage ? ', hasDeletedImage, '(usecase Native)');
        this.userImageHasBeenUploaded = false
        this.userProfileImageExist = false
      });
    }

  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[SIDEBAR-USER-DETAILS] IMAGE STORAGE ', this.storageBucket, '(usecase Firebase)')

    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[SIDEBAR-USER-DETAILS] IMAGE STORAGE ', this.baseUrl, 'usecase native')

    }
  }


 
  goToUserProfileLanguageSection() {
    this.router.navigate(['project/' + this.projectId + '/user-profile'], { fragment: 'language' });
    this.closeUserDetailSidePanel();
  }

  goToUserProfile() {
    this.router.navigate(['project/' + this.projectId + '/user-profile']);
    this.closeUserDetailSidePanel();
  }

  goToHelpCenter() {
    const url = "https://gethelp.tiledesk.com/"
    window.open(url, '_blank');
  }

  getLoggedUserAndCurrentDshbrdLang() {
    //  this.logger..log('[SIDEBAR-USER-DETAILS] BrowserLang ', this.translate.getBrowserLang())
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[SIDEBAR-USER-DETAILS] »»» »»» USER GET IN SIDEBAR-USER-DETAILS', user)
      // tslint:disable-next-line:no-debugger
      // debugger

      // GET ALL PROJECTS WHEN IS PUBLISHED THE USER
      if (user) {
        this.user = user;
        this.currentUserId = user._id;

        this.createUserAvatar(user);

        const stored_preferred_lang = localStorage.getItem(this.user._id + '_lang')

        if (stored_preferred_lang) {
          this.dsbrd_lang = stored_preferred_lang;
          this.logger.log('[SIDEBAR-USER-DETAILS] - dsbrd_lang ', this.dsbrd_lang)
          this.getLangTranslation(this.dsbrd_lang)
          this.flag_url = "assets/img/language_flag/" + this.dsbrd_lang + ".png"

          this.logger.log('[SIDEBAR-USER-DETAILS] flag_url (from stored_preferred_lang) ', this.flag_url)

          this.logger.log('[SIDEBAR-USER-DETAILS] stored_preferred_lang ', stored_preferred_lang)
        } else {
          this.browserLang = this.translate.getBrowserLang();
          this.dsbrd_lang = this.browserLang;
          this.getLangTranslation(this.dsbrd_lang)
          this.logger.log('[SIDEBAR-USER-DETAILS] - dsbrd_lang ', this.dsbrd_lang)
          this.flag_url = "assets/img/language_flag/" + this.dsbrd_lang + ".png"
          this.logger.log('[SIDEBAR-USER-DETAILS] flag_url (from browser_lang) ', this.flag_url)
        }


        if (tranlatedLanguage.includes(this.dsbrd_lang)) {
          this.logger.log('[SIDEBAR-USER-DETAILS] tranlatedLanguage includes', this.dsbrd_lang, ': ', tranlatedLanguage.includes(this.dsbrd_lang))

          this.flag_url = "assets/img/language_flag/" + this.dsbrd_lang + ".png"
        } else {
          this.logger.log('[SIDEBAR-USER-DETAILS] tranlatedLanguage includes', this.dsbrd_lang, ': ', tranlatedLanguage.includes(this.dsbrd_lang))
          this.translate.use('en');
          this.flag_url = "assets/img/language_flag/en.png"
          this.dsbrd_lang = 'en'
        }
      }
    });
  }

  createUserAvatar(user) {
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

  getLangTranslation(dsbrd_lang_code) {
    this.translate.get(dsbrd_lang_code)
      .subscribe((translation: any) => {
        this.logger.log('[SIDEBAR-USER-DETAILS] getLangTranslation', translation)
        this.tlangparams = { language_name: translation }
      });
  }

  ngOnChanges() {
    this.logger.log('[SIDEBAR-USER-DETAILS] HAS_CLICKED_OPEN_USER_DETAIL', this.HAS_CLICKED_OPEN_USER_DETAIL)
    var element = document.getElementById('user-details');
    this.logger.log('[SIDEBAR-USER-DETAILS] element', element)
    if (this.HAS_CLICKED_OPEN_USER_DETAIL === true) {
      element.classList.add("active");
    }
  }


  closeUserDetailSidePanel() {
    var element = document.getElementById('user-details');
    element.classList.remove("active");
    this.logger.log('[SIDEBAR-USER-DETAILS] element', element)
    // this.onCloseUserDetailsSidebar.emit(false);
  }



  openSnackBar() {
    let snackBarRef = this.snackBar.open(this.youAreCurrentlySetToUnavailable, 'x', {
      duration: 9000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      panelClass: 'my-custom-snackbar',
    });

    snackBarRef.onAction().subscribe(() => this.snackBar.dismiss());
  }


}
