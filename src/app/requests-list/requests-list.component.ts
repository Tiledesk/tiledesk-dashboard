import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  requestList: Request[];
  showSpinner = true;

  messagesList: Message[];

  display = 'none';

  requestRecipient: string;

  constructor(
    private requestsService: RequestsService,
    private elRef: ElementRef,
  ) { }

  ngOnInit() {
    this.getRequestList();
  }

  // ngAfterViewInit() {
  //   // this.elRef.nativeElement.querySelector('.modal');
  //   console.log('MM ', this.elRef.nativeElement.querySelector('.modal').animate({ scrollTop: 0 }, 'slow') );
  // }
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
    // .animate({ scrollTop: 0, duration: 100 })

    const objDiv = document.getElementById('scrollMe');
    // const objDiv =  this.elRef.nativeElement.querySelector('.modal');
    console.log('objDiv ::', objDiv);
    if (objDiv) {
      console.log('scrollTop1 ::', objDiv.scrollTop, objDiv.scrollHeight);
    }


  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log('ERROR ', err);
     }
  }

  bottomFunction() {
    const objDiv = document.getElementById('scrollMe');
    console.log('objDiv ::', objDiv);
    if (objDiv) {
      objDiv.scrollIntoView(false);
      // objDiv.scrollToBottom()
    }
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
