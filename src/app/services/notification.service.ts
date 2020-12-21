import { UsersService } from './users.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from './../core/auth.service';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class NotificationService {

  SERVER_BASE_PATH: string;
  projectID: string;
  project_user_id: string;
  user: any;
  TOKEN: string;

  constructor(private http: HttpClient,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private usersService: UsersService
  ) {
    this.user = auth.user_bs.value;
    this.project_user_id = usersService.project_user_id_bs.value;
    this.checkUser();

    // this.usersService.project_user_id_bs.subscribe((project_user_id) => {
    //   this.project_user_id = project_user_id;
    //   console.log("################ PROJECT USER ID: ", this.project_user_id);
    // })
    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

    this.getCurrentProject();
    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (ANALYTICS-SERV) SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    console.log('============ PROJECT SERVICE - SUBSCRIBE TO CURRENT PROJ ============');
    this.auth.project_bs.subscribe((project) => {
      console.log('AnalyticsService  project', project)
      if (project) {
        this.projectID = project._id;
        console.log('AnalyticsService ID PROJECT ', this.projectID);
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      console.log('AnalyticsService user is signed in');
    } else {
      console.log('AnalyticsService No user is signed in');
    }
  }

  checkNotificationsStatus(project_user_id) {
    console.log("################ CHECK NOTIFICATION STATUS")

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.http.get(this.SERVER_BASE_PATH + this.projectID + "/project_users/" + project_user_id, { headers: headers })

  }

  enableDisableAssignedNotification(status) {
    let promise = new Promise((resolve, reject) => {

      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })

      this.http.put(this.SERVER_BASE_PATH + this.projectID + "/project_users/", { "settings.email.notification.conversation.assigned.toyou": status }, { headers: headers })
                .toPromise().then((res) => {
                  resolve(res)
                }).catch((err) => {
                  reject(err)
                })
    })
    return promise;
  }

  enableDisableUnassignedNotification(status) {
    let promise = new Promise((resolve, reject) => {
      
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
      
      this.http.put(this.SERVER_BASE_PATH + this.projectID + "/project_users/", { "settings.email.notification.conversation.pooled": status }, { headers: headers })
                .toPromise().then((res) => {
                  resolve(res)
                }).catch((err) => {
                  reject(err)
                })
    })
    return promise;
  }

}
