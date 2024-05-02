import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';
import { Subscription } from 'rxjs';
import moment from "moment"
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js';
import { UsersService } from 'app/services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'appdashboard-messages-stats-modal',
  templateUrl: './messages-stats-modal.component.html',
  styleUrls: ['./messages-stats-modal.component.scss']
})

export class MessagesStatsModalComponent implements OnInit {
  public agentName: string;
  public agentId: string;
  lang: string;
  selectedDaysId: number;
  monthNames: any;
  selected: string;
  initDay: string;
  endDay: string;
  lastdays = 7;
  lineChart: any;
  subscription:Subscription;
  showSpinner: boolean = true;
  private unsubscribe$: Subject<any> = new Subject<any>();
  public USER_ROLE: string;
  
  projectId: string

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MessagesStatsModalComponent>,
    private logger: LoggerService,
    private analyticsService: AnalyticsService,
    private translate: TranslateService,
    private usersService: UsersService,
    public auth: AuthService,
    private router: Router,
  ) {
    this.logger.log('[MSGS-STATS-MODAL] data ', data)
    if (data && data.agent) {
      this.logger.log('[MSGS-STATS-MODAL] data  > hasOwnProperty email', data.agent.hasOwnProperty('email'))
      if ( data.agent.hasOwnProperty('email')) { 
        this.logger.log('[MSGS-STATS-MODAL] data  >  data.agent.lastname.length', data.agent.lastname.lenght)
        if (data.agent.firstname && data.agent.lastname !== "" ) {
          this.agentName = data.agent.firstname + ' ' + data.agent.lastname
        } else if (data.agent.firstname && data.agent.lastname === "" ){
          this.agentName = data.agent.firstname
        }
      } else {
        this.agentName = data.agent.name;
      }
      
      this.logger.log('[MSGS-STATS-MODAL] data  > agentName',  this.agentName)
      this.agentId = data.agent._id;
      this.logger.log('[MSGS-STATS-MODAL] data  > agentId',  this.agentId)
     
      // if (data.agent) 
    }
  }

  ngOnInit(): void {
    this.lang = this.translate.getBrowserLang();
    this.selected = 'day';
    this.selectedDaysId = 7;
    
    this.switchMonthName();
    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY')
    this.logger.log("[consoCHATBOT-STATS-MODALl] INIT", this.initDay, "END", this.endDay);
    this.getMessagesByLastNDays(this.selectedDaysId, this.agentId);
    this.getUserRole()
    this.getCurrentProject()
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
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

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[ActivitiesComponent] - projectId ', this.projectId)
      }
    });
  }

  switchMonthName() {
    this.monthNames =
    {
      '1': moment.monthsShort(0),
      '2': moment.monthsShort(1),
      '3': moment.monthsShort(2),
      '4': moment.monthsShort(3),
      '5': moment.monthsShort(4),
      '6': moment.monthsShort(5),
      '7': moment.monthsShort(6),
      '8': moment.monthsShort(7),
      '9': moment.monthsShort(8),
      '10': moment.monthsShort(9),
      '11': moment.monthsShort(10),
      '12': moment.monthsShort(11)
    }

  }

  onOkPresssed() {
    this.dialogRef.close(this.agentId);
    this.subscription.unsubscribe();
  }

  goToRequestsAnalytics() {
    this.router.navigate(['project/' + this.projectId + '/analytics/metrics']);
    this.dialogRef.close(null);
  }

  daysSelect(value, $event) {
    this.logger.log("[CHATBOT-STATS-MODAL] daysSelect EVENT: ", $event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value / 30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    this.lineChart.destroy();
    this.getMessagesByLastNDays(value, this.agentId);
  }

  getMessagesByLastNDays(lastdays, senderID) {
    this.logger.log("[CHATBOT-STATS-MODALl] Lastdays: ", lastdays);
    
    this.subscription = this.analyticsService.getMessagesByDay(lastdays, senderID).subscribe((messagesByDay) => {
      this.logger.log("[CHATBOT-STATS-MODALl] »» MESSAGES BY DAY RESULT: ", messagesByDay)

      const lastdays_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        lastdays_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      lastdays_initarray.reverse();
    //  console.log("[CHATBOT-STATS-MODALl] »» LASTDAYS MESSAGES - INIT ARRAY: ", lastdays_initarray)

      const messagesByDay_series_array = [];
      const messagesByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const messagesByDay_array = [];
      for (let j = 0; j < messagesByDay.length; j++) {
        if (messagesByDay[j]) {
          messagesByDay_array.push({ 'count': messagesByDay[j]['count'], day: messagesByDay[j]['_id']['day'] + '/' + messagesByDay[j]['_id']['month'] + '/' + messagesByDay[j]['_id']['year'] })
        }
      }
      // console.log('[CHATBOT-STATS-MODALl] - MESSAGES BY DAY FORMATTED ', messagesByDay_array);

      // MERGE lastdays_initarray & visitorsByDay_array
      const messagesByDay_final_array = lastdays_initarray.map(obj => messagesByDay_array.find(o => o.day === obj.day) || obj);
      this.logger.log('[CHATBOT-STATS-MODALl] - MESSGES BY DAY - FINAL ARRAY ', messagesByDay_final_array);

      this.initDay = messagesByDay_final_array[0].day;
      this.endDay = messagesByDay_final_array[lastdays - 1].day;
      this.logger.log("[CHATBOT-STATS-MODALl] INIT", this.initDay, "END", this.endDay);

      messagesByDay_final_array.forEach((msgByDay) => {
        messagesByDay_series_array.push(msgByDay.count)
        const splitted_date = msgByDay.day.split('/');
        messagesByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]]);
      })

      this.logger.log('[CHATBOT-STATS-MODALl] »» MESSAGES BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', messagesByDay_series_array);
      this.logger.log('[CHATBOT-STATS-MODALl] »» MESSAGES BY DAY - LABELS (+ NEW + ARRAY OF DAY)', messagesByDay_labels_array);

      const higherCount = this.getMaxOfArray(messagesByDay_series_array);

      var stepsize;
      if(this.selectedDaysId>60){
          stepsize=10;
      }
      else {
        stepsize=this.selectedDaysId
      }

      let lang = this.lang;

      this.lineChart = new Chart('lastdaysMessages', {
        type: 'line',
        data: {
          labels: messagesByDay_labels_array,
          datasets: [{
            label: 'Number of messages',
            data: messagesByDay_series_array,
            fill: true,
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: '#1e88e5'
          }]
        },
        options: {
          maintainAspectRatio: false,
          title: {
            text: 'TITLE',
            display: false
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                maxTicksLimit: stepsize,
                fontColor: 'black'
              },
              gridLines: {
                display: true,
                borderDash: [8, 4]
              }
            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4]
              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: higherCount + 2
              }
            }]
          },
          tooltips: {
            callbacks: {
              label:  (tooltipItem, data) => {
                const currentItemValue = tooltipItem.yLabel
                

                return this.translate.instant('RequestMsgsPage.Messages') + ": " + currentItemValue;
                // if (lang == 'it') {
                //   return 'Messaggi: ' + currentItemValue;
                // } else {
                //   return 'Messages: ' + currentItemValue;
                // } 
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font = 'Roboto';
            var chartArea = chartInstance.chartArea;
          }
        }]
      })
    }, (error) => {
      this.logger.error('[CHATBOT-STATS-MODALl] »» MESSAGES BY DAY - ERROR ', error);
      this.showSpinner = false
    }, () => {
      this.logger.log('[CHATBOT-STATS-MODALl] »» MESSAGES BY DAY - * COMPLETE * ');
      this.showSpinner = false
    })

  }


  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }


}
