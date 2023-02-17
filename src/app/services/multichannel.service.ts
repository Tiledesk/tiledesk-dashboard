import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class MultichannelService {
  SERVER_BASE_PATH: string;
  TOKEN: string;
  user: any;
  project: any;
  
  constructor(private http: HttpClient,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private logger: LoggerService) {

    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getAppConfig();
    this.getCurrentProjectAndBuildFaqUrls();
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
    } else {
      this.logger.log('[FAQ-SERV] - No user is signed in');
    }
  }

  getCurrentProjectAndBuildFaqUrls() {
    // this.logger.log('[FAQ-SERV] - SUBSCRIBE TO CURRENT PROJCT ')
    this.auth.project_bs.subscribe((project) => {
      this.project = project

      if (this.project) {
        this.logger.log('[FAQ-SERV] project ID ', this.project._id)
      }
    });
  }


  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    // this.logger.log('[FAQ-SERV] getAppConfig SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCodeForWhatsappTest(info) {
    let promise = new Promise((resolve, reject) => {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
      })

      this.http.post(this.SERVER_BASE_PATH + "modules/whatsapp/newtest", info, { headers: headers })
        .toPromise().then((res) => {
          resolve(res)
        }).catch((err) => {
          reject(err);
        })
    })
    return promise;
  }
}
