import { AnalyticsService } from './../../services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'app/services/requests.service';
import * as moment from 'moment';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { TranslateService } from '@ngx-translate/core';
import { ITooltipEventArgs } from '@syncfusion/ej2-heatmap/src';
import { Chart } from 'chart.js';

@Component({
  selector: 'appdashboard-panoramica',
  templateUrl: './panoramica.component.html',
  styleUrls: ['./panoramica.component.scss']
})
export class PanoramicaComponent implements OnInit {

  monthNames:any;
  lang:string;

  dataSource: Object;
  xAxis: Object;
  yAxis: Object;
  titleSettings: Object;
  cellSettings: Object;
  legendSettings: any; // nk
  paletteSettings: Object;
  customData = [];
  xlabel_ita = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  xlabel_eng = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ylabel_ita = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
  ylabel_eng = ['1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']
  weekday: any;
  hour: any;
  constructor(  private requestsService:RequestsService,
                private translate: TranslateService,
                private analyticsService: AnalyticsService) {
                  
                  this.lang = this.translate.getBrowserLang();
                  console.log('LANGUAGE ', this.lang);
                  this.getBrowserLangAndSwitchMonthName();
   }

  ngOnInit() {
    this.getRequestByLast7Day();
  }


  getBrowserLangAndSwitchMonthName() {
    
    if (this.lang) {
      if (this.lang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }
  

  //-----------LAST 7 DAYS GRAPH-----------------------
  getRequestByLast7Day(){
    this.requestsService.requestsByDay().subscribe((requestsByDay: any) => {
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY ', requestsByDay);

      // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
      const last7days_initarray = []
      for (let i = 0; i <= 6; i++) {
        // console.log('»» !!! ANALYTICS - LOOP INDEX', i);
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
      }

      

      last7days_initarray.reverse()

      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - MOMENT LAST SEVEN DATE (init array)', last7days_initarray);

      const requestsByDay_series_array = [];
      const requestsByDay_labels_array = []

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const requestsByDay_array = []
      for (let j = 0; j < requestsByDay.length; j++) {
        if (requestsByDay[j]) {
          requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '-' + requestsByDay[j]['_id']['month'] + '-' + requestsByDay[j]['_id']['year'] })

        }

      }
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY FORMATTED ', requestsByDay_array);


      /**
       * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
      // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
      // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
      // If not, then the same element in last7days i.e. obj is returned.
      const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

      const _requestsByDay_series_array = [];
      const _requestsByDay_labels_array = [];

      requestByDays_final_array.forEach(requestByDay => {
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
        _requestsByDay_series_array.push(requestByDay.count)

        const splitted_date = requestByDay.day.split('-');
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
        _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      });


      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

      const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

      var lineChart = new Chart('last7dayChart', {
        type: 'line',
        data: {
          labels: _requestsByDay_labels_array ,
          datasets: [{
            label: 'Average time response in last 30 days ',
            data: _requestsByDay_series_array,
            fill: true, //riempie zona sottostante dati
            lineTension: 0.1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.7)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: 'rgba(255, 255, 255, 0.8)'

          }]
        },
        options: {
          maintainAspectRatio:false,
          title: {
            text: 'AVERAGE TIME RESPONSE',
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                //minRotation: 30,
                fontColor: 'white',
              },
              gridLines: {
                display: true,
                borderDash:[8,4],
                color:'rgba(255, 255, 255, 0.5)',
                
              }

            }],
            yAxes: [{
              gridLines: {
                display: true ,
                borderDash:[8,4],
                color:'rgba(255, 255, 255, 0.5)',
                
              },
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: 'white',
                stepSize: 1,
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
              label: function (tooltipItem, data) {
                // var label = data.datasets[tooltipItem.datasetIndex].label || '';
                // if (label) {
                //     label += ': ';
                // }
                // label += Math.round(tooltipItem.yLabel * 100) / 100;
                // return label + '';
                //console.log("data",data)
                const currentItemValue = tooltipItem.yLabel
                let langService = new HumanizeDurationLanguage();
                let humanizer = new HumanizeDuration(langService);
                humanizer.setOptions({ round: true })
                //console.log("humanize", humanizer.humanize(currentItemValue))
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)

              }
            }
          }
          
        }
        ,
        plugins:[{
          beforeDraw: function(chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            //console.log("chartistance",chartInstance)
            //ctx.fillStyle = 'red'; // your color here
            ctx.height=128
            //chartInstance.chart.canvas.parentNode.style.height = '128px';
            ctx.font="Google Sans"
            var chartArea = chartInstance.chartArea;
            //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          }
        }]
      });


    }, (error) => {
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY * COMPLETE *');
    });
  }

  heatMap() {

    // get the language of browser
    
    this.cellSettings = {
      border: {
        radius: 4,
        width: 1,
        color: 'white'
      },
      // tileType:'Bubble',
      // bubbleType: 'Size',
      showLabel: false, // set to true to show value over each block
      // format: '{value} M',
    };

    this.paletteSettings = {
      palette: [
        { color: '#a0d4e9' },
        { color: '#5fa3f1' },
        { color: '#5187ed' },
        { color: '#254594' }
      ],
    };


    this.analyticsService.getDataHeatMap().subscribe(res => {
      let data:object= res;
      console.log('data from servoice->', res);
      // let init_array=[];
      // if(res.length==0){
        
      //   for(let i=1;i<8;i++) {
      //     init_array.push({ '_id': { "hour": this.xlabel_ita[i], "weekday": this.ylabel_ita[i] }, 'count': 0 })
      //   }
      // data=init_array;
      // console.log("init_array",init_array)
        
      // }

      if (this.lang === 'it') {
        this.weekday = { '1': 'Lun', '2': 'Mar', '3': 'Mer', '4': 'Gio', '5': 'Ven', '6': 'Sab', '7': 'Dom' }
        this.hour = {
          '1': '01:00', '2': '02:00', '3': '03:00', '4': '04:00', '5': '05:00', '6': '06:00', '7': '07:00', '8': '08:00', '9': '09:00', '10': '10:00',
          '11': '11:00', '12': '12:00', '13': '13:00', '14': '14:00', '15': '15:00', '16': '16:00', '17': '17:00', '18': '18:00', '19': '19:00', '20': '20:00',
          '21': '21:00', '22': '22:00', '23': '23:00'
        }
        this.yAxis = { labels: this.ylabel_ita };
        this.xAxis = { labels: this.xlabel_ita };
        this.titleSettings = {
          text: 'Utenti per ora del giorno',
          textStyle: {
            size: '15px',
            fontWeight: '500',
            fontStyle: 'Normal'
          }
        };

      } else {
        this.weekday = { '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'The', '5': 'Fri', '6': 'Sat', '7': 'Sun' }
        this.hour = {
          '1': '1am', '2': '2am', '3': '3am', '4': '4am', '5': '5am', '6': '6am', '7': '7am', '8': '8am', '9': '9am', '10': '10am',
          '11': '11am', '12': '12am', '13': '1pm', '14': '2pm', '15': '3pm', '16': '4pm', '17': '5pm', '18': '6pm', '19': '7pm', '20': '8pm',
          '21': '9pm', '22': '10pm', '23': '11pm'
        }

        this.yAxis = { labels: this.ylabel_eng };
        this.xAxis = { labels: this.xlabel_eng };
        this.titleSettings = {
          text: 'User per hour of day',
          textStyle: {
            size: '15px',
            fontWeight: '500',
            fontStyle: 'Normal'
          }
        };

      }

      // recostruct datafromservice to other customDataJson
      for (let i in data) {

        this.customData.push({ '_id': { "hour": this.hour[data[i]._id.hour], "weekday": this.weekday[data[i]._id.weekday] }, 'count': data[i].count });
      }

      console.log('CUSTOM', this.customData);

      this.dataSource = {
        data: this.customData,
        isJsonData: true,
        adaptorType: 'Cell',
        yDataMapping: '_id.hour',
        xDataMapping: '_id.weekday',
        valueMapping: 'count'
      }
    }, (error) => {
      console.log('»» !!! ANALYTICS - REQUESTS HEATMAP - ERROR ', error);
    }, () => {
      console.log('»» !!! ANALYTICS - REQUESTS HEATMAP * COMPLETE *');
    })

  }

  public tooltipRender(args: ITooltipEventArgs): void {
    args.content = [args.xLabel + ' | ' + args.yLabel + ' : ' + args.value];
  };

  public showTooltip: Boolean = true;















}
