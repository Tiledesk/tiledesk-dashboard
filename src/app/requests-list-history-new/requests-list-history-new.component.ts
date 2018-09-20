import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
@Component({
  selector: 'appdashboard-requests-list-history-new',
  templateUrl: './requests-list-history-new.component.html',
  styleUrls: ['./requests-list-history-new.component.scss']
})
export class RequestsListHistoryNewComponent implements OnInit {

  constructor(
    private requestsService: RequestsService
  ) { }

  ngOnInit() {

    this.getRequests();
  }

  getRequests() {
    this.requestsService.getNodeJsRequests().subscribe((requests: any) => {
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS ', requests);


    }, error => {

      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS - ERROR: ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS * COMPLETE *')
    });
  }

}
