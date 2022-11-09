import { Injectable } from '@angular/core';
import { NotifyService } from '../core/notify.service';
import { ProjectService } from '../services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class WidgetService {
  public id_project: string;
  public widgetSettingsObjct;
  updateWidgetSuccessNoticationMsg: string;
  SERVER_BASE_PATH: string;
  TOKEN: string;
  projectID: string;

  constructor(
    private _httpClient: HttpClient,
    private notify: NotifyService,
    private projectService: ProjectService,
    private translate: TranslateService,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.getAppConfig();
    this.getUserToken()
    this.getCurrentProject();

  }
  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.logger.log('[WIDGET-SERV] - SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }


  getUserToken() {
    // this.logger.log('[WIDGET-SERV] - getUserToken');
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        // this.logger.log('[WIDGET-SERV] - GET TOKEN - TOKEN: ', this.TOKEN);
      }
    });
  }

  getCurrentProject() {
    // this.logger.log('[WIDGET-SERV] - getCurrentProject');
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id;
        this.logger.log('[WIDGET-SERV] - PROJECT ID: ', this.projectID);
      }
    });
  }

  /**
   * UPDATE PROJECT WIDGET
   * @param widgetSettingsObj 
   */
  updateWidgetProject(widgetSettingsObj: any) {
    this.projectService.updateWidgetProject(widgetSettingsObj)
      .subscribe((data) => {
        // this.logger.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - RESPONSE data', data);
        this.logger.log('[WIDGET-SERV] - UPDATE PROJECT WIDGET - RESPONSE data.widget', data['widget']);

        this.translateAndShowUpdateWidgetNotification();

      }, (error) => {
        this.logger.error('[WIDGET-SERV] - UPDATE PROJECT WIDGET - ERROR ', error);
      }, () => {
        this.logger.log('[WIDGET-SERV] - UPDATE PROJECT WIDGET * COMPLETE *');
      });
  }

  // translateAndShowUpdateWidgetNotification() {
  //   this.translateUpdateWidgetProjectSuccessNoticationMsg();
  // }

  translateAndShowUpdateWidgetNotification() {
    this.translate.get('UpdateDeptGreetingsSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateWidgetSuccessNoticationMsg = text;
        // this.logger.log('»» WIDGET SERVICE - Update Widget Project Success NoticationMsg', text)
      }, (error) => {

        // this.logger.error('[WIDGET-SERV] -  Update Widget Project Success NoticationMsg - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        // this.logger.log('[WIDGET-SERV] -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Widget translation
  // -----------------------------------------------------------------------------------------------------
  // curl -v -X GET -H 'Content-Type:application/json'  http://localhost:3000/5df898a830dbc3c62d3ef16c/labels/it
  // Get a label by lang code
  // https://tiledesk-server-pre.herokuapp.com/5df26badde7e1c001743b63c/labels2/EN


  // -------------------------------------------------------------------
  // Get all default labels
  // -------------------------------------------------------------------
  public getAllDefaultLabels(): Observable<[any]> {
    // https://tiledesk-server-pre.herokuapp.com/5fa12801d41fef0034f646e8/labels/default/EN

    const url = this.SERVER_BASE_PATH + this.projectID + '/labels/default'

    this.logger.log('[WIDGET-SERV] - GET ALL DEFAULT LABEL URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .get<[any]>(url, httpOptions)
  }


  // -------------------------------------------------------------------
  // Get EN default labels
  // -------------------------------------------------------------------
  public getEnDefaultLabels(): Observable<[any]> {
    // https://tiledesk-server-pre.herokuapp.com/5fa12801d41fef0034f646e8/labels/default/EN

    const url = this.SERVER_BASE_PATH + this.projectID + '/labels/default/EN'

    this.logger.log('[WIDGET-SERV] - GET EN DEFAULT LABELS URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .get<[any]>(url, httpOptions)
  }


  // -------------------------------------------------------------------
  // Get all labels
  // -------------------------------------------------------------------
  public getLabels(): Observable<[any]> {
    // const url = this.SERVER_BASE_PATH + this.projectID + '/labels/it'
    // https://tiledesk-server-pre.herokuapp.com/5df2240cecd41b00173a06bb/labels2

    const url = this.SERVER_BASE_PATH + this.projectID + '/labels'

    this.logger.log('[WIDGET-SERV] - GET ALL LABELS URL', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .get<[any]>(url, httpOptions)
  }

  /**
   * SET DEFAULT LANGUAGE
   * @param languagecode 
   * @returns 
   */
  public setDefaultLanguage(languagecode: string) {
    const _languagecode = languagecode.toUpperCase();
   
    const url = this.SERVER_BASE_PATH + this.projectID + '/labels/' + _languagecode + '/default';
    this.logger.log('[WIDGET-SERV] - SET DEFAULT LANGUAGE URL', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const body = { 'lang': _languagecode };
    this.logger.log('[WIDGET-SERV] - SET DEFAULT LANGUAGE BODY ', body);

    return this._httpClient
      .patch(url, null, httpOptions)
  }


/**
 * CLONE LABEL
 * @param langCode 
 * @returns 
 */
  public cloneLabel(langCode) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    
    const url = this.SERVER_BASE_PATH + this.projectID + '/labels/default/clone?lang=' + langCode
    this.logger.log('[WIDGET-SERV] - CLONE LABELS URL', url);

    const body = { "lang": langCode };
    this.logger.log('[WIDGET-SERV] - CLONE LABELS BODY', body);
   

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }

  /**
   * EDIT LABELS
   * @param langCode 
   * @param isdefault 
   * @param translationObjct 
   * @returns 
   */
  public editLabels(langCode, isdefault, translationObjct) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    const url = this.SERVER_BASE_PATH + this.projectID + '/labels/'
    this.logger.log('[WIDGET-SERV] - EDIT LABELS URL', url);

    const body = { "lang": langCode, default: isdefault, "data": translationObjct };
    this.logger.log('[WIDGET-SERV] - EDIT LABELS BODY', body);

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
  }


  /**
   * DELETE LABELS
   * @param langCode 
   * @returns 
   */
  public deleteLabels(langCode) {
    const url = this.SERVER_BASE_PATH + this.projectID + '/labels/' + langCode
    this.logger.log('[WIDGET-SERV] - DELETE LABELS URL', url);
    
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };

    return this._httpClient
      .delete(url, httpOptions)
  }


}
