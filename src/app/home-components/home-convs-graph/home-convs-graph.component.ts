import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

// import { ApexOptions } from 'ng-apexcharts';
import { Chart } from 'chart.js';
import moment from "moment";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from 'app/services/users.service';
import { Router } from '@angular/router';
import { ContactsService } from 'app/services/contacts.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
import { AnalyticsService } from 'app/services/analytics.service';
import { forkJoin } from 'rxjs';
import { ProjectUser } from 'app/models/project-user';

@Component({
  selector: 'appdashboard-home-convs-graph',
  templateUrl: './home-convs-graph.component.html',
  styleUrls: ['./home-convs-graph.component.scss']
})

export class HomeConvsGraphComponent implements OnInit, OnChanges {
  @Output() trackUserAction = new EventEmitter();
  private unsubscribe$: Subject<any> = new Subject<any>();
  @Input() public projectId: string;
  @Input() public USER_ROLE: string;
  @Input() public displayAnalyticsConvsGraph: boolean;
  monthNames: any;
  numOfDays: number = 7;
  browserLang: string;

  countOfLastSevenDaysRequests: number = 0;
  countOfLastSevenDaysRequestsHandledByBot: number = 0;
  percentageOfSevenDaysRequestsHandledByBots: any;
 

  countOfLastMonthRequests: number; // USED FOR COUNT OF LAST 30 DAYS
  countOfLastMonthRequestsHandledByBots: number;
  percentageOfLastMonthRequestsHandledByBots: any;
  lineChart: any;
  servedByBots: string;
  servedByHumans: string;
  countOfActiveContacts: number;
  countOfVisitors: number;
  countOfLastMonthMsgs: number;
  public_Key: string;
  isVisibleANA: boolean;

  // For new method
  percentageOfRequestsHandledByBots: any;
  totalHuman: number;
  totalBot: number;
  higherCount: number;
  /**
   * Constructor
   */
  constructor(
    private analyticsService: AnalyticsService,
    public translate: TranslateService,
    private usersService: UsersService,
    private router: Router,
    private contactsService: ContactsService,
    private logger: LoggerService,
    public appConfigService: AppConfigService
  ) { }


  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.getMonthsName();
    this.getUserRole();
    this.translateString();
    this.inizializeHomeStatic();
    this.getOSCODE();
  }
  
 

  ngOnChanges(changes: SimpleChanges) {
    this.logger.log('[HOME-CONVS-GRAPH] ngOnChanges changes ', changes)
    this.logger.log('[HOME-CONVS-GRAPH] ngOnChanges changes projectId ', this.projectId)
    this.logger.log('[HOME-CONVS-GRAPH] ngOnChanges changes displayAnalyticsConvsGraph ', this.displayAnalyticsConvsGraph)
    

    if (changes.projectId &&  changes.projectId.firstChange === false) {
      this.logger.log('[HOME-CONVS-GRAPH] ngOnChanges changes changes.projectId.currentValue ', changes.projectId.currentValue)
      this.logger.log('[HOME-CONVS-GRAPH] ngOnChanges changes changes.projectId.previousValue ', changes.projectId.previousValue)
      if (changes.projectId.currentValue !== changes.projectId.previousValue) {
        this.logger.log('[HOME-CONVS-GRAPH] ngOnChanges changes HAS CHANGED PROJECT ')
        this.inizializeHomeStatic()
      }
    }
  }

  inizializeHomeStatic() {
    // this._getRequestByLastNDayMerge(this.numOfDays);
    this.getRequestByLastNDayMerge(this.numOfDays);
    // this.getLastMounthRequestsCount(); // Not used 
    // this.getActiveContactsCount();
    // this.getVisitorsCount();
    // this.getLastMounthMessagesCount();
   
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[HOME-ANALITICS] AppConfigService getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('[HOME-ANALITICS] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('[HOME-ANALITICS] public_Key key', key)
      
      if (key.includes("ANA")) {
        // this.logger.log('[HOME-ANALITICS] PUBLIC-KEY - key', key);
        let ana = key.split(":");
        // this.logger.log('[HOME-ANALITICS] PUBLIC-KEY - ana key&value', ana);

        if (ana[1] === "F") {
          this.isVisibleANA = false;
          // this.logger.log('[HOME-ANALITICS] PUBLIC-KEY - ana isVisible', this.isVisibleANA);
        } else {
          this.isVisibleANA = true;
          // this.logger.log('[HOME-ANALITICS] PUBLIC-KEY - ana isVisible', this.isVisibleANA);
        }
      }     
    });

    if (!this.public_Key.includes("ANA")) {
      // this.logger.log('[HOME-ANALITICS] PUBLIC-KEY - key.includes("V1L")', this.public_Key.includes("ANA"));
      this.isVisibleANA = false;
    }

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.unsubscribe$.next(null);
    this.unsubscribe$.complete();
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  translateString() {
    this.translate.get('ServedByBots')
      .subscribe((translation: any) => {
        this.servedByBots = translation;
      });

    this.translate.get('ServedByHumans')
      .subscribe((translation: any) => {
        this.servedByHumans = translation;
      });
  }

  // getActiveContactsCount() {
  //   this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
  //     this.logger.log('[HOME-CONVS-GRAPH] - GET ACTIVE LEADS RESPONSE ', activeleads)
  //     if (activeleads) {

  //       this.countOfActiveContacts = activeleads['count'];
  //       this.logger.log('[HOME-CONVS-GRAPH] - ACTIVE LEADS COUNT ', this.countOfActiveContacts)
  //     }
  //   }, (error) => {
  //     this.logger.error('[HOME-CONVS-GRAPH] - GET ACTIVE LEADS - ERROR ', error);

  //   }, () => {
  //     this.logger.log('[HOME-CONVS-GRAPH] - GET ACTIVE LEADS * COMPLETE *');
  //   });
  // }

 

  // getVisitorsCount() {
  //   this.analyticsService.getVisitors()
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((visitorcounts: any) => {
  //       this.logger.log("HOME - GET VISITORS COUNT RES: ", visitorcounts)

  //       if (visitorcounts && visitorcounts.length > 0) {
  //         this.countOfVisitors = visitorcounts[0]['totalCount']
  //         this.logger.log("HOME - GET VISITORS COUNT: ", this.countOfVisitors)
  //       } else {
  //         this.countOfVisitors = 0
  //       }
  //     }, (error) => {
  //       this.logger.error('[HOME-CONVS-GRAPH] - GET VISITORS COUNT - ERROR ', error);

  //     }, () => {
  //       this.logger.log('[HOME-CONVS-GRAPH] - GET VISITORS COUNT * COMPLETE *');
  //     });
  // }



 

  // getLastMounthMessagesCount() {
  //   this.analyticsService.getLastMountMessagesCount()
  //     .pipe(
  //       takeUntil(this.unsubscribe$)
  //     )
  //     .subscribe((msgscount: any) => {
  //      this.logger.log('[HOME-CONVS-GRAPH] - GET LAST 30 DAYS MESSAGE COUNT RES', msgscount);
  //       if (msgscount && msgscount.length > 0) {
  //         this.countOfLastMonthMsgs = msgscount[0]['totalCount']

  //         this.logger.log('[HOME-CONVS-GRAPH] - GET LAST 30 DAYS MESSAGE COUNT ', this.countOfLastMonthMsgs);
  //       } else {
  //         this.countOfLastMonthMsgs = 0;
  //       }
  //     }, (error) => {
  //       this.logger.error('[HOME-CONVS-GRAPH] - GET LAST 30 DAYS MESSAGE - ERROR ', error);

  //     }, () => {
  //       this.logger.log('[HOME-CONVS-GRAPH] - GET LAST 30 DAYS MESSAGE * COMPLETE *');
  //     });
  // }


 

  getUserRole() {
    this.usersService.projectUser_bs.pipe(takeUntil(this.unsubscribe$)).subscribe((projectUser: ProjectUser) => {
      if(projectUser){
        this.USER_ROLE = projectUser.role;
      }
    })
  }

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

  // !!! No more used
  getLastMounthRequestsCount() {
    this.analyticsService.getLastMountConversationsCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((convcount: any) => {
        this.logger.log('[HOME-CONVS-GRAPH] - >>> GET LAST 30 DAYS CONVERSATION COUNT RES', convcount);

        if (convcount && convcount.length > 0) {
          this.countOfLastMonthRequests = convcount[0]['totalCount'];
          this.logger.log('[HOME-CONVS-GRAPH] - >>> GET LAST 30 DAYS CONVERSATION COUNT ', this.countOfLastMonthRequests);
        } else {
          this.countOfLastMonthRequests = 0;
        }
      }, (error) => {
        this.logger.error('[HOME-CONVS-GRAPH] - GET LAST 30 DAYS CONVERSATION COUNT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CONVS-GRAPH] - GET LAST 30 DAYS CONVERSATION COUNT * COMPLETE *');
        this.getCountAndPercentageOfRequestsHandledByBotsLastMonth();
      });
  }

  getCountAndPercentageOfRequestsHandledByBotsLastMonth() {
    this.analyticsService.getRequestsHasBotCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
        this.logger.log("[HOME-CONVS-GRAPH] - getRequestsHasBotCount GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS RES : ", res)

        if (res && res.length > 0) {
          this.countOfLastMonthRequestsHandledByBots = res[0]['totalCount']

        } else {
          this.countOfLastMonthRequestsHandledByBots = 0
        }

        this.logger.log("[HOME-CONVS-GRAPH] - >>> getRequestsHasBotCount REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS: ", this.countOfLastMonthRequestsHandledByBots)
        this.logger.log("[HOME-CONVS-GRAPH] - >>> getRequestsHasBotCount REQUESTS COUNT LAST 30 DAYS: ", this.countOfLastMonthRequests);
        // numero di conversazioni gestite da bot / numero di conversazioni totali (già calcolata) * 100

        if (this.countOfLastMonthRequestsHandledByBots > 0 && this.countOfLastMonthRequests) {
          const _percentageOfLastMonthRequestsHandledByBots = (this.countOfLastMonthRequestsHandledByBots / this.countOfLastMonthRequests) * 100
          this.logger.log("[HOME-CONVS-GRAPH] - getRequestsHasBotCount % COUNT OF LAST MONTH REQUESTS: ", this.countOfLastMonthRequests);
          this.logger.log("[HOME-CONVS-GRAPH] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS: ", _percentageOfLastMonthRequestsHandledByBots);
          this.logger.log("[HOME-CONVS-GRAPH] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS typeof: ", typeof _percentageOfLastMonthRequestsHandledByBots);
          this.percentageOfLastMonthRequestsHandledByBots = _percentageOfLastMonthRequestsHandledByBots.toFixed(1).replace('.', ',');
        } else {
          this.percentageOfLastMonthRequestsHandledByBots = 0
        }
        this.logger.log("[HOME-CONVS-GRAPH] - >>> getRequestsHasBotCount percentageOfLastMonthRequestsHandledByBots: ", this.percentageOfLastMonthRequestsHandledByBots);
      }, (error) => {
        this.logger.error('[HOME-CONVS-GRAPH] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CONVS-GRAPH] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS * COMPLETE *');
      });
  }

  selectConversationsRange(rangeDays) {
    this.logger.log('[HOME-CONVS-GRAPH] - SELECT CONVERSATION RANGE rangeDays', rangeDays);
    this.numOfDays = rangeDays;
    this.lineChart.destroy();

    // this._getRequestByLastNDayMerge(rangeDays) // old 
    this.getRequestByLastNDayMerge(rangeDays) 
  }


  getMaxValueFromArrays(array1: number[], array2: number[]): number {
    const mergedArray = [...array1, ...array2];
    this.logger.log('mergedArray', mergedArray)
    return Math.max(...mergedArray);
  }

  getRequestByLastNDayMerge(lastdays) {
    this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD lastdays ', lastdays);
    // Combine two observables into a single request
    forkJoin({
      requestsByDay: this.analyticsService.requestsByDay(lastdays),
      requestsByDayBotServed: this.analyticsService.requestsByDayBotServed(lastdays)
    }).subscribe(({ requestsByDay, requestsByDayBotServed }) => {
      this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD HUMAN REQUESTS:', requestsByDay);
      this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD BOT REQUESTS:', requestsByDayBotServed);
  
      // Step 1: Initialize the array with last N days
      const lastNdaysInitArray = Array.from({ length: lastdays }, (_, i) => ({
        count: 0,
        day: moment().subtract(i, 'd').format('D/M/YYYY')
      })).reverse();
  
      // Step 2: Format API responses
      const formatRequests = (data, filterBot = false) =>
        data
          .filter(item => !filterBot || item['_id']['hasBot'] === true)
          .map(item => ({
            count: item['count'],
            day: `${item['_id']['day']}/${item['_id']['month']}/${item['_id']['year']}`
          }));
  
      const humanRequests = formatRequests(requestsByDay);
      const botRequests = formatRequests(requestsByDayBotServed, true);
  
      // Step 3: Merge formatted data with initialized array
      const finalHumanRequests = lastNdaysInitArray.map(obj => humanRequests.find(o => o.day === obj.day) || obj);
      const finalBotRequests = lastNdaysInitArray.map(obj => botRequests.find(o => o.day === obj.day) || obj);
  
      // Step 4: Extract series data for Chart.js
      const humanCounts = finalHumanRequests.map(req => req.count);
      const botCounts = finalBotRequests.map(req => req.count);
      const labels = finalHumanRequests.map(req => {
        const [day, month] = req.day.split('/');
        return `${day} ${this.monthNames[month]}`;
      });
  
      // Step 5: Calculate statistics
      this.totalHuman = humanCounts.reduce((sum, val) => sum + val, 0);
      this.totalBot = botCounts.reduce((sum, val) => sum + val, 0);
      
      const higherCount = this.getMaxValueFromArrays(humanCounts, botCounts);
      // + this.totalBot
      this.percentageOfRequestsHandledByBots =  this.totalBot > 0 ? ((this.totalBot / (this.totalHuman )) * 100).toFixed(2).replace('.', ',') : '0';
      
     
       this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD  Human Total:', this.totalHuman);
       this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD  Bot Total:',  this.totalBot);
       this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD  Bot %:', this.percentageOfRequestsHandledByBots);
       this.logger.log('[HOME-CONVS-GRAPH] - -> NEW METHOD  labels:', labels);
  
      // Step 6: Render the chart
      this.renderChart(labels, humanCounts, botCounts,higherCount);
    }, (error) => {
      this.logger.error('[HOME-CONVS-GRAPH] - -> NEW METHOD ERROR:', error);
    });
  }
  
  renderChart(labels, humanCounts, botCounts, higherCount) {
    
    this.lineChart =  new Chart('lastNdayChart', {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: this.servedByBots,
            data: botCounts,
            fill: true,
            backgroundColor: 'rgba(129,140,248, 0.6)',
            borderColor: 'rgba(129,140,248, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(129,140,248, 1)', //'rgba(255, 255, 255, 0.8)',
            pointBorderColor: 'rgba(129,140,248, 1)', //'#b00e0e'
            lineTension: 0.4,
          },
          {
            // label: this.servedByHumans,
            label: this.translate.instant('TotalConversations'),
            data: humanCounts,
            fill: true,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(30, 136, 229, 1)',
            pointBorderColor: 'rgba(30, 136, 229, 1)',
            lineTension: 0.4,
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        title: {
          text: 'AVERAGE TIME RESPONSE',
          display: false
        },
        legend: {
          display: true,
          position: 'top',
          align: "center",
          fullWidth: false,
          labels: {
            usePointStyle: false,
            // padding: 10
          }
        },
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true,
              display: true,
              fontColor: 'white',
            },
            gridLines: {
              display: true,
              borderDash: [8, 4],
              color: 'rgba(255, 255, 255, 0.5)',
              lineWidth: 0.5
            }

          }],
          yAxes: [{
            gridLines: {
              display: true,
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
              suggestedMax: higherCount + 1,
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem, data) => {
              const currentItemValue = tooltipItem.yLabel

              return this.translate.instant('Requests') + ':' + currentItemValue;

            }
          }
        }
      },
    });
  }
  
 
  // NO MORE USED replaced by getRequestByLastNDayMerge
  _getRequestByLastNDayMerge(lastdays) {
    //  this.logger.log("[HOME-CONVS-GRAPH] - GET REQUESTS BY LAST N DAYS Merge")
    this.analyticsService.requestsByDay(lastdays).subscribe((requestsByDay: any) => {
      this.logger.log('[HOME-CONVS-GRAPH] - GET REQUESTS (HUMAN) BY LAST' ,lastdays,  'DAYS - RESP', requestsByDay);

      this.analyticsService.requestsByDayBotServed(lastdays).subscribe((requestsByDayBotServed: any) => {
        this.logger.log('[HOME-CONVS-GRAPH] - GET REQUESTS (BOT) BY LAST ', lastdays, ' DAYS - RESP' ,requestsByDayBotServed );

        // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
        const last7days_initarray = []
        for (let i = 0; i < lastdays ; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
        }

        last7days_initarray.reverse()
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY lastDAY - MOMENT LAST N DATE (init array)', last7days_initarray);

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

        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY BOT SERVED FORMATTED ', requestByDayBotServed_array);

        /**
         * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
        // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
        // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
        // If not, then the same element in last7days i.e. obj is returned.
        // human
        const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);
        // bot
        const requestByDaysBotServed_final_array = last7days_initarray.map(obj => requestByDayBotServed_array.find(o => o.day === obj.day) || obj);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY BOT SERVED - FINAL ARRAY ', requestByDaysBotServed_final_array);

        // human
        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];
        // bot
        const _requestsByDayBotServed_series_array = [];


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


        // this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
        // this.logger.log('[ANALYTICS - CONVS] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);

        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY (HUMAN SERVERVED) - SERIES ', _requestsByDay_series_array);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY (BOT SERVERVED) - SERIES', _requestsByDayBotServed_series_array);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

        this.countOfLastSevenDaysRequests = _requestsByDay_series_array.reduce((partialSum, a) => partialSum + a, 0);
        this.countOfLastSevenDaysRequestsHandledByBot = _requestsByDayBotServed_series_array.reduce((partialSum, a) => partialSum + a, 0);

        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY N OF DAY', lastdays, ' - NUMB OF CONV HUMAN HANDLED countOfLastSevenDaysRequests ', this.countOfLastSevenDaysRequests);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY N OF DAY', lastdays, ' - NUMB OF CONV BOT HANDLED countOfLastSevenDaysRequestsHandledByBot', this.countOfLastSevenDaysRequestsHandledByBot);

        if (this.countOfLastSevenDaysRequestsHandledByBot > 0 && this.countOfLastSevenDaysRequests) {
          const totalSevendaysConvs = this.countOfLastSevenDaysRequestsHandledByBot + this.countOfLastSevenDaysRequests
          const _percentageOfLastSevenDaysRequestsHandledByBots = (this.countOfLastSevenDaysRequestsHandledByBot / totalSevendaysConvs) * 100

          this.logger.log("[HOME-CONVS-GRAPH] - REQUESTS BY DAY HANDLED BY BOT LAST (%) on ", lastdays, " DAYS: ", _percentageOfLastSevenDaysRequestsHandledByBots);
          // this.logger.log("[HOME-CONVS-GRAPH] - REQUESTS BY DAY HANDLED BY BOT LAST (%) on ", numOfDays ," DAYS typeof: ", typeof _percentageOfLastSevenDaysRequestsHandledByBots);
          this.percentageOfSevenDaysRequestsHandledByBots = _percentageOfLastSevenDaysRequestsHandledByBots.toFixed(1).replace('.', ',');
        } else {
          this.percentageOfSevenDaysRequestsHandledByBots = 0
        }
        this.logger.log("[HOME-CONVS-GRAPH] - REQUESTS BY DAY HANDLED BY BOT LAST (%) on ", lastdays, " DAYS: ", this.percentageOfSevenDaysRequestsHandledByBots);

        //get higher value of xvalue array 
        const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
        this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

        this.lineChart = new Chart('lastNdayChart', {
          type: 'line',
          data: {
            labels: _requestsByDay_labels_array,
            
            datasets: [
              {
                label: this.servedByBots, // this.translate.instant('ServedByBots'), // 'Served by bots', //active labet setting to true the legend value
                data: _requestsByDayBotServed_series_array,
                fill: true, //riempie zona sottostante dati
                lineTension: 0.4,
                backgroundColor: 'rgba(129,140,248, 0.6)', // 'rgba(232, 32, 32, 0.6)',
                borderColor: 'rgba(129,140,248, 1)', // 'rgba(189, 16, 16, 1)',
                borderWidth: 3,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: 'rgba(129,140,248, 1)', //'rgba(255, 255, 255, 0.8)',
                pointBorderColor: 'rgba(129,140,248, 1)' //'#b00e0e'
              },
              {
                label: this.servedByHumans, //this.translate.instant('ServedByHumans'), // 'Served by humans',//active labet setting to true the legend value
                data: _requestsByDay_series_array,
                fill: true, //riempie zona sottostante dati
                lineTension: 0.4,
                backgroundColor: 'rgba(30, 136, 229, 0.6)',
                borderColor: 'rgba(30, 136, 229, 1)',
                borderWidth: 3,
                borderDash: [],
                borderDashOffset: 0.0,
                pointBackgroundColor: 'rgba(30, 136, 229, 1)',
                pointBorderColor: 'rgba(30, 136, 229, 1)'
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
              position: 'top',
              align: "center",
              fullWidth: false,
              labels: {
                usePointStyle: false,
                // padding: 10
              }
            },
            scales: {
              xAxes: [{
                ticks: {
                  beginAtZero: true,
                  display: true,
                  fontColor: 'white',
                },
                gridLines: {
                  display: true,
                  borderDash: [8, 4],
                  color: 'rgba(255, 255, 255, 0.5)',
                  lineWidth: 0.5
                }

              }],
              yAxes: [{
                gridLines: {
                  display: true,
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
                  suggestedMax: higherCount + 1,
                }
              }]
            },
            tooltips: {
              callbacks: {
                label: (tooltipItem, data) => {
                  const currentItemValue = tooltipItem.yLabel

                  return this.translate.instant('Requests') + ':' + currentItemValue;

                }
              }
            }
          },
          plugins: [{
            beforeDraw: function (chartInstance, easing) {
              let ctx = chartInstance.chart.ctx;
              // this.logger.log("chartistance",chartInstance)
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
      this.logger.error('[HOME-CONVS-GRAPH - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[HOME-CONVS-GRAPH] - REQUESTS BY DAY * COMPLETE *');
    });
  }



  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Navigation
  // -----------------------------------------------------------------------------------------------------

  goToRequestsAnalytics() {
    this.trackUserAction.emit({action:'Conversations graph, filter in analytics',actionRes: null })
    // this.router.navigate(['project/' + this.projectId + '/conversation-analytics']);
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics']);
    }
  }

  // goToVisitorsAnalytics() {
  //   if (this.USER_ROLE !== 'agent') {
  //     this.router.navigate(['project/' + this.projectId + '/analytics/metrics/visitors']);
  //   }
  // }

  // goToMessagesAnalytics() {
  //   if (this.USER_ROLE !== 'agent') {
  //     this.router.navigate(['project/' + this.projectId + '/analytics/metrics/messages']);
  //   }
  // }

  // goToContacts() {
  //   this.router.navigate(['project/' + this.projectId + '/contacts']);
  // }


}
