import { FaqKbService } from '../../../services/faq-kb.service';
import { UsersService } from '../../../services/users.service';
import { Chart } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';

// import * as moment from 'moment';
import moment from "moment"
import { Subscription, zip } from 'rxjs';
import { LoggerService } from '../../../services/logger/logger.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CHANNELS } from 'app/utils/util';

@Component({
  selector: 'appdashboard-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  lang: string;
  monthNames: any;
  selected: string;
  initDay: string;
  endDay: string;
  lastdays = 7;
  lineChart: any;
  subscription:Subscription;

  selectedDaysId: number;   // lastdays filter
  selectedAgentId: string;  // agent filter
  selectedChannelId: string;  // channel filter 

  projectUserAndBotsArray = []
  projectUsersList: any;
  projectBotsList: any;
  bots: any;
  messageCountLastMonth: any;
  conversationType = [
    { id: '', name: 'All' },
    ... CHANNELS
  ];

  constructor(
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private logger: LoggerService
    ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - MSGS] LANGUAGE ', this.lang);
    this.switchMonthName();
    this.getProjectUsersAndBots();
    this.getAggregateValue();

  }

  ngOnInit() {
    this.selected = 'day';
    this.selectedDaysId = 7;
    this.selectedAgentId = '';
    this.selectedChannelId = '';

    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY')
    this.logger.log("[ANALYTICS - MSGS] INIT", this.initDay, "END", this.endDay);

    this.getMessagesByLastNDays(this.selectedDaysId, this.selectedAgentId, this.selectedChannelId);
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

  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs

    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();
      zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        this.logger.log('[ANALYTICS - MSGS] - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        // console.log('[ANALYTICS - MSGS] - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

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
              // console.log('[ANALYTICS - MSGS] - GET P-USERS-&-BOTS - bot : ', bot);
              let botprefix = ''
              if (bot.type === "internal") {
                botprefix = "bot_"
              }
  
              this.projectUserAndBotsArray.push({ id: botprefix + bot._id, name: bot.name + ' (bot)' })
            });
        }

        this.logger.log('[ANALYTICS - MSGS] - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

      }, error => {
        this.logger.error('[ANALYTICS - MSGS] - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.logger.log('[ANALYTICS - MSGS] - GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  ngOnDestroy() {
    this.logger.log('[ANALYTICS - MSGS] - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  daysSelect(value, $event) {
    this.logger.log("[ANALYTICS - MSGS] daysSelect EVENT: ", $event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value / 30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    this.lineChart.destroy();
    this.getMessagesByLastNDays(value, this.selectedAgentId, this.selectedChannelId);
  }

  agentSelected(selectedAgentId) {
    this.logger.log("[ANALYTICS - MSGS] Selected agent: ", selectedAgentId);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    this.getMessagesByLastNDays(this.selectedDaysId, selectedAgentId, this.selectedChannelId)
    this.logger.log('[ANALYTICS - MSGS] REQUEST:', this.selectedDaysId, selectedAgentId)
  }

  conversationTypeSelected(selectedChannelId){
    this.logger.log("[ANALYTICS - CONVS]  Selected channel: ", selectedChannelId);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    this.getMessagesByLastNDays(this.selectedDaysId, '', selectedChannelId)
    this.logger.log('[ANALYTICS - MSGS] REQUEST:', this.selectedDaysId, selectedChannelId)
  }

  getAggregateValue() {
    this.analyticsService.getLastMountMessagesCount().subscribe((res: any) => {
      this.logger.log("[ANALYTICS - MSGS] LAST MONTH MESSAGES COUNT: ", res);
      if (res && res[0]) {
      this.messageCountLastMonth = res[0].totalCount;
      this.logger.log("[ANALYTICS - MSGS] Message Count: ", this.messageCountLastMonth);
    } else {
      this.logger.log("[ANALYTICS - MSGS] THRE ARE NOT MSG IN THE LAST MONTH");
      this.messageCountLastMonth = 0;
    }
    }, (error) => {
      this.logger.error("[ANALYTICS - MSGS] Impossible to retrieve monthly count", error)
      this.messageCountLastMonth = 0;
    })
  }

  getMessagesByLastNDays(lastdays, senderID, channelID) {
    this.logger.log("[ANALYTICS - MSGS] Lastdays: ", lastdays);
    
    this.subscription = this.analyticsService.getMessagesByDay(lastdays, senderID, channelID).subscribe((messagesByDay) => {
      this.logger.log("[ANALYTICS - MSGS] »» MESSAGES BY DAY RESULT: ", messagesByDay)

      const lastdays_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        lastdays_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      lastdays_initarray.reverse();
    //  console.log("[ANALYTICS - MSGS] »» LASTDAYS MESSAGES - INIT ARRAY: ", lastdays_initarray)

      const messagesByDay_series_array = [];
      const messagesByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const messagesByDay_array = [];
      for (let j = 0; j < messagesByDay.length; j++) {
        if (messagesByDay[j]) {
          messagesByDay_array.push({ 'count': messagesByDay[j]['count'], day: messagesByDay[j]['_id']['day'] + '/' + messagesByDay[j]['_id']['month'] + '/' + messagesByDay[j]['_id']['year'] })
        }
      }
      // console.log('[ANALYTICS - MSGS] - MESSAGES BY DAY FORMATTED ', messagesByDay_array);

      // MERGE lastdays_initarray & visitorsByDay_array
      const messagesByDay_final_array = lastdays_initarray.map(obj => messagesByDay_array.find(o => o.day === obj.day) || obj);
      this.logger.log('[ANALYTICS - MSGS] - MESSGES BY DAY - FINAL ARRAY ', messagesByDay_final_array);

      this.initDay = messagesByDay_final_array[0].day;
      this.endDay = messagesByDay_final_array[lastdays - 1].day;
      this.logger.log("[ANALYTICS - MSGS] INIT", this.initDay, "END", this.endDay);

      messagesByDay_final_array.forEach((msgByDay) => {
        messagesByDay_series_array.push(msgByDay.count)
        const splitted_date = msgByDay.day.split('/');
        messagesByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]]);
      })

      this.logger.log('[ANALYTICS - MSGS] »» MESSAGES BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', messagesByDay_series_array);
      this.logger.log('[ANALYTICS - MSGS] »» MESSAGES BY DAY - LABELS (+ NEW + ARRAY OF DAY)', messagesByDay_labels_array);

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
      this.logger.error('[ANALYTICS - MSGS] »» MESSAGES BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS - MSGS] »» MESSAGES BY DAY - * COMPLETE * ');
    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

}
