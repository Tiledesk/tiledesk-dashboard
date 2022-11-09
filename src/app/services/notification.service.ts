import { UsersService } from './users.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from './../core/auth.service';
import { HttpClient, HttpHeaderResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class NotificationService {

  SERVER_BASE_PATH: string;
  projectID: string;
  project_user_id: string;
  user: any;
  TOKEN: string;

  constructor(
    private _httpClient: HttpClient,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    public usersService: UsersService,
    private logger: LoggerService
  ) {
    this.user = auth.user_bs.value;
    this.project_user_id = usersService.project_user_id_bs.value;
    this.checkIfUserExistAndGetToken();

  
    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });

    this.getCurrentProject();
    this.getServerPathFromAppConfig();
  }

  getServerPathFromAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[NOTIFICATIONS-SERV] SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {

    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[NOTIFICATIONS-SERV]  project', project)
      if (project) {
        this.projectID = project._id;
        this.logger.log('[NOTIFICATIONS-SERV] ID PROJECT ', this.projectID);
      }
    });
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.logger.log('[NOTIFICATIONS-SERV] user is signed in');
    } else {
      this.logger.error('[NOTIFICATIONS-SERV]  No user is signed in');
    }
  }

  checkNotificationsStatus(project_user_id) {
    this.logger.log("[NOTIFICATIONS-SERV]  CHECK NOTIFICATION STATUS project_user_id", project_user_id)

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this._httpClient.get(this.SERVER_BASE_PATH + this.projectID + "/project_users/" + project_user_id, { headers: headers })

  }


  // -----------------------------------------------------------------------------------------------
  // ENABLE/DISABLE ASSIGNED NOTIFICATION - IS IN THE TAB NOTIFICATION OF THE CURRENT USER PROFILE
  // ---------------------------------------------------------------------------------------------
  enableDisableAssignedNotification(status) {
    let promise = new Promise((resolve, reject) => {
      this.logger.log("[NOTIFICATIONS-SERV]  ENABLE/DISABLE ASSIGNED NOTIFICATION status", status)
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN,
      })

      this._httpClient.put(this.SERVER_BASE_PATH + this.projectID + "/project_users/", { "settings.email.notification.conversation.assigned.toyou": status }, { headers: headers })
        .toPromise().then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
    })
    return promise;
  }
  // -------------------------------------------------------------------------------------------------
  // ENABLE/DISABLE UNASSIGNED NOTIFICATION - IS IN THE TAB NOTIFICATION OF THE CURRENT USER PROFILE
  // -----------------------------------------------------------------------------------------------
  enableDisableUnassignedNotification(status) {
    let promise = new Promise((resolve, reject) => {
      this.logger.log("[NOTIFICATIONS-SERV]  ENABLE/DISABLE UNASSIGNED NOTIFICATION status", status)
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })

      this._httpClient.put(this.SERVER_BASE_PATH + this.projectID + "/project_users/", { "settings.email.notification.conversation.pooled": status }, { headers: headers })
        .toPromise().then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err)
        })
    })
    return promise;
  }

}
