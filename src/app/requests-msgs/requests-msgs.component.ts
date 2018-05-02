import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../models/message-model';
import { RequestsService } from '../services/requests.service';

@Component({
  selector: 'app-requests-msgs',
  templateUrl: './requests-msgs.component.html',
  styleUrls: ['./requests-msgs.component.scss']
})
export class RequestsMsgsComponent implements OnInit {

  id_request: string;
  messagesList: Message[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestsService: RequestsService
  ) { }

  ngOnInit() {

    this.getRequestId();
  }

  getRequestId() {
    this.id_request = this.route.snapshot.params['requestid'];
    console.log('REQUESTS-LIST COMP HAS PASSED REQUEST-ID ', this.id_request);

    if (this.id_request) {
      this.getMessagesList();
    }
  }

  /**
   * REQUEST' MESSAGES (on FIRESTORE the COLLECTION is 'MESSAGES')
   */
  getMessagesList() {
    // SUBSCIPTION TO snapshotChanges
    this.requestsService.getSnapshotMsg(this.id_request)
      .subscribe((data) => {
        this.messagesList = data;
        console.log('REQUESTS-MSGS.COMP: SUBSCRIPTION TO getSnapshot MSG ', data);
        // this.showSpinner = false;
        // console.log('TIMESTAMP ', this.messagesList);
        // if (data.length) {
        // this.scrollToBottom();
        // }
      },
        (err) => {
          console.log('GET MESSAGES LIST ERROR ', err);
        },
        () => {
          console.log('GET MESSAGES LIST * COMPLETE *');
          // this.showSpinner = false;
        });

  }



  cut_support_group_from_request_id(request_id: string) {
    if (request_id) {
      return request_id.replace('support-group-', '');
    }
  }
}
