import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RequestsService } from '../services/requests.service';

import { ContactsService } from '../services/contacts.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'appdashboard-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent implements OnInit {

  requester_id: string
  requests_list: any;
  contact_details: any;
  projectId: string

  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private requestsService: RequestsService,
    private usersLocalDbService: UsersLocalDbService,
    private botLocalDbService: BotLocalDbService,
    private router: Router,
    public auth: AuthService,
    private contactsService: ContactsService
  ) { }

  ngOnInit() {
    this.getRequesterIdParam();
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      console.log('00 -> NEW REQUEST-LIST HISTORY - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)

      if (project) {
        this.projectId = project._id;

      }
    });
  }

  getRequesterIdParam() {
    this.requester_id = this.route.snapshot.params['requesterid'];
    console.log('!!!!! CONTACTS DETAILS - REQUESTER ID ', this.requester_id);

    if (this.requester_id) {
      this.getContactById();
      this.getRequests();

    }
  }




  getRequests() {
    this.requestsService.getNodeJsRequestsByRequesterId(this.requester_id)
      .subscribe((requests_object: any) => {

        if (requests_object) {
          console.log('!!!!! CONTACTS DETAILS - REQUESTS OBJECTS ', requests_object);
          this.requests_list = requests_object['requests'];
          console.log('!!!!! CONTACTS DETAILS - REQUESTS GOT BY REQUESTER ID ', this.requests_list);
        }
      }, (error) => {
        console.log('!!!!! CONTACTS DETAILS - GET REQUEST BY REQUESTER ID - ERROR ', error);
      }, () => {
        console.log('!!!!! CONTACTS DETAILS - GET REQUEST BY REQUESTER ID * COMPLETE *');
      });
  }

  getContactById() {
    this.contactsService.getLeadById(this.requester_id)
      .subscribe((lead: any) => {

        if (lead) {
          console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID ', lead);
          this.contact_details = lead;
        }

      }, (error) => {

        console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID - ERROR ', error);

      }, () => {
        console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  }

  goBack() {
    this.location.back();
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
        return member_id = '- ' + bot['name'] + ' (bot)';
      } else {
        return '- ' + member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        const lastnameInizial = user['lastname'].charAt(0)
        return member_id = '- ' + user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        return '- ' + member_id
      }
    }
  }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_recipient: string) {
    this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
  }


}
