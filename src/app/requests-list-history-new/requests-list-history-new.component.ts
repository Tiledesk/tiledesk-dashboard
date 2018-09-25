import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { DepartmentService } from '../services/mongodb-department.service';
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

  @ViewChild('advancedoptionbtn') private advancedoptionbtnRef: ElementRef;
  @ViewChild('searchbtn') private searchbtnRef: ElementRef;
  @ViewChild('searchbtnbottom') private searchbtnbottomRef?: ElementRef;
  // @ViewChild('searchbtn') private searchbtnRef: ElementRef;


  requestList: Request[];
  projectId: string;
  showSpinner = true;
  startDate: any;
  endDate: any;
  deptName: string;
  fullText: string;
  queryString: string;
  startDateValue: any;
  endDateValue: any;
  deptNameValue: string;
  deptIdValue: string;
  fullTextValue: string;

  show = false;
  hasFocused = false;
  departments: any;
  selectedDeptId: string;

  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    // dateFormat: 'yyyy, mm , dd',
  };
  constructor(
    private requestsService: RequestsService,
    private router: Router,
    public auth: AuthService,
    private departmentService: DepartmentService
  ) { }

  ngOnInit() {

    this.getRequests();
    this.getCurrentProject();
    this.getDepartments();
  }
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments

    }, error => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS * COMPLETE *')
    });
  }

  toggle() {
    this.advancedoptionbtnRef.nativeElement.blur();
    this.show = !this.show;
    console.log('!!! NEW REQUESTS HISTORY - TOGGLE DIV ', this.show);
  }

  // onDateStartChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - START DATE ', event.formatted);
  // }
  // onDateEndChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - END DATE ', event.formatted);
  // }
  // advancedOptions() {
  //   console.log('!!! NEW REQUESTS HISTORY - HAS CLICKED ADAVANCED OPTION');
  //   this.advancedoptionbtnRef.nativeElement.blur();
  // }

  focusOnFullText() {
    console.log('!!! NEW REQUESTS HISTORY - FOCUS ON FULL TEXT');
    this.hasFocused = true;
    // event.stopPropagation();​
  }

  search() {
    this.searchbtnRef.nativeElement.blur();
    this.searchbtnbottomRef.nativeElement.blur();

    if (this.fullText) {

      this.fullTextValue = this.fullText;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT TEXT ', this.fullText);
      this.fullTextValue = ''
    }

    if (this.selectedDeptId) {

      this.deptIdValue = this.selectedDeptId;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID ', this.deptIdValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID ', this.selectedDeptId);
      this.deptIdValue = ''
    }

    if (this.startDate) {
      console.log('!!! NEW REQUESTS HISTORY - START DATE ', this.startDate);
      console.log('!!! NEW REQUESTS HISTORY - START DATE - FORMATTED ', this.startDate['formatted']);
      console.log('!!! NEW REQUESTS HISTORY - START DATE - EPOC ', this.startDate['epoc']);
      // console.log('!!! NEW REQUESTS HISTORY - START DATE - GETS TIME ', new Date((this.startDate['jsdate'].getTime())));


      // this.startDateValue = this.startDate['epoc']
      // this.startDateValue = this.startDate['epoc'] * 1000
      this.startDateValue = this.startDate['formatted']

      // console.log('!!! NEW REQUESTS HISTORY - START DATE - TIMESTAMP ', new Date(this.startDate['formatted']).getTime());
      // this.startDateValue = this.startDate['jsdate'].getTime()
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDateValue);
    } else {
      this.startDateValue = '';
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDate);
    }

    if (this.endDate) {
      console.log('!!! NEW REQUESTS HISTORY - END DATE ', this.endDate);
      console.log('!!! NEW REQUESTS HISTORY - END DATE - FORMATTED ', this.endDate['formatted']);
      console.log('!!! NEW REQUESTS HISTORY - END DATE - EPOC ', this.endDate['epoc']);

      // this.endDateValue = this.endDate['epoc'];
      // this.endDateValue = this.endDate['epoc'] * 1000;
      this.endDateValue = this.endDate['formatted']

      // this.endDateValue = this.endDate['jsdate'].getTime()
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDateValue);
    } else {
      this.endDateValue = '';
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDate)
    }

    // console.log('!!! NEW REQUESTS HISTORY - DEPT NAME ', this.deptame);


    // if (this.fullText !== undefined && this.deptName !== undefined && this.startDate !== undefined || this.endDate !== undefined) {
    // tslint:disable-next-line:max-line-length
    this.queryString = 'full_text=' + this.fullTextValue + '&' + 'dept_id=' + this.deptIdValue + '&' + 'start_date=' + this.startDateValue + '&' + 'end_date=' + this.endDateValue
    console.log('!!! NEW REQUESTS HISTORY - QUERY STRING ', this.queryString);

    this.getRequests()

    // }

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
