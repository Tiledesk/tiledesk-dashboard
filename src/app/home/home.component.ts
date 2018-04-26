import { Component, OnInit } from '@angular/core';
import { AuthService, SuperUser } from '../core/auth.service';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { UsersLocalDbService } from '../services/users-local-db.service';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {



  firebaseProjectId: any;
  LOCAL_STORAGE_CURRENT_USER: any;

  // public superUser = new SuperUser('');
  currentUserEmailgetFromStorage: string;
  IS_SUPER_USER: boolean;

  user: any;
  project: Project;
  projectId: string;
  // user_is_available: boolean;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private usersLocalDbService: UsersLocalDbService
  ) { }

  ngOnInit() {
    console.log('Hello HomeComponent! ');
    // console.log(environment.firebaseConfig.projectId);
    // this.firebaseProjectId = environment.firebaseConfig.projectId;

    // const userKey = Object.keys(window.localStorage)
    //   .filter(it => it.startsWith('firebase:authUser'))[0];
    // this.LOCAL_STORAGE_CURRENT_USER = userKey ? JSON.parse(localStorage.getItem(userKey)) : undefined;
    // console.log('HOMEPAGE - USER GET FROM LOCAL STORAGE ', this.LOCAL_STORAGE_CURRENT_USER)
    // this.currentUserEmailgetFromStorage = this.LOCAL_STORAGE_CURRENT_USER.email
    // console.log('HOMEPAGE - USER EMAIL GET FROM LOCAL STORAGE  ', this.currentUserEmailgetFromStorage)

    // if (this.currentUserEmailgetFromStorage) {
    //   this.superUserAuth();
    // }
    this.getLoggedUser()
    // this.getProjectId()
    this.getCurrentProject()

    // get the PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID
    // IS USED TO DETERMINE IF THE USER IS AVAILABLE OR NOT AVAILABLE
    this.getProjectUser();

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> HOME project from AUTH service subscription  ', project)

      if (this.project) {
        this.projectId = this.project._id
      }
    });
  }

  goToResources() {
    this.router.navigate(['project/' + this.projectId + '/resources']);
  }
  goToRequests() {
    this.router.navigate(['project/' + this.projectId + '/requests']);
  }

  goToAnalytics() {
    this.router.navigate(['project/' + this.projectId + '/analytics']);
  }

  // NO MORE USED
  goToHistory() {
    this.router.navigate(['project/' + this.projectId + '/history']);
  }

  getProjectId() {
    // this.projectid = this.route.snapshot.params['projectid'];
    // console.log('SIDEBAR - - - - - CURRENT projectid ', this.projectid);
    this.route.params.subscribe(params => {
      // const param = params['projectid'];
      console.log('NAVBAR - CURRENT projectid ', params);
    });
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN HOME ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;

      if (this.user) {

        this.getAllUsersOfCurrentProject();

      }
    });
  }

  // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE/UNAVAILABLE WHEN THE USER ENTER IN HOME
  // (GET THE PROJECT-USER CAN NOT BE DONE IN THE SIDEBAR BECAUSE WHEN THE PROJECT
  // IS SELECTED THE SIDEBAR HAS BEEN ALREADY CALLED)
  getProjectUser() {
    this.usersService.getProjectUsersByProjectIdAndUserId(this.user._id, this.projectId).subscribe((projectUser: any) => {
      console.log('H PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser)
      if (projectUser) {
        console.log('H PROJECT-USER ID ', projectUser[0]._id)
        console.log('H USER IS AVAILABLE ', projectUser[0].user_available)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available);
        }
        if (projectUser[0].role !== undefined) {
          console.log('H CURRENT USER ROLE IN THIS PROJECT ', projectUser[0].role);
          this.usersService.user_role(projectUser[0].role);
        }

      }
    },
      (error) => {
        console.log('H PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
      },
      () => {
        console.log('H PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
      });
  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('HOME COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          console.log('HOME COMP - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)
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
        console.log('PROJECT-USERS (FILTERED FOR PROJECT ID) - ERROR', error);
      },
      () => {
        console.log('PROJECT-USERS (FILTERED FOR PROJECT ID) - COMPLETE')
      });
  }

  // NOT YET USED
  superUserAuth() {
    if (!this.auth.superUserAuth(this.currentUserEmailgetFromStorage)) {
      console.log('+++ CURRENT U IS NOT SUPER USER ', this.currentUserEmailgetFromStorage);
      this.IS_SUPER_USER = false;
    } else {
      console.log('+++ !! CURRENT U IS SUPER USER ', this.currentUserEmailgetFromStorage);
      this.IS_SUPER_USER = true;

    }
  }


}
