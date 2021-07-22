import { Component, OnInit, Input, OnChanges, AfterViewInit } from '@angular/core';
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
@Component({
  selector: 'appdashboard-ws-requests-unserved',
  templateUrl: './ws-requests-unserved.component.html',
  styleUrls: ['./ws-requests-unserved.component.scss']
})
export class WsRequestsUnservedComponent extends WsSharedComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() wsRequestsUnserved: Request[];
  @Input() ws_requests_length: number
  // @Input() showSpinner: boolean;
  storageBucket: string;
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
    private translate: TranslateService,
    public logger: LoggerService
  ) {

    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService, notify, logger);
  }

  ngOnInit() {
    this.getStorageBucket();
    this.getCurrentProject();
    this.getDepartments();
    // this.getUnservedRequestsLength();
    // this.getWsRequestsUnservedLength()
    this.logger.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) - wsRequestsUnserved', this.wsRequestsUnserved)
    // this.getProjectUserRole()
    // this.getCount();
    this.detectBrowserRefresh();

    this.getTranslations();
    this.getLoggedUser();
    this.getUserRole();
  }

  getUserRole() {
    this.subscription = this.usersService.project_user_role_bs.subscribe((userRole) => {

      this.logger.log('WS-REQUESTS UNSERVED - USER ROLE »»» ', userRole)
      
      this.USER_ROLE = userRole;
    })
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('WS-REQUESTS UNSERVED ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        this.logger.log('WS-REQUESTS UNSERVEDcurrentUser ID', this.currentUserID);
      }
    });
  }

  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();

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

  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved GET DEPTS RESPONSE ', _departments);
      this.depts = _departments;

    }, error => {
      this.logger.error('% »»» WebSocketJs WF +++++ ws-requests--- unserved GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved GET DEPTS * COMPLETE *')
    });
  }


  ngAfterViewInit() {
    // const elemTable = <HTMLElement>document.querySelector('.unserved_requests_table tbody');
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngAfterViewInit elemTable ", elemTable);
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngAfterViewInit elemTable.childNodes.length ", elemTable.children.length);

    // if (elemTable.children.length === 0) {
    //   this.displayNoRequestString = true;
    // } else {
    //   this.displayNoRequestString = false;
    // }

  }

  detectBrowserRefresh() {
    // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- served CALLING browserRefresh')
    this.browserRefresh = browserRefresh;
    this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnInit browserRefresh ", this.browserRefresh);

    if (this.wsRequestsUnserved.length === 0 && browserRefresh === false) {
      this.displayNoRequestString = true;
    }
  }

  ngOnChanges() {
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngOnChanges wsRequestsList$.value.length ", this.wsRequestsService.wsRequestsList$.value.length);
    // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngOnChanges wsRequestsServed length', this.wsRequestsUnserved.length)
    // setTimeout(() => {
    //   if (this.wsRequestsUnserved.length === 0) {
    //     this.displayNoRequestString = true;
    //   } else {
    //     this.displayNoRequestString = false;
    //   }
    // }, 2000);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(requestid) {
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - id request ", requestid);
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";

    // const lessTagsBtn = <HTMLElement>document.querySelector(`#less_tags_btn_for_request_${requestid}`);
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - lessTagsBtn ", lessTagsBtn);
    // lessTagsBtn.style.display = "inline-block";
  }

  toggleTooltip(index) {
    this.logger.log("WS-REQUESTS-UNSERVED toggleTooltip index" ,index);
    // const tooltipElem = <HTMLElement>document.querySelector('.right');
    const tooltipElem = <HTMLElement>document.querySelector(`#tooltip_${index}`);
    this.logger.log("WS-REQUESTS-UNSERVED toggleTooltip tooltipElem" , tooltipElem);
    tooltipElem.classList.toggle("tooltip-fixed");
  }

  // --------------------------------------------------
  // @ Tags - display ledd tags
  // --------------------------------------------------
  displayLessTag(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";

    // const lessTagsBtn = <HTMLElement>document.querySelector(`#less_tags_btn_for_request_${requestid}`);
    // this.logger.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - lessTagsBtn ", lessTagsBtn);
    // lessTagsBtn.style.display = "none";
  }

  getCount() {
    this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved - wsRequestsUnserved unserved calling getCount ')
    this.wsRequestsUnserved.forEach(unserved => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved - wsRequestsUnserved unserved getCount unserved ', unserved)
      }, 1000);
    });
  }


  // getProjectUserRole() {
  //   this.usersService.project_user_role_bs  
  //   .subscribe((user_role) => {
  //     this.logger.log('% »»» WebSocketJs WF - WsRequestsList USER ROLE ', user_role);
  //     if (user_role) {
  //       if (user_role === 'agent') {
  //         this.ROLE_IS_AGENT = true;
  //         this.totalOf_unservedRequests = this.wsRequestsUnserved.length;
  //         this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved ROLE is AGENT', this.ROLE_IS_AGENT ,' done -> total unserved ', this.totalOf_unservedRequests)
  //       } else {
  //         this.ROLE_IS_AGENT = false;
  //         this.getWsRequestsUnservedLength();
  //       }
  //     }
  //   });
  // }




  // getUnservedRequestsLength() {
  //   this.wsRequestsService.ws_Unserved_RequestsLength$
  //   .pipe(
  //     takeUntil(this.unsubscribe$)
  //   )
  //   .subscribe((totalunserved: number) => {

  //     this.totalOf_unservedRequests = totalunserved
  //     this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved ROLE is AGENT', this.ROLE_IS_AGENT ,' done -> total unserved ', this.totalOf_unservedRequests)

  //   })
  // }

  // IS USED WHEN IS GET A NEW MESSAGE (INN THIS CASE THE ONINIT IS NOT CALLED)
  getWsRequestsUnservedLength() {
    if (this.ws_requests_length > 0) {
      this.showSpinner = false;
    }
    this.logger.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) ws_requests_length ', this.ws_requests_length)
  }



  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {

        // this.logger.log('WsRequestsUnservedComponent - project', project)

        if (project) {
          this.projectId = project._id;
          // this.projectName = project.name;
        }
      });
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    // this.logger.log('STORAGE-BUCKET Ws Requests List ', this.storageBucket)
  }

  // goToMemberProfile(member_id: any) {
  //   this.logger.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
  //   if (member_id.indexOf('bot_') !== -1) {
  //     this.logger.log('!!! NEW REQUESTS HISTORY IS A BOT !');

  //     this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
  //   } else {
  //     this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
  //   }
  // }

  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }

  goToWsRequestsNoRealtimeUnserved() {
    this.router.navigate(['project/' + this.projectId + '/wsrequests-all/' + '100']);
  }

 // ------------------------------------------------------
  // open / close MODAL ARCHIVE A REQUEST ! NO MORE USED 
  // ------------------------------------------------------

  // openDeleteRequestModal(request_recipient: string) {
  //   this.logger.log('ID OF REQUEST TO ARCHIVE ', request_recipient)
  //   this.id_request_to_archive = request_recipient;
  //   this.displayArchiveRequestModal = 'block'
  // }

  // onCloseArchiveRequestModal() {
  //   this.logger.log('onCloseArchiveRequestModal displayArchiveRequestModal', this.displayArchiveRequestModal)
  //   this.displayArchiveRequestModal = 'none'
  // }

  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('WS-REQUESTS-UNSERVED - HAS CLICKED ARCHIVE REQUEST ');


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        this.logger.log('WS-REQUESTS-UNSERVED - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        this.logger.error('WS-REQUESTS-UNSERVED - CLOSE SUPPORT GROUP - ERROR ', err);

   
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        this.logger.log('CLOSE SUPPORT GROUP - COMPLETE');  

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);
       
        // this.onArchiveRequestCompleted()
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
  joinRequest (request_id:string) {
    this.logger.log('WS-REQUESTS-UNSERVED - joinRequest request_id', request_id);
    this.logger.log('WS-REQUESTS-UNSERVED - joinRequest currentUserID', this.currentUserID);

    this.onJoinHandled(request_id, this.currentUserID); 
  }


  dept_replace(deptid) {
    // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved - dept_replace deptid', deptid)
    // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- served - dept_replace depts', this.depts)
    if (this.depts) {
      const foundDept = this.depts.filter((obj: any) => {

        return obj._id === deptid;

      });
      // this.logger.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved - dept_replace foundDept', foundDept)

      return deptid = foundDept[0]['name'];
    }
  }


}
