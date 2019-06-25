import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable()
export class AnalyticsService {

  // baseURL = 'https://api.tiledesk.com/v1/';

  BASE_URL = environment.mongoDbConfig.BASE_URL;

  projectID: string;
  user: any;
  TOKEN: string;

  public richieste_bs: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private http: HttpClient,
    public auth: AuthService
  ) {
    

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      this.checkUser()
    });


    this.getCurrentProject()
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

  requestsByDay(): Observable<[]> {
    // USED TO TEST (note: this service doesn't work in localhost)
     const url = 'https://api.tiledesk.com/v1/' + '5c28b587348b680015feecca' + '/analytics/requests/aggregate/day';
    //const url = this.BASE_URL + this.project._id + '/analytics/requests/aggregate/day';
    console.log('!!! AANALYTICS - REQUESTS BY DAY - URL ', url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
         'Authorization': 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YzI4YjU0ODM0OGI2ODAwMTVmZWVjYzkiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IlBhbmljbyIsImZpcnN0bmFtZSI6IkdhYnJpZWxlIiwicGFzc3dvcmQiOiIkMmEkMTAkMUJ0b0xEVmJFaDU5YmhPVlRRckRCT3NoMm8zU3Zlam5aY2VFU0VCZGRFVTc2dDk0d1lIRi4iLCJlbWFpbCI6ImdhYnJpZWxlLnBhbmljbzk1QGdtYWlsLmNvbSIsIl9pZCI6IjVjMjhiNTQ4MzQ4YjY4MDAxNWZlZWNjOSJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTU2MjY1MjI0fQ.aJkbYc2D-kMFZR3GgTiGA85sW-ZB5VWrQW7fLNQnICQ'
      })
    
    };

    return this.http.get<[]>(url, httpOptions)
    //return this.http.get<[]>(this.BASE_URL + this.projectID + '/analytics/requests/aggregate/day',httpOptions);
  }


  getDataHeatMap(): Observable<[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
         'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };
    return this.http.get<[]>('https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a'+ '/analytics/requests/waiting', httpOptions);
    //return this.http.get<[]>(this.BASE_URL + this.projectID + '/analytics/requests/aggregate/dayoftheweek/hours', httpOptions);

  }

  getDataAVGWaitingCLOCK(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
         'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };
    return this.http.get<[]>('https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a'+ '/analytics/requests/waiting', httpOptions);
    //return this.http.get<[]>(this.BASE_URL + this.projectID + '/analytics/requests/waiting', httpOptions);
  }

  getavarageWaitingTimeDataChart(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
         'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };
   
    return this.http.get<[]>('https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a' + '/analytics/requests/waiting/day', httpOptions);
    //return this.http.get<[]>(this.BASE_URL + this.projectID + '/analytics/requests/waiting/day', httpOptions);
  }

  getDurationConversationTimeDataCLOCK(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
         'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };
   
    return this.http.get<[]>('https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a' + '/analytics/requests/duration', httpOptions);
    //return this.http.get<[]>(this.BASE_URL + this.projectID + '/analytics/requests/duration', httpOptions);
  }

  getDurationConversationTimeDataChart(): Observable<[]> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        //'Authorization': this.TOKEN
         'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>('https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a' + '/analytics/requests/duration/day', httpOptions);
    //return this.http.get<[]>(this.BASE_URL + this.projectID + '/analytics/requests/duration/day', httpOptions);
  }

  goToRichieste(){
    this.richieste_bs.next("hasClickedNumberOfRequestLast7Days");
  }

}
