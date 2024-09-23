import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from './app-config.service';
import { LoggerService } from './logger/logger.service';

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
    private httpClient: HttpClient,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
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
    this.logger.log('[ANALYTICS-SERV]  getAppConfig  SERVER_BASE_PATH', this.SERVER_BASE_PATH);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      this.logger.log('[ANALYTICS-SERV] - SUBSCRIBE TO CURRENT PROJCT: ', project)
      if (project) {
        this.projectID = project._id;
        this.logger.log('[ANALYTICS-SERV] ID PROJECT ', this.projectID);
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token

      this.logger.log('[ANALYTICS-SERV] user is signed in', this.user);
    } else {
      this.logger.log('ANALYTICS-SERV] No user is signed in');
    }
  }

  requestsByDay(lastdays, department_id?, participant_id?, channel?): Observable<[any]> {
    if (!department_id) {
      department_id = ''
    }

    if (!participant_id) {
      participant_id = ''
    }

    if (!channel) {
      channel = ''
    }
    this.logger.log("[ANALYTICS-SERV] requestsByDay DEPT-ID", department_id);
    this.logger.log("[ANALYTICS-SERV] requestsByDay  PARTICIPANT-ID", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)
      .set('channel', channel)

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/day', { headers: headers, params: params })
  }

  requestsByDayBotServed(lastdays, department_id?, participant_id?, channel?): Observable<[any]> {
    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }

    if (!channel) {
      channel = ''
    }

    this.logger.log("[ANALYTICS-SERV] requestsByDayBotServed DEPT-ID", department_id);
    this.logger.log("[ANALYTICS-SERV] requestsByDayBotServed PARTICIPANT-ID", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)
      .set('channel', channel)

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/hasBot/day', { headers: headers, params: params })
  }

  getDataHeatMap(): Observable<[any]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/aggregate/dayoftheweek/hours', httpOptions);
  }

  getDataAVGWaitingCLOCK(): Observable<[any]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/waiting', httpOptions);
  }


  getCurrentWaitingTime(): Observable<[any]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/publicanalytics/waiting/current', httpOptions);
  }

  getavarageWaitingTimeDataCHART(lastdays, department_id?, participant_id?, channel?): Observable<[any]> {
    this.logger.log("[ANALYTICS-SERV] getavarageWaitingTimeDataCHART PARAM", lastdays, department_id, participant_id);

    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }

    if (!channel) {
      channel = ''
    }

    this.logger.log("[ANALYTICS-SERV] getavarageWaitingTimeDataCHART DEPT-ID", department_id);
    this.logger.log("[ANALYTICS-SERV] getavarageWaitingTimeDataCHART PARTICIPANT-ID", participant_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)
      .set('channel', channel);

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/waiting/day', { headers: headers, params: params });
  }

  // HTTP SERVICE CLIENT VERSION
  getDurationConversationTimeDataCLOCK(): Observable<[any]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      })
    };
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/duration', httpOptions);
  }


  getDurationConversationTimeDataCHART(lastdays, department_id?, participant_id?, channel?): Observable<[any]> {
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART PARAM", lastdays, department_id, participant_id);
    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }

    if (!channel) {
      channel = ''
    }
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART DEP-ID", department_id);
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART PARTICIPANT-ID", participant_id);
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART CHANNEL-ID", channel);
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART TOKEN", this.TOKEN);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART headers", headers);

    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)
      .set('channel', channel)

    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART params", params);

    const url = this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/duration/day'
    this.logger.log("[ANALYTICS-SERV] getDurationConversationTimeDataCHART url", url);

    return this.httpClient
    .get<[any]>(url, { headers: headers, params: params });
  }

  getSatisfactionDataHEART(): Observable<[any]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction', { headers: headers });
  }

  getSatisfactionDataCHART(lastdays, department_id?): Observable<[any]> {
    this.logger.log("[ANALYTICS-SERV] getSatisfactionDataCHART PARAM", lastdays, department_id);

    if (!department_id) {
      department_id = ''
    }
    this.logger.log("[ANALYTICS-SERV] getSatisfactionDataCHART DEP-ID", department_id);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    });
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id);
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction/day', { headers: headers, params: params });
  }

  getVisitors(): Observable<[any]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/count', { headers: headers })
  }

  getVisitorsByDay(lastdays, department_id?): Observable<[any]> {
    if (!department_id) {
      department_id = ""
    }

    this.logger.log("[ANALYTICS-SERV] getVisitorsByDay DEP-ID", department_id);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id);

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/aggregate/day', { headers: headers, params: params })
  }

  getVisitorsByLast7Days(): Observable<[any]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/aggregate/week', { headers: headers })
  }

  getVisitorsByLastMonth(): Observable<[any]> {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/project_users/aggregate/month', { headers: headers })
  }

  getMessagesByDay(lastdays, sender_id?, channel?): Observable<[any]> {
    if (!sender_id) {
      sender_id = ""
    }

    if (!channel) {
      channel = ""
    }

    this.logger.log("[ANALYTICS-SERV] getMessagesByDay SENDER-ID", sender_id);
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('sender', sender_id)
      .set('channel', channel)

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/messages/aggregate/day', { headers: headers, params: params })
  }

  getAvgSatisfaction() {

    let promise = new Promise((resolve, reject) => {
      let headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': this.TOKEN
      });

      this.httpClient.get(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction', { headers: headers })
        .toPromise().then((res) => {
          resolve(res);
        }).catch((err) => {
          reject(err);
        })

    })
    return promise;
  }

  getSatisfactionByDay(lastdays, department_id?, participant_id?, channel?): Observable<[any]> {
    this.logger.log("[ANALYTICS-SERV] getSatisfactionByDay PARAM", lastdays, department_id, participant_id);
    if (!department_id) {
      department_id = ''
    }
    if (!participant_id) {
      participant_id = ''
    }
    if (!channel) {
      channel = ''
    }
    this.logger.log("[ANALYTICS-SERV] getSatisfactionByDay DEP-ID", department_id);
    this.logger.log("[ANALYTICS-SERV] getSatisfactionByDay PARTICIPANT-ID", participant_id);
    this.logger.log("[ANALYTICS-SERV] getSatisfactionByDay CHANNEL-ID", participant_id);

    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('department_id', department_id)
      .set('participant', participant_id)
      .set('channel', channel)

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/satisfaction/day', { headers: headers, params: params })
  }

  getLastMountMessagesCount(): Observable<[any]> {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/messages/count', { headers: headers })
  }

  getLastMountConversationsCount(): Observable<[any]> {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/count', { headers: headers })
  }

  getRequestsHasBotCount() {
    let headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': this.TOKEN
    })
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/hasBot/count', { headers: headers })
  }

  goToRichieste() {
    this.richieste_bs.next("hasClickedNumberOfRequestLast7Days");
  }

  getEventsList(): Observable<[any]> {
    let lastdays = "360";
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let params = new HttpParams()
      .set('lastdays', lastdays)
    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/events/aggregate/day', { headers: headers });
  }

  getEventByDay(lastdays, eventName): Observable<[any]> {

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })

    let params = new HttpParams()
      .set('lastdays', lastdays)
      .set('name', eventName)

    return this.httpClient
    .get<[any]>(this.SERVER_BASE_PATH + this.projectID + '/analytics/events/aggregate/day', { headers: headers, params: params })
  }

  public lastMonthRequetsCount(): Observable<[any]> {
    // USED TO TEST (note: this service doesn't work in localhost)
    //  const url = 'https://api.tiledesk.com/v1/' + '5ba35f0b9acdd40015d350b6' + '/analytics/requests/count';
    const url = this.SERVER_BASE_PATH + this.projectID + '/analytics/requests/count';
    // console.log('[ANALYTICS-SERV]  - LAST MOUNT REQUESTS COUNT - URL ', url);

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN
    })
    //  USED TO TEST (note: this service doesn't work in localhost)
    //  headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYSIsInBhc3N3b3JkIjoiJDJhJDEwJDEzZlROSnA3OUx5RVYvdzh6NXRrbmVrc3pYRUtuaWFxZm83TnR2aTZpSHdaQ2ZLRUZKd1kuIiwiZW1haWwiOiJuaWNvbGEubGFuemlsb3R0b0Bmcm9udGllcmUyMS5pdCIsIl9pZCI6IjVhYzc1MjE3ODdmNmI1MDAxNGUwYjU5MiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM3MjkxNzcwfQ.dxovfEleb6I33rtWObY8SwyjfMVfaY7vXwHvQDeNTEY');

    return this.httpClient
    .get<[any]>(url, { headers: headers })
  }

}
