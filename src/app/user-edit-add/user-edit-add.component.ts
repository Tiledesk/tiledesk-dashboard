import { Component, OnInit } from '@angular/core';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-user-edit-add',
  templateUrl: './user-edit-add.component.html',
  styleUrls: ['./user-edit-add.component.scss']
})
export class UserEditAddComponent implements OnInit {

  project: Project;
  user_email: string;
  role: string;
  ROLE_NOT_SELECTED = true

  constructor(
    private router: Router,
    private auth: AuthService,
    private usersService: UsersService
  ) { }

  ngOnInit() {

    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project

    });
  }
  goBackToUsersList() {
    this.router.navigate(['project/' + this.project._id + '/users']);
  }

  setSelected(role) {
    console.log('Selected ROLE ', role)
    this.role = role;

    if (role !== 'ROLE_NOT_SELECTED') {
      this.ROLE_NOT_SELECTED = false;

    }

  }

  invite() {
    console.log('INVITE THE USER EMAIL ', this.user_email)
    console.log('INVITE THE USER ROLE ', this.role)

    this.usersService.inviteUser(this.user_email, this.role).subscribe((project_user: any) => {
      console.log('POST PROJECT-USER ', project_user);
      this.router.navigate(['project/' + this.project._id + '/users']);
    });


  }
}
