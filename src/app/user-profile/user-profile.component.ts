import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

// USED FOR go back last page
import { Location } from '@angular/common';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any;
  project: Project;
  userFirstname: string;
  userLastname: string;

  constructor(
    public auth: AuthService,
    private _location: Location,
    private usersService: UsersService
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
      if (user) {
        this.user = user;

        this.userFirstname = user.firstname;
        this.userLastname = user.lastname;
      }

    });
  }

  goBack() {
    this._location.back();
  }

  updateCurrentUserFirstnameLastname() {

    console.log('»» »» »» WHEN CLICK UPDATE - USER FIRST NAME ', this.userFirstname);
    console.log('»» »» »» WHEN CLICK UPDATE - USER LAST NAME ', this.userLastname);
    this.usersService.updateCurrentUserLastnameFirstname(this.userFirstname, this.userLastname, function (error) {


    })
    // , function (error) {




    // const storedUser = localStorage.getItem('user');

    // const parsedStoredUser = JSON.parse(storedUser);
    // console.log('»» »» »» STORED USER ', parsedStoredUser);

    // const updateduserObject = parsedStoredUser['firstname'] = 'Nicola';
    // updateduserObject = parsedStoredUser['lastname'] = 'La Trottola';

    // localStorage.setItem('user', JSON.stringify(updateduserObject));


    // });

  }

}
