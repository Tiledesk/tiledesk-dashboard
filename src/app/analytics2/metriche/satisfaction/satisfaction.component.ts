import { FaqKbService } from './../../../services/faq-kb.service';
import { UsersService } from './../../../services/users.service';
import { DepartmentService } from './../../../services/department.service';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from './../../../services/analytics.service';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import * as moment from 'moment';

@Component({
  selector: 'appdashboard-satisfaction',
  templateUrl: './satisfaction.component.html',
  styleUrls: ['./satisfaction.component.scss']
})
export class SatisfactionComponent implements OnInit {

  lang: string;

  selectedDaysId: number;   // lastdays filter
  selectedDeptId: string;   // department filter
  selectedAgentId: string;  // agent filter 
  
  avgSatisfaction: any;
  selected: string;
  departments: any;
  initDay: string;
  endDay: string;
  lastdays = 7;
  monthNames: any;
  barChart: any;
  subscription: Subscription;

  xValueSatisfaction: any;
  yValueSatisfaction: any;

  projectUserAndBotsArray = []
  projectUsersList: any;
  projectBotsList: any;
  bots: any;

  constructor(private translate: TranslateService,
    private analyticsService: AnalyticsService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private faqKbService: FaqKbService) {

    this.lang = this.translate.getBrowserLang();
    console.log('LANGUAGE ', this.lang);
    this.switchMonthName();

  }

  ngOnInit() {
    this.selectedDaysId = 7;
    this.selectedDeptId = '';
    this.selected = 'day';
    this.selectedAgentId = '';

    this.initDay = moment().subtract(6, 'd').format('D/M/YYYY');
    this.endDay = moment().subtract(0, 'd').format('D/M/YYYY');
    console.log("INIT", this.initDay, "END", this.endDay);

    this.getDepartments();
    this.getProjectUsersAndBots();
    this.getAvgSatisfaction();
    this.getSatisfactionByLastNDays(this.selectedDaysId, this.selectedDeptId, this.selectedAgentId);
  }

  switchMonthName() {
    if (this.lang) {
      if (this.lang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }

  daysSelect(value, event) {
    console.log("EVENT: ", event)
    this.selectedDaysId = value;

    if (value <= 30) {
      this.lastdays = value;
    } else if ((value == 90) || (value == 180)) {
      this.lastdays = value / 30;
    } else if (value == 360) {
      this.lastdays = 1;
    }
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(value, this.selectedDeptId, this.selectedAgentId);
  }

  depSelected(selectedDeptId: string) {
    console.log('Department selected: ', selectedDeptId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(this.selectedDaysId, selectedDeptId, this.selectedAgentId);
  }

  agentSelected(selectedAgentId) {
    console.log("Selected agent: ", selectedAgentId);
    this.barChart.destroy();
    this.subscription.unsubscribe();
    this.getSatisfactionByLastNDays(this.selectedDaysId, this.selectedDeptId, selectedAgentId)
    console.log('REQUEST:', this.selectedDaysId, this.selectedDeptId, selectedAgentId)
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

  getProjectUsersAndBots() {
    // https://stackoverflow.com/questions/44004144/how-to-wait-for-two-observables-in-rxjs

    const projectUsers = this.usersService.getProjectUsersByProjectId();
    const bots = this.faqKbService.getAllBotByProjectId();

    Observable
      .zip(projectUsers, bots, (_projectUsers: any, _bots: any) => ({ _projectUsers, _bots }))
      .subscribe(pair => {
        console.log('BASE-TRIGGER - GET P-USERS-&-BOTS - PROJECT USERS : ', pair._projectUsers);
        console.log('BASE-TRIGGER - GET P-USERS-&-BOTS - BOTS: ', pair._bots);

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

        console.log('BASE-TRIGGER - GET P-USERS-&-BOTS - PROJECT-USER & BOTS ARRAY : ', this.projectUserAndBotsArray);

      }, error => {
        console.log('BASE-TRIGGER - GET P-USERS-&-BOTS - ERROR: ', error);
      }, () => {
        console.log('BASE-TRIGGER - GET P-USERS-&-BOTS - COMPLETE');
      });
  }

  getAvgSatisfaction() {
    this.analyticsService.getAvgSatisfaction().then((res) => {
      console.log("!!! ANALYTICS STISFACTION !!! AVG Satisfaction: ", res);
      this.avgSatisfaction = res[0].satisfaction_avg;
    }).catch((err) => {
      console.error("Error during getAvgSatisfaction: ", err);
      this.avgSatisfaction = 0;
    })
  }

  getSatisfactionByLastNDays(lastdays, depId, participantId) {
    this.subscription = this.analyticsService.getSatisfactionByDay(lastdays, depId, participantId).subscribe((satisfactionByDay: any) => {
      console.log("»» SATISFACTION BY DAY RESULT: ", satisfactionByDay);

      const requestSatisfactionByDays_series_array = [];
      const requestSatisfactionByDays_labels_array = [];

      if (satisfactionByDay) {
        const lastNdays_initarraySatisfaction = [];
        for (let i = 0; i < lastdays; i++) {
          lastNdays_initarraySatisfaction.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 });
        }
        lastNdays_initarraySatisfaction.reverse();
        console.log('»» !!! ANALYTICS - REQUESTS SATISFACTION BY DAY - (init array)', lastNdays_initarraySatisfaction);

        const customSatisfactionChart = [];

        for (let j in satisfactionByDay) {
          console.log("****** satisfaction: ", satisfactionByDay[j]);
          if (satisfactionByDay[j].satisfaction_avg == null) {
            satisfactionByDay[j].satisfaction_avg = 0;
          }
          customSatisfactionChart.push({ date: new Date(satisfactionByDay[j]._id.year, satisfactionByDay[j]._id.month - 1, satisfactionByDay[j]._id.day).toLocaleDateString(), value: satisfactionByDay[j].satisfaction_avg });
        }

        console.log('Satisfaction data:', customSatisfactionChart);

        // build a final array that compars value between the two arrray before builded with respect to date key value
        const satisfactionByDays_final_array = lastNdays_initarraySatisfaction.map(obj => customSatisfactionChart.find(o => o.date === obj.date) || obj);
        console.log('»» !!! ANALYTICS - REQUESTS SATISFACTION BY DAY - FINAL ARRAY ', satisfactionByDays_final_array);

        // const requestSatisfactionByDays_series_array = [];
        // const requestSatisfactionByDays_labels_array = [];

        // select init and end day to show on div
        this.initDay = satisfactionByDays_final_array[0].date;
        this.endDay = satisfactionByDays_final_array[lastdays - 1].date;
        console.log('INIT', this.initDay, 'END', this.endDay);

        satisfactionByDays_final_array.forEach(requestByDay => {
          //console.log('»» !!! ANALYTICS - REQUESTS SATISFACTION BY DAY - requestByDay', requestByDay);
          requestSatisfactionByDays_series_array.push(requestByDay.value);

          const splitted_date = requestByDay.date.split('/');
          //console.log('»» !!! ANALYTICS - REQUESTS SATISFACTION BY DAY - SPLITTED DATE', splitted_date);
          requestSatisfactionByDays_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        })

        this.xValueSatisfaction = requestSatisfactionByDays_labels_array;
        this.yValueSatisfaction = requestSatisfactionByDays_series_array;

        console.log('Xlabel-Satisfaction', this.xValueSatisfaction);
        console.log('Ylabel-Satisfaction', this.yValueSatisfaction);

      } else {
        console.log('!!!ERROR!!! while get data from resouces for requests satisfaction graph');
      }

      // set the stepsize
      let stepsize: number;
      if (this.selectedDaysId > 60) {
        stepsize = 10;
      } else {
        stepsize = this.selectedDaysId
      }
      const lang = this.lang;
      const higherCount = this.getMaxOfArray(requestSatisfactionByDays_series_array);

      this.barChart = new Chart('satisfactionRating', {
        type: 'bar',
        data: {
          labels: requestSatisfactionByDays_labels_array,
          datasets: [{
            label: 'Daily satisfaction: ',
            data: requestSatisfactionByDays_series_array,
            fill: false, // riempie zona sottostante dati
            lineTension: 0.0,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
          }]
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
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: 5,
                stepSize: 1
              },

            }]
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                const currentItemValue = tooltipItem.yLabel;
                
                if(lang == 'it') {
                  return 'Media giornaliera: ' + currentItemValue;
                } else {
                  return 'Daily average: ' + currentItemValue;
                }
              }
            }
          }
        }
      });

    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

  ngOnDestroy() {
    console.log('!!! ANALYTICS.RICHIESTE - !!!!! UN - SUBSCRIPTION TO REQUESTS');
    this.subscription.unsubscribe();
  }

  // TO CHECK !!!!!!!!
  stepSize(milliseconds) {
    const hours = Math.floor(milliseconds / 3600000) // 1 Hour = 36000 Milliseconds
    const minutes = Math.floor((milliseconds % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
    const seconds = Math.round(((milliseconds % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds

    if (hours !== 0) {
      return (Math.floor((milliseconds / 4) / (1000 * 60 * 60))) * 1000 * 60 * 60
    } else {
      return (Math.floor((milliseconds / 4) / (1000 * 60))) * 1000 * 60
    }

  }

}
