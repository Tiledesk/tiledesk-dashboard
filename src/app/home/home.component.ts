import { Component, OnInit } from '@angular/core';
import { AuthService, SuperUser } from '../core/auth.service';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { RequestsService } from '../services/requests.service';
import { FaqKbService } from '../services/faq-kb.service';
import { BotLocalDbService } from '../services/bot-local-db.service';


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

  USER_ROLE: string;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private usersLocalDbService: UsersLocalDbService,
    private departmentService: MongodbDepartmentService,
    private requestsService: RequestsService,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService
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

    this.getFaqKbByProjectId();

    // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
    this.getAvailableProjectUsersByProjectId();
  }

  // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
  getAvailableProjectUsersByProjectId() {
    console.log('... CALLING GET AVAILABLE PROJECT USERS')
    this.usersService.getAvailableProjectUsersByProjectId().subscribe((available_project) => {
      console.log('»»»»»»» AVAILABLE PROJECT USERS ', available_project)
    })
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

  // <!-- RESOUCES (link renamed in WIDGET) -->
  goToResources() {
    // this.router.navigate(['project/' + this.projectId + '/resources']);
    this.router.navigate(['project/' + this.projectId + '/widget']);
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

          // save the user role in storage - then the value is get by auth.service:
          // the user with agent role can not access to the pages under the settings sub-menu
          // this.auth.user_role(projectUser[0].role);
          this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);

          // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
          this.USER_ROLE = projectUser[0].role;
        }

      }
    },
      (error) => {
        console.log('H PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ERROR ', error);
      },
      () => {
        console.log('H PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
      });
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {

      if (faqKb) {
        console.log('HOME - FAQs-KB (i.e. BOT) GET BY PROJECT ID', faqKb);
        this.botLocalDbService.saveBotsInStorage(faqKb._id, faqKb);
      }
    },
      (error) => {
        console.log('HOME - GET FAQs-KB (i.e. BOT) - ERROR ', error);
      },
      () => {
        console.log('HOME - GET FAQs-KB * COMPLETE');

      });

  }

  getAllUsersOfCurrentProject() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('HOME COMP - PROJECT-USERS (FILTERED FOR PROJECT ID)', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          if (projectUser && projectUser !== null) {
            console.log('HOME COMP - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)
          }
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
