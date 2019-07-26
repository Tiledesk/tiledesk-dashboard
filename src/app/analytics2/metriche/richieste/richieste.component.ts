import { AnalyticsService } from './../../../services/analytics.service';
import { DepartmentService } from './../../../services/mongodb-department.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment'
import { Chart } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UsersService } from 'app/services/users.service';

@Component({
  selector: 'appdashboard-richieste',
  templateUrl: './richieste.component.html',
  styleUrls: ['./richieste.component.scss']
})
export class RichiesteComponent implements OnInit {

  lineChart:any;
  lineChartByMonth:any;

  lang: String;

  monthNames:any;
  lastdays=7;

  initDay:string;
  endDay:string;

  selectedDaysId:number; //lastdays filter
  selectedDeptId:string;  //department filter
  selectedAgentId:string; //agents filter

  selected:string;

  departments:any;
  user_and_bot_array= [];

  subscription:Subscription;

  constructor(private analyticsService:AnalyticsService,
              private translate: TranslateService,
              private departmentService:DepartmentService,
              private usersService: UsersService,) {
      
          this.lang = this.translate.getBrowserLang();
          console.log('LANGUAGE ', this.lang);
          this.getBrowserLangAndSwitchMonthName();
          
    }

  ngOnInit() {
    this.selected='day'
    this.selectedDeptId = '';
    this.selectedDaysId=7;
    this.selectedAgentId = '';
    this.initDay=moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay=moment().subtract(0, 'd').format('D/M/YYYY')
    this.getRequestByLastNDay(this.selectedDaysId, this.selectedDeptId);
    this.getDepartments();
    this.getAllProjectUsers();
    
  }

  ngOnDestroy() {
    console.log('!!! ANALYTICS.RICHIESTE - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  daysSelect(value, event){
    console.log("EVENT", event)
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

  onDayWeekMonthCLICK(value){
    if(value==='day'){
      this.selected='day'
      this.lineChartByMonth.destroy();  //destroy month chart
                                        //destroy week chart
      this.getRequestByLastNDay(this.selectedDaysId, this.selectedDeptId);
    }else if(value==='week'){
      this.selected='week';
      this.lineChartByMonth.destroy();  //destroy month chart
      this.lineChart.destroy();         //destroy day chart
      this.getRequestFilteredByWeeks();
    }else if(value==='month'){
      this.selected='month';  
      this.lineChart.destroy();       //destroy day chart
                                      //destroy weekchart
      this.getRequestFilteredByMonths(this.selectedDeptId);
    }

  }
 

  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS RESPONSE by analitycs ', _departments);
      this.departments = _departments

    }, error => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS * COMPLETE *')
    });
  }

  getAllProjectUsers() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('!!! NEW REQUESTS HISTORY  - GET PROJECT-USERS ', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(user => {
          this.user_and_bot_array.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
        });
        
       
        
        console.log('!!! NEW REQUESTS HISTORY  - !!!! USERS ARRAY ', this.user_and_bot_array);

      }
    }, (error) => {
      console.log('!!! NEW REQUESTS HISTORY - GET PROJECT-USERS ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET PROJECT-USERS * COMPLETE *');
      //this.getAllBot();
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
      console.log('»» !!! ANALYTICS - REQUESTS BY  N-DAY ', requestsByDay);

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
      this.initDay=requestByDays_final_array[0].day;
      this.endDay=requestByDays_final_array[lastdays-1].day;
      console.log("INIT", this.initDay, "END", this.endDay);

      requestByDays_final_array.forEach(requestByDay => {
        //console.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
        _requestsByDay_series_array.push(requestByDay.count)

        const splitted_date = requestByDay.day.split('/');
        //console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
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
                  return 'Requests: ' +currentItemValue;
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

 
  getRequestFilteredByMonths(depID){

    this.subscription=this.analyticsService.requestByMonth(depID).subscribe((requestByMonth:any)=>{
      console.log("REQUEST BY MONTH:",requestByMonth);

      // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
      const lastMONTH_initarray = []
      for (let i = 0; i < 12; i++) {
        // console.log('»» !!! ANALYTICS - LOOP INDEX', i);
        lastMONTH_initarray.push({ 'count': 0, month: moment().subtract(i, 'months').format('M/YYYY') })
      }

      lastMONTH_initarray.reverse()

      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - MOMENT LAST MONTH (init array)', lastMONTH_initarray);

      const requestsByMonth_series_array = [];
      const requestsByMonth_labels_array = []

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const requestsByMonth_array = []
      for (let j = 0; j < requestByMonth.length; j++) {
        if (requestByMonth[j]) {
          requestsByMonth_array.push({ 'count': requestByMonth[j]['count'], month: requestByMonth[j]['_id']['month'] + '/' + requestByMonth[j]['_id']['year'] })

        }

      }
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH FORMATTED ', requestsByMonth_array);
      
      /**
       * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
      // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
      // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
      // If not, then the same element in last7days i.e. obj is returned.
      const requestByMonths_final_array = lastMONTH_initarray.map(obj => requestsByMonth_array.find(o => o.month === obj.month) || obj);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - FINAL ARRAY ', requestByMonths_final_array);

      const _requestsByMonth_series_array = [];
      const _requestsByMonth_labels_array = [];

      //select init and end day to show on div
      // this.initDay=requestByDays_final_array[0].day;
      // this.endDay=requestByDays_final_array[lastdays-1].day;
      // console.log("INIT", this.initDay, "END", this.endDay);

      requestByMonths_final_array.forEach(requestByMonth => {
        //console.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
        _requestsByMonth_series_array.push(requestByMonth.count)
       
        const splitted_date = requestByMonth.month.split('/');
        
        //console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
        _requestsByMonth_labels_array.push(this.monthNames[splitted_date[0]] + ' ' + splitted_date[1])
      });

      console.log("FINAL ARRAY MONTH REQUEST", requestByMonths_final_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - SERIES (ARRAY OF COUNT - to use for debug)', requestsByMonth_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByMonth_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - LABELS (ARRAY OF DAY - to use for debug)', requestsByMonth_labels_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - LABELS (+ NEW + ARRAY OF DAY)', _requestsByMonth_labels_array);


      //get higher value of xvalue array 
      const higherCount = this.getMaxOfArray(_requestsByMonth_series_array);
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

      
      let lang=this.lang;

      this.lineChartByMonth = new Chart('lastNdayChart', {
        type: 'line',
        data: {
          labels: _requestsByMonth_labels_array ,
          datasets: [{
            label: 'Number of request in last 7 days ',//active labet setting to true the legend value
            data: _requestsByMonth_series_array,
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
                //maxTicksLimit: stepsize,
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
                  return 'Requests: ' +currentItemValue;
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

    },(error) => {
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - ERROR ', error);
    }, () => {
      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH * COMPLETE *');
    });
  }

  getDayFromWeekNumber(weekNumber, year){
    
    var d = new Date("Jan 01, " + year + " 01:00:00");
    var w = d.getTime() + 604800000 * (weekNumber);
    //86400000 --> milliseconds of 1 day
    var initWeekDay = new Date(w).toLocaleDateString();
    var endWeekDay = new Date(w + 518400000).toLocaleDateString();

    console.log("n1",initWeekDay);
    console.log("n2",endWeekDay);

    return { "initWeekDay": initWeekDay,"endWeekDay": endWeekDay }
            
    
  }

  getRequestFilteredByWeeks(){
    this.subscription=this.analyticsService.requestByWeek().subscribe((requestByWeek:any)=>{
      console.log("REQUEST BY WEEK:",requestByWeek);

      console.log("FIRST DAY",this.getDayFromWeekNumber(0,2019))
      const lastWEEK_initarray = []
      for (let i = 0; i < 12; i++) {
     
        lastWEEK_initarray.push({ 'count': 0, week: { firstday: moment().subtract(i, 'week').format('DD/M/YYYY') ,
                                                      lastday:  moment().subtract(i, 'week').format("DD/M/YYYY") }
                                                    })
      }

      lastWEEK_initarray.reverse()

      console.log('»» !!! ANALYTICS - REQUESTS BY MONTH - MOMENT LAST WEEK (init array)', lastWEEK_initarray);


      const requestsByWeek_series_array = [];
      const requestsByWeek_labels_array = []

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const requestsByWeek_array = []
      for (let j = 0; j < requestByWeek.length; j++) {
        if (requestByWeek[j]) {
          
          requestsByWeek_array.push({ 'count': requestByWeek[j]['count'], week: { firstday: this.getDayFromWeekNumber(requestByWeek[j]['_id']['week'],requestByWeek[j]['_id']['year'])} })

        }

      }
      console.log('»» !!! ANALYTICS - REQUESTS BY WEEK FORMATTED ', requestsByWeek_array);
      
    },(error) => {
      console.log('»» !!! ANALYTICS - REQUESTS BY WEEK - ERROR ', error);
    }, () => {
      console.log('»» !!! ANALYTICS - REQUESTS BY WEEK * COMPLETE *');
    });
  }



}
