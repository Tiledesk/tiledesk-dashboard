import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FaqKb } from '../models/faq_kb-model';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class FaqKbService {

  SERVER_BASE_PATH: string;
  DLGFLW_BOT_CREDENTIAL_BASE_URL: string;
  RASA_BOT_CREDENTIAL_BASE_URL: string;
  FAQKB_URL: any;
  TOKEN: string;
  user: any;
  project: any;
  public $nativeBotName: BehaviorSubject<string> = new BehaviorSubject<string>('')
  constructor(
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private _httpClient: HttpClient,
    private logger: LoggerService
  ) {

    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkIfExistUserAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      // // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      this.checkIfExistUserAndGetToken()
    });

    this.getCurrentProject();

    this.getAppConfig();
  }

  getAppConfig() {
    // this.DLGFLW_BOT_CREDENTIAL_BASE_URL = this.appConfigService.getConfig().botcredendialsURL;
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;

    this.logger.log('AppConfigService getAppConfig (FAQ-KB SERV.) DLGFLW_BOT_CREDENTIAL_BASE_URL ', this.DLGFLW_BOT_CREDENTIAL_BASE_URL);
    this.logger.log('AppConfigService getAppConfig (FAQ-KB SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    // this.logger.log('FAQ-KB SERV - SUBSCRIBE TO CURRENT PROJ ')
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger

      if (this.project) {
        this.logger.log('00 -> FAQKB SERVICE project ID from AUTH service subscription  ', this.project._id)
        this.FAQKB_URL = this.SERVER_BASE_PATH + this.project._id + '/faq_kb/'


        this.DLGFLW_BOT_CREDENTIAL_BASE_URL = this.appConfigService.getConfig().botcredendialsURL + this.project._id + '/bots/';
        this.RASA_BOT_CREDENTIAL_BASE_URL = this.appConfigService.getConfig().rasaBotCredentialsURL + this.project._id + '/bots/'
      }
    });
  }

 

  checkIfExistUserAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
      this.logger.log('[FAQ-KB.SERV] user is signed in');
    } else {
      this.logger.log('[FAQ-KB.SERV] No user is signed in');
    }
  }


  getTemplates() {
    // 'Authorization': this.TOKEN
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    const url = "https://chatbot-templates.herokuapp.com/chatbots/public/templates/"
    
    console.log('[GET-TMPLT][FAQ-KB.SERV] - GET-TMPLT - URL ', url);

    // const body = { 'name': name, 'type': bottype, 'description': description, 'id_project': this.project._id, };
    // this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - BODY ', body);

    return this._httpClient
      .get(url, httpOptions)
  }

  installTemplate (botid) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + "modules/tilebot/ext/" + botid;
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - URL ', url);

    // const body = { 'name': name, 'type': bottype, 'description': description, 'id_project': this.project._id, };
    // this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - BODY ', body);

    return this._httpClient
      .get(url, httpOptions)

  }
  /**
   * READ (GET ALL FAQKB WITH THE CURRENT PROJECT ID)
   * NOTE: chat21-api-node.js READ THE CURRENT PROJECT ID FROM THE URL SO IT SO NO LONGER NECESSARY TO PASS THE PROJECT 
   * ID AS PARAMETER
   */
  public getFaqKbByProjectId(): Observable<FaqKb[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.FAQKB_URL;
    this.logger.log('[FAQ-KB.SERV] - GET FAQ-KB BY PROJECT ID - URL', url);

    return this._httpClient
      .get<FaqKb[]>(url, httpOptions)
      .pipe(
        map(
          (response) => {
            const data = response;
            // Does something on data.data
            this.logger.log('[FAQ-KB.SERV] GET FAQ-KB BY PROJECT ID - data', data);

            data.forEach(d => {
              this.logger.log('[FAQ-KB.SERV] - GET FAQ-KB BY PROJECT ID URL data d', d);
              if (d.description) {
                let stripHere = 20;
                d['truncated_desc'] = d.description.substring(0, stripHere) + '...';
              }
            });
            // return the modified data:
            return data;
          })
      );
  }

  // ------------------------------------------------------------
  // with all=true the response return also the identity bot 
  // ------------------------------------------------------------
  public getAllBotByProjectId(): Observable<FaqKb[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.FAQKB_URL + '?all=true';
    this.logger.log('[FAQ-KB.SERV] - GET *ALL* FAQ-KB BY PROJECT ID - URL', url);

    return this._httpClient
      .get<FaqKb[]>(url, httpOptions)
      .pipe(
        map(
          (response) => {
            const data = response;
            // Does something on data.data
            this.logger.log('[FAQ-KB.SERV] GET *ALL* FAQ-KB BY PROJECT ID - data', data);

            data.forEach(d => {
              this.logger.log('[FAQ-KB.SERV] - GET *ALL* FAQ-KB BY PROJECT ID URL data d', d);
              if (d.description) {
                let stripHere = 20;
                d['truncated_desc'] = d.description.substring(0, stripHere) + '...';
              }
            });
            // return the modified data:
            return data;
          })
      );
  }

  /**
   * READ DETAIL (GET BY ID)
   * @param id 
   * @returns 
   */
  public getFaqKbById(id: string): Observable<FaqKb[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.FAQKB_URL + id;
    this.logger.log('[FAQ-KB.SERV] - GET FAQ-KB BY ID - URL', url);

    return this._httpClient
      .get<FaqKb[]>(url, httpOptions)
  }


  public createRasaBot(name: string, bottype: string, description: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.FAQKB_URL;
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - URL ', url);

    const body = { 'name': name, 'type': bottype, 'description': description, 'id_project': this.project._id, };
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - BODY ', body);

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  public connectBotToRasaServer(botid: string, serverurl: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.RASA_BOT_CREDENTIAL_BASE_URL + botid;
    this.logger.log('[FAQ-KB.SERV] - connectBotToRasaServer - URL ', url);

    const body = { 'serverUrl': serverurl };
    this.logger.log('[FAQ-KB.SERV] - connectBotToRasaServer - BODY ', body);

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  public getRasaBotServer(botid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.RASA_BOT_CREDENTIAL_BASE_URL + botid;
    this.logger.log('[FAQ-KB.SERV] - getRasaBotServer - URL ', url);

    return this._httpClient
      .get(url, httpOptions)
  }

  public deleteRasaBotData(botid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.RASA_BOT_CREDENTIAL_BASE_URL + botid;
    this.logger.log('[FAQ-KB.SERV] - getRasaBotServer - URL ', url);

    return this._httpClient
      .delete(url, httpOptions)
  }

  /**
   * @param name 
   * @param urlfaqkb 
   * @param bottype 
   * @param description 
   * @returns 
   */
  public createFaqKb(name: string, urlfaqkb: string, bottype: string, description: string, resbotlanguage: string, resbottemplate: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.FAQKB_URL;
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - URL ', url);

    let body = {}
    body = { 'name': name, 'url': urlfaqkb, 'id_project': this.project._id, 'type': bottype, 'description': description };
    if (bottype === 'internal' || bottype === 'tilebot') {
      body['language'] = resbotlanguage
      body['template'] = resbottemplate
    }
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - BODY ', body);

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  // ------------------------------------------------------------------------------------------------
  // IF THE BOT IS OF TYPE DIALOGFLOW, AFTER THAT A NEW FAQKB WAS CREATED RUN A CALLBACK TO POST THE 
  // dialogfolw bot CREDENTIAL
  // ------------------------------------------------------------------------------------------------
  /**
   * 
   * @param botid 
   * @param formData 
   * @returns 
   */
  uploadDialogflowBotCredetial(botid: string, formData: any) {
    // const headers = new Headers();
    // headers.append('Authorization', this.TOKEN);
    // const options = new RequestOptions({ headers: headers });

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': this.TOKEN
      })
    };
    const url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + botid
    this.logger.log('[FAQ-KB.SERV] - uploadDialogflowBotCredetial POST URL ', url)
    this.logger.log('[FAQ-KB.SERV] - uploadDialogflowBotCredetial formData ', formData)

    return this._httpClient
      .post(url, formData, httpOptions)
  }

  getDialogflowBotCredetial(botid: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + botid;
    this.logger.log('[FAQ-KB.SERV] - getDialogflowBotCredetial GET URL', url);

    return this._httpClient
      .get(url, httpOptions)
  }


  public deleteDialogflowBotCredetial(id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + id;
    this.logger.log('[FAQ-KB.SERV] - deleteDialogflowBotCredetial DELETE URL ', url);

    return this._httpClient
      .delete(url, httpOptions)
  }




  /**
   * UPDATE (PUT) the BOT WITH trashed = true WHEN THE USER CLICKED THE BTN 'DELETE BOT' 
   * 
   * @param id 
   * @param _trashed 
   * @returns 
   */
  public updateFaqKbAsTrashed(id: string, _trashed: boolean) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.FAQKB_URL + id
    this.logger.log('[FAQ-KB.SERV] updateFaqKbAsTrashed - PUT URL ', url);

    const body = { 'trashed': _trashed };
    this.logger.log('[FAQ-KB.SERV] updateFaqKbAsTrashed - PUT BODY ', body);

    return this._httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }

  /**
   * UPDATE (PUT)
   * @param id
   * @param fullName
   */
  public updateFaqKb(id: string, name: string, urlfaqkb: string, bottype: string, faqKb_description: string, webkookisenalbled: any, webhookurl, resbotlanguage: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.FAQKB_URL + id;
    this.logger.log('update BOT - URL ', url);

    let body = {}
    body = { 'name': name, 'url': urlfaqkb, 'type': bottype, 'description': faqKb_description };
    if (bottype === 'internal' || bottype === 'tilebot') {
      body['webhook_enabled'] = webkookisenalbled;
      body['webhook_url'] = webhookurl
      body['language'] = resbotlanguage
    }
    this.logger.log('[FAQ-KB.SERV] updateFaqKb - BODY ', body);

    return this._httpClient
      .put(url, JSON.stringify(body), httpOptions)
  }



  getNumberOfMessages(idBot, bottype) {
    this.logger.log('[FAQ-KB.SERV] - getNumberOfMessages idBot ', idBot)
    this.logger.log('[FAQ-KB.SERV] - getNumberOfMessages bottype', bottype)
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let botid = ""
    if (bottype === 'internal') {
      botid = 'bot_' + idBot
    } else {
      botid = idBot
    }

    let params = new HttpParams().set('sender', botid)
    // let params = new HttpParams().set('sender', 'bot_' + idBot)
    // this.logger.log('BOT LIST (bot-service) - getNumberOfMessages params', params) 

    return this._httpClient.get(this.SERVER_BASE_PATH + this.project._id + "/analytics/messages/count", { headers: headers, params: params })

  }


}
