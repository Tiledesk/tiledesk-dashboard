import { Injectable } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  user: any;
  TOKEN: string;
  projectID: string;
  PROMO_BANNER_URL: string;

  constructor(
    public auth: AuthService,
    public _httpclient: HttpClient,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfigAndBuildUrl();
  }

  getAppConfigAndBuildUrl() {
    this.PROMO_BANNER_URL = this.appConfigService.getConfig().promoBannerUrl;
    this.logger.log('[HOME-SERV] - PROMO BANNER URL ', this.PROMO_BANNER_URL);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
      }
    });
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[HOME-SERV] - No user is signed in');
    }
  }

  getPromoBanner(): Observable<[any]> {
    const url = this.PROMO_BANNER_URL;

    this.logger.log('[HOME-PROMO-BANNER] - GET PROMO BRAND URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }),
      // responseType: 'text' as 'json'
    };

    return this._httpclient
      .get<[any]>(url, httpOptions)
  }
}
