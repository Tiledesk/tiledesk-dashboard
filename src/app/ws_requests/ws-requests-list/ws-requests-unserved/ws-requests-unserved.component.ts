import { Component, OnInit, Input } from '@angular/core';
import { Request } from '../../../models/request-model';
import { WsSharedComponent } from '../../ws-shared/ws-shared.component';
import { BotLocalDbService } from '../../../services/bot-local-db.service';
import { AuthService } from '../../../core/auth.service';
import { UsersLocalDbService } from '../../../services/users-local-db.service';
import { Router } from '@angular/router';
import { AppConfigService } from '../../../services/app-config.service';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';

@Component({
  selector: 'appdashboard-ws-requests-unserved',
  templateUrl: './ws-requests-unserved.component.html',
  styleUrls: ['./ws-requests-unserved.component.scss']
})
export class WsRequestsUnservedComponent extends WsSharedComponent implements OnInit {

  @Input() wsRequestsUnserved: Request[];
  @Input() ws_requests_length: number
  // @Input() showSpinner: boolean;
  storageBucket: string;
  projectId: string;
  id_request_to_archive: string;
  displayArchiveRequestModal: string;
  showSpinner = true;

  constructor(
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    public usersLocalDbService: UsersLocalDbService,
    public router: Router,
    public appConfigService: AppConfigService,
    public wsRequestsService: WsRequestsService
  ) {

    super(botLocalDbService, usersLocalDbService, router);
  }

  ngOnInit() {
    this.getStorageBucket();
    this.getCurrentProject();
    this.listenToRequestsLength();
    this.getWsRequestsUnservedLength()
    console.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) - wsRequestsUnserved', this.wsRequestsUnserved)
  }

// IS USED WHEN IS GET A NEW MESSAGE (INN THIS CASE THE ONINIT IS NOT CALLED)
  getWsRequestsUnservedLength() {
    if (this.ws_requests_length > 0) {
      this.showSpinner = false;
    }
    console.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) ws_requests_length ', this.ws_requests_length)
  }

  // IS CALLING ON INIT
  listenToRequestsLength() {
    this.wsRequestsService.wsRequestsListLength$.subscribe((totalrequests: number) => {
      console.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> totalrequests ', totalrequests)

      this.showSpinner = false;
      console.log('% »»» WebSocketJs WF - onData (ws-requests-unserved) ≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥≥ done -> showSpinner ', this.showSpinner)
    })
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

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
    if(!request) return null
    return index; // unique id corresponding to the item
 }


}
