import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'app/analytics/analytics-service/analytics.service';
// import { ApexOptions } from 'ng-apexcharts';
import { Chart } from 'chart.js';
import moment from "moment";
import { Subject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-home-report',
  templateUrl: './home-report.component.html',
  styleUrls: ['./home-report.component.scss']
})
export class HomeReportComponent implements OnInit {
  private unsubscribe$: Subject<any> = new Subject<any>();
  monthNames: any;
  numOfDays: number = 7;
  browserLang: string;
 
  countOfLastSevenDaysRequests: number;
  countOfLastSevenDaysRequestsHandledByBot: number;
  percentageOfSevenDaysRequestsHandledByBots: any;
  
  countOfLastMonthRequests: number; // USED FOR COUNT OF LAST 30 DAYS
  countOfLastMonthRequestsHandledByBots: number;
  percentageOfLastMonthRequestsHandledByBots: any;
  lineChart: any;


  /**
     * Constructor
     */
  constructor(
    private analyticsService: AnalyticsService,
    public translate: TranslateService,
  ) { }


  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    this.getRequestsHandleByHumanByDayRange(this.numOfDays);
    this.getRequestsHandleByBotByDayRange(this.numOfDays);
    this.getLastMounthRequestsCount();
    this.getCountAndPercentageOfRequestsHandledByBotsLastMonth();
    // this.getBrowserLanguage()
    this.getMonthsName()
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }



  // getBrowserLanguage() {
  //   this.browserLang = this.translate.getBrowserLang();
  //   console.log('[HOME-ANALITICS] BRS-LANG (USED FOR SWITCH MONTH NAME)', this.browserLang)


  //   this.switchMonthName(); /// VISITOR GRAPH FOR THE NEW NOME
  // }
  // switchMonthName() {
  //   if (this.browserLang) {
  //     if (this.browserLang === 'it') {
  //       this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
  //     } else {
  //       this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
  //     }
  //   }
  // }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  getMonthsName() {
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

  getLastMounthRequestsCount() {
    this.analyticsService.getLastMountConversationsCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((convcount: any) => {
        console.log('[HOME-ANALITICS] - GET LAST 30 DAYS CONVERSATION COUNT RES', convcount);

        if (convcount && convcount.length > 0) {
          this.countOfLastMonthRequests = convcount[0]['totalCount'];
          console.log('[HOME-ANALITICS] - GET LAST 30 DAYS CONVERSATION COUNT ', this.countOfLastMonthRequests);
        } else {
          this.countOfLastMonthRequests = 0;
        }
      }, (error) => {
        console.error('[HOME-ANALITICS] - GET LAST 30 DAYS CONVERSATION COUNT - ERROR ', error);

      }, () => {
        console.log('[HOME-ANALITICS] - GET LAST 30 DAYS CONVERSATION COUNT * COMPLETE *');
      });
  }

  getCountAndPercentageOfRequestsHandledByBotsLastMonth() {
    this.analyticsService.getRequestsHasBotCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
        console.log("[HOME-ANALITICS] - getRequestsHasBotCount GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS RES : ", res)

        if (res && res.length > 0) {
          this.countOfLastMonthRequestsHandledByBots = res[0]['totalCount']

        } else {
          this.countOfLastMonthRequestsHandledByBots = 0
        }

        console.log("[HOME-ANALITICS] - getRequestsHasBotCount REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS: ", this.countOfLastMonthRequestsHandledByBots)
        console.log("[HOME-ANALITICS] - getRequestsHasBotCount REQUESTS COUNT LAST 30 DAYS: ", this.countOfLastMonthRequests);
        // numero di conversazioni gestite da bot / numero di conversazioni totali (già calcolata) * 100

        if (this.countOfLastMonthRequestsHandledByBots > 0 && this.countOfLastMonthRequests) {
          const _percentageOfLastMonthRequestsHandledByBots = (this.countOfLastMonthRequestsHandledByBots / this.countOfLastMonthRequests) * 100
          console.log("[HOME-ANALITICS] - getRequestsHasBotCount % COUNT OF LAST MONTH REQUESTS: ", this.countOfLastMonthRequests);
          console.log("[HOME-ANALITICS] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS: ", _percentageOfLastMonthRequestsHandledByBots);
          console.log("[HOME-ANALITICS] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS typeof: ", typeof _percentageOfLastMonthRequestsHandledByBots);
          this.percentageOfLastMonthRequestsHandledByBots = _percentageOfLastMonthRequestsHandledByBots.toFixed(1);
        } else {
          this.percentageOfLastMonthRequestsHandledByBots = 0
        }
      }, (error) => {
        console.error('[HOME-ANALITICS] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS - ERROR ', error);

      }, () => {
        console.log('[HOME-ANALITICS] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS * COMPLETE *');
      });
  }

  selectConversationsRange(rangeDays) {
    console.log('[HOME-ANALITICS] - SELECT CONVERSATION RANGE rangeDays', rangeDays);
    this.numOfDays = rangeDays;
    this.lineChart.destroy();
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
    this.getRequestsHandleByHumanByDayRange(rangeDays)
    this.getRequestsHandleByBotByDayRange(rangeDays)
  }


  getRequestsHandleByBotByDayRange(numOfDays) {
    this.analyticsService.requestsByDayBotServed(numOfDays)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requestsByDayBotServed: any) => {
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY BOT ', requestsByDayBotServed);
        const last7days_initarray = []
        for (let i = 0; i < numOfDays -1; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
        }

        last7days_initarray.reverse()


        const requestByDayBotServed_array = [];
        for (let j = 0; j < requestsByDayBotServed.length; j++) {

          if (requestsByDayBotServed[j] && (requestsByDayBotServed[j]['_id']['hasBot'] == true)) {
            requestByDayBotServed_array.push({ 'count': requestsByDayBotServed[j]['count'], day: requestsByDayBotServed[j]['_id']['day'] + '/' + requestsByDayBotServed[j]['_id']['month'] + '/' + requestsByDayBotServed[j]['_id']['year'] })
          }
        }

        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY BOT ARRAY ', requestByDayBotServed_array);
        const requestByDaysBotServed_final_array = last7days_initarray.map(obj => requestByDayBotServed_array.find(o => o.day === obj.day) || obj);
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY BOT ARRAY - FINAL ARRAY ', requestByDaysBotServed_final_array);

        const _requestsByDayBotServed_series_array = [];

        requestByDaysBotServed_final_array.forEach(requestByDayBotServed => {
          _requestsByDayBotServed_series_array.push(requestByDayBotServed.count);
        })
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY BOT ARRAY - SERIES ', _requestsByDayBotServed_series_array);

        this.countOfLastSevenDaysRequestsHandledByBot = _requestsByDayBotServed_series_array.reduce((partialSum, a) => partialSum + a, 0);
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY BOT - LAST SEVEN DAYS COUNT ', this.countOfLastSevenDaysRequestsHandledByBot);

     

        if (this.countOfLastSevenDaysRequestsHandledByBot > 0 && this.countOfLastSevenDaysRequests) {
          const _percentageOfLastSevenDaysRequestsHandledByBots = (this.countOfLastSevenDaysRequestsHandledByBot / this.countOfLastSevenDaysRequests) * 100
         
          console.log("[HOME-ANALITICS] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS: ", _percentageOfLastSevenDaysRequestsHandledByBots);
          console.log("[HOME-ANALITICS] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS typeof: ", typeof _percentageOfLastSevenDaysRequestsHandledByBots);
          this.percentageOfSevenDaysRequestsHandledByBots = _percentageOfLastSevenDaysRequestsHandledByBots.toFixed(1);
        } else {
          this.percentageOfSevenDaysRequestsHandledByBots = 0
        }
      })
  }

  getRequestsHandleByHumanByDayRange(numOfDays) {
    this.analyticsService.requestsByDay(numOfDays)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requestsByDay: any) => {
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY HUMAN > numOfDays', numOfDays);
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY HANDLED BY HUMAN > requestsByDay', requestsByDay);

        // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
        const last7days_initarray = []
        for (let i = 0; i <= this.numOfDays - 1; i++) {
          // console.log('[HOME-ANALITICS] - LOOP INDEX', i);
          last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
        }

        last7days_initarray.reverse()

        // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
        const requestsByDay_array = []
        for (let j = 0; j < requestsByDay.length; j++) {
          if (requestsByDay[j]) {
            requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '-' + requestsByDay[j]['_id']['month'] + '-' + requestsByDay[j]['_id']['year'] })
          }
        }
        // console.log('[HOME-ANALITICS] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);

        /**
         * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
        // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
        // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
        // If not, then the same element in last7days i.e. obj is returned.
        const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
        // console.log('[HOME-ANALITICS] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];

        requestByDays_final_array.forEach(requestByDay => {
          // console.log('[HOME-ANALITICS] - REQUESTS BY DAY - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.count)

          const splitted_date = requestByDay.day.split('-');
          // console.log('[HOME-ANALITICS] - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });


        // console.log('[HOME-ANALITICS] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY  HANDLED BY HUMAN - SERIES (+ SERIES + ARRAY OF COUNT)', _requestsByDay_series_array);

        this.countOfLastSevenDaysRequests = _requestsByDay_series_array.reduce((partialSum, a) => partialSum + a, 0);
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY - countOfLastSevenDaysRequests', this.countOfLastSevenDaysRequests);
        // console.log('[HOME-ANALITICS] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY  HANDLED BY HUMAN - LABELS (+ LABELS + ARRAY OF DAY)', _requestsByDay_labels_array);

        const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
        // console.log('[HOME-ANALITICS] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

        let lang = this.browserLang;
        const canvas = <HTMLCanvasElement>document.getElementById('last7dayChart'); // nk added to resolve Failed to create chart: can't acquire context from the given item
        const ctx = canvas.getContext('2d'); // nk added to resolve Failed to create chart: can't acquire context from the given item
        // var lineChart = new Chart('last7dayChart', {
        this.lineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: _requestsByDay_labels_array,
            datasets: [{
              label: 'Number of conversations in last 7 days ',//active label setting to true the legend value
              data: _requestsByDay_series_array,
              fill: true, //riempie zona sottostante dati
              lineTension: 0.4,
              backgroundColor: 'rgba(129,140,248, 0.6)', // 'rgba(30, 136, 229, 0.6)',
              borderColor: 'rgba(129,140,248, 1)',
              borderWidth: 3,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: 'rgba(129,140,248, 1)',
              pointBorderColor: 'rgba(129,140,248, 1)'

            }]
          },
          options: {
            maintainAspectRatio: false, //allow to resize chart
            title: {
              text: 'Last 7 days converdations',
              display: false
            },
            legend: {
              display: false //do not show label title
            },
            scales: {
              xAxes: [{

                ticks: {
                  beginAtZero: true,
                  display: true,
                  //minRotation: 30,
                  fontColor: 'white',

                },
                gridLines: {
                  borderDash: [8, 4],
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineWidth: 0.5
                }

              }],
              yAxes: [{
                gridLines: {
                  borderDash: [8, 4],
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineWidth: 0.5
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
                  fontColor: 'white',
                  suggestedMax: higherCount + 2,

                }
              }]
            },
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => {

                  const currentItemValue = tooltipItem.yLabel
                  return this.translate.instant('Requests') + ':' + currentItemValue;
                  // if (lang === 'it') {
                  //   return 'Conversazioni: ' + currentItemValue;
                  // } else {
                  //   return 'Conversations:' + currentItemValue;
                  // }

                }
              }
            }
          },
          plugins: [{
            beforeDraw: function (chartInstance, easing) {
              var ctx = chartInstance.chart.ctx;
              //this.logger.log("chartistance",chartInstance)
              // ctx.fillStyle = 'red'; // your color here
              ctx.height = 128
              //chartInstance.chart.canvas.parentNode.style.height = '128px';
              ctx.font = 'Roboto'
              var chartArea = chartInstance.chartArea;
              //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            }
          }]
        });

      }, (error) => {
        console.error('[HOME-ANALITICS] - REQUESTS BY DAY  HANDLED BY HUMAN - ERROR ', error);

      }, () => {
        console.log('[HOME-ANALITICS] - REQUESTS BY DAY  HANDLED BY HUMAN * COMPLETE *');

      });
  }

  // plugins: {
  //   customCanvasBackgroundColor: {
  //     color: 'lightGreen',
  //   }
  // },

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }



}
