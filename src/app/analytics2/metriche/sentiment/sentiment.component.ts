import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService } from 'app/services/analytics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appdashboard-sentiment',
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.scss']
})
export class SentimentComponent implements OnInit, OnDestroy {
  numberAVGtime: any;
  responseAVGtime: any;
  selectedDaysId: any;
  initDay: any;
  endDay: any;
  selectedDeptId: any;
  departments: any;
  daysSelect: any;
  depSelected: any;

  subscription: Subscription;


  constructor(private analyticsService: AnalyticsService, ) { }


  ngOnInit() {

    this.getSatisfactionNumberHEART();
  }

  ngOnDestroy() {
    console.log('!!! ANALYTICS.RICHIESTE - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  getSatisfactionNumberHEART() {
    this.subscription = this.analyticsService.getSatisfactionDataHEART().subscribe((res) => {
      console.log('RES', res)
    })
  }

}
