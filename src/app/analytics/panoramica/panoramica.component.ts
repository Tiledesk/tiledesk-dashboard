// import { Subscription } from 'rxjs/Subscription';
import { Subscription } from 'rxjs'
import { Component, OnInit, ViewChild } from '@angular/core';
// import * as moment from 'moment';
import moment from "moment";
import * as moment_tz from 'moment-timezone'
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { TranslateService } from '@ngx-translate/core';

import { Chart } from 'chart.js';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from '../../services/logger/logger.service';


import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexChart,
  ApexPlotOptions,
  ApexXAxis,
  ApexGrid, 
  ApexStroke
} from "ng-apexcharts";
import { AnalyticsService } from 'app/services/analytics.service';
import { RoleService } from 'app/services/role.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  fill: any;
  colors: any;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke
};

@Component({
  selector: 'appdashboard-panoramica',
  templateUrl: './panoramica.component.html',
  styleUrls: ['./panoramica.component.scss']
})
export class PanoramicaComponent implements OnInit {
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  monthNames: any;
  lang: string;

  dataSource: Object;
  xAxis: Object;
  yAxis: Object;
  titleSettings: Object;
  cellSettings: Object;
  legendSettings: any; // nk
  paletteSettings: Object;
  customData = [];
  xlabel: any;
  ylabel: any;
  xlabel_ita = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  xlabel_eng = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ylabel_ita = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00']
  ylabel_eng = ['1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm', '12pm']
  weekday: any;
  hour: any;

  subscription: Subscription;

  showSpinner: boolean = true;
  heatmapEND: boolean
  chartEND: boolean

  // avg time clock variable 
  numberAVGtime: String;
  unitAVGtime: String;
  responseAVGtime: String

  // duration time clock variable
  numberDurationCNVtime: String;
  unitDurationCNVtime: String;
  responseDurationtime: String;
  consversationLabel: string

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);
  formattedHeatMapRes: any;
  
  constructor(
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private auth: AuthService,
    private logger: LoggerService,
    private roleService: RoleService
  ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - OVERVIEW] LANGUAGE ', this.lang);
    this.getBrowserLangAndSwitchMonthName();
    this.getHeatMapSeriesDataByLang();

    //this.startTimer();
  }





  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    this.roleService.checkRoleForCurrentProject('panoramica');
    this.getRequestByLast7Day();

    this.avarageWaitingTimeCLOCK();
    this.durationConvTimeCLOCK();
    this.getHeatMapDataAndBuildGraph()
  }

  async showHideSpinner() {
    if (this.heatmapEND === true && this.chartEND === true) {
      this.showSpinner = false
    }
  }

  startTimer() {
    let timeLeft: number = 5;
    let interval;
    interval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        this.logger.log("[ANALYTICS - OVERVIEW] startTimer timeLeft ", timeLeft)
      }

    }, 1000)

  }


  ngOnDestroy() {
    this.logger.log('[ANALYTICS - OVERVIEW] - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  goToRichieste() {
    this.logger.log("[ANALYTICS - OVERVIEW] User click on last 7 days graph");
    this.analyticsService.goToRichieste();
  }

  getHeatMapSeriesDataByLang() {


    // this.weekday = { '1': 'Dom', '2': 'Lun', '3': 'Mar', '4': 'Mer', '5': 'Gio', '6': 'Ven', '7': 'Sab' }
    this.weekday = {
      '1': moment.weekdaysShort(0),
      '2': moment.weekdaysShort(1),
      '3': moment.weekdaysShort(2),
      '4': moment.weekdaysShort(3),
      '5': moment.weekdaysShort(4),
      '6': moment.weekdaysShort(5),
      '7': moment.weekdaysShort(6)
    }

    // console.log("[ANALYTICS - OVERVIEW] weekday ", this.weekday );
    // this.hour = {
    //   '1': '01:00', '2': '02:00', '3': '03:00', '4': '04:00', '5': '05:00', '6': '06:00', '7': '07:00', '8': '08:00', '9': '09:00', '10': '10:00',
    //   '11': '11:00', '12': '12:00', '13': '13:00', '14': '14:00', '15': '15:00', '16': '16:00', '17': '17:00', '18': '18:00', '19': '19:00', '20': '20:00',
    //   '21': '21:00', '22': '22:00', '23': '23:00', '24': '24:00'
    // }

    this.hour = {
      '1': moment("01:00", "HH:mm").format('LT'),
      '2': moment("02:00", "HH:mm").format('LT'),
      '3': moment("03:00", "HH:mm").format('LT'),
      '4': moment("04:00", "HH:mm").format('LT'),
      '5': moment("05:00", "HH:mm").format('LT'),
      '6': moment("06:00", "HH:mm").format('LT'),
      '7': moment("07:00", "HH:mm").format('LT'),
      '8': moment("08:00", "HH:mm").format('LT'),
      '9': moment("09:00", "HH:mm").format('LT'),
      '10': moment("10:00", "HH:mm").format('LT'),
      '11': moment("11:00", "HH:mm").format('LT'),
      '12': moment("12:00", "HH:mm").format('LT'),
      '13': moment("13:00", "HH:mm").format('LT'),
      '14': moment("14:00", "HH:mm").format('LT'),
      '15': moment("15:00", "HH:mm").format('LT'),
      '16': moment("16:00", "HH:mm").format('LT'),
      '17': moment("17:00", "HH:mm").format('LT'),
      '18': moment("18:00", "HH:mm").format('LT'),
      '19': moment("19:00", "HH:mm").format('LT'),
      '20': moment("20:00", "HH:mm").format('LT'),
      '21': moment("21:00", "HH:mm").format('LT'),
      '22': moment("22:00", "HH:mm").format('LT'),
      '23': moment("23:00", "HH:mm").format('LT'),
      '24': moment("24:00", "HH:mm").format('LT')
    }

    // console.log('[ANALYTICS - OVERVIEW] hour', this.hour)
    this.yAxis = {
      labels: [
        moment("01:00", "HH:mm").format('LT'),
        moment("02:00", "HH:mm").format('LT'),
        moment("03:00", "HH:mm").format('LT'),
        moment("04:00", "HH:mm").format('LT'),
        moment("05:00", "HH:mm").format('LT'),
        moment("06:00", "HH:mm").format('LT'),
        moment("07:00", "HH:mm").format('LT'),
        moment("08:00", "HH:mm").format('LT'),
        moment("09:00", "HH:mm").format('LT'),
        moment("10:00", "HH:mm").format('LT'),
        moment("11:00", "HH:mm").format('LT'),
        moment("12:00", "HH:mm").format('LT'),
        moment("13:00", "HH:mm").format('LT'),
        moment("14:00", "HH:mm").format('LT'),
        moment("15:00", "HH:mm").format('LT'),
        moment("16:00", "HH:mm").format('LT'),
        moment("17:00", "HH:mm").format('LT'),
        moment("18:00", "HH:mm").format('LT'),
        moment("19:00", "HH:mm").format('LT'),
        moment("20:00", "HH:mm").format('LT'),
        moment("21:00", "HH:mm").format('LT'),
        moment("22:00", "HH:mm").format('LT'),
        moment("23:00", "HH:mm").format('LT'),
        moment("24:00", "HH:mm").format('LT')
      ]
    };
    const arrayDay = moment.weekdaysShort()
    arrayDay.push(arrayDay.shift())
    this.xAxis = { labels: arrayDay };
    // console.log('this.xAxis ', this.xAxis)

    this.titleSettings = {
      text: 'Requests per hour of day',
      textStyle: {
        size: '15px',
        fontWeight: '500',
        fontStyle: 'Normal'
      }
    };

    // } else {
    //   this.weekday = { '1': 'Sun', '2': 'Mon', '3': 'Tue', '4': 'Wed', '5': 'Thu', '6': 'Fri', '7': 'Sat' }
    //   this.hour = {
    //     '1': '1am', '2': '2am', '3': '3am', '4': '4am', '5': '5am', '6': '6am', '7': '7am', '8': '8am', '9': '9am', '10': '10am',
    //     '11': '11am', '12': '12am', '13': '1pm', '14': '2pm', '15': '3pm', '16': '4pm', '17': '5pm', '18': '6pm', '19': '7pm', '20': '8pm',
    //     '21': '9pm', '22': '10pm', '23': '11pm', '24': '12pm'
    //   }

    //   this.yAxis = { labels: this.ylabel_eng };
    //   this.xAxis = { labels: this.xlabel_eng };
    //   this.titleSettings = {
    //     text: 'Requests per hour of day',
    //     textStyle: {
    //       size: '15px',
    //       fontWeight: '500',
    //       fontStyle: 'Normal'
    //     }
    //   };
    // }
  }
  getBrowserLangAndSwitchMonthName() {
    // if (this.lang) {
    //   if (this.lang === 'it') {
    //     this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
    //   } else {
    //     this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
    //   }
    // }
    // console.log('[ANALYTICS - OVERVIEW] existent this.monthNames', this.monthNames)
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

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }


  // -----------LAST 7 DAYS GRAPH-----------------------
  getRequestByLast7Day() {

    this.subscription = this.analyticsService.requestsByDay(7).subscribe((requestsByDay: any) => {
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY ', requestsByDay);


      // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
      const last7days_initarray = []
      for (let i = 0; i <= 6; i++) {
        // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
      }



      last7days_initarray.reverse()

      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - MOMENT LAST SEVEN DATE (init array)', last7days_initarray);

      const requestsByDay_series_array = [];
      const requestsByDay_labels_array = []

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const requestsByDay_array = []
      for (let j = 0; j < requestsByDay.length; j++) {
        if (requestsByDay[j]) {
          requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '-' + requestsByDay[j]['_id']['month'] + '-' + requestsByDay[j]['_id']['year'] })

        }

      }
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);


      /**
       * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
      // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
      // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
      // If not, then the same element in last7days i.e. obj is returned.
      const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

      const _requestsByDay_series_array = [];
      const _requestsByDay_labels_array = [];

      requestByDays_final_array.forEach(requestByDay => {
        //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
        _requestsByDay_series_array.push(requestByDay.count)

        const splitted_date = requestByDay.day.split('-');
        //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
        _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      });


      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

      const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

      let lang = this.lang;

      var lineChart = new Chart('last7dayChart', {
        type: 'line',
        data: {
          labels: _requestsByDay_labels_array,
          datasets: [{
            label: 'Number of request in last 7 days ',//active labet setting to true the legend value
            data: _requestsByDay_series_array,
            fill: true, //riempie zona sottostante dati
            lineTension: 0.4,
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
          maintainAspectRatio: false, //allow to resize chart
          title: {
            text: 'AVERAGE TIME RESPONSE',
            display: false
          },
          legend: {
            display: false //do not show label title
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                //minRotation: 30,
                fontColor: 'black',

              },
              gridLines: {
                display: true,
                borderDash: [8, 4],
                //color:'rgba(255, 255, 255, 0.5)',

              }

            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4],
                //color:'rgba(0, 0, 0, 0.5)',

              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  //userCallback is used to return integer value to ylabel
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: higherCount + 2,


                // callback: function (value, index, values) {
                //   let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                //   let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                //   let seconds = Math.floor(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
                //   return hours + 'h:' + minutes + 'm:' + seconds + 's'
                // },

              }
            }]
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                var self = this

                // var label = data.datasets[tooltipItem.datasetIndex].label || '';
                // if (label) {
                //     label += ': ';
                // }
                // label += Math.round(tooltipItem.yLabel * 100) / 100;
                // return label + '';
                //this.logger.log("data",data)
                const currentItemValue = tooltipItem.yLabel
                // let langService = new HumanizeDurationLanguage();
                // let humanizer = new HumanizeDuration(langService);
                // humanizer.setOptions({ round: true })
                //this.logger.log("humanize", humanizer.humanize(currentItemValue))
                //return data.datasets[tooltipItem.datasetIndex].label + ': ' + currentItemValue

                // this.translate.get('Requests')
                // .subscribe((text: string) => {
                //    this.consversationLabel = text;
                //    console.log('[ANALYTICS - OVERVIEW] consversationLabel ', this.consversationLabel) 
                // });

                return this.translate.instant('Requests') + ':' + currentItemValue;

                // if (lang === 'it') {
                //   return 'Conversazioni: ' + currentItemValue;
                // } else {
                //   return 'Conversations:' + currentItemValue;
                // }

              }
            }
          }

        }
        ,
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            //this.logger.log("chartistance",chartInstance)
            //ctx.fillStyle = 'red'; // your color here
            ctx.height = 128
            //chartInstance.chart.canvas.parentNode.style.height = '128px';
            ctx.font = 'Roboto'
            var chartArea = chartInstance.chartArea;
            //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          }
        }]
      });

    }, (error) => {
      this.logger.error('[ANALYTICS -  OVERVIEW] - REQUESTS BY DAY - ERROR ', error);

    }, () => {
      this.logger.log('[ANALYTICS - OVERVIEW] - REQUESTS BY DAY * COMPLETE *');

    });
  }

  // getConvsTranslations(currentItemValue) {
  //   const instant = this.translate.instant('Requests')
  //   console.log('[ANALYTICS - OVERVIEW] instant ', instant)
  //   this.translate.get('Requests')
  //     .subscribe((text: string) => {
  //       this.consversationLabel = text + ':' + currentItemValue;
  //       console.log('[ANALYTICS - OVERVIEW] consversationLabel ', this.consversationLabel)
  //     });
  // }

  getHeatMapDataAndBuildGraph() {

      this.analyticsService.getDataHeatMap().subscribe(res => {
        let data: object = res;
        // console.log('[ANALYTICS - OVERVIEW] GET HEAT MAP DATA -> RES ', res);
  
        let heatmapInitData = []

        for (let i = 1; i <= 24; i++) {
          for (let j = 1; j <= 7; j++) {
            heatmapInitData.push({ 'hour': this.hour[i], 'weekday': this.weekday[j] , 'count': 0 })
          }
        }

        this.formattedHeatMapRes = []
        for (let z in data) {
          // this.logger.log("[ANALYTICS - OVERVIEW] getDataHeatMap DATA", this.getOffset(data[z]._id.hour, data[z]._id.weekday))
          this.formattedHeatMapRes.push({ "hour": this.hour[this.getOffset(data[z]._id.hour, data[z]._id.weekday).hours], "weekday": this.weekday[this.getOffset(data[z]._id.hour, data[z]._id.weekday).weekday], 'count': data[z].count });
        }
  
        // console.log("[ANALYTICS - OVERVIEW] GET HEAT MAP DATA -> RES FORMATTED (formattedHeatMapRes)", this.formattedHeatMapRes);

        const finalApxArray = heatmapInitData.map(obj => this.formattedHeatMapRes.find(o => (o.hour === obj.hour) && (o.weekday === obj.weekday)) || obj);
        // console.log("[ANALYTICS - OVERVIEW] GET HEAT MAP DATA - FINAL ARRAY (finalApxArray)", finalApxArray)
     
        if ( finalApxArray) {
          this.buildApxHeatMap(finalApxArray)
        }
    
      }, error => {
        this.logger.error('[ANALYTICS - OVERVIEW] - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.logger.log('[ANALYTICS - OVERVIEW] - GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  buildApxHeatMap(finalApxArray: any) {
    this.chartOptions = {
      series: [
        {
          // name: "12:00 AM",
          // data: this.generateData("12:00 AM",finalApxArray)
          name: this.hour[24],
          data: this.generateData(this.hour[24],finalApxArray)
        },
        {
          // name: "11:00 PM",
          // data: this.generateData("11:00 PM",finalApxArray)
           name: this.hour[23],
          data: this.generateData(this.hour[23],finalApxArray)
        },
        {
          // name: "10:00 PM",
          // data: this.generateData("10:00 PM",finalApxArray)
          name: this.hour[22],
          data: this.generateData(this.hour[22],finalApxArray)
        },
        {
          // name: "9:00 PM",
          // data: this.generateData("9:00 PM",finalApxArray)
          name: this.hour[21],
          data: this.generateData(this.hour[21],finalApxArray)
        },
        {
          // name: "8:00 PM",
          // data: this.generateData("8:00 PM",finalApxArray)
          name: this.hour[20],
          data: this.generateData(this.hour[20],finalApxArray)
        },
        {
          // name: "7:00 PM",
          // data: this.generateData("7:00 PM",finalApxArray)
          name: this.hour[19],
          data: this.generateData(this.hour[19],finalApxArray)
        },
        {
          // name: "6:00 PM",
          // data: this.generateData("6:00 PM",finalApxArray)
          name: this.hour[18],
          data: this.generateData(this.hour[18],finalApxArray)
        },
        {
          // name: "5:00 PM",
          // data: this.generateData("5:00 PM",finalApxArray)
          name: this.hour[17],
          data: this.generateData(this.hour[17],finalApxArray)
        },
        {
          // name: "4:00 PM",
          // data: this.generateData("4:00 PM",finalApxArray)
          name: this.hour[16],
          data: this.generateData(this.hour[16],finalApxArray)
        },
        {
          // name: "3:00 PM",
          // data: this.generateData("3:00 PM",finalApxArray)
          name: this.hour[15],
          data: this.generateData(this.hour[15],finalApxArray)
        },
        {
          // name: "2:00 PM",
          // data: this.generateData("2:00 PM",finalApxArray)
          name: this.hour[14],
          data: this.generateData(this.hour[14],finalApxArray)
        },
        {
          // name: "1:00 PM",
          // data: this.generateData("1:00 PM",finalApxArray)
          name: this.hour[13],
          data: this.generateData(this.hour[13],finalApxArray)
        },
        {
          // name: "12:00 PM",
          // data: this.generateData("12:00 PM",finalApxArray)
          name: this.hour[12],
          data: this.generateData(this.hour[12],finalApxArray)
        },
        {
          // name: "11:00 AM",
          // data: this.generateData("11:00 AM",finalApxArray)
          name: this.hour[11],
          data: this.generateData(this.hour[11],finalApxArray)
        },
        {
          // name: "10:00 AM",
          // data: this.generateData("10:00 AM",finalApxArray)
          name: this.hour[10],
          data: this.generateData(this.hour[10],finalApxArray)
        },
        {
          // name: "9:00 AM",
          // data: this.generateData("9:00 AM",finalApxArray)
          name: this.hour[9],
          data: this.generateData(this.hour[9],finalApxArray)
        },
        {
          // name: "8:00 AM",
          // data: this.generateData("8:00 AM",finalApxArray)
          name: this.hour[8],
          data: this.generateData(this.hour[8],finalApxArray)
        },
        {
          // name: "7:00 AM",
          // data: this.generateData("7:00 AM",finalApxArray)
          name: this.hour[7],
          data: this.generateData(this.hour[7],finalApxArray)
        },
        {
          // name: "6:00 AM",
          // data: this.generateData("6:00 AM",finalApxArray)
          name: this.hour[6],
          data: this.generateData(this.hour[6],finalApxArray)
        },
        {
          // name: "5:00 AM",
          // data: this.generateData("5:00 AM",finalApxArray)
          name: this.hour[5],
          data: this.generateData(this.hour[5],finalApxArray)
        },
        {
          // name: "4:00 AM",
          // data: this.generateData("4:00 AM", finalApxArray)
          name: this.hour[4],
          data: this.generateData(this.hour[4],finalApxArray)
        },
        {
          // name: "3:00 AM",
          // data: this.generateData("3:00 AM", finalApxArray)
          name: this.hour[3],
          data: this.generateData(this.hour[3],finalApxArray)
        },
        {
          // name: "2:00 AM",
          // data: this.generateData("2:00 AM",finalApxArray)
          name: this.hour[2],
          data: this.generateData(this.hour[2],finalApxArray)
        },
        {
          // name: "1:00 AM",
          // data: this.generateData("1:00 AM", finalApxArray)
          name: this.hour[1],
          data: this.generateData(this.hour[1],finalApxArray)
        }
      ],
      chart: {
        height: 500,
        type: "heatmap"
      },
      dataLabels: {
        enabled: true
      },
      stroke: {
        colors: ["#90A4AE"],
      },
      colors: ["#008FFB"],
      xaxis: {
        type: "category",
        // categories: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        categories: [this.weekday[1],  this.weekday[2], this.weekday[3], this.weekday[4], this.weekday[5], this.weekday[6], this.weekday[7]]
      },
      grid: {
        padding: {
          right: 20
        }
      },
    };
  }

  public generateData(hour, finalApxArray) {
    // console.log('APX CHART generateData - hour ', hour)
    // console.log('APX CHART generateData - finalApxArray ', finalApxArray)
    var series = [];
   
    const result = finalApxArray.filter(item => item.hour === hour);
    // console.log('APX CHART generateData FINAL ARRAY FILTER FOR HOUR  ', result) 
    result.forEach(element => {
      series.push(element.count) 
      // console.log('> series ',series )
    });

    // console.log('xxx series', series)
    return series;
  }

  // public _generateData(count, yrange) {
  //   var i = 0;
  //   var series = [];
  //   while (i < count) {
  //     var y =
  //       Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

  //     series.push(y);
  //     i++;
  //   }
  //   console.log('series', series)
  //   return series;

  // }


  getOffset(hours, weekday) {

    // get offset local time respect to utc in minutes
    var offSet = moment_tz.tz(moment_tz.utc(), moment_tz.tz.guess()).utcOffset();
    // this.logger.log("Offset:",offSet); --> ACTIVE TO DEBUG

    var prjTzOffsetToHours = (offSet / 60) // get offset in hours

    const off_FINAL = hours + prjTzOffsetToHours;
    // this.logger.log("Hour + weekday:", hours, weekday); --> ACTIVE TO DEBUG
    // this.logger.log("OFFSEThour", prjTzOffsetToHours); --> ACTIVE TO DEBUG
    // this.logger.log("OFFSET_FINAL", off_FINAL); --> ACTIVE TO DEBUG

    // offset+UtcHour is grater than 24
    if (off_FINAL > 24) {

      const weekday_final = weekday + 1;

      if (weekday_final > 7) {
        return { hours: off_FINAL - 24, weekday: weekday_final - 7 }
      } else if (weekday_final < 1) {
        return { hours: off_FINAL - 24, weekday: 7 + weekday_final }
      } else {
        return { hours: off_FINAL - 24, weekday: weekday_final }
      }

    }
    // offset+UtcHour is less than 1
    else if (off_FINAL < 1) {

      let weekday_final = weekday - 1;

      if (weekday_final > 7) { return { hours: 24 + off_FINAL, weekday: weekday_final - 7 } }
      else if (weekday_final < 1) { return { hours: 24 + off_FINAL, weekday: 7 + weekday_final } }
      else { return { hours: 24 + off_FINAL, weekday: weekday_final } }

    }

    // offset+UtcHour is between 1 & 24 --> no operation needed
    else {

      return {
        hours: off_FINAL,
        weekday: weekday
      }
    }

  }



 

  // -----------MEDIAN RESPONS TIME-----------------------
  avarageWaitingTimeCLOCK() {
    this.subscription = this.analyticsService.getDataAVGWaitingCLOCK().subscribe((res: any) => {

      var splitString;

      if (res && res.length > 0) {
        if (res[0].waiting_time_avg) {
          if (res[0].waiting_time_avg !== null || res[0].waiting_time_avg !== undefined) {
            // this.avarageWaitingTimestring= this.msToTime(res[0].waiting_time_avg)
            // this.humanizer.setOptions({round: true, units:['m']});
            // this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
            splitString = this.humanizeDurations(res[0].waiting_time_avg).split(" ");
            // this.numberAVGtime= splitString[0];
            this.unitAVGtime = splitString[1];

            this.numberAVGtime = this.msToTIME(res[0].waiting_time_avg); //--> show in format h:m:s

            const browserLang = this.translate.getBrowserLang();
            let stored_preferred_lang = undefined
            if (this.auth.user_bs && this.auth.user_bs.value) {
              stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
            }
            // const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
            let dshbrd_lang = ''
            if (browserLang && !stored_preferred_lang) {
              dshbrd_lang = browserLang
            } else if (browserLang && stored_preferred_lang) {
              dshbrd_lang = stored_preferred_lang
            }
            this.logger.log('[ANALYTICS  - OVERVIEW] - setMomentLocale durationConvTimeCLOCK dshbrd_lang', dshbrd_lang)

            this.responseAVGtime = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: dshbrd_lang })

            this.logger.log('[ANALYTICS - OVERVIEW] avarageWaitingTimeCLOCK Waiting time: humanize', this.humanizer.humanize(res[0].waiting_time_avg))
            this.logger.log('[ANALYTICS - OVERVIEW] waiting time funtion:', this.humanizeDurations(res[0].waiting_time_avg));

          } else {
            this.setToNa('avg');

            this.logger.log('[ANALYTICS - OVERVIEW] avarageWaitingTimeCLOCK Waiting time: humanize', this.humanizer.humanize(0))
            this.logger.log('[ANALYTICS - OVERVIEW] avarageWaitingTimeCLOCK waiting time funtion:', this.humanizeDurations(0));
          }

        } else {
          this.setToNa('avg');
        }
      } else {
        this.setToNa('avg');

        this.logger.log('[ANALYTICS - OVERVIEW] avarageWaitingTimeCLOCK Waiting time: humanize', this.humanizer.humanize(0))
        this.logger.log('[ANALYTICS - OVERVIEW] avarageWaitingTimeCLOCK waiting time funtion:', this.humanizeDurations(0));
      }

    }, (error) => {
      this.logger.error('[ANALYTICS - OVERVIEW] - AVERAGE WAITING TIME CLOCK REQUEST  - ERROR ', error);
      this.setToNa('avg');
    }, () => {
      this.logger.log('![ANALYTICS - OVERVIEW]- AVERAGE TIME CLOCK REQUEST * COMPLETE *');
    });
  }


  durationConvTimeCLOCK() {
    this.subscription = this.analyticsService.getDurationConversationTimeDataCLOCK().subscribe((res: any) => {

      let avarageWaitingTimestring;
      let splitString;

      if (res && res.length > 0) {
        this.logger.log('[ANALYTICS - OVERVIEW] »»»» durationConvTimeCLOCK res[0].duration_avg ', res[0].duration_avg)
        this.logger.log('[ANALYTICS - OVERVIEW] »»»» durationConvTimeCLOCK typeof res[0].duration_avg ', typeof res[0].duration_avg)
        if (res[0].duration_avg) {
          if ((res[0].duration_avg !== null) || (res[0].duration_avg !== undefined)) {
            // this.humanizer.setOptions({round: true, units:['m']});
            // this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
            avarageWaitingTimestring = this.humanizeDurations(res[0].duration_avg)
            splitString = this.humanizeDurations(res[0].duration_avg).split(" ");
            // this.numberDurationCNVtime = splitString[0];
            this.numberDurationCNVtime = this.msToTIME(res[0].duration_avg);// --> show in format h:m:s
            this.unitDurationCNVtime = splitString[1];

            const browserLang = this.translate.getBrowserLang();
            // console.log('[ANALYTICS] - setMomentLocale browserLang', this.browserLang)

            let stored_preferred_lang = undefined
            if (this.auth.user_bs && this.auth.user_bs.value) {
              stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
            }
            // const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
            let dshbrd_lang = ''
            if (browserLang && !stored_preferred_lang) {
              dshbrd_lang = browserLang
            } else if (browserLang && stored_preferred_lang) {
              dshbrd_lang = stored_preferred_lang
            }
            this.logger.log('[ANALYTICS  - OVERVIEW] - setMomentLocale durationConvTimeCLOCK dshbrd_lang', dshbrd_lang)

            // this.responseDurationtime = this.humanizer.humanize(res[0].duration_avg, { round: true, language: this.lang });
            this.responseDurationtime = this.humanizer.humanize(res[0].duration_avg, { round: true, language: dshbrd_lang });

            this.logger.log('[ANALYTICS - OVERVIEW] durationConvTimeCLOCK Waiting time: humanize', this.humanizer.humanize(res[0].duration_avg))
            this.logger.log('[ANALYTICS - OVERVIEW] durationConvTimeCLOCK waiting time funtion:', avarageWaitingTimestring);

          } else {

            this.setToNa('duration');
          }
        } else {
          this.setToNa('duration');

          this.logger.log('[ANALYTICS - OVERVIEW] durationConvTimeCLOCK Waiting time: humanize', this.humanizer.humanize(0))
          this.logger.log('[ANALYTICS - OVERVIEW] durationConvTimeCLOCK waiting time funtion:', avarageWaitingTimestring);
        }
      } else {
        this.setToNa('duration');

        this.logger.log('[ANALYTICS - OVERVIEW] durationConvTimeCLOCK Waiting time: humanize', this.humanizer.humanize(0))
        this.logger.log('[ANALYTICS - OVERVIEW] durationConvTimeCLOCK waiting time funtion:', avarageWaitingTimestring);
      }

    }, (error) => {
      this.logger.error('[ANALYTICS - OVERVIEW] - DURATION CONVERSATION CLOCK REQUEST - ERROR ', error);
      this.setToNa('duration');

    }, () => {
      this.logger.log('[ANALYTICS - OVERVIEW] - DURATION CONVERSATION CLOCK REQUEST * COMPLETE *');
    });
  }

  setToNa(section: string) {
    if (section === 'avg') {
      this.numberAVGtime = 'n/a'
      this.unitAVGtime = ''
      this.responseAVGtime = 'n/a'
    } else if (section === 'duration') {
      this.numberDurationCNVtime = 'n/a.'
      this.unitDurationCNVtime = '';
      this.responseDurationtime = 'n/a'
    }
  }


  // convert number from millisecond to humanizer form 
  humanizeDurations(timeInMillisecond) {
    let result;
    if (timeInMillisecond) {

      if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
        result = result === 1 ? result + " " + this.translate.instant('Analytics.Year') : result + " " + this.translate.instant('Analytics.Years');
      } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
        result = result === 1 ? result + " " + this.translate.instant('Analytics.Month') : result + " " + this.translate.instant('Analytics.Months');
      } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
        result = result === 1 ? result + " " + this.translate.instant('Analytics.Day') : result + " " + this.translate.instant('Analytics.Days');
      } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
        result = result === 1 ? result + " " + this.translate.instant('Analytics.Hour') : result + " " + this.translate.instant('Analytics.Hours');
      } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
        result = result === 1 ? result + " " + this.translate.instant('Analytics.Minute') : result + " " + this.translate.instant('Analytics.Minutes');
      } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
        result = result === 1 ? result + " " + this.translate.instant('Analytics.Second') : result + " " + this.translate.instant('Analytics.Seconds');
      } else {
        result = timeInMillisecond + " " + this.translate.instant('Analytics.Milliseconds');
      }
      // if (this.lang == 'en') {
      //   if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
      //     result = result === 1 ? result + " Year" : result + " Years";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
      //     result = result === 1 ? result + " Month" : result + " Months";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
      //     result = result === 1 ? result + " Day" : result + " Days";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
      //     result = result === 1 ? result + " Hours" : result + " Hours";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
      //     result = result === 1 ? result + " Minute" : result + " Minutes";
      //   } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
      //     result = result === 1 ? result + " Second" : result + " Seconds";
      //   } else {
      //     result = timeInMillisecond + " Millisec";
      //   }
      // }
      // else {
      //   if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
      //     result = result === 1 ? result + " Anno" : result + " Anni";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
      //     result = result === 1 ? result + " Mese" : result + " Mesi";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
      //     result = result === 1 ? result + " Giorno" : result + " Giorni";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
      //     result = result === 1 ? result + " Ora" : result + " Ore";
      //   } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
      //     result = result === 1 ? result + " Minuto" : result + " Minuti";
      //   } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
      //     result = result === 1 ? result + " Secondo" : result + " Secondi";
      //   } else {
      //     result = timeInMillisecond + " Millisecondi";
      //   }
      // }
      return result;

    }
  }

  msToTIME(value) {
    let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
    let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    let seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds (prima era Math.floor ma non arrotonda i secondi)
    //this.logger.log("SECOND:",Math.round(((value % 360000) % 60000) / 1000))
    return hours + 'h:' + minutes + 'm:' + seconds + 's'
  }










}
