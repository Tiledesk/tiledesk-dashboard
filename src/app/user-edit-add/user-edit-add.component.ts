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
@Component({
  selector: 'app-user-edit-add',
  templateUrl: './user-edit-add.component.html',
  styleUrls: ['./user-edit-add.component.scss']
})
export class UserEditAddComponent implements OnInit, OnDestroy {

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
  constructor(
    private router: Router,
    private auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private notify: NotifyService,
    private prjctPlanService: ProjectPlanService,
    private translate: TranslateService,

  ) { }

  ngOnInit() {
    console.log('on init Selected Role ', this.role);
    this.selectedRole = 'ROLE_NOT_SELECTED';

    this.auth.checkRoleForCurrentProject();

    if (this.router.url.indexOf('/add') !== -1) {

      console.log('HAS CLICKED INVITES ');
      this.CREATE_VIEW = true;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      this.getProjectUserId()
    }

    this.getCurrentProject();
    this.getAllUsersOfCurrentProject();
    this.getProjectPlan();
    this.getPendingInvitation();
    this.getBrowserLang();

  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('UserEditAddComponent PROJECT USERS ', projectUsers);

      if (projectUsers) {
        this.projectUsersLength = projectUsers.length;
        console.log('UserEditAddComponent PROJECT USERS Length ', this.projectUsersLength);
      }
    }, error => {
      console.log('UserEditAddComponent PROJECT USERS - ERROR', error);
    }, () => {
      console.log('UserEditAddComponent PROJECT USERS - COMPLETE');
    });
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('UserEditAddComponent - project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.projectPlanAgentsNo = projectProfileData.profile_agents;
        console.log('UserEditAddComponent projectPlanAgentsNo ', this.projectPlanAgentsNo);
        this.prjct_profile_type = projectProfileData.profile_type;
        console.log('UserEditAddComponent prjct_profile_type ', this.prjct_profile_type);
        this.subscription_is_active = projectProfileData.subscription_is_active;


        this.subscription_end_date = projectProfileData.subscription_end_date

        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  // NOTE: IF THE PLAN IS OF FREE TYPE IN THE USER INTERFACE THE MODAL 'YOU SUBSCRIPTION HAS EXPIRED' IS NOT DISPLAYED
  buildPlanName(planName: string, browserLang: string, planType: string) {
    console.log('StaticPageBaseComponent planName ', planName, ' browserLang  ', browserLang);

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

  getMoreOperatorsSeats() {
    this.notify._displayContactUsModal(true, 'upgrade_plan');
  }

  openModalSubsExpired() {
    this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
  }

  getPendingInvitation() {
    this.usersService.getPendingUsers()
      .subscribe((pendingInvitation: any) => {
        console.log('USER COMP - GET PENDING INVITATION ', pendingInvitation);

        if (pendingInvitation) {
          this.countOfPendingInvites = pendingInvitation.length
          console.log('USER COMP - # OF PENDING INVITATION ', this.countOfPendingInvites);
        }

      }, error => {

        console.log('USER COMP - GET PENDING INVITATION - ERROR', error);
      }, () => {
        console.log('USER COMP - GET PENDING INVITATION - COMPLETE');
      });

  }

  getProjectUserId() {
    this.project_user_id = this.route.snapshot.params['projectuserid'];
    console.log('USER-EDIT-ADD COMP PROJ-USER ID ', this.project_user_id);

    if (this.project_user_id) {
      this.getProjectUsersById();
    }
  }


  getProjectUsersById() {
    this.usersService.getProjectUsersById(this.project_user_id).subscribe((projectUser: any) => {
      console.log('PROJECT-USER DETAILS: ', projectUser);

      this.user_email = projectUser[0].id_user.email;
      console.log('PROJECT-USER DETAILS - EMAIL: ', this.user_email);

      this.user_role = projectUser[0].role;
      console.log('PROJECT-USER DETAILS - ROLE: ', this.user_role);
    },
      (error) => {
        console.log('PROJECT-USER DETAILS - ERR  ', error);
      },
      () => {
        console.log('PROJECT-USER DETAILS * COMPLETE *');
      });
  }

  updateUserRole() {
    this.usersService.updateProjectUserRole(this.project_user_id, this.role)
      .subscribe((projectUser: any) => {
        console.log('PROJECT-USER UPDATED ', projectUser)

      }, (error) => {
        console.log('PROJECT-USER UPDATED ERR  ', error);
        // =========== NOTIFY ERROR ===========
        // tslint:disable-next-line:quotemark
        this.notify.showNotification("An error occurred while updating user's role", 4, 'report_problem')
      }, () => {
        console.log('PROJECT-USER UPDATED  * COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('user role successfully updated', 2, 'done');

        this.router.navigate(['project/' + this.id_project + '/users']);
      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('USER EDIT ADD - PROJECT ', this.project)
      if (this.project) {
        this.project_name = project.name;
        this.id_project = project._id;
      }
    });
  }

  goBackToUsersList() {
    this.router.navigate(['project/' + this.id_project + '/users']);
  }

  setSelected(role) {
    this.role = role;
    console.log('setSelected Selected ROLE ', this.role)

    if (role !== 'ROLE_NOT_SELECTED') {
      this.ROLE_NOT_SELECTED = false;
    } else {
      this.ROLE_NOT_SELECTED = true;
    }
  }
  // setSelectedRole() {
  //   console.log('setSelected Selected ROLE ', this.selectedRole)
  // }


  emailChange(event) {
    // console.log('!!!!! INVITE THE USER - EDITING EMAIL ', event);

    this.EMAIL_IS_VALID = this.validateEmail(event)
    // console.log('!!!!! INVITE THE USER - EMAIL IS VALID ', this.EMAIL_IS_VALID);
  }

  validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }

  invite() {
    console.log('INVITE USER No of Project Users ', this.projectUsersLength)
    console.log('INVITE USER No of Pending Invites ', this.countOfPendingInvites)
    console.log('INVITE USER No of Operators Seats (agents purchased)', this.projectPlanAgentsNo)
    console.log('INVITE USER No of PROJECT PROFILE TYPE ', this.prjct_profile_type)


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

    console.log('INVITE THE USER EMAIL ', this.user_email)
    console.log('INVITE THE USER ROLE ', this.role)
    
    if (this.role === 'ROLE_NOT_SELECTED') {
      this.role = ''

    }

    this.usersService.inviteUser(this.user_email, this.role).subscribe((project_user: any) => {
      console.log('INVITE USER - POST SUBSCRIPTION PROJECT-USER ', project_user);

      // HANDLE THE ERROR "Pending Invitation already exist"
      if (project_user.success === false && project_user.msg === 'Pending Invitation already exist.') {

        this.PENDING_INVITATION_ALREADY_EXIST = true;
        console.log('INVITE USER SUCCESS = FALSE ', project_user.msg, ' PENDING_INVITATION_ALREADY_EXIST', this.PENDING_INVITATION_ALREADY_EXIST);
      } else {
        this.PENDING_INVITATION_ALREADY_EXIST = false;
      }

    }, (error) => {
      console.log('INVITE USER  ERROR ', error);

      const invite_errorbody = JSON.parse(error._body)
      console.log('INVITE USER  ERROR BODY ', invite_errorbody);

      if ((invite_errorbody['success'] === false) && (invite_errorbody['code'] === 4000)) {
        console.log('!!! Forbidden, you can not invite yourself')

        this.INVITE_YOURSELF_ERROR = true;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_USER_NOT_FOUND = false;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_errorbody['success'] === false) && (invite_errorbody['code'] === 4001)) {
        console.log('!!! Forbidden, user is already a member')

        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = true;
        this.INVITE_USER_NOT_FOUND = false;
        this.PENDING_INVITATION_ALREADY_EXIST = false;

      } else if ((invite_errorbody['success'] === false) && (error['status'] === 404)) {
        console.log('!!! USER NOT FOUND ')
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
      console.log('INVITE USER  * COMPLETE *');
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
    console.log('CONTINUE PRESSED ');
    // console.log('CONTINUE PRESSED Selected ROLE ', this.role);
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
