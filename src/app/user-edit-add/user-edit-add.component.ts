import { Component, OnInit } from '@angular/core';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { ActivatedRoute } from '@angular/router';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'app-user-edit-add',
  templateUrl: './user-edit-add.component.html',
  styleUrls: ['./user-edit-add.component.scss']
})
export class UserEditAddComponent implements OnInit {

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

  project_user_id: string;
  user_role: string;


  constructor(
    private router: Router,
    private auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    if (this.router.url.indexOf('/add') !== -1) {

      console.log('HAS CLICKED INVITES ');
      this.CREATE_VIEW = true;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      this.getProjectUserId()
    }

    this.getCurrentProject();

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
    console.log('Selected ROLE ', this.role)

    if (role !== 'ROLE_NOT_SELECTED') {
      this.ROLE_NOT_SELECTED = false;
    }
  }

  invite() {
    // show the modal windows
    this.display = 'block';

    this.SHOW_CIRCULAR_SPINNER = true

    setTimeout(() => {
      this.SHOW_CIRCULAR_SPINNER = false
    }, 1000);

    console.log('INVITE THE USER EMAIL ', this.user_email)
    console.log('INVITE THE USER ROLE ', this.role)

    this.usersService.inviteUser(this.user_email, this.role).subscribe((project_user: any) => {
      console.log('INVITE USER - POST SUBSCRIPTION PROJECT-USER ', project_user);

    }, (error) => {
      console.log('INVITE USER  ERROR ', error);

      const invite_errorbody = JSON.parse(error._body)
      console.log('INVITE USER  ERROR BODY ', invite_errorbody);
      if ((invite_errorbody['success'] === false) && (invite_errorbody['code'] === 4000)) {
        console.log('!!! Forbidden, you can not invite yourself')

        this.INVITE_YOURSELF_ERROR = true;
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;

      } else if ((invite_errorbody['success'] === false) && (invite_errorbody['code'] === 4001)) {
        console.log('!!! Forbidden, user is already a member')

        this.INVITE_USER_ALREADY_MEMBER_ERROR = true;
        this.INVITE_YOURSELF_ERROR = false;

      } else if (invite_errorbody['success'] === false) {
        
        this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
        this.INVITE_YOURSELF_ERROR = false;
        this.INVITE_OTHER_ERROR = true;
      }
    }, () => {
      console.log('INVITE USER  * COMPLETE *');
      this.INVITE_YOURSELF_ERROR = false;
      this.INVITE_OTHER_ERROR = false;
      this.INVITE_USER_ALREADY_MEMBER_ERROR = false;
    });

  }

  onCloseModalHandled() {
    console.log('CONTINUE PRESSED')
    this.router.navigate(['project/' + this.id_project + '/users']);
  }
  onCloseModal() {
    this.display = 'none';
  }
}
