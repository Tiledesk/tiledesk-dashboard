import { Component, OnInit } from '@angular/core';

import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ActivatedRoute } from '@angular/router';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
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
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService
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
    const stored_faqKb = this.botLocalDbService.getBotFromStorage(id_faqKb);
    console.log('USERS PROFILE - STORED FAQKB ', stored_faqKb);
    if (stored_faqKb) {

      this.faqKb = stored_faqKb;
      this.faqKb_name = stored_faqKb.name;
      console.log('USERS PROFILE - STORED FAQKB NAME', this.faqKb_name);
      this.faqKb_id = stored_faqKb._id;
      console.log('USERS PROFILE - STORED FAQKB ID', this.faqKb_id);
      this.faqKb_remoteId = stored_faqKb.kbkey_remote;
      console.log('USERS PROFILE - STORED FAQKB REMOTE ID', this.faqKb_remoteId);
      this.faqKb_createdAt = moment(stored_faqKb.updatedAt).format('DD/MM/YYYY');
      console.log('USERS PROFILE - STORED FAQKB CREATED AT', this.faqKb_createdAt);
    } else {


      this.faqKbService.getMongDbFaqKbById(id_faqKb).subscribe((faqKb: any) => {
        console.log('FAQ-KB GET BY ID', faqKb);
        this.faqKb = faqKb;

        if (this.faqKb) {

          this.faqKb_name = faqKb.name;
          this.faqKb_id = faqKb._id;
          this.faqKb_remoteId = faqKb.kbkey_remote;
          this.faqKb_createdAt = moment(faqKb.updatedAt).format('DD/MM/YYYY');

          // SAVE THE BOT IN LOCAL STORAGE
          // this.botLocalDbService.saveBotsInStorage(this.faqKb_id, this.faqKb);

          // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
          this.usersService.getBotsByProjectIdAndSaveInStorage();
        } else {

          console.log('FAQ-KB is UNDEFINED')
        }
      });
    }
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
      console.log('HOME COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);
      const project_users_id_array = [];

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          console.log('USERS PROFILE - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)

          // localStorage.setItem(projectUser.id_user._id, JSON.stringify(projectUser.id_user));
          this.usersLocalDbService.saveMembersInStorage(projectUser.id_user._id, projectUser.id_user);

          // TO RESOLVE THE BUG: WHEN A PROJECT USER IS REMOVED FROM THE MEMBERS OF A PROJECT HIS ID IS DISPALYED IN THE REQUESTS LIST
          // BUT WHEN THE TILEDESK USER CLICK ON IT TO SEE THE PROFILE, IN THE USER PROFILE PAGE NOTHING IS DISPLAYED BECAUSE OF THE ID IS 
          // NO MORE AMONG THE PROJECT USERS - SO IS CREATED AN ARRAY OF IDS OF PROJECT USERS AND THEN IS CHECKED IF THE ARRAY CONTAINS 
          // THE ID OF THE MEMBER IF IT THERE IS NOT RUN A CALLBAK TO GET THE PROJECT USER BY ID
          project_users_id_array.push(projectUser.id_user._id)
        });

      }
      console.log('USERS PROFILES * ARRAY OF PROJECT-USERS-ID * ', project_users_id_array);

      const isMemberAmongProjectuser = project_users_id_array.includes(this.member_id);
      console.log('USERS PROFILES * MEMBER IS AMONG PROJECT-USERS * ', isMemberAmongProjectuser);

      if (isMemberAmongProjectuser === false) {

        this.getMemberByIdAndSaveInStorage();
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

  getMemberByIdAndSaveInStorage() {
    this.usersService.getUsersById(this.member_id)
      .subscribe((user) => {
        console.log('USERS PROFILES - USER GET BY ID ', user);

        if (user) {
          this.user = user;
          this.user_firstname = user['firstname'];
          console.log('USER FIRSTNAME ', this.user_firstname);
          this.user_lastname = user['lastname'];
          console.log('USER LASTNAME ', this.user_lastname);
          this.user_email = 'unavailable';
          console.log('USER EMAIL ', this.user_email);
          this.user_id = user['_id'];

          this.usersLocalDbService.saveMembersInStorage(user['_id'], user);
        }
      }, (error) => {
        console.log('USERS PROFILES - USER GET BY ID - ERROR ', error);
      }, () => {
        console.log('USERS PROFILES - USER GET BY ID * COMPLETE *');
      });
  }

  goBack() {
    this._location.back();
  }
}
