import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { URLSearchParams } from 'url';
import { AppConfigService } from '../services/app-config.service';

@Injectable()
export class AnalyticsService {


  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  SERVER_BASE_PATH: string;

  //BASE_URL = 'https://api.tiledesk.com/v1/'
  projectID: string;
  user: any;
  TOKEN: string;

  public richieste_bs: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private http: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService
  ) {

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });


    this.getCurrentProject();
    this.getAppConfig();
  }

  getAppConfig() {
    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (ANALYTICS-SERV) SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    console.log('============ PROJECT SERVICE - SUBSCRIBE TO CURRENT PROJ ============');
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      console.log('AnalyticsService  project', project)
      if (project) {

        this.projectID = project._id;
        console.log('AnalyticsService ID PROJECT ', this.projectID);

      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.getToken();
      console.log('AnalyticsService user is signed in');
    } else {
      console.log('AnalyticsService No user is signed in');
    }
  }

  // requestsByDay(lastdays, department_id): Observable<[]> {

  //   let headers= new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': this.TOKEN
  //     });
  //   let params= new HttpParams()
  //               .set('lastdays', lastdays)
  //               .set('department_id', department_id);


  //   return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/day' ,{ headers:headers, params:params})

  // }

  requestsByDay(lastdays, department_id?, participant_id?): Observable<[]> {
    if (!department_id) {
      department_id = ''
    }

    if (!participant_id) {
      participant_id = ''
    }
    console.log("DEP-id", department_id);
    console.log("PARTICIPANT-id", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/day', { headers: headers, params: params })
  }

  requestsByDayBotServed(lastdays, department_id?, participant_id?): Observable<[]> {
    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }
    console.log("DEP-id", department_id);
    console.log("PARTICIPANT-id", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/hasBot/day', { headers: headers, params: params })

  }

  getDataHeatMap(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/dayoftheweek/hours', httpOptions);
  }

  getDataAVGWaitingCLOCK(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/waiting', httpOptions);
  }


  // public getCurrent(projectId): Observable<any> {
  //   const url = this.SERVER_BASE_PATH + projectId + '/publicanalytics/waiting/current';
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   // headers.append('Authorization', TOKEN);
  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }

  getCurrentWaitingTime(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/publicanalytics/waiting/current', httpOptions);
  }

  getavarageWaitingTimeDataCHART(lastdays, department_id?, participant_id?): Observable<[]> {
    console.log("PARAM", lastdays, department_id, participant_id);

    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }
    console.log("DEP-id", department_id);
    console.log("PARTICIPANT-id", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id);
      
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/waiting/day', { headers: headers, params: params });
  }

  getDurationConversationTimeDataCLOCK(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/duration', httpOptions);
  }

  getDurationConversationTimeDataCHART(lastdays, department_id?, participant_id?): Observable<[]> {
    console.log("PARAM", lastdays, department_id, participant_id);
    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }
    console.log("DEP-id", department_id);
    console.log("PARTICIPANT-id", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)


    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/duration/day', { headers: headers, params: params });
  }

  getSatisfactionDataHEART(): Observable<[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction', { headers: headers });
  }

  getSatisfactionDataCHART(lastdays, department_id?): Observable<[]> {
    console.log("PARAM", lastdays, department_id);

    if (!department_id) {
      department_id = ''
    }
    console.log("DEP-id", department_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id);
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction/day', { headers: headers, params: params });
  }

  getVisitors(): Observable<[]> {
    // if (!department_id) {
    //   department_id = '';
    // }
    // console.log("DEP-id: ", department_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    // let params = new HttpParams()
    //             .set('lastdays', lastdays)
    //             .set('department_id', department_id);

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/count', { headers: headers })
  }

  getVisitorsByDay(lastdays, department_id?): Observable<[]> {
    if (!department_id) {
      department_id = ""
    }
    console.log("DEP-id: ", department_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    let params = new HttpParams()
        .set('lastdays', lastdays)
        .set('department_id', department_id);

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/aggregate/day', { headers: headers, params: params })
  }

  getVisitorsByLast7Days(): Observable<[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/aggregate/week', { headers: headers })
  }

  getVisitorsByLastMonth(): Observable<[]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/aggregate/month', { headers: headers })
  }

  getMessagesByDay(lastdays, sender_id?): Observable<[]> {
    if (!sender_id){
      sender_id = ""
    }
    console.log("SENDER-id: ", sender_id);

    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    let params = new HttpParams()
        .set('lastdays', lastdays)
        .set('sender', sender_id)

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/messages/aggregate/day', { headers: headers, params: params })
  }

  getAvgSatisfaction() {

    let promise = new Promise((resolve, reject) => {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      });

      this.http.get(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction', { headers: headers})
          .toPromise().then((res) => {
            resolve(res);
          }).catch((err) => {
            reject(err);
          })
      
    })
    return promise;
  }

  getSatisfactionByDay(lastdays, department_id?, participant_id?): Observable<[]> {
    console.log("PARAM", lastdays, department_id, participant_id);
    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }
    console.log("DEP-id", department_id);
    console.log("PARTICIPANT-id", participant_id);

    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    let params = new HttpParams()
        .set('lastdays', lastdays)
        .set('department_id', department_id)
        .set('participant', participant_id)

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction/day', { headers: headers, params: params })
  
  }

  getLastMountMessagesCount(): Observable<[]> {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/messages/count', { headers: headers })
  }

  getLastMountConversationsCount(): Observable<[]> {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/count', { headers: headers })
  }



  getRequestsHasBotCount() {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/hasBot/count', { headers: headers })
  }



  goToRichieste() {
    this.richieste_bs.next("hasClickedNumberOfRequestLast7Days");
  }

  getEventsList(): Observable<[]> {
    let lastdays = "360";

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let params = new HttpParams()
        .set('lastdays', lastdays)

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/events/aggregate/day', { headers: headers });
  }
  
  getEventByDay(lastdays, eventName): Observable<[]>{
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let params = new HttpParams()
        .set('lastdays', lastdays)
        .set('name', eventName)

    return this.http.get<[]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/events/aggregate/day', { headers: headers, params: params })
  }

}
