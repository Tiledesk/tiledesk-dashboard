import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from './logger/logger.service';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {

  SERVER_BASE_PATH: string;
  TOKEN: string;
  GPT_API_URL: string;
  user: any;
  project_id: any;
  OPENAI_API_URL: string;


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
    //this.GPT_API_URL = "http://tiledesk-backend.h8dahhe4edc7cahh.francecentral.azurecontainer.io:8000/api";
    this.GPT_API_URL = "https://tiledesk-dev.blackwave-d2bf4ee1.westus2.azurecontainerapps.io/api";
    this.OPENAI_API_URL = "https://api.openai.com/v1";

  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[OPENAI.SERVICE] - No user signed in');
    }
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id
      }
    }, (error) => {
      this.logger.error('[OPENAI.SERVICE] - get current project ERROR: ', error);
    }, () => {
      this.logger.debug('[OPENAI.SERVICE] - get current project *COMPLETE*');
    });
  }

  ////////////////////////////////////////////////////////
  //////////////////// OPENAI - START ////////////////////
  ////////////////////////////////////////////////////////

  previewPrompt(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/openai/";
    this.logger.debug('[OPENAI.SERVICE] - preview prompt URL: ', url);

    return this.httpClient.post(url, data, httpOptions);
  }

  ////////////////////////////////////////////////////////
  //////////////////// OPENAI - START ////////////////////
  ////////////////////////////////////////////////////////


  askGpt(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }
    // const url = this.GPT_API_URL + "/qa";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/qa";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/qa";
    this.logger.debug('[OPENAI.SERVICE] - ask gpt URL: ', url);
    return this.httpClient.post(url, data, httpOptions);
  }

  askGptPrev(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }

    // const url = this.GPT_API_URL + "/qa";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb/qa";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/qa";
    this.logger.debug('[OPENAI.SERVICE] - ask gpt URL: ', url);
    return this.httpClient.post(url, data, httpOptions);
  }

  startScraping(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    // const url = this.GPT_API_URL + "/scrape";
    // const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/startscrape";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/single";
    this.logger.debug('[OPENAI.SERVICE] - scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  startScrapingPrev(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }
    // const url = this.GPT_API_URL + "/scrape";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/startscrape";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/single";
    this.logger.debug('[OPENAI.SERVICE] - scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  
  checkScrapingStatus(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }
    //const url = this.GPT_API_URL + "/scrape/status";
    //const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/checkstatus";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/status?returnObject=true";
    this.logger.debug('[OPENAI.SERVICE] - check scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  checkScrapingStatusPrev(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN // remove it for pugliai endpoint
      })
    }
    //const url = this.GPT_API_URL + "/scrape/status";
    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/checkstatus";
    // const url = this.SERVER_BASE_PATH + this.project_id + "/kb/scrape/status";
    this.logger.debug('[OPENAI.SERVICE] - check scraping URL: ', url);
    return this.httpClient.post(url, JSON.stringify(data), httpOptions);
  }

  checkKeyValidity(key) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      })
    }

    const url = this.OPENAI_API_URL + "/models";
    this.logger.debug('[OPENAI.SERVICE] - key validity URL: ', url);

    return this.httpClient.get(url, httpOptions);
  }


}
