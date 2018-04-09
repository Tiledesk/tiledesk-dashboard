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

  constructor(
    private usersService: UsersService,
  ) { }

  ngOnInit() {

    this.getProjectUsersByProjectId();
  }


  getProjectUsersByProjectId() {
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
}
