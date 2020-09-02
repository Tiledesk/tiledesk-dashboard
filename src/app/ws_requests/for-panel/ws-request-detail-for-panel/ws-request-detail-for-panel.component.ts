import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { slideInOutAnimation } from '../../../_animations/index';
import { WsMsgsService } from '../../../services/websocket/ws-msgs.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../../../services/app-config.service';
import { avatarPlaceholder, getColorBck } from '../../../utils/util';

@Component({
  selector: 'appdashboard-ws-request-detail-for-panel',
  templateUrl: './ws-request-detail-for-panel.component.html',
  styleUrls: ['./ws-request-detail-for-panel.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})
export class WsRequestDetailForPanelComponent implements OnInit , OnDestroy {
  private unsubscribe$: Subject<any> = new Subject<any>();

  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  @Output() valueChange = new EventEmitter();

  @Input() selectedRequest: string;

  request: any;
  isOpenRightSidebar = true;
  messagesList: any;
  timeout: any;
  showSpinner = true;
  displayBtnScrollToBottom = 'none';

  storageBucket: string;
  requestid: string;
  requester_id: string;
  constructor(
    private wsMsgsService: WsMsgsService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.getStorageBucket();
    console.log('REQUEST-DETAIL-FOR-PANEL REQUEST ', this.selectedRequest)
    this.request = this.selectedRequest

    if (this.request) {
      this.requestid = this.request.request_id

      this.requester_id = this.request.lead.lead_id;



          if (this.request.lead && this.request.lead.fullname) {
            this.request['requester_fullname_initial'] = avatarPlaceholder( this.request.lead.fullname);
            this.request['requester_fullname_fillColour'] = getColorBck( this.request.lead.fullname)
          } else {

            this.request['requester_fullname_initial'] = 'N/A';
            this.request['requester_fullname_fillColour'] = '#6264a7';
          }
    }
    
    this.unsuscribeMessages(this.requestid);
    
    this.subscribeToWs_MsgsByRequestId(this.requestid);
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Ws-Requests-Lists ', this.storageBucket)
  }


  ngOnDestroy() {
    console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - ngOnDestroy')
    // this.subscribe.unsubscribe();
    // the two snippet bottom replace  this.subscribe.unsubscribe()
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    // this.wsRequestsService.unsubscribeTo_wsRequestById(this.id_request)
    // this.wsMsgsService.unsubsToWS_MsgsByRequestId(this.id_request)
    if (this.request._id) {
     
      this.unsuscribeMessages(this.requestid);
    }
  }

  unsuscribeMessages(idrequest) {
    this.wsMsgsService.unsubsToWS_MsgsByRequestId(idrequest);
  }


  subscribeToWs_MsgsByRequestId(id_request: string) {
    console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - subscribe To Ws Msgs ByRequestId ', id_request)
    this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);
    this.getWsMsgs$();
  }

  getWsMsgs$() {
    this.wsMsgsService.wsMsgsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsmsgs) => {
        // this.wsMsgsService._wsMsgsList.subscribe((wsmsgs) => {
        // console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - getWsMsgs$ *** wsmsgs *** ', wsmsgs)

        this.messagesList = wsmsgs;
        console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - getWsMsgs$ *** this.messagesList *** ', this.messagesList)

        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
          console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - getWsMsgs$ *** messagesList *** completed ')
          this.showSpinner = false;

          this.scrollCardContetToBottom();

        }, 200);

      }, error => {
        this.showSpinner = false;
        console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - getWsMsgs$ * error * ', error)
      }, () => {
        console.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - getWsMsgs$ *** complete *** ')
      });

  }

  // isFirstMessageOfGroup(message, i) {

  //   console.log('REQUEST-DETAIL-X-PANEL message', message)
  //   console.log('REQUEST-DETAIL-X-PANEL this.messagesList[i]', this.messagesList[i])

  //   this.messagesList[i]
  //   {
  //     return (i === 0 || this.messagesList[i - 1] && this.messagesList[i - 1].sender !== this.requester_id);
  //   }
  // }


  // isLastMessageOfGroup(message, i): boolean
  // {
  //     return (i === this.messagesList.length - 1 || this.messagesList[i + 1] && this.messagesList[i + 1].sender !== this.requester_id);
  // }


  // -------------------------------------------------------------------------
  // Scroll
  // -------------------------------------------------------------------------
  scrollCardContetToBottom() {
    setTimeout(() => {
      // CHECK THIS
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      // console.log('SCROLL CONTAINER ', initialScrollPosition)

      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      // console.log('SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);
  }

   // LISTEN TO SCROLL POSITION
   onScroll(event: any): void {
    // console.log('RICHIAMO ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    // console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    // console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    // console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    if (scrollHeighLessScrollPosition > 500) {
      this.displayBtnScrollToBottom = 'block';
    } else {
      this.displayBtnScrollToBottom = 'none';
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      // tslint:disable-next-line:max-line-length
      // console.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      console.log('%%% Ws-REQUESTS-Msgs - scrollToBottom ERROR ', err);
    }
  }










  closeRightSideBar() {
    console.log('REQUEST-DETAIL-FOR-PANEL - closeRightSideBar this.valueChange ', this.valueChange)
    // this.valueChange.next()
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        // console.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );

  }

}
