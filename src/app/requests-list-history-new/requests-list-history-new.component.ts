import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';

import { trigger, state, style, animate, transition, query, animateChild } from '@angular/animations';

@Component({
  selector: 'appdashboard-requests-list-history-new',
  templateUrl: './requests-list-history-new.component.html',
  styleUrls: ['./requests-list-history-new.component.scss'],
  animations: [
    trigger('ngIfAnimation', [
      transition(':enter, :leave', [
        query('@*', animateChild())
      ])
    ]),
    trigger('easeInOut', [
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate('1s ease-in-out', style({
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          opacity: 1
        }),
        animate('1s ease-in-out', style({
          opacity: 0
        }))
      ])
    ])
  ]
})


export class RequestsListHistoryNewComponent implements OnInit {

  requestList: Request[];
  projectId: string;
  showSpinner = true;
  startDate: any;
  endDate: any;
  deptName: string;
  fullText: string;
  queryString: string;
  startDateValue: string;
  endDateValue: string;
  deptNameValue: string;
  fullTextValue: string;
  
  show = false;
  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd.mm.yyyy',
  };
  constructor(
    private requestsService: RequestsService,
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit() {

    this.getRequests();
    this.getCurrentProject();

  }

  toggle() {
    this.show = !this.show;
  }

  // onDateStartChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - START DATE ', event.formatted);
  // }
  // onDateEndChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - END DATE ', event.formatted);
  // }

  search() {
    if (this.fullText) {
      // this.paramDeptName = 'deptname=' + this.deptName
      this.fullTextValue = this.fullText;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT NAME ', this.fullText);
      this.fullTextValue = ''
    }

    if (this.deptName) {
      // this.paramDeptName = 'deptname=' + this.deptName
      this.deptNameValue = this.deptName;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT NAME ', this.deptNameValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT NAME ', this.deptName);
      this.deptNameValue = ''
    }

    if (this.startDate) {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDate['formatted']);

      // this.paramStartDate = 'startdate=' + this.startDate['formatted'];
      this.startDateValue = this.startDate['formatted']
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDateValue);
    } else {
      this.startDateValue = '';
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDate);
    }

    if (this.endDate) {

      this.endDateValue = this.endDate['formatted'];
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDateValue);
    } else {
      this.endDateValue = '';
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDate)
    }

    // console.log('!!! NEW REQUESTS HISTORY - DEPT NAME ', this.deptame);


    if (this.deptName !== undefined && this.startDate !== undefined || this.endDate !== undefined) {
      // tslint:disable-next-line:max-line-length
      this.queryString = 'dept_name=' + this.deptNameValue + '&' + 'start_date=' + this.startDateValue + '&' + 'end_date=' + this.endDateValue
      console.log('!!! NEW REQUESTS HISTORY - QUERY STRING ', this.queryString);

      this.getRequests()

    }

  }

  getRequests() {
    this.requestsService.getNodeJsRequests(this.queryString).subscribe((requests: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS ', requests);
      if (requests) {


        // requests.forEach(r => {
        //   console.log('!!! NEW REQUESTS HISTORY REQUEST ', r)
        // })

        this.requestList = requests;
      }

    }, error => {
      this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS - ERROR: ', error);
    }, () => {
      this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS * COMPLETE *')
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      console.log('00 -> NEW REQUEST-LIST HISTORY - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)

      if (project) {
        this.projectId = project._id;

      }
    });
  }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_recipient: string) {
    this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
  }

}
