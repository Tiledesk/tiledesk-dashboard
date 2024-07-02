import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Request } from '../../../models/request-model';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { AuthService } from '../../../core/auth.service';
import { LocalDbService } from '../../../services/users-local-db.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../services/app-config.service';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { UsersService } from '../../../services/users.service';
import { browserRefresh } from '../../../app.component';
import { FaqKbService } from '../../../services/faq-kb.service';
import { DepartmentService } from '../../../services/department.service';
import { NotifyService } from '../../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../../services/logger/logger.service';
import { WsMsgsService } from 'app/services/websocket/ws-msgs.service';
import scrollToWithAnimation from 'scrollto-with-animation'
import { CHANNELS_NAME } from 'app/utils/util';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-ws-requests-unserved',
  templateUrl: './ws-requests-unserved.component.html',
  styleUrls: ['./ws-requests-unserved.component.scss']
})
export class WsRequestsUnservedComponent extends WsSharedComponent implements OnInit, OnChanges, OnDestroy {

  @Input() wsRequestsUnserved: Request[];
  @Input() ws_requests_length: number

  wsOndataRequestArray: Array<any>
  projectId: string;
  id_request_to_archive: string;
  displayArchiveRequestModal: string;
  showSpinner = true;
  totalOf_unservedRequests: number;
  ROLE_IS_AGENT: boolean;
  private unsubscribe$: Subject<any> = new Subject<any>();
  timeout: any;
  public browserRefresh: boolean;
  displayNoRequestString = false;
  depts: any;

  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;
  currentUserID: string;
  subscription: Subscription;
  USER_ROLE: string;

  areYouSureMsg: string;
  cancelMsg: string;
  conversationWillBeAssignedToYourselfMsg: string;

  requests_selected = [];
  allChecked = false;
  allConversationsaveBeenArchivedMsg: string;
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
    private wsMsgsService: WsMsgsService,
    public route: ActivatedRoute
  ) {

    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger, translate);
  }

  // -------------------------------------------------------------
  // @ Lifehooks
  // -------------------------------------------------------------
  ngOnInit() {

    this.getCurrentProject();
    this.getDepartments();
    this.detectBrowserRefresh();
    this.getTranslations();
    this.getLoggedUser();
    this.getProjectUserRole();
    this.getRouteParams()
  }

  getRouteParams() {
    this.scrollEl = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] oninit scrollEl', this.scrollEl)
    this.route.params.subscribe((params) => {
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - GET ROUTE PARAMS ', params);
      if (params.scrollposition) {
        this.scrollYposition = params.scrollposition;
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - scrollYposition', +this.scrollYposition);
        // if (this.scrollEl) {
        //   this.logger.log('[WS-REQUESTS-LIST][UNSERVED] scrollEl scrollTop', this.scrollEl.scrollTop)
        //   setTimeout(() => {
        //     this.scrollEl.scrollTo(0, +this.scrollYposition);
        //   }, 1000);
        // } else {
        //   this.logger.error('[WS-REQUESTS-LIST][UNSERVED] scrollEl', this.scrollEl)
        // }
      }
    })

  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[WS-REQUEST-UNSERVED] from @Input »»» WebSocketJs WF - wsRequestsUnserved', this.wsRequestsUnserved)
    this.logger.log('[WS-REQUEST-UNSERVED] ngOnChanges changes', changes)


    if (changes?.current_selected_prjct || changes?.ws_requests_length && changes?.ws_requests_length?.previousValue === 0 || changes?.ws_requests_length?.previousValue === undefined) {
      // this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges changes.current_selected_prjct ', changes.current_selected_prjct)
      // this.logger.log('[WS-REQUESTS-LIST][SERVED] ngOnChanges changes.ws_requests_length.previousValue ', changes.ws_requests_length.previousValue)
      this.logger.log('[WS-REQUEST-UNSERVED] ngOnChanges here 1', changes)

      if (this.wsRequestsUnserved.length > 0) {
        this.logger.log('[WS-REQUEST-UNSERVED] ngOnChanges here 2', changes)
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
            }
          );
        }, 100);

      }
    }

  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }





  // -------------------------------------------------------------
  // @ Subscribe to project user role
  // -------------------------------------------------------------

  // listeToChatPostMsg() {
  //   window.addEventListener("message", (event) => {
  //     this.logger.log("wS-REQUEST-UNSERVED message event ", event);

  //     if (event && event.data && event.data.action && event.data.parameter) {
  //       // if (event.data.action === 'joinConversation' ) {
  //       //   this.logger.log("[REQUEST-DTLS-X-PANEL] message event ", event.data.action);
  //       //   this.logger.log("[REQUEST-DTLS-X-PANEL] message parameter ", event.data.parameter);
  //       //   this.logger.log("[REQUEST-DTLS-X-PANEL] currentUserID ", this.currentUserID);

  //       // }
  //     }
  //   })
  // }

  overfirstTextGetRequestMsg(request) {
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED]] overfirstText request_id', request);
    this.getRequestMsg(request)
  }

  getRequestMsg(request) {
    this.wsMsgsService.geRequestMsgs(request.request_id).subscribe((msgs: any) => {
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] -  GET REQUESTS MSGS - RES: ', msgs);
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
      this.logger.error('[WS-REQUESTS-LIST][UNSERVED] - GET REQUESTS MSGS - ERROR: ', err);

    }, () => {
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] * COMPLETE *');

    });
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
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] GET PROJECT-USER ROLE ', user_role);
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

  // -------------------------------------------------------------
  // @ Subscribe to current user
  // -------------------------------------------------------------
  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('WS-REQUESTS UNSERVED ', user)

        if (user) {
          this.currentUserID = user._id;
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] GET CURRENT USER - currentUser ID', this.currentUserID);
        }
      });
  }

  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();
    this.translateAreYouSure();
    this.translateCancel();
    this.conversationWillBeAssignedToYourself()
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

  translateCancel() {
    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancelMsg = text;
      });
  }
  conversationWillBeAssignedToYourself() {
    this.translate.get('ByPressingOkTheConversationWillBeAssignedToYourself')
      .subscribe((text: string) => {
        this.conversationWillBeAssignedToYourselfMsg = text;
      });
  }

  translateAllConversationsHaveBeenArchived() {
    this.translate.get('AllConversationsaveBeenArchived')
      .subscribe((text: string) => {
        this.allConversationsaveBeenArchivedMsg = text
      })

  }

  selectAll(e) {
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] > Is checked: ", e.target.checked)
    var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] **++ checkbox Indeterminate: ", checkbox.indeterminate);


    if (e.target.checked == true) {
      this.logger.log('SELECT ALL e.target.checked ', e.target.checked)
      this.allChecked = true;
      for (let request of this.wsRequestsUnserved) {
        // this.logger.log('SELECT ALL request ', request)


        const index = this.requests_selected.indexOf(request.request_id);
        if (index > -1) {
          this.logger.log("[WS-REQUESTS-LIST][UNSERVED]] **++ Already present in requests_selected")
        } else {
          this.logger.log("[WS-REQUESTS-LIST][UNSERVED] *+*+ Request Selected: ", request.request_id);
          this.requests_selected.push(request.request_id);
        }

        if (request['isSelected'] === true) {
          this.logger.log("[WS-REQUESTS-LIST][UNSERVED]] **++ Already selected")
        } else {
          request['isSelected'] = true

        }
      }
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - ARRAY OF SELECTED REQUEST ', this.requests_selected);
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - ARRAY OF SELECTED REQUEST lenght ', this.requests_selected.length);
    } else if (e.target.checked == false) {
      for (let request of this.wsRequestsUnserved) {
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
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - ARRAY OF SELECTED REQUEST ', this.requests_selected);
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - ARRAY OF SELECTED REQUEST lenght ', this.requests_selected.length)
    }

  }

  change(request) {
    var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
    if (checkbox) {
      this.logger.log("[WS-REQUESTS-LIST][UNSERVED] -  change - checkbox Indeterminate: ", checkbox.indeterminate);
      if (this.requests_selected.length === 0) {
        checkbox.indeterminate = false
      }
    }


    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] -  change - checkbox request: ", request);
    if (request.hasOwnProperty('isSelected')) {
      if (request.isSelected === true) {
        request.isSelected = false
      } else if (request.isSelected === false) {
        request.isSelected = true
      }
    } else {
      request.isSelected = true
    }


    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - change - SELECTED REQUEST ID: ', request.request_id);
    const index = this.requests_selected.indexOf(request.request_id);
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - change - request selected INDEX: ", index);

    if (index > -1) {
      this.requests_selected.splice(index, 1);
      if (checkbox) {
        checkbox.indeterminate = true;
        this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
      }
      if (this.requests_selected.length == 0) {
        if (checkbox) {
          checkbox.indeterminate = false;
          this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
        }
        this.allChecked = false;
      }
    } else {
      this.requests_selected.push(request.request_id);
      if (checkbox) {
        checkbox.indeterminate = true;
        this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
      }
      if (this.requests_selected.length == this.wsRequestsUnserved.length) {
        if (checkbox) {
          checkbox.indeterminate = false;
          this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - change - checkbox Indeterminate: ", checkbox.indeterminate);
        }
        this.allChecked = true;
      }
    }
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - ARRAY OF SELECTED REQUEST ', this.requests_selected);
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - ARRAY OF SELECTED REQUEST lenght ', this.requests_selected.length);
  }

  archiveSelected() {
    let count = 0;
    this.requests_selected.forEach((requestid, index) => {
      this.wsRequestsService.closeSupportGroup(requestid)
        .subscribe((data: any) => {
          // console.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - DATA ', data);


          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP (archiveRequest) - requestid ', requestid);

          this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP (archiveRequest) - storedRequestId ', this.storedRequestId);
  
          if (requestid === this.storedRequestId) {
            this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP (archiveRequest) - REMOVE FROM STOREGAE storedRequestId ', this.storedRequestId);
            this.usersLocalDbService.removeFromStorage('last-selection-id')
          }
          // this.allChecked = false;
          // this.requests_selected = []
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - requests_selected ', this.requests_selected);
        }, (err) => {
          this.logger.error('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - ERROR ', err);


          //  NOTIFY ERROR 
          // this.notify.showWidgetStyleUpdateNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
        }, () => {
        
          this.usersLocalDbService.removeFromStorage('last-selection-id')
          // this.ngOnInit();
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - COMPLETE');
          count = count + 1;
          //  NOTIFY SUCCESS
          // this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);
          const index = this.requests_selected.indexOf(requestid);
          if (index > -1) {
            this.requests_selected.splice(index, 1);
           
          }
          this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg + count + '/' + this.requests_selected.length);

          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - this.requests_selected.length ', this.requests_selected.length);
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - requests_selected array ', this.requests_selected);

          if (this.requests_selected.length === 0) {
            this.allChecked = false;
            var checkbox = <HTMLInputElement>document.getElementById("allCheckbox");
            this.notify.showAllRequestHaveBeenArchivedNotification(this.allConversationsaveBeenArchivedMsg)
            this.logger.log("[WS-REQUESTS-LIST][UNSERVED] -  change - checkbox Indeterminate: ", checkbox.indeterminate);
            if (checkbox) {
              checkbox.indeterminate = false;

            }
          }

        });
    })
  }


  // -------------------------------------------------------------
  // @ Get depts
  // -------------------------------------------------------------
  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - GET DEPTS RES ', _departments);
      this.depts = _departments;

    }, error => {
      this.logger.error('[WS-REQUESTS-LIST][UNSERVED] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - GET DEPTS * COMPLETE *')
    });
  }

  // --------------------------------------------------
  // @ Detect browser refresh
  // --------------------------------------------------
  detectBrowserRefresh() {

    this.browserRefresh = browserRefresh;
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - ngOnInit browserRefresh ", this.browserRefresh);

    if (this.wsRequestsUnserved.length === 0 && browserRefresh === false) {
      this.displayNoRequestString = true;
    }
  }

  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(requestid) {
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - id request ", requestid);
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";

  }

  // --------------------------------------------------
  // @ Tags - display less tags
  // --------------------------------------------------
  displayLessTag(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - displayLessTag - hiddenTagsElem ', hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] - displayLessTag - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";

  }

  // --------------------------------------------------
  // @ Toogle tooltip
  // --------------------------------------------------
  toggleTooltip(index) {
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] toggleTooltip index", index);
    const tooltipElem = <HTMLElement>document.querySelector(`#tooltip_${index}`);
    this.logger.log("[WS-REQUESTS-LIST][UNSERVED] toggleTooltip tooltipElem", tooltipElem);
    tooltipElem.classList.toggle("tooltip-fixed");
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
        // this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - project', project)
        if (project) {
          this.projectId = project._id;
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - GET CURRENT PROJECT - PROJECT ID ', this.projectId)
        }
      });
  }

  goToRequestMsgs(request_id: string) {
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] GO TO REQUEST MSGS scrollEl scrollTop', this.scrollEl.scrollTop)
    // this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/1' + '/messages/' + this.scrollEl.scrollTop]);
    this.usersLocalDbService.setInStorage('last-selection-id', request_id)
  }


  archiveRequest(request_id: string, request: any) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - HAS CLICKED ARCHIVE CONV (CLOSE SUPPORT GROUP) - CONV: ', request);


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - DATA ', data);
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP (archiveRequest) - request_id ', request_id);

        this.storedRequestId = this.usersLocalDbService.getFromStorage('last-selection-id')
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP (archiveRequest) - storedRequestId ', this.storedRequestId);

        if (request_id === this.storedRequestId) {
          this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP (archiveRequest) - REMOVE FROM STOREGAE storedRequestId ', this.storedRequestId);
          this.usersLocalDbService.removeFromStorage('last-selection-id')
        }

      }, (err) => {
        this.logger.error('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - ERROR ', err);

        //  NOTIFY ERROR 
        this.notify.showWidgetStyleUpdateNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        this.usersLocalDbService.removeFromStorage('last-selection-id')
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - COMPLETE');

        //  NOTIFY SUCCESS
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);
      });
  }


  trackByFn(index, request) {
    // this.logger.log('% »»» WebSocketJs WF WS-RL - trackByFn ', request );
    if (!request) return null
    return index; // unique id corresponding to the item
  }

  // ------------------------------------------
  // Join request
  // ------------------------------------------
  joinRequest(request_id: string) {
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - joinRequest request_id', request_id);
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - joinRequest currentUserID', this.currentUserID);

    this.displayModalAreyouSureYouWantToTakeChargeOfTheConversation(request_id, this.currentUserID);
    // this.onJoinHandled(request_id, this.currentUserID);
  }

  displayModalAreyouSureYouWantToTakeChargeOfTheConversation(requestid, currentuserid) {
    swal({
      title: this.areYouSureMsg,
      text: this.conversationWillBeAssignedToYourselfMsg,
      icon: "info",
      buttons: {
        cancel: this.cancelMsg,
        catch: {
          text: 'OK',
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] ARE YOU SURE TO JOIN THIS CHAT ... value', value)

        if (value === 'catch') {
          this.onJoinHandled(requestid, currentuserid);
        }
      })

  }

  // -----------------------------------------------
  // @ Translate strings
  // -----------------------------------------------
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


  // IS USED WHEN IS GET A NEW MESSAGE (INN THIS CASE THE ONINIT IS NOT CALLED)
  // getWsRequestsUnservedLength() {
  //   if (this.ws_requests_length > 0) {
  //     this.showSpinner = false;
  //   }
  //   this.logger.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) ws_requests_length ', this.ws_requests_length)
  // }

  // goToWsRequestsNoRealtimeUnserved() {
  //   this.router.navigate(['project/' + this.projectId + '/wsrequests-all/' + '100']);
  // } 


  // dept_replace(deptid) {
  //   if (this.depts) {
  //     const foundDept = this.depts.filter((obj: any) => {
  //       return obj._id === deptid;
  //     });
  //     return deptid = foundDept[0]['name'];
  //   }
  // }

}
