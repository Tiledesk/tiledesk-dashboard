import { DepartmentService } from './../../../services/mongodb-department.service';
import { AnalyticsService } from './../../../services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appdashboard-durataconv',
  templateUrl: './durataconv.component.html',
  styleUrls: ['./durataconv.component.scss']
})
export class DurataconvComponent implements OnInit {
  
  // duration time clock variable
  numberDurationCNVtime: String;
  unitDurationCNVtime: String;
  responseDurationtime: String;
  // duration conversation chart variable
  xValueDurationConversation: any;
  yValueDurationConversation: any;
  dataRangeDuration: String;

  barChart:any;
  
  lang: string;
  monthNames:any;

  lastdays=7;
  initDay:string;
  endDay:string;

  departments:any;

  selectedDaysId:number; //lastdays filter
  selectedDeptId:string;  //department filter

  subscription:Subscription;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  constructor(  private analyticsService:AnalyticsService,
                private translate: TranslateService,
                private departmentService:DepartmentService) {
      
                this.lang = this.translate.getBrowserLang();
                console.log('LANGUAGE ', this.lang);
                this.getBrowserLangAndSwitchMonthName();
                }

  ngOnInit() {
    this.selectedDeptId = '';
    this.selectedDaysId=7
    this.durationConvTimeCLOCK();
    this.durationConversationTimeCHART(this.selectedDaysId,this.selectedDeptId);
    this.getDepartments();
  }

  ngOnDestroy() {
    console.log('!!! ANALYTICS  CONVERSATION LENGHT - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

msToTIME(value){
    let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
    let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    let seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
    //per i secondi prima era Math.floor ma non arrotonda i secondi --> Math.round
   return hours + 'h:' + minutes + 'm:' + seconds + 's'
}

//not in use
msToTime(duration) {
  let hours = Math.floor(duration / 3600000) // 1 Hour = 36000 Milliseconds
  let minutes = Math.floor((duration % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
  let seconds = Math.round(((duration % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
    
      if(minutes%2!=0){
        minutes=minutes+1
        return (minutes)*1000*60
      }else{
        if(minutes<59){
          hours=hours+1
          return hours*1000*60*60
        }
      }

    console.log("H:M->",hours, minutes)

  let hoursS = (hours < 10) ? "0" + hours : hours;
  let minutesS = (minutes < 10) ? "0" + minutes : minutes;
  let secondsS = (seconds < 10) ? "0" + seconds : seconds;

  //return hoursS + ":" + minutesS + ":" + secondsS 
}

stepSize(milliseconds){
  let hours = Math.floor(milliseconds / 3600000) // 1 Hour = 36000 Milliseconds
  let minutes = Math.floor((milliseconds % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
  let seconds = Math.round(((milliseconds % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds


  if(hours!=0){
    return (Math.floor((milliseconds/4) / (1000*60*60)))*1000*60*60
  }else{
    return (Math.floor((milliseconds/4) / (1000*60)))*1000*60
  }
  // if(hours!=0){
  //   let hourss= ((hours/4)%2==0)? hours/4 : (hours/4)+1;
  //   console.log("H:",hourss);
  //   return (hourss)*1000*60*60
  // }else{
  //   let minutess=(minutes%2==0)? minutes : minutes+1;
  //   console.log("M:",minutess);
  //   return (minutess/4)*1000*60
  // }
 
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
  this.barChart.destroy();
  this.subscription.unsubscribe();
  this.durationConversationTimeCHART(value,this.selectedDeptId);
  console.log('REQUEST:', value, this.selectedDeptId)
}

depSelected(selectedDeptId){
  console.log('dep', selectedDeptId);
  this.barChart.destroy();
  this.subscription.unsubscribe();
  this.durationConversationTimeCHART(this.selectedDaysId,selectedDeptId )
  console.log('REQUEST:', this.selectedDaysId, selectedDeptId)
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

getBrowserLangAndSwitchMonthName() {
    
  if (this.lang) {
    if (this.lang === 'it') {
      this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
    } else {
      this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
    }
  }
}

durationConvTimeCLOCK() {
  this.subscription = this.analyticsService.getDurationConversationTimeDataCLOCK().subscribe((res: any) => {

    let avarageWaitingTimestring;
    let splitString;

    if (res && res.length > 0) {
      console.log('»»»» res[0].duration_avg ', res[0].duration_avg)
      console.log('»»»» typeof res[0].duration_avg ', typeof res[0].duration_avg)
      if (res[0].duration_avg) {
        if ((res[0].duration_avg !== null) || (res[0].duration_avg !== undefined)) {
          // this.humanizer.setOptions({round: true, units:['m']});
          // this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
          avarageWaitingTimestring = this.humanizeDurations(res[0].duration_avg)
          splitString = this.humanizeDurations(res[0].duration_avg).split(" ");
          // this.numberDurationCNVtime = splitString[0];
          this.numberDurationCNVtime = this.msToTIME(res[0].duration_avg);// --> show in format h:m:s
          this.unitDurationCNVtime = splitString[1];


          this.responseDurationtime = this.humanizer.humanize(res[0].duration_avg, { round: true, language: this.lang });


          console.log('Waiting time: humanize', this.humanizer.humanize(res[0].duration_avg))
          console.log('waiting time funtion:', avarageWaitingTimestring);

        } else {

          this.setToNa();
        }
      } else {
        this.setToNa();

        console.log('Waiting time: humanize', this.humanizer.humanize(0))
        console.log('waiting time funtion:', avarageWaitingTimestring);
      }
    } else {
      this.setToNa();
      
      console.log('Waiting time: humanize', this.humanizer.humanize(0))
      console.log('waiting time funtion:', avarageWaitingTimestring);
    }

  }, (error) => {
    console.log('!!! ANALYTICS - DURATION CONVERSATION CLOCK REQUEST - ERROR ', error);
    this.setToNa();

  }, () => {
    console.log('!!! ANALYTICS - DURATION CONVERSATION CLOCK REQUEST * COMPLETE *');
  });
}

setToNa() {

    this.numberDurationCNVtime = 'N.a.'
    this.unitDurationCNVtime = '';
    this.responseDurationtime = 'N.a.'
  
}

  durationConversationTimeCHART(lastdays, depID) {
    this.subscription=this.analyticsService.getDurationConversationTimeDataCHART(lastdays,depID).subscribe((resp: any) => {
      
      if (resp) {
        console.log("Duration time", resp)

        const lastNdays_initarrayDURATION = []
        for (let i = 0; i < lastdays; i++) {
          // console.log('»» !!! ANALYTICS - LOOP INDEX', i);
          lastNdays_initarrayDURATION.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 })
        }
        lastNdays_initarrayDURATION.reverse()

        //this.dataRangeDuration = last30days_initarrayDURATION[0].date + ' - ' + last30days_initarrayDURATION[30].date;

        console.log('»» !!! ANALYTICS - REQUESTS CONVERSATION LENGHT BY DAY - MOMENT LAST 30 DATE (init array)', lastNdays_initarrayDURATION);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDurationCOnversationChart = [];
        for (let j in resp) {

          // this.humanizer.setOptions({round: true, units:['h']});
          // const AVGtimevalue= this.humanizer.humanize(res[i].waiting_time_avg).split(" ")
          // console.log("value humanizer:", this.humanizer.humanize(res[i].waiting_time_avg), "split:",AVGtimevalue)

          if (resp[j].duration_avg == null)
            resp[j].duration_avg = 0;

          customDurationCOnversationChart.push({ date: new Date(resp[j]._id.year, resp[j]._id.month - 1, resp[j]._id.day).toLocaleDateString(), value: resp[j].duration_avg });
        }

        console.log("Custom Duration COnversation data:", customDurationCOnversationChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestDurationConversationByDays_final_array = lastNdays_initarrayDURATION.map(obj => customDurationCOnversationChart.find(o => o.date === obj.date) || obj);
        console.log('»» !!! ANALYTICS - REQUESTS CONVERSATION LENGHT BY DAY - FINAL ARRAY ', requestDurationConversationByDays_final_array);

        const requestDurationConversationByDays_series_array = [];
        const requestDurationConversationByDays_labels_array = [];
       
        //select init and end day to show on div
        this.initDay=requestDurationConversationByDays_final_array[0].date;
        this.endDay=requestDurationConversationByDays_final_array[lastdays-1].date;
        console.log("INIT", this.initDay, "END", this.endDay);

        requestDurationConversationByDays_final_array.forEach(requestByDay => {
          console.log('»» !!! ANALYTICS - REQUESTS CONVERSATION LENGHT BY DAY - requestByDay', requestByDay);
          requestDurationConversationByDays_series_array.push(requestByDay.value)
  
          const splitted_date = requestByDay.date.split('/');
          console.log('»» !!! ANALYTICS - REQUESTS CONVERSATION LENGHT BY DAY - SPLITTED DATE', splitted_date);
          requestDurationConversationByDays_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });

        this.xValueDurationConversation=requestDurationConversationByDays_labels_array;
        this.yValueDurationConversation=requestDurationConversationByDays_series_array;


        // this.xValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
        //   return e.date
        // })
        // this.yValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
        //   return e.value
        // })

        console.log("Xlabel-DURATION", this.xValueDurationConversation);
        console.log("Ylabel-DURATION", this.yValueDurationConversation);
      }
      else
        console.log("!!!ERROR!!! while get data from resouces for duration conversation time graph")

        //set the stepsize 
        var stepsize;
        if(this.selectedDaysId>60){
            stepsize=10;
        }
        else {
          stepsize=this.selectedDaysId
        }
        let lang= this.lang;
        const higherCount = this.getMaxOfArray(this.yValueDurationConversation);
        console.log("MS",this.msToTime(higherCount))
        console.log("STEPSIZE",this.stepSize(higherCount))

      this.barChart = new Chart('durationConversationTimeResponse', {
        type: 'bar',
        data: {
          labels: this.xValueDurationConversation,
          datasets: [{
            label: 'Average duration conversation lenght response in last N days ',
            data: this.yValueDurationConversation,
            fill: false, //riempie zona sottostante dati
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
          },
            // {
            //   label: 'Average duration conversation time response in last 30 days _LINE ',
            //   data: this.yValueDurationConversation,
            //   fill:false, //riempie zona sottostante dati
            //   lineTension:0.1,
            //   borderColor:'red',
            //   backgroundColor: 'red',
            //   borderWidth: 5,
            //   type: 'line'
            // },
          ]
        },
        options: {
          maintainAspectRatio:false,
          title: {
            text: 'DURATION CONVERSATION LENGHT RESPONSE',
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
                minRotation: 0,
                fontColor:'black'
              },
              gridLines: {
                display: false,
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
                display: true,
                //max: this.msToTime(higherCount),
                //stepsize is calculate: transform higherCount/4 (4 because decide to divide yAxis i 4 region) in 
                //hour with Math.floor( num/1000*60*60) that return an hour. then convert hour returned in
                // milliconds again multipling Math.floor()*1000*60*60
                //stepSize:(Math.floor((higherCount/4) / (1000*60*60)))*1000*60*60, 
                stepSize: this.stepSize(higherCount),
                callback: function (value, index, values) {
                  let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                  let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                  let seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
                  
                  //add 0 before unit if needed to display 2-digit format hh:mm:ss
                  let hours_final = (hours < 10) ? "0" + hours : hours;
                  let minutes_final = (minutes < 10) ? "0" + minutes : minutes;
                  let seconds_final = (seconds < 10) ? "0" + seconds : seconds;

                  return hours_final + 'h:' + minutes_final + 'm:' + seconds_final + 's'
                }

              },

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
                // humanizer.setOptions({ round: true })
                // //console.log("humanize", humanizer.humanize(currentItemValue))
                // return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)
                if(lang==='it'){
                  return 'Lunghezza conversazione media: '+humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's']  } );
                }else{
                  return 'Median Conversation Lenght: ' +humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] } );
                }
              }
            }
          }
        }
      });


    })
  }


  // convert number from millisecond to humanizer form 
  humanizeDurations(timeInMillisecond) {
    let result;
    if (timeInMillisecond) {  
      if(this.lang=='en'){
        if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
            result = result === 1 ? result + " Year" : result + " Years";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
            result = result === 1 ? result + " Month" : result + " Months";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
            result = result === 1 ? result + " Day" : result + " Days";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
            result = result === 1 ? result + " Hours" : result + " Hours";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
            result = result === 1 ? result + " Minute" : result + " Minutes";
        } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
            result = result === 1 ? result + " Second" : result + " Seconds";
        } else {
            result = timeInMillisecond + " Millisec";
        }
      }
      else{
          if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
            result = result === 1 ? result + " Anno" : result + " Anni";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
            result = result === 1 ? result + " Mese" : result + " Mesi";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
            result = result === 1 ? result + " Giorno" : result + " Giorni";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
            result = result === 1 ? result + " Ora" : result + " Ore";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
            result = result === 1 ? result + " Minuto" : result + " Minuti";
        } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
            result = result === 1 ? result + " Secondo" : result + " Secondi";
        } else {
            result = timeInMillisecond + " Millisecondi";
        }
      }
        return result;

      }
  }

  getMaxOfArray(array) {
    return Math.max.apply(null, array);
  }



}
