import { Component, OnInit } from '@angular/core';

import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-users-profile',
  templateUrl: './users-profile.component.html',
  styleUrls: ['./users-profile.component.scss']
})
export class UsersProfileComponent implements OnInit {

  projectUser_id: string;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getProjectUserId();
  }

  getProjectUserId() {
    this.projectUser_id = this.route.snapshot.params['memberid'];
    console.log('PROJECT-USER ID ', this.projectUser_id);

    if (this.projectUser_id) {

      this.getMemberDetails();
    }
  }

  getMemberDetails() {
    this.usersService.getProjectUserById(this.projectUser_id).subscribe((projectUser: any) => {
      console.log('PROJECT-USER DETAILS ', projectUser)

    });
  }
}
