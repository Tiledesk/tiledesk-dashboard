import { Injectable } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { AuthService } from 'app/core/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from './logger/logger.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationsService {

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
    this.user = auth.user_bs.value
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getCurrentProject();
    this.getAppConfig();
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
    } else {
      this.logger.log('[AUTOMATIONS.SERVICE] - No user signed in');
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
      this.logger.error('[AUTOMATIONS.SERVICE] - get current project ERROR: ', error);
    }, () => {
      this.logger.debug('[AUTOMATIONS.SERVICE] - get current project *COMPLETE*');
    });
  }

  getTransactions(channel) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/logs/" + channel;
    this.logger.debug('[AUTOMATIONS.SERVICE] - get transaction for current project');

    return this.httpClient.get(url, httpOptions);
  }

  getTransactionLogs(transaction_id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH + this.project_id + "/logs/whatsapp/" + transaction_id;
    this.logger.debug('[AUTOMATIONS.SERVICE] - get logs for transaction_id ' + transaction_id);

    return this.httpClient.get(url, httpOptions);
  }

  getWATemplates() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    }

    const url = this.SERVER_BASE_PATH  + "modules/whatsapp/api/templates/"  + this.project_id;
    this.logger.debug('[AUTOMATIONS.SERVICE] - get WA templates url ' + url);

    return this.httpClient.get(url, httpOptions);
  }

   public uploadCsv(formData: any) {
    const options = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH  + "modules/whatsapp/api/tiledesk/broadcast/csv";
    // const url = "https://73acaf35017f.ngrok-free.app/api/tiledesk/broadcast/csv";
    
    this.logger.log('[KNOWLEDGE BASE SERVICE] UPLOAD FAQS CSV - URL ', url);

    return this.httpClient
      .post(url, formData, options)
  }

  public sendBroadcast(broadcastData: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    broadcastData.broadcast = true

    const url = this.SERVER_BASE_PATH + "modules/whatsapp/api/tiledesk/broadcast";
    this.logger.log('[AUTOMATIONS.SERVICE] - SEND BROADCAST - URL ', url);
    this.logger.log('[AUTOMATIONS.SERVICE] - SEND BROADCAST - DATA ', broadcastData);

    return this.httpClient.post(url, JSON.stringify(broadcastData), httpOptions);
  }

}
