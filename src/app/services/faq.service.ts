import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Faq } from '../models/faq-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()
export class FaqService {

  http: Http;
  // MONGODB_BASE_URL = environment.mongoDbConfig.FAQ_BASE_URL;

  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
  // MONGODB_BASE_URL: any;  // replaced with FAQ_URL

  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  SERVER_BASE_PATH: string;
  FAQ_URL: any;
  EXPORT_FAQ_TO_CSV_URL: string;

  TOKEN: string
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
    this.checkIfUserExistAndGetToken()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkIfUserExistAndGetToken()
    });
    this.getAppConfig();
    this.getCurrentProjectAndBuildFaqUrls();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    // this.logger.log('[FAQ-SERV] getAppConfig SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }
  getCurrentProjectAndBuildFaqUrls() {
    // this.logger.log('[FAQ-SERV] - SUBSCRIBE TO CURRENT PROJCT ')
    this.auth.project_bs.subscribe((project) => {
      this.project = project

      if (this.project) {
        this.logger.log('[FAQ-SERV] project ID ', this.project._id)
        this.FAQ_URL = this.SERVER_BASE_PATH + this.project._id + '/faq/';
        this.EXPORT_FAQ_TO_CSV_URL = this.SERVER_BASE_PATH + this.project._id + '/faq/csv';
        this.logger.log('[FAQ-SERV] - FAQ_URL (built with SERVER_BASE_PATH) ', this.FAQ_URL);
        this.logger.log('[FAQ-SERV] - EXPORT_FAQ_TO_CSV_URL (built with SERVER_BASE_PATH) ', this.EXPORT_FAQ_TO_CSV_URL);
      }
    });
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
    } else {
      this.logger.log('[FAQ-SERV] - No user is signed in');
    }
  }

  // --------------------------------------
  // READ (GET ALL FAQ) - NOT USED
  // --------------------------------------
  // public getMongDbFaq(): Observable<Faq[]> {
  //   const url = this.FAQ_URL;

  //   this.logger.log('[FAQ-SERV] - GET ALL FAQ URL', url);
  //   // this.logger.log('MONGO DB TOKEN', this.TOKEN);

  //   this.logger.log('NEW DATE (FOR THE UPDATE) ', new Date().getTime());

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);

  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }

  /**
   * READ DETAIL (GET FAQ BY FAQ ID)
   * @param id 
   * @returns 
   */
  public getFaqById(id: string): Observable<Faq[]> {
    let url = this.FAQ_URL;
    url += `${id}`;
    this.logger.log('[FAQ-SERV] - GET FAQ BY FAQ-ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  
  /**
   * GET FAQ BY FAQ-KB ID (alias BY BOT ID)
   * @param id_faq_kb 
   * @returns 
   */
  public getFaqByFaqKbId(id_faq_kb: string): Observable<Faq[]> {
    // let url = 'http://localhost:3000/app1/faq/?id_faq_kb=5a81598721333b920c3e5949';
    let url = this.FAQ_URL;
    url += '?id_faq_kb=' + `${id_faq_kb}`;

    this.logger.log('[FAQ-SERV] - GET FAQ BY FAQ-KB ID (BOT-ID) - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

/**
 * GET FAQ BY TEXT (CONTAINED IN THE QUESTION OR IN THE ANSWER)
 * @param text 
 * @returns 
 */
  public getFaqsByText(text: string): Observable<Faq[]> {
    // let url = 'http://localhost:3000/app1/faq/?id_faq_kb=5a81598721333b920c3e5949';
    let url = this.FAQ_URL;
    url += '?text=' + text;

    this.logger.log('[FAQ-SERV] - GET FAQ BY TEXT (CONTAINED IN THE QUESTION OR IN THE ANSWER)', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json())
    // .filter((data) =>  data)
  }


  /**
   * EXPORT FAQS AS CSV
   * @param id_faq_kb 
   * @returns 
   */
  public exsportFaqsToCsv(id_faq_kb: string) {
    // let url = 'http://localhost:3000/app1/faq/?id_faq_kb=5a81598721333b920c3e5949';
    const url = this.EXPORT_FAQ_TO_CSV_URL + '?id_faq_kb=' + id_faq_kb;
    this.logger.log('[FAQ-SERV] - EXPORT FAQS AS CSV - URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.text());
  }

 
  /**
   * CREATE FAQ (POST)
   * @param question 
   * @param answer 
   * @param id_faq_kb 
   * @param intentname 
   * @param faqwebhookenabled 
   * @returns 
   */
  public addFaq(question: string, answer: string, id_faq_kb: string, intentname: string, faqwebhookenabled: boolean) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.FAQ_URL;
    this.logger.log('[FAQ-SERV] ADD FAQ -  PUT URL ', url);

    const body = { 'question': question, 'answer': answer, 'id_faq_kb': id_faq_kb, 'intent_display_name': intentname, 'webhook_enabled': faqwebhookenabled };

    this.logger.log('[FAQ-SERV] ADD FAQ - POST BODY ', body);

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * UPDATE FAQ (PUT)
   * @param id 
   * @param question 
   * @param answer 
   * @param intentname 
   * @param faqwebhookenabled 
   * @returns 
   */
  public updateFaq(id: string, question: string, answer: string, intentname: string, faqwebhookenabled: boolean) {
    this.logger.log('[FAQ-SERV] UPDATE FAQ - ID ', id);
    let url = this.FAQ_URL;
    url = url += `${id}`;
    this.logger.log('[FAQ-SERV] UPDATE FAQ - PUT URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': question, 'answer': answer, 'intent_display_name': intentname, 'webhook_enabled': faqwebhookenabled };

    this.logger.log('[FAQ-SERV] UPDATE FAQ - PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


 /**
  * CREATE TRAIN BOT ANSWER (POST)
  * @param question 
  * @param answer 
  * @param id_faq_kb 
  * @returns 
  */
  public createTrainBotAnswer(question: string, answer: string, id_faq_kb: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': question, 'answer': answer, 'id_faq_kb': id_faq_kb };

    this.logger.log('[FAQ-SERV] CREATE TRAIN BOT FAQ - BODY ', body);

    const url = this.FAQ_URL;
    this.logger.log('[FAQ-SERV] CREATE TRAIN BOT FAQ - URL ', url);
    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }


  /**
   * UPLOAD FAQS CSV
   * @param formData 
   * @returns 
   */
  public uploadFaqCsv(formData: any) {
    const headers = new Headers();
    /** No need to include Content-Type in Angular 4 */
    // headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'text/csv');
    headers.append('Authorization', this.TOKEN);
   
    const url = this.FAQ_URL + 'uploadcsv';
    this.logger.log('[FAQ-SERV] UPLOAD FAQS CSV - URL ', url);

    const options = new RequestOptions({ headers: headers });
    return this.http
      .post(url, formData, options)
      .map(res => res.json())
  }


  /**
   * DELETE FAQ (DELETE)
   * @param id 
   * @returns 
   */
  public deleteFaq(id: string) {
    let url = this.FAQ_URL;
    url += `${id}# chat21-api-nodejs`;
    this.logger.log('[FAQ-SERV] DELETE FAQ URL ', url);

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
 * UPDATE TRAIN BOT FAQ
 * @param id 
 * @param question 
 * @param answer 
 * @returns 
 */
  public updateTrainBotFaq(id: string, question: string, answer: string) {
    this.logger.log('[FAQ-SERV] - UPDATE TRAIN BOT FAQ - ID ', id);
    let url = this.FAQ_URL;
    url = url += `${id}`;
  
    this.logger.log('[FAQ-SERV] - UPDATE TRAIN BOT FAQ - PUT URL ', id);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': `${question}`, 'answer': `${answer}` };

    this.logger.log('[FAQ-SERV] - UPDATE TRAIN BOT FAQ - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // public searchRemoteFaqByRemoteFaqKbKey(remoteFaqKbKey: string, question: string) {
    /**
     * SEARCH FAQ BY BOT ID
     * @param botId 
     * @param question 
     * @returns 
     */
  public searchFaqByFaqKbId(botId: string, question: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const url = this.SERVER_BASE_PATH + this.project._id + '/faq_kb/' + 'askbot';
    this.logger.log('[FAQ-SERV] - SEARCH FAQ BY BOT ID - POST REQUEST URL ', url);
    // const body = { 'question': question, 'doctype': 'normal', 'min_score': '0.0', 'remote_faqkb_key': remoteFaqKbKey };
    const body = { 'id_faq_kb': botId, 'question': question };
    this.logger.log('[FAQ-SERV] - SEARCH FAQ BY BOT ID - POST REQUEST BODY ', body);

    // tslint:disable-next-line:max-line-length
    // const url = `http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qnamaker/v2.0/knowledgebases/` + remoteFaqKbKey + `/generateAnswer`;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * GET COUNT OF REPLIES OF BOT 
   * @param botId 
   * @returns 
   */
  getCountOfFaqReplies(botId) {
    this.logger.log("[FAQ-SERV] GET COUNT OF REPLIES OF FAQ OF THE BOT-ID: ", botId);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let params = new HttpParams().set('sender', 'bot_' + botId);

    return this.httpClient.get(this.SERVER_BASE_PATH + this.project._id + '/analytics/requests/aggregate/attributes/_answerid', { headers: headers, params: params });
  }

}
