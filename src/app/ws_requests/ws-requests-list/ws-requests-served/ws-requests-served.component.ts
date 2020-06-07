import {
  Component, OnInit, Input, OnChanges, AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef, SimpleChange
} from '@angular/core';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { AuthService } from '../../../core/auth.service';
import { UsersLocalDbService } from '../../../services/users-local-db.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../../../services/app-config.service';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { UsersService } from '../../../services/users.service';
import { browserRefresh } from '../../../app.component';
import { FaqKbService } from '../../../services/faq-kb.service';
import { Request } from '../../../models/request-model';
import { DepartmentService } from '../../../services/mongodb-department.service';
import { NotifyService } from '../../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-ws-requests-served',
  templateUrl: './ws-requests-served.component.html',
  styleUrls: ['./ws-requests-served.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class WsRequestsServedComponent extends WsSharedComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() wsRequestsServed: Request[];
  @Input() ws_requests_length: number
  // @Input() showSpinner: boolean;

  storageBucket: string;
  projectId: string;
  id_request_to_archive: string;
  displayArchiveRequestModal: string;
  showSpinner = true;
  currentUserID: string;
  totalOf_servedRequests: number;
  ROLE_IS_AGENT: boolean;
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

  constructor(
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public usersLocalDbService: UsersLocalDbService,
    public router: Router,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    private departmentService: DepartmentService,
    private notify: NotifyService,
    private translate: TranslateService
    // private cdr: ChangeDetectorRef

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService);
  }

  ngOnInit() {
    this.getStorageBucket();
    this.getCurrentProject();
    this.getDepartments();

    console.log('% »»» WebSocketJs WF - onData (ws-requests-served) - showSpinner', this.showSpinner)
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- served - ngOnInit wsRequestsServed', this.wsRequestsServed)

    // this.getWsRequestsServedLength();
    this.getLoggedUser();
    this.detectBrowserRefresh();
    // this.getProjectUserRole()
    this.getTranslations();
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
        // console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // console.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }


  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- served GET DEPTS RESPONSE ', _departments);
      this.depts = _departments;



    }, error => {
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- served GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- served GET DEPTS * COMPLETE *')
    });
  }




  // Wait until the view inits before disconnecting
  ngAfterViewInit() {
    console.log('% »»» WebSocketJs WF - onData >>>>>>>>>>>>>>>>>>>>>>>>>>>>> (ws-requests-served) - ngAfterViewInit wsRequestsServed', this.wsRequestsServed)
    // Since we know the list is not going to change
    // let's request that this component not undergo change detection at all
    // this.cdr.detach();

    // setTimeout(() => {
    //   const elemTable = <HTMLElement>document.querySelector('.served_requests_table tbody');
    //   console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngAfterViewInit elemTable ", elemTable);
    //   console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngAfterViewInit elemTable.childNodes.length ", elemTable.children.length);

    //   if (elemTable.children.length === 0) {
    //     this.displayNoRequestString = true;

    //   } else {
    //     this.displayNoRequestString = false;
    //   }
    // }, 2000);

  }

  ngOnChanges() {
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnChanges wsRequestsList$.value.length ",  this.wsRequestsService.wsRequestsList$.value.length);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnChanges browserRefresh ", this.browserRefresh);
    // console.log('% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnChanges wsRequestsServed length', this.wsRequestsServed.length)
    // setTimeout(() => {
    //   if (this.wsRequestsServed.length === 0) {
    //     this.displayNoRequestString = true;
    //   } else {
    //     this.displayNoRequestString = false;
    //   }
    // }, 2000);


  }

  // --------------------------------------------------
  // @ Tags - display more tags
  // --------------------------------------------------
  displayMoreTags(requestid) {
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - id request ", requestid);
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "inline-block";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "none";

    // const lessTagsBtn = <HTMLElement>document.querySelector(`#less_tags_btn_for_request_${requestid}`);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - lessTagsBtn ", lessTagsBtn);
    // lessTagsBtn.style.display = "inline-block";
  }

  // --------------------------------------------------
  // @ Tags - display ledd tags
  // --------------------------------------------------
  displayLessTag(requestid) {
    const hiddenTagsElem = <HTMLElement>document.querySelector(`#more_tags_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - hiddenTagsElem ", hiddenTagsElem);
    hiddenTagsElem.style.display = "none";

    const moreTagsBtn = <HTMLElement>document.querySelector(`#more_tags_btn_for_request_${requestid}`);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - moreTagsBtn ", moreTagsBtn);
    moreTagsBtn.style.display = "inline-block";

    // const lessTagsBtn = <HTMLElement>document.querySelector(`#less_tags_btn_for_request_${requestid}`);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- displayMoreTags - lessTagsBtn ", lessTagsBtn);
    // lessTagsBtn.style.display = "none";
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  detectBrowserRefresh() {
    // console.log('% »»» WebSocketJs WF +++++ ws-requests--- served CALLING browserRefresh')
    this.browserRefresh = browserRefresh;
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnInit browserRefresh ", this.browserRefresh);
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnInit wsRequestsList$.value.length ", this.wsRequestsService.wsRequestsList$.value.length);
    if (this.wsRequestsServed.length === 0 && browserRefresh === false) {
      this.displayNoRequestString = true;
    }

  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('%%% WsRequestsList  USER ', user)
      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        console.log('% »»» WebSocketJs WF (ws-requests-served) currentUser ID', this.currentUserID);
      }
    });
  }

  // IS USED WHEN IS GET A NEW MESSAGE (INN THIS CASE THE ONINIT IS NOT CALLED)
  getWsRequestsServedLength() {
    // if (this.wsRequestsServed.length > 0) {
    //   this.showSpinner = false;
    // }
    if (this.ws_requests_length > 0) {
      this.showSpinner = false;
    }
    console.log('% »»» WebSocketJs WF - onData (ws-requests-served) ws_requests_length ', this.ws_requests_length)
  }


  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    // console.log('STORAGE-BUCKET Ws Requests List ', this.storageBucket)
  }

  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {

        console.log('WsRequestsServedComponent - project', project)

        if (project) {
          this.projectId = project._id;
          // this.projectName = project.name;
        }
      });
  }


  // SERVED_BY: add this
  goToMemberProfile(member_id: any) {
    console.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!! NEW REQUESTS HISTORY IS A BOT !');

      const bot_id = member_id.slice(4);
      const bot = this.botLocalDbService.getBotFromStorage(bot_id);

      let botType = ''
      if (bot.type === 'internal') {
        botType = 'native'
      } else {
        botType = bot.type
      }
      // this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
      this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);

    } else {
      this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
    }
  }



  // !!! No more used
  // goToMemberProfile(member_id: any) {
  //   console.log('WsRequestsServedComponent has clicked GO To MEMBER ', member_id);
  //   if (member_id.indexOf('bot_') !== -1) {
  //     console.log('WsRequestsServedComponent IS A BOT !');
  //     const id_bot = (member_id.split('_').pop());
  //     console.log('ID BOT ', id_bot);
  //     // this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);

  //     const bot = this.botLocalDbService.getBotFromStorage(id_bot);
  //     console.log('WsRequestsServedComponent BOT FROM STORAGE ', bot)
  //     // const botType = bot.type

  //     let botType = ''
  //     if (bot.type === 'internal') {
  //       botType = 'native'
  //     } else {
  //       botType = bot.type
  //     }

  //     // this.router.navigate(['project/' + this.projectId + '/bots/', id_bot]);
  //     this.router.navigate(['project/' + this.projectId + '/bots', id_bot, botType]);
  //   } else {
  //     this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
  //   }
  // }


  goToBotProfile(bot_id, bot_type) {
    let botType = ''
    if (bot_type === 'internal') {
      botType = 'native'
    } else {
      botType = bot_type
    }
    this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);

  }

 
  goToAgentProfile(member_id) {
    console.log('WsRequestsServedComponent goToAgentProfile ', member_id)
    // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }

  // SERVED_BY: add this if not exist -->
  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        console.log('% Ws-REQUESTS-Msgs GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          console.log('% Ws-REQUESTS-Msgs projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        console.log('% Ws-REQUESTS-Msgs GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        console.log('% Ws-REQUESTS-Msgs GET projectUser by USER-ID * COMPLETE *');
      });
  }


  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }

  goToWsRequestsNoRealtimeServed() {
    this.router.navigate(['project/' + this.projectId + '/wsrequests-all/' + '200']);
  }

  // ------------------------------------------------------
  // open / close MODAL ARCHIVE A REQUEST ! NO MORE USED 
  // ------------------------------------------------------

  // openDeleteRequestModal(request_recipient: string) {
  //   console.log('WsRequestsServedComponent ID OF REQUEST TO ARCHIVE ', request_recipient)
  //   this.id_request_to_archive = request_recipient;
  //   this.displayArchiveRequestModal = 'block'
  // }

  // onCloseArchiveRequestModal() {
  //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- served onCloseArchiveRequestModal ', this.displayArchiveRequestModal)
  //   console.log('% »»» WebSocketJs WF +++++ ws-requests--- served onCloseArchiveRequestModal this.wsRequestsServed length', this.wsRequestsServed.length)
  //   this.displayArchiveRequestModal = 'none'
  // }

  archiveRequest(request_id) {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('WS-REQUESTS-SERVED - HAS CLICKED ARCHIVE REQUEST ');


    this.wsRequestsService.closeSupportGroup(request_id)
      .subscribe((data: any) => {
        console.log('WS-REQUESTS-SERVED - CLOSE SUPPORT GROUP - DATA ', data);
      }, (err) => {
        console.log('WS-REQUESTS-SERVED - CLOSE SUPPORT GROUP - ERROR ', err);


        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
        // this.ngOnInit();
        console.log('CLOSE SUPPORT GROUP - COMPLETE');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);

        // this.onArchiveRequestCompleted()
      });
  }


  trackByFn(index, request) {
    // console.log('% »»» WebSocketJs WF WS-RL - trackByFn ', request );
    if (!request) return null
    return index; // unique id corresponding to the item
  }

  // dept_replace(deptid) {
  //   if (this.depts) {
  //     const foundDept = this.depts.filter((obj: any) => {
  //       return obj._id === deptid;
  //     });
  //     // console.log('% »»» WebSocketJs WF +++++ ws-requests--- served - dept_replace foundDept', foundDept)
  //     return deptid = foundDept[0]['name'];
  //   }
  // }

  // SERVED_BY: add this
  members_replace(member_id) {
    const participantIsBot = member_id.includes('bot_')

    if (participantIsBot === true) {

      const bot_id = member_id.slice(4);
      // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (bot) {
        // '- ' +
        return member_id = bot['name'] + ' (bot)';
      } else {
        // '- ' +
        return member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        if (user['lastname']) {
          const lastnameInizial = user['lastname'].charAt(0);
          // '- ' +
          return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
        }
      } else {
        // '- ' +
        // return member_id
        // this._getProjectUserByUserId(member_id)
      }
    }
  }


  _getProjectUserByUserId(member_id) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        console.log('% Ws-REQUESTS-served GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          console.log('% Ws-REQUESTS-served projectUser id', projectUser);


        }
      }, (error) => {
        console.log('% Ws-REQUESTS-served GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        console.log('% Ws-REQUESTS-served GET projectUser by USER-ID * COMPLETE *');
      });
  }


}
