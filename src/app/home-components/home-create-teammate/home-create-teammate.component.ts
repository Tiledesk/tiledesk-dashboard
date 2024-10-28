import { Component, Input, OnDestroy, OnInit, SimpleChanges, isDevMode } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { GroupService } from 'app/services/group.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { APPSUMO_PLAN_SEATS, APP_SUMO_PLAN_NAME, PLAN_NAME, PLAN_SEATS, avatarPlaceholder, getColorBck } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { HomeInviteTeammateModalComponent } from './home-invite-teammate-modal/home-invite-teammate-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { NotifyService } from 'app/core/notify.service';
import { HomeInviteTeammateErrorModalComponent } from './home-invite-teammate-error-modal/home-invite-teammate-error-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { BrandService } from 'app/services/brand.service';

@Component({
  selector: 'appdashboard-home-create-teammate',
  templateUrl: './home-create-teammate.component.html',
  styleUrls: ['./home-create-teammate.component.scss']
})
export class HomeCreateTeammateComponent extends PricingBaseComponent implements OnInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  PLAN_SEATS = PLAN_SEATS;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  APPSUMO_PLAN_SEATS = APPSUMO_PLAN_SEATS;

  seatsLimit: any;
  projectPlanAgentsNo: number;
  prjct_profile_type: any;
  subscription_is_active: any;
  subscription_end_date: any;
  prjct_profile_name: string;
  profile_name_for_segment: string;
  appSumoProfile: string;
  trial_expired: any;
  profile_name: string;
  CURRENT_USER: any;
  CURRENT_USER_ID: any
  currentUser_projectUserID: string;
  countOfPendingInvites: any;
  invitedProjectUser: any
  project: any
  project_name: string;
  id_project: string;

  pendingInvitations: any;

  public projectUsers: any;
  projectUsersLength: any;
  countOfInvitedTeammates: any;
  public storageBucket: string;
  public baseUrl: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  projectId: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  USER_ROLE: string;
  numOfTeammatesNotDiplayed: number;
  countOfTeammates: number;
  public_Key: string;
  areActivePay: boolean;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  displayInviteTeammateBtn: boolean;


  yourTrialHasEnded: string;
  upgradeNowToKeepOurAmazingFeatures: string;
  upgrade: string;

  constructor(
    public auth: AuthService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    private groupsService: GroupService,
    public router: Router,
    public dialog: MatDialog,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private translate: TranslateService,
    public brandService: BrandService,
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.displayInviteTeammateBtn = brand['display_invite_teammate_btn'];
  }

  ngOnInit(): void {
    this.logger.log('[HOME-CREATE-TEAMMATE] OnInit  ')
    this.getCurrentProjectAndPrjctTeammates();
    // this.getGroupsByProjectId();
    this.getUserRole()
    this.getPendingInvitation()
    this.getCurrentProject()
    this.getLoggedUser()
    this.translateString()
    this.getOSCODE()
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[HOME-CREATE-TEAMMATE] AppConfigService getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('[HOME-CREATE-TEAMMATE] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('[HOME-CREATE-TEAMMATE] public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('[HOME-CREATE-TEAMMATE] PUBLIC-KEY - key', key);
        let psa = key.split(":");
        // this.logger.log('[HOME-CREATE-TEAMMATE] PUBLIC-KEY - pay key&value', psa);
        if (psa[1] === "F") {
          this.areActivePay = false;
        } else {
          this.areActivePay = true;
        }
      }
    });

    if (!this.public_Key.includes("PAY")) {
      // this.logger.log('[HOME-CREATE-TEAMMATE] PUBLIC-KEY  - key.includes("PAY")', this.public_Key.includes("PAY"));
      this.areActivePay = false;
    }

    this.getProjectPlan();

  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.project = project
        this.logger.log('[HOME-CREATE-TEAMMATE] - GET CURRENT PROJECT ', this.project)
        if (this.project) {
          this.project_name = project.name;
          this.id_project = project._id;
          this.logger.log('[HOME-CREATE-TEAMMATE] - GET CURRENT PROJECT - PROJECT-NAME ', this.project_name, ' PROJECT-ID ', this.id_project)
        }
      });
  }

  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[HOME-CREATE-TEAMMATE] - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.pendingInvitations = pendingInvitation
          this.countOfPendingInvites = pendingInvitation.length
          this.logger.log('[HOME-CREATE-TEAMMATE] - # OF PENDING INVITATION ', this.countOfPendingInvites);
        }

      }, error => {

        this.logger.error('[HOME-CREATE-TEAMMATE] - GET PENDING INVITATION - ERROR', error);
      }, () => {
        this.logger.log('[HOME-CREATE-TEAMMATE] - GET PENDING INVITATION * COMPLETE *');
      });
  }


  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[HOME-CREATE-TEAMMATE] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        //  this.logger.log('[HOME-CREATE-TEAMMATE]  - LOGGED USER ', user)
        if (user) {
          this.CURRENT_USER = user
          this.CURRENT_USER_ID = user._id;
          this.logger.log('[HOME-CREATE-TEAMMATE] - CURRENT USER ID ', this.CURRENT_USER_ID)
        }
      });
  }


  getGroupsByProjectId() {
    this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
      this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID ', groups);

      // this.groupsList = groups;


    }, (error) => {
      this.logger.error('[HOME-CREATE-TEAMMATE] GET GROUPS - ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      // this.showSpinner = false;
      this.logger.log('[HOME-CREATE-TEAMMATE] GET GROUPS * COMPLETE');
    });
  }



  getCurrentProjectAndPrjctTeammates() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        // console.log('[HOME-CREATE-TEAMMATE] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)
        if (project) {
          this.projectId = project._id
          this.getImageStorageThenProjectUsers();
        }
      }, (error) => {
        this.logger.error('[HOME-CREATE-TEAMMATE] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CREATE-TEAMMATE] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }

  getImageStorageThenProjectUsers() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[HOME-CREATE-TEAMMATE] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      this.getAllUsersOfCurrentProject(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE)


    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[HOME-CREATE-TEAMMATE] ', this.baseUrl, 'usecase native')
      this.getAllUsersOfCurrentProject(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME

    }
  }

  getAllUsersOfCurrentProject(storage, uploadEngineIsFirebase) {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      // console.log('[HOME-CREATE-TEAMMATE] - GET PROJECT-USERS BY PROJECT ID ', projectUsers);

      if (projectUsers) {
        this.projectUsers = projectUsers
        this.countOfTeammates = projectUsers.length;
        if (this.countOfTeammates > 10) {
          this.numOfTeammatesNotDiplayed = this.countOfTeammates - 10
        }

        this.projectUsersLength = projectUsers.length;
        this.countOfInvitedTeammates = projectUsers.length - 1
        this.logger.log('[HOME-CREATE-TEAMMATE] - countOfInvitedTeammates ', this.countOfInvitedTeammates);
        const filteredProjectUser = projectUsers.filter((obj: any) => {
          return obj.id_user._id === this.CURRENT_USER_ID;
        });

        this.groupsService.getGroupsByProjectId().subscribe((groups: any) => {
          this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID ', groups);
          let groupArray = []
          let groupArrayGrouped = []
          if (groups && groups.length > 0) {
            for (let i = 0; i < groups.length; i++) {
              this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP NAME ', groups[i].name)
              this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP MEMBERS ', groups[i].members)
              groupArray.push({ groupName: groups[i].name, groupMembers: groups[i].members })
              this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP ARRAY ', groupArray)



              //   if (groups[i].members && groups[i].members.length > 0) {
              //     for (let j = 0; j < groups[i].members.length; j++) {
              //       this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > GROUP MEMBERS > MEMBER', groups[i].members[j])

              //       if (projectUsers && projectUsers.length > 0) {
              //         for (let x = 0; x < projectUsers.length; x++) {
              //           // this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > PU > USER ID', projectUsers[x].id_user._id)
              //           if (groups[i].members[j] === projectUsers[x].id_user._id) {
              //             // group.push(groups[i].name)
              //             projectUsers[x]['group'] = groups[i].name
              //           }
              //         }
              //       }
              //     }
              //   }
              // }
            }

            // if (groupArray && groupArray['groupMembers'] && groupArray['groupMembers'].length > 0) {
            //   groupArray['groupMembers'].forEach(member => {
            //     groupArrayGrouped.push({memberId:member , groupName: groupArray['groupName']} ) 
            //   });
            //   this.logger.log('[HOME-CREATE-TEAMMATE] - GET GROUPS BY PROJECT ID > groupArrayGrouped ', groupArrayGrouped)
            // }


          }
        })



        // ------------------------
        // CHECK IF USER HAS IMAGE
        // ------------------------
        this.projectUsers.forEach(user => {
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {
            // this.logger.log('[HOME-CREATE-TEAMMATE] - CHECK IF csnUSER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + user['id_user']['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME-CREATE-TEAMMATE] - CHECK IF USER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + user['id_user']['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }

          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[HOME-CREATE-TEAMMATE] - IMAGE EXIST X USERS', user);
              user.hasImage = true;
            }
            else {
              this.logger.log('[HOME-CREATE-TEAMMATE] - IMAGE NOT EXIST X USERS', user);
              user.hasImage = false;
            }
          });
          let fullname = '';
          if (user && user['id_user'] && user['id_user'].firstname && user['id_user'].lastname) {
            fullname = user['id_user']['firstname'] + ' ' + user['id_user']['lastname']
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else if (user && user['id_user'] && user['id_user'].firstname) {

            fullname = user['id_user'].firstname
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else {
            user['fullname_initial'] = 'N/A';
            user['fillColour'] = 'rgb(98, 100, 167)';
          }
        });
      }

    }, error => {
      this.logger.error('[HOME-CREATE-TEAMMATE] - GET PROJECT-USERS  - ERROR', error);
    }, () => {
      this.logger.log('[HOME-CREATE-TEAMMATE] - GET PROJECT-USERS  - COMPLETE')
    });
  }


  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }


  goToTeammates() {
    if (this.USER_ROLE !== 'agent') {
      this.logger.log('[HOME-CREATE-TEAMMATE] - goToTeammates clicked')
      this.router.navigate(['project/' + this.projectId + '/users'])
    }
  }

  inviteTeammate() {
    if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
      this.presentModalInviteTeammate()
    } else if (this.projectUsersLength + this.countOfPendingInvites > this.seatsLimit) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'free') {
          this.notify.displayGoToPricingModal('user_exceeds')
        } else {
          this.notify._displayContactUsModal(true, 'seats_limit_exceed')
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan()
      }
    }
  }



  presentModalInviteTeammate() {
    this.logger.log('[HOME-CREATE-TEAMMATE] - presentModalAddKb ');
    const addKbBtnEl = <HTMLElement>document.querySelector('#home-material-btn');
    this.logger.log('[HOME-CREATE-TEAMMATE] - presentModalAddKb addKbBtnEl ', addKbBtnEl);
    addKbBtnEl.blur()
    const dialogRef = this.dialog.open(HomeInviteTeammateModalComponent, {
      width: '600px',
      // data: {
      //   calledBy: 'step1'
      // },
    })

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[HOME-CREATE-TEAMMATE] Dialog result:`, result);

      if (result) {
        if (result.email && result.role) {
          this.logger.log(`[HOME-CREATE-TEAMMATE] email:`, result.email, ' role ', result.role);

          if (this.projectUsersLength + this.countOfPendingInvites < this.seatsLimit) {
            this.doInviteUser(result.email, result.role);
          } else if ((this.projectUsersLength + this.countOfPendingInvites) >= this.seatsLimit) {
            if (this.USER_ROLE === 'owner') {
              this.notify._displayContactUsModal(true, 'seats_limit_reached')
            } else {
              this.presentModalOnlyOwnerCanManageTheAccountPlan()
            }
          }
        }
      }
    });
  }


  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  doInviteUser(email, role) {

    this.usersService.inviteUser(email, role).subscribe((project_user: any) => {
      this.logger.log('[HOME-CREATE-TEAMMATE] - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES project_user)', project_user);
      this.logger.log('[HOME-CREATE-TEAMMATE] - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES project_user.id_project', project_user.id_project);
      // this.logger.log('[HOME-CREATE-TEAMMATE]  - INVITE USER - POST SUBSCRIPTION PROJECT-USER - RES project_user.role', project_user.role);

      if (project_user) {
        this.invitedProjectUser = project_user
      }


      // HANDLE THE ERROR "Pending Invitation already exist"
      if (project_user.success === false && project_user.msg === 'Pending Invitation already exist.') {

        this.openDialogInviteTeammateError(email + ' has already been invited.')

        // this.PENDING_INVITATION_ALREADY_EXIST = true;
        this.logger.error('[HOME-CREATE-TEAMMATE] - INVITE USER SUCCESS = FALSE ', project_user.msg, ' PENDING_INVITATION_ALREADY_EXIST');
      } else {
        // this.PENDING_INVITATION_ALREADY_EXIST = false;
      }

    }, (error) => {
      this.logger.error('[HOME-CREATE-TEAMMATE] - INVITE USER  ERROR ', error);

      const invite_error = error['error']
      // this.logger.error('[HOME-CREATE-TEAMMATE] - INVITE USER  ERROR BODY ', invite_error);

      if ((invite_error['success'] === false) && (invite_error['code'] === 4000)) {
        this.logger.error('[HOME-CREATE-TEAMMATE] !!! Forbidden, you can not invite yourself')
        this.openDialogInviteTeammateError('You can not invite yourself')
        // this.INVITE_YOURSELF_ERROR = true;
        // this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        // this.INVITE_USER_NOT_FOUND = false;
        // this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_error['success'] === false) && (invite_error['code'] === 4001)) {
        this.logger.error('[HOME-CREATE-TEAMMATE] !!! Forbidden, user is already a member')
        this.openDialogInviteTeammateError(email + ' is already a member')
        // this.INVITE_YOURSELF_ERROR = false;
        // this.INVITE_USER_ALREADY_MEMBER_ERROR = true;
        // this.INVITE_USER_NOT_FOUND = false;
        // this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_error['success'] === false) && (error['status'] === 404)) {
        this.logger.error('[HOME-CREATE-TEAMMATE] !!! USER NOT FOUND ')
        this.openDialogInviteTeammateError('User not found')
        // this.INVITE_YOURSELF_ERROR = false;
        // this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        // this.INVITE_USER_NOT_FOUND = true;
        // this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if (invite_error['success'] === false) {
        this.openDialogInviteTeammateError('An error occurred')
        // this.INVITE_YOURSELF_ERROR = false;
        // this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        // this.INVITE_USER_NOT_FOUND = false;
        // this.INVITE_OTHER_ERROR = true;
        // this.PENDING_INVITATION_ALREADY_EXIST = false;

      }
    }, () => {
      this.logger.log('[HOME-CREATE-TEAMMATE] - INVITE USER  * COMPLETE *');
      // this.INVITE_YOURSELF_ERROR = false;
      // this.INVITE_OTHER_ERROR = false;
      // this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
      // this.INVITE_USER_NOT_FOUND = false;
      // this.PENDING_INVITATION_ALREADY_EXIST = false;

      this.getImageStorageThenProjectUsers();
      this.getPendingInvitation();
      if (!isDevMode()) {
        if (window['analytics']) {
          let userFullname = ''
          if (this.CURRENT_USER && this.CURRENT_USER.firstname && this.CURRENT_USER.lastname) {
            userFullname = this.CURRENT_USER.firstname + ' ' + this.CURRENT_USER.lastname
          } else if (this.CURRENT_USER && this.CURRENT_USER.firstname && !this.CURRENT_USER.lastname) {
            userFullname = this.CURRENT_USER.firstname
          }

          try {
            window['analytics'].identify(this.CURRENT_USER._id, {
              name: userFullname,
              email: this.CURRENT_USER.email,
              plan: this.profile_name_for_segment

            });
          } catch (err) {
            this.logger.error('Home identify Invite Sent Profile error', err);
          }

          try {
            window['analytics'].track('Invite Sent', {
              "invitee_email": email,
              "invitee_role": this.invitedProjectUser.role,
              "page": "Home"
            }, {
              "context": {
                "groupId": this.invitedProjectUser.id_project
              }
            });
          } catch (err) {
            this.logger.error('track Home invite Sent event error', err);
          }

          try {
            window['analytics'].group(this.invitedProjectUser.id_project, {
              name: this.project_name,
              plan: this.profile_name_for_segment,
            });
          } catch (err) {
            this.logger.error('group Home invite Sent error', err);
          }
        }
      }
    });
  }

  openDialogInviteTeammateError(errorMsg) {
    this.dialog.open(HomeInviteTeammateErrorModalComponent, {
      data: {
        error: errorMsg,
      },
    });
  }


  goToAgentProfile(member_id) {
    this.logger.log('[HOME] - goToAgentProfile (AFTER GETTING PROJECT USER ID) ', member_id)
    // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }

  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[HOME-CREATE-TEAMMATE] - GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          this.logger.log('[HOME-CREATE-TEAMMATE] - GET projectUser > projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        this.logger.error('[HOME-CREATE-TEAMMATE] - GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        this.logger.log('[HOME-CREATE-TEAMMATE] - GET projectUser by USER-ID * COMPLETE *');
      });
  }

  openModalSubsExpired() {
    this.logger.log('[HOME-CREATE-TEAMMATE] openModalSubsExpired ')
    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === PLAN_NAME.C || this.profile_name === PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  openModalTrialExpired() {
    if (this.USER_ROLE === 'owner') {
      this.notify.displayTrialHasExpiredModal(this.projectId, this.yourTrialHasEnded, this.upgradeNowToKeepOurAmazingFeatures, this.upgrade);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }





  translateString() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
    this.translate.get('Pricing.YourTrialHasEnded')
      .subscribe((translation: any) => {
        this.yourTrialHasEnded = translation;
      });

    this.translate.get('Pricing.UpgradeNowToKeepOurAmazingFeatures')
      .subscribe((translation: any) => {
        this.upgradeNowToKeepOurAmazingFeatures = translation;
      });

    this.translate.get('Upgrade')
      .subscribe((translation: any) => {
        this.upgrade = translation;
      });

  }
  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });
  }


}
