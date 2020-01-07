import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';
import { Subscription } from 'rxjs';
// import { publicKey } from '../utils/util';
import { public_Key } from '../utils/util';
import { environment } from '../../environments/environment';
import { AppConfigService } from '../services/app-config.service';
@Component({
  selector: 'appdashboard-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {

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
  // eos = environment.t2y12PruGU9wUtEGzBJfolMIgK;

  storageBucket: string;
  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    console.log('=========== USERS COMP ============')
    this.translateChangeAvailabilitySuccessMsg();
    this.translateChangeAvailabilityErrorMsg();

    this.translateRemoveProjectUserSuccessMsg();
    this.translateRemoveProjectUserErrorMsg();

    this.auth.checkRoleForCurrentProject();

    this.getAllUsersOfCurrentProject();
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getLoggedUser();

    this.hasChangedAvailabilityStatusInSidebar();
    this.getPendingInvitation();

    this.getProjectPlan();
    this.translateResendInviteSuccessMsg();
    this.translateResendInviteErrorMsg();
    this.translateCanceledInviteSuccessMsg();
    this.translateCanceledInviteErrorMsg();
    this.getOSCODE();
    this.getStorageBucket();
  }


  chatWithAgent(agentId, agentFirstname, agentLastname) {

    console.log('USERS-COMP - CHAT WITH AGENT - agentId: ', agentId, ' - agentFirstname: ', agentFirstname, ' - agentLastname: ', agentLastname);
    // console.log('USERS-COMP - CHAT URL ', this.CHAT_BASE_URL);

    // https://support-pre.tiledesk.com/chat/index.html?recipient=5de9200d6722370017731969&recipientFullname=Nuovopre%20Pre
    //  https://support-pre.tiledesk.com/chat/index.html?recipient=5dd278b8989ecd00174f9d6b&recipientFullname=Gian Burrasca
    const url = this.CHAT_BASE_URL + '?' + 'recipient=' + agentId + '&recipientFullname=' + agentFirstname + ' ' + agentLastname;
    console.log('USERS-COMP - CHAT URL ', url);
    window.open(url, '_blank');
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Users ', this.storageBucket)
  }

  getOSCODE() {


    let keys = public_Key.split("-");
    keys.forEach(key => {
      if (key.includes("GRO")) {
        console.log('PUBLIC-KEY (Users) - key', key);
        let gro = key.split(":");
        console.log('PUBLIC-KEY (Users) - gro key&value', gro);

        if (gro[1] === "F") {
          this.isVisible = false;
          console.log('PUBLIC-KEY (Users) - gro isVisible', this.isVisible);
        } else {
          this.isVisible = true;
          console.log('PUBLIC-KEY (Users) - gro isVisible', this.isVisible);
        }
      }

    });

    // console.log('eoscode', this.eos)
    // if (this.eos && this.eos === publicKey) {

    //   this.isVisible = true;
    //   console.log('eoscode isVisible ', this.isVisible);
    // } else {

    //   this.isVisible = false;
    //   console.log('eoscode isVisible ', this.isVisible);
    // }
  }

  translateCanceledInviteSuccessMsg() {
    this.translate.get('UsersPage.CanceledInviteSuccessMsg')
      .subscribe((text: string) => {

        this.canceledInviteSuccessMsg = text;
        // console.log('+ + + canceledInviteSuccessMsg Invite Success Notication Msg', text)
      });
  }

  translateCanceledInviteErrorMsg() {
    this.translate.get('UsersPage.CanceledInviteErrorMsg')
      .subscribe((text: string) => {

        this.canceledInviteErrorMsg = text;
        // console.log('+ + + canceledInviteErrorMsg Invite Success Notication Msg', text)
      });

  }

  translateResendInviteSuccessMsg() {
    this.translate.get('UsersPage.ResendInviteSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.resendInviteSuccessNoticationMsg = text;
        // console.log('+ + + resend Invite Success Notication Msg', text)
      });
  }

  translateResendInviteErrorMsg() {
    this.translate.get('UsersPage.ResendInviteErrorNoticationMsg')
      .subscribe((text: string) => {

        this.resendInviteErrorNoticationMsg = text;
        // console.log('+ + + resend Invite Error Notication Msg', text)
      });
  }

  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    console.log('UsersComponent - BRS LANG ', this.browserLang)
  }


  // TRANSLATION
  translateChangeAvailabilitySuccessMsg() {
    this.translate.get('ChangeAvailabilitySuccessNoticationMsg')
      .subscribe((text: string) => {

        this.changeAvailabilitySuccessNoticationMsg = text;
        // console.log('+ + + change Availability Success Notication Msg', text)
      });
  }

  // TRANSLATION
  translateChangeAvailabilityErrorMsg() {
    this.translate.get('ChangeAvailabilityErrorNoticationMsg')
      .subscribe((text: string) => {

        this.changeAvailabilityErrorNoticationMsg = text;
        // console.log('+ + + change Availability Error Notication Msg', text)
      });
  }

  // TRANSLATION
  translateRemoveProjectUserSuccessMsg() {
    this.translate.get('RemoveProjectUserSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.deleteProjectUserSuccessNoticationMsg = text;
        // console.log('+ + + RemoveProjectUserSuccessNoticationMsg ', text)
      });
  }

  // TRANSLATION
  translateRemoveProjectUserErrorMsg() {
    this.translate.get('RemoveProjectUserErrorNoticationMsg')
      .subscribe((text: string) => {

        this.deleteProjectUserErrorNoticationMsg = text;
        // console.log('+ + + RemoveProjectUserErrorNoticationMsg ', text)
      });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('LOGGED USER GET IN USERS-COMP ', user)
      if (user) {
        this.CURRENT_USER_ID = user._id;
        console.log('Current USER ID ', this.CURRENT_USER_ID)
      }
    });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      this.USER_ROLE = user_role;
      console.log('USERS-COMP - PROJECT USER ROLE: ', this.USER_ROLE);
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      console.log('UsersComponent - getCurrentProject -> project', this.project)
      if (this.project) {
        this.id_project = project._id
      }
    });
  }

  goToEditUser(projectUser_id) {
    this.router.navigate(['project/' + this.id_project + '/user/edit/' + projectUser_id]);
  }

  goToGroups() {
    this.router.navigate(['project/' + this.id_project + '/groups']);
  }

  goToPendingInvitation() {
    this.router.navigate(['project/' + this.id_project + '/users/pending']);
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('UsersComponent - project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.projectPlanAgentsNo = projectProfileData.profile_agents;
        this.subscription_is_active = projectProfileData.subscription_is_active;
        this.subscription_end_date = projectProfileData.subscription_end_date
        this.prjct_profile_type = projectProfileData.profile_type;

        // ADDS 'Plan' to the project plan's name
        // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MESSAGE 'You currently have ...' IS NOT DISPLAYED
        if (this.prjct_profile_type === 'payment') {
          if (this.browserLang === 'it') {

            this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;

          } else if (this.browserLang !== 'it') {

            this.prjct_profile_name = projectProfileData.profile_name + ' Plan';
          }
        }
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openModalSubsExpired() {
    this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('»» USER COMP - PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);
      if (projectUsers) {
        this.projectUsersList = projectUsers;
        this.projectUsersLength = projectUsers.length;
        console.log('PROJECT USERS Length  (FILTERED FOR PROJECT ID)', this.projectUsersLength);
      }
    }, error => {
      this.showSpinner = false;
      console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {

      this.HAS_FINISHED_GET_PROJECT_USERS = true;
      this.showSpinner = false;
      console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');

      // this.getPendingInvitation();
    });
  }

  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        console.log('»» USER COMP - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.pendingInvitationList = pendingInvitation;
          this.countOfPendingInvites = pendingInvitation.length;
          console.log('USER COMP - # OF PENDING INVITATION ', this.countOfPendingInvites);

          // pendingInvitation.forEach(invite => {
          //   this.projectUsersList.push({ 'id_pending_user': invite })
          // });
        }
      }, error => {
        this.showSpinner = false;
        console.log('USER COMP - GET PENDING INVITATION - ERROR', error);
      }, () => {
        console.log('USER COMP - GET PENDING INVITATION - COMPLETE');
        this.HAS_FINISHED_GET_PENDING_USERS = true;
        this.showSpinner = false;
      });
  }


  resendInvite(pendingInvitationId: string) {
    console.log('RESEND INVITE TO PENDING INVITATION ID: ', pendingInvitationId);
    this.usersService.getPendingUsersByIdAndResendEmail(pendingInvitationId)
      .subscribe((pendingInvitation: any) => {
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - RES ', pendingInvitation);
        this.pendingInvitationEmail = pendingInvitation['Resend invitation email to']['email'];
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - RES  email', this.pendingInvitationEmail);
      }, error => {

        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - ERROR', error);
        // this.notify.showNotification('An error occurred sending the email', 4, 'report_problem')
        this.notify.showNotification(this.resendInviteErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        console.log('GET PENDING INVITATION BY ID AND RESEND INVITE - COMPLETE');
        // =========== NOTIFY SUCCESS===========
        //  this.notify.showNotification('Invitation email has been sent to ' + this.pendingInvitationEmail, 2, 'done');
        this.notify.showNotification(this.resendInviteSuccessNoticationMsg + this.pendingInvitationEmail, 2, 'done');
      });
  }

  openCancelInvitationModal(pendingInvitationId: string, pendingInvitationEmail: string) {
    this.displayCancelInvitationModal = 'block';
    console.log('openCancelInvitationModal pendingInvitationId: ', pendingInvitationId, ' pendingInvitationEmail: ', pendingInvitationEmail)

    this.pendingInvitationIdToCancel = pendingInvitationId;
    this.pendingInvitationEmailToCancel = pendingInvitationEmail
  }

  closeCancelInvitationModal() {
    this.displayCancelInvitationModal = 'none';
  }

  deletePendinInvitation() {
    this.displayCancelInvitationModal = 'none';
    console.log('DELETE PENDING INVITATION - INVITATION ID ', this.pendingInvitationIdToCancel);
    this.usersService.deletePendingInvitation(this.pendingInvitationIdToCancel)
      .subscribe((pendingInvitation: any) => {
        console.log('DELETE PENDING INVITATION ', pendingInvitation);

      }, error => {
        console.log('DELETE PENDING INVITATION - ERROR', error);
        this.notify.showNotification(this.canceledInviteErrorMsg, 4, 'report_problem')
      }, () => {
        console.log('DELETE PENDING INVITATION - COMPLETE');
        this.notify.showNotification(this.canceledInviteSuccessMsg + this.pendingInvitationEmailToCancel, 2, 'done');
        this.getPendingInvitation();
      });
  }

  goToAddUser() {
    console.log('INVITE USER (GOTO) No of Project Users ', this.projectUsersLength)
    console.log('INVITE USER (GOTO) No of Pending Invites ', this.countOfPendingInvites)
    console.log('INVITE USER (GOTO) No of Operators Seats (agents purchased)', this.projectPlanAgentsNo)

    // this.router.navigate(['project/' + this.id_project + '/user/add']);
    if (this.prjct_profile_type === 'payment') {
      if ((this.projectUsersLength + this.countOfPendingInvites) < this.projectPlanAgentsNo) {
        this.router.navigate(['project/' + this.id_project + '/user/add']);
      } else {

        this.notify._displayContactUsModal(true, 'operators_seats_unavailable');
      }
    } else {
      this.router.navigate(['project/' + this.id_project + '/user/add']);
    }
  }

  getMoreOperatorsSeats() {
    this.notify._displayContactUsModal(true, 'upgrade_plan');
  }

  openDeleteModal(projectUser_id: string, userID: string, userFirstname: string, userLastname: string) {
    this.display = 'block';
    this.id_projectUser = projectUser_id;
    this.user_id = userID;
    this.user_firstname = userFirstname;
    this.user_lastname = userLastname;

    console.log('DELETE PROJECT-USER with ID ', this.id_projectUser, ' - (Firstname: ', userFirstname, '; Lastname: ', userLastname, ')');
  }



  onCloseDeleteModalHandled() {
    this.display = 'none';
    // console.log('Confirm Delete Project-User');
    this.usersService.deleteProjectUser(this.id_projectUser).subscribe((projectUsers: any) => {
      console.log('DELETE PROJECT USERS ', projectUsers);

      this.ngOnInit();

    }, error => {
      this.showSpinner = false;
      console.log('DELETE PROJECT USERS - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while removing the member', 4, 'report_problem');
      this.notify.showNotification(this.deleteProjectUserErrorNoticationMsg, 4, 'report_problem');
    },
      () => {
        console.log('DELETE PROJECT USERS * COMPLETE *');
        // =========== NOTIFY SUCCESS ===========
        this.notify.showNotification(this.deleteProjectUserSuccessNoticationMsg, 2, 'done');
      });
  }

  onCloseModal() {
    this.display = 'none';
  }

  goToMemberProfile(member_id: string) {
    this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
  }

  changeAvailabilityStatus(IS_AVAILABLE: boolean, projectUser_id: string) {
    console.log('USERS COMP - CHANGE STATUS - WHEN CLICK USER IS AVAILABLE ? ', IS_AVAILABLE);
    console.log('USERS COMP - CHANGE STATUS - WHEN CLICK USER PROJECT-USER ID ', projectUser_id);
    if (IS_AVAILABLE === true) {

      this.IS_AVAILABLE = false
      console.log('USERS COMP - CHANGE STATUS - NEW USER AVAILABLITY  ', this.IS_AVAILABLE);
    }
    if (IS_AVAILABLE === false) {

      this.IS_AVAILABLE = true
      console.log('USERS COMP - CHANGE STATUS - NEW USER AVAILABLITY  ', this.IS_AVAILABLE);
    }

    this.usersService.updateProjectUser(projectUser_id, this.IS_AVAILABLE).subscribe((projectUser: any) => {
      console.log('PROJECT-USER UPDATED ', projectUser)

      // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
      this.usersService.availability_switch_clicked(true)

    }, (error) => {
      console.log('PROJECT-USER UPDATED ERR  ', error);
      // =========== NOTIFY ERROR ============
      // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
      this.notify.showNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');
    }, () => {
      console.log('PROJECT-USER UPDATED  * COMPLETE *');
      // =========== NOTIFY SUCCESS ==========
      // this.notify.showNotification('status successfully updated', 2, 'done');
      this.notify.showNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');

      // RE-RUNS getAllUsersOfCurrentProject TO UPDATE THE TABLE
      this.getAllUsersOfCurrentProject();
    });
  }

  // IF THE AVAILABILITY STATUS IS CHANGED BY THE SIDEBAR AVAILABILITY / UNAVAILABILITY BUTTON
  // RE-RUN getAllUsersOfCurrentProject TO UPDATE THE LIST OF THE PROJECT' MEMBER
  hasChangedAvailabilityStatusInSidebar() {
    this.usersService.has_changed_availability_in_sidebar.subscribe((has_changed_availability) => {
      console.log('»»USER COMP SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE SIDEBAR', has_changed_availability)
      if (has_changed_availability === true) {
        this.getAllUsersOfCurrentProject();
      }
    })
  }



}
