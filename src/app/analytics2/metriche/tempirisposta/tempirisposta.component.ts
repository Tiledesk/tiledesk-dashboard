
import { AnalyticsService } from './../../../services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'appdashboard-tempirisposta',
  templateUrl: './tempirisposta.component.html',
  styleUrls: ['./tempirisposta.component.scss']
})
export class TempirispostaComponent implements OnInit {
  
  // avg time clock variable 
  numberAVGtime: String;
  unitAVGtime: String;
  responseAVGtime: String
  // avg time chart variable
  xValueAVGchart: any;
  yValueAVGchart: any;
  dateRangeAvg: String;
  
  monthNames:any;
  lang: string;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  constructor(  private analyticsService:AnalyticsService,
                private translate: TranslateService,) {
                  
                  this.lang = this.translate.getBrowserLang();
                  console.log('LANGUAGE ', this.lang);
                  this.getBrowserLangAndSwitchMonthName();
                 }

  ngOnInit() {
    this.avarageWaitingTimeCLOCK();
    this.avgTimeResponsechart();
  }

  msToTIME(value){
       let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
       let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
       let seconds = Math.floor(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
      return hours + 'h:' + minutes + 'm:' + seconds + 's'
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

  avarageWaitingTimeCLOCK(){
    this.analyticsService.getDataAVGWaitingCLOCK().subscribe((res:any)=>{
      let avarageWaitingTimestring;
      var splitString;

      if(res && res.length!=0){
        //this.avarageWaitingTimestring= this.msToTime(res[0].waiting_time_avg)
        
        //this.humanizer.setOptions({round: true, units:['m']});
        
      
        //this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
        avarageWaitingTimestring=this.humanizeDurations(res[0].waiting_time_avg)
        splitString= this.humanizeDurations(res[0].waiting_time_avg).split(" ");
        //this.numberAVGtime= splitString[0];
        this.unitAVGtime= splitString[1];
        
        this.numberAVGtime=this.msToTIME(res[0].waiting_time_avg); //--> show in format h:m:s

        this.responseAVGtime=this.humanizer.humanize(res[0].waiting_time_avg, {round: true, language:this.lang})
        
        console.log('Waiting time: humanize', this.humanizer.humanize(res[0].waiting_time_avg))
        console.log('waiting time funtion:', avarageWaitingTimestring);
        
        
      }else{
       
        this.numberAVGtime= 'N.a.'
        this.unitAVGtime= ''
        this.responseAVGtime='N.a.'
        
        console.log('Waiting time: humanize', this.humanizer.humanize(0))
        console.log('waiting time funtion:', avarageWaitingTimestring);
      }

     
    }, (error) => {
      console.log('!!! ANALYTICS - AVERAGE WAITING TIME CLOCK REQUEST  - ERROR ', error);
        this.numberAVGtime= 'N.a.'
        this.unitAVGtime= ''
        this.responseAVGtime='N.a.'
    }, () => {
      console.log('!!! ANALYTICS - AVERAGE TIME CLOCK REQUEST * COMPLETE *');
    });
    
  }

  avgTimeResponsechart(){
    this.analyticsService.getavarageWaitingTimeDataChart().subscribe((res:any)=>{
      console.log('chart data:',res);
      if(res){
        
        //build a 30 days array of date with value 0--> is the init array
        const last30days_initarray = []
        for (let i = 0; i <= 30; i++) {
          // console.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last30days_initarray.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0  });
        }

        last30days_initarray.reverse()
        this.dateRangeAvg= last30days_initarray[0].date.split(-4) +' - '+last30days_initarray[30].date;
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - MOMENT LAST 30 DATE (init array)', last30days_initarray);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDataLineChart= [];
        for (let i in res) {

          if (res[i].waiting_time_avg == null){
            res[i].waiting_time_avg = 0;
          }

            customDataLineChart.push({ date: new Date(res[i]._id.year, res[i]._id.month - 1, res[i]._id.day).toLocaleDateString(), value: res[i].waiting_time_avg });
        }
        
        console.log('Custom data:', customDataLineChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestByDays_final_array = last30days_initarray.map(obj => customDataLineChart.find(o => o.date === obj.date) || obj);
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);
        
        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];
  
        requestByDays_final_array.forEach(requestByDay => {
          console.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.value)
  
          const splitted_date = requestByDay.date.split('/');
          console.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });

        this.xValueAVGchart=_requestsByDay_labels_array;
        this.yValueAVGchart=_requestsByDay_series_array;
        //console.log("XXXX", _requestsByDay_labels_array);
        // this.xValueAVGchart=requestByDays_final_array.map(function(e){
          
        //   return e.date
        // })
        // this.yValueAVGchart=requestByDays_final_array.map(function(e){
        //   return e.value
        // })
  
        console.log('Xlabel-AVERAGE TIME', this.xValueAVGchart);
        console.log('Ylabel-AVERAGE TIME', this.yValueAVGchart);
      

        // Chart.plugins.register({
        //   beforeDraw: function(chartInstance, easing) {
        //     var ctx = chartInstance.chart.ctx;
        //     console.log("chart istance",chartInstance);
        //     ctx.fillStyle = 'red'; // your color here
        
        //     var chartArea = chartInstance.chartArea;
        //     ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        //   }
        // });

        const higherCount = this.getMaxOfArray(this.yValueAVGchart);
        console.log('»» !!! ANALYTICS - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

        let lang=this.lang;

      var lineChart = new Chart('avgTimeResponse', {
        type: 'bar',
        data: {
          labels: this.xValueAVGchart,
          datasets: [{
            label: 'Average time response in last 30 days ',
            data: this.yValueAVGchart,
            fill: true, //riempie zona sottostante dati
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            //pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            //pointBorderColor: '#1e88e5'
           

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
                display: true,
                minRotation: 0,
                fontColor: 'black',
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
                suggestedMax: higherCount + 200, //not work yet
                fontColor: 'black',
                callback: function (value, index, values) {
                  let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                  let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                  let seconds = Math.floor(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
                  return hours + 'h:' + minutes + 'm:' + seconds + 's'
                },

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
                // humanizer.setOptions({ round: true })
                // //console.log("humanize", humanizer.humanize(currentItemValue))
                // return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)
                if(lang==='it'){
                  return 'Tempo risposta medio: '+humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's']  } );
                }else{
                  return 'Median respose time: ' +humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's']  } );
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
            ctx.font="Google Sans"
            var chartArea = chartInstance.chartArea;
            //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          }
        }]
      });//fine chart
    }//fine if

    },(error) => {
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      console.log('»» !!! ANALYTICS - REQUESTS BY DAY * COMPLETE *');
    });

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
