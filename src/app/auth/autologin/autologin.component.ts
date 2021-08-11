import { Component, OnInit } from '@angular/core';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SsoService } from '../../core/sso.service';
import * as firebase from 'firebase/app';
import 'firebase/messaging';
import { isDevMode } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { environment } from '../../../environments/environment';
import { ProjectService } from '../../services/project.service';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'appdashboard-autologin',
  templateUrl: './autologin.component.html',
  styleUrls: ['./autologin.component.scss']
})
export class AutologinComponent implements OnInit {

  subscription: Subscription;
  FCM_Supported: boolean;
  APP_IS_DEV_MODE: boolean;
  isMobile: boolean;
  FCMcurrentToken: string;
  user: any;
  public version: string = environment.VERSION;

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private router: Router,
    public sso: SsoService,
    public appConfigService: AppConfigService,
    private projectService: ProjectService,
    private logger: LoggerService
  ) {

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      this.logger.log('[AUTOLOGIN] !! AUTH WF USER ', user)
    });
    this.APP_IS_DEV_MODE = isDevMode();
    this.logger.log('[AUTOLOGIN] SSO - autologin page isDevMode ', this.APP_IS_DEV_MODE);



    this.getJWTAndRouteParamsAndLogin();

    if (appConfigService.getConfig().pushEngine === 'firebase') {
      this.checkIfFCMIsSupported();
    }

  }

  getJWTAndRouteParamsAndLogin() {
    this.route.params.subscribe((params) => {
      this.logger.log('[AUTOLOGIN] SSO - autologin page params ', params)

      const route = params.route
      this.logger.log('[AUTOLOGIN] SSO - autologin page params route', route);


      const JWT = params.token
      this.logger.log('[AUTOLOGIN] SSO - autologin page params token ', JWT);



      this.logger.log('[AUTOLOGIN] SSO - autologin getConfig firebaseAuth', this.appConfigService.getConfig().firebaseAuth)
      if (this.appConfigService.getConfig().firebaseAuth === 'true') {

        if (JWT && route) {
          this.ssoLoginWithCustomToken(JWT, route)
        }
      } else {
        if (JWT && route) {
          this.ssoLogin(JWT, route)
        }
      }
    });
  }

  ngOnInit() {

    this.logger.log('[AUTOLOGIN] SSO - autologin page');
    this.detectMobile();
  }


  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[AUTOLOGIN] - IS MOBILE ', this.isMobile);
  }


  checkIfFCMIsSupported() {
    if (firebase.messaging.isSupported()) {
      // Supported
      this.FCM_Supported = true;
      this.logger.log('[AUTOLOGIN] SSO (autologin page) - *** >>>> FCM is Supported: ', this.FCM_Supported);
    } else {
      // NOT Supported
      this.FCM_Supported = false;
      this.logger.log('[AUTOLOGIN] SSO (autologin page) - *** >>>> FCM is Supported: ', this.FCM_Supported);
    }
  }

  ssoLogin(JWT, route) {
    this.logger.log('[AUTOLOGIN] SSO - ssoLogin getCurrentAuthenticatedUser route ', route);
    this.logger.log('[AUTOLOGIN] SSO - ssoLogin getCurrentAuthenticatedUser JWT ', JWT);

    this.logout();

    this.sso.getCurrentAuthenticatedUser(JWT).subscribe(auth_user => {
      this.logger.log('[AUTOLOGIN] SSO - ssoLogin getCurrentAuthenticatedUser RES ', auth_user);

      const user = { firstname: auth_user.firstname, lastname: auth_user.lastname, _id: auth_user._id, email: auth_user.email, emailverified: auth_user.emailverified, token: JWT }
      this.logger.log('[AUTOLOGIN] SSO - ssoLogin getCurrentAuthenticatedUser user ', user);

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('chat_sv5__tiledeskToken', JWT);

      this.auth.publishSSOloggedUser();

      this.router.navigate([route]);

    }, (error) => {
      this.logger.error('[AUTOLOGIN] SSO - ssoLogin getCurrentAuthenticatedUser ', error);

    }, () => {
      this.logger.log('[AUTOLOGIN] SSO - ssoLogin getCurrentAuthenticatedUser * COMPLETE *');

      const route_part = route.split('/');
      this.logger.log('[AUTOLOGIN] SSO - ssoLogin route_part ', route_part);
      const project_id = route_part[2]
      this.logger.log('[AUTOLOGIN] SSO - ssoLogin route_part ', route_part);

      const storedProjectJson = localStorage.getItem(project_id);
      this.logger.log('[AUTOLOGIN] SSO - ssoLogin storedProjectJson ', storedProjectJson);

      if (storedProjectJson === null) {
        this.getProjectFromRemotePublishAndSaveInStorage(project_id);
      }
    });
  }

  getProjectFromRemotePublishAndSaveInStorage(project_id) {

    this.projectService.getProjects().subscribe((prjcts: any) => {
      this.logger.log('[AUTOLOGIN] - PROJECTS OBJCTS FROM REMOTE CALLBACK ', prjcts);

      const prjct = prjcts.filter(p => p.id_project._id === project_id);

      this.logger.log('[AUTOLOGIN] - PROJECT OBJCT FILTERED FOR PROJECT ID ', prjct);
      // this.logger.log('[AUTOLOGIN] - PROJECT OBJCT FILTERED FOR PROJECT ID LENGHT ', prjct.length);

      if (prjct && prjct.length > 0) {
        this.logger.log('[AUTOLOGIN] - TEST --- HERE YES');


        const project_name = prjct[0].id_project.name;
        this.logger.log('[AUTOLOGIN] - PROJECT NAME GOT BY  PROJECT REMOTE ', project_name);
        // tslint:disable-next-line:max-line-length
        // this.notify.showNotificationChangeProject(`You have been redirected to the project <span style="color:#ffffff; display: inline-block; max-width: 100%;"> ${this.nav_project_name} </span>`, 0, 'info');

        const project: Project = {
          _id: project_id,
          name: project_name,
          profile_name: prjct[0].id_project.profile.name,
          trial_expired: prjct[0].id_project.trialExpired,
          trial_days_left: prjct[0].id_project.trialDaysLeft,
          operatingHours: prjct[0].id_project.activeOperatingHours
        }
        // PROJECT ID and NAME ARE SENT TO THE AUTH SERVICE THAT PUBLISHES
        this.auth.projectSelected(project);
        this.logger.log('[AUTOLOGIN] - PROJECT THAT IS PUBLISHED ', project);
        // this.project_bs.next(project);

        const projectForStorage: Project = {
          _id: project_id,
          name: project_name,
          role: prjct[0].role,
          profile_name: prjct[0].id_project.profile.name,
          trial_expired: prjct[0].id_project.trialExpired,
          trial_days_left: prjct[0].id_project.trialDaysLeft,
          operatingHours: prjct[0].id_project.activeOperatingHours
        }
        // SET THE ID, the NAME OF THE PROJECT and THE USER ROLE IN THE LOCAL STORAGE.
        this.logger.log('[AUTOLOGIN] - PROJECT THAT IS STORED', projectForStorage);
        localStorage.setItem(project_id, JSON.stringify(projectForStorage));

      }

    }, (error) => {
      this.logger.error('[AUTOLOGIN] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[AUTOLOGIN] - GET PROJECT BY ID - COMPLETE ');

    });
  }


  ssoLoginWithCustomToken(JWT, route) {
    // -------------
    // @ Logout
    // -------------
    this.logout();

    this.logger.log('[AUTOLOGIN] SSO - ssoLoginWithCustomToken');


    this.sso.chat21CreateFirebaseCustomToken(JWT).subscribe(fbtoken => {

      this.logger.log('[AUTOLOGIN] SSO - ssoLoginWithCustomToken chat21CreateFirebaseCustomToken res ', fbtoken);

      if (fbtoken) {

        firebase.auth().signInWithCustomToken(fbtoken)
          .then(firebase_user => {
            this.logger.log('[AUTOLOGIN] SSO - ssoLoginWithCustomToken - signInWithCustomToken ', firebase_user);

            if (firebase_user) {
              this.sso.getCurrentAuthenticatedUser(JWT).subscribe(auth_user => {
                this.logger.log('[AUTOLOGIN] SSO - ssoLoginWithCustomToken getCurrentAuthenticatedUser RES ', auth_user);
                this.logger.log('[AUTOLOGIN] SSO - ssoLoginWithCustomToken getCurrentAuthenticatedUser JWT ', JWT);
                const user = { firstname: auth_user.firstname, lastname: auth_user.lastname, _id: auth_user._id, token: JWT }

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('chat_sv5__tiledeskToken', JWT);

                this.auth.publishSSOloggedUser();

                this.router.navigate([route]);

                if (this.appConfigService.getConfig().pushEngine === 'firebase') {
                  if (!this.APP_IS_DEV_MODE && this.FCM_Supported === true) {
                    this.getPermission(auth_user._id);
                  }
                }

                // email: "pregino@f21test.it"
                // emailverified: true
                // firstname: "Gino"
                // lastname: "Pre"
                // token: "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGRkMzBiZmYwMTk1ZjAwMTdmNzJjNmQiLCJlbWFpbCI6InByZWdpbm9AZjIxdGVzdC5pdCIsImZpcnN0bmFtZSI6Ikdpbm8iLCJsYXN0bmFtZSI6IlByZSIsImVtYWlsdmVyaWZpZWQiOnRydWUsImlhdCI6MTU5OTQ4ODIzMiwiYXVkIjoiaHR0cHM6Ly90aWxlZGVzay5jb20iLCJpc3MiOiJodHRwczovL3RpbGVkZXNrLmNvbSIsInN1YiI6InVzZXIiLCJqdGkiOiJkMzZiNGUwOS00MzQ1LTRmZDYtYTNmZi1hMzY0NjdmNzdjYjgifQ.FMRFwxyHq2_fbR4_oEnG4cFKqZQxsK_YScJKKSptfUo"
                // _id: "5ddd30bff0195f0017f72c6d"

              }, (error) => {
                this.logger.error('[AUTOLOGIN] SSO - autologin getCurrentAuthenticatedUser ', error);

              }, () => {
                this.logger.log('[AUTOLOGIN] SSO - autologin getCurrentAuthenticatedUser * COMPLETE *');
              });
            }
          })
      }
    }, (error) => {
      this.logger.error('[AUTOLOGIN] SSO - autologin chat21CreateFirebaseCustomToken ', error);
    }, () => {
      this.logger.log('[AUTOLOGIN]SSO - autologin chat21CreateFirebaseCustomToken * COMPLETE *');
    });
  }

  getPermission(userid) {
    this.logger.log('[AUTOLOGIN] SSO - LOGIN - 5. getPermission ')
    const messaging = firebase.messaging();
    if (firebase.messaging.isSupported()) {
      // messaging.requestPermission()
      Notification.requestPermission()
        .then(() => {
          this.logger.log('[AUTOLOGIN] SSO - LOGIN - 5B. >>>> getPermission Notification permission granted.');
          return messaging.getToken()
        })
        .then(FCMtoken => {
          this.logger.log('[AUTOLOGIN] >>>> getPermission FCMtoken', FCMtoken)
          // Save FCM Token in Firebase
          this.FCMcurrentToken = FCMtoken;
          this.updateToken(FCMtoken, userid)
        })
        .catch((err) => {
          this.logger.error('[AUTOLOGIN] SSO - LOGIN - 5C. >>>> getPermission Unable to get permission to notify.', err);
        });
    }
  }

  updateToken(FCMcurrentToken, userid) {
    this.logger.log('[AUTOLOGIN] >>>> updateToken ', FCMcurrentToken);
    // this.afAuth.authState.take(1).subscribe(user => {
    if (!userid || !FCMcurrentToken) {
      return
    };
    this.logger.log('[AUTOLOGIN] update the token in the db');
    const connection = FCMcurrentToken;
    const updates = {};
    const urlNodeFirebase = '/apps/tilechat'
    const connectionsRefinstancesId = urlNodeFirebase + '/users/' + userid + '/instances/';

    // this.connectionsRefinstancesId = this.urlNodeFirebase + "/users/" + userUid + "/instances/";
    const device_model = {
      device_model: navigator.userAgent,
      language: navigator.language,
      platform: 'web/dashboard',
      platform_version: this.version
    }

    updates[connectionsRefinstancesId + connection] = device_model;

    this.logger.log('[AUTOLOGIN] Firebase Cloud Messaging  - Update token updates ------------>', updates);
    firebase.database().ref().update(updates)
  }


  logout() {
    this.logger.log('[AUTOLOGIN] SSO - autologin logout - dashboard version ', this.version)
    this.logger.log('[AUTOLOGIN] SSO - autologin logout')

    this.auth.showExpiredSessionPopup(false);

    this.auth.signOut('autologin');
  }

}
