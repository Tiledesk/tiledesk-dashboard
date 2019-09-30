import { DepartmentService } from './../services/mongodb-department.service';
import { Trigger } from './../models/trigger-model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from 'app/core/auth.service';

@Injectable()
export class TriggerService {

  // BASE_URL = environment.mongoDbConfig.BASE_URL;
  BASE_URL = 'https://tiledesk-server-pre.herokuapp.com/'
  projectID: string;
  user: any;
  TOKEN: string;


  constructor(
    private http: HttpClient,
    public auth: AuthService,
    public departmentService: DepartmentService
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

  getAllTrigger(): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
      // 'Authorization': 'Basic ' + btoa('aaa22@aaa22.it:123456')
      });

    // return this.http.get<[]>(this.BASE_URL+ this.projectID + '/modules/triggers' ,{ headers:headers})
    return this.http.get<[]>(this.BASE_URL + this.projectID + '/modules/triggers' , { headers: headers})

  }

  getTriggerById(triggerId: string): Observable<[Trigger]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
      // 'Authorization': 'Basic ' + btoa('aaa22@aaa22.it:123456')
      });

    // return this.http.get<[]>(this.BASE_URL+ this.projectID + '/modules/triggers' ,{ headers:headers})
    return this.http.get<[Trigger]>(this.BASE_URL + this.projectID + '/modules/triggers/' + triggerId , { headers: headers})


  }

  postTrigger(trigger: Trigger): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
      // 'Authorization': 'Basic ' + btoa('aaa22@aaa22.it:123456')
      });

    return this.http.post<[]>(this.BASE_URL + this.projectID + '/modules/triggers', JSON.stringify(trigger), {headers: headers});

  }

  updateTrigger(trigger: Trigger): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
      // 'Authorization': 'Basic ' + btoa('aaa22@aaa22.it:123456')
      });

    return this.http.put<[]>(this.BASE_URL + this.projectID + '/modules/triggers/' + trigger._id , JSON.stringify(trigger), {headers: headers});

  }


  deleteTrigger(triggerID: string): Observable<[]> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.TOKEN,
      // 'Authorization': 'Basic ' + btoa('aaa22@aaa22.it:123456')
      });

    return this.http.delete<[]>(this.BASE_URL + this.projectID + '/modules/triggers/' + triggerID, {headers: headers});
  }





}
