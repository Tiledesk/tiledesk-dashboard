import { FaqKbService } from '../../../services/faq-kb.service';
import { UsersService } from '../../../services/users.service';
import { DepartmentService } from '../../../services/department.service';
import { Component, OnInit } from '@angular/core';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
import moment from "moment";
import { TranslateService } from '@ngx-translate/core';
import { of, Subscription, Observable, zip } from 'rxjs';
import { ProjectUser } from '../../../models/project-user';
import { FaqKb } from '../../../models/faq_kb-model';

import { LoggerService } from '../../../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';

import { map } from 'rxjs/operators';
import { AnalyticsService } from 'app/services/analytics.service';
import { CHANNELS } from 'app/utils/util';

@Component({
  selector: 'appdashboard-convsduration',
  templateUrl: './convsduration.component.html',
  styleUrls: ['./convsduration.component.scss']
})
export class ConvsDurationComponent implements OnInit {

  // duration time clock variable
  numberDurationCNVtime: String;
  unitDurationCNVtime: String;
  responseDurationtime: String;
  // duration conversation chart variable
  xValueDurationConversation: any;
  yValueDurationConversation: any;
  dataRangeDuration: String;

  barChart: any;

  lang: string;
  monthNames: any;

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
  durationConversationTime: any;
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
    this.logger.log('LANGUAGE ', this.lang);
    this.getBrowserLangAndSwitchMonthName();
  }

  ngOnInit() {
    this.selectedDeptId = '';
    this.selectedDaysId = 7;
    this.selectedAgentId = '';
    this.selectedChannelId = '';
    this.durationConvTimeCLOCK();
    this.durationConversationTimeCHART(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
    this.getDepartments();
    this.getProjectUsersAndBots();
  }

  ngOnDestroy() {
    this.logger.log('[ANALYTICS - DURATACONV] CONVERSATION LENGHT - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  msToTIME(value) {
    const hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
    const minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    const seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
    // per i secondi prima era Math.floor ma non arrotonda i secondi --> Math.round
    return hours + 'h:' + minutes + 'm:' + seconds + 's'
  }

  // not in use
  msToTime(duration) {
    let hours = Math.floor(duration / 3600000) // 1 Hour = 36000 Milliseconds
    let minutes = Math.floor((duration % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    const seconds = Math.round(((duration % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

    if (minutes % 2 !== 0) {
      minutes = minutes + 1
      return (minutes) * 1000 * 60
    } else {
      if (minutes < 59) {
        hours = hours + 1
        return hours * 1000 * 60 * 60
      }
    }

    this.logger.log('[ANALYTICS - DURATACONV] H:M->', hours, minutes)

    const hoursS = (hours < 10) ? '0' + hours : hours;
    const minutesS = (minutes < 10) ? '0' + minutes : minutes;
    const secondsS = (seconds < 10) ? '0' + seconds : seconds;

    // return hoursS + ":" + minutesS + ":" + secondsS
  }

  stepSize(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000) // 1 Hour = 36000 Milliseconds
    const minutes = Math.floor((milliseconds % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    const seconds = Math.round(((milliseconds % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

    if (hours !== 0) {
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

    this.selectedDaysId = value; // --> value to pass throw for graph method
    // check value for label in htlm
    if (value <= 30) {
      this.lastdays = value;
    } else if ((value === 90) || (value === 180)) {
      this.lastdays = value / 30;
    } else if (value === 360) {
      this.lastdays = 1;
    }
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.durationConversationTimeCHART(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
    this.logger.log('[ANALYTICS - DURATACONV] REQUEST:', value, this.selectedDeptId, this.selectedAgentId)
  }

  depSelected(selectedDeptId: string) {
    this.logger.log('dep', selectedDeptId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.durationConversationTimeCHART(this.selectedDaysId, selectedDeptId, this.selectedAgentId, this.selectedChannelId)
    this.logger.log('[ANALYTICS - DURATACONV] REQUEST:', this.selectedDaysId, selectedDeptId, this.selectedAgentId)
  }

  agentSelected(selectedAgentId) {
    this.logger.log("[ANALYTICS - DURATACONV] Selected agent: ", selectedAgentId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.durationConversationTimeCHART(this.selectedDaysId, this.selectedDeptId, selectedAgentId, this.selectedChannelId)
    this.logger.log('[ANALYTICS - DURATACONV] REQUEST:', this.selectedDaysId, this.selectedDeptId, selectedAgentId)
  }

  conversationTypeSelected(selectedChannelId){
    this.logger.log("[ANALYTICS - CONVS]  Selected channel: ", selectedChannelId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.durationConversationTimeCHART(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, selectedChannelId)
    this.logger.log('[ANALYTICS - DURATACONV] REQUEST:', this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, selectedChannelId)
  }



  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[ANALYTICS - DURATACONV] - GET DEPTS RESPONSE by analitycs ', _departments);
      this.departments = _departments

    }, error => {
      this.logger.error('[ANALYTICS] - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[ANALYTICS] - GET DEPTS * COMPLETE *')
    });
  }


  // getProjectUsersAndBots() {
  //   //https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs <- da testare
  //   https://stackoverflow.com/questions/56924823/how-can-i-zip-2-observables-so-i-get-one-observables-with-two-rows <- l'attuale
  //   const projectUsers = this.usersService.getProjectUsersByProjectId();
  //   const bots = this.faqKbService.getAllBotByProjectId();

  //   //     const a$: Observable<[]> = of(projectUsers);
  //   // const b$: Observable<Array<any>> = of(bots);
  //   const result$ = zip(projectUsers, bots).pipe(
  //     map(twoArrays => {
  //       const a = twoArrays[0];
  //       const b = twoArrays[1];
  //       const r: Array<[any, any]> = [];
  //       for (let i = 0; i < a.length; i++) {
  //         r.push([a[i], b[i]]);
  //       }
  //       return r;
  //     })
  //   );



    // Observable
    //   .zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
    //   .subscribe(pair => {
    //     this.logger.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
    //     this.logger.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

    //     if (pair && pair._projectUsers) {
    //       this.projectUsersList = pair._projectUsers;

    //       this.projectUsersList.forEach(p_user => {
    //         this.projectUserAndBotsArray.push({ id: p_user.id_user._id, name: p_user.id_user.firstname + ' ' + p_user.id_user.lastname });
    //       });
    //     }

    //     if (pair && pair._bots) {
    //       this.bots = pair._bots
    //         .filter(bot => {
    //           if (bot['trashed'] === false) {
    //             return true
    //           } else {
    //             return false
    //           }
    //         })

    //       this.bots.forEach(bot => {
    //         this.projectUserAndBotsArray.push({ id: 'bot_' + bot._id, name: bot.name + ' (bot)' })
    //       });
    //     }

    //     this.logger.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

    //   }, error => {
    //     this.logger.error('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - ERROR: ', error);
    //   }, () => {
    //     this.logger.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - COMPLETE');
    //   });
    // }



    getProjectUsersAndBots() {
      // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs

      const projectUsers = this.usersService.getProjectUsersByProjectId();
      const bots = this.faqKbService.getAllBotByProjectId();


        zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
        .subscribe(pair => {
          // console.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
          // console.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

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

          // console.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

        }, error => {
          this.logger.error('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - ERROR: ', error);
        }, () => {
          this.logger.log('[ANALYTICS - DURATACONV] CONV LENGTH ANALYTICS - GET P-USERS-&-BOTS - COMPLETE');
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

    durationConvTimeCLOCK() {
      this.subscription = this.analyticsService.getDurationConversationTimeDataCLOCK().subscribe((res: any) => {

        let avarageWaitingTimestring: string;
        let splitString: string;

        if (res && res.length > 0) {
          this.logger.log('[ANALYTICS - DURATACONV] »»»» res[0].duration_avg ', res[0].duration_avg)
          this.logger.log('[ANALYTICS - DURATACONV] »»»» typeof res[0].duration_avg ', typeof res[0].duration_avg)
          if (res[0].duration_avg) {
            if ((res[0].duration_avg !== null) || (res[0].duration_avg !== undefined)) {
              // this.humanizer.setOptions({round: true, units:['m']});
              // this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
              avarageWaitingTimestring = this.humanizeDurations(res[0].duration_avg)
              splitString = this.humanizeDurations(res[0].duration_avg).split(' ');
              // this.numberDurationCNVtime = splitString[0];
              this.numberDurationCNVtime = this.msToTIME(res[0].duration_avg); // --> show in format h:m:s
              this.unitDurationCNVtime = splitString[1];

              const browserLang = this.translate.getBrowserLang();

              let stored_preferred_lang = undefined
              if (this.auth.user_bs && this.auth.user_bs.value) {
                stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
              }


              let dshbrd_lang = ''
              if (browserLang && !stored_preferred_lang) {
                dshbrd_lang = browserLang
              } else if (browserLang && stored_preferred_lang) {
                dshbrd_lang = stored_preferred_lang
              }


              this.responseDurationtime = this.humanizer.humanize(res[0].duration_avg, { round: true, language: dshbrd_lang });


              this.logger.log('[ANALYTICS - DURATACONV] Waiting time: humanize', this.humanizer.humanize(res[0].duration_avg))
              this.logger.log('[ANALYTICS - DURATACONV] waiting time funtion:', avarageWaitingTimestring);

            } else {

              this.setToNa();
            }
          } else {
            this.setToNa();

            this.logger.log('[ANALYTICS - DURATACONV] Waiting time: humanize', this.humanizer.humanize(0))
            this.logger.log('[ANALYTICS - DURATACONV] waiting time funtion:', avarageWaitingTimestring);
          }
        } else {
          this.setToNa();

          this.logger.log('[ANALYTICS - DURATACONV] Waiting time: humanize', this.humanizer.humanize(0))
          this.logger.log('[ANALYTICS - DURATACONV] waiting time funtion:', avarageWaitingTimestring);
        }

      }, (error) => {
        this.logger.error('[ANALYTICS - DURATACONV] CLOCK REQUEST - ERROR ', error);
        this.setToNa();

      }, () => {
        this.logger.log('[ANALYTICS - DURATACONV] CLOCK REQUEST * COMPLETE *');
      });
    }

    setToNa() {

      this.numberDurationCNVtime = '0'
      this.unitDurationCNVtime = '';
      this.responseDurationtime = '0'

    }

    durationConversationTimeCHART(lastdays, depID, participantId, channelID) {
      this.subscription = this.analyticsService.getDurationConversationTimeDataCHART(lastdays, depID, participantId, channelID).subscribe((resp: any) => {

        if (resp) {
          this.durationConversationTime = resp
          this.logger.log('[ANALYTICS - DURATACONV] Duration time', resp)

          const lastNdays_initarrayDURATION = []
          for (let i = 0; i < lastdays; i++) {
            // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
            lastNdays_initarrayDURATION.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 })
          }
          lastNdays_initarrayDURATION.reverse()

          // this.dataRangeDuration = last30days_initarrayDURATION[0].date + ' - ' + last30days_initarrayDURATION[30].date;

          this.logger.log('[ANALYTICS - DURATACONV] - REQUESTS CONVERSATION LENGHT BY DAY - MOMENT LAST 30 DATE (init array)', lastNdays_initarrayDURATION);

          // build a custom array with che same structure of "init array" but with key value of serviceData
          // i'm using time_convert function that return avg_time always in hour
          const customDurationCOnversationChart = [];

          for (let j in resp) {

            // this.humanizer.setOptions({round: true, units:['h']});
            // const AVGtimevalue= this.humanizer.humanize(res[i].waiting_time_avg).split(" ")
            // this.logger.log("value humanizer:", this.humanizer.humanize(res[i].waiting_time_avg), "split:",AVGtimevalue)

            if (resp[j].duration_avg == null)
              resp[j].duration_avg = 0;

            // customDurationCOnversationChart.push({ date: new Date(resp[j]._id.year, resp[j]._id.month - 1, resp[j]._id.day).toLocaleDateString(), value: resp[j].duration_avg });
            customDurationCOnversationChart.push({ date: resp[j]._id.day + '/' + resp[j]._id.month + '/' + resp[j]._id.year, value: resp[j].duration_avg });

          }


          this.logger.log('[ANALYTICS - DURATACONV] Custom Duration Conversation data:', customDurationCOnversationChart);

          // build a final array that compars value between the two arrray before builded with respect to date key value
          const requestDurationConversationByDays_final_array = lastNdays_initarrayDURATION.map(obj => customDurationCOnversationChart.find(o => o.date === obj.date) || obj);
          this.logger.log('[ANALYTICS - DURATACONV] - REQUESTS CONVERSATION LENGHT BY DAY - FINAL ARRAY ', requestDurationConversationByDays_final_array);

          const requestDurationConversationByDays_series_array = [];
          const requestDurationConversationByDays_labels_array = [];

          // select init and end day to show on div
          this.initDay = requestDurationConversationByDays_final_array[0].date;
          this.endDay = requestDurationConversationByDays_final_array[lastdays - 1].date;
          this.logger.log('[ANALYTICS - DURATACONV] INIT', this.initDay, 'END', this.endDay);

          requestDurationConversationByDays_final_array.forEach(requestByDay => {
            this.logger.log('[ANALYTICS - DURATACONV] - REQUESTS CONVERSATION LENGHT BY DAY - requestByDay', requestByDay);
            requestDurationConversationByDays_series_array.push(requestByDay.value)

            const splitted_date = requestByDay.date.split('/');
            this.logger.log('[ANALYTICS - DURATACONV] - REQUESTS CONVERSATION LENGHT BY DAY - SPLITTED DATE', splitted_date);
            requestDurationConversationByDays_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
          });

          this.xValueDurationConversation = requestDurationConversationByDays_labels_array;
          this.yValueDurationConversation = requestDurationConversationByDays_series_array;


          // this.xValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
          //   return e.date
          // })
          // this.yValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
          //   return e.value
          // })

          this.logger.log('[ANALYTICS - DURATACONV] Xlabel-DURATION', this.xValueDurationConversation);
          this.logger.log('[ANALYTICS - DURATACONV] Ylabel-DURATION', this.yValueDurationConversation);
        } else {
          this.logger.error('[ANALYTICS - DURATACONV] !!!ERROR!!! while get data from resouces for duration conversation time graph');
        }

        // set the stepsize
        let stepsize: number;
        if (this.selectedDaysId > 60) {
          stepsize = 10;
        } else {
          stepsize = this.selectedDaysId
        }
        const lang = this.lang;
        const higherCount = this.getMaxOfArray(this.yValueDurationConversation);
        this.logger.log('[ANALYTICS - DURATACONV] MS', this.msToTime(higherCount))
        this.logger.log('[ANALYTICS - DURATACONV] STEPSIZE', this.stepSize(higherCount))

        this.barChart = new Chart('durationConversationTimeResponse', {
          type: 'bar',
          data: {
            labels: this.xValueDurationConversation,
            datasets: [{
              label: 'Average duration conversation lenght response in last N days ',
              data: this.yValueDurationConversation,
              fill: false, // riempie zona sottostante dati
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
            maintainAspectRatio: false,
            title: {
              text: 'DURATION CONVERSATION LENGHT RESPONSE',
              display: false
            },
            legend: {
              display: false // do not show label title
            },
            scales: {
              xAxes: [{
                ticks: {
                  beginAtZero: true,
                  maxTicksLimit: stepsize,
                  display: true,
                  minRotation: 0,
                  fontColor: 'black'
                },
                gridLines: {
                  display: false,
                  borderDash: [8, 4],
                  // color:'rgba(255, 255, 255, 0.5)',
                }
              }],
              yAxes: [{
                gridLines: {
                  display: true,
                  borderDash: [8, 4],
                  // color:'rgba(255, 255, 255, 0.5)',
                },
                ticks: {
                  beginAtZero: true,
                  display: true,
                  // max: this.msToTime(higherCount),
                  // stepsize is calculate: transform higherCount/4 (4 because decide to divide yAxis i 4 region) in
                  // hour with Math.floor( num/1000*60*60) that return an hour. then convert hour returned in
                  // milliconds again multipling Math.floor()*1000*60*60
                  // stepSize:(Math.floor((higherCount/4) / (1000*60*60)))*1000*60*60,
                  stepSize: this.stepSize(higherCount),
                  callback: function (value, index, values) {
                    const hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                    const minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                    const seconds = Math.round(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

                    // add 0 before unit if needed to display 2-digit format hh:mm:ss
                    const hours_final = (hours < 10) ? '0' + hours : hours;
                    const minutes_final = (minutes < 10) ? '0' + minutes : minutes;
                    const seconds_final = (seconds < 10) ? '0' + seconds : seconds;

                    return hours_final + 'h:' + minutes_final + 'm:' + seconds_final + 's'
                  }

                },

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
                  // this.logger.log("data",data)
                  const currentItemValue = tooltipItem.yLabel
                  const langService = new HumanizeDurationLanguage();
                  const humanizer = new HumanizeDuration(langService);
                  // humanizer.setOptions({ round: true })
                  // //this.logger.log("humanize", humanizer.humanize(currentItemValue))
                  // return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)

                  const browserLang = this.translate.getBrowserLang();
                  let stored_preferred_lang = undefined
                  if (this.auth.user_bs && this.auth.user_bs.value) {
                    stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
                  }


                  let dshbrd_lang = ''
                  if (browserLang && !stored_preferred_lang) {
                    dshbrd_lang = browserLang
                  } else if (browserLang && stored_preferred_lang) {
                    dshbrd_lang = stored_preferred_lang
                  }
                  return this.translate.instant('AverageLengthOfConversation') + ": " + humanizer.humanize(currentItemValue, { round: true, language: dshbrd_lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] });

                  // if (lang === 'it') {
                  //   return 'Lunghezza conversazione media: ' + humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] });
                  // } else {
                  //   return 'Median Conversation Lenght: ' + humanizer.humanize(currentItemValue, { round: true, language: lang, units: ['y', 'mo', 'w', 'd', 'h', 'm', 's'] });
                  // }
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
        if (this.lang === 'en') {
          if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {// year
            result = result === 1 ? result + ' Year' : result + ' Years';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {// months
            result = result === 1 ? result + ' Month' : result + ' Months';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {// days
            result = result === 1 ? result + ' Day' : result + ' Days';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {// Hours
            result = result === 1 ? result + ' Hours' : result + ' Hours';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {// minute
            result = result === 1 ? result + ' Minute' : result + ' Minutes';
          } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {// second
            result = result === 1 ? result + ' Second' : result + ' Seconds';
          } else {
            result = timeInMillisecond + ' Millisec';
          }
        } else {
          if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {// year
            result = result === 1 ? result + ' Anno' : result + ' Anni';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {// months
            result = result === 1 ? result + ' Mese' : result + ' Mesi';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {// days
            result = result === 1 ? result + ' Giorno' : result + ' Giorni';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {// Hours
            result = result === 1 ? result + ' Ora' : result + ' Ore';
          } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {// minute
            result = result === 1 ? result + ' Minuto' : result + ' Minuti';
          } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {// second
            result = result === 1 ? result + ' Secondo' : result + ' Secondi';
          } else {
            result = timeInMillisecond + ' Millisecondi';
          }
        }
        return result;

      }
    }

    getMaxOfArray(array) {
      return Math.max.apply(null, array);
    }



  }
