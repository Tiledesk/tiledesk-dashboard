import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class TagsService {

  projectId: string;
  TOKEN: any;
  SERVER_BASE_PATH: string;

  constructor(
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public _httpclient: HttpClient
  ) {
    this.getAppConfigAndBuildUrl();
    this.getCurrentProject();
    this.getToken();
  }


  getAppConfigAndBuildUrl() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[TAGS-SERV] SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[TAGS-SERV] - SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)
      this.logger.log('[TAGS-SERV] - SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)
      if (project) {
        this.projectId = project._id
      }
    })
  }

  getToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
      }
    });
  }


  // -------------------------------------------------------------------------------------
  // @ Read - Get tags
  // -------------------------------------------------------------------------------------
  public getTags(): Observable<[any]> {
    // https://tiledesk-server-pre.herokuapp.com/5e20a68e7c2e640017f2f40f/canned/  // example
    const url = this.SERVER_BASE_PATH + this.projectId + '/tags/'
    this.logger.log('[TAGS-SERV] - GET TAGS - URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpclient
      .get<[any]>(url, httpOptions)
  }


  /**
   * Read - Get tag by id (not used)
   * @param tagid 
   * @returns 
   */
  public getTagById(tagid: string): Observable<[any]> {
    const url = this.SERVER_BASE_PATH + this.projectId + '/tags/' + tagid
    this.logger.log('[TAGS-SERV] - GET TAGS BY ID - URL', url);
   
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpclient
      .get<[any]>(url, httpOptions)
  }

  /**
   * Create - Save new tag
   * @param tagname 
   * @param tagcolor 
   * @returns 
   */
  public createTag(tagname: string, tagcolor: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'tag': tagname, 'color': tagcolor };
    this.logger.log('[TAGS-SERV] - CREATE TAGS POST BODY ', body);

    const url = this.SERVER_BASE_PATH + this.projectId + '/tags/'
    this.logger.log('[TAGS-SERV] - CREATE TAGS POST URL', url);

    return this._httpclient
      .post(url, JSON.stringify(body), httpOptions)
  }

  
  /**
   * Update - update  tag
   * @param tagname 
   * @param newtagcolor 
   * @param tagid 
   * @returns 
   */
  public updateTag(tagname: string, newtagcolor: string,  tagid: string ) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'tag': tagname, 'color': newtagcolor };
    this.logger.log('[TAGS-SERV] - UPDATE TAGS PUT BODY ', body);

    const url = this.SERVER_BASE_PATH + this.projectId + '/tags/' + tagid;
    this.logger.log('[TAGS-SERV] - UPDATE TAGS PUT URL ', url);

    return this._httpclient
      .put(url, JSON.stringify(body), httpOptions)
  }


  /**
   * Delete - tag
   * @param tagid 
   * @returns 
   */
  public deleteTag(tagid: string, ) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectId + '/tags/' + tagid;
    this.logger.log('[TAGS-SERV] - DELETE TAGS - DELETE URL ', url);

    return this._httpclient
      .delete(url, httpOptions)

  }
}
