import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  showSpinner = true;
  projectUsersList: any;

  // set to none the property display of the modal
  display = 'none';

  constructor(
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.getAllUsersOfCurrentProject();
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
        console.log('PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE')
      });
  }

  openDeleteModal() {
    this.display = 'block';
  }

  onCloseDeleteModalHandled() {
    console.log('Confirm Delete Project Member')
  }
  onCloseModal() {
    this.display = 'none';
  }

}
