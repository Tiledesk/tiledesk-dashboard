import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

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

  constructor(
    private router: Router,
    private auth: AuthService
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
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.project_id = project._id
        console.log('00 -> GROUP-EDIT-ADD-COMP project ID from AUTH service subscription ', this.project_id )
      }

    });
  }

  goBackGroupList() {
    this.router.navigate(['project/' + this.project_id + '/groups']);
  }



}
