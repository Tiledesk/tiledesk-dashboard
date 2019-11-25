import { Component, OnInit } from '@angular/core';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
@Component({
  selector: 'appdashboard-ws-shared',
  templateUrl: './ws-shared.component.html',
  styleUrls: ['./ws-shared.component.scss']
})
export class WsSharedComponent implements OnInit {

  members_array: any;
  agents_array: any;
  cleaned_members_array: any;
  requester_fullname_initial: string;
  fillColour: string;
  user_name: string;
  user_email: string;
  department_name: string;
  department_id: string;
  source_page: string;

  constructor(
    public botLocalDbService: BotLocalDbService,
    public usersLocalDbService: UsersLocalDbService
  ) { }

  ngOnInit() {
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Create the agent array from the request's participant id
  // -----------------------------------------------------------------------------------------------------
  createAgentsArrayFromParticipantsId(members_array: any, requester_id: string) {

    this.agents_array = [];
    this.cleaned_members_array = [];
    members_array.forEach(member_id => {
      if (member_id !== requester_id && member_id !== 'system') {

        /**
         * cleaned_members_array USED IN reassignRequest:
         * WHEN IS RIASSIGNED A REQUEST IS RUNNED:
         * ** joinToGroup: WITH WHOM THE userid_selected IS JOINED TO THE GROUP
         * ** leaveTheGroup: WITH WHOM LEAVE THE GROUP THE MEMBER ID CONTAINED IN cleaned_members_array
         *    note: before of this in leaveTheGroup was used the currentUserID  */
        this.cleaned_members_array.push(member_id);
        console.log('%%% WsRequestsMsgsComponent - CLEANED MEMBERS ARRAY ', this.cleaned_members_array);

        const memberIsBot = member_id.includes('bot_');

        if (memberIsBot === true) {

          const bot_id = member_id.slice(4);
          console.log('%%% WsRequestsMsgsComponent - THE PARTICIP', member_id, 'IS A BOT ', memberIsBot, ' - ID ', bot_id);

          const bot = this.botLocalDbService.getBotFromStorage(bot_id);
          if (bot) {

            this.agents_array.push({ '_id': 'bot_' + bot['_id'], 'firstname': bot['name'], 'isBot': true })

          } else {
            this.agents_array.push({ '_id': member_id, 'firstname': member_id, 'isBot': true })
          }

          // NON è UN BOT
        } else {
          console.log('%%% WsRequestsMsgsComponent - MEMBER ', member_id)

          // l'utente è salvato nello storage
          const user = this.usersLocalDbService.getMemberFromStorage(member_id);

          if (user) {
            if (member_id === user['_id']) {
              // tslint:disable-next-line:max-line-length
              this.agents_array.push({ '_id': user['_id'], 'firstname': user['firstname'], 'lastname': user['lastname'], 'isBot': false })

              // this.request.push(user)
              // console.log('--> THIS REQUEST - USER ', user)
            }
          } else {
            this.agents_array.push({ '_id': member_id, 'firstname': member_id, 'isBot': false })
          }
        }
      }
    });

    console.log('%%% WsRequestsMsgsComponent - AGENT ARRAY ', this.agents_array)
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Create the requester avatar
  // -----------------------------------------------------------------------------------------------------
  createRequesterAvatar(lead) {

    if (lead && lead.fullname) {
      this.requester_fullname_initial = avatarPlaceholder(lead.fullname);
      this.fillColour = getColorBck(lead.fullname)
    } else {

      this.requester_fullname_initial = 'n.a.';
      this.fillColour = '#eeeeee';
    }

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Extracts the values from the "attributes" object of the request and assign them to local variables
  // -----------------------------------------------------------------------------------------------------
  destructureAttributes(attributes: any) {
    if (attributes) {

      /**
       * attributes > userFullname
       */
      if (attributes.userFullname) {
        this.user_name = attributes.userFullname;
        console.log('* USER NAME: ', this.user_name);
      } else {
        this.user_name = 'n.a.'
      }

      /**
       * attributes > userEmail
       */
      if (attributes.userEmail) {
        this.user_email = attributes.userEmail;
        console.log('* USER EMAIL: ', this.user_email);
      } else {
        this.user_email = 'n.a.'
      }

      /**
       * attributes > departmentName
       */
      if (attributes.departmentName) {
        this.department_name = attributes.departmentName;
        console.log('* DEPATMENT NAME: ', this.department_name);
      } else {
        this.department_name = 'Default'
      }

      /**
       * attributes > departmentId
       */
      if (attributes.departmentId) {
        this.department_id = attributes.departmentId;
        console.log('* DEPATMENT ID: ', this.department_id);
      } else {
        this.department_id = 'n.a.'
      }

      /**
       * attributes > sourcePage
       */
      if (attributes.sourcePage) {
        this.source_page = attributes.sourcePage;
        console.log('* SOURCE PAGE: ', this.source_page);
      } else {
        this.source_page = 'n.a.'
        console.log('* SOURCE PAGE: ', this.source_page);
      }

    } else {
      this.user_name = 'n.a.';
      this.user_email = 'n.a.';
      this.department_name = 'n.a.';
      this.department_id = 'n.a.';
      this.source_page = 'n.a.';
    }

  }

  currentUserIdIsInParticipants(participants: any, currentUserID: string, request_id): boolean {
  
    let currentUserIsJoined = false
    participants.forEach((participantID: string) => {

      if (participantID === currentUserID) {
        // console.log('%%% Ws SHARED »»»»»»» PARTICIPANTS ', participants)
        // console.log('%%% Ws SHARED »»»»»»» CURRENT_USER_ID ', currentUserID);
        currentUserIsJoined = true;
        // console.log('%%% Ws SHARED »»»»»»» CURRENT USER ', currentUserID, 'is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
        return
      }
    });
    // console.log('%%% Ws SHARED »»»»»»» CURRENT USER ', currentUserID, ' is JOINED ?', currentUserIsJoined, 'to the request ', request_id);
    return currentUserIsJoined;
  }


}
