import { Component, OnInit, EventEmitter, Output, Input, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { slideInOutForPanelAnimation } from '../../../_animations/index';
import { WsMsgsService } from '../../../services/websocket/ws-msgs.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppConfigService } from '../../../services/app-config.service';
import { avatarPlaceholder, getColorBck } from '../../../utils/util';
import { AuthService } from '../../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { WsSharedComponent } from '../../ws-shared/ws-shared.component';

import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { Router } from '@angular/router';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { FaqKbService } from '../../../services/faq-kb.service';
import { UsersService } from '../../../services/users.service';
import { NotifyService } from '../../../core/notify.service';

import PerfectScrollbar from 'perfect-scrollbar';
import { ContactsService } from '../../../services/contacts.service';
import { LoggerService } from '../../../services/logger/logger.service';

@Component({
  selector: 'appdashboard-ws-request-detail-for-panel',
  templateUrl: './ws-request-detail-for-panel.component.html',
  styleUrls: ['./ws-request-detail-for-panel.component.scss'],
  animations: [slideInOutForPanelAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutForPanelAnimation]': '' }
})
export class WsRequestDetailForPanelComponent extends WsSharedComponent implements OnInit, OnDestroy {
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
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  requestid: string;
  requester_id: string;
  chat_content_height: any;
  currentUserID: string;

  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;
  REQUESTER_IS_ONLINE = false;
  IS_CURRENT_USER_JOINED: boolean;
  REQUEST_STATUS: number;

  constructor(
    private wsMsgsService: WsMsgsService,
    public appConfigService: AppConfigService,
    public botLocalDbService: BotLocalDbService,
    public usersLocalDbService: LocalDbService,
    public router: Router,
    public wsRequestsService: WsRequestsService,
    public faqKbService: FaqKbService,
    public usersService: UsersService,
    public notify: NotifyService,
    public auth: AuthService,
    private translate: TranslateService,
    public contactsService: ContactsService,
    public logger: LoggerService
  ) { super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger); }

  ngOnInit() {
    this.getProfileImageStorage();
    this.getLoggedUser()
    this.logger.log('REQUEST-DTLS-X-PANEL REQUEST ', this.selectedRequest)
    this.request = this.selectedRequest

    if (this.request) {
      this.requestid = this.request.request_id

      this.requester_id = this.request.lead.lead_id;

      this.getRequesterAvailabilityStatus(this.requester_id);

      if (this.request.lead && this.request.lead.fullname) {
        this.request['requester_fullname_initial'] = avatarPlaceholder(this.request.lead.fullname);
        this.request['requester_fullname_fillColour'] = getColorBck(this.request.lead.fullname)
      } else {

        this.request['requester_fullname_initial'] = 'N/A';
        this.request['requester_fullname_fillColour'] = '#6264a7';
      }
    }

    if (this.requestid) {
      this.logger.log('REQUEST-DTLS-X-PANEL- UNSUB-REQUEST-BY-ID - id_request ', this.requestid);
      this.logger.log('REQUEST-DTLS-X-PANEL- UNSUB-MSGS - id_request ', this.requestid);
      this.unsuscribeRequestById(this.requestid);
      this.unsuscribeMessages(this.requestid);
    }

    if (this.requestid) {
      this.subscribeToWs_RequestById(this.requestid);
      this.subscribeToWs_MsgsByRequestId(this.requestid);
    }

    this.onInitUsersListModalHeight();
    this.getTranslations();

    // chat-messages-container
    this.setPerfectScrollbar()
  }

  ngOnDestroy() {
    this.logger.log('REQUEST-DTLS-X-PANEL - ngOnDestroy')
    // this.subscribe.unsubscribe();
    // the two snippet bottom replace  this.subscribe.unsubscribe()
    this.unsubscribe$.next();
    this.unsubscribe$.complete();

    this.unsuscribeRequesterPresence(this.requester_id)

    // this.wsRequestsService.unsubscribeTo_wsRequestById(this.id_request)
    // this.wsMsgsService.unsubsToWS_MsgsByRequestId(this.id_request)
    if (this.request._id) {
      this.unsuscribeRequestById(this.requestid);
      this.unsuscribeMessages(this.requestid);
    }
  }

  unsuscribeRequesterPresence(requester_id) {
    // this.contactsService.unsubscribeToWS_RequesterPresence(requester_id);
    this.wsRequestsService.unsubscribeToWS_RequesterPresence(requester_id);
  }


  setPerfectScrollbar() {
    const messages_container = <HTMLElement>document.querySelector('.chat-messages-container');
    this.logger.log('REQUEST-DTLS-X-PANEL messages_container', messages_container);
    let ps = new PerfectScrollbar(messages_container, {
      suppressScrollX: true
    });
  }

  subscribeToWs_RequestById(id_request) {
    this.logger.log('% »»» WebSocketJs WF >>> ws-msgs--- comp »»»»»»»»»» CALLING SUBSCRIBE Request-By-Id: ', id_request)
    // Start websocket subscription
    // NOTE_nk: comment  this.wsRequestsService.subscribeTo_wsRequestById(id_request)
    this.wsRequestsService.subscribeTo_wsRequestById(id_request);
    // Get request
    this.getWsRequestById$();
  }

  getWsRequestById$() {
    // this.subscribe = 
    this.wsRequestsService.wsRequest$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsrequest) => {

        // this.logger.log('% !!!!!!!!!!!! Ws-REQUESTS-Msgs - getWsRequestById$ *** wsrequest *** ', wsrequest)
        // this.request = wsrequest;

        if (wsrequest) {
          this.logger.log('REQUEST-DTLS-X-PANEL - wsrequest FROM SUBSCRIPTION ', wsrequest);
          this.IS_CURRENT_USER_JOINED = this.currentUserIdIsInParticipants(wsrequest['participants'], this.currentUserID, this.request.request_id);
          this.logger.log('REQUEST-DTLS-X-PANEL - wsrequest IS_CURRENT_USER_JOINED ', this.IS_CURRENT_USER_JOINED);

          this.REQUEST_STATUS = wsrequest['status']
        }
      })
  }

  /**
   * Unsuscribe Request-by-id
   * @param idrequest 
   */
  unsuscribeRequestById(idrequest) {
    this.wsRequestsService.unsubscribeTo_wsRequestById(idrequest);
  }

  unsuscribeMessages(idrequest) {
    this.wsMsgsService.unsubsToWS_MsgsByRequestId(idrequest);
  }


  getRequesterAvailabilityStatus(requester_id: string) {
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/LmBT2IKjMzeZ3wqyU8up8KIRB6J3/connections`

    // -----------------------------------------------------------------------------------------
    // No more used - replaced by Get Lead presence from websocket
    // -----------------------------------------------------------------------------------------
    // const firebaseRealtimeDbUrl = `/apps/tilechat/presence/` + requester_id + `/connections`
    // const connectionsRef = firebase.database().ref().child(firebaseRealtimeDbUrl);
    // this.logger.log('REQUEST-DTLS-X-PANEL »» REQUEST DETAILS - CALLING REQUESTER AVAILABILITY VALUE ');

    // connectionsRef.on('value', (child) => {
    //   if (child.val()) {
    //     this.REQUESTER_IS_ONLINE = true;
    //     this.logger.log('REQUEST-DTLS-X-PANEL »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
    //   } else {
    //     this.REQUESTER_IS_ONLINE = false;

    //     this.logger.log('REQUEST-DTLS-X-PANEL »»» REQUEST DETAILS - REQUESTER is ONLINE ', this.REQUESTER_IS_ONLINE);
    //   }
    // })

    // -----------------------------------------------------------------------------------------
    // New - Get Lead presence from websocket subscription (replace firebaseRealtimeDb)
    // -----------------------------------------------------------------------------------------
    // this.contactsService.subscribeToWS_RequesterPresence(requester_id);
    this.wsRequestsService.subscribeToWS_RequesterPresence(requester_id);

    this.getWsRequesterPresence();

  }

  getWsRequesterPresence() {
    // this.contactsService.wsRequesterStatus$
    this.wsRequestsService.wsRequesterStatus$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {


        const user = data
        this.logger.log("wsRequesterPresence (ws-requests-dtl-for-panel) - getWsRequesterPresence user ", user);
        if (user && user.presence) {

          if (user.presence.status === "offline") {
            this.REQUESTER_IS_ONLINE = false;
          } else {
            this.REQUESTER_IS_ONLINE = true;
          }
        }
      }, error => {

        this.logger.error('wsRequesterPresence (ws-requests-dtl-for-panel) - getWsRequesterPresence user * error * ', error)
      }, () => {
        this.logger.log('wsRequesterPresence (ws-requests-dtl-for-panel) - getWsRequesterPresence user *** complete *** ')
      });
  }




  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();

  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('REQUEST-DTLS-X-PANEL  USER ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        this.logger.log('REQUEST-DTLS-X-PANELD currentUserID ', this.currentUserID);
      }
    });
  }

  joinRequest(request_id: string) {
    this.logger.log('REQUEST-DTLS-X-PANEL currentUserID ', this.currentUserID);
    this.currentUserID
    this.onJoinHandled(request_id, this.currentUserID);
  }

  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('REQUEST-DTLS-X-PANEL - HAS CLICKED ARCHIVE REQUEST ');


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('REQUEST-DTLS-X-PANEL - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        this.logger.error('REQUEST-DTLS-X-PANEL - CLOSE SUPPORT GROUP - ERROR ', err);


        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        this.logger.log('REQUEST-DTLS-X-PANEL CLOSE SUPPORT GROUP - COMPLETE');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

        // this.onArchiveRequestCompleted()
      });
  }

  onInitUsersListModalHeight() {
    const windowActualHeight = window.innerHeight;
    this.logger.log('REQUEST-DTLS-X-PANEL - ACTUAL HEIGHT ', windowActualHeight);

    this.chat_content_height = windowActualHeight - 457
    this.logger.log('REQUEST-DTLS-X-PANEL CHAT CONTENT HEIGHT ', this.chat_content_height);

    return { 'height': this.chat_content_height += 'px' };
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // this.newInnerWidth = event.target.innerWidth;
    const newInnerHeight = event.target.innerHeight;
    this.chat_content_height = newInnerHeight - 457

    // this.logger.log('REQUEST-DTLS-X-PANEL - NEW INNER HEIGHT ', newInnerHeight);
    // this.logger.log('REQUEST-DTLS-X-PANEL - ON RESIZE CHAT CONTENT HEIGHT ', this.chat_content_height);

    return { 'height': this.chat_content_height += 'px' };

  }

  getProfileImageStorage() {

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('REQUEST-DTLS-X-PANEL IMAGE STOTAGE  ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('REQUEST-DTLS-X-PANEL IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }

  }





  subscribeToWs_MsgsByRequestId(id_request: string) {
    this.logger.log('REQUEST-DTLS-X-PANEL subscribe To Ws Msgs ByRequestId ', id_request)
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
        // this.logger.log('% »»» WebSocketJs WF >>> ws-msgs--- comp - getWsMsgs$ *** wsmsgs *** ', wsmsgs)

        this.messagesList = wsmsgs;
        this.logger.log('REQUEST-DTLS-X-PANEL - getWsMsgs$ *** this.messagesList *** ', this.messagesList)


        // let sender_in_next_msg: string
        // let sender_in_prev_msg: string
        // let sender_in_curr_msg: string
        let i: number
        for (i = 0; i < this.messagesList.length; i++) {
          this.logger.log('MSG - i: ', i, ' - requester_id ', this.requester_id)
          this.logger.log('MSG - i: ', i, ' - message.sender ', this.messagesList[i].sender)

          if (this.messagesList[i].sender === 'system') {

            this.messagesList[i]['avatar_url'] = 'assets/img/code-24px.svg'

          } else {

            if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
              this.messagesList[i]['avatar_url'] = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.messagesList[i].sender + '%2Fphoto.jpg?alt=media'
            } else {
              this.messagesList[i]['avatar_url'] = this.baseUrl + 'images?path=uploads%2Fusers%2F' + this.messagesList[i].sender + '%2Fimages%2Fthumbnails_200_200-photo.jpg'
            }
          }

          // sender_in_curr_msg = this.messagesList[i].sender
          // if (i === 0 || this.messagesList[i - 1] && this.messagesList[i - 1].sender !== sender_in_curr_msg) {
          //   this.messagesList[i]['isFirstMsgOfGroup'] = true;
          // }
          // if (i === this.messagesList.length - 1 || this.messagesList[i + 1] && this.messagesList[i + 1].sender !== sender_in_curr_msg) {
          //   this.messagesList[i]['isLastMsgOfGroup'] = true;
          // }
          // if (this.messagesList[i + 1]) {
          //   this.logger.log('MSG - i: ', i, ' -messagesList[i+1]?.sender ', this.messagesList[i + 1].sender)
          //   sender_in_next_msg = this.messagesList[i + 1].sender
          // }
          // if (this.messagesList[i - 1]) {
          //   this.logger.log('MSG - i: ', i, ' - messagesList[i-1]?.sender ', this.messagesList[i - 1].sender)
          //   sender_in_prev_msg = this.messagesList[i - 1].sender
          // }
        }

        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
          this.logger.log('REQUEST-DTLS-X-PANEL - getWsMsgs$ *** messagesList *** completed ')
          this.showSpinner = false;

          this.scrollCardContetToBottom();

        }, 200);

      }, error => {
        this.showSpinner = false;
        this.logger.error('REQUEST-DTLS-X-PANEL - getWsMsgs$ * error * ', error)
      }, () => {
        this.logger.log('REQUEST-DTLS-X-PANEL - getWsMsgs$ *** complete *** ')
      });

  }

  isFirstMessageOfGroup(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (i === 0 || this.messagesList[i - 1] && this.messagesList[i - 1].sender !== message.sender) && message_subtype !== 'info';
  }

  isLastMessageOfGroup(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (i === this.messagesList.length - 1 || this.messagesList[i + 1] && this.messagesList[i + 1].sender !== message.sender) && message_subtype !== 'info';
  }

  shouldShowContactAvatar(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (
      message.sender !== this.requester_id && ((this.messagesList[i + 1] && this.messagesList[i + 1].sender !== message.sender && message_subtype !== 'info') || !this.messagesList[i + 1])
    );
  }


  // -------------------------------------------------------------------------
  // Scroll
  // -------------------------------------------------------------------------
  scrollCardContetToBottom() {
    setTimeout(() => {
      // CHECK THIS
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      // this.logger.log('SCROLL CONTAINER ', initialScrollPosition)

      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      // this.logger.log('SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);
  }

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    // this.logger.log('RICHIAMO ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    // this.logger.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    // this.logger.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    // this.logger.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
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
      // this.logger.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      this.logger.error('REQUEST-DTLS-X-PANEL - scrollToBottom ERROR ', err);
    }
  }


  closeRightSideBar() {
    this.logger.log('REQUEST-DETAIL-FOR-PANEL - closeRightSideBar this.valueChange ', this.valueChange)
    // this.valueChange.next()
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        // this.logger.log('footer > ul > li > a element: ', el);
        el.setAttribute('style', 'text-transform: none');
      }
    );

  }


  // TRANSLATION
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {
        this.archivingRequestNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }

}
