import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment'
import moment from "moment";
import { Chart } from 'chart.js';
import { LoggerService } from '../../../services/logger/logger.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'appdashboard-events-analytics',
  templateUrl: './events-analytics.component.html',
  styleUrls: ['./events-analytics.component.scss']
})
export class EventsAnalyticsComponent implements OnInit {

  lineChart: any;
  lang: String;

  monthNames: any;
  lastdays = 7;
  initDay: string;
  endDay: string;
  selected: string;

  selectedDaysId: number;   // lastdays filter
  selectedEventName: string;  // events filter

  subscription: Subscription;
  eventsList = [];
  eventsNameList = [];
  // staticEventsNameList = [
  //   { name: 'Authentication Triggers', value: 'auth_state_changed' },
  //   { name: 'New Conversation', value: 'new_conversation' },
  // ]
  staticEventsNameList = [
    { name: 'Page loads', value: 'auth_state_changed' },
    { name: 'New Conversations', value: 'new_conversation' },
  ]

  eventsCountLastMonth: any;

  constructor(
    private analyticsService: AnalyticsService,
    private translate: TranslateService,
    private logger: LoggerService
  ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - EVENTS] LANGUAGE ', this.lang);
    this.switchMonthName();
  }

  ngOnInit() {
    this.selected = 'day';
    this.selectedDaysId = 7;
    // this.selectedEventName = '';
    this.selectedEventName = this.staticEventsNameList[0].value;

    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY')
    this.logger.log("[ANALYTICS - EVENTS] INIT", this.initDay, "END", this.endDay);

    this.getEventsName();
    this.getEventsByLastNDays(this.selectedDaysId, this.selectedEventName);
    this.logger.log("[ANALYTICS - EVENTS] EVENTS FOR: ", this.selectedDaysId, this.selectedEventName);

  }

  getAggregateValue() {
    this.analyticsService.getLastMountConversationsCount().subscribe((res: any) => {
      this.logger.log("[ANALYTICS - EVENTS] LAST MONTH CONVERSATIONS COUNT: ", res);
      this.eventsCountLastMonth = res[0].totalCount;
      this.logger.log("[ANALYTICS - EVENTS]Events Count: ", this.eventsCountLastMonth);
    }, (error) => {
      this.logger.error("[ANALYTICS - EVENTS] Impossible to retrieve monthly count", error)
      this.eventsCountLastMonth = 0;
    })
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
    this.logger.log("[ANALYTICS - EVENTS] daysSelect EVENT: ", event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value / 30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    this.lineChart.destroy();

    this.getEventsByLastNDays(value, this.selectedEventName); // ---> aggiungere event name
  }

  eventSelected(selectedEventName) {
    this.logger.log("[ANALYTICS - EVENTS] Selected event: ", selectedEventName);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    this.getEventsByLastNDays(this.selectedDaysId, selectedEventName);
    this.logger.log("[ANALYTICS - EVENTS] EVENTS FOR: ", this.selectedDaysId, selectedEventName);
  }

  getEventsName() {
    this.analyticsService.getEventsList().subscribe((res: any) => {
      this.logger.log("[ANALYTICS - EVENTS] GET EVENTS LIST RESPONSE: ", res);
      this.eventsList = res;
      for (let event of this.eventsList) {
        if (this.eventsNameList.includes(event._id.name)) {
          this.logger.log("[ANALYTICS - EVENTS] Event already exists in array")
        } else {
          this.eventsNameList.push(event._id.name);
          this.logger.log("[ANALYTICS - EVENTS] Events Name List: ", this.eventsNameList)
        }
      }

    })
  }

  getEventsByLastNDays(lastdays, eventName) {
    this.logger.log("[ANALYTICS - EVENTS] Lastdays: ", lastdays);

    // this.subscription = this.analyticsService.getEventByDay(lastdays, eventName).subscribe((eventsByDay) => {
    //   this.logger.log("»» EVENTS BY DAY RESULT: ", eventsByDay);
    // })

    this.subscription = this.analyticsService.getEventByDay(lastdays, eventName).subscribe((eventsByDay) => {
      this.logger.log("[ANALYTICS - EVENTS] BY DAY RESULT: ", eventsByDay);

      const lastdays_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        lastdays_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      lastdays_initarray.reverse();
      this.logger.log("»» LASTDAYS MESSAGES - INIT ARRAY: ", lastdays_initarray)

      const eventsByDay_series_array = [];
      const eventsByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const eventsByDay_array = [];
      if (eventsByDay) {
        for (let j = 0; j < eventsByDay.length; j++) {
          if (eventsByDay[j]) {
            eventsByDay_array.push({ 'count': eventsByDay[j]['count'], day: eventsByDay[j]['_id']['day'] + '/' + eventsByDay[j]['_id']['month'] + '/' + eventsByDay[j]['_id']['year'] })
          }
        }
      }
      this.logger.log('[ANALYTICS - EVENTS] - MESSAGES BY DAY FORMATTED ', eventsByDay_array);

      // MERGE lastdays_initarray & visitorsByDay_array
      const eventsByDay_final_array = lastdays_initarray.map(obj => eventsByDay_array.find(o => o.day === obj.day) || obj);
      this.logger.log('[ANALYTICS - EVENTS] - MESSGES BY DAY - FINAL ARRAY ', eventsByDay_final_array);

      this.initDay = eventsByDay_final_array[0].day;
      this.endDay = eventsByDay_final_array[lastdays - 1].day;
      this.logger.log("[ANALYTICS - EVENTS] INIT", this.initDay, "END", this.endDay);

      eventsByDay_final_array.forEach((msgByDay) => {
        eventsByDay_series_array.push(msgByDay.count)
        const splitted_date = msgByDay.day.split('/');
        eventsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]]);
      })

      this.logger.log('[ANALYTICS - EVENTS] »» MESSAGES BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', eventsByDay_series_array);
      this.logger.log('[ANALYTICS - EVENTS] »» MESSAGES BY DAY - LABELS (+ NEW + ARRAY OF DAY)', eventsByDay_labels_array);

      const higherCount = this.getMaxOfArray(eventsByDay_series_array);

      var stepsize;
      if (this.selectedDaysId > 60) {
        stepsize = 10;
      }
      else {
        stepsize = this.selectedDaysId
      }

      let lang = this.lang;

      this.lineChart = new Chart('lastdaysEvents', {
        type: 'line',
        data: {
          labels: eventsByDay_labels_array,
          datasets: [{
            label: 'Number of messages',
            data: eventsByDay_series_array,
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
                
                return this.translate.instant('Analytics.Metrics.Events') + ": " + currentItemValue;
                // if (lang == 'it') {
                //   return 'Eventi: ' + currentItemValue;
                // } else {
                //   return 'Events: ' + currentItemValue;
                // }
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font ='Roboto';
            var chartArea = chartInstance.chartArea;
          }
        }]
      })
    }, (error) => {
      this.logger.error('[ANALYTICS - EVENTS] »» EVENTS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS - EVENTS] »» EVENTS BY DAY - * COMPLETE * ');
    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

}
