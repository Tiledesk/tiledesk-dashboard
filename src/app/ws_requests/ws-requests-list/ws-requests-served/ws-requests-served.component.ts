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

  private unsubscribe$: Subject<any> = new Subject<any>();
  public browserRefresh: boolean;
  displayNoRequestString = false;

  constructor(
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public usersLocalDbService: UsersLocalDbService,
    public router: Router,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    // private cdr: ChangeDetectorRef

  ) {
    super(botLocalDbService, usersLocalDbService, router, wsRequestsService, faqKbService, usersService);
  }

  ngOnInit() {
    this.getStorageBucket();
    this.getCurrentProject();

    console.log('% »»» WebSocketJs WF - onData (ws-requests-served) - showSpinner', this.showSpinner)
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- served - ngOnInit wsRequestsServed', this.wsRequestsServed)

    // this.getWsRequestsServedLength();
    this.getLoggedUser();
    this.detectBrowserRefresh();
    // this.getProjectUserRole()
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


  // !!! No more used
  goToMemberProfile(member_id: any) {
    console.log('WsRequestsServedComponent has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('WsRequestsServedComponent IS A BOT !');
      const id_bot = (member_id.split('_').pop());
      console.log('ID BOT ', id_bot);
      // this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);

      const bot = this.botLocalDbService.getBotFromStorage(id_bot);
      console.log('WsRequestsServedComponent BOT FROM STORAGE ', bot)
      // const botType = bot.type

      let botType = ''
      if (bot.type === 'internal') {
        botType = 'native'
      } else {
        botType = bot.type
      }

      // this.router.navigate(['project/' + this.projectId + '/bots/', id_bot]);
      this.router.navigate(['project/' + this.projectId + '/bots', id_bot, botType]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
  }

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

    this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
  }





  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }

  // ======================== ARCHIVE A REQUEST ========================
  openDeleteRequestModal(request_recipient: string) {
    console.log('WsRequestsServedComponent ID OF REQUEST TO ARCHIVE ', request_recipient)

    this.id_request_to_archive = request_recipient;
    this.displayArchiveRequestModal = 'block'

  }

  onCloseArchiveRequestModal() {
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- served onCloseArchiveRequestModal ', this.displayArchiveRequestModal)
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- served onCloseArchiveRequestModal this.wsRequestsServed length', this.wsRequestsServed.length)

    this.displayArchiveRequestModal = 'none'
  }

  trackByFn(index, request) {
    // console.log('% »»» WebSocketJs WF WS-RL - trackByFn ', request );
    if (!request) return null
    return index; // unique id corresponding to the item
  }

}
