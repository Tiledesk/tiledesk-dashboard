import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UsersService } from 'app/services/users.service';
import { ContactsService } from 'app/services/contacts.service';
import { LoggerService } from 'app/services/logger/logger.service';
@Component({
  selector: 'appdashboard-home-analytics-indicator',
  templateUrl: './home-analytics-indicator.component.html',
  styleUrls: ['./home-analytics-indicator.component.scss']
})
export class HomeAnalyticsIndicatorComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  @Input() public projectId: string;
  @Input() public USER_ROLE: string;
  @Output() trackUserAction = new EventEmitter();
  countOfActiveContacts: number;
  countOfVisitors: number;
  countOfLastMonthMsgs: number;
  constructor(
    private analyticsService: AnalyticsService,
    public translate: TranslateService,
    private usersService: UsersService,
    private router: Router,
    private contactsService: ContactsService,
    private logger: LoggerService,
  ) { }

   // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    this.getUserRole() 
    this.inizializeHomeStatic()
  }

  inizializeHomeStatic() {
    this.getActiveContactsCount();
    this.getVisitorsCount();
    this.getLastMounthMessagesCount();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[HOME-ANALITICS] ngOnChanges changes ', changes)
    this.logger.log('[HOME-ANALITICS] ngOnChanges changes projectId ', this.projectId)

    if (changes.projectId &&  changes.projectId.firstChange === false) {
      this.logger.log('[HOME-ANALITICS] ngOnChanges changes changes.projectId.currentValue ', changes.projectId.currentValue)
      this.logger.log('[HOME-ANALITICS] ngOnChanges changes changes.projectId.previousValue ', changes.projectId.previousValue)
      if (changes.projectId.currentValue !== changes.projectId.previousValue) {
        this.logger.log('[HOME-ANALITICS] ngOnChanges changes HAS CHANGED PROJECT ')
        this.inizializeHomeStatic()
      }
    }
  }


  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.USER_ROLE = userRole;
      })
  }

  getActiveContactsCount() {
    this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
      this.logger.log('[HOME-ANALITICS] - GET ACTIVE LEADS RESPONSE ', activeleads)
      if (activeleads) {

        this.countOfActiveContacts = activeleads['count'];
        this.logger.log('[HOME-ANALITICS] - ACTIVE LEADS COUNT ', this.countOfActiveContacts)
      }
    }, (error) => {
      this.logger.error('[HOME-ANALITICS] - GET ACTIVE LEADS - ERROR ', error);

    }, () => {
      this.logger.log('[HOME-ANALITICS] - GET ACTIVE LEADS * COMPLETE *');
    });
  }

  getVisitorsCount() {
    this.analyticsService.getVisitors()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((visitorcounts: any) => {
        this.logger.log("HOME - GET VISITORS COUNT RES: ", visitorcounts)

        if (visitorcounts && visitorcounts.length > 0) {
          this.countOfVisitors = visitorcounts[0]['totalCount']
          this.logger.log("HOME - GET VISITORS COUNT: ", this.countOfVisitors)
        } else {
          this.countOfVisitors = 0
        }
      }, (error) => {
        this.logger.error('[HOME-ANALITICS] - GET VISITORS COUNT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-ANALITICS] - GET VISITORS COUNT * COMPLETE *');
      });
  }

  getLastMounthMessagesCount() {
    this.analyticsService.getLastMountMessagesCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((msgscount: any) => {
       this.logger.log('[HOME-ANALITICS] - GET LAST 30 DAYS MESSAGE COUNT RES', msgscount);
        if (msgscount && msgscount.length > 0) {
          this.countOfLastMonthMsgs = msgscount[0]['totalCount']

          this.logger.log('[HOME-ANALITICS] - GET LAST 30 DAYS MESSAGE COUNT ', this.countOfLastMonthMsgs);
        } else {
          this.countOfLastMonthMsgs = 0;
        }
      }, (error) => {
        this.logger.error('[HOME-ANALITICS] - GET LAST 30 DAYS MESSAGE - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-ANALITICS] - GET LAST 30 DAYS MESSAGE * COMPLETE *');
      });
  }



  goToVisitorsAnalytics() {
    this.trackUserAction.emit({action:'Filter Unique Visitors in analytics',actionRes: null })
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics/visitors']);
    }
  }

  goToMessagesAnalytics() {
    // this.router.navigate(['project/' + this.projectId + '/messages-analytics']);
    this.trackUserAction.emit({action:'Filter Messages in analytics',actionRes: null })
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics/messages']);
    }
  }

  goToContacts() {
    this.trackUserAction.emit({action:'Go to contacts',actionRes: null })
    this.router.navigate(['project/' + this.projectId + '/contacts']);
  }

}
