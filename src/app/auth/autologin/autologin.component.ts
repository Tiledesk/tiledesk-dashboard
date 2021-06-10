import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SsoService } from '../../core/sso.service';
import * as firebase from 'firebase';
import { isDevMode } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';
import { environment } from '../../../environments/environment';

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
    public appConfigService: AppConfigService
  ) {

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      console.log('!! AUTH WF USER ', user)
    });
    this.APP_IS_DEV_MODE = isDevMode();
    console.log('SSO - autologin page isDevMode ', this.APP_IS_DEV_MODE);



    this.getJWTAndRouteParamsAndLogin();
   
    if (appConfigService.getConfig().pushEngine === 'firebase') {
      this.checkIfFCMIsSupported();
    }

  }

  getJWTAndRouteParamsAndLogin() {
    this.route.params.subscribe((params) => {
      console.log('SSO - autologin page params ', params)

      const route = params.route
      console.log('SSO - autologin page params route', route);


      const JWT = params.token
      console.log('SSO - autologin page params token ', JWT);



      console.log('SSO - autologin getConfig firebaseAuth', this.appConfigService.getConfig().firebaseAuth)
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

    console.log('SSO - autologin page');
    this.detectMobile();
  }


  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    console.log('WS-REQUEST-SERVED - IS MOBILE ', this.isMobile);
  }


  checkIfFCMIsSupported() {
    if (firebase.messaging.isSupported()) {
      // Supported
      this.FCM_Supported = true;
      console.log('SSO (autologin page) - *** >>>> FCM is Supported: ', this.FCM_Supported);
    } else {
      // NOT Supported
      this.FCM_Supported = false;
      console.log('SSO (autologin page) - *** >>>> FCM is Supported: ', this.FCM_Supported);
    }
  }

  ssoLogin(JWT, route) {

    console.log('SSO - ssoLogin getCurrentAuthenticatedUser route ', route);
    console.log('SSO - ssoLogin getCurrentAuthenticatedUser JWT ', JWT);
    
    this.logout();

    this.sso.getCurrentAuthenticatedUser(JWT).subscribe(auth_user => {
      console.log('SSO - ssoLogin getCurrentAuthenticatedUser RES ', auth_user);

      const user = { firstname: auth_user.firstname, lastname: auth_user.lastname, _id: auth_user._id, email: auth_user.email, emailverified: auth_user.emailverified, token: JWT }
      console.log('SSO - ssoLogin getCurrentAuthenticatedUser user ', user);

      localStorage.setItem('user', JSON.stringify(user));

      this.auth.publishSSOloggedUser();

      this.router.navigate([route]);

    }, (error) => {
      console.log('SSO - ssoLogin getCurrentAuthenticatedUser ', error);

    }, () => {
      console.log('SSO - ssoLogin getCurrentAuthenticatedUser * COMPLETE *');
    });
  }

  ssoLoginWithCustomToken(JWT, route) {
    // -------------
    // @ Logout
    // -------------
    this.logout();

    console.log('SSO - getUrl');


    this.sso.chat21CreateFirebaseCustomToken(JWT).subscribe(fbtoken => {

      console.log('SSO - ssoLoginWithCustomToken chat21CreateFirebaseCustomToken res ', fbtoken);

      if (fbtoken) {

        firebase.auth().signInWithCustomToken(fbtoken)
          .then(firebase_user => {
            console.log('SSO - ssoLoginWithCustomToken - signInWithCustomToken ', firebase_user);


       

            if (firebase_user) {
              this.sso.getCurrentAuthenticatedUser(JWT).subscribe(auth_user => {
                console.log('SSO - ssoLoginWithCustomToken getCurrentAuthenticatedUser RES ', auth_user);

                const user = { firstname: auth_user.firstname, lastname: auth_user.lastname, _id: auth_user._id, token: JWT }

                localStorage.setItem('user', JSON.stringify(user));

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
                console.log('SSO - autologin getCurrentAuthenticatedUser ', error);

              }, () => {
                console.log('SSO - autologin getCurrentAuthenticatedUser * COMPLETE *');
              });
            }


          })
      }

    }, (error) => {
      console.log('SSO - autologin chat21CreateFirebaseCustomToken ', error);
    }, () => {
      console.log('SSO - autologin chat21CreateFirebaseCustomToken * COMPLETE *');
    });
  }

  getPermission(userid) {
    console.log('SSO - LOGIN - 5. getPermission ')
    const messaging = firebase.messaging();
    if (firebase.messaging.isSupported()) {
      // messaging.requestPermission()
      Notification.requestPermission()
        .then(() => {
          console.log('SSO - LOGIN - 5B. >>>> getPermission Notification permission granted.');
          return messaging.getToken()
        })
        .then(FCMtoken => {
          console.log('>>>> getPermission FCMtoken', FCMtoken)
          // Save FCM Token in Firebase
          this.FCMcurrentToken = FCMtoken;
          this.updateToken(FCMtoken, userid)
        })
        .catch((err) => {
          console.log('SSO - LOGIN - 5C. >>>> getPermission Unable to get permission to notify.', err);
        });
    }
  }

  updateToken(FCMcurrentToken, userid) {
    console.log('>>>> updateToken ', FCMcurrentToken);
    // this.afAuth.authState.take(1).subscribe(user => {
    if (!userid || !FCMcurrentToken) {
      return
    };
    console.log('aggiorno token nel db');
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

    console.log('Firebase Cloud Messaging  - Aggiorno token ------------>', updates);
    firebase.database().ref().update(updates)
  }

  
  logout() {
    console.log('SSO - autologin')

    console.log('SSO - autologin - WORKS WITH FIREBASE ')
    this.auth.showExpiredSessionPopup(false);

    this.auth.signOut('autologin');
  }

}
