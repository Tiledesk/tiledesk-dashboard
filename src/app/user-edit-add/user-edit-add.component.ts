import { Component, OnInit } from '@angular/core';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

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
    private auth: AuthService
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
  inviteUser() {
    console.log('INVITE THE USER EMAIL ', this.user_email)
    console.log('INVITE THE USER ROLE ',  this.role)
  }
}
