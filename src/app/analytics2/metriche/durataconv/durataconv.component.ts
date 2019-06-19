import { AnalyticsService } from './../../../services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

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
  
  lang: string;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  constructor(  private analyticsService:AnalyticsService,
                private translate: TranslateService,) {
      
                this.lang = this.translate.getBrowserLang();
                console.log('LANGUAGE ', this.lang);
                }

  ngOnInit() {
    this.durationConvTimeCLOCK();
    this.durationConversationTimeCHART();
  }

  durationConvTimeCLOCK() {
    this.analyticsService.getDurationConversationTimeDataCLOCK().subscribe((res: any) => {
      
      let avarageWaitingTimestring;
      var splitString;
      
      if (res && res.length!==0) {


        //this.humanizer.setOptions({round: true, units:['m']});
    

        //this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
        avarageWaitingTimestring = this.humanizeDurations(res[0].duration_avg)
        splitString = this.humanizeDurations(res[0].duration_avg).split(" ");
        this.numberDurationCNVtime = splitString[0];
        this.unitDurationCNVtime = splitString[1];

        
        this.responseDurationtime=this.humanizer.humanize(res[0].duration_avg, { round: true, language: this.lang });

        
        console.log('Waiting time: humanize', this.humanizer.humanize(res[0].duration_avg))
        console.log('waiting time funtion:', avarageWaitingTimestring);
      }
        else{
          
          this.numberDurationCNVtime='n.a.'
          this.numberDurationCNVtime='';
          this.responseDurationtime='n.a.'

          console.log('Waiting time: humanize', this.humanizer.humanize(0))
          console.log('waiting time funtion:', avarageWaitingTimestring);
        }
          
      
    },(error) => {
      console.log('!!! ANALYTICS - DURATION CONVERSATION CLOCK REQUEST - ERROR ', error);
    }, () => {
      console.log('!!! ANALYTICS - DURATION CONVERSATION CLOCK REQUEST * COMPLETE *');
    });


  }

  durationConversationTimeCHART() {
    this.analyticsService.getDurationConversationTimeDataChart().subscribe((resp: any) => {
      if (resp) {
        console.log("Duration time", resp)

        const last30days_initarrayDURATION = []
        for (let i = 0; i <= 30; i++) {
          // console.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last30days_initarrayDURATION.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 })
        }
        last30days_initarrayDURATION.reverse()
        this.dataRangeDuration = last30days_initarrayDURATION[0].date + ' - ' + last30days_initarrayDURATION[30].date;

        console.log('»» !!! ANALYTICS - REQUESTS DURATION CONVERSATION BY DAY - MOMENT LAST 30 DATE (init array)', last30days_initarrayDURATION);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDurationCOnversationChart = [];
        for (let i in resp) {

          // this.humanizer.setOptions({round: true, units:['h']});
          // const AVGtimevalue= this.humanizer.humanize(res[i].waiting_time_avg).split(" ")
          // console.log("value humanizer:", this.humanizer.humanize(res[i].waiting_time_avg), "split:",AVGtimevalue)

          if (resp[i].duration_avg == null)
            resp[i].duration_avg = 0;

          customDurationCOnversationChart.push({ date: new Date(resp[i]._id.year, resp[i]._id.month - 1, resp[i]._id.day).toLocaleDateString(), value: resp[i].duration_avg });
        }
        console.log("Custom Duration COnversation data:", customDurationCOnversationChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestDurationConversationByDays_final_array = last30days_initarrayDURATION.map(obj => customDurationCOnversationChart.find(o => o.date === obj.date) || obj);
        console.log('»» !!! ANALYTICS - REQUESTS DURATION CONVERSATION BY DAY - FINAL ARRAY ', requestDurationConversationByDays_final_array);

        this.xValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
          return e.date
        })
        this.yValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
          return e.value
        })

        console.log("Xlabel-DURATION", this.xValueDurationConversation);
        console.log("Ylabel-DURATION", this.yValueDurationConversation);
      }
      else
        console.log("!!!ERROR!!! while get data from resouces for duration conversation time graph")

      var lineChart = new Chart('durationConversationTimeResponse', {
        type: 'bar',
        data: {
          labels: this.xValueDurationConversation,
          datasets: [{
            label: 'Average duration conversation time response in last 30 days ',
            data: this.yValueDurationConversation,
            fill: false, //riempie zona sottostante dati
            lineTension: 0.1,
            borderColor: '#1e88e5',
            backgroundColor: '#1e88e5',
            borderWidth: 5
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
          title: {
            text: 'DURATION CONVERSATION TIME RESPONSE',
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                minRotation: 30
              },

            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                callback: function (value, index, values) {
                  let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                  let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                  let seconds = Math.floor(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
                  return hours + 'h:' + minutes + 'm:' + seconds + 's'
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
                humanizer.setOptions({ round: true })
                //console.log("humanize", humanizer.humanize(currentItemValue))
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)

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



}
