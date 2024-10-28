import { FaqKbService } from '../../../services/faq-kb.service';
import { UsersService } from '../../../services/users.service';
import { DepartmentService } from '../../../services/department.service';
import { Component, OnInit } from '@angular/core';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
// import * as moment from 'moment';
import moment from "moment"
import { TranslateService } from '@ngx-translate/core';
import { Subscription, zip } from 'rxjs';
import { Observable } from 'rxjs';
import { LoggerService } from '../../../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CHANNELS } from 'app/utils/util';


@Component({
  selector: 'appdashboard-responsetimes',
  templateUrl: './responsetimes.component.html',
  styleUrls: ['./responsetimes.component.scss']
})
export class ResponseTimesComponent implements OnInit {

  // avg time clock variable 
  numberAVGtime: String;
  unitAVGtime: String;
  responseAVGtime: String
  // avg time chart variable
  xValueAVGchart: any;
  yValueAVGchart: any;
  dateRangeAvg: String;

  monthNames: any;
  lang: string;

  barChart: any;

  lastdays = 7;
  initDay: string;
  endDay: string;

  departments: any;

  selectedDaysId: number;   // lastdays filter
  selectedDeptId: string;   // department filter
  selectedAgentId: string;  // agent filter
  selectedChannelId: string;  // channel filter 

  subscription: Subscription;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  projectUserAndBotsArray = []
  projectUsersList: any;
  projectBotsList: any;
  bots: any;
  conversationType = [
    { id: '', name: 'All' },
    ... CHANNELS
  ];

  constructor(
    private analyticsService: AnalyticsService,
    private translate: TranslateService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private logger: LoggerService,
    private auth: AuthService
  ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - RESPONSETIMES] LANGUAGE ', this.lang);
    this.getBrowserLangAndSwitchMonthName();
  }

  ngOnInit() {
    this.selectedDeptId = '';
    this.selectedDaysId = 7;
    this.selectedAgentId = '';
    this.selectedChannelId = '';
    this.avarageWaitingTimeCLOCK();
    this.avgTimeResponseCHART(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
    this.getDepartments();
    this.getProjectUsersAndBots();
  }

  msToTIME(value) {
    let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
    let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    let seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds (prima era Math.floor ma non arrotonda i secondi)
    //this.logger.log("SECOND:",Math.round(((value % 360000) % 60000) / 1000))
    return hours + 'h:' + minutes + 'm:' + seconds + 's'
  }

  //not in use
  msToTime(duration) {
    let seconds = Math.round((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)


    if (minutes % 2 != 0) {
      minutes = minutes + 1
    } else {
      if (minutes < 59) {
        hours = hours + 1
      }
    }

    this.logger.log("[ANALYTICS - RESPONSETIMES] H:M->", hours, minutes)

    let hoursS = (hours < 10) ? "0" + hours : hours;
    let minutesS = (minutes < 10) ? "0" + minutes : minutes;
    let secondsS = (seconds < 10) ? "0" + seconds : seconds;

    return hoursS + ":" + minutesS + ":" + secondsS
  }

  stepSize(milliseconds) {
    let hours = Math.floor(milliseconds / 3600000) // 1 Hour = 36000 Milliseconds
    let minutes = Math.floor((milliseconds % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    let seconds = Math.round(((milliseconds % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds


    if (hours != 0) {
      return (Math.floor((milliseconds / 4) / (1000 * 60 * 60))) * 1000 * 60 * 60
    } else {
      return (Math.floor((milliseconds / 4) / (1000 * 60))) * 1000 * 60
    }
    // if(hours!=0){
    //   let hourss= ((hours/4)%2==0)? hours/4 : (hours/4)+1;
    //   this.logger.log("H:",hourss);
    //   return (hourss)*1000*60*60
    // }else{
    //   let minutess=(minutes%2==0)? minutes : minutes+1;
    //   this.logger.log("M:",minutess);
    //   return (minutess/4)*1000*60
    // }

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
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.avgTimeResponseCHART(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
    this.logger.log('[ANALYTICS - RESPONSETIMES] daysSelect REQUEST:', value, this.selectedDeptId, this.selectedAgentId)
  }

  depSelected(selectedDeptId) {
    this.logger.log('[ANALYTICS - RESPONSETIMES] selectedDeptId', selectedDeptId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.avgTimeResponseCHART(this.selectedDaysId, selectedDeptId, this.selectedAgentId, this.selectedChannelId)
    this.logger.log('[ANALYTICS - RESPONSETIMES] depSelected REQUEST:', this.selectedDaysId, selectedDeptId, this.selectedAgentId)
  }

  agentSelected(selectedAgentId) {
    this.logger.log("[ANALYTICS - RESPONSETIMES] selectedAgentId: ", selectedAgentId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.avgTimeResponseCHART(this.selectedDaysId, this.selectedDeptId, selectedAgentId, this.selectedChannelId)
    this.logger.log('[ANALYTICS - RESPONSETIMES] selectedAgentId REQUEST:', this.selectedDaysId, this.selectedDeptId, selectedAgentId)
  }

  conversationTypeSelected(selectedChannelId){
    this.logger.log("[ANALYTICS - CONVS]  Selected channel: ", selectedChannelId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.avgTimeResponseCHART(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, selectedChannelId)
    this.logger.log('[ANALYTICS - RESPONSETIMES] selectedChannelId REQUEST:', this.selectedDaysId, this.selectedDeptId, this.selectedAgentId)
  }

  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[ANALYTICS - RESPONSETIMES] - GET DEPTS RESPONSE by analitycs ', _departments);
      this.departments = _departments

    }, error => {
      this.logger.error('[ANALYTICS - RESPONSETIMES] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[ANALYTICS - RESPONSETIMES] - GET DEPTS * COMPLETE *')
    });
  }

  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();


    zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        // console.log('[ANALYTICS - RESPONSETIMES] - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        // console.log('[ANALYTICS - RESPONSETIMES] - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

        if (pair && pair._projectUsers) {
          this.projectUsersList = pair._projectUsers;

          this.projectUsersList.forEach(p_user => {
            this.projectUserAndBotsArray.push({ id: p_user.id_user._id, name: p_user.id_user.firstname + ' ' + p_user.id_user.lastname });
          });
        }

        if (pair && pair._bots) {
          this.bots = pair._bots
            .filter(bot => {
              if (bot['trashed'] === false) {
                return true
              } else {
                return false
              }
            })

          this.bots.forEach(bot => {
            this.projectUserAndBotsArray.push({ id: 'bot_' + bot._id, name: bot.name + ' (bot)' })
          });
        }

        // console.log('[ANALYTICS - RESPONSETIMES] - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

      }, error => {
        this.logger.error('[ANALYTICS - RESPONSETIMES] - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.logger.log('[ANALYTICS - RESPONSETIMES] - GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  getBrowserLangAndSwitchMonthName() {

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

            this.responseAVGtime = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: dshbrd_lang })

            this.logger.log('[ANALYTICS - RESPONSETIMES] Waiting time: humanize', this.humanizer.humanize(res[0].waiting_time_avg))
            this.logger.log('[ANALYTICS - RESPONSETIMES] waiting time funtion:', this.humanizeDurations(res[0].waiting_time_avg));

          } else {
            this.setToNa();

            this.logger.log('[ANALYTICS - RESPONSETIMES] Waiting time: humanize', this.humanizer.humanize(0))
            this.logger.log('[ANALYTICS - RESPONSETIMES] waiting time funtion:', this.humanizeDurations(0));
          }

        } else {
          this.setToNa();
        }
      } else {
        this.setToNa();

        this.logger.log('[ANALYTICS - RESPONSETIMES] Waiting time: humanize', this.humanizer.humanize(0))
        this.logger.log('[ANALYTICS - RESPONSETIMES] waiting time funtion:', this.humanizeDurations(0));
      }

    }, (error) => {
      this.logger.error('[ANALYTICS - RESPONSETIMES] - AVERAGE WAITING TIME CLOCK REQUEST  - ERROR ', error);
      this.setToNa();
    }, () => {
      this.logger.log('[ANALYTICS - RESPONSETIMES] - AVERAGE TIME CLOCK REQUEST * COMPLETE *');
    });
  }

  setToNa() {
    this.numberAVGtime = '0'
    this.unitAVGtime = ''
    this.responseAVGtime = '0'
  }

  avgTimeResponseCHART(lastdays, depID, participantID, channelID) {
    this.subscription = this.analyticsService.getavarageWaitingTimeDataCHART(lastdays, depID, participantID, channelID).subscribe((res: any) => {
      // console.log('[ANALYTICS - RESPONSETIMES] avgTimeResponseCHART chart data:', res);
      if (res) {

        //build a 30 days array of date with value 0--> is the init array
        const lastNdays_initarray = []
        for (let i = 0; i < lastdays; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          lastNdays_initarray.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 });
        }

        lastNdays_initarray.reverse()
        //this.dateRangeAvg= last30days_initarray[0].date.split(-4) +' - '+last30days_initarray[30].date;
        //  console.log('[ANALYTICS - RESPONSETIMES]- RESPONSE TIME REQUESTS BY DAY - MOMENT LAST n DATE (init array)', lastNdays_initarray);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDataLineChart = [];
        for (let j in res) {

          if (res[j].waiting_time_avg == null) {
            res[j].waiting_time_avg = 0;
          }

          // customDataLineChart.push({ date: new Date(res[j]._id.year, res[j]._id.month - 1, res[j]._id.day).toLocaleDateString(), value: res[j].waiting_time_avg });
          customDataLineChart.push({ date: res[j]._id.day + '/' + res[j]._id.month + '/' + res[j]._id.year, value: res[j].waiting_time_avg });
        }

        //  console.log('[ANALYTICS - RESPONSETIMES] Custom data LineChart):', customDataLineChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestByDays_final_array = lastNdays_initarray.map(obj => customDataLineChart.find(o => o.date === obj.date) || obj);
        this.logger.log('[ANALYTICS - RESPONSETIMES] - RESPONSE TIME REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];

        //select init and end day to show on div
        this.initDay = requestByDays_final_array[0].date;
        this.endDay = requestByDays_final_array[lastdays - 1].date;
        this.logger.log("[ANALYTICS - RESPONSETIMES] INIT", this.initDay, "END", this.endDay);

        requestByDays_final_array.forEach(requestByDay => {
          this.logger.log('[ANALYTICS - RESPONSETIMES] - RESPONSE TIME REQUESTS BY DAY - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.value)

          const splitted_date = requestByDay.date.split('/');
          this.logger.log('[ANALYTICS - RESPONSETIMES] - RESPONSE TIME REQUESTS BY DAY - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });

        this.xValueAVGchart = _requestsByDay_labels_array;
        this.yValueAVGchart = _requestsByDay_series_array;
        //this.logger.log("XXXX", _requestsByDay_labels_array);
        // this.xValueAVGchart=requestByDays_final_array.map(function(e){

        //   return e.date
        // })
        // this.yValueAVGchart=requestByDays_final_array.map(function(e){
        //   return e.value
        // })

        this.logger.log('[ANALYTICS - RESPONSETIMES] Xlabel-RESPONSE TIME', this.xValueAVGchart);
        this.logger.log('[ANALYTICS - RESPONSETIMES] Ylabel-RESPONSE TIME', this.yValueAVGchart);


        // Chart.plugins.register({
        //   beforeDraw: function(chartInstance, easing) {
        //     var ctx = chartInstance.chart.ctx;
        //     this.logger.log("chart istance",chartInstance);
        //     ctx.fillStyle = 'red'; // your color here

        //     var chartArea = chartInstance.chartArea;
        //     ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
        //   }
        // });

        const higherCount = this.getMaxOfArray(this.yValueAVGchart);
        this.logger.log('[ANALYTICS - RESPONSETIMES] - RESPONSE TIME REQUESTS BY DAY - HIGHER COUNT ', higherCount);
        this.msToTime(higherCount)
        var hours = (higherCount / 4) / (1000 * 60 * 60);
        var absoluteHours = Math.floor((higherCount / 4) / (1000 * 60 * 60));
        this.logger.log("[ANALYTICS - RESPONSETIMES] step absoluteHours", absoluteHours);

        //set the stepsize 
        var stepsize;
        if (this.selectedDaysId > 60) {
          stepsize = 10;
        }
        else {
          stepsize = this.selectedDaysId
        }
        let lang = this.lang;

        this.barChart = new Chart('avgTimeResponse', {
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
            maintainAspectRatio: false,
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
                  //stepsize is calculate: transform higherCount/4 (4 because decide to divide yAxis i 4 region) in 
                  //hour with Math.floor( num/1000*60*60) that return an hour. then convert hour returned in
                  // milliconds again multipling Math.floor()*1000*60*60
                  //stepSize:(Math.floor((higherCount/4) / (1000*60*60)))*1000*60*60,
                  //suggestedMax: higherCount,// + 20000000
                  stepSize: this.stepSize(higherCount),
                  fontColor: 'black',
                  callback: function (value, index, values) {
                    let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                    let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                    let seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

                    //add 0 before unit if needed to display 2-digit format hh:mm:ss
                    let hours_final = (hours < 10) ? "0" + hours : hours;
                    let minutes_final = (minutes < 10) ? "0" + minutes : minutes;
                    let seconds_final = (seconds < 10) ? "0" + seconds : seconds;

                    return hours_final + 'h:' + minutes_final + 'm:' + seconds_final + 's'
                  },

                }
              }]
            },
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => {
                  // var label = data.datasets[tooltipItem.datasetIndex].label || '';
                  // if (label) {
                  //     label += ': ';
                  // }
                  // label += Math.round(tooltipItem.yLabel * 100) / 100;
                  // return label + '';
                  //this.logger.log("data",data)
                  const currentItemValue = tooltipItem.yLabel
                  let langService = new HumanizeDurationLanguage();
                  let humanizer = new HumanizeDuration(langService);
                  // humanizer.setOptions({ round: true })
                  // //this.logger.log("humanize", humanizer.humanize(currentItemValue))
                  // return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)

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

                  return this.translate.instant('AverageResponseTime') + ': ' + humanizer.humanize(currentItemValue, { round: true, language: dshbrd_lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] });

                  // if (lang === 'it') {
                  //   return 'Tempo risposta medio: ' + humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] });
                  // } else {
                  //   return 'Median respose time: ' + humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] });
                  // }

                }
              }
            }

          },
          plugins: [{
            beforeDraw: function (chartInstance, easing) {
              var ctx = chartInstance.chart.ctx;
              //this.logger.log("chartistance",chartInstance)
              //ctx.fillStyle = 'red'; // your color here
              ctx.font = 'Roboto'
              var chartArea = chartInstance.chartArea;
              //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            }
          }]
        });//fine chart
      }//fine if

    }, (error) => {
      this.logger.error('[ANALYTICS - RESPONSETIMES] - RESPONSE TIME REQUESTS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS - RESPONSETIMES] - RESPONSE TIME REQUESTS BY DAY * COMPLETE *');
    });

  }


  // convert number from millisecond to humanizer form 
  humanizeDurations(timeInMillisecond) {
    let result;
    if (timeInMillisecond) {
      if (this.lang == 'en') {
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
      else {
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
