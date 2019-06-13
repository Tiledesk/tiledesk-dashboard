import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AnalyticsService {
  
  urlHeatMap:string="https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a/analytics/requests/aggregate/dayoftheweek/hours"
  baseURL:string="https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a/analytics/requests/"

  
  constructor( private http:HttpClient) {}

  getDataHeatMap():Observable<[]>{
    
     const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.urlHeatMap, httpOptions);

  }

  getDataAVGWaitingCLOCK():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+'waiting', httpOptions);
  }

  getavarageWaitingTimeDataChart():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+'waiting/day', httpOptions);
  }
  
  getDurationConversationTimeDataCLOCK():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+'duration', httpOptions);
  }

  getDurationConversationTimeDataChart():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+'duration/day', httpOptions);
  }
  


}
