import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FaqKb } from '../models/faq_kb-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from '../services/app-config.service';

@Injectable()
export class FaqKbService {

  http: Http;
  // MONGODB_BASE_URL = environment.mongoDbConfig.FAQKB_BASE_URL;
  // TOKEN = environment.mongoDbConfig.TOKEN;

  // BASE_URL = environment.mongoDbConfig.BASE_URL;  // replaced
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL;  // now get from appconfig
  // DLGFLW_BOT_CREDENTIAL_BASE_URL = environment.botcredendialsURL; // now get from appconfig

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
    private httpClient: HttpClient
  ) {
    // // tslint:disable-next-line:no-debugger
    // debugger
    console.log('hello faq-kb service')
    this.http = http;

    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      // // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      this.checkUser()
    });

    this.getCurrentProject();

    this.getAppConfig();
  }

  getAppConfig() {
    // this.DLGFLW_BOT_CREDENTIAL_BASE_URL = this.appConfigService.getConfig().botcredendialsURL;
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;

    console.log('AppConfigService getAppConfig (FAQ-KB SERV.) DLGFLW_BOT_CREDENTIAL_BASE_URL ', this.DLGFLW_BOT_CREDENTIAL_BASE_URL);
    console.log('AppConfigService getAppConfig (FAQ-KB SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    // console.log('FAQ-KB SERV - SUBSCRIBE TO CURRENT PROJ ')
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger

      if (this.project) {
        console.log('00 -> FAQKB SERVICE project ID from AUTH service subscription  ', this.project._id)
        this.FAQKB_URL = this.SERVER_BASE_PATH + this.project._id + '/faq_kb/'


        this.DLGFLW_BOT_CREDENTIAL_BASE_URL = this.appConfigService.getConfig().botcredendialsURL + this.project._id + '/bots/';
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
      console.log('FAQ KB SERVICE user is signed in');
    } else {
      console.log('FAQ KB SERVICE No user is signed in');
    }
  }

  /**
   * READ (GET)
   * USED IN bot-edit-add.component.ts
   * !!! NO MORE USED
   *     * IN FAQ COMPONENT THE FAQ-KB'S LIST IS CURRENTLY OBTAINED BY FILTERING
   *     ALL THE FAQ-KB FOR THE ID OF THE CURRENT PROJECT (see BELOW getFaqKbByProjectId)
   *     getMongDbFaqKb() was also used in bot-edit-add.component.ts ma currently THE BOTs ARE NO LONGER USED
   *     (in the view the menu item FAQ (alias faq-kb) have been renamed in BOT)
   */
  public getMongDbFaqKb(): Observable<FaqKb[]> {
    const url = this.FAQKB_URL;
    console.log('MONGO DB FAQ-KB URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * READ (GET ALL FAQKB WITH THE CURRENT PROJECT ID)
   * NOTE: chat21-api-node.js READ THE CURRENT PROJECT ID FROM THE URL SO IT SO NO LONGER NECESSARY TO PASS THE PROJECT 
   * ID AS PARAMETER
   */
  public getFaqKbByProjectId(): Observable<FaqKb[]> {
    const url = this.FAQKB_URL;
    // url += '?id_project=' + `${id_project}`;
    // const url = `http://localhost:3000/${id_project}/faq_kb/`;
    console.log('GET FAQ-KB BY PROJECT ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map(
        (response) => {
          const data = response.json();
          // Does something on data.data
          console.log('GET FAQ-KB BY PROJECT ID URL data', data);

          data.forEach(d => {
            console.log('GET FAQ-KB BY PROJECT ID URL data d', d);
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
    console.log('GET *ALL* FAQ-KB BY PROJECT ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map(
        (response) => {
          const data = response.json();
          // Does something on data.data
          console.log('GET *ALL* FAQ-KB BY PROJECT ID URL data', data);

          data.forEach(d => {
            console.log('GET *ALL* FAQ-KB BY PROJECT ID URL data d', d);
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
   */
  public getMongDbFaqKbById(id: string): Observable<FaqKb[]> {
    let url = this.FAQKB_URL;
    url += `${id}`;
    console.log('MONGO DB GET BY ID FAQ-KB URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * CREATE (POST)
   * @param fullName
   */
  // public addMongoDbFaqKb(name: string, urlfaqkb: string, is_external_bot: boolean) {
  public addMongoDbFaqKb(name: string, urlfaqkb: string, bottype: string, description: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // const isPreDeploy = false
    const body = { 'name': name, 'url': urlfaqkb, 'id_project': this.project._id, 'type': bottype, 'description': description };


    /* FOR PRE */
    // let botType = ''
    // if (is_external_bot === true) {
    //   botType = 'external'
    // } else {
    //   botType = 'internal'
    // }
    // body['type'] = botType


    /* FOR PROD */
    // body['external'] = is_external_bot

    console.log('CREATE BOT - POST REQUEST BODY ', body);

    const url = this.FAQKB_URL;
    // let url = `http://localhost:3000/${project_id}/faq_kb/`;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // IF THE BOT IS OF TYPE DIALOGFLOW, AFTER THAT A NEW FAQKB WAS CREATED RUN A CALLBACK TO POST THE 
  // dialogfolw bot CREDENTIAL
  uploadDialogflowBotCredetial(botid: string, formData: any) {
    const headers = new Headers();

    // headers.append('Accept', 'text/csv');
    // headers.append('Accept', 'application/json');
    // headers.append('Content-type', 'multipart/form-data');
    headers.append('Authorization', this.TOKEN);
    console.log('uploadDialogflowBotCredetial formData ', formData)

    // const url =  "http://dialogflow-proxy-tiledesk.herokuapp.com/uploadgooglecredendials/" + botid
    const url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + botid

    const options = new RequestOptions({ headers: headers });
    return this.http
      .post(url, formData, options)
      .map(res => res.json())
  }

  getDialogflowBotCredetial(botid: string) {
    let url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + botid;

    console.log('getDialogflowBotCredetialURL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  public deleteDialogflowBotCredetial(id: string) {

    let url = this.DLGFLW_BOT_CREDENTIAL_BASE_URL + id;

    console.log('deleteDialogflowBotCredetial DELETE URL ', url);

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

  //   console.log('CREATE FAQKB KEY - POST REQUEST BODY ', body);

  //   const url = 'http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qna_kbmanagement/create';

  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => res.json());

  // }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteMongoDbFaqKb(id: string) {
    let url = this.FAQKB_URL;
    url += `${id}# chat21-api-nodejs`;
    console.log('DELETE URL ', url);

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
  public updateMongoDbFaqKb(id: string, name: string, urlfaqkb: string, bottype: string, faqKb_description: string, webkookisenalbled: any, webhookurl) {

    let url = this.FAQKB_URL + id;
    // url = url += `${id}`;
    console.log('update BOT - URL ', url);

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

    }

    console.log('update BOT - BODY ', body);
    // let botType = ''
    // if (is_external_bot === true) {
    //   botType = 'external'
    // } else {
    //   botType = 'internal'
    // }
    // body['type'] = botType


    /* FOR PROD */
    // body['external'] = is_external_bot

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
  * UPDATE (PUT) the BOT WITH trashed = true WHEN THE USER CLICKED THE BTN 'DELETE BOT' 
  * @param id
  * @param fullName
  */
  public updateFaqKbAsTrashed(id: string, _trashed: boolean) {

    let url = this.FAQKB_URL;
    url = url += `${id}`;
    console.log('PUT URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'trashed': _trashed };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  getNumberOfMessages(idBot) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let params = new HttpParams().set('sender', 'bot_' + idBot)

    return this.httpClient.get(this.SERVER_BASE_PATH + this.project._id + "/analytics/messages/count", { headers: headers, params: params })

  }


}
