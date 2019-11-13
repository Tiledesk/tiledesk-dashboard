import { Component, OnInit, NgZone } from '@angular/core';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { currentUserUidIsInMembers } from '../utils/util';
@Component({
  selector: 'appdashboard-ws-requests-list',
  templateUrl: './ws-requests-list.component.html',
  styleUrls: ['./ws-requests-list.component.scss']
})
export class WsRequestsListComponent implements OnInit {

  wsRequestsServed: any;
  wsRequestsUnserved: any;
  projectId: string;
  zone: NgZone;
  SHOW_SIMULATE_REQUEST_BTN: boolean;
  showSpinner = true;
  displayArchiveRequestModal = 'none'
  ws_requests: any[] = [];
  constructor(
    public wsRequestsService: WsRequestsService,
    private router: Router,
    private usersLocalDbService: UsersLocalDbService,
    private botLocalDbService: BotLocalDbService,
    public auth: AuthService,
  ) { this.zone = new NgZone({ enableLongStackTrace: false }); }

  ngOnInit() {

    this.getWsRequests$();
    this.getCurrentProject()
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      console.log('WsRequestsListComponent  project', project)

      if (project) {
        this.projectId = project._id;
      }
    });
  }

  getWsRequests$() {
    this.wsRequestsService.wsRequestsList$.subscribe((wsrequests) => {

      if (wsrequests) {

        this.ws_requests = wsrequests
      }

      console.log('%%% WsRequestsListComponent getWsRequests$ ws_request ', wsrequests)

      console.log('%%% WsRequestsListComponent getWsRequests$ typeof ws_request ', typeof wsrequests)

      // this.zone.run(() => {

      if (wsrequests.length > 0) {
        this.SHOW_SIMULATE_REQUEST_BTN = false;
        // console.log('%%% WS REQUESTS-LIST COMP - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
      } else {
        this.SHOW_SIMULATE_REQUEST_BTN = true;
      }


      this.ws_requests.forEach(request => {
        console.log('%%% WsRequestsListComponent getWsRequests$ typeof ws_request ', typeof wsrequests)
        if (request.lead && request.lead.fullname) {
          request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
          request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
        } else {

          request['requester_fullname_initial'] = 'n.a.';
          request['requester_fullname_fillColour'] = '#eeeeee';
        }

        if (request.lead
          && request.lead.attributes
          && request.lead.attributes.senderAuthInfo
          && request.lead.attributes.senderAuthInfo.authVar
          && request.lead.attributes.senderAuthInfo.authVar.token
          && request.lead.attributes.senderAuthInfo.authVar.token.firebase
          && request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider
        ) {
          if (request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {

            // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
            request['requester_is_verified'] = true;
          } else {
            // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
            request['requester_is_verified'] = false;
          }

        } else {
          request['requester_is_verified'] = false;
        }

      });


      // })

      if (wsrequests) {
        this.wsRequestsUnserved = wsrequests
          .filter(r => {
            if (r['status'] === 100) {
              this.showSpinner = false;
              return true
            } else {
              return false
            }
          }).sort(function compare(a: Request, b: Request) {
            if (a['createdAt'] > b['createdAt']) {
              return 1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return -1;
            }
            return 0;
          });

        this.wsRequestsServed = wsrequests
          .filter(r => {
            if (r['status'] !== 100) {
              this.showSpinner = false;
              return true
            } else {
              return false
            }
          });


      }

    }, error => {
      console.log('%%% WsRequestsListComponent getWsRequests$ * error * ', error)
    });

  }

  _getWsRequests$() {
    this.wsRequestsService.messages.subscribe((websocketResponse) => {

      if (websocketResponse) {
        console.log('% WsRequestsListComponent getWsRequests$websocket Response', websocketResponse)

        const wsRequests = websocketResponse['payload']['message']
        console.log('% WsRequestsListComponent getWsRequests$websocket Requests (all)', wsRequests);

        this.wsRequestsUnserved = wsRequests
          .filter(r => {
            if (r['status'] === 100) {
              // this.showSpinner = false;
              return true
            } else {
              return false
            }
          }).sort(function compare(a: Request, b: Request) {
            if (a['createdAt'] > b['createdAt']) {
              return 1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return -1;
            }
            return 0;
          });

        this.wsRequestsServed = wsRequests
          .filter(r => {
            if (r['status'] !== 100) {
              // this.showSpinner = false;
              return true
            } else {
              return false
            }
          });
      }

      console.log('% WsRequestsListComponent getWsRequests$ (served)', this.wsRequestsServed);
      console.log('% WsRequestsListComponent getWsRequests$ (unserved)', this.wsRequestsUnserved);

    }, error => {
      console.log('% WsRequestsListComponent getWsRequests$ * error * ', error)
    });
  }


  members_replace(member_id) {
    // console.log('!!! NEW REQUESTS HISTORY  - SERVED BY ID ', member_id)
    // console.log(' !!! NEW REQUESTS HISTORY underscore found in the participant id  ', member_id, member_id.includes('bot_'));

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
        const lastnameInizial = user['lastname'].charAt(0);
        // '- ' +
        return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        // '- ' +
        return member_id
      }
    }
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

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }

}



