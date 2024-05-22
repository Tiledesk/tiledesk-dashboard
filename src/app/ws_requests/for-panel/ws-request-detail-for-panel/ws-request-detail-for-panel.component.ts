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
// import * as moment from 'moment';
import moment from "moment";
import { WebSocketJs } from 'app/services/websocket/websocket-js';
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

  @ViewChild('scrollMe', { static: false })
  private myScrollContainer: ElementRef;

  @Output() valueChange = new EventEmitter();
  @Input() selectedRequest: string;
  @Input() wsRequestsUnserved: any;


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
  ROLE_IS_AGENT: boolean;
  currentYear: any;
  browserLang: string;
  join_polling: any
  archive_polling: any
  MORE_INFO_ACCORDION_IS_OPENED: boolean = false;

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
    public translate: TranslateService,
    public contactsService: ContactsService,
    public logger: LoggerService,
    public webSocketJs: WebSocketJs
  ) { super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate); }

  ngOnInit() {
    this.getProfileImageStorage();
    this.getLoggedUser()
    this.logger.log('[REQUEST-DTLS-X-PANEL] SELECTED REQUEST ', this.selectedRequest)
    this.logger.log('[REQUEST-DTLS-X-PANEL] UNSERVED REQUESTS ', this.wsRequestsUnserved)
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
      this.logger.log('[REQUEST-DTLS-X-PANEL] - UNSUB-REQUEST-BY-ID - id_request ', this.requestid);
      this.logger.log('[REQUEST-DTLS-X-PANEL] - UNSUB-MSGS - id_request ', this.requestid);
      this.unsuscribeRequestById(this.requestid);
      this.unsuscribeMessages(this.requestid);
    }

    if (this.requestid) {
      this.subscribeToWs_RequestById(this.requestid);
      this.subscribeToWs_MsgsByRequestId(this.requestid);
    }

    this.onInitChatContentHeight();
    this.getTranslations();

    // chat-messages-container
    this.setPerfectScrollbar()
    this.listenToParentPostMessage();
    this.getProjectUserRole();
    this.setMomentLocale();
    this.getCurrentYear();
    this.manageMoreInfoAccordion();
  }



  getCurrentYear() {
    this.currentYear = moment().format('YYYY');
    this.logger.log('[REQUEST-DTLS-X-PANEL] - currentYear ', this.currentYear)
  }

  
  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    // console.log('[REQUEST-DTLS-X-PANEL] - setMomentLocale browserLang', this.browserLang)

    let stored_preferred_lang = undefined
    if (this.auth.user_bs && this.auth.user_bs.value) {
      stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
    }
    // const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
    let dshbrd_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      dshbrd_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      dshbrd_lang = stored_preferred_lang
    }
    moment.locale(dshbrd_lang)

    // if (this.browserLang) {
    //   if (this.browserLang === 'it') {
    //     moment.locale('it')
    //   } else {
    //     moment.locale('en')
    //   }
    // }
  }

  getProjectUserRole() {
    // const user___role =  this.usersService.project_user_role_bs.value;
    // this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 1 ', user___role);

    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[REQUEST-DTLS-X-PANEL] USER ROLE ', user_role);
        if (user_role) {

          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true;

          } else {
            this.ROLE_IS_AGENT = false;
          }
        }
      });
  }

  joinRequest(request_id: string) {
    const msg = { action: 'openJoinConversationModal', parameter: request_id, calledBy: 'ws_request_detail_for_panel' }
    window.parent.postMessage(msg, '*')
    this.logger.log('[REQUEST-DTLS-X-PANEL] JOIN-REQUEST - currentUserID ', this.currentUserID);
    // ------------------------
    // For test
    // ------------------------
    // this.onJoinHandledinWsRequestDetailForPanel(request_id, this.currentUserID)
  }

  listenToParentPostMessage() {
    window.addEventListener("message", (event) => {
      this.logger.log("[REQUEST-DTLS-X-PANEL] message event ", event);

      if (event && event.data && event.data.action && event.data.parameter && event.data.calledBy) {
        if (event.data.action === 'joinConversation' && event.data.calledBy === 'ws_request_detail_for_panel') {
          this.logger.log("[REQUEST-DTLS-X-PANEL] message event ", event.data.action);
          this.logger.log("[REQUEST-DTLS-X-PANEL] message parameter ", event.data.parameter);
          this.logger.log("[REQUEST-DTLS-X-PANEL] currentUserID ", this.currentUserID);
          this.onJoinHandledinWsRequestDetailForPanel(event.data.parameter, this.currentUserID, "postMessage");
        }
      }
    })
  }

  onJoinHandledinWsRequestDetailForPanel(id_request: string, currentUserID: string, postmessage?: string) {
    // this.getFirebaseToken(() => {
    // console.log('[WS-SHARED] - onJoinHandled postmessage ', postmessage)
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - JOIN PRESSED');
    this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - JOIN PRESSED postmessage', postmessage);
    this.logger.log('[REQUEST-DTLS-X-PANEL] JOIN waiting for service-worker to be ready - current state', this.webSocketJs.ws.readyState)
    // this.join_polling = setInterval(() => {
    //   if (this.webSocketJs.ws.readyState === 1) {
    //     if (this.webSocketJs.ws.readyState === 1) {
    //       clearInterval(this.join_polling);
    //     }
    // this.logger.log('[REQUEST-DTLS-X-PANEL] JOIN service-worker is ready ', this.webSocketJs.ws.readyState, ' - run ADD PARTCIPANT')
    this.wsRequestsService.addParticipant(id_request, currentUserID)
      .subscribe((data: any) => {

        // console.log('[WS-SHARED] - onJoinHandled data ', data)
        this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP ', data);
      }, (err) => {
        this.logger.error('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP - ERROR ', err);

      }, () => {
        this.logger.log('[REQUEST-DTLS-X-PANEL] JOIN  * COMPLETE *')
        // this.logger.log('[WS-SHARED][REQUEST-DTLS-X-PANEL][WS-REQUESTS-UNSERVED-X-PANEL][WS-REQUESTS-LIST][SERVED][UNSERVED] - addParticipant TO CHAT GROUP * COMPLETE *');
        if (postmessage === undefined) {
          this.getTranslationsDisplayInAppNotification()

        } else {

          this.getTranslationsAndPostMessage()
        }
      });
    //   }
    // }, 100);
  }

  archiveRequest(request_id) {
    // this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[REQUEST-DTLS-X-PANEL] - HAS CLICKED ARCHIVE REQUEST ');

    // console.log('[REQUEST-DTLS-X-PANEL]  ARCHIVE waiting for service-worker to be ready - current state', this.webSocketJs.ws.readyState)
    // this.archive_polling = setInterval(() => {
    // if (this.webSocketJs.ws.readyState === 1) {
    //   if (this.webSocketJs.ws.readyState === 1) {
    //     clearInterval(this.archive_polling);
    //   }
    // console.log('[REQUEST-DTLS-X-PANEL] ARCHIVE service-worker is ready ', this.webSocketJs.ws.readyState, ' - run ARCHIVE')
    this._closeSupportGroupAndCloseConvsDeatail(request_id)
    //   }
    // }, 100);

  }

  _closeSupportGroupAndCloseConvsDeatail(request_id) {
    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('[REQUEST-DTLS-X-PANEL] - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        this.logger.error('[REQUEST-DTLS-X-PANEL] - CLOSE SUPPORT GROUP - ERROR ', err);

        //  NOTIFY ERROR 
        // this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // console.log('[REQUEST-DTLS-X-PANEL] ARCHIVE  * COMPLETE *')
        this.logger.log('[REQUEST-DTLS-X-PANEL] CLOSE SUPPORT GROUP - COMPLETE');
        // this.closeRightSideBar();
        //  NOTIFY SUCCESS;
        // this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

      });
  }


  ngOnDestroy() {
    this.logger.log('[REQUEST-DTLS-X-PANEL] - ngOnDestroy')
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
    this.logger.log('[REQUEST-DTLS-X-PANEL] setPerfectScrollbar messages_container', messages_container);
    let ps = new PerfectScrollbar(messages_container, {
      suppressScrollX: true
    });
  }

  subscribeToWs_RequestById(id_request) {
    this.logger.log('[REQUEST-DTLS-X-PANEL] CALLING SUBSCRIBE TO Request-By-Id: ', id_request)
    // Start websocket subscription
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

        if (wsrequest) {
          // this.request = wsrequest;
          this.logger.log('[REQUEST-DTLS-X-PANEL] - wsrequest FROM SUBSCRIPTION ', wsrequest);
          this.IS_CURRENT_USER_JOINED = this.currentUserIdIsInParticipants(wsrequest['participants'], this.currentUserID, this.request.request_id);
          this.logger.log('[REQUEST-DTLS-X-PANEL] - wsrequest IS_CURRENT_USER_JOINED ', this.IS_CURRENT_USER_JOINED);
          this.request.currentUserIsJoined = this.IS_CURRENT_USER_JOINED
          this.REQUEST_STATUS = wsrequest['status']
          this.logger.log('[REQUEST-DTLS-X-PANEL] - wsrequest REQUEST_STATUS ', this.REQUEST_STATUS);
        }
      })
  }

  /**
   * Unsuscribe Request-by-id
   * @param idrequest 
   */
  unsuscribeRequestById(idrequest) {
    // console.log('[REQUEST-DTLS-X-PANEL] - ngOnDestroy')
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
    this.wsRequestsService.wsRequesterStatus$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((data) => {


        const user = data
        this.logger.log("[REQUEST-DTLS-X-PANEL] - getWsRequesterPresence user ", user);
        if (user && user.presence) {

          if (user.presence.status === "offline") {
            this.REQUESTER_IS_ONLINE = false;
          } else {
            this.REQUESTER_IS_ONLINE = true;
          }
        }
      }, error => {

        this.logger.error('[REQUEST-DTLS-X-PANEL] - getWsRequesterPresence - ERROR', error)
      }, () => {
        this.logger.log('[REQUEST-DTLS-X-PANEL] - getWsRequesterPresence * COMPLETE * ')
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
      // this.logger.log('[REQUEST-DTLS-X-PANEL] GET CURRENT USER ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        this.logger.log('[REQUEST-DTLS-X-PANEL] GET CURRENT USER  > currentUserID ', this.currentUserID);
      }
    });
  }
  openMoreInfoAccordion() {
    this.MORE_INFO_ACCORDION_IS_OPENED = !this.MORE_INFO_ACCORDION_IS_OPENED;
    // console.log('[REQUEST-DTLS-X-PANEL] MORE_INFO_ACCORDION_IS_OPENED',this.MORE_INFO_ACCORDION_IS_OPENED);
    this.onInitChatContentHeight()
    this.scrollCardContetToBottom();
  }

  manageMoreInfoAccordion() {
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }

  onInitChatContentHeight() {
    const windowActualHeight = window.innerHeight;
    this.logger.log('[REQUEST-DTLS-X-PANEL] - ACTUAL HEIGHT ', windowActualHeight);
    // 457
    if (!this.MORE_INFO_ACCORDION_IS_OPENED) {
      this.chat_content_height = windowActualHeight - 234//332
      this.logger.log('[REQUEST-DTLS-X-PANEL] CHAT CONTENT HEIGHT ', this.chat_content_height);
    } else {
      this.chat_content_height = windowActualHeight - 366
    }
    this.logger.log('[REQUEST-DTLS-X-PANEL] chat_content_height', this.chat_content_height);
    return { 'height': this.chat_content_height += 'px' };
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerHeight = event.target.innerHeight;
    if (!this.MORE_INFO_ACCORDION_IS_OPENED) {
      this.chat_content_height = newInnerHeight - 234//332
    } else {
      this.chat_content_height = newInnerHeight - 366
    }

    this.logger.log('[REQUEST-DTLS-X-PANEL] - ON-RESIZE NEW INNER HEIGHT ', newInnerHeight);
    this.logger.log('[REQUEST-DTLS-X-PANEL] - ON-RESIZE CHAT CONTENT HEIGHT ', this.chat_content_height);
    this.logger.log('[REQUEST-DTLS-X-PANEL] chat_content_height', this.chat_content_height);
    return { 'height': this.chat_content_height += 'px' };
  }

  getProfileImageStorage() {

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[REQUEST-DTLS-X-PANEL] IMAGE STOTAGE  ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[REQUEST-DTLS-X-PANEL] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  subscribeToWs_MsgsByRequestId(id_request: string) {
    this.logger.log('[REQUEST-DTLS-X-PANEL] subscribe To Ws Msgs ByRequestId ', id_request)
    this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);
    this.getWsMsgs$();
  }

  onImageError(message, index) {
    this.logger.log('[REQUEST-DTLS-X-PANEL] - onImageError  message ', message, 'index ', index)
    if (message.sender.includes('bot_')) {
      message['avatar_url'] = "assets/img/avatar_bot_tiledesk.svg"
    } else {
      message['avatar_url'] = "assets/img/no_image_user.png"
    }
  }

  getWsMsgs$() {
    this.wsMsgsService.wsMsgsList$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((wsmsgs) => {

        this.messagesList = wsmsgs;
        // console.log('[REQUEST-DTLS-X-PANEL] - getWsMsgs$ *** this.messagesList *** ', this.messagesList)
        let i: number
        for (i = 0; i < this.messagesList.length; i++) {

          // -----------------------------------------------------------------------
          // Important for debug
          // -----------------------------------------------------------------------
          // this.logger.log('MSG - i: ', i, ' - requester_id ', this.requester_id)
          // this.logger.log('MSG - i: ', i, ' - message.sender ', this.messagesList[i].sender)

          if (this.messagesList[i].sender === 'system') {

            // this.messagesList[i]['avatar_url'] = 'assets/img/code-24px.svg'

          } else {
            let sender_id = this.messagesList[i].sender

            if (this.messagesList[i].sender.includes('bot_')) {
              sender_id = this.messagesList[i].sender.slice(4);
              if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
                this.messagesList[i]['avatar_url'] = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + sender_id + '%2Fphoto.jpg?alt=media'
              } else {
                this.messagesList[i]['avatar_url'] = this.baseUrl + 'images?path=uploads%2Fusers%2F' + sender_id + '%2Fimages%2Fthumbnails_200_200-photo.jpg'
              }
            }
          }
        }

        if (this.timeout) {
          clearTimeout(this.timeout);
        }

        this.timeout = setTimeout(() => {
          this.logger.log('[REQUEST-DTLS-X-PANEL] - getWsMsgs$ *** messagesList *** COMPLETED ')
          this.showSpinner = false;

          this.scrollCardContetToBottom();

        }, 200);

      }, error => {
        this.showSpinner = false;
        this.logger.error('[REQUEST-DTLS-X-PANEL]  - getWsMsgs$ - ERROR ', error)
      }, () => {
        this.logger.log('[REQUEST-DTLS-X-PANEL]  - getWsMsgs$ * COMPLETE * ')
      });

  }

  isFirstMessageOfGroup(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (i === 0 || this.messagesList[i - 1] && this.messagesList[i - 1].sender !== message.sender) && message_subtype !== 'info' && message_subtype !== 'info/support';
  }

  isLastMessageOfGroup(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (i === this.messagesList.length - 1 || this.messagesList[i + 1] && this.messagesList[i + 1].sender !== message.sender) && message_subtype !== 'info' && message_subtype !== 'info/support';
  }

  isInfoMessage(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (i === this.messagesList.length - 1 || this.messagesList[i + 1]) && message_subtype === 'info' || message_subtype === 'info/support';
  }

  isFirstInfoMessage(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (i === 0 || this.messagesList[i - 1]) && message_subtype === 'info';
  }

  shouldShowContactAvatar(message, i): boolean {
    let message_subtype = ""
    if (message && message.attributes && message.attributes.subtype) {
      message_subtype = message.attributes.subtype
    }
    return (
      message.sender !== this.requester_id && message_subtype !== 'info' && ((this.messagesList[i + 1] && this.messagesList[i + 1].sender !== message.sender && message_subtype !== 'info') || !this.messagesList[i + 1])
    );
  }


  // -------------------------------------------------------------------------
  // Scroll
  // -------------------------------------------------------------------------
  scrollCardContetToBottom() {
    setTimeout(() => {
      // CHECK THIS
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      // this.logger.log('[REQUEST-DTLS-X-PANEL] - SCROLL CONTAINER ', initialScrollPosition)

      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      // this.logger.log('[REQUEST-DTLS-X-PANEL] - SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);
  }

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    // this.logger.log('[REQUEST-DTLS-X-PANEL] CALL ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    // this.logger.log('[REQUEST-DTLS-X-PANEL] ON SCROLL - SCROLL POSITION ', scrollPosition);
    // this.logger.log('[REQUEST-DTLS-X-PANEL] ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    this.logger.log('[REQUEST-DTLS-X-PANEL] ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    if (scrollHeighLessScrollPosition > 200) {
      this.displayBtnScrollToBottom = 'block';
    } else {
      this.displayBtnScrollToBottom = 'none';
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      // tslint:disable-next-line:max-line-length
      // this.logger.log('[REQUEST-DTLS-X-PANEL]  RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      this.logger.error('REQUEST-DTLS-X-PANEL - scrollToBottom ERROR ', err);
    }
  }


  closeRightSideBar() {
    this.logger.log('REQUEST-DETAIL-FOR-PANEL - closeRightSideBar this.valueChange ', this.valueChange)
    this.valueChange.emit(false);
    this.isOpenRightSidebar = false;


    [].forEach.call(
      document.querySelectorAll('footer ul li a'),
      function (el) {
        // this.logger.log('[REQUEST-DTLS-X-PANEL] footer > ul > li > a element: ', el);
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
