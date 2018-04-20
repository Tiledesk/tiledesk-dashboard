import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { Project } from '../models/project-model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any;
  project: Project;

  constructor(
    public auth: AuthService,
    private _location: Location
  ) { }

  ngOnInit() {
    this.getLoggedUser();

    

    this.getCurrentProject();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project


      if (this.project) {
        console.log('00 -> USER PROFILE project from AUTH service subscription  ', project)
      } else {
        console.log('00 -> USER PROFILE project from AUTH service subscription ? ', project)
        this.selectSidebar();
      }
    });
  }

  // hides the sidebar if the user views his profile but has not yet selected a project
  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN USER PROFILE ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
    });
  }

  goBack() {
    this._location.back();
  }

}
