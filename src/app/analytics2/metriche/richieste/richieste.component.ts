import { AnalyticsService } from './../../../services/analytics.service';
import { DepartmentService } from './../../../services/mongodb-department.service';
import { RequestsService } from 'app/services/requests.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment'
import { Chart } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { tick } from '@angular/core/testing';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appdashboard-richieste',
  templateUrl: './richieste.component.html',
  styleUrls: ['./richieste.component.scss']
})
export class RichiesteComponent implements OnInit {

  lineChart:any;

  lang: String;

  monthNames:any;
  lastdays=7;

  initDay:string;
  endDay:string;

  selectedDaysId:number; //lastdays filter
  selectedDeptId:string;  //department filter

  departments:any;

  subscription:Subscription;

  constructor(private analyticsService:AnalyticsService,
              private translate: TranslateService,
              private departmentService:DepartmentService) {
      
          this.lang = this.translate.getBrowserLang();
          console.log('LANGUAGE ', this.lang);
          this.getBrowserLangAndSwitchMonthName();
          
    }

  ngOnInit() {
    this.selectedDeptId = '';
    this.selectedDaysId=7
    this.initDay=moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay=moment().subtract(0, 'd').format('D/M/YYYY')
    this.getRequestByLastNDay(this.selectedDaysId, this.selectedDeptId);
    this.getDepartments();
    
  }

  ngOnDestroy() {
    console.log('!!! ANALYTICS.RICHIESTE - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  daysSelect(value){
    
    this.selectedDaysId=value;//--> value to pass throw for graph method
      //check value for label in htlm
    if(value<=30){
      this.lastdays=value;
    }else if((value=== 90) || (value=== 180)){
      this.lastdays=value/30;
    }else if(value === 360){
      this.lastdays=1;
    }
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    this.getRequestByLastNDay(value, this.selectedDeptId);
    console.log('REQUEST:', value, this.selectedDeptId)
  }

  depSelected(selectedDeptId){
    console.log('dep', selectedDeptId);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    this.getRequestByLastNDay( this.selectedDaysId,selectedDeptId)
    console.log('REQUEST:', this.selectedDaysId, selectedDeptId)
  }

  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments

    }, error => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS * COMPLETE *')
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

  getMinOfArray(request){
    return Math.min.apply(null, request);
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

  //-----------LAST n DAYS GRAPH-----------------------
  getRequestByLastNDay(lastdays, depID){
    this.subscription= this.analyticsService.requestsByDay(lastdays, depID).subscribe((requestsByDay: any) => {
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY ', requestsByDay);

      // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
      const last7days_initarray = []
      for (let i = 0; i < lastdays; i++) {
        // console.log('»» !!! ANALYTICS - LOOP INDEX', i);
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      

      last7days_initarray.reverse()

      console.log('»» !!! ANALYTICS - REQUESTS BY lastDAY - MOMENT LAST N DATE (init array)', last7days_initarray);

      const requestsByDay_series_array = [];
      const requestsByDay_labels_array = []

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const requestsByDay_array = []
      for (let j = 0; j < requestsByDay.length; j++) {
        if (requestsByDay[j]) {
          requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '/' + requestsByDay[j]['_id']['month'] + '/' + requestsByDay[j]['_id']['year'] })

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

      //select init and end day to show on div
      this.initDay=requestByDays_final_array[0].day
      this.endDay=requestByDays_final_array[lastdays-1].day;
      console.log("INIT", this.initDay, "END", this.endDay);

      requestByDays_final_array.forEach(requestByDay => {
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
        _requestsByDay_series_array.push(requestByDay.count)

        const splitted_date = requestByDay.day.split('/');
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
        _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      });


      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

      //get higher value of xvalue array 
      const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

      //set the stepsize 
      var stepsize;
      if(this.selectedDaysId>60){
          stepsize=10;
      }
      else {
        stepsize=this.selectedDaysId
      }
      let lang=this.lang;

      this.lineChart = new Chart('lastNdayChart', {
        type: 'line',
        data: {
          labels: _requestsByDay_labels_array ,
          datasets: [{
            label: 'Number of request in last 7 days ',//active labet setting to true the legend value
            data: _requestsByDay_series_array,
            fill: true, //riempie zona sottostante dati
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
          maintainAspectRatio:false,
          title: {
            text: 'AVERAGE TIME RESPONSE',
            display: false
          },
          legend:{
            display:false //do not show label title
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                maxTicksLimit: stepsize,
                display: true,
                //minRotation: 30,
                fontColor: 'black',
                // callback: function(tickValue, index, ticks) {
                //      console.log("XXXX",tickValue);
                //      console.log("III", index)
                //      console.log("TTT", ticks)
                 
                // }

              },
              gridLines: {
                display: true,
                borderDash:[8,4],
                //color:'rgba(255, 255, 255, 0.5)',
                
              }

            }],
            yAxes: [{
              gridLines: {
                display: true ,
                borderDash:[8,4],
                //color:'rgba(255, 255, 255, 0.5)',
                
              },
              ticks: {
                beginAtZero: true,
                userCallback: function(label, index, labels) {
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
              label: function (tooltipItem, data) {
                
                // var label = data.datasets[tooltipItem.datasetIndex].label || '';
                // if (label) {
                //     label += ': ';
                // }
                // label += Math.round(tooltipItem.yLabel * 100) / 100;
                // return label + '';
                //console.log("data",data)
                const currentItemValue = tooltipItem.yLabel
                // let langService = new HumanizeDurationLanguage();
                // let humanizer = new HumanizeDuration(langService);
                // humanizer.setOptions({ round: true })
                //console.log("humanize", humanizer.humanize(currentItemValue))
                //return data.datasets[tooltipItem.datasetIndex].label + ': ' + currentItemValue
                if(lang==='it'){
                  return 'Richieste: '+currentItemValue;
                }else{
                  return 'Request:' +currentItemValue;
                }

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

}
