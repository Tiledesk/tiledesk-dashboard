import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';

@Component({
  selector: 'app-group-edit-add',
  templateUrl: './group-edit-add.component.html',
  styleUrls: ['./group-edit-add.component.scss']
})
export class GroupEditAddComponent implements OnInit {
  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = true;
  groupName: string;
  project_id: string;
  displayInfoModal = 'none'
  SHOW_CIRCULAR_SPINNER = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private groupService: GroupService
  ) { }

  ngOnInit() {
    this.detectsCreateEditInTheUrl();

    this.getCurrentProject();
  }


  detectsCreateEditInTheUrl() {
    if (this.router.url.indexOf('/create') !== -1) {
      console.log('HAS CLICKED CREATE ');

      this.CREATE_VIEW = true;
      this.showSpinner = false;
      
    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      this.showSpinner = false;
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id
        console.log('00 -> GROUP-EDIT-ADD-COMP project ID from AUTH service subscription ', this.project_id)
      }

    });
  }

  // CREATE (mongoDB)
  create() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('HAS CLICKED CREATE NEW GROUP');
    console.log('Create GROUP - NAME ', this.groupName);

    this.groupService.createGroup(this.groupName)
      .subscribe((group) => {
        console.log('CREATE GROUP - POST DATA ', group);

        // this.bot_fullname = '';

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {
          console.log('CREATE GROUP - POST REQUEST ERROR ', error);
        },
        () => {
          console.log('CREATE GROUP - POST REQUEST * COMPLETE *');

          // this.faqKbService.createFaqKbKey()
          // .subscribe((faqKbKey) => {

          //   console.log('CREATE FAQKB KEY - POST DATA ', faqKbKey);

          // });
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);

          // this.router.navigate(['project/' + this.project._id + '/faqkb']);
        });
  }

  goBackGroupList() {
    this.router.navigate(['project/' + this.project_id + '/groups']);
  }



}
