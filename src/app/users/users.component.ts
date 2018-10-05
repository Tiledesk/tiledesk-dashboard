import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { NotifyService } from '../core/notify.service';


@Component({
  selector: 'appdashboard-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  showSpinner = true;
  projectUsersList: any;
  id_projectUser: string;
  user_firstname: string;
  user_lastname: string;
  user_id: string;

  // set to none the property display of the modal
  display = 'none';
  project: Project;
  id_project: string;
  USER_ROLE: string;
  CURRENT_USER_ID: string;

  IS_AVAILABLE: boolean;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    console.log('=========== USERS COMP ============')
    this.auth.checkRoleForCurrentProject();

    this.getAllUsersOfCurrentProject();
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getLoggedUser();

    this.hasChangedAvailabilityStatusInSidebar();
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
      if (this.project) {
        this.id_project = project._id

      }
    });
  }

  goToAddUser() {
    this.router.navigate(['project/' + this.id_project + '/user/add']);
  }
  goToEditUser(projectUser_id) {
    this.router.navigate(['project/' + this.id_project + '/user/edit/' + projectUser_id]);
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('PROJECT USERS (FILTERED FOR PROJECT ID)', projectUsers);

      this.showSpinner = false;
      this.projectUsersList = projectUsers;

    },
      error => {
        this.showSpinner = false;
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      });
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
      this.notify.showNotification('An error occurred while removing the member', 4, 'report_problem');
    },
      () => {
        console.log('DELETE PROJECT USERS * COMPLETE *');
        // =========== NOTIFY SUCCESS ===========
        this.notify.showNotification('Member successfully removed', 2, 'done');
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

    },
      (error) => {
        console.log('PROJECT-USER UPDATED ERR  ', error);
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error occurred while updating status', 4, 'report_problem')
      },
      () => {
        console.log('PROJECT-USER UPDATED  * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('status successfully updated', 2, 'done');

        // RE-RUNS getAllUsersOfCurrentProject TO UPDATE THE TABLE
        this.getAllUsersOfCurrentProject();
      });
  }

  // IF THE AVAILABILITY STATUS IS CHANGED BY THE SIDEBAR AVAILABILITY / UNAVAILABILITY BUTTON
  // RE-RUN getAllUsersOfCurrentProject TO UPDATE THE LIST OF THE PROJECT' MEMBER
  hasChangedAvailabilityStatusInSidebar() {
    this.usersService.has_changed_availability_in_sidebar.subscribe((has_changed_availability) => {
      console.log('USER COMP SUBSCRIBES TO HAS CHANGED AVAILABILITY FROM THE SIDEBAR', has_changed_availability)
      this.getAllUsersOfCurrentProject();
    })
  }

}
