// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Department } from '../models/department-model';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthService } from '../core/auth.service';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AppConfigService } from './app-config.service';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()

export class DepartmentService {

  public myDepts_bs: BehaviorSubject<Department[]> = new BehaviorSubject<Department[]>([]);

  http: Http;

  SERVER_BASE_PATH: string;
  DEPTS_URL: string;

  TOKEN: string
  user: any;
  project: any;

  constructor(
    http: Http,
    private auth: AuthService,
    public appConfigService: AppConfigService,
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
    this.getCurrentProjectAndBuildDeptsUrl();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[DEPTS-SERV] getAppConfig SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getCurrentProjectAndBuildDeptsUrl() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger
      if (this.project) {
        this.logger.log('[DEPTS-SERV] - SUBSCRIBE TO CURRENT PROJ this.project._id ', this.project._id);
        this.DEPTS_URL = this.SERVER_BASE_PATH + this.project._id + '/departments/';
        this.logger.log('[DEPTS-SERV] - DEPTS_URL (built with SERVER_BASE_PATH) ', this.DEPTS_URL);

        // FOR TEST - CAUSES ERROR WITH A NO VALID PROJECT ID
        // this.MONGODB_BASE_URL = this.BASE_URL + '5b3fa93a6f0537d8b01968fX' + '/departments/'

      }
    });
  }

  checkIfUserExistAndGetToken() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
    } else {
      this.logger.log('No user is signed in');
    }
  }


  // --------------------------------------------------------------
  // Method used for test
  // GET DEPTS AS THE OLD WIDGET VERSION (USED YET BY SOME PROJECTS)
  // ---------------------------------------------------------------
  public getDeptsAsOldWidget(): Observable<Department[]> {
    const url = this.DEPTS_URL;
    // const url = `http://localhost:3000/app1/departments/`;
    // const url = `http://api.chat21.org/app1/departments/;
    this.logger.log('[DEPTS-SERV] - GET DEPTS AS OLD WIDGET VERSION', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }



  // ------------------------------------
  // Method used for test
  // GET DEPTS AS THE NEW WIDGET VERSION
  // ------------------------------------
  public getDeptsAsNewWidget(): Observable<Department[]> {
    const url = this.SERVER_BASE_PATH + this.project._id + '/widgets'
    this.logger.log('[DEPTS-SERV] - GET DEPTS AS THE NEW WIDGET VERSION URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  // ------------------------------------
  //  GET VISITOR COUNTER - !!!! NOT USED
  // ------------------------------------
  public getVisitorCounter(): Observable<[]> {
    const url = this.SERVER_BASE_PATH + this.project._id + '/visitorcounter'
    this.logger.log('[DEPTS-SERV] - GET DEPTS AS THE NEW WIDGET VERSION URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  /**
   * GET ALL DEPTS WITH THE CURRENT PROJECT ID AND WITHOUT FILTER FOR STATUS
   * NOTE: THE CALLBACK TO GET THE DEPTS FILTERED FOR STATUS IS RUNNED BY THE WIDGET
   * NOTE: the DSBRD CALL /departments/allstatus  WHILE the WIDGET  CALL /departments
   * 
   * NOTE: chat21-api-node.js READ THE CURRENT PROJECT ID FROM THE URL SO IS NO LONGER NECESSARY TO PASS THE PROJECT ID AS PARAMETER
   */
  public getDeptsByProjectId(): Observable<Department[]> {
    const url = this.DEPTS_URL + 'allstatus';

    // const url = 'https://api.tiledesk.com/v1/5c28b587348b680015feecca/departments/'+'allstatus'
    this.logger.log('[DEPTS-SERV] GET DEPTS ALL STATUS - DEPTS URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);


    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public getDeptsByProjectIdToPromise(): any {
    const url = this.DEPTS_URL + 'allstatus';
    this.logger.log('[DEPTS-SERV] GET DEPTS TO PROMISE - DEPTS URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => {

        return response.json()
      })
      .toPromise();
  }




  /**
   * READ DETAIL (GET BOT BY BOT ID)
   * @param id
   */
  public getDeptById(id: string): Observable<Department[]> {
    let url = this.DEPTS_URL;
    url += `${id}`;
    this.logger.log('[DEPTS-SERV] GET DEPT BY ID - URL', url);

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
  public addDept(deptName: string, deptDescription: string, id_bot: string, bot_only: boolean, id_group: string, routing: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = {
      'name': deptName,
      'description': deptDescription,
      'id_group': id_group,
      'routing': routing,
      'id_project': this.project._id
    };

    if (id_bot) {
      body['id_bot'] = id_bot;
      body['bot_only'] = bot_only;
    } else {
      body['id_bot'] = null;
      body['bot_only'] = null;
    }

    this.logger.log('[DEPTS-SERV] ADD-DEPT BODY ', body);

    const url = this.DEPTS_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteDeparment(id: string) {

    const url = this.DEPTS_URL + id;
    // url += `${id}# chat21-api-nodejs`; 
    this.logger.log('[DEPTS-SERV] DELETE DEPT URL ', url);

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
   * @param deptName
   */
  public updateDept(id: string, deptName: string, deptDescription: string, id_bot: string, bot_only: boolean, id_group: string, routing: string) {

    let url = this.DEPTS_URL;
    url += id;
    this.logger.log('[DEPTS-SERV] UPDATE DEPT - URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'name': deptName, 'description': deptDescription, 'id_group': id_group, 'routing': routing };
    if (id_bot) {
      body['id_bot'] = id_bot;
      body['bot_only'] = bot_only;
    } else {
      body['id_bot'] = null;
      body['bot_only'] = null;
    }

    this.logger.log('[DEPTS-SERV] UPDATE DEPT - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }


  public updateExistingDeptWithSelectedBot(deptid: string, id_bot: string) {
    let url = this.DEPTS_URL + deptid;

    this.logger.log('[DEPTS-SERV] - UPDATE EXISTING DEPT WITH SELECED BOT - URL', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'id_bot': id_bot };
    this.logger.log('[DEPTS-SERV] - UPDATE EXISTING DEPT WITH SELECED BOT - BODY', body);

    return this.http
      .patch(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * UPDATE DEPARTMENT STATUS
   * @param dept_id
   * @param status
   */
  public updateDeptStatus(dept_id: string, status: number) {
    const url = this.DEPTS_URL + dept_id;
    this.logger.log('UPDATE DEPT STATUS - URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'status': status };
    this.logger.log('[DEPTS-SERV] UPDATE DEPT STATUS - BODY ', body);

    return this.http
      .patch(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // --------------------------------------------------------------
  // !!! NOT USED 
  // --------------------------------------------------------------
  public updateDefaultDeptOnlineMsg(id: string, onlineMsg: string) {
    const url = this.DEPTS_URL + id;

    this.logger.log('[DEPTS-SERV] UPDATE DEFAULT DEPARTMENT ONLINE MSG URL  ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'online_msg': onlineMsg };

    this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPARTMENT ONLINE MSG - BODY  ', body);
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // --------------------------------------------------------------
  // !!! NOT USED 
  // --------------------------------------------------------------
  public updateDefaultDeptOfflineMsg(id: string, offlineMsg: string) {
    const url = this.DEPTS_URL + id;

    this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPARTMENT OFFLINE MSG - URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'offline_msg': offlineMsg };

    this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPARTMENT OFFLINE MSG - BODY ', body);
    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /**
   * READ DETAIL (TEST CHAT 21 router.get('/:departmentid/operators')
   * @param id
   */
  // ------------------------------------
  // Method used for test
  // ------------------------------------
  public testChat21AssignesFunction(id: string): Observable<Department[]> {
    let url = this.DEPTS_URL;
    // + '?nobot=' + true
    url += id + '/operators';
    this.logger.log('-- -- -- URL FOR TEST CHAT21 FUNC ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // this.logger.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

}
