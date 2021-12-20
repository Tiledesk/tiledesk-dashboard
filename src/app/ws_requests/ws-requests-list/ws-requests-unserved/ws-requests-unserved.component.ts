import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Request } from '../../../models/request-model';
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
import { DepartmentService } from '../../../services/department.service';
import { NotifyService } from '../../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LoggerService } from '../../../services/logger/logger.service';

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

    this.getCurrentProject();
    this.getDepartments();
    this.detectBrowserRefresh();
    this.getTranslations();
    this.getLoggedUser();
    this.getProjectUserRole();

  }

  // listeToChatPostMsg() {
  //   window.addEventListener("message", (event) => {
  //     console.log("wS-REQUEST-UNSERVED message event ", event);

  //     if (event && event.data && event.data.action && event.data.parameter) {
  //       // if (event.data.action === 'joinConversation' ) {
  //       //   this.logger.log("[REQUEST-DTLS-X-PANEL] message event ", event.data.action);
  //       //   this.logger.log("[REQUEST-DTLS-X-PANEL] message parameter ", event.data.parameter);
  //       //   this.logger.log("[REQUEST-DTLS-X-PANEL] currentUserID ", this.currentUserID);

  //       // }
  //     }
  //   })
  // }


  ngOnChanges() {
    this.logger.log('WS-REQUEST-UNSERVED from @Input »»» WebSocketJs WF - wsRequestsUnserved', this.wsRequestsUnserved)
    // this.wsRequestsService.wsOnDataUnservedConvs$
    //   .subscribe((ondataUnserveConvs) => {
    //     console.log("WS-REQUEST-UNSERVED ondataUnserveConvs ", ondataUnserveConvs);

    //     if (this.wsRequestsUnserved.length > 0) {
    //       if (ondataUnserveConvs.length === this.wsRequestsUnserved.length) {
    //         console.log('WS-REQUEST-UNSERVED the arrays of unserved conversations have the same length')
    //         console.log('WS-REQUEST-UNSERVED from @Input »»» WebSocketJs WF - wsRequestsUnserved', this.wsRequestsUnserved)
    //         console.log('WS-REQUEST-UNSERVED from @Input »»» WebSocketJs WF - ondataUnserveConvs', ondataUnserveConvs)
    //       } else {
    //         console.log('WS-REQUEST-UNSERVED the arrays of unserved conversations NOT have the same length')
    //         console.log('WS-REQUEST-UNSERVED the arrays of unserved conversations wsRequestsUnserved', this.wsRequestsUnserved)
    //         console.log('WS-REQUEST-UNSERVED from @Input »»» WebSocketJs WF - ondataUnserveConvs', ondataUnserveConvs)
    //         for (let i = 0; i < this.wsRequestsUnserved.length; i++) {
    //           for (let j = 0; j < ondataUnserveConvs.length; j++) {
    //             if (this.wsRequestsUnserved[i]._id === ondataUnserveConvs[j]._id) {
    //               console.log('WS-REQUEST-UNSERVED the conversation exists in both arrays - conv ', this.wsRequestsUnserved[i]._id)
    //             } else {
    //               console.log('WS-REQUEST-UNSERVED the conversation NOT exists in both arrays - conv ', this.wsRequestsUnserved[i]._id)
    //             }
  
    //             // if (this.wsRequestsUnserved[i]['archived'] === true) {
    //             //   console.log('WS-REQUEST-UNSERVED  wsRequestsUnserved the object with archived ', this.wsRequestsUnserved[i])
    //             //   this.wsRequestsUnserved.splice(i, 1);
    //             // }
    //           }
    //         }
    //       }
    //     }
    //   });
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }


  archiveRequest(request_id: string, request: any) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - HAS CLICKED ARCHIVE CONV (CLOSE SUPPORT GROUP) - CONV: ', request);


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        this.logger.error('[WS-REQUESTS-LIST][UNSERVED] - CLOSE SUPPORT GROUP - ERROR ', err);

        //  NOTIFY ERROR 
        this.notify.showWidgetStyleUpdateNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
      
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
