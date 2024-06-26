import { FaqKbService } from '../../../services/faq-kb.service';
import { UsersService } from '../../../services/users.service';
import { DepartmentService } from '../../../services/department.service';
import { Subscription, zip } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import moment from "moment";
import { LoggerService } from '../../../services/logger/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { AnalyticsService } from 'app/services/analytics.service';
import { CHANNELS } from 'app/utils/util';

@Component({
  selector: 'appdashboard-satisfaction',
  templateUrl: './satisfaction.component.html',
  styleUrls: ['./satisfaction.component.scss']
})
export class SatisfactionComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<any> = new Subject<any>();
  lang: string;

  selectedDaysId: number;   // lastdays filter
  selectedDeptId: string;   // department filter
  selectedAgentId: string;  // agent filter 
  selectedChannelId: string;  // channel filter 

  avgSatisfaction: any;
  selected: string;
  departments: any;
  initDay: string;
  endDay: string;
  lastdays = 7;
  monthNames: any;
  barChart: any;
  subscription: Subscription;

  xValueSatisfaction: any;
  yValueSatisfaction: any;

  projectUserAndBotsArray = []
  projectUsersList: any;
  projectBotsList: any;
  bots: any;
  conversationType = [
    { id: '', name: 'All' },
    ... CHANNELS
  ];

  constructor(
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private logger: LoggerService
  ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - SATISFACTION] LANGUAGE ', this.lang);
    this.switchMonthName();

  }

  // -------------------------------------------
  // @ Lifehooks
  // -------------------------------------------
  ngOnInit() {
    this.selectedDaysId = 7;
    this.selectedDeptId = '';
    this.selected = 'day';
    this.selectedAgentId = '';
    this.selectedChannelId = '';

    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY');
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY');
    this.logger.log("[ANALYTICS - SATISFACTION] INIT", this.initDay, "END", this.endDay);

    this.getDepartments();
    this.getProjectUsersAndBots();
    this.getAvgSatisfaction();
    this.getSatisfactionByLastNDays(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
  }

  ngOnDestroy() {
    this.logger.log('[ANALYTICS - SATISFACTION] - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  switchMonthName() {
    // if (this.lang) {
    //   if (this.lang === 'it') {
    //     this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
    //   } else {
    //     this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
    //   }
    // }

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

  daysSelect(value, event) {
    this.logger.log("[ANALYTICS - SATISFACTION] daysSelect EVENT: ", event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value / 30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
  }

  depSelected(selectedDeptId: string) {
    this.logger.log('[ANALYTICS - SATISFACTION] Department selected: ', selectedDeptId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(this.selectedDaysId, selectedDeptId, this.selectedAgentId, this.selectedChannelId);
  }

  agentSelected(selectedAgentId) {
    this.logger.log("[ANALYTICS - SATISFACTION] Selected agent: ", selectedAgentId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(this.selectedDaysId, this.selectedDeptId, selectedAgentId, this.selectedChannelId)
    this.logger.log('[ANALYTICS - SATISFACTION] agentSelected REQUEST:', this.selectedDaysId, this.selectedDeptId, selectedAgentId)
  }

  conversationTypeSelected(selectedChannelId){
    this.logger.log("[ANALYTICS - CONVS]  Selected channel: ", selectedChannelId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, selectedChannelId)
    this.logger.log('[ANALYTICS - SATISFACTION] selectedChannelId REQUEST:', this.selectedDaysId, this.selectedDeptId, this.selectedAgentId)
  }

  getDepartments() {
    this.departmentService.getDeptsByProjectId()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((_departments: any) => {
        this.logger.log('[ANALYTICS - SATISFACTION] - GET DEPTS RESPONSE by analitycs ', _departments);
        this.departments = _departments

      }, error => {
        this.logger.error('[ANALYTICS - SATISFACTION] - GET DEPTS - ERROR: ', error);
      }, () => {
        this.logger.log('[ANALYTICS - SATISFACTION] - GET DEPTS * COMPLETE *')
      });
  }

  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs

    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();


    zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        this.logger.log('[ANALYTICS - SATISFACTION] - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('[ANALYTICS - SATISFACTION] - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

        if (pair && pair._projectUsers) {
          this.projectUsersList = pair._projectUsers;

          this.projectUsersList.forEach(p_user => {
            this.projectUserAndBotsArray.push({ id: p_user.id_user._id, name: p_user.id_user.firstname + ' ' + p_user.id_user.lastname });
          });
        }

        if (pair && pair._bots) {
          this.bots = pair._bots
            .filter(bot => {
              if (bot['trashed'] === false) {
                return true
              } else {
                return false
              }
            })

          this.bots.forEach(bot => {
            this.projectUserAndBotsArray.push({ id: 'bot_' + bot._id, name: bot.name + ' (bot)' })
          });
        }

        this.logger.log('[ANALYTICS - SATISFACTION] - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

      }, error => {
        this.logger.error('[ANALYTICS - SATISFACTION] - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.logger.log('[ANALYTICS - SATISFACTION]- GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  getAvgSatisfaction() {
    this.analyticsService.getAvgSatisfaction().then((res) => {
      this.logger.log("[ANALYTICS - SATISFACTION] !!! AVG Satisfaction: ", res);
      this.avgSatisfaction = res[0].satisfaction_avg;
    }).catch((err) => {
      this.logger.error("[ANALYTICS - SATISFACTION] Error during getAvgSatisfaction: ", err);
      this.avgSatisfaction = 0;
    })
  }

  getSatisfactionByLastNDays(lastdays, depId, participantId, channelId) {
    this.subscription = this.analyticsService.getSatisfactionByDay(lastdays, depId, participantId, channelId).subscribe((satisfactionByDay: any) => {
      this.logger.log("[ANALYTICS - SATISFACTION] »» SATISFACTION BY DAY RESULT: ", satisfactionByDay);

      const requestSatisfactionByDays_series_array = [];
      const requestSatisfactionByDays_labels_array = [];

      if (satisfactionByDay) {
        const lastNdays_initarraySatisfaction = [];
        for (let i = 0; i < lastdays; i++) {
          lastNdays_initarraySatisfaction.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 });
        }
        lastNdays_initarraySatisfaction.reverse();
        this.logger.log('[ANALYTICS - SATISFACTION] - REQUESTS SATISFACTION BY DAY - (init array)', lastNdays_initarraySatisfaction);

        const customSatisfactionChart = [];

        for (let j in satisfactionByDay) {
          this.logger.log("[ANALYTICS - SATISFACTION] ****** satisfaction: ", satisfactionByDay[j]);
          if (satisfactionByDay[j].satisfaction_avg == null) {
            satisfactionByDay[j].satisfaction_avg = 0;
          }
          // customSatisfactionChart.push({ date: new Date(satisfactionByDay[j]._id.year, satisfactionByDay[j]._id.month - 1, satisfactionByDay[j]._id.day).toLocaleDateString(), value: satisfactionByDay[j].satisfaction_avg });
          customSatisfactionChart.push({ date: satisfactionByDay[j]._id.day + '/' + satisfactionByDay[j]._id.month + '/' + satisfactionByDay[j]._id.year, value: satisfactionByDay[j].satisfaction_avg });

        }

        this.logger.log('[ANALYTICS - SATISFACTION] Satisfaction data:', customSatisfactionChart);

        // build a final array that compars value between the two arrray before builded with respect to date key value
        const satisfactionByDays_final_array = lastNdays_initarraySatisfaction.map(obj => customSatisfactionChart.find(o => o.date === obj.date) || obj);
        this.logger.log('[ANALYTICS - SATISFACTION] - REQUESTS SATISFACTION BY DAY - FINAL ARRAY ', satisfactionByDays_final_array);

        // const requestSatisfactionByDays_series_array = [];
        // const requestSatisfactionByDays_labels_array = [];

        // select init and end day to show on div
        this.initDay = satisfactionByDays_final_array[0].date;
        this.endDay = satisfactionByDays_final_array[lastdays - 1].date;
        this.logger.log('[ANALYTICS - SATISFACTION] INIT', this.initDay, 'END', this.endDay);

        satisfactionByDays_final_array.forEach(requestByDay => {
          //this.logger.log('»» !!! ANALYTICS - REQUESTS SATISFACTION BY DAY - requestByDay', requestByDay);
          requestSatisfactionByDays_series_array.push(requestByDay.value);

          const splitted_date = requestByDay.date.split('/');
          //this.logger.log('»» !!! ANALYTICS - REQUESTS SATISFACTION BY DAY - SPLITTED DATE', splitted_date);
          requestSatisfactionByDays_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        })

        this.xValueSatisfaction = requestSatisfactionByDays_labels_array;
        this.yValueSatisfaction = requestSatisfactionByDays_series_array;

        this.logger.log('[ANALYTICS - SATISFACTION] Xlabel-Satisfaction', this.xValueSatisfaction);
        this.logger.log('[ANALYTICS - SATISFACTION] Ylabel-Satisfaction', this.yValueSatisfaction);

      } else {
        this.logger.error('[ANALYTICS - SATISFACTION] !!!ERROR!!! while get data from resouces for requests satisfaction graph');
      }

      // set the stepsize
      let stepsize: number;
      if (this.selectedDaysId > 60) {
        stepsize = 10;
      } else {
        stepsize = this.selectedDaysId
      }
      const lang = this.lang;
      const higherCount = this.getMaxOfArray(requestSatisfactionByDays_series_array);

      this.barChart = new Chart('satisfactionRating', {
        type: 'bar',
        data: {
          labels: requestSatisfactionByDays_labels_array,
          datasets: [{
            label: 'Daily satisfaction: ',
            data: requestSatisfactionByDays_series_array,
            fill: false, // riempie zona sottostante dati
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
          }]
        },
        options: {
          maintainAspectRatio: false,
          title: {
            text: 'DURATION CONVERSATION LENGHT RESPONSE',
            display: false
          },
          legend: {
            display: false // do not show label title
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: stepsize,
                display: true,
                minRotation: 0,
                fontColor: 'black'
              },
              gridLines: {
                display: false,
                borderDash: [8, 4],
                // color:'rgba(255, 255, 255, 0.5)',
              }
            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4],
                // color:'rgba(255, 255, 255, 0.5)',
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
                suggestedMax: 5,
                stepSize: 1
              },

            }]
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                const currentItemValue = tooltipItem.yLabel;
                return this.translate.instant('DailyAverage') + ": " + currentItemValue;
                // if (lang == 'it') {
                //   return 'Media giornaliera: ' + currentItemValue;
                // } else {
                //   return 'Daily average: ' + currentItemValue;
                // }
              }
            }
          }
        }
      });

    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }



  // TO CHECK !!!!!!!!
  stepSize(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000) // 1 Hour = 36000 Milliseconds
    const minutes = Math.floor((milliseconds % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    const seconds = Math.round(((milliseconds % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

    if (hours !== 0) {
      return (Math.floor((milliseconds / 4) / (1000 * 60 * 60))) * 1000 * 60 * 60
    } else {
      return (Math.floor((milliseconds / 4) / (1000 * 60))) * 1000 * 60
    }

  }

}
