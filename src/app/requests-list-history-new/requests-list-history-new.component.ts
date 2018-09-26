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
  @ViewChild('#clearsearchbtn') private clearsearchbtnRef: ElementRef;


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
  pageNo = 0
  totalPagesNo_roundToUp: number;

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

  /// PAGINATION
  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('!!! NEW REQUESTS HISTORY - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    console.log('!!! NEW REQUESTS HISTORY - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
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

  // focusOnFullText() {
  //   console.log('!!! NEW REQUESTS HISTORY - FOCUS ON FULL TEXT');
  //   this.hasFocused = true;
  //   // event.stopPropagation();​
  // }

  clearFullText() {
    this.fullText = '';
    // tslint:disable-next-line:max-line-length
    this.queryString = 'full_text=' + '&' + 'dept_id=' + this.deptIdValue + '&' + 'start_date=' + this.startDateValue + '&' + 'end_date=' + this.endDateValue
    this.pageNo = 0
    this.getRequests();

  }

  clearSearch() {
    if (this.clearsearchbtnRef) {
      this.clearsearchbtnRef.nativeElement.blur();
    }

    this.fullText = '';
    this.selectedDeptId = '';
    this.startDate = '';
    this.endDate = '';
    // this.fullTextValue = '';
    // this.deptIdValue = '';
    // this.startDateValue = '';
    // this.endDateValue = '';
    // tslint:disable-next-line:max-line-length
    this.queryString = 'full_text=' + '&' + 'dept_id=' + '&' + 'start_date=' + '&' + 'end_date=';
    this.pageNo = 0;
    console.log('!!! NEW REQUESTS HISTORY - CLEAR SEARCH fullTextValue ', this.fullTextValue)
    // if (this.fullTextValue === '') {

    // }
    setTimeout(() => {
      this.getRequests();
    }, 100);
  }

  search() {
    this.pageNo = 0
    this.searchbtnRef.nativeElement.blur();
    if (this.searchbtnbottomRef) {
      this.searchbtnbottomRef.nativeElement.blur();
    }

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
    this.requestsService.getNodeJsRequests(this.queryString, this.pageNo).subscribe((requests: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS ', requests['requests']);
      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', requests['count']);
      if (requests) {


        const requestsCount = 21; // for test
        // const requestsCount = requests['count'];
        console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT TEST ', requestsCount);

        const totalPagesNo = requestsCount / 5
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES No', totalPagesNo);

        this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

        this.requestList = requests['requests'];
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
