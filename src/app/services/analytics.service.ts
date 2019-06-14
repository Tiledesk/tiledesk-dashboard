import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from 'app/core/auth.service';

@Injectable()
export class AnalyticsService {
  
  baseURL:string="https://api.tiledesk.com/v1/"
  projectID:string;
  
  constructor( private http:HttpClient,
              public auth: AuthService) {
    this.getCurrentProject()
  }
  
  getCurrentProject() {
    console.log('============ PROJECT SERVICE - SUBSCRIBE TO CURRENT PROJ ============');
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      console.log("PPPP", project)
      if (project) {

        this.projectID = project._id;
        console.log('ID PROJECT', this.projectID);
        
      }
    });
  }

  getDataHeatMap():Observable<[]>{
    
     const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+this.projectID+'/analytics/requests/aggregate/dayoftheweek/hours', httpOptions);

  }

  getDataAVGWaitingCLOCK():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+this.projectID+'/analytics/requests/waiting', httpOptions);
  }

  getavarageWaitingTimeDataChart():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+this.projectID+'/analytics/requests/waiting/day', httpOptions);
  }
  
  getDurationConversationTimeDataCLOCK():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+this.projectID+'/analytics/requests/duration', httpOptions);
  }

  getDurationConversationTimeDataChart():Observable<[]>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Basic ' + btoa('alessia.calo@frontiere21.it:123456')
      })
    };

    return this.http.get<[]>(this.baseURL+this.projectID+'/analytics/requests/duration/day', httpOptions);
  }
  


}
