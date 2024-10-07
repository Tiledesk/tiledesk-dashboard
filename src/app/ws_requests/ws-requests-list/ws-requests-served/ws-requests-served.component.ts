import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, SimpleChanges, AfterViewInit } from '@angular/core';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { AuthService } from '../../../core/auth.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
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
import { ProjectService } from 'app/services/project.service';
import { WsMsgsService } from 'app/services/websocket/ws-msgs.service';
import { BrandService } from 'app/services/brand.service';
import { CHANNELS_NAME, goToCDSVersion } from 'app/utils/util';
import { MatMenuTrigger } from '@angular/material/menu';
// import { Location, PopStateEvent } from '@angular/common';

const swal = require('sweetalert');
import scrollToWithAnimation from 'scrollto-with-animation'

@Component({
  selector: 'appdashboard-ws-requests-served',
  templateUrl: './ws-requests-served.component.html',
  styleUrls: ['./ws-requests-served.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class WsRequestsServedComponent extends WsSharedComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() wsRequestsServed: Request[];
  @Input() ws_requests_length: number;
  @Input() current_selected_prjct: any;
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  @Input() requestCountResp: any;

  countRequestsServedByHumanRr: number
  countRequestsServedByBotRr: number
  countRequestsUnservedRr: number

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

  requests_selected = [];
  allChecked = false;
  allConversationsaveBeenArchivedMsg: string;

  youCannotJoinChat: string;
  joinChatTitle: string;
  botLogo: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
  scrollEl: any;
  scrollYposition: any;
  storedRequestId: string
  CHANNELS_NAME = CHANNELS_NAME;
  
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
    public logger: LoggerService,
    private projectService: ProjectService,
    private wsMsgsService: WsMsgsService,
    public brandService: BrandService,
    public route: ActivatedRoute,

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);

    const brand = brandService.getBrand();
    this.botLogo = brand['BASE_LOGO_NO_TEXT']
    this.getRouteParams()
  }

  getRouteParams() {
    this.scrollEl = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WS-REQUESTS-LIST][SERVED] oninit scrollEl', this.scrollEl)
    this.route.params.subscribe((params) => {
      // this.projectId = params.projectid
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - GET ROUTE PARAMS ', params);
      if (params.scrollposition) {
        this.scrollYposition = params.scrollposition;
        this.logger.log('[WS-REQUESTS-LIST][SERVED] - scrollYposition', +this.scrollYposition);
        if (this.scrollEl) {
          this.logger.log('[WS-REQUESTS-LIST][SERVED] scrollEl scrollTop', this.scrollEl.scrollTop)
        } else {
          this.logger.error('[WS-REQUESTS-LIST][SERVED] scrollEl', this.scrollEl)
        }
      }
    })

  }

  // -------------------------------------------------------------
  // @ Lifehooks
  // -------------------------------------------------------------
  ngOnInit() {
    this.getProfileImageStorageAndChatBaseUrl();
    this.getCurrentProject();
    // this.getDepartments();
    this.getLoggedUser();
    this.detectBrowserRefresh();
    this.getTranslations();
    this.getProjectUserRole();
    this.detectMobile();
    this.getFirebaseAuth();
  

    // this.router.events.subscribe((event) => { 
    //   if (event instanceof NavigationEnd || event instanceof NavigationStart) {    
    //     this.logger.log('[WS-REQUESTS-LIST][SERVED] event', event)
    //   }
    // })

  }

 

  ngAfterViewInit(): void {
    setTimeout(() => {
      scrollToWithAnimation(
        this.scrollEl, // element to scroll
        'scrollTop', // direction to scroll
        +this.scrollYposition, // target scrollY (0 means top of the page)
        500, // duration in ms
        'easeInOutCirc', 
        // Can be a name of the list of 'Possible easing equations' or a callback
        // that defines the ease. # http://gizma.com/easing/
  
        () => { // callback function that runs after the animation (optional)
          this.logger.log('done!')
          this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
          this.logger.log('[WS-REQUESTS-LIST][SERVED] storedRequestId',  this.storedRequestId)
        }
      );
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges changes', changes)
    this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges wsRequestsServed length', this.wsRequestsServed.length)
    // console.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges wsRequestsServed ', this.wsRequestsServed)

    // this.logger.log('[WS-REQUEST-SERVED] ngOnChanges requestCountResp', this.requestCountResp)


    if (this.requestCountResp) {
      this.countRequestsServedByHumanRr = this.requestCountResp.assigned;
      this.countRequestsServedByBotRr = this.requestCountResp.bot_assigned;
      this.countRequestsUnservedRr = this.requestCountResp.unassigned;

      // this.logger.log('[WS-REQUEST-SERVED] ngOnChanges countRequestsServedByHumanRr', this.countRequestsServedByHumanRr)
      // this.logger.log('[WS-REQUEST-SERVED] ngOnChanges countRequestsServedByBotRr', this.countRequestsServedByBotRr)
      // this.logger.log('[WS-REQUEST-SERVED] ngOnChanges countRequestsUnservedRr', this.countRequestsUnservedRr)
    }
   
    
  
    if (changes?.current_selected_prjct || changes?.ws_requests_length && changes?.ws_requests_length?.previousValue === 0 || changes?.ws_requests_length?.previousValue === undefined) {
      // this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges changes.current_selected_prjct ', changes.current_selected_prjct)
      // this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges changes.ws_requests_length.previousValue ', changes.ws_requests_length.previousValue)


      // if (this.wsRequestsServed.length > 0) {
      //   setTimeout(() => {
      //     scrollToWithAnimation(
      //       this.scrollEl, // element to scroll
      //       'scrollTop', // direction to scroll
      //       +this.scrollYposition, // target scrollY (0 means top of the page)
      //       500, // duration in ms
      //       'easeInOutCirc', 
      //       // Can be a name of the list of 'Possible easing equations' or a callback
      //       // that defines the ease. # http://gizma.com/easing/
       
      //       () => { // callback function that runs after the animation (optional)
      //         this.logger.log('done!')
      //         this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
      //         this.logger.log('[WS-REQUESTS-LIST][SERVED] storedRequestId',  this.storedRequestId)
      //       }
      //     );
      //   }, 100);

      // }
    }
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onContextMenu(event: MouseEvent, item) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  onContextMenuAction1(item) {
    alert(`Click on Action 1 for ${item.name}`);
  }

  onContextMenuAction2(item) {
    alert(`Click on Action 2 for ${item.name}`);
  }

  overfirstTextGetRequestMsg(request) {
    this.logger.log('[WS-REQUESTS-LIST][SERVED] overfirstText request_id', request);
    this.getRequestMsg(request)
  }

  getRequestMsg(request) {
    this.wsMsgsService.geRequestMsgs(request.request_id).subscribe((msgs: any) => {
      this.logger.log('[WS-REQUESTS-SERVED] -  GET REQUESTS MSGS - RES: ', msgs);
      if (msgs) {
        const msgsArray = [];
        msgs.forEach((msgs, index) => {
          if ((msgs)) {
            if ((msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info') || (msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info/support')) {
              // this.logger.log('>>>> msgs subtype does not push ', msgs['attributes']['subtype'])
            } else {
              msgsArray.push(msgs)
            }
          }
          request['msgsArray'] = msgsArray.sort(function compare(a, b) {
            if (a['createdAt'] > b['createdAt']) {
              return -1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return 1;
            }
            return 0;
          });
        });
      }
      // this.logger.log('[WS-REQUESTS-MSGS] -  GET REQUESTS MSGS - request: ', request);
    }, (err) => {
      this.logger.error('[WS-REQUESTS-LIST][SERVED] - GET REQUESTS MSGS - ERROR: ', err);

    }, () => {
      this.logger.log('[WS-REQUESTS-LIST][SERVED] * COMPLETE *');

    });
  }



  // unsuscribeRequestById(idrequest) {
  //   this.wsRequestsService.unsubscribeTo_wsRequestById(idrequest);
  // }

  // unsuscribeMessages(idrequest) {
  //   this.wsMsgsService.unsubsToWS_MsgsByRequestId(idrequest);
  // }

  // subscribeToWs_MsgsByRequestId(request, id_request: string) {
  //   this.logger.log('[WS-REQUESTS-MSGS] - subscribe To WS MSGS ByRequestId ', id_request)
  //   this.wsMsgsService.subsToWS_MsgsByRequestId(id_request);

  //   this.getWsMsgs$(request, id_request);
  // }

  // getWsMsgs$(request, id_request) {
  //   this.wsMsgsService.wsMsgsList$
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((wsmsgs) => {

  //       if (wsmsgs) {

  //         const msgsArray = []
  //         wsmsgs.forEach((msgs, index) => {
  //           if ((id_request === msgs['recipient'])) {
  //             if ((msgs)) {
  //               if ( (msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info') ||  (msgs['attributes'] && msgs['attributes']['subtype'] && msgs['attributes']['subtype'] === 'info/support') ){
  //                 // this.logger.log('>>>> msgs subtype does not push ', msgs['attributes']['subtype'])
  //               } else {
  //                 msgsArray.push(msgs)
  //               }
  //             }

  //           }
  //         });
  //         // this.logger.log('[WS-REQUESTS-MSGS] msgsArray ', msgsArray)



  //         request['msgsArray'] = msgsArray.sort(function compare(a, b) {
  //           if (a['createdAt'] > b['createdAt']) {
  //             return -1;
  //           }
  //           if (a['createdAt'] < b['createdAt']) {
  //             return 1;
  //           }
  //           return 0;
  //         });
  //       }
  //     }, error => {
  //       this.showSpinner = false;
  //       this.logger.error('[WS-REQUESTS-MSGS] - getWsMsgs$ - ERROR ', error)
  //     }, () => {
  //       this.logger.log('[WS-REQUESTS-MSGS] - getWsMsgs$ * COMPLETE * ')
  //     });
  // }



  getFirebaseAuth() {
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.FIREBASE_AUTH = true;
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
    } else if (this.appConfigService.getConfig().firebaseAuth === false) {
      this.FIREBASE_AUTH = false;
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - FIREBASE_AUTH IS ', this.FIREBASE_AUTH);
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
          // this.findCurrentProjectAmongAll(this.projectId)
          this.logger.log('[WS-REQUESTS-LIST][SERVED] -  current_selected_prjct ', this.current_selected_prjct)
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

  goToServedNTR() {
    this.router.navigate(['project/' + this.projectId + '/all-conversations'],{ queryParams: { leftfilter: 200 } });
  }


  goToBotProfile(bot, bot_id: string, bot_type: string) {

    this.logger.log('[WS-REQUESTS-LIST][SERVED] goToBotProfile bot', bot)
    this.logger.log('[WS-REQUESTS-LIST][SERVED] goToBotProfile bot_id', bot_id)
    if (this.ROLE_IS_AGENT === false) {
      let botType = ''
      // if (bot_type === 'internal') {
      //   botType = 'native'
      //   if (this.ROLE_IS_AGENT === false) {
      //     this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot_id, botType]);
      //   }

      // } else if (bot_type === 'tilebot') {
      //   botType = 'tilebot'
      //   if (this.ROLE_IS_AGENT === false) {
      //     this.router.navigate(['project/' + this.projectId + '/tilebot/intents/', bot_id, botType]);
      //   }
      // } else {
      //   botType = bot_type

      //   if (this.ROLE_IS_AGENT === false) {
      //     this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);
      //   }
      // }
      if (bot.type === 'internal') {
        botType = 'native'

        this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot._id, botType]);

      } else if (bot.type === 'tilebot') {
        botType = 'tilebot'
        goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)

      } else if (bot.type === 'tiledesk-ai') {
        botType = 'tiledesk-ai'
        goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)

      } else {
        botType = bot.type
        this.router.navigate(['project/' + this.projectId + '/bots', bot._id, botType]);
      }
    } else {
      this.presentModalAgentCannotManageChatbot()
    }
  }

  presentModalAgentCannotManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.agentsCannotManageChatbots, this.learnMoreAboutDefaultRoles)
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
    this.logger.log('[WS-REQUESTS-LIST][SERVED] GO TO REQUEST MSGS scrollEl scrollTop', this.scrollEl.scrollTop)
    this.logger.log("[WS-REQUESTS-LIST][SERVED] GO TO REQUEST MSGS ")
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/1' + '/messages/' + this.scrollEl.scrollTop]);
    this.usersLocalDbService.setInStorage('last-selection-id', request_id)
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
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP (archiveRequest) - request_id ', request_id);
       
       this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
       this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP (archiveRequest) - storedRequestId ', this.storedRequestId);

       if (request_id === this.storedRequestId) {
        this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP (archiveRequest) - REMOVE FROM STOREGAE storedRequestId ', this.storedRequestId);
          this.usersLocalDbService.removeFromStorage('last-selection-id')
       }
      
      }, (err) => {
        this.logger.error('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - ERROR ', err);


        //  NOTIFY ERROR 
        this.notify.showWidgetStyleUpdateNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.usersLocalDbService.removeFromStorage('last-selection-id')
        // this.ngOnInit();
        this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - COMPLETE');

        //  NOTIFY SUCCESS
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

      });
  }

  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(currentuserisjoined, participantingagents, request_id: string, channel) {
    //   this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest current user is joined', currentuserisjoined);
    //  this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest participanting agents', participantingagents);
    //   this.logger.log('[WS-REQUESTS-LIST][SERVED] - joinRequest channel ', channel);

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
      if (channel.name === 'email' || channel.name === 'form') {
        if (participantingagents.length === 1) {
          this.presentModalYouCannotJoinChat()
        } else if (participantingagents.length === 0) {
          this.displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id);
        }
      } else if (channel.name !== 'email' || channel.name !== 'form' || channel.name === 'telegram' || channel.name === 'whatsapp' || channel.name === 'messenger' || channel.name === 'chat21') {
        this.displayModalAreYouSureToJoinThisChatAlreadyAssigned(chatAgent, request_id);
      }
    }
  }

  presentModalYouCannotJoinChat() {
    swal({
      title: this.joinChatTitle,
      text: this.youCannotJoinChat,
      icon: "info",
      buttons: 'OK',
      dangerMode: false,
    })
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
    localStorage.setItem('last_project', JSON.stringify(this.current_selected_prjct))
    this.openChatToTheSelectedConversation(this.CHAT_BASE_URL, requestid, requester_fullanme)
  }

  // openChatInNewWindow(requestid: string, requester_fullanme: string) {
  //   this.logger.log('[WS-REQUESTS-LIST][SERVED] - openChatInNewWindow - requestid', requestid);
  //   this.logger.log('[WS-REQUESTS-LIST][SERVED] - openChatInNewWindow - requester_fullanme', requester_fullanme);
  //   const chatTabCount = localStorage.getItem('tabCount')
  //   this.logger.log('[WS-REQUESTS-LIST][SERVED] openChatInNewWindow chatTabCount ', chatTabCount)

  //   let url = ''
  //   if (chatTabCount && +chatTabCount > 0) {
  //     this.logger.log('[WS-REQUESTS-LIST][SERVED] openChatInNewWindow chatTabCount > 0 - FOCUS')
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




  updateUrl($event, agent) {
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - UPDATE-URL IMAGE ERROR  event ', $event)
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - UPDATE-URL IMAGE ERROR  agent ', agent)
    agent['has__image'] = false
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

  selectAll(e) {
    this.logger.log("[WS-REQUESTS-LIST][SERVED] > Is checked: ", e.target.checked)
    var checkbox = <HTMLInputElement>document.getElementById("allServedCheckbox");
    if (checkbox) {
      this.logger.log("[WS-REQUESTS-LIST][SERVED] **++ checkbox Indeterminate: ", checkbox.indeterminate);
    }

    if (e.target.checked == true) {
      this.logger.log('SELECT ALL e.target.checked ', e.target.checked)
      this.allChecked = true;
      for (let request of this.wsRequestsServed) {
        // this.logger.log('SELECT ALL request ', request)


        const index = this.requests_selected.indexOf(request.request_id);
        if (index > -1) {
          this.logger.log("[WS-REQUESTS-LIST][SERVED] **++ Already present in requests_selected")
        } else {
          this.logger.log("[WS-REQUESTS-LIST][SERVED] *+*+ Request Selected: ", request.request_id);
          this.requests_selected.push(request.request_id);
        }

        if (request['isSelected'] === true) {
          this.logger.log("[WS-REQUESTS-LIST][SERVED] **++ Already selected")
        } else {
          // this.logger.log("[WS-REQUESTS-LIST][SERVED] *+*+ Request Selected: ", request.request_id);

          request['isSelected'] = true

        }
      }
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - ARRAY OF SELECTED REQUEST ', this.requests_selected);
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - ARRAY OF SELECTED REQUEST lenght ', this.requests_selected.length);
    } else if (e.target.checked == false) {
      for (let request of this.wsRequestsServed) {
        // this.logger.log('SELECT ALL request ', request)
        // const index = this.requests_selected.indexOf(request.request_id);
        if (request.hasOwnProperty('isSelected')) {
          if (request['isSelected'] === true) {
            request['isSelected'] = false

          } else {
            request['isSelected'] = false
          }
        }
      }
      // else {
      //   request['isSelected'] = true
      // }
      this.allChecked = false;
      this.requests_selected = [];
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - ARRAY OF SELECTED REQUEST ', this.requests_selected);
      this.logger.log('[WS-REQUESTS-LIST][SERVED] - ARRAY OF SELECTED REQUEST lenght ', this.requests_selected.length)
    }

  }

  change(request) {
    var checkbox = <HTMLInputElement>document.getElementById("allServedCheckbox");
    if (checkbox) {
      this.logger.log("[WS-REQUESTS-LIST][SERVED] -  change - checkbox Indeterminate: ", checkbox.indeterminate);
    }

    this.logger.log("[WS-REQUESTS-LIST][SERVED] -  change - checkbox request: ", request);
    if (request.hasOwnProperty('isSelected')) {
      if (request.isSelected === true) {
        request.isSelected = false
      } else if (request.isSelected === false) {
        request.isSelected = true
      }
    } else {
      request.isSelected = true
    }


    this.logger.log('[WS-REQUESTS-LIST][SERVED] - change - SELECTED REQUEST ID: ', request.request_id);
    const index = this.requests_selected.indexOf(request.request_id);
    this.logger.log("[WS-REQUESTS-LIST][SERVED] - change - request selected INDEX: ", index);

    if (index > -1) {
      this.requests_selected.splice(index, 1);
      if (checkbox) {
        checkbox.indeterminate = true;
        this.logger.log("[WS-REQUESTS-LIST][SERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
      }
      if (this.requests_selected.length == 0) {
        if (checkbox) {
          checkbox.indeterminate = false;
          this.logger.log("[WS-REQUESTS-LIST][SERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
        }
        this.allChecked = false;
      }
    } else {
      this.requests_selected.push(request.request_id);
      if (checkbox) {
        checkbox.indeterminate = true;
        this.logger.log("[WS-REQUESTS-LIST][SERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
      }
      if (this.requests_selected.length == this.wsRequestsServed.length) {
        if (checkbox) {
          checkbox.indeterminate = false;
          this.logger.log("[WS-REQUESTS-LIST][SERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
        }
        this.allChecked = true;
      }
    }
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - ARRAY OF SELECTED REQUEST ', this.requests_selected);
    this.logger.log('[WS-REQUESTS-LIST][SERVED] - ARRAY OF SELECTED REQUEST lenght ', this.requests_selected.length);
  }

  archiveSelected() {
    let count = 0;
    this.requests_selected.forEach((requestid, index) => {
      this.wsRequestsService.closeSupportGroup(requestid)
        .subscribe((data: any) => {
          //  this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - DATA ', data);
          

          this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP (archiveSelected) - requestid ', requestid);

          this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
          this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP (archiveSelected) - storedRequestId ', this.storedRequestId);
   
          if (requestid === this.storedRequestId) {
            this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP (archiveSelected) - REMOVE FROM STORAGE storedRequestId ', this.storedRequestId);
             this.usersLocalDbService.removeFromStorage('last-selection-id')
          }


          // this.allChecked = false;
          // this.requests_selected = []
          this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - requests_selected ', this.requests_selected);
        }, (err) => {
          this.logger.error('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - ERROR ', err);


          //  NOTIFY ERROR 
          // this.notify.showWidgetStyleUpdateNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
        }, () => {
          //  this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - HERE Y ');
          this.usersLocalDbService.removeFromStorage('last-selection-id')
          // this.ngOnInit();
          this.logger.log('[WS-REQUESTS-LIST][SERVED] - CLOSE SUPPORT GROUP - COMPLETE');
          count = count + 1;
          //  NOTIFY SUCCESS
          // this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);
          const index = this.requests_selected.indexOf(requestid);
          if (index > -1) {
            this.requests_selected.splice(index, 1);
            
          }
          this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg + count + '/' + this.requests_selected.length);

          this.logger.log('[WS-REQUESTS-LIST][SERVED] - this.requests_selected.length ', this.requests_selected.length);
          this.logger.log('[WS-REQUESTS-LIST][SERVED] - requests_selected array ', this.requests_selected);

          if (this.requests_selected.length === 0) {
            this.allChecked = false;
            var checkbox = <HTMLInputElement>document.getElementById("allServedCheckbox");
            this.notify.showAllRequestHaveBeenArchivedNotification(this.allConversationsaveBeenArchivedMsg)
            this.logger.log("[WS-REQUESTS-LIST][SERVED] -  change - checkbox Indeterminate: ", checkbox.indeterminate);
            if (checkbox) {
              checkbox.indeterminate = false;

            }
          }

        });
    })
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
    this.translateAllConversationsHaveBeenArchived();
    this.translateModalYouCannotJoinChat();

    this.translate
      .get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation
      })

    this.translate
      .get('AgentsCannotManageChatbots')
      .subscribe((translation: any) => {
        this.agentsCannotManageChatbots = translation
      })
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


  translateAllConversationsHaveBeenArchived() {
    this.translate.get('AllConversationsaveBeenArchived')
      .subscribe((text: string) => {
        this.allConversationsaveBeenArchivedMsg = text
      })

  }

  translateModalYouCannotJoinChat() {
    this.translate.get('YouCannotJoinChat')
      .subscribe((text: string) => {
        this.youCannotJoinChat = text
      })

    this.translate.get('RequestMsgsPage.Enter').subscribe((text: string) => {
      this.joinChatTitle = text;
    });
  }




}
