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
      console.log('POST PROJECT-USER ', project_user);

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
