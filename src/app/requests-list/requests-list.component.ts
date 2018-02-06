import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Message } from '../models/message-model';
// import { error } from 'util';
import { Observable } from 'rxjs/Observable';



@Component({
  selector: 'requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})
export class RequestsListComponent implements OnInit {

  requestList: Request[];
  showSpinner = true;

  messagesList: Message[];

  display = 'none';

  requestRecipient: string;

  constructor(
    private requestsService: RequestsService,
  ) { }

  ngOnInit() {

    this.getRequestList();
  }

  getRequestList() {
    // SUBSCIPTION TO snapshotChanges
    this.requestsService.getSnapshot().subscribe((data) => {
      this.requestList = data;
      console.log('REQUESTS-LIST.COMP: SUBSCRIPTION TO REQUESTS getSnapshot ', data);
      this.showSpinner = false;
    },
      (err) => {

        console.log('GET REQUEST LIST ERROR ', err);

      },
      () => {
        console.log('GET REQUEST LIST * COMPLETE *');
        // this.showSpinner = false;
      });

  }

  openViewMsgsModal(recipient: string) {
    this.display = 'block';
    console.log(' ++ ++ request recipient ', recipient);
    this.requestRecipient = recipient;
    this.getMessagesList();
  }

  getMessagesList() {
    // SUBSCIPTION TO snapshotChanges
    this.requestsService.getSnapshotMsg(this.requestRecipient).subscribe((data) => {
      this.messagesList = data;
      console.log('REQUESTS-LIST.COMP: SUBSCRIPTION TO getSnapshot MSG ', data);
      // this.showSpinner = false;
      // console.log('TIMESTAMP ', this.messagesList);
    },
      (err) => {

        console.log('GET MESSAGE LIST ERROR ', err);

      },
      () => {
        console.log('GET MESSAGE LIST * COMPLETE *');
        // this.showSpinner = false;
      });

  }

  // CLOSE MODAL
  onCloseModal() {
    this.display = 'none';
  }

  onJoinHandled() {
    console.log('JOIN PRESSED');
  }
}
