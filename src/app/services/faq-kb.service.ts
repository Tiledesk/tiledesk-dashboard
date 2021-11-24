import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FaqKb } from '../models/faq_kb-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class FaqKbService {

  http: Http;
  SERVER_BASE_PATH: string;
  DLGFLW_BOT_CREDENTIAL_BASE_URL: string;
  FAQKB_URL: any;
  TOKEN: string;
  user: any;
  project: any;

  constructor(
    http: Http,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private httpClient: HttpClient,
    private logger: LoggerService
  ) {

    this.http = http;

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

  /**
   * READ (GET) !!! NO MORE USED
  public getMongDbFaqKb(): Observable<FaqKb[]> {
    const url = this.FAQKB_URL;
    this.logger.log('[FAQ-KB.SERV] MONGO DB FAQ-KB URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }
  */

  /**
   * READ (GET ALL FAQKB WITH THE CURRENT PROJECT ID)
   * NOTE: chat21-api-node.js READ THE CURRENT PROJECT ID FROM THE URL SO IT SO NO LONGER NECESSARY TO PASS THE PROJECT 
   * ID AS PARAMETER
   */
  public getFaqKbByProjectId(): Observable<FaqKb[]> {
    const url = this.FAQKB_URL;
    // url += '?id_project=' + `${id_project}`;
    // const url = `http://localhost:3000/${id_project}/faq_kb/`;
    this.logger.log('[FAQ-KB.SERV] - GET FAQ-KB BY PROJECT ID - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map(
        (response) => {
          const data = response.json();
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
  }

  // -----------------------------------------------------------------------------------------------------------
  // with all=true the response return also the identity bot (used in bot-list.comp and and in basetrigger.comp)
  // -----------------------------------------------------------------------------------------------------------
  public getAllBotByProjectId(): Observable<FaqKb[]> {
    const url = this.FAQKB_URL + '?all=true';
    // url += '?id_project=' + `${id_project}`;
    // const url = `http://localhost:3000/${id_project}/faq_kb/`;
    this.logger.log('[FAQ-KB.SERV] - GET *ALL* FAQ-KB BY PROJECT ID - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map(
        (response) => {
          const data = response.json();
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
  }

  /**
   * READ DETAIL (GET BY ID)
   * 
   * @param id 
   * @returns 
   */
  public getFaqKbById(id: string): Observable<FaqKb[]> {
    let url = this.FAQKB_URL;
    url += `${id}`;
    this.logger.log('[FAQ-KB.SERV] - GET FAQ-KB BY ID - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST)
   * 
   * @param name 
   * @param urlfaqkb 
   * @param bottype 
   * @param description 
   * @returns 
   */
  public addFaqKb(name: string, urlfaqkb: string, bottype: string, description: string, resbotlanguage: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // const isPreDeploy = false
    let body = {}
    body = { 'name': name, 'url': urlfaqkb, 'id_project': this.project._id, 'type': bottype, 'description': description };
    if (bottype === 'internal') {
      body['language'] = resbotlanguage
    }
  
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - BODY ', body);

    const url = this.FAQKB_URL;
    // let url = `http://localhost:3000/${project_id}/faq_kb/`;
    this.logger.log('[BOT-CREATE][FAQ-KB.SERV] - CREATE FAQ-KB - URL ', url);

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

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
    const headers = new Headers();

    // headers.append('Accept', 'text/csv');
    // headers.append('Accept', 'application/json');
    // headers.append('Content-type', 'multipart/form-data');
    headers.append('Authorization', this.TOKEN);
    this.logger.log('[FAQ-KB.SERV] - uploadDialogflowBotCredetial formData ', formData)

    // const url =  "http://dialogflow-proxy-tiledesk.herokuapp.com/uploadgooglecredendials/" + botid
    const url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + botid
    this.logger.log('[FAQ-KB.SERV] - uploadDialogflowBotCredetial POST URL ', url)
    const options = new RequestOptions({ headers: headers });
    return this.http
      .post(url, formData, options)
      .map(res => res.json())
  }

  getDialogflowBotCredetial(botid: string) {
    let url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + botid;
    this.logger.log('[FAQ-KB.SERV] - getDialogflowBotCredetial GET URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  public deleteDialogflowBotCredetial(id: string) {
    let url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + id;
    this.logger.log('[FAQ-KB.SERV] - deleteDialogflowBotCredetial DELETE URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());

  }

  /**
   * CREATE KBKEY
   * AFTER THAT A NEW FAQKB WAS CREATED RUN A CALLBACK VS qna_kbmanagement/create
   * THAT RETURN THE kbkey THEN USED TO RUN ANOTHER CALLBACK WHEN A NEW FAQ WAS CREATED
   */

  // {
  //   "username": "frontiere21",
  //   "password": "password",
  //   "language": "italian"
  // }
  // public createFaqKbKey() {
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', 'Basic YWRtaW46YWRtaW5wNHNzdzByZA==');
  //   const options = new RequestOptions({ headers });

  //   const body = { 'username': 'frontiere21', 'password': 'password', 'language': 'italian' };

  //   this.logger.log('CREATE FAQKB KEY - POST REQUEST BODY ', body);

  //   const url = 'http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qna_kbmanagement/create';

  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => res.json());

  // }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteFaqKb(id: string) {
    let url = this.FAQKB_URL;
    url += `${id}# chat21-api-nodejs`;
    this.logger.log('[FAQ-KB.SERV] - deleteFaqKb - DELETE URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());

  }

  /**
   * UPDATE (PUT)
   * @param id
   * @param fullName
   */
  public updateFaqKb(id: string, name: string, urlfaqkb: string, bottype: string, faqKb_description: string, webkookisenalbled: any, webhookurl, resbotlanguage: string) {

    let url = this.FAQKB_URL + id;
    // url = url += `${id}`;
    this.logger.log('update BOT - URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    let body = {}
    body = { 'name': name, 'url': urlfaqkb, 'type': bottype, 'description': faqKb_description };
    if (bottype === 'internal') {
      body['webhook_enabled'] = webkookisenalbled;
      body['webhook_url'] = webhookurl
      body['language'] = resbotlanguage
    }
    this.logger.log('[FAQ-KB.SERV] updateFaqKb - BODY ', body);

    this.logger.log('[FAQ-KB.SERV] updateFaqKb - PUT BODY ', body);
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * UPDATE (PUT) the BOT WITH trashed = true WHEN THE USER CLICKED THE BTN 'DELETE BOT' 
   * 
   * @param id 
   * @param _trashed 
   * @returns 
   */
  public updateFaqKbAsTrashed(id: string, _trashed: boolean) {
    let url = this.FAQKB_URL;
    url = url += `${id}`;
    this.logger.log('[FAQ-KB.SERV] updateFaqKbAsTrashed - PUT URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'trashed': _trashed };

    this.logger.log('[FAQ-KB.SERV] updateFaqKbAsTrashed - PUT BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

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

    return this.httpClient.get(this.SERVER_BASE_PATH + this.project._id + "/analytics/messages/count", { headers: headers, params: params })

  }


}
