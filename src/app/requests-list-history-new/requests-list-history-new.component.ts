import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'appdashboard-requests-list-history-new',
  templateUrl: './requests-list-history-new.component.html',
  styleUrls: ['./requests-list-history-new.component.scss']
})


export class RequestsListHistoryNewComponent implements OnInit {

  requestList: Request[];
  projectId: string;
  showSpinner = true;

  constructor(
    private requestsService: RequestsService,
    private router: Router,
    public auth: AuthService
  ) { }

  ngOnInit() {

    this.getRequests();
    this.getCurrentProject();
  }

  getRequests() {
    this.requestsService.getNodeJsRequests().subscribe((requests: any) => {
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
