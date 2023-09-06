import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from './logger/logger.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OpenaikbsService {

  SERVER_BASE_PATH: string;
  TOKEN: string;
  GPT_API_URL: string;
  user: any;
  project_id: any;

  constructor(
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService
  ) { 
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfig();
    this.GPT_API_URL = "http://tiledesk-backend.h8dahhe4edc7cahh.francecentral.azurecontainer.io:8000/api";
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[OPENAIKBS.SERVICE] - No user signed in');
    }
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getCurrentProject() {
    console.log("get current project")
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id
      }
    }, (error) => {
      console.log("get current project ERROR: ", error)
    }, () => {
      console.log("*COMPLETE*")
    });
  }

  getAllOpenaikbs() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/openai_kbs";
    console.log('[OPENAIKBS.SERVICE] getAllOpenaikbs - url ', url);

    return this.httpClient.get(url, httpOptions);
  }

  addOpenaiKb(openaikb) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/openai_kbs";
    console.log('[OPENAIKBS.SERVICE] addOpenaiKb - url ', url);

    return this.httpClient.post(url, openaikb, httpOptions);
  } 

  deleteOpenaiKb(kbid) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/openai_kbs/" + kbid;
    console.log('[OPENAIKBS.SERVICE] deleteOpenaiKb - url ', url);

    return this.httpClient.delete(url, httpOptions);
  }


  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  askGpt(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    const url = this.GPT_API_URL + "/qa"
    console.log('[GPT.SERV] - GET *ALL* TEMPLATES - URL', url);
    console.log("data: ", data);

    return this.httpClient.post(url, data, httpOptions);
  }

  startScraping(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    const url = this.GPT_API_URL + "/scrape";
    console.log('[GPT.SERV] - GET *ALL* TEMPLATES - URL', url);
    console.log("data: ", data);

    return this.httpClient.post(url, data, httpOptions);

  }

  checkScrapingStatus(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    const url = this.GPT_API_URL + "/scrape/status";
    console.log('[GPT.SERV] - GET *ALL* TEMPLATES - URL', url);
    console.log("data: ", data);

    return this.httpClient.post(url, data, httpOptions);
  }

  
}
