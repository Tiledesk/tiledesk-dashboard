// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Department } from '../models/department-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { DepartmentsCacheService } from './cache/departments-cache.service';
import { map, shareReplay, tap } from 'rxjs/operators';
@Injectable()

export class DepartmentService {

  public myDepts_bs: BehaviorSubject<Department[]> = new BehaviorSubject<Department[]>([]);

  SERVER_BASE_PATH: string;
  DEPTS_URL: string;
  TOKEN: string
  user: any;
  project: any;

  constructor(
    private httpClient: HttpClient,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private departmentsCacheService: DepartmentsCacheService
  ) {
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

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    // const url = `http://localhost:3000/app1/departments/`;
    // const url = `http://api.chat21.org/app1/departments/;
    const url = this.DEPTS_URL;
    this.logger.log('[DEPTS-SERV] - GET DEPTS AS OLD WIDGET VERSION', url);

    return this.httpClient
      .get<Department[]>(url, httpOptions)
  }

  // ------------------------------------
  // Method used for test
  // GET DEPTS AS THE NEW WIDGET VERSION
  // ------------------------------------
  public getDeptsAsNewWidget(): Observable<Department[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project._id + '/widgets'
    this.logger.log('[DEPTS-SERV] - GET DEPTS AS THE NEW WIDGET VERSION URL', url);

    return this.httpClient
      .get<Department[]>(url, httpOptions)
  }

  // ------------------------------------
  //  GET VISITOR COUNTER - !!!! NOT USED
  // ------------------------------------
  public getVisitorCounter(): Observable<[any]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.project._id + '/visitorcounter'
    this.logger.log('[DEPTS-SERV] - GET DEPTS AS THE NEW WIDGET VERSION URL', url);

    return this.httpClient
      .get<[any]>(url, httpOptions)
  }

  /**
   * GET ALL DEPTS WITH THE CURRENT PROJECT ID AND WITHOUT FILTER FOR STATUS
   * NOTE: THE CALLBACK TO GET THE DEPTS FILTERED FOR STATUS IS RUNNED BY THE WIDGET
   * NOTE: the DSBRD CALL /departments/allstatus  WHILE the WIDGET  CALL /departments
   * 
   * NOTE: chat21-api-node.js READ THE CURRENT PROJECT ID FROM THE URL SO IS NO LONGER NECESSARY TO PASS THE PROJECT ID AS PARAMETER
   */
  public getDeptsByProjectId(): Observable<Department[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    // Check if we have cached data first
    const cachedData = this.departmentsCacheService.getCachedData();
    if (cachedData) {
      this.logger.log('[DEPTS-SERV] - GET DEPTS BY PROJECT ID - Using cached data (no HTTP request)');
      return of(cachedData);
    }

    // Check if there's an Observable in progress
    let departments$ = this.departmentsCacheService.getValue();
    
    if (!departments$) {
      const url = this.DEPTS_URL + 'allstatus';
      this.logger.log('[DEPTS-SERV] - GET DEPTS BY PROJECT ID - Cache miss, making HTTP request - URL:', url);
      this.logger.log('[DEPTS-SERV] GET DEPTS ALL STATUS - DEPTS URL', url);
      departments$ = this.httpClient
        .get<Department[]>(url, httpOptions)
        .pipe(
          map((response: any) => response),
          tap((data: Department[]) => {
            // Cache the actual data when it arrives
            this.departmentsCacheService.setCachedData(data);
          }),
          shareReplay(1)
        );
      this.departmentsCacheService.setValue(departments$);
    } else {
      this.logger.log('[DEPTS-SERV] - GET DEPTS BY PROJECT ID - Using cached Observable (HTTP request may be in progress)');
    }

    return departments$;
  }

  /**
   * Clear departments cache
   * Public method to allow components to clear cache when needed
   */
  public clearDepartmentsCache() {
    this.departmentsCacheService.clearDepartmentsCache();
  }

  public getDeptsByProjectIdToHookTemplates(projectid): Observable<Department[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    // const url = this.DEPTS_URL + 'allstatus';
    const url = this.SERVER_BASE_PATH + projectid + '/departments/';
    this.logger.log('[DEPTS-SERV] GET DEPTS ALL STATUS - DEPTS URL', url);
    return this.httpClient
      .get<Department[]>(url, httpOptions)
  }

  public getDeptsByProjectIdToPromise(): Promise<any> {
    // Use the cached method which already handles caching
    const departments$ = this.getDeptsByProjectId();
    this.logger.log('[DEPTS-SERV] GET DEPTS TO PROMISE - Using cached getDeptsByProjectId()');
    // Convert Observable to Promise
    return departments$.toPromise();
  }

  /**
   * READ DETAIL (GET BOT BY BOT ID)
   * @param id
   */
  public getDeptById(id: string): Observable<Department[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.DEPTS_URL + id;
    // url += `${id}`;
    this.logger.log('[DEPTS-SERV] GET DEPT BY ID - URL', url);

    return this.httpClient
      .get<Department[]>(url, httpOptions)
  }


  /**
   * Create a dept
   * @param deptName 
   * @param deptDescription 
   * @param id_bot 
   * @param bot_only 
   * @param id_group 
   * @param routing 
   * @returns 
   */
  public addDept(deptName: string, deptDescription: string, id_bot: string, bot_only: boolean, id_group: string, routing: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.DEPTS_URL;

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

    const add$ = this.httpClient
      .post(url, JSON.stringify(body), httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful creation
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - ADD DEPT - Cleared departments cache');
        })
      );

    return add$;
  }

  /**
   * DELETE (DELETE)
   * @param id
   */
  public deleteDeparment(id: string) {

    const url = this.DEPTS_URL + id;
    this.logger.log('[DEPTS-SERV] DELETE DEPT URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const delete$ = this.httpClient
      .delete(url, httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful deletion
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - DELETE DEPT - Cleared departments cache');
        })
      );

    return delete$;
  }

  /**
   * UPDATE (PUT)
   * @param id
   * @param deptName
   */
  public updateDept(id: string, deptName: string, deptDescription: string, id_bot: string, bot_only: boolean, id_group: string, routing: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.DEPTS_URL + id;
    // url += id;
    this.logger.log('[DEPTS-SERV] UPDATE DEPT - URL ', url);

    const body = { 'name': deptName, 'description': deptDescription, 'id_group': id_group, 'routing': routing };
    if (id_bot) {
      body['id_bot'] = id_bot;
      body['bot_only'] = bot_only;
    } else {
      body['id_bot'] = null;
      body['bot_only'] = null;
    }

    this.logger.log('[DEPTS-SERV] UPDATE DEPT - BODY ', body);

    const update$ = this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful update
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - UPDATE DEPT - Cleared departments cache');
        })
      );

    return update$;
  }


  public updateExistingDeptWithSelectedBot(deptid: string, id_bot: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.DEPTS_URL + deptid
    this.logger.log('[DEPTS-SERV] - UPDATE EXISTING DEPT WITH SELECED BOT - URL', url);

    const body = { 'id_bot': id_bot };
    this.logger.log('[DEPTS-SERV] - UPDATE EXISTING DEPT WITH SELECED BOT - BODY', body);

    const update$ = this.httpClient
      .patch(url, JSON.stringify(body), httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful update
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - UPDATE EXISTING DEPT WITH SELECTED BOT - Cleared departments cache');
        })
      );

    return update$;
  }

  /**
   * UPDATE DEPARTMENT STATUS
   * @param dept_id
   * @param status
   */
  public updateDeptStatus(dept_id: string, status: number) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.DEPTS_URL + dept_id;
    this.logger.log('UPDATE DEPT STATUS - URL ', url);

    const body = { 'status': status };
    this.logger.log('[DEPTS-SERV] UPDATE DEPT STATUS - BODY ', body);

    const update$ = this.httpClient
      .patch(url, JSON.stringify(body), httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful status update
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - UPDATE DEPT STATUS - Cleared departments cache');
        })
      );

    return update$;
  }

  // --------------------------------------------------------------
  // !!! NOT USED 
  // --------------------------------------------------------------
  public updateDefaultDeptOnlineMsg(id: string, onlineMsg: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.DEPTS_URL + id;
    this.logger.log('[DEPTS-SERV] UPDATE DEFAULT DEPARTMENT ONLINE MSG URL  ', url);


    const body = { 'online_msg': onlineMsg };

    this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPARTMENT ONLINE MSG - BODY  ', body);
    const update$ = this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful update
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPT ONLINE MSG - Cleared departments cache');
        })
      );

    return update$;
  }

  // --------------------------------------------------------------
  // !!! NOT USED 
  // --------------------------------------------------------------
  public updateDefaultDeptOfflineMsg(id: string, offlineMsg: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.DEPTS_URL + id;
    this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPARTMENT OFFLINE MSG - URL ', url);

    const body = { 'offline_msg': offlineMsg };

    this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPARTMENT OFFLINE MSG - BODY ', body);
    const update$ = this.httpClient
      .put(url, JSON.stringify(body), httpOptions)
      .pipe(
        tap(() => {
          // Clear the departments cache after successful update
          this.departmentsCacheService.clearDepartmentsCache();
          this.logger.log('[DEPTS-SERV] - UPDATE DEFAULT DEPT OFFLINE MSG - Cleared departments cache');
        })
      );

    return update$;
  }

  /**
   * READ DETAIL (TEST CHAT 21 router.get('/:departmentid/operators')
   * @param id
   */
  // ------------------------------------
  // Method used for test
  // ------------------------------------
  public testChat21AssignesFunction(id: string): Observable<Department[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    let url = this.DEPTS_URL;
    // + '?nobot=' + true
    url += id + '/operators';
    this.logger.log('-- -- -- URL FOR TEST CHAT21 FUNC ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // this.logger.log('TOKEN TO COPY ', this.TOKEN)
    return this.httpClient
      .get<Department[]>(url, httpOptions)

  }

}
