import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { NotifyService } from '../core/notify.service';
import { ProjectService } from '../services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions} from '@angular/http';


@Injectable()
export class WidgetService {

  // public primaryColorBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public secondaryColorBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public calloutTimerBs: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  // public calloutTitleBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public calloutMsgBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  // public includePrechatformBs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  // public widgetAlignmentBs: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  http: Http;
  public id_project: string;
  public widgetSettingsObjct;
  updateWidgetSuccessNoticationMsg: string;
  BASE_URL = environment.mongoDbConfig.BASE_URL;
  TOKEN: string;
  projectID: string;

  constructor(
    http: Http,
    private notify: NotifyService,
    private projectService: ProjectService,
    private translate: TranslateService,
    public auth: AuthService
  ) {
    this.http = http;
    console.log('»» WIDGET SERVICE HELLO WIDGET SERVICE !')


    this.getUserToken()
    this.getCurrentProject();

  }



  getUserToken() {
    console.log('»» WIDGET SERVICE - getUserToken');
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token;
        console.log('»» WIDGET SERVICE - TOKEN: ', this.TOKEN);
      }
    });
  }

  getCurrentProject() {
    console.log('»» WIDGET SERVICE - getCurrentProject');
    this.auth.project_bs.subscribe((project) => {

      if (project) {

        this.projectID = project._id;
        console.log('»» WIDGET SERVICE - PROJECT ID: ', this.projectID);
      }
    });
  }

  // saveCustomUrl(logo_url: string) {
  //   console.log('WIDGET SERVICE - CUSTOM LOGO URL ', logo_url);
  //   this.widgetSettingsObjct = {logo_url};
  //   this.updateWidgetProject();
  // }

  updateWidgetProject(widgetSettingsObj: any) {
    this.projectService.updateWidgetProject(widgetSettingsObj)
      .subscribe((data) => {
        // console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - RESPONSE data', data);
        console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - RESPONSE data.widget', data.widget);

        this.translateAndShowUpdateWidgetNotification();

      }, (error) => {
        console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET - ERROR ', error);
      }, () => {
        console.log('»» WIDGET SERVICE - UPDATE PROJECT WIDGET * COMPLETE *');
      });
  }

  // translateAndShowUpdateWidgetNotification() {
  //   this.translateUpdateWidgetProjectSuccessNoticationMsg();
  // }

  translateAndShowUpdateWidgetNotification() {
    this.translate.get('UpdateDeptGreetingsSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.updateWidgetSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - Update Widget Project Success NoticationMsg', text)
      }, (error) => {

        console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        // console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Widget translation
  // -----------------------------------------------------------------------------------------------------

  // curl -v -X GET -H 'Content-Type:application/json'  http://localhost:3000/5df898a830dbc3c62d3ef16c/labels/it

  // Get a label by lang code
  // https://tiledesk-server-pre.herokuapp.com/5df26badde7e1c001743b63c/labels2/EN

  /**
   * Get all labels
   */
  public getLabels(): Observable<[]> {
    // const url = this.BASE_URL + this.projectID + '/labels/it'
    // https://tiledesk-server-pre.herokuapp.com/5df2240cecd41b00173a06bb/labels2

    const url = this.BASE_URL + this.projectID + '/labels2'

    console.log('Multilanguage »» WIDGET SERVICE - GET LABELS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }



  public cloneLabel(langCode) {
    const headers = new Headers();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { "lang": langCode };

    const url = this.BASE_URL + this.projectID + '/labels2/default/clone?lang=' + langCode
    console.log('Multilanguage »» WIDGET SERVICE - CLONE LABELS URL', url);

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  public editLabels(langCode, translationObjct) {
    const headers = new Headers();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // const body = { "lang": 'it', "data": translationObjct };
    const body = { "lang": langCode, "data": translationObjct };
    const url = this.BASE_URL + this.projectID + '/labels2/'
    console.log('Multilanguage »» WIDGET SERVICE - SAVE LABELS URL', url);
    console.log('Multilanguage »» WIDGET SERVICE - SAVE LABELS Body', body);

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  // delete all labels 
  // curl -v -X DELETE -H 'Content-Type:application/json' -u andrea.leo@f21.it:123456 http://localhost:3000/4321/labels2

  public deleteLabels(langCode) {
    const url = this.BASE_URL + this.projectID + '/labels2/' + langCode
    console.log('Multilanguage »» WIDGET SERVICE - DELETE LABELS URL', url);

    const headers = new Headers();
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
  
    return this.http
      .delete(url,  options)
      .map((res) => res.json());
  }





  public getMockLabels(): Observable<[]> {
    // const url = this.BASE_URL + this.projectID + '/labels/it'
    // const url = "http://demo9971484.mockable.io/" + lang
    const url = "http://demo9971484.mockable.io/all"

    console.log('»» WIDGET SERVICE - GET LABELS URL', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  public createMockLabel(translation) {

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');

    const options = new RequestOptions({ headers });

    const body = { "lang": "it", "key": "key1", "message": "msg1" };

    console.log('»» WIDGET SERVICE create MOCK LABEL body ', body);

    const url = "http://demo9971484.mockable.io/mytranslation"

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }




  // public editLang(translation) {

  //   // let url = this.BASE_URL + this.projectID + '/labels2/' + this.projectID
  //   let url = this.BASE_URL + '5df2240cecd41b00173a06bb' + '/labels2'

  //   console.log('Multilanguage CREATE LABEL - PUT URL ', url);

  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   const options = new RequestOptions({ headers });

  //   const body = { 'data': translation };

  //   console.log('Multilanguage - PUT REQUEST BODY ', body);

  //   return this.http
  //     .put(url, JSON.stringify(body), options)
  //     .map((res) => res.json());

  // }




  /**
   * WHEN IN WIDGET-DESIGN IS CHANGED THE PRIMARY COLOR,
   * THE NEW COLOR VALUE IS PASSED IN THIS SERVICE THAT PUBLISH IT THROUGH primaryColorBs.
   * THE WIDGET-COMP IS SUBSCRIBED TO primaryColorBs THAT USE IT TO SET THE PARAMETER "ThemeColor" AND "Themeforegroundcolor"
   * IN THE 'WIDGET TEXTAREA' AND IN THE URL USED FOR TESTING THE CODE */
  // publishPrimaryColorSelected(primary_color: string) {
  //   console.log('WIDGET SERVICE - ON CHANGE IN WIDGET DESIGN > PRIMARY COLOR  ', primary_color);
  //   this.primaryColorBs.next(primary_color);

  //   setTimeout(() => {
  //     // this.notify.showWidgetStyleUpdateNotification('The style of your TileDesk Widget has been updated!', 2, 'done');
  //   }, 1000);
  // }

  // publishWidgetAligmentSelected(alignment: string) {
  //   console.log('WIDGET SERVICE - ON SELECT WIDGET ALIGNMENT ', alignment);
  //   this.widgetAlignmentBs.next(alignment);

  //   setTimeout(() => {
  //     this.notify.showWidgetStyleUpdateNotification('The style of your TileDesk Widget has been updated!', 2, 'done');
  //   }, 1000);
  // }

  // publishSecondaryColorSelected(secondary_color: string) {
  //   console.log('WIDGET SERVICE - ON CHANGE IN WIDGET DESIGN > SECONDARY COLOR ', secondary_color);
  //   setTimeout(() => {
  //     this.secondaryColorBs.next(secondary_color);
  //     this.notify.showWidgetStyleUpdateNotification('The style of your TileDesk Widget has been updated!', 2, 'done');
  //   }, 1000);
  // }

  // publishCalloutTimerSelected(timer_selected) {
  //   console.log('WIDGET SERVICE - ON SELECT IN WIDGET COMP > CALLOUT TIMER ', timer_selected);
  //   this.calloutTimerBs.next(timer_selected);
  // }

  // publishCalloutTitleTyped(callout_title) {
  //   console.log('WIDGET SERVICE - ON KEYUP IN WIDGET COMP > CALLOUT TITLE', callout_title);
  //   this.calloutTitleBs.next(callout_title)
  // }

  // publishCalloutMsgTyped(callout_msg) {
  //   console.log('WIDGET SERVICE - ON KEYUP IN WIDGET COMP > CALLOUT MSG', callout_msg);
  //   this.calloutMsgBs.next(callout_msg)
  // }

  // publishPrechatformSelected(prechatform_checked) {
  //   console.log('WIDGET SERVICE - ON SELECTED IN WIDGET COMP > INCLUDE PRECHAT FORM ', prechatform_checked);
  //   this.includePrechatformBs.next(prechatform_checked)
  // }


}
