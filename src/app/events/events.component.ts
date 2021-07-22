import { Component, OnInit , OnDestroy} from '@angular/core';
import { AuthService } from '../core/auth.service';
import { UsersService } from '../services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '../services/logger/logger.service';
@Component({
  selector: 'appdashboard-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit,  OnDestroy {
  project_id: string;
  contact_id: string;
  events: any;
  showSpinner = false;
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private route: ActivatedRoute,
    private logger: LoggerService
  ) {
    this.getParams();
  }

  ngOnInit() {
    // this.getCurrentProject();

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getParams() {
    this.route.params.subscribe((params) => {

      this.logger.log('[EVENTS-COMP] - GET PARAMS  ', params)

      this.project_id = params['projectid']
      this.contact_id = params['requesterid']


      this.usersService.subscriptionToWsContactEvents(this.project_id, this.contact_id);
      this.getContactsEvents$()
    });
  }

  // getCurrentProject() {
  //   this.auth.project_bs.subscribe((project) => {

  //     if (project) {
  //       // this.projectId = project._id
  //       // this.logger.log('[EVENTS-COMP] project ID from AUTH service subscription  ', this.projectId)
  //     }
  //   });
  // }


  getContactsEvents$() {
    this.usersService.contactsEvents$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((contactevents) => {
        this.logger.log('[EVENTS-COMP] $UBSC TO WS CONTACT EVENT ', contactevents);
        // this.events = contactevents;
        this.events = contactevents

        // contactevents.forEach(contactevent => {
        //   const index = this.events.findIndex((e) => e.id === contactevent['_id']);
        //   if (index === -1) { 
        //     this.events.push({ 'name': contactevent['name'], 'createdAt': contactevent['createdAt']})
        //   }
        // });

      }, (error) => {
        this.logger.error('EVENTS COMP $UBSC TO WS CONTACT EVENT ', error);
      }, () => {
        this.logger.log('EVENTS COMP $UBSC TO WS CONTACT EVENT * COMPLETE *');
      })
  }

}
