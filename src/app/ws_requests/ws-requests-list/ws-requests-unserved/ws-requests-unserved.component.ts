import { Component, OnInit, Input, OnChanges, AfterViewInit } from '@angular/core';
import { Request } from '../../../models/request-model';
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

  constructor(
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public usersLocalDbService: UsersLocalDbService,
    public router: Router,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService,
    public usersService: UsersService
  ) {

    super(botLocalDbService, usersLocalDbService, router, wsRequestsService);
  }

  ngOnInit() {
    this.getStorageBucket();
    this.getCurrentProject();
    // this.getUnservedRequestsLength();
    // this.getWsRequestsUnservedLength()
    console.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) - wsRequestsUnserved', this.wsRequestsUnserved)
    // this.getProjectUserRole()
    // this.getCount();
    this.detectBrowserRefresh();
  }

  ngAfterViewInit() {
    // const elemTable = <HTMLElement>document.querySelector('.unserved_requests_table tbody');
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngAfterViewInit elemTable ", elemTable);
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngAfterViewInit elemTable.childNodes.length ", elemTable.children.length);

    // if (elemTable.children.length === 0) {
    //   this.displayNoRequestString = true;
    // } else {
    //   this.displayNoRequestString = false;
    // }

  }

  detectBrowserRefresh() {
    // console.log('% »»» WebSocketJs WF +++++ ws-requests--- served CALLING browserRefresh')
    this.browserRefresh = browserRefresh;
    console.log("% »»» WebSocketJs WF +++++ ws-requests--- served ----- ngOnInit browserRefresh ", this.browserRefresh);

    if (this.wsRequestsUnserved.length === 0 && browserRefresh === false) {
      this.displayNoRequestString = true;
    }

  }

  ngOnChanges() {
    // console.log("% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngOnChanges wsRequestsList$.value.length ", this.wsRequestsService.wsRequestsList$.value.length);
    // console.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved ----- ngOnChanges wsRequestsServed length', this.wsRequestsUnserved.length)
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

  getCount() {
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved - wsRequestsUnserved unserved calling getCount ')
    this.wsRequestsUnserved.forEach(unserved => {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved - wsRequestsUnserved unserved getCount unserved ', unserved)
      }, 1000);
    });
  }


  // getProjectUserRole() {
  //   this.usersService.project_user_role_bs  
  //   .subscribe((user_role) => {
  //     console.log('% »»» WebSocketJs WF - WsRequestsList USER ROLE ', user_role);
  //     if (user_role) {
  //       if (user_role === 'agent') {
  //         this.ROLE_IS_AGENT = true;
  //         this.totalOf_unservedRequests = this.wsRequestsUnserved.length;
  //         console.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved ROLE is AGENT', this.ROLE_IS_AGENT ,' done -> total unserved ', this.totalOf_unservedRequests)
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
  //     console.log('% »»» WebSocketJs WF +++++ ws-requests--- unserved ROLE is AGENT', this.ROLE_IS_AGENT ,' done -> total unserved ', this.totalOf_unservedRequests)

  //   })
  // }

  // IS USED WHEN IS GET A NEW MESSAGE (INN THIS CASE THE ONINIT IS NOT CALLED)
  getWsRequestsUnservedLength() {
    if (this.ws_requests_length > 0) {
      this.showSpinner = false;
    }
    console.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) ws_requests_length ', this.ws_requests_length)
  }



  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {

        // console.log('WsRequestsUnservedComponent - project', project)

        if (project) {
          this.projectId = project._id;
          // this.projectName = project.name;
        }
      });
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    // console.log('STORAGE-BUCKET Ws Requests List ', this.storageBucket)
  }

  goToMemberProfile(member_id: any) {
    console.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!! NEW REQUESTS HISTORY IS A BOT !');

      this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
  }

  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }

  // ======================== ARCHIVE A REQUEST ========================
  openDeleteRequestModal(request_recipient: string) {
    console.log('ID OF REQUEST TO ARCHIVE ', request_recipient)

    this.id_request_to_archive = request_recipient;
    this.displayArchiveRequestModal = 'block'

  }

  onCloseArchiveRequestModal() {
    console.log('onCloseArchiveRequestModal displayArchiveRequestModal', this.displayArchiveRequestModal)
    this.displayArchiveRequestModal = 'none'
  }

  trackByFn(index, request) {
    // console.log('% »»» WebSocketJs WF WS-RL - trackByFn ', request );
    if (!request) return null
    return index; // unique id corresponding to the item
  }


}
