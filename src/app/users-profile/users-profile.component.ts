import { Component, OnInit } from '@angular/core';

import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ActivatedRoute } from '@angular/router';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { FaqKbService } from '../services/faq-kb.service';
import * as moment from 'moment';

// USED FOR go back last page
import { Location } from '@angular/common';

@Component({
  selector: 'app-users-profile',
  templateUrl: './users-profile.component.html',
  styleUrls: ['./users-profile.component.scss']
})
export class UsersProfileComponent implements OnInit {

  member_id: string;
  user: any;
  faqKb: any;

  user_firstname: string;
  user_lastname: string;
  user_email: string;
  user_id: string;

  faqKb_id: string;
  faqKb_remoteId: string;
  faqKb_name: string;
  faqKb_createdAt: string;

  constructor(
    private usersService: UsersService,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private _location: Location,
    private usersLocalDbService: UsersLocalDbService,
    private faqKbService: FaqKbService
  ) { }

  ngOnInit() {
    this.getMemberId();
  }

  getMemberId() {
    this.member_id = this.route.snapshot.params['memberid'];
    console.log('MEMBER ID ', this.member_id);

    if (this.member_id) {
      if (this.member_id.indexOf('bot_') !== -1) {

        const id_bot = (this.member_id.split('_').pop());
        console.log('ID BOT ', id_bot);

        this.getFaqKbDetails(id_bot);

      } else {
        this.getMemberDetails();
      }
    }
  }

  getFaqKbDetails(id_faqKb: string) {

    this.faqKbService.getMongDbFaqKbById(id_faqKb).subscribe((faqKb: any) => {
      console.log('FAQ-KB GET BY ID', faqKb);
      this.faqKb = faqKb;

      if (this.faqKb) {

        this.faqKb_name = faqKb.name;
        this.faqKb_id = faqKb._id;
        this.faqKb_remoteId = faqKb.kbkey_remote;
        this.faqKb_createdAt =  moment(faqKb.updatedAt).format('DD/MM/YYYY');

      } else {

        console.log('FAQ-KB is UNDEFINED')
      }
    });

  }

  getMemberDetails() {

    // this.user = JSON.parse((localStorage.getItem(this.member_id)));
    this.user = this.usersLocalDbService.getMemberFromStorage(this.member_id);

    // !== null
    if (this.user) {
      console.log('1. USER ', this.user);
      this.user_firstname = this.user.firstname;
      // console.log('USER FIRSTNAME ', this.user_firstname);
      this.user_lastname = this.user.lastname;
      // console.log('USER LASTNAME ', this.user_lastname);
      this.user_email = this.user.email;
      // console.log('USER EMAIL ', this.user_email);
      this.user_id = this.user._id;
      // console.log('USER ID ', this.user_id);

    } else {
      console.log('USER is UNDEFINED')
      this.getAllUsersOfCurrentProject();
    }

  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      // console.log('HOME COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          // console.log('USERS PROFILE - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)

          // localStorage.setItem(projectUser.id_user._id, JSON.stringify(projectUser.id_user));
          this.usersLocalDbService.saveMembersInStorage(projectUser.id_user._id, projectUser.id_user);
        });
      }
      // localStorage.setItem('project', JSON.stringify(project));
      //   this.showSpinner = false;
      //   this.projectUsersList = projectUsers;
    },
      error => {
        // this.showSpinner = false;
        console.log('USERS PROFILES  (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('USERS PROFILES  (FILTERED FOR PROJECT ID) - COMPLETE')

        // this.user = JSON.parse((localStorage.getItem(this.member_id)));
        this.user = this.usersLocalDbService.getMemberFromStorage(this.member_id);

        if (this.user) {
          console.log('2. USER ', this.user);
          this.user_firstname = this.user.firstname;
          // console.log('USER FIRSTNAME ', this.user_firstname);
          this.user_lastname = this.user.lastname;
          // console.log('USER LASTNAME ', this.user_lastname);
          this.user_email = this.user.email;
          // console.log('USER EMAIL ', this.user_email);
          this.user_id = this.user._id;
          // console.log('USER ID ', this.user_id);
        }


      });
  }

  goBack() {
    this._location.back();
  }
}
