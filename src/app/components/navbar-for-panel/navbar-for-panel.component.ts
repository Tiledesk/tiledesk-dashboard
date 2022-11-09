import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { UsersService } from '../../services/users.service';
import { AppConfigService } from '../../services/app-config.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { LocalDbService } from '../../services/users-local-db.service';
import { NavbarForPanelService } from './navbar-for-panel.service';
import { WsRequestsService } from './../../services/websocket/ws-requests.service';
import { LoggerService } from './../../services/logger/logger.service';
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
  dkmode: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    public appConfigService: AppConfigService,
    private router: Router,
    public usersLocalDbService: LocalDbService,
    public navbarForPanelService: NavbarForPanelService,
    public wsRequestsService: WsRequestsService,
    private logger: LoggerService

  ) {
    this.getCurrentRoute();
  }

  ngOnInit() {

    this.getLoggedUser();
    this.getCurrentProject();
    this.getStorageBucket();
    this.checkUserImageExist();
    // this.getUserAvailability();
    // this.getUserUserIsBusy();

    this.setInitialDisplayPreferences();
  }




  getCurrentRoute() {
    this.router.events
      .subscribe((e) => {
        if (e instanceof NavigationEnd) {
          this.logger.log('NAVBAR-X-PANEL - ROUTE params e ', e);
          this.logger.log('NAVBAR-X-PANEL - ROUTE params e.url ', e.url);

          const current_url = e.url;
          if (current_url === '/projects-for-panel') {

            // GENERA BUG: QUANDO DAL DETTAGLI PROGETTO (LISTA DELLE UNSERVED) SI TORNA ALLA LISTA DEI PROGETTI IL PROGETTO 
            // PER CUI SI è SELEZIONATO IL DETTAGLIO NON VISULAIZZA LO STATO DI DISPONIBILITA'
            // this.usersService.unsubscriptionToWsCurrentUser(this.PROJECT_USER_ID)


            this.IS_AVAILABLE = null;
            this.IS_PROJECTS_X_PANEL_ROUTE = true;
            this.logger.log('NAVBAR-X-PANEL ROUTE is', e.url, ' - IS AVAILABLE ', this.IS_AVAILABLE);
          } else {
            this.IS_PROJECTS_X_PANEL_ROUTE = false;
          }
        }
      })
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    this.logger.log('STORAGE-BUCKET NAVBAR-X-PANEL ', this.storageBucket)
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('NAVBAR-X-PANEL - LOGGED USER ', user)
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;

      if (user) {
        this.currentUserId = user._id;
        this.logger.log('NAVBAR-X-PANEL - CURRENT USER ID ', this.currentUserId);

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
        this.logger.log('NAVBAR-X-PANEL - GET CURRENT PROJECT - PROJECT ID  ', this.projectId)

        this.getProjectUser();
      }
    });
  }


  getProjectUser() {
    this.logger.log('NAVBAR-X-PANEL  CALL GET-PROJECT-USER')
    this.usersService.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {
      this.logger.log('NAVBAR-X-PANEL GET BY USER-ID - PROJECT-ID ', this.projectId);
      this.logger.log('NAVBAR-X-PANEL GET BY USER-ID - CURRENT-USER-ID ', this.user._id);
      this.logger.log('NAVBAR-X-PANEL GET BY USER-ID - PROJECT USER ', projectUser);
      this.logger.log('NAVBAR-X-PANEL GET BY USER-ID - PROJECT USER LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {


        this.logger.log('NAVBAR-X-PANEL PROJECT-USER ID ', projectUser[0]._id)
        this.logger.log('NAVBAR-X-PANEL USER IS AVAILABLE ', projectUser[0].user_available)
        this.logger.log('NAVBAR-X-PANEL USER IS BUSY (from db)', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        this.PROJECT_USER_ID = projectUser[0]._id;

        this.subsTo_WsCurrentUser(projectUser[0]._id)

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy, projectUser[0] )
        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          this.logger.log('NAVBAR-X-PANEL GET PROJECT USER ROLE FOR THE PROJECT ', this.projectId, ' »» ', projectUser[0].role);

          // ASSIGN THE projectUser[0].role VALUE TO USER_ROLE
          this.USER_ROLE = projectUser[0].role;

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        this.logger.log('NAVBAR-X-PANEL PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      this.logger.error('NAVBAR-X-PANEL PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
    }, () => {
      this.logger.log('NAVBAR-X-PANEL PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }


  subsTo_WsCurrentUser(currentuserprjctuserid) {
    this.logger.log('NAVBAR-X-PANEL - SUBSCRIBE TO WS CURRENT-USER AVAILABILITY  prjct user id of current user ', currentuserprjctuserid);
    // this.usersService.subscriptionToWsCurrentUser(currentuserprjctuserid);
    this.wsRequestsService.subscriptionToWsCurrentUser(currentuserprjctuserid);
    this.getWsCurrentUserAvailability$();
    this.getWsCurrentUserIsBusy$();
  }

  getWsCurrentUserAvailability$() {
    // this.usersService.currentUserWsAvailability$
    this.wsRequestsService.currentUserWsAvailability$

      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_availability) => {
        // this.logger.log('NAVBAR-X-PANEL - IS AVAILABLE (from SUBSCR) ', currentuser_availability);
        if (currentuser_availability !== null) {
          this.IS_AVAILABLE = currentuser_availability;
        }
      }, error => {
        this.logger.error('NAVBAR-X-PANEL - GET WS CURRENT-USER AVAILABILITY * error * ', error)
      }, () => {
        this.logger.log('NAVBAR-X-PANEL - GET WS CURRENT-USER AVAILABILITY *** complete *** ')
      });
  }

  getWsCurrentUserIsBusy$() {
    // this.usersService.currentUserWsIsBusy$
    this.wsRequestsService.currentUserWsIsBusy$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((currentuser_isbusy) => {
        // this.logger.log('NAVBAR-X-PANEL - GET WS CURRENT-USER - currentuser_isbusy? ', currentuser_isbusy);
        if (currentuser_isbusy !== null) {
          this.IS_BUSY = currentuser_isbusy;
          // this.logger.log('NAVBAR-X-PANEL - GET WS CURRENT-USER (from ws)- this.IS_BUSY? ', this.IS_BUSY);
        }
      }, error => {
        this.logger.error('NAVBAR-X-PANEL - GET WS CURRENT-USER IS BUSY * error * ', error)
      }, () => {
        this.logger.log('NAVBAR-X-PANEL - GET WS CURRENT-USER IS BUSY *** complete *** ')
      });
  }


  getUserAvailability() {
    this.usersService.user_is_available_bs.subscribe((user_available) => {
      this.IS_AVAILABLE = user_available;
      this.logger.log('NAVBAR-X-PANEL - USER IS AVAILABLE ', this.IS_AVAILABLE);
    });
  }

  getUserUserIsBusy() {
    this.usersService.user_is_busy$.subscribe((user_isbusy) => {
      this.IS_BUSY = user_isbusy;
      // THE VALUE OF IS_BUSY IS THEN UPDATED WITH THE VALUE RETURNED FROM THE WEBSOCKET getWsCurrentUserIsBusy$()
      // WHEN, FOR EXAMPLE IN PROJECT-SETTINGS > ADVANCED THE NUM OF MAX CHAT IS 3 AND THE 
      this.logger.log('!!! SIDEBAR - USER IS BUSY (from db)', this.IS_BUSY);
    });
  }



  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      this.logger.log('NAVBAR-X-PANEL - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;
      if (this.storageBucket && this.userProfileImageExist === true) {
        this.logger.log('NAVBAR-X-PANEL - USER PROFILE EXIST - BUILD userProfileImageurl');
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


  changeAvailabilityState(IS_AVAILABLE, profilestatus) {
    this.logger.log('SB - CHANGE STATUS - USER IS AVAILABLE ? ', IS_AVAILABLE);
    // this.logger.log('SB - CHANGE STATUS - PROJECT USER ID: ', this.projectUser_id);


    // this.usersService.updateProjectUser(this.projectUser_id, IS_AVAILABLE).subscribe((projectUser: any) => {
    // DONE - WORKS NK-TO-TEST - da implementare quando viene implementato il servizio - serve per cambiare lo stato di disponibilità dell'utente corrente
    // anche in USER & GROUP bisogna cambiare per la riga dell'utente corrente   
    this.usersService.updateCurrentUserAvailability(this.projectId, IS_AVAILABLE, profilestatus).subscribe((projectUser: any) => { // non 

      this.logger.log('PROJECT-USER UPDATED ', projectUser)

      // NOTIFY TO THE USER SERVICE WHEN THE AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
      // this.usersService.availability_btn_clicked(true)

    }, (error) => {
      this.logger.error('PROJECT-USER UPDATED ERR  ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating status', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilityErrorNoticationMsg, 4, 'report_problem');

    }, () => {
      this.logger.log('PROJECT-USER UPDATED  * COMPLETE *');

      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('status successfully updated', 2, 'done');
      // this.notify.showWidgetStyleUpdateNotification(this.changeAvailabilitySuccessNoticationMsg, 2, 'done');


      // this.getUserAvailability()
      this.getProjectUser();
    });
  }


  setInitialDisplayPreferences() {
    this.dkmode = this.usersLocalDbService.getStoredAppearanceDisplayPreferences();
    this.logger.log('NAVBAR-X-PANEL -  dkmode  ', this.dkmode);

    if (this.dkmode === null) {
      this.dkmode = 'true'
      this.usersLocalDbService.storeAppearanceDisplayPreferences(this.dkmode)
    }
  }


  selectAppearance(dkm) {
    this.logger.log('NAVBAR-X-PANEL -  dkm  ', dkm);
    // if (this.dkmode === 'true') {
      this.dkmode = dkm;
      this.navbarForPanelService.publishDisplayPreferences(dkm);
      this.usersLocalDbService.storeAppearanceDisplayPreferences(dkm);
      this.logger.log('NAVBAR-X-PANEL -  dkmode  ', this.dkmode);
    // }

    // if (this.dkmode === 'false') {
    //   this.dkmode = 'true';
    //   this.navbarForPanelService.publishDisplayPreferences(this.dkmode);
    //   this.usersLocalDbService.storeAppearanceDisplayPreferences(this.dkmode);
    // }

  }

}
