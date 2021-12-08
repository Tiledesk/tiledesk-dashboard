import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { AuthService } from '../../../core/auth.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../../../services/app-config.service';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { UsersService } from '../../../services/users.service';
import { browserRefresh } from '../../../app.component';
import { FaqKbService } from '../../../services/faq-kb.service';
import { Request } from '../../../models/request-model';
import { DepartmentService } from '../../../services/department.service';
import { NotifyService } from '../../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../../services/logger/logger.service';

const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-ws-requests-served',
  templateUrl: './ws-requests-served.component.html',
  styleUrls: ['./ws-requests-served.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class WsRequestsServedComponent extends WsSharedComponent implements OnInit, OnChanges, OnDestroy {

  @Input() wsRequestsServed: Request[];
  @Input() ws_requests_length: number

  CHAT_BASE_URL: string;
  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  projectId: string;
  id_request_to_archive: string;
  displayArchiveRequestModal: string;
  showSpinner = true;
  currentUserID: string;
  totalOf_servedRequests: number;
  ROLE_IS_AGENT: boolean;
  USER_ROLE: string;
  timeout: any;
  projectUsersArray: any;
  depts: any;

  private unsubscribe$: Subject<any> = new Subject<any>();
  public browserRefresh: boolean;
  displayNoRequestString = false;

  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;
  youAreAboutToJoinMsg: string;
  warningMsg: string;
  cancelMsg: string;
  joinToChatMsg: string
  areYouSureMsg: string
  isMobile: boolean;
  FIREBASE_AUTH: boolean;
  /**
   * Constructor
   * @param botLocalDbService 
   * @param auth 
   * @param usersLocalDbService 
   * @param router 
   * @param appConfigService 
   * @param wsRequestsService 
   * @param usersService 
   * @param faqKbService 
   * @param departmentService 
   * @param notify 
   * @param translate 
   * @param logger 
   */
  constructor(
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public usersLocalDbService: LocalDbService,
    public router: Router,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    private departmentService: DepartmentService,
    public notify: NotifyService,
    public translate: TranslateService,
    public logger: LoggerService
  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);
  }

  // -------------------------------------------------------------
  // @ Lifehooks
  // -------------------------------------------------------------
  ngOnInit() {
    this.getProfileImageStorageAndChatBaseUrl();
    this.getCurrentProject();
    this.getDepartments();
    this.getLoggedUser();
    this.detectBrowserRefresh();
    this.getTranslations();
    this.getProjectUserRole();
    this.detectMobile();
    this.getFirebaseAuth();
  }

  ngOnChanges() {
    this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges wsRequestsServed', this.wsRequestsServed)
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getFirebaseAuth() {
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.FIREBASE_AUTH = true;
      this.logger.log('[HISTORY & NORT-CONVS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    } else if (this.appConfigService.getConfig().firebaseAuth === false) {
      this.FIREBASE_AUTH = false;
      this.logger.log('[HISTORY & NORT-CONVS] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    }
  }

  // -------------------------------------------------------------
  // @ Get profile image storage and chat base url
  // -------------------------------------------------------------
  getProfileImageStorageAndChatBaseUrl() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];

      this.logger.log('[WS-REQUESTS-LIST][SERVED] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[WS-REQUESTS-LIST][SERVED] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
    // this.checkImage(this.wsRequestsServed)

    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
  }

  // -------------------------------------------------------------
  // @ Subscribe to project user role
  // -------------------------------------------------------------
  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] GET PROJECT-USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role;
          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true
          } else {
            this.ROLE_IS_AGENT = false
          }
        }
      });
  }

  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();
    this.translateYouAreAboutToJoin();
    this.translateWarning();
    this.translateCancel();
    this.translateJoinToChat();
    this.translateAreYouSure();
  }


  // --------------------------------------------------
  // @ Get depts
  // --------------------------------------------------
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[WS-REQUESTS-LIST][SERVED] GET DEPTS - RES', _departments);
      this.depts = _departments;

    }, error => {
      this.logger.error('[WS-REQUESTS-LIST][SERVED] GET DEPTS - RES - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST][SERVED] GET DEPTS - RES * COMPLETE *')
    });
  }


  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";

  }

  // --------------------------------------------------
  // @ Tags - display less tags
  // --------------------------------------------------
  displayLessTag(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayLessTag - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - displayLessTag - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";
  }


  // --------------------------------------------------
  // @ Detect browser refresh
  // --------------------------------------------------
  detectBrowserRefresh() {
    this.browserRefresh = browserRefresh;
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - ngOnInit DETECT browserRefresh ", this.browserRefresh);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - ngOnInit DETECT browserRefresh wsRequestsList$.value.length ", this.wsRequestsService.wsRequestsList$.value.length);
    if (this.wsRequestsServed.length === 0 && browserRefresh === false) {
      this.displayNoRequestString = true;
    }
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        // this.logger.log('[WS-REQUESTS-LIST][SERVED] GET CURRENT USER - USER ', user)
        if (user) {
          this.currentUserID = user._id
          this.logger.log('[WS-REQUESTS-LIST][SERVED] GET CURRENT USER - currentUser ID', this.currentUserID);
        }
      });
  }

  // IS USED WHEN IS GET A NEW MESSAGE (IN THIS CASE THE ONINIT IS NOT CALLED)
  getWsRequestsServedLength() {
    if (this.ws_requests_length > 0) {
      this.showSpinner = false;
    }
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - GET WS REQUESTS SERVED LENGTH ', this.ws_requests_length)
  }


  // --------------------------------------------------
  // @ Subscribe to current project
  // --------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        // this.logger.log('[WS-REQUESTS-LIST][SERVED] - project', project)
        if (project) {
          this.projectId = project._id;
          this.logger.log('[WS-REQUESTS-LIST][SERVED] - GET CURRENT PROJECT - PROJECT ID ', this.projectId)
        }
      });
  }


  // SERVED_BY : add this
  // goToMemberProfile(member_id: any) {
  //   this.logger.log('[WS-REQUESTS-LIST][SERVED] has clicked GO To MEMBER ', member_id);
  //   if (member_id.indexOf('bot_') !== -1) {
  //     this.logger.log('[WS-REQUESTS-LIST][SERVED] IS A BOT !');

  //     const bot_id = member_id.slice(4);
  //     const bot = this.botLocalDbService.getBotFromStorage(bot_id);

  //     let botType = ''
  //     if (bot.type === 'internal') {
  //       botType = 'native'
  //     } else {
  //       botType = bot.type
  //     }
  //     // this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
  //     this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);

  //   } else {
  //     this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  //   }
  // }



  goToBotProfile(bot_id, bot_type) {
    let botType = ''
    if (bot_type === 'internal') {
      botType = 'native'
    } else {
      botType = bot_type
    }

    if (this.ROLE_IS_AGENT === false) {
      this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);
    }
  }


  goToAgentProfile(member_id) {
    this.logger.log('[WS-REQUESTS-LIST][SERVED]  goToAgentProfile ', member_id)

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }

  // SERVED_BY: add this if not exist -->
  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] GET PROJECT-USER-BY-USER-ID & GO TO EDIT PROJECT-USER - projectUser ', projectUser)
        if (projectUser) {
          this.logger.log('[WS-REQUESTS-LIST][SERVED] GET PROJECT-USER-BY-USER-ID & GO TO EDIT PROJECT-USER - projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        this.logger.error('[WS-REQUESTS-LIST][SERVED] GET PROJECT-USER-BY-USER-ID & GO TO EDIT PROJECT-USER - ERROR ', error);
      }, () => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] GET PROJECT-USER-BY-USER-ID & GO TO EDIT PROJECT-USER * COMPLETE *');
      });
  }


  goToRequestMsgs(request_id: string) {
    this.logger.log("[WS-REQUESTS-LIST][SERVED] GO TO REQUEST MSGS ")
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }

  // goToWsRequestsNoRealtimeServed() {
  //   this.logger.log("[WS-REQUESTS-LIST][SERVED] GO TO REQUEST MSGS ")
  //   this.router.navigate(['project/' + this.projectId + '/wsrequests-all/' + '200']);
  // }

  // ------------------------------------------------------
  // open / close MODAL ARCHIVE A REQUEST ! NO MORE USED 
  // ------------------------------------------------------

  // openDeleteRequestModal(request_recipient: string) {
  //   this.logger.log('WsRequestsServedComponent ID OF REQUEST TO ARCHIVE ', request_recipient)
  //   this.id_request_to_archive = request_recipient;
  //   this.displayArchiveRequestModal = 'block'
  // }

  // onCloseArchiveRequestModal() {
  //   this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- served onCloseArchiveRequestModal ', this.displayArchiveRequestModal)
  //   this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- served onCloseArchiveRequestModal this.wsRequestsServed length', this.wsRequestsServed.length)
  //   this.displayArchiveRequestModal = 'none'
  // }

  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - HAS CLICKED ARCHIVE REQUEST (CLOSE SUPPORT GROUP)');


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - ERROR ', err);


        //  NOTIFY ERROR 
        this.notify.showWidgetStyleUpdateNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - COMPLETE');

        //  NOTIFY SUCCESS
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

      });
  }

  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(currentuserisjoined, participantingagents, request_id: string) {
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest current user is joined', currentuserisjoined);
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest participanting agents', participantingagents);

    const participantingagentslength = participantingagents.length
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest participanting agents length', participantingagentslength);

    let chatAgent = '';

    participantingagents.forEach((agent, index) => {
      let stringEnd = ' '

      // if (participantingagentslength === 1) {
      //   stringEnd = '.';
      // }

      if (participantingagentslength - 1 === index) {
        stringEnd = '.';
      } else {
        stringEnd = ', ';
      }

      // if (participantingagentslength > 2 ) {
      //   // this.logger.log('WS-REQUESTS-SERVED - joinRequest index length > 2', index);
      //   if (participantingagentslength - 1 === index) {
      //     this.logger.log('WS-REQUESTS-SERVED - joinRequest index length > 2 posizione lenght = index ', participantingagentslength - 1 === index ,'metto punto ');
      //     stringEnd = '.';
      //   } else if (participantingagentslength - 2) {
      //     this.logger.log('WS-REQUESTS-SERVED - joinRequest index length > 2 index lenght - 2 ', index , 'participantingagentslength - 2', participantingagentslength - 2, 'metto and ');
      //     stringEnd = ' and ';
      //   } else {
      //     this.logger.log('WS-REQUESTS-SERVED - joinRequest index length > 2 index', index ,'metto , ');
      //     stringEnd = ', ';
      //   }
      // }

      if (agent.firstname && agent.lastname) {

        chatAgent += agent.firstname + ' ' + agent.lastname + stringEnd
      }

      if (agent.name) {
        chatAgent += agent.name + stringEnd
      }

    });


    this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest chatAgent', chatAgent);

    if (currentuserisjoined === false) {
      this.displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id);
    }
  }

  displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id) {
    swal({
      title: this.areYouSureMsg,
      text: this.youAreAboutToJoinMsg + ': ' + chatAgent,

      icon: "info",
      buttons: {
        cancel: this.cancelMsg,
        catch: {
          text: this.joinToChatMsg,
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] ARE YOU SURE TO JOIN THIS CHAT ... value', value)

        if (value === 'catch') {
          this.onJoinHandled(request_id, this.currentUserID);
        }
      })
  }

  openChatAtSelectedConversation(requestid: string, requester_fullanme: string) {
    this.openChatToTheSelectedConversation(this.CHAT_BASE_URL, requestid, requester_fullanme)
  }

  // openChatInNewWindow(requestid: string, requester_fullanme: string) {
  //   this.logger.log('[WS-REQUESTS-LIST][SERVED] - openChatInNewWindow - requestid', requestid);
  //   this.logger.log('[WS-REQUESTS-LIST][SERVED] - openChatInNewWindow - requester_fullanme', requester_fullanme);
  //   const chatTabCount = localStorage.getItem('tabCount')
  //   console.log('[WS-REQUESTS-LIST][SERVED] openChatInNewWindow chatTabCount ', chatTabCount)
  
  //   let url = ''
  //   if (chatTabCount && +chatTabCount > 0) {
  //     console.log('[WS-REQUESTS-LIST][SERVED] openChatInNewWindow chatTabCount > 0 - FOCUS')
  //     url = this.CHAT_BASE_URL + '#/conversation-detail?convselected=' + requestid
  //     // this.focusWin('Tiledesk - Open Source Live Chat')
  //     this.openWindow('Tiledesk - Open Source Live Chat', url)

  //   } else  if (chatTabCount && +chatTabCount === 0) {
  //     url = this.CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
  //     // window.open(url, '_blank');
  //     this.openWindow('Tiledesk - Open Source Live Chat', url)
  //   }

  //   // let url = '';
  //   // if (this.FIREBASE_AUTH === false) {
  //   //   url = this.CHAT_BASE_URL + "/" + requestid + "/" + requester_fullanme + "/active"
  //   // } else if (this.FIREBASE_AUTH === true) {
  //   //   url = this.CHAT_BASE_URL + '?recipient=' + requestid;
  //   // } else {
  //   //   url = this.CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
  //   // }
  //   // const url = this.CHAT_BASE_URL + '#/conversation-detail/' + requestid + "/" + requester_fullanme + "/active"
   

  //   // this.openWindow('Tiledesk - Open Source Live Chat', url)
  //   // this.focusWin('Tiledesk - Open Source Live Chat')
  // }

  // openWindow(winName: any, winURL: any) {
  //   const myWindows = new Array();
  //   if (myWindows[winName] && !myWindows[winName].closed) {
  //     alert('window already exists');
  //   } else {
  //     myWindows[winName] = window.open(winURL, winName);
  //   }
  // }

  // focusWin(winName: any) {
  //   const myWindows = new Array();
  //   if (myWindows[winName] && !myWindows[winName].closed) {
  //     myWindows[winName].focus();
  //   } else {
  //     // alert('cannot focus closed or nonexistant window');
  //     this.logger.log('[HOME] - cannot focus closed or nonexistant window');
  //   }
  // }


  trackByFn(index, request) {
    if (!request) return null
    return index; // unique id corresponding to the item
  }

  detectMobile() {
    // this.isMobile = true;
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - IS MOBILE ', this.isMobile);
  }

  // dept_replace(deptid) {
  //   if (this.depts) {
  //     const foundDept = this.depts.filter((obj: any) => {
  //       return obj._id === deptid;
  //     });
  //     // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- served - dept_replace foundDept', foundDept)
  //     return deptid = foundDept[0]['name'];
  //   }
  // }


  updateUrl($event, agent) {
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - UPDATE-URL IMAGE ERROR  event ', $event)
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - UPDATE-URL IMAGE ERROR  agent ', agent)
    agent['has__image'] = false
  }



  // -----------------------------------------------
  // @ Translate strings
  // -----------------------------------------------
  translateAreYouSure() {
    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSureMsg = text;
      });
  }


  translateJoinToChat() {
    this.translate.get('RequestMsgsPage.Enter')
      .subscribe((text: string) => {
        this.joinToChatMsg = text;
      });
  }

  translateCancel() {
    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancelMsg = text;
      });
  }

  translateWarning() {
    this.translate.get('Warning')
      .subscribe((text: string) => {
        this.warningMsg = text;
      });
  }


  translateYouAreAboutToJoin() {
    this.translate.get('YouAreAboutToJoinThisChatAlreadyAssignedTo')
      .subscribe((text: string) => {
        this.youAreAboutToJoinMsg = text;

      });
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

  _getProjectUserByUserId(member_id) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          this.logger.log('WS-REQUESTS-LIST][SERVED] GET projectUser by USER-ID projectUser id', projectUser);


        }
      }, (error) => {
        this.logger.error('[WS-REQUESTS-LIST][SERVED] GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] GET projectUser by USER-ID * COMPLETE *');
      });
  }


}
