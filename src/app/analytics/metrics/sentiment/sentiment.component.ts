import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
// import * as moment from 'moment';
import moment from "moment";
import { DepartmentService } from 'app/services/department.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../../services/logger/logger.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'appdashboard-sentiment',
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.scss']
})
export class SentimentComponent implements OnInit, OnDestroy {


  //median heart value
  numberSentimentHEART: String;
  responseSentimentHEART: String;

  // avg time chart variable
  xValueSENTIMENTchart: any;
  yValueSENTIMENTchart: any;
  dateRangeAvg: String;

  monthNames: any;
  lang: string;

  barChartSENTIMENT: any;

  lastdays = 7;
  initDay: string;
  endDay: string;

  departments: any;

  subscription: Subscription;

  selectedDaysId: number; //lastdays filter
  selectedDeptId: string;  //department filter

  constructor(
    private analyticsService: AnalyticsService,
    private departmentService: DepartmentService,
    private translate: TranslateService,
    private logger: LoggerService
  ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - SENTIMENT] LANGUAGE ', this.lang);
    this.getBrowserLangAndSwitchMonthName();
  }



  ngOnInit() {

    this.selectedDeptId = '';
    this.selectedDaysId = 7

    this.getSatisfactionNumberHEART();
    this.getSatisfactionCHART(this.selectedDaysId, this.selectedDeptId);
    this.getDepartments();

  }

  ngOnDestroy() {
    this.logger.log('[ANALYTICS - SENTIMENT] - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }


  daysSelect(value) {

    this.selectedDaysId = value;//--> value to pass throw for graph method
    //check value for label in htlm
    if (value <= 30) {
      this.lastdays = value;
    } else if ((value === 90) || (value === 180)) {
      this.lastdays = value / 30;
    } else if (value === 360) {
      this.lastdays = 1;
    }
    this.barChartSENTIMENT.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionCHART(value, this.selectedDeptId);
    this.logger.log('[ANALYTICS - SENTIMENT] daysSelect REQUEST:', value, this.selectedDeptId)
  }


  depSelected(selectedDeptId) {
    this.logger.log('[ANALYTICS - SENTIMENT] selectedDeptId', selectedDeptId);
    this.barChartSENTIMENT.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionCHART(this.selectedDaysId, selectedDeptId)
    this.logger.log('[ANALYTICS - SENTIMENT] depSelected REQUEST:', this.selectedDaysId, selectedDeptId)
  }



  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[ANALYTICS - SENTIMENT] - GET DEPTS RESPONSE by analitycs ', _departments);
      this.departments = _departments

    }, error => {
      this.logger.error('[ANALYTICS - SENTIMENT] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[ANALYTICS - SENTIMENT] - GET DEPTS * COMPLETE *')
    });
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

  getSatisfactionNumberHEART() {
    this.subscription = this.analyticsService.getSatisfactionDataHEART().subscribe((res: any) => {

      this.logger.log("[ANALYTICS - SENTIMENT] getSatisfactionNumberHEART RES", res)


      if (res && res.length != 0 && res[0].satisfaction_avg !== null) {

        this.numberSentimentHEART = res[0].satisfaction_avg;
        this.responseSentimentHEART = res[0].satisfaction_avg;

        this.logger.log('[ANALYTICS - SENTIMENT] Median Satisfaction value:', this.numberSentimentHEART);

      } else {

        this.numberSentimentHEART = 'n/a'
        this.responseSentimentHEART = 'n/a'

        this.logger.log('[ANALYTICS - SENTIMENT] Median Satisfaction value:', this.numberSentimentHEART);

      }


    }, (error) => {
      this.logger.error('[ANALYTICS - SENTIMENT] - SENTIMENT RATE HEART REQUEST  - ERROR ', error);
      this.numberSentimentHEART = 'n/a'
      this.responseSentimentHEART = 'n/a'
    }, () => {
      this.logger.log('[ANALYTICS - SENTIMENT] - SENTIMENT RATE HEART REQUEST * COMPLETE *');
    });
  }

  getSatisfactionCHART(lastdays, depID?) {
    this.subscription = this.analyticsService.getSatisfactionDataCHART(lastdays, depID).subscribe((res: any) => {
      this.logger.log('[ANALYTICS - SENTIMENT] chart data:', res);
      if (res) {

        //build a 30 days array of date with value 0--> is the init array
        const lastdays_initarray = []
        for (let i = 0; i < lastdays; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          lastdays_initarray.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 });
        }

        lastdays_initarray.reverse()
        //this.dateRangeAvg= last30days_initarray[0].date.split(-4) +' - '+last30days_initarray[30].date;
        this.logger.log('[ANALYTICS - SENTIMENT] - SENTIMENT CHART - MOMENT LAST n DATE (init array)', lastdays_initarray);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDataLineChart = [];
        for (let j in res) {

          if (res[j].satisfaction_avg == null) {
            res[j].satisfaction_avg = 0;
          }

          customDataLineChart.push({ date: new Date(res[j]._id.year, res[j]._id.month - 1, res[j]._id.day).toLocaleDateString(), value: res[j].satisfaction_avg });
        }

        this.logger.log('Custom data:', customDataLineChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestByDays_final_array = lastdays_initarray.map(obj => customDataLineChart.find(o => o.date === obj.date) || obj);
        this.logger.log('[ANALYTICS - SENTIMENT] - SENTIMENT CHART - FINAL ARRAY ', requestByDays_final_array);

        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];

        //select init and end day to show on div
        this.initDay = requestByDays_final_array[0].date;
        this.endDay = requestByDays_final_array[lastdays - 1].date;
        this.logger.log("[ANALYTICS - SENTIMENT] INIT", this.initDay, "END", this.endDay);

        requestByDays_final_array.forEach(requestByDay => {
          this.logger.log('[ANALYTICS - SENTIMENT] - SENTIMENT CHART - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.value)

          const splitted_date = requestByDay.date.split('/');
          this.logger.log('»» !!! ANALYTICS - SENTIMENT CHART - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });

        this.xValueSENTIMENTchart = _requestsByDay_labels_array;
        this.yValueSENTIMENTchart = _requestsByDay_series_array;
        //this.logger.log("XXXX", _requestsByDay_labels_array);
        // this.xValueAVGchart=requestByDays_final_array.map(function(e){

        //   return e.date
        // })
        // this.yValueAVGchart=requestByDays_final_array.map(function(e){
        //   return e.value
        // })

        this.logger.log('[ANALYTICS - SENTIMENT] Xlabel-SENTIMENT CHART', this.xValueSENTIMENTchart);
        this.logger.log('[ANALYTICS - SENTIMENT] Ylabel-SENTIMENT CHART', this.yValueSENTIMENTchart);


        // Chart.plugins.register({
        //   beforeDraw: function(chartInstance, easing) {
        //     var ctx = chartInstance.chart.ctx;
        //     this.logger.log("chart istance",chartInstance);
        //     ctx.fillStyle = 'red'; // your color here

        //     var chartArea = chartInstance.chartArea;
        //     ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        //   }
        // });

        //const higherCount = this.getMaxOfArray(this.yValueSENTIMENTchart);
        // this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);
        // this.msToTime(higherCount)
        // var hours = (higherCount/4) / (1000*60*60);
        // var absoluteHours = Math.floor((higherCount/4) / (1000*60*60));
        // this.logger.log("step", absoluteHours);

        //set the stepsize 
        var stepsize;
        if (this.selectedDaysId > 60) {
          stepsize = 10;
        }
        else {
          stepsize = this.selectedDaysId
        }
        let lang = this.lang;

        this.barChartSENTIMENT = new Chart('barChartSENTIMENT', {
          type: 'bar',
          data: {
            labels: this.xValueSENTIMENTchart,
            datasets: [{
              label: 'Average satisfaction response',
              data: this.yValueSENTIMENTchart,
              fill: true, //riempie zona sottostante dati
              lineTension: 0.0,
              backgroundColor: 'rgba(236, 61, 48, 0.6)',
              borderColor: 'rgba(236, 61, 48, 1)',
              borderWidth: 3,
              borderDash: [],
              borderDashOffset: 0.0,
              //pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
              //pointBorderColor: '#1e88e5'


            }]
          },
          options: {
            maintainAspectRatio: false,
            title: {
              text: 'AVERAGE SATISFACTION VALUE',
              display: false
            },
            legend: {
              display: false //do not show label title
            },
            scales: {
              xAxes: [{
                ticks: {
                  beginAtZero: true,
                  maxTicksLimit: stepsize,
                  display: true,
                  minRotation: 0,
                  fontColor: 'black',
                },
                gridLines: {
                  display: false,
                  borderDash: [8, 4],
                  //color:'rgba(255, 255, 255, 0.5)',
                }
              }],
              yAxes: [{
                gridLines: {
                  display: true,
                  borderDash: [8, 4],
                  //color:'rgba(255, 255, 255, 0.5)',
                },
                ticks: {
                  beginAtZero: true,
                  suggestedMax: 5,// + 20000000
                  //stepSize:this.stepSize(higherCount),
                  fontColor: 'black',
                  userCallback: function (label, index, labels) {
                    //userCallback is used to return integer value to ylabel
                    if (Math.floor(label) === label) {
                      return label;
                    }
                  }
                }
              }]
            },
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {

                  const currentItemValue = tooltipItem.yLabel

                  if (lang === 'it') {
                    return 'Feedback medio: ' + currentItemValue;
                  } else {
                    return 'Feedback : ' + currentItemValue;
                  }

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
              ctx.font ='Roboto'
              var chartArea = chartInstance.chartArea;
              //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            }
          }]
        });//fine chart
      }//fine if

    }, (error) => {
      this.logger.error('[ANALYTICS - SENTIMENT] - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS - SENTIMENT] - REQUESTS BY DAY * COMPLETE *');
    });

  }




}
