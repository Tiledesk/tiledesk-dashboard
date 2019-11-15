import { Component, OnInit, ElementRef, ViewChild, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { WsMsgsService } from '../services/websocket/ws-msgs.service';
import { Location } from '@angular/common';
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
  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;
  train_bot_sidebar_height: any;
  newInnerWidth: any;
  newInnerHeight: any;
  users_list_modal_height: any
  main_content_height: any

  windowWidth: any;


  @ViewChild('scrollMe')
  private myScrollContainer: ElementRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private wsRequestsService: WsRequestsService,
    private wsMsgsService: WsMsgsService,
    private _location: Location
  ) { }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    console.log('REQUEST-MSGS - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    // console.log('REQUEST-MSGS - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    // console.log('REQUEST-MSGS - ON RESIZE -> MAIN CONTENT HEIGHT', this.main_content_height);

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    if (this.newInnerWidth <= 991) {
      this.users_list_modal_height = elemMainContent.clientHeight + 70 + 'px'

      this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px'
      // console.log('REQUEST-MSGS - *** MODAL HEIGHT ***', this.users_list_modal_height);
    }


    // remove the padding on small device
    // if (this.newInnerWidth <= 768) {
    //   elemMainContent.setAttribute('style', 'padding-right: 0px; padding-left: 0px');
    // } else {
    //   elemMainContent.setAttribute('style', 'padding-right: 15px; padding-left: 15px');
    // }
  }

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

  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    console.log('»»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);


    // BUG RESOLVE inserisco questo visto che all'ampiezza in cui compare la sidebar sx non è comunque possibile scorrere
    // la pagina
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;overflow-y: hidden !important;');

    // const mainPanelScrollPosition = _elemMainPanel.scrollTop;
    // console.log('mainPanelScrollPosition ', mainPanelScrollPosition);
    // this.train_bot_sidebar_top_pos = mainPanelScrollPosition + 'px'
  }
  goBack() {
    this._location.back();

  }


}
