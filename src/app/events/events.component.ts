import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { UsersService } from '../services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'appdashboard-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  project_id: string;
  contact_id: string;
events: any;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {
    this.getParams();
  }

  ngOnInit() {
    // this.getCurrentProject();

  }

  getParams() {
    this.route.params.subscribe((params) => {

      console.log('EVENTS COMP - GET PARAMS  ', params)

      this.project_id = params['projectid']
      this.contact_id = params['requesterid']


        this.usersService.subscriptionToWsContactEvents(this.project_id, this.contact_id);
        this.getContactsEvents$()
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        // this.projectId = project._id
        // console.log('00 -> !!!! CONTACTS project ID from AUTH service subscription  ', this.projectId)

      

      }
    });
  }


  getContactsEvents$() {
    this.usersService.contactsEvents$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contactevents) => {
        console.log('EVENTS COMP $UBSC TO WS CONTACT EVENT ', contactevents);
        // this.events = contactevents;
        this.events = contactevents

        // contactevents.forEach(contactevent => {

        //   const index = this.events.findIndex((e) => e.id === contactevent['_id']);

        //   if (index === -1) { 
  
        //     this.events.push({ 'name': contactevent['name'], 'createdAt': contactevent['createdAt']})
  
        //   }
          
        // });
    

      }, (error) => {
        console.log('EVENTS COMP $UBSC TO WS CONTACT EVENT ', error);
      }, () => {
        console.log('EVENTS COMP $UBSC TO WS CONTACT EVENT * COMPLETE *');
      })

  }


}
