import { Chart } from 'chart.js';
import { AnalyticsService } from './../../services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'appdashboard-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  lang: string;
  monthNames: any;
  selected: string;
  selectedDaysId: number;
  initDay: string;
  endDay: string;
  lastdays = 7;

  constructor(private translate: TranslateService,
    private analyticsService: AnalyticsService) {

    this.lang = this.translate.getDefaultLang();
    console.log('LANGUAGE ', this.lang);
    this.switchMonthName();

  }

  ngOnInit() {
    this.selected = 'day';
    this.selectedDaysId = 7;

    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY')

    this.getMessagesByLastNDays(this.selectedDaysId);
  }

  switchMonthName() {
    if (this.lang) {
      if (this.lang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }

  daysSelect(value, event) {
    console.log("EVENT: ", event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value / 30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    this.getMessagesByLastNDays(value);
  }

  getMessagesByLastNDays(lastdays) {
    this.analyticsService.getMessagesByDay().subscribe((messagesByDay) => {
      console.log("»» MESSAGES BY DAY RESULT: ", messagesByDay)

      const lastdays_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        lastdays_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
      }

      lastdays_initarray.reverse();
      console.log("»» LASTDAYS MESSAGES - INIT ARRAY: ", lastdays_initarray)

      const messagesByDay_series_array = [];
      const messagesByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const messagesByDay_array = [];
      for (let j = 0; j < messagesByDay.length; j++) {
        if (messagesByDay[j]) {
          messagesByDay_array.push({ 'count': messagesByDay[j]['count'], day: messagesByDay[j]['_id']['day'] + '-' + messagesByDay[j]['_id']['month'] + '-' + messagesByDay[j]['_id']['year'] })
        }
      }

      // MERGE lastdays_initarray & visitorsByDay_array
      const messagesByDay_final_array = lastdays_initarray.map(obj => messagesByDay_array.find(o => o.day === obj.day) || obj);

      this.initDay = messagesByDay_final_array[0].day;
      this.endDay = messagesByDay_final_array[lastdays - 1].days;

      messagesByDay_final_array.forEach((msgByDay) => {
        messagesByDay_series_array.push(msgByDay.count)
        const splitted_date = msgByDay.day.split('-');
        messagesByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]]);
      })

      console.log('»» MESSAGES BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', messagesByDay_series_array);
      console.log('»» MESSAGES BY DAY - LABELS (+ NEW + ARRAY OF DAY)', messagesByDay_labels_array);

      const higherCount = this.getMaxOfArray(messagesByDay_series_array);

      let lang = this.lang;

      var lineChart = new Chart('lastdaysMessages', {
        type: 'line',
        data: {
          labels: messagesByDay_labels_array,
          datasets: [{
            label: 'Number of visitors in last 7 days ',
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
              label: function (tooltipItem, data) {
                const currentItemValue = tooltipItem.yLabel

                if (lang == 'it') {
                  return 'Messaggi: ' + currentItemValue;
                } else {
                  return 'Messages: ' + currentItemValue;
                }
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font = "Google Sans"
            var chartArea = chartInstance.chartArea;
          }
        }]
      })
    }, (error) => {
      console.log('»» MESSAGES BY DAY - ERROR ', error);
    }, () => {
      console.log('»» VISITORS BY DAY - * COMPLETE * ');
    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

}
