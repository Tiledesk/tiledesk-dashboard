import { FaqKbService } from '../../../services/faq-kb.service';
import { DepartmentService } from '../../../services/department.service';
import { Component, OnInit } from '@angular/core';
// import * as moment from 'moment'
import moment from "moment"
import { Chart } from 'chart.js';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, zip } from 'rxjs';
import { UsersService } from 'app/services/users.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { CHANNELS } from 'app/utils/util';

@Component({
  selector: 'appdashboard-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

  lineChart: any;
  lang: String;

  monthNames: any;
  lastdays = 7;

  initDay: string;
  endDay: string;

  selectedDaysId: number;   // lastdays filter
  selectedDeptId: string;   // department filter
  selectedAgentId: string;  // agent filter 
  selectedChannelId: string;  // channel filter 

  selected: string;
  departments: any;
  user_and_bot_array = [];

  subscription: Subscription;

  projectUserAndBotsArray = []
  projectUsersList: any;
  projectBotsList: any;
  bots: any;
  conversationsCountLastMonth: any;
  conversationType = [
    { id: '', name: 'All' },
    ... CHANNELS
  ];

  constructor(
    private analyticsService: AnalyticsService,
    private translate: TranslateService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    public faqKbService: FaqKbService,
    private logger: LoggerService
  ) {

    this.lang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS - CONVS] LANGUAGE ', this.lang);
    this.getBrowserLangAndSwitchMonthName();

  }

  ngOnInit() {
    this.selected = 'day'
    this.selectedDeptId = '';
    this.selectedDaysId = 7;
    this.selectedAgentId = '';
    this.selectedChannelId = '';

    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY')
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY')
    this.logger.log("[ANALYTICS - CONVS] INIT", this.initDay, "END", this.endDay);

    this.getAggregateValue();
    this.getRequestByLastNDayMerge(this.selectedDaysId, this.selectedDeptId, this.selectedChannelId);
    this.getDepartments();
    this.getProjectUsersAndBots();

  }

  ngOnDestroy() {
    this.logger.log('[ANALYTICS - CONVS] - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {
    const elemInputOfNgSelectDays = <HTMLElement>document.querySelector('.ng-select-days > .ng-select-container > .ng-value-container > .ng-input > input');
    this.logger.log('[ANALYTICS - CONVS] EL-INPUT Of NgSelectDays ', elemInputOfNgSelectDays);
    if (elemInputOfNgSelectDays) {
      elemInputOfNgSelectDays.setAttribute("id", "select-days");
    }

    const elemInputOfNgSelectDept = <HTMLElement>document.querySelector('.ng-select-dept > .ng-select-container > .ng-value-container > .ng-input > input');
    this.logger.log('[ANALYTICS - CONVS] EL-INPUT Of NgSelectDept ', elemInputOfNgSelectDept);
    if (elemInputOfNgSelectDept) {
      elemInputOfNgSelectDept.setAttribute("id", "select-dept");
    }

    const elemInputOfNgSelectAgent = <HTMLElement>document.querySelector('.ng-select-agent > .ng-select-container > .ng-value-container > .ng-input > input');
    this.logger.log('[ANALYTICS - CONVS] EL-INPUT Of NgSelectAgent ', elemInputOfNgSelectAgent);
    if (elemInputOfNgSelectAgent) {
      elemInputOfNgSelectAgent.setAttribute("id", "select-agent");
    }

    const elemInputOfNgSelectConversation = <HTMLElement>document.querySelector('.ng-select-ng-select-conversation-type > .ng-select-container > .ng-value-container > .ng-input > input');
    this.logger.log('[ANALYTICS - CONVS] EL-INPUT Of NgSelectConversation ', elemInputOfNgSelectConversation);
    if (elemInputOfNgSelectConversation) {
      elemInputOfNgSelectConversation.setAttribute("id", "select-conversation");
    }
  }

  daysSelect(value, event) {
    this.logger.log("[ANALYTICS - CONVS] daysSelect EVENT", event)
    this.selectedDaysId = value;//--> value to pass throw for graph method
    //check value for label in htlm
    if (value <= 30) {
      this.lastdays = value;
    } else if ((value === 90) || (value === 180)) {
      this.lastdays = value / 30;
    } else if (value === 360) {
      this.lastdays = 1;
    }
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    this.logger.log("[ANALYTICS - CONVS] ++++++++++ SELECTED AGENT: ", this.selectedAgentId);
    if (!this.selectedAgentId) {
      this.getRequestByLastNDayMerge(this.selectedDaysId, this.selectedDeptId, this.selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] getRequestByLastNDayMerge REQUEST:', this.selectedDaysId, this.selectedDeptId)
    } else {
      this.getRequestByLastNDay(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] getRequestByLastNDay REQUEST:', value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId)
    }
  }

  depSelected(selectedDeptId) {
    this.logger.log('[ANALYTICS - CONVS] depSelected', selectedDeptId);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    if (!this.selectedAgentId) {
      this.getRequestByLastNDayMerge(this.selectedDaysId, this.selectedDeptId, this.selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] getRequestByLastNDayMerge REQUEST:', this.selectedDaysId, this.selectedDeptId)
    } else {
      this.getRequestByLastNDay(this.selectedDaysId, selectedDeptId, this.selectedAgentId, this.selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] getRequestByLastNDay:', this.selectedDaysId, selectedDeptId, this.selectedAgentId, this.selectedChannelId)
    }

  }

  agentSelected(selectedAgentId) {
    this.logger.log("[ANALYTICS - CONVS]  Selected agent: ", selectedAgentId);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    if (!this.selectedAgentId) {
      this.getRequestByLastNDayMerge(this.selectedDaysId, this.selectedDeptId, this.selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] agentSelected getRequestByLastNDayMerge REQUEST:', this.selectedDaysId, this.selectedDeptId)
    } else {
      this.getRequestByLastNDay(this.selectedDaysId, this.selectedDeptId, selectedAgentId, this.selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] agentSelected getRequestByLastNDay REQUEST:', this.selectedDaysId, this.selectedDeptId, selectedAgentId, this.selectedChannelId)
    }
  }

  conversationTypeSelected(selectedChannelId){
    this.logger.log("[ANALYTICS - CONVS]  Selected channel: ", selectedChannelId);
    this.lineChart.destroy();
    this.subscription.unsubscribe();
    if (!this.selectedAgentId) {
      this.getRequestByLastNDayMerge(this.selectedDaysId, this.selectedDeptId, selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] agentSelected getRequestByLastNDayMerge REQUEST:', this.selectedDaysId, this.selectedDeptId)
    } else {
      this.getRequestByLastNDay(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, selectedChannelId)
      this.logger.log('[ANALYTICS - CONVS] agentSelected getRequestByLastNDay REQUEST:', this.selectedDaysId, this.selectedDeptId, this.selectedAgentId, selectedChannelId)
    }
  }


  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[ANALYTICS - CONVS] - GET DEPTS RES ', _departments);
      this.departments = _departments

    }, error => {
      this.logger.error('[ANALYTICS - CONVS]- GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[ANALYTICS - CONVS] - GET DEPTS * COMPLETE *')
    });
  }

  // getProjectUsersAndBots() {
  //   const projectUsersSubscription = this.usersService.getProjectUsersByProjectId().subscribe((res) => {
  //     this.projectUsersList = res;
  //     this.logger.log('!!! ANALYTICS.RICHIESTE - !!!  PROJECT USERS : ', this.projectUsersList);
  //   })

  //   const projectBotsSubscription = this.faqKbService.getAllBotByProjectId().subscribe((res) => {
  //     this.projectBotsList = res;
  //     this.logger.log('!!! ANALYTICS.RICHIESTE - !!!  PROJECT BOTS : ', res);
  //   })
  // }

  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs
    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();

  
      zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        this.logger.log('[ANALYTICS - CONVS] - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        this.logger.log('[ANALYTICS - CONVS] - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

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

        this.logger.log('[ANALYTICS - CONVS] - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

      }, error => {
        this.logger.error('[ANALYTICS - CONVS] - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        this.logger.log('[ANALYTICS - CONVS] - GET P-USERS-&-BOTS - COMPLETE');
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

  getMinOfArray(request) {
    return Math.min.apply(null, request);
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

  getAggregateValue() {
    this.analyticsService.getLastMountConversationsCount().subscribe((res: any) => {
      this.logger.log("[ANALYTICS - CONVS] LAST MONTH CONVERSATIONS COUNT: ", res);
      if (res && res[0]) {
        this.conversationsCountLastMonth = res[0].totalCount;
        this.logger.log("[ANALYTICS - CONVS] Conversations Count: ", this.conversationsCountLastMonth);
      } else {
        this.logger.log("[ANALYTICS - CONVS] Conversations Count - THERE ARE NOT CONVS IN THE LAST MONTH");
        this.conversationsCountLastMonth = 0;
      }
    }, (error) => {
      this.logger.error("[ANALYTICS - CONVS] Impossible to retrieve monthly count", error)
      this.conversationsCountLastMonth = 0;
    })
  }

  getRequestByLastNDay(lastdays, depID, participantID, channelID) {

    if (participantID.includes("bot")) {
      this.logger.log("[ANALYTICS - CONVS] Selected Agent is a BOT");
      // try to change chart's colors
    }
    this.logger.log("[ANALYTICS - CONVS] GET REQUEST TYPE: For Agent/Bot")
    this.subscription = this.analyticsService.requestsByDay(lastdays, depID, participantID, channelID).subscribe((requestsByDay: any) => {
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY  N-DAY ', requestsByDay);

      const last7days_initarray = []
      for (let i = 0; i < lastdays; i++) {
        // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      last7days_initarray.reverse()
      this.logger.log('[ANALYTICS - CONVS]- REQUESTS BY lastDAY - MOMENT LAST N DATE (init array)', last7days_initarray);

      const requestsByDay_series_array = [];
      const requestsByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const requestsByDay_array = [];

      for (let j = 0; j < requestsByDay.length; j++) {
        if (requestsByDay[j]) {
          requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '/' + requestsByDay[j]['_id']['month'] + '/' + requestsByDay[j]['_id']['year'] })
        }
      }

      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);

      /**
        * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
      // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
      // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
      // If not, then the same element in last7days i.e. obj is returned.
      // human
      const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

      // human
      const _requestsByDay_series_array = [];
      const _requestsByDay_labels_array = [];

      //select init and end day to show on div
      this.initDay = requestByDays_final_array[0].day;
      this.endDay = requestByDays_final_array[lastdays - 1].day;
      this.logger.log("INIT", this.initDay, "END", this.endDay);

      // human
      requestByDays_final_array.forEach(requestByDay => {
        //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
        _requestsByDay_series_array.push(requestByDay.count)

        const splitted_date = requestByDay.day.split('/');
        //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
        _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      });


      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

      //get higher value of xvalue array 
      const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

      //set the stepsize 
      var stepsize;
      if (this.selectedDaysId > 60) {
        stepsize = 10;
      }
      else {
        stepsize = this.selectedDaysId
      }
      let lang = this.lang;

      this.lineChart = new Chart('lastNdayChart', {
        type: 'line',
        data: {
          labels: _requestsByDay_labels_array,
          datasets: [
            {
              label: this.translate.instant('ServedByHumans'), // 'Served by humans', // active labet setting to true the legend value
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
          maintainAspectRatio: false,
          title: {
            text: 'Number of Conversations',
            display: false
          },
          legend: {
            display: false,
            position: 'bottom',
            //align: "start",
            fullWidth: false,
            labels: {
              usePointStyle: true,
              padding: 10
            }
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
                //      this.logger.log("XXXX",tickValue);
                //      this.logger.log("III", index)
                //      this.logger.log("TTT", ticks)

                // }

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
                //color:'rgba(255, 255, 255, 0.5)',

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
                // console.log('xxxx ', this.translate.instant('Requests') + ':' + currentItemValue)
                return this.translate.instant('Requests') + ':' + currentItemValue;

                // if (lang === 'it') {
                //   return 'Richieste: ' + currentItemValue;
                // } else {
                //   return 'Requests: ' + currentItemValue;
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
            ctx.font = 'Roboto';

            var chartArea = chartInstance.chartArea;
            //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          }
        }]
      });



    }, (error) => {
      this.logger.error('[ANALYTICS - CONVS] - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY * COMPLETE *');
    })
  }


  //-----------LAST n DAYS GRAPH-----------------------
  getRequestByLastNDayMerge(lastdays, depID, channelID) {

    this.logger.log("[ANALYTICS - CONVS] GET REQUEST TYPE: Merged")
    this.subscription = this.analyticsService.requestsByDay(lastdays, depID, '', channelID).subscribe((requestsByDay: any) => {
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY  N-DAY ', requestsByDay);

      this.analyticsService.requestsByDayBotServed(lastdays, depID, '', channelID).subscribe((requestsByDayBotServed: any) => {
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY N-DAY BOT SERVED ', requestsByDayBotServed);

        // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
        const last7days_initarray = []
        for (let i = 0; i < lastdays; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
        }

        last7days_initarray.reverse()
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY lastDAY - MOMENT LAST N DATE (init array)', last7days_initarray);

        const requestsByDay_series_array = [];
        const requestsByDay_labels_array = [];

        // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
        const requestsByDay_array = [];
        const requestByDayBotServed_array = [];

        // human
        for (let j = 0; j < requestsByDay.length; j++) {
          if (requestsByDay[j]) {
            requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '/' + requestsByDay[j]['_id']['month'] + '/' + requestsByDay[j]['_id']['year'] })
          }
        }

        // bot
        for (let j = 0; j < requestsByDayBotServed.length; j++) {

          if (requestsByDayBotServed[j] && (requestsByDayBotServed[j]['_id']['hasBot'] == true)) {
            requestByDayBotServed_array.push({ 'count': requestsByDayBotServed[j]['count'], day: requestsByDayBotServed[j]['_id']['day'] + '/' + requestsByDayBotServed[j]['_id']['month'] + '/' + requestsByDayBotServed[j]['_id']['year'] })
          }
        }

        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY BOT SERVED FORMATTED ', requestByDayBotServed_array);

        /**
         * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
        // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
        // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
        // If not, then the same element in last7days i.e. obj is returned.
        // human
        const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);
        // bot
        const requestByDaysBotServed_final_array = last7days_initarray.map(obj => requestByDayBotServed_array.find(o => o.day === obj.day) || obj);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY BOT SERVED - FINAL ARRAY ', requestByDaysBotServed_final_array);

        // human
        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];
        // bot
        const _requestsByDayBotServed_series_array = [];

        //select init and end day to show on div
        this.initDay = requestByDays_final_array[0].day;
        this.endDay = requestByDays_final_array[lastdays - 1].day;
        this.logger.log("[ANALYTICS - CONVS] INIT", this.initDay, "END", this.endDay);

        // human
        requestByDays_final_array.forEach(requestByDay => {
          //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.count)

          const splitted_date = requestByDay.day.split('/');
          //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });

        // bot
        requestByDaysBotServed_final_array.forEach(requestByDayBotServed => {
          _requestsByDayBotServed_series_array.push(requestByDayBotServed.count);
        })


        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDayBotServed_series_array);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

        //get higher value of xvalue array 
        const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
        this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

        //set the stepsize 
        var stepsize;
        if (this.selectedDaysId > 60) {
          stepsize = 10;
        }
        else {
          stepsize = this.selectedDaysId
        }
        let lang = this.lang;

        this.lineChart = new Chart('lastNdayChart', {
          type: 'line',
          data: {
            labels: _requestsByDay_labels_array,
            datasets: [
              {
                label: this.translate.instant('ServedByBots'), // 'Served by bots', //active labet setting to true the legend value
                data: _requestsByDayBotServed_series_array,
                fill: true, //riempie zona sottostante dati
                lineTension: 0.0,
                backgroundColor: 'rgba(232, 32, 32, 0.6)',
                borderColor: 'rgba(189, 16, 16, 1)',
                borderWidth: 3,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
                pointBorderColor: '#b00e0e'
              },
              {
                label: this.translate.instant('ServedByHumans'), // 'Served by humans',//active labet setting to true the legend value
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
            maintainAspectRatio: false,
            title: {
              text: 'AVERAGE TIME RESPONSE',
              display: false
            },
            legend: {
              display: true,
              position: 'bottom',
              //align: "start",
              fullWidth: false,
              labels: {
                usePointStyle: true,
                padding: 10
              }
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
                  //      this.logger.log("XXXX",tickValue);
                  //      this.logger.log("III", index)
                  //      this.logger.log("TTT", ticks)

                  // }

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
                  //color:'rgba(255, 255, 255, 0.5)',

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

                  return this.translate.instant('Requests') + ':' + currentItemValue;
                  // if (lang === 'it') {
                  //   return 'Richieste: ' + currentItemValue;
                  // } else {
                  //   return 'Requests: ' + currentItemValue;
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
              ctx.font = 'Roboto';

              var chartArea = chartInstance.chartArea;
              //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            }
          }]
        });
      })

    }, (error) => {
      this.logger.error('[ANALYTICS - CONVS] - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY * COMPLETE *');
    });
  }



}