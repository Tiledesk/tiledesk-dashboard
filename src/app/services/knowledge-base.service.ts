import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger/logger.service';
import { KB } from 'app/models/kbsettings-model';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {

  SERVER_BASE_PATH: string;
  TOKEN: string;
  user: any;
  project_id: any;

  constructor(
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private httpClient: HttpClient,
    private logger: LoggerService
  ) { 
    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfig();
  }

  // ******************************************
  // ********** INITIALIZING SERVICE **********
  // ***************** START ******************
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
    this.logger.log("get current project")
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.project_id = project._id
      }
    }, (error) => {
      this.logger.log("get current project ERROR: ", error)
    }, () => {
      this.logger.log("*COMPLETE*")
    });
  }
  // ******************************************
  // ********** INITIALIZING SERVICE **********
  // ***************** END ********************


  getKbSettings() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings";
    this.logger.log("[KNOWLEDGE BASE SERVICE] - get settings URL ", url);

    return this.httpClient.get(url, httpOptions);
  }

  saveKbSettings(kb_settings) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + kb_settings._id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - save settings URL ", url);

    return this.httpClient.put(url, kb_settings, httpOptions);
  }

  addNewKb(settings_id: string, kb: KB) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + settings_id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - add new kb URL ", url);

    return this.httpClient.post(url, kb, httpOptions);
  }

  deleteKb(settings_id: string, kb_id: string){
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/kbsettings/" + settings_id + "/" + kb_id;
    this.logger.log("[KNOWLEDGE BASE SERVICE] - delete kb URL ", url);

    return this.httpClient.delete(url, httpOptions);
  }

  

}
