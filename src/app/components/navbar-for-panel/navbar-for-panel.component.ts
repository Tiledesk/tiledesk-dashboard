import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
import { AppConfigService } from '../../services/app-config.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
@Component({
  selector: 'appdashboard-navbar-for-panel',
  templateUrl: './navbar-for-panel.component.html',
  styleUrls: ['./navbar-for-panel.component.scss']
})
export class NavbarForPanelComponent implements OnInit {
  user: any;
  currentUserId: string;
  IS_AVAILABLE: boolean;
  IS_BUSY: boolean;
  USER_ROLE: string;
  projectId: string;

  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  userProfileImageurl: string;
  storageBucket: string;
  timeStamp: any;
  PROJECT_USER_ID: string;
  IS_PROJECTS_X_PANEL_ROUTE: boolean;

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    public appConfigService: AppConfigService,
    private router: Router
  ) {  this.getCurrentRoute();}

  ngOnInit() {

    this.getLoggedUser();
    this.getCurrentProject();
    this.getStorageBucket();
    this.checkUserImageExist();
    // this.getUserAvailability();
    // this.getUserUserIsBusy();

   
  }

  getCurrentRoute() {
    this.router.events
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          console.log('NAVBAR-X-PANEL - ROUTE params e ', e);
          console.log('NAVBAR-X-PANEL - ROUTE params e.url ', e.url);

          const current_url = e.url;
          if (current_url === '/projects-for-panel') {
            this.usersService.unsubscriptionToWsCurrentUser(this.PROJECT_USER_ID)
            this.IS_AVAILABLE = null;
            this.IS_PROJECTS_X_PANEL_ROUTE = true;
            console.log('NAVBAR-X-PANEL ROUTE is', e.url ,' - IS AVAILABLE ',  this.IS_AVAILABLE);
          } else {
            this.IS_PROJECTS_X_PANEL_ROUTE = false;
          }
        }
      })
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET NAVBAR-X-PANEL ', this.storageBucket)
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('NAVBAR-X-PANEL - LOGGED USER ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;

      if (user) {
        this.currentUserId = user._id;
        console.log('NAVBAR-X-PANEL - CURRENT USER ID ', this.currentUserId);

        if (this.currentUserId) {
          // this.getProjectUserByCurrentUserIdAndProjectId()
        }
      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        console.log('NAVBAR-X-PANEL - GET CURRENT PROJECT - PROJECT ID  ', this.projectId)

        this.getProjectUser();
      }
    });
  }


  getProjectUser() {
    console.log('NAVBAR-X-PANEL  CALL GET-PROJECT-USER')
    this.usersService.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {
      console.log('NAVBAR-X-PANEL GET BY USER-ID - PROJECT-ID ', this.projectId);
      console.log('NAVBAR-X-PANEL GET BY USER-ID - CURRENT-USER-ID ', this.user._id);
      console.log('NAVBAR-X-PANEL GET BY USER-ID - PROJECT USER ', projectUser);
      console.log('NAVBAR-X-PANEL GET BY USER-ID - PROJECT USER LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {


        console.log('NAVBAR-X-PANEL PROJECT-USER ID ', projectUser[0]._id)
        console.log('NAVBAR-X-PANEL USER IS AVAILABLE ', projectUser[0].user_available)
        console.log('NAVBAR-X-PANEL USER IS BUSY (from db)', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        this.PROJECT_USER_ID = projectUser[0]._id;

        this.subsTo_WsCurrentUser(projectUser[0]._id)

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy)
        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          console.log('NAVBAR-X-PANEL GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

          // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
          this.USER_ROLE = projectUser[0].role;

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        console.log('NAVBAR-X-PANEL PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      console.log('NAVBAR-X-PANEL PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
    }, () => {
      console.log('NAVBAR-X-PANEL PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }


  subsTo_WsCurrentUser(currentuserprjctuserid) {
    console.log('NAVBAR-X-PANEL - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
    this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
    this.getWsCurrentUserAvailability$();
    this.getWsCurrentUserIsBusy$();
  }

  getWsCurrentUserAvailability$() {
    this.usersService.currentUserWsAvailability$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_availability) => {
        console.log('NAVBAR-X-PANEL - IS AVAILABLE (from SUBSCR) ', currentuser_availability);
        if (currentuser_availability !== null) {
          this.IS_AVAILABLE = currentuser_availability;
        }
      }, error => {
        console.log('NAVBAR-X-PANEL - GET WS CURRENT-USER AVAILABILITY * error * ', error)
      }, () => {
        console.log('NAVBAR-X-PANEL - GET WS CURRENT-USER AVAILABILITY *** complete *** ')
      });
  }

  getWsCurrentUserIsBusy$() {
    this.usersService.currentUserWsIsBusy$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_isbusy) => {
        console.log('NAVBAR-X-PANEL - GET WS CURRENT-USER - currentuser_isbusy? ', currentuser_isbusy);
        if (currentuser_isbusy !== null) {
          this.IS_BUSY = currentuser_isbusy;
          console.log('NAVBAR-X-PANEL - GET WS CURRENT-USER (from ws)- this.IS_BUSY? ', this.IS_BUSY);
        }
      }, error => {
        console.log('NAVBAR-X-PANEL - GET WS CURRENT-USER IS BUSY * error * ', error)
      }, () => {
        console.log('NAVBAR-X-PANEL - GET WS CURRENT-USER IS BUSY *** complete *** ')
      });
  }


  getUserAvailability() {
    this.usersService.user_is_available_bs.subscribe((user_available) => {
      this.IS_AVAILABLE = user_available;
      console.log('NAVBAR-X-PANEL - USER IS AVAILABLE ', this.IS_AVAILABLE);
    });
  }

  getUserUserIsBusy() {
    this.usersService.user_is_busy$.subscribe((user_isbusy) => {
      this.IS_BUSY = user_isbusy;
      // THE VALUE OF IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
      // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
      console.log('!!! SIDEBAR - USER IS BUSY (from db)', this.IS_BUSY);
    });
  }



  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      console.log('NAVBAR-X-PANEL - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;
      if (this.storageBucket && this.userProfileImageExist === true) {
        console.log('NAVBAR-X-PANEL - USER PROFILE EXIST - BUILD userProfileImageurl');
        this.setImageProfileUrl(this.storageBucket)
      }
    });
  }



  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.currentUserId + '%2Fphoto.jpg?alt=media';
    this.timeStamp = (new Date()).getTime();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      return this.userProfileImageurl + '&' + this.timeStamp;
    }
    return this.userProfileImageurl
  }








}
