import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Faq } from '../models/faq-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../core/auth.service';

@Injectable()
export class MongodbFaqService {

  http: Http;
  // MONGODB_BASE_URL = environment.mongoDbConfig.FAQ_BASE_URL;
  BASE_URL = environment.mongoDbConfig.BASE_URL;
  MONGODB_BASE_URL: any;
  EXPORT_FAQ_TO_CSV_URL: string;
  // TOKEN = environment.mongoDbConfig.TOKEN;
  TOKEN: string
  user: any;
  project: any;

  constructor(
    http: Http,
    private auth: AuthService
  ) {
    this.http = http;

    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });

    this.getCurrentProject();
  }

  getCurrentProject() {
    console.log('FAQ SERV - SUBSCRIBE TO CURRENT PROJ ')
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger
      if (this.project) {
        console.log('00 -> FAQ SERVICE project ID from AUTH service subscription  ', this.project._id)
        this.MONGODB_BASE_URL = this.BASE_URL + this.project._id + '/faq/'
        this.EXPORT_FAQ_TO_CSV_URL = this.BASE_URL + this.project._id + '/faq/csv'
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
    } else {
      console.log('No user is signed in');
    }
  }

  /**
   * READ (GET ALL FAQ) - NOT USED
   */
  public getMongDbFaq(): Observable<Faq[]> {
    const url = this.MONGODB_BASE_URL;

    console.log('GET ALL FAQ URL', url);
    // console.log('MONGO DB TOKEN', this.TOKEN);

    console.log('NEW DATE (FOR THE UPDATE) ', new Date().getTime());

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * READ DETAIL (GET FAQ BY FAQ ID)
   */
  public getMongDbFaqById(id: string): Observable<Faq[]> {
    let url = this.MONGODB_BASE_URL;
    url += `${id}`;
    console.log('MONGO DB GET FAQ BY FAQ-ID URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /**
   * GET FAQ BY FAQ-KB ID (alias BOT ID)
   * @param id_faq_kb
   */
  public getMongoDbFaqByFaqKbId(id_faq_kb: string): Observable<Faq[]> {
    // let url = 'http://localhost:3000/app1/faq/?id_faq_kb=5a81598721333b920c3e5949';
    let url = this.MONGODB_BASE_URL;
    url += '?id_faq_kb=' + `${id_faq_kb}`;

    console.log('MONGO DB GET BY ID FAQ URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

    /**
   * GET FAQ BY TEXT (CONTAINED IN THE QUESTION OR IN THE ANSWER)
   * @param id_faq_kb
   */
  public getFaqsByText(text: string): Observable<Faq[]> {
    // let url = 'http://localhost:3000/app1/faq/?id_faq_kb=5a81598721333b920c3e5949';
    let url = this.MONGODB_BASE_URL;
    url += '?text=' + text;

    console.log('MONGO DB GET BY ID FAQ URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json())
      // .filter((data) =>  data)
  }

  /**
   * EXPORT FAQS TO CSV
   */
  public exsportFaqsToCsv(id_faq_kb: string) {
    // let url = 'http://localhost:3000/app1/faq/?id_faq_kb=5a81598721333b920c3e5949';
    const url = this.EXPORT_FAQ_TO_CSV_URL + '?id_faq_kb=' + id_faq_kb;
    console.log('MONGO DB GET BY ID FAQ URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.text());
  }

  /**
   * CREATE (POST)
   * @param question
   */
  public addMongoDbFaq(question: string, answer: string, id_faq_kb: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': question, 'answer': `${answer}`, 'id_faq_kb': `${id_faq_kb}` };

    console.log('ADD FAQ POST BODY ', body);

    const url = this.MONGODB_BASE_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  // UPLOAD CSV
  public uploadFaqCsv(formData: any) {
    const headers = new Headers();
    /** No need to include Content-Type in Angular 4 */
    // headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'text/csv');
    headers.append('Authorization', this.TOKEN);
    const url = this.MONGODB_BASE_URL + 'uploadcsv';
    const options = new RequestOptions({ headers: headers });
    return this.http
      .post(url, formData, options)
      .map(res => res.json())
    // .subscribe(data => {
    //   console.log('UPLOAD FILE CSV success ', data)
    // },
    //   error => console.log(error)
    // )

  }


  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteMongoDbFaq(id: string) {

    let url = this.MONGODB_BASE_URL;
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
   * @param question
   * @param answer
   */
  public updateMongoDbFaq(id: string, question: string, answer: string) {
    console.log('ID IN FAQ SERVICE ', id);
    let url = this.MONGODB_BASE_URL;
    url = url += `${id}`;
    console.log('PUT URL ', url);


    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'question': `${question}`, 'answer': `${answer}` };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }
  // public searchRemoteFaqByRemoteFaqKbKey(remoteFaqKbKey: string, question: string) {
  public searchRemoteFaqByRemoteFaqKbKey(botId: string, question: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    // headers.append('Authorization', 'Basic YWRtaW46YWRtaW5wNHNzdzByZA==');
    headers.append('Authorization', this.TOKEN);
    // const url = this.MONGODB_BASE_URL + 'askbot';
    const url = this.BASE_URL + this.project._id + '/faq_kb/' + 'askbot';
    const options = new RequestOptions({ headers });

    // const body = { 'question': question, 'doctype': 'normal', 'min_score': '0.0', 'remote_faqkb_key': remoteFaqKbKey };
    const body = { 'id_faq_kb': botId, 'question': question };
    console.log('SEARCH FAQ WITH THE REMOTE FAQKB KEY - POST REQUEST BODY ', body);

    // tslint:disable-next-line:max-line-length
    // const url = `http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qnamaker/v2.0/knowledgebases/` + remoteFaqKbKey + `/generateAnswer`;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

}
