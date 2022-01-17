import { Component, OnInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { helpdocurl_users_role } from '../utils/util';
import { LoggerService } from '../services/logger/logger.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {

  public_Key: string
  showSpinner = true;
  projectUsersList: any;
  pendingInvitationList: any;

  id_projectUser: string;
  user_firstname: string;
  user_lastname: string;
  user_id: string;

  // set to none the property display of the modal
  display = 'none';
  displayCancelInvitationModal = 'none';
  project: Project;
  id_project: string;
  USER_ROLE: string;
  CURRENT_USER_ID: string;

  IS_AVAILABLE: boolean;
  countOfPendingInvites: number;

  changeAvailabilitySuccessNoticationMsg: string;
  changeAvailabilityErrorNoticationMsg: string;

  deleteProjectUserSuccessNoticationMsg: string;
  deleteProjectUserErrorNoticationMsg: string;
  projectPlanAgentsNo: number;
  prjct_profile_name: string;
  browserLang: string;
  prjct_profile_type: string;
  subscription_is_active: string;
  subscription_end_date: any;
  projectUsersLength: number;

  HAS_FINISHED_GET_PROJECT_USERS = false;
  HAS_FINISHED_GET_PENDING_USERS = false;
  pendingInvitationEmail: string;

  resendInviteSuccessNoticationMsg: string;
  resendInviteErrorNoticationMsg: string;

  pendingInvitationIdToCancel: string;
  pendingInvitationEmailToCancel: string;

  canceledInviteSuccessMsg: string;
  canceledInviteErrorMsg: string;
  subscription: Subscription;
  isVisible: boolean;
  storageBucket: string;

  baseUrl: string;

  CHAT_BASE_URL: string;
  IS_BUSY: boolean;

  @ViewChildren("divItem") divItems: QueryList<ElementRef>;

  useTrackById = true;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;

  // input passed to docs-url-row
  trigger_docs_url = helpdocurl_users_role;
  trigger_docs_title = ''; // is diplayed if customtext = false
  customtext = true;
  text_to_display = "LearnMoreAboutDefaultRoles" // is diplayed if customtext = true
  UPLOAD_ENGINE_IS_FIREBASE: boolean
  profile_name: string;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {

  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getUploadEgine();
    this.translateStrings();
    // this.getAllUsersOfCurrentProject(); // MOVED IN GET STORAGE BUCKET
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getLoggedUser();
    this.hasChangedAvailabilityStatusInSidebar();
    this.getPendingInvitation();
    this.getProjectPlan();
    this.getOSCODE();
    this.getChatUrl();
  }



  translateStrings() {
    this.translateChangeAvailabilitySuccessMsg();
    this.translateChangeAvailabilityErrorMsg();
    this.translateRemoveProjectUserSuccessMsg();
    this.translateRemoveProjectUserErrorMsg();
    this.translateResendInviteSuccessMsg();
    this.translateResendInviteErrorMsg();
    this.translateCanceledInviteSuccessMsg();
    this.translateCanceledInviteErrorMsg();

    this.translateModalOnlyOwnerCanManageProjectAccount()
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

  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[USERS] getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }


  chatWithAgent(agentId, agentFirstname, agentLastname) {
    this.logger.log('[USERS] - CHAT WITH AGENT - agentId: ', agentId, ' - agentFirstname: ', agentFirstname, ' - agentLastname: ', agentLastname);

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
    this.logger.log('[USERS] - CHAT WITH AGENT - CHAT URL ', url);
    window.open(url, '_blank');
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[USERS] getAppConfig - public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    keys.forEach(key => {
      if (key.includes("GRO")) {
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - key', key);
        let gro = key.split(":");
        // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro key&value', gro);

        if (gro[1] === "F") {
          this.isVisible = false;
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro isVisible', this.isVisible);
        } else {
          this.isVisible = true;
          // this.logger.log('[USERS] - PUBLIC-KEY (Users) - gro isVisible', this.isVisible);
        }
      }
    });
  }

  translateCanceledInviteSuccessMsg() {
    this.translate.get('UsersPage.CanceledInviteSuccessMsg')
      .subscribe((text: string) => {
        this.canceledInviteSuccessMsg = text;
        // this.logger.log('[USERS] + + + canceledInviteSuccessMsg Invite Success Notication Msg', text)
      });
  }

  translateCanceledInviteErrorMsg() {
    this.translate.get('UsersPage.CanceledInviteErrorMsg')
      .subscribe((text: string) => {
        this.canceledInviteErrorMsg = text;
        // this.logger.log('[USERS] + + + canceledInviteErrorMsg Invite Success Notication Msg', text)
      });
  }

  translateResendInviteSuccessMsg() {
    this.translate.get('UsersPage.ResendInviteSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.resendInviteSuccessNoticationMsg = text;
        // this.logger.log('[USERS] + + + resend Invite Success Notication Msg', text)
      });
  }

  translateResendInviteErrorMsg() {
    this.translate.get('UsersPage.ResendInviteErrorNoticationMsg')
      .subscribe((text: string) => {
        this.resendInviteErrorNoticationMsg = text;
        // this.logger.log('[USERS] + + + resend Invite Error Notication Msg', text)
      });
  }

  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[USERS] - BRS LANG ', this.browserLang)
  }


  // TRANSLATION
  translateChangeAvailabilitySuccessMsg() {
    this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
      .subscribe((text: string) => {

        this.changeAvailabilitySuccessNoticationMsg = text;
        // this.logger.log('[USERS] + + + change Availability Success Notication Msg', text)
      });
  }

  // TRANSLATION
  translateChangeAvailabilityErrorMsg() {
    this.translate.get('ChangeAvailabilityErrorNoticationMsg')
      .subscribe((text: string) => {

        this.changeAvailabilityErrorNoticationMsg = text;
        // this.logger.log('[USERS] + + + change Availability Error Notication Msg', text)
      });
  }

  // TRANSLATION
  translateRemoveProjectUserSuccessMsg() {
    this.translate.get('RemoveProjectUserSuccessNoticationMsg')
      .subscribe((text: string) => {
        this.deleteProjectUserSuccessNoticationMsg = text;
        // this.logger.log('[USERS] + + + RemoveProjectUserSuccessNoticationMsg ', text)
      });
  }

  // TRANSLATION
  translateRemoveProjectUserErrorMsg() {
    this.translate.get('RemoveProjectUserErrorNoticationMsg')
      .subscribe((text: string) => {
        this.deleteProjectUserErrorNoticationMsg = text;
        // this.logger.log('[USERS] + + + RemoveProjectUserErrorNoticationMsg ', text)
      });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[USERS] LOGGED USER GET IN USERS-COMP - USER', user)
      if (user) {
        this.CURRENT_USER_ID = user._id;
        this.logger.log('[USERS] LOGGED USER GET IN USERS-COMP - Current USER ID ', this.CURRENT_USER_ID)
      }
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[USERS] - GET PROJECT USER ROLE - USER_ROLE : ', this.USER_ROLE);
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      // this.logger.log('[USERS] - GET CURRENT PROJECT -> project', this.project)
      if (this.project) {
        this.id_project = project._id;
        this.logger.log('[USERS] - GET CURRENT PROJECT -> project ID', this.id_project)
      }
    });
  }

  // !! No more used - replaced by goToEditUser
  // goToMemberProfile(member_id: string) {
  //   this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
  // }

  goToEditUser(projectUser_id) {
    this.router.navigate(['project/' + this.id_project + '/user/edit/' + projectUser_id]);
  }

  goToGroups() {
    this.logger.log('[USERS] - goToGroups')
    this.router.navigate(['project/' + this.id_project + '/groups']);
  }

  goToPendingInvitation() {
    this.logger.log('[USERS] - goToPendingInvitation')
    this.router.navigate(['project/' + this.id_project + '/users/pending']);
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[USERS] - GET PROJECT PLAN - RES ', projectProfileData)
      if (projectProfileData) {

        this.projectPlanAgentsNo = projectProfileData.profile_agents;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.subscription_end_date = projectProfileData.subscription_end_date
        this.prjct_profile_type = projectProfileData.profile_type;
        this.profile_name = projectProfileData.profile_name
        // ADDS 'Plan' to the project plan's name
        // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MESSAGE 'You currently have ...' IS NOT DISPLAYED
        if (this.prjct_profile_type === 'payment') {

          this.getPaidPlanTranslation(this.profile_name)
          // if (this.browserLang === 'it') {

          //   this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;

          // } else if (this.browserLang !== 'it') {

          //   this.prjct_profile_name = projectProfileData.profile_name + ' Plan';
          // }
        }
      }
    }, err => {
      this.logger.error('[USERS] GET PROJECT PROFILE - ERROR', err);
    }, () => {
      this.logger.log('[USERS] GET PROJECT PROFILE * COMPLETE *');
    });
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openModalSubsExpired() {
    // if (this.USER_ROLE === 'owner') {
    //   this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    // } else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan();
    // }

    if (this.USER_ROLE === 'owner') {
      if (this.profile_name !== 'enterprise') {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === 'enterprise') {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }

  }

  getMoreOperatorsSeats() {
    if (this.USER_ROLE === 'owner') {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
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

  getUploadEgine() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      this.logger.log('[USERS] - UPLOAD ENGINE IS FIREBASE ? ', this.UPLOAD_ENGINE_IS_FIREBASE)
      this.getProjectUsersAndCheckIfPhotoExistOnFirebase();

    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.logger.log('[USERS] - UPLOAD ENGINE IS FIREBASE ? ', this.UPLOAD_ENGINE_IS_FIREBASE)
      this.getProjectUsersAndCheckIfPhotoExistOnNative();
    }
  }

  getProjectUsersAndCheckIfPhotoExistOnFirebase() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    this.logger.log('[USERS] - IMAGE STORAGE URL (usecase FIREBASE) ', this.storageBucket);

    this.getAllUsersOfCurrentProject(this.storageBucket)
  }

  getProjectUsersAndCheckIfPhotoExistOnNative() {
    this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[USERS] - IMAGE STORAGE URL (usecase NATIVE) ', this.baseUrl);
    this.getAllUsersOfCurrentProject(this.baseUrl)
  }

  getAllUsersOfCurrentProject(storage) {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[USERS] - GET PROJECT USERS (FILTERED FOR PROJECT ID) - PROJECT-USERS ', projectUsers);
      if (projectUsers) {
        this.projectUsersList = projectUsers;


        this.projectUsersList.forEach(projectuser => {
          // this.logger.log('[USERS] - GET ALL PROJECT-USERS OF THE PROJECT - check if PROJECT USER IMG EXIST', projectuser);

          let imgUrl = ''
          if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + projectuser['id_user']['_id'] + "%2Fphoto.jpg?alt=media"
            // this.logger.log('[USERS] - PROJECT USERS imgUrl (usecase firebase)', imgUrl);
          } else {
            imgUrl = storage + 'images?path=uploads%2Fusers%2F' + projectuser['id_user']['_id'] + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
            // this.logger.log('[USERS] - PROJECT USERS imgUrl (usecase native)', imgUrl);
          }

          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[USERS] - IMAGE EXIST X PROJECT USERS', projectuser);
              projectuser.hasImage = true;
            }
            else {
              this.logger.log('[USERS] - IMAGE NOT EXIST X PROJECT USERS', projectuser);
              projectuser.hasImage = false;
            }
          });

          if (projectuser && projectuser['id_user'])
            this.createProjectUserAvatar(projectuser['id_user'])

        });

        this.projectUsersLength = projectUsers.length;
        this.logger.log('[USERS] - GET PROJECT USERS (FILTERED FOR PROJECT ID) Length  ', this.projectUsersLength);
      }
    }, error => {
      this.showSpinner = false;
      this.logger.error('[USERS] - GET PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {

      this.HAS_FINISHED_GET_PROJECT_USERS = true;
      this.showSpinner = false;
      this.logger.log('[USERS] - PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');

      // this.getPendingInvitation();
    });
  }

  createProjectUserAvatar(user) {
    this.logger.log('[USERS] - createProjectUserAvatar ', user);
    let fullname = '';
    if (user && user.firstname && user.lastname) {
      fullname = user.firstname + ' ' + user.lastname
      user['fullname_initial'] = avatarPlaceholder(fullname);
      user['fillColour'] = getColorBck(fullname)
    } else if (user && user.firstname) {

      fullname = user.firstname
      user['fullname_initial'] = avatarPlaceholder(fullname);
      user['fillColour'] = getColorBck(fullname)
    } else {
      user['fullname_initial'] = 'N/A';
      user['fillColour'] = 'rgb(98, 100, 167)';
    }
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

  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[USERS] - GET PENDING INVITATION - RES', pendingInvitation);

        if (pendingInvitation) {
          this.pendingInvitationList = pendingInvitation;
          this.countOfPendingInvites = pendingInvitation.length;
          this.logger.log('[USERS] - GET PENDING INVITATION - # OF PENDING INVITATION ', this.countOfPendingInvites);

        }
      }, error => {
        this.showSpinner = false;
        this.logger.error('[USERS] - GET PENDING INVITATION - ERROR', error);
      }, () => {
        this.logger.log('[USERS] - GET PENDING INVITATION * COMPLETE * ');
        this.HAS_FINISHED_GET_PENDING_USERS = true;
        this.showSpinner = false;
      });
  }


  resendInvite(pendingInvitationId: string) {
    this.logger.log('[USERS] - RESEND INVITE TO PENDING INVITATION ID: ', pendingInvitationId);
    this.usersService.getPendingUsersByIdAndResendEmail(pendingInvitationId)
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - RES ', pendingInvitation);

        this.pendingInvitationEmail = pendingInvitation['Resend invitation email to']['email'];
        this.logger.log('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - RES  email', this.pendingInvitationEmail);
      }, error => {

        this.logger.error('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - ERROR', error);
        // this.notify.showNotification('An error occurred sending the email', 4, 'report_problem')
        this.notify.showNotification(this.resendInviteErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[USERS] - GET PENDING INVITATION BY ID AND RESEND INVITE - COMPLETE');
        // =========== NOTIFY SUCCESS===========
        //  this.notify.showNotification('Invitation email has been sent to ' + this.pendingInvitationEmail, 2, 'done');
        this.notify.showNotification(this.resendInviteSuccessNoticationMsg + this.pendingInvitationEmail, 2, 'done');
      });
  }

  openCancelInvitationModal(pendingInvitationId: string, pendingInvitationEmail: string) {
    this.displayCancelInvitationModal = 'block';
    this.logger.log('[USERS] openCancelInvitationModal pendingInvitationId: ', pendingInvitationId, ' pendingInvitationEmail: ', pendingInvitationEmail)

    this.pendingInvitationIdToCancel = pendingInvitationId;
    this.pendingInvitationEmailToCancel = pendingInvitationEmail
  }

  closeCancelInvitationModal() {
    this.displayCancelInvitationModal = 'none';
  }

  deletePendinInvitation() {
    this.displayCancelInvitationModal = 'none';
    this.logger.log('[USERS] - DELETE PENDING INVITATION - INVITATION ID ', this.pendingInvitationIdToCancel);
    this.usersService.deletePendingInvitation(this.pendingInvitationIdToCancel)
      .subscribe((pendingInvitation: any) => {
        this.logger.log('[USERS] DELETE PENDING INVITATION  RES ', pendingInvitation);

      }, error => {
        this.logger.error('[USERS] DELETE PENDING INVITATION - ERROR', error);
        this.notify.showNotification(this.canceledInviteErrorMsg, 4, 'report_problem')
      }, () => {
        this.logger.log('[USERS] DELETE PENDING INVITATION * COMPLETE *');
        this.notify.showNotification(this.canceledInviteSuccessMsg + this.pendingInvitationEmailToCancel, 2, 'done');
        this.getPendingInvitation();
      });
  }

  goToAddUser() {
    this.logger.log('[USERS] INVITE USER (GOTO) No of Project Users ', this.projectUsersLength)
    this.logger.log('[USERS] INVITE USER (GOTO) No of Pending Invites ', this.countOfPendingInvites)
    this.logger.log('[USERS] INVITE USER (GOTO) No of Operators Seats (agents purchased)', this.projectPlanAgentsNo)

    // this.router.navigate(['project/' + this.id_project + '/user/add']);
    if (this.prjct_profile_type === 'payment') {
      if ((this.projectUsersLength + this.countOfPendingInvites) < this.projectPlanAgentsNo) {
        this.router.navigate(['project/' + this.id_project + '/user/add']);
      } else {

        if (this.USER_ROLE === 'owner') {
          this.notify._displayContactUsModal(true, 'operators_seats_unavailable');
        } else {
          this.presentModalOnlyOwnerCanManageTheAccountPlan();
        }
      }
    } else {
      this.router.navigate(['project/' + this.id_project + '/user/add']);
    }
  }



  openDeleteModal(projectUser_id: string, userID: string, userFirstname: string, userLastname: string) {
    this.display = 'block';
    this.id_projectUser = projectUser_id;
    this.user_id = userID;
    this.user_firstname = userFirstname;
    this.user_lastname = userLastname;

    this.logger.log('[USERS] OPEN DELETE MODAL - PROJECT-USER with ID ', this.id_projectUser, ' - (Firstname: ', userFirstname, '; Lastname: ', userLastname, ')');
  }



  onCloseDeleteModalHandled() {
    this.display = 'none';
    // this.logger.log('Confirm Delete Project-User');
    this.usersService.deleteProjectUser(this.id_projectUser).subscribe((projectUsers: any) => {
      this.logger.log('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USERS - RES ', projectUsers);
      this.logger.log('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USER ID  ', this.id_projectUser);
      // this.ngOnInit();

    }, error => {
      this.showSpinner = false;
      this.logger.error('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USERS - ERROR ', error);

      // NOTIFY ERROR 
      this.notify.showNotification(this.deleteProjectUserErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[USERS] ON-CLOSE-DELETE-MODAL - DELETE PROJECT USERS * COMPLETE *');
      // NOTIFY SUCCESS 
      this.notify.showNotification(this.deleteProjectUserSuccessNoticationMsg, 2, 'done');

      for (let i = 0; i < this.projectUsersList.length; i++) {
        if (this.id_projectUser === this.projectUsersList[i]._id) {
          this.projectUsersList.splice(i, 1);
          localStorage.removeItem('dshbrd----' + this.id_projectUser)
        }
      }

    });
  }

  onCloseModal() {
    this.display = 'none';
  }



  changeAvailabilityStatus(IS_AVAILABLE: boolean, projectUser_id: string) {
    this.logger.log('[USERS] - CHANGE AVAILABILITY STATUS - WHEN CLICK USER IS AVAILABLE ? ', IS_AVAILABLE);
    this.logger.log('[USERS] - CHANGE AVAILABILITY STATUS - WHEN CLICK USER PROJECT-USER ID ', projectUser_id);
    if (IS_AVAILABLE === true) {

      this.IS_AVAILABLE = false
      this.logger.log('[USERS] - CHANGE AVAILABILITY STATUS - NEW USER AVAILABLITY  ', this.IS_AVAILABLE);
    }
    if (IS_AVAILABLE === false) {

      this.IS_AVAILABLE = true
      this.logger.log('[USERS] - CHANGE AVAILABILITY STATUS - NEW USER AVAILABLITY  ', this.IS_AVAILABLE);
    }

    this.usersService.updateProjectUser(projectUser_id, this.IS_AVAILABLE).subscribe((projectUser: any) => {
      this.logger.log('[USERS] - CHANGE AVAILABILITY STATUS - UPDATED PROJECT-USER RES', projectUser)

      // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
      this.usersService.availability_switch_clicked(true)

    }, (error) => {
      this.logger.error('[USERS] - CHANGE AVAILABILITY STATUS - UPDATED PROJECT-USER - ERROR ', error);

      //  NOTIFY ERROR
      this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[USERS] - CHANGE AVAILABILITY STATUS - UPDATED PROJECT-USER * COMPLETE *');

      //  NOTIFY SUCCESS 
      this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');

      this.getUploadEgine()
    });
  }

  // IF THE AVAILABILITY STATUS IS CHANGED BY THE SIDEBAR AVAILABILITY / UNAVAILABILITY BUTTON
  // RE-RUN getAllUsersOfCurrentProject TO UPDATE THE LIST OF THE PROJECT' MEMBER
  hasChangedAvailabilityStatusInSidebar() {
    this.usersService.has_changed_availability_in_sidebar.subscribe((has_changed_availability) => {
      this.logger.log('[USERS] - SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE SIDEBAR', has_changed_availability)
      if (has_changed_availability === true) {
        this.getAllUsersOfCurrentProject(this.storageBucket);
      }
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
