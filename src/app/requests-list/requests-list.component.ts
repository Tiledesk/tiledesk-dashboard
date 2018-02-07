// tslint:disable:max-line-length
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Message } from '../models/message-model';
// import { error } from 'util';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';


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

  // SCROLL TO BOTTON AND SCROLL POSITION
  displayBtnScrollToBottom = 'none';
  initialScrollPosition: number;
  initialMsgsArrayLength: number;

  // initScrollPositionHalf: number;
  // initScrollPositionPlusTwoScroll: number;

  requestRecipient: string;

  constructor(
    private requestsService: RequestsService,
    private elRef: ElementRef,

  ) {  }

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
    this.msgLenght();
    // SCROOL TO BOTTOM THE MESSAGES LIST WHEN THE MODAL IS OPEN
    setTimeout(() => {
      this.scrollToBottom();
    }, 300);

    /**
     *  *** SCROLL TOP - SCROLL HEIGHT - VISIBLE CONTENT HEIGHT ***
     * scrollTop - sets or return the vertical scrollbar position
     * scrollHeight - read-only property is a measurement of the height of an element content, including content not visible due to overflow
     * height of visible content is set to 250px in the view
     */
    // SET IN A VARIABLE THE INITIAL SCROLL POSITION (FORCED TO BOTTOM OF THE VISIBLE CONTENT AREA WITH THE PREVIOUS scrollToBottom())
    // WHEN THE USER MOVE UPWARDS THE SCROLLBAR THE SCROLL POSITION VALUE DECREASES UP TO 0
    setTimeout(() => {
      this.initialScrollPosition = this.myScrollContainer.nativeElement.scrollTop;
      console.log('SCROLL POSITION WHEN MODAL IS OPEN (INITIAL SCROLL POSITION) ', this.initialScrollPosition);
      // console.log(' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
      // console.log(' SCROLL TOP (ALIAS SCROLL POSITION) )', this.myScrollContainer.nativeElement.scrollTop);
      // this.initScrollPositionHalf = this.myScrollContainer.nativeElement.scrollTop / 2;
      // console.log('SCROLL POSITION / 2 WHEN MODAL IS OPEN ', this.initScrollPositionHalf);
      // this.initScrollPositionPlusTwoScroll = this.myScrollContainer.nativeElement.scrollTop + 320;
      // console.log('SCROLL POSITION / 2 WHEN MODAL IS OPEN ', this.initScrollPositionHalf);

    }, 300);

  }

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    /* scrollHeighLessScrollPosition */
    // IS EQUAL TO 250 (HEIGHT OF THE VISIBLE AREA) WHEN THE SCROLLBAR IS AT THE BOTTOM
    // IS EQUAL TO SCROLL HEIGHT (VISIBLE AREA + OVERFLOW) WHEN THE SCROLLBAR IS AT THE TOP
    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    // console.log('ON SCROLL - SCROLL POSITION / 2 WHEN MODAL IS OPEN ', this.initScrollPositionHalf);

    // const scrollPositionHalf = this.myScrollContainer.nativeElement.scrollTop / 2;
    // console.log('ON SCROLL - SCROLL POSITION HALF ', scrollPositionHalf);

    const currentScrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    // scrollDifference ASSUME THAT initScrollPosition IS CALCULATE WITH THE SCROLLBAR FORCED TO BOTTOM
    const scrollDifference = this.initialScrollPosition - currentScrollPosition;
    console.log('SCROLL DIFFERENCE (INIT SCROLL POSITION - CURRENT SCROLL POSITION)', scrollDifference);

    // 320 IS +/- THE HEIGHT CONSUMED WITH TWO SCROLL
    if (scrollDifference >= 320) {
      this.displayBtnScrollToBottom = 'block';
    }
    if (scrollHeighLessScrollPosition === 250 || scrollDifference <= 320) {
      this.displayBtnScrollToBottom = 'none';
    }
    console.log('ON SCROLL - initial MSGS ARRAY LENGTH ', this.initialMsgsArrayLength);

  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      console.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      console.log('ERROR ', err);
    }
  }

  // bottomFunction() {
  //   const objDiv = document.getElementById('scrollMe');
  //   console.log('objDiv ::', objDiv);
  //   if (objDiv) {
  //     objDiv.scrollIntoView(false);
  //     // objDiv.scrollToBottom()
  //   }
  // }

 msgLenght() {
   this.requestsService.getSnapshotMsg(this.requestRecipient)
      .subscribe((data) => {
      this.initialMsgsArrayLength = data.length;
      console.log('WHEN OPEN MODAL MSGS ARRAY LENGHT (FIXED) ', this.initialMsgsArrayLength );

    });

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
