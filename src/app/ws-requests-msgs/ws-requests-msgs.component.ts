import { Component, OnInit, ElementRef, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { WsMsgsService } from '../services/websocket/ws-msgs.service';

@Component({
  selector: 'appdashboard-ws-requests-msgs',
  templateUrl: './ws-requests-msgs.component.html',
  styleUrls: ['./ws-requests-msgs.component.scss']
})
export class WsRequestsMsgsComponent implements OnInit {
  id_request: string;
  messagesList: any;
  showSpinner = true;
  requester_fullname: string;
  requester_id: string;
  displayBtnScrollToBottom = 'none';

  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private wsRequestsService: WsRequestsService,
    private wsMsgsService: WsMsgsService
  ) { }

  ngOnInit() {
    this.getParamRequestId();
  }

  getParamRequestId() {
    this.id_request = this.route.snapshot.params['requestid'];
    console.log('% WsRequestsMsgsComponent - GET REQUEST-ID ', this.id_request);

    if (this.id_request) {

      this.subscribeToWs(this.id_request);
    }
  }

  subscribeToWs(id_request: string) {

    this.wsMsgsService.subscribeToWebsocket(id_request);
    this.getWsMsgs$();

  }

  getWsMsgs$() {
    this.wsMsgsService.wsMsgsList$.subscribe((wsmsgs) => {

      this.messagesList = wsmsgs;
      console.log('%%% WsRequestsMsgsComponent getWsRequests$ messagesList ', this.messagesList)
      this.showSpinner = false;

      this.scrollCardContetToBottom();

    }, error => {
      console.log('%%% WsRequestsMsgsComponent getWsRequests$ * error * ', error)
    });

  }


  scrollCardContetToBottom() {
    setTimeout(() => {
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
      console.log('ERROR ', err);
    }
  }

  



}
