import { Component, OnInit ,NgZone} from '@angular/core';
import { WsRequestsService } from '../services/ws-requests.service';
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
    this.wsRequestsService.wsRequestsList$.subscribe((ws_request) => {

      console.log('%%% WsRequestsListComponent getWsRequests$ ws_request ', ws_request)

      this.zone.run(() => {

        if (ws_request.length > 0) {
          this.SHOW_SIMULATE_REQUEST_BTN = false;
          console.log('REQUESTS-LIST COMP - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
        } else {
          this.SHOW_SIMULATE_REQUEST_BTN = true;
        }

      })

      if (ws_request) {
        this.wsRequestsUnserved = ws_request
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
  
      this.wsRequestsServed = ws_request
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

}



