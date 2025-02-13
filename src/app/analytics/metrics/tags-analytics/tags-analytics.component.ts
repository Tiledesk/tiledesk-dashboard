import { Component, OnInit, ViewChild } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TagsService } from 'app/services/tags.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
};
import moment from "moment"
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'appdashboard-tags-analytics',
  templateUrl: './tags-analytics.component.html',
  styleUrls: ['./tags-analytics.component.scss']
})
export class TagsAnalyticsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  currentUserId: string;
  lastdays = 7;
  initDay: string;
  endDay: string;
  selectedDaysId = 7  //  ?? evaluate whether to use it
  chartStackedColumns: boolean = true;
  chartBasicColumns: boolean = false;
  // Date - picker
  startDate: Date | null = null;
  endDate: Date | null = null;
  startDateTemp: any;
  endDateTemp: any;
  minEndDate: Date | null = null; // To hold the minimum end date
  maxEndDate: Date | null = null; // To hold the maximum end date

  isLoading = true; // Loading state flag


  constructor(
    private tagsService: TagsService,
    private logger: LoggerService,
    public auth: AuthService,
  ) {

  }



  ngOnInit(): void {
    // this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
    this.calculateDateRange(this.lastdays)
    this.getCurrentUserAndChartTypePreference()

  }

  

  getCurrentUserAndChartTypePreference() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[TAG-ANALYTICS] - LoggedUser ', user);

      if (user && user._id) {
        this.currentUserId = user._id;
        // this.getUserChartTypePreference(this.currentUserId)
      }
    });
  }

  getUserChartTypePreference(currentUserId: string) {
    let storedChartTypeUserPreference = localStorage.getItem(`chartStackedColumns-${currentUserId}`)
    this.logger.log('[TAG-ANALYTICS] STORED CHART TYPE PREFERENCE', storedChartTypeUserPreference)
    if (!storedChartTypeUserPreference) {
      this.chartStackedColumns = true;
      this.chartBasicColumns = false;
      this.logger.log('[TAG-ANALYTICS] NO STORED CHART TYPE PREFERENCE chartStackedColumns', this.chartStackedColumns, 'chartBasicColumns ', this.chartBasicColumns)
    } else {
      if (storedChartTypeUserPreference === 'false') {
        this.chartStackedColumns = false;
        this.chartBasicColumns =  true;
      }
      if (storedChartTypeUserPreference === 'true') {
        this.chartStackedColumns = true;
        this.chartBasicColumns = false;
      }

    }
  }


  // Start date selection handler
  onSelectStartDate(selectedDate: Date): void {
    // this.logger.log('[TAG-ANALYTICS] - Start Date onSelectStartDate:', selectedDate);
    this.startDateTemp = moment(selectedDate).format('DD/MM/YYYY');
    this.logger.log('[TAG-ANALYTICS] - Start Date startDate:', this.startDateTemp);
    if (selectedDate) {
      this.minEndDate = new Date(selectedDate); // Set minEndDate to selected start date
      this.maxEndDate = new Date(selectedDate); // Initialize maxEndDate
      this.maxEndDate.setDate(this.maxEndDate.getDate() + 30); // Set maxEndDate to selected start date + 29 days
    } else {
      this.minEndDate = null; // Reset if no start date is selected
      this.maxEndDate = null; // Reset max end date if no start date is selected
    }

  }

  // End date selection handler
  onSelectEndDate(selectedDate: Date): void {
    // this.logger.log('[TAG-ANALYTICS] - End Date onSelectEndDate selectedDate:', selectedDate);
    this.endDateTemp = moment(selectedDate).format('DD/MM/YYYY');
    this.logger.log('[TAG-ANALYTICS] - End Date endDateTemp:', this.endDateTemp);
    if (this.startDateTemp && this.endDateTemp) {
      this.selectedDaysId = null
      // const date_Array = this.createDateRange(this.startDateTemp, this.endDateTemp)
      // this.logger.log('[TAG-ANALYTICS] - End Date onSelectEndDate date_Array:', date_Array);
      this.getTagDataAndBuildGraph(this.startDateTemp, this.endDateTemp, this.chartStackedColumns)

    }
  }


  clearDateRange() {
    this.logger.log('[TAG-ANALYTICS] - CLEAR DATE RANGE');
    this.startDate = null
    this.endDate = null
    this.startDateTemp = null
    this.endDateTemp = null
    this.minEndDate = null; 
    this.maxEndDate = null; 
  }

  onSelectStackedColmunsGraphType(areStaked) {
    this.logger.log('[TAG-ANALYTICS] - onSelectColmunsGraphType areStaked', areStaked)
    this.chartStackedColumns = areStaked;
    this.chartBasicColumns = false;

    // save user preference
    localStorage.setItem(`chartStackedColumns-${this.currentUserId}`, 'true')

    this.logger.log('[TAG-ANALYTICS] - chartStackedColumns ', this.chartStackedColumns)
    this.logger.log('[TAG-ANALYTICS] onSelectStackedColmunsGraphType startDateTemp'  , this.startDateTemp, ' endDateTemp ' ,  this.endDateTemp)
    // this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
    if (this.startDateTemp  && this.endDateTemp ) {
      this.getTagDataAndBuildGraph(this.startDateTemp, this.endDateTemp, this.chartStackedColumns)
      
    } else {
      this.calculateDateRange(this.lastdays)
    }
  }

  onSelectBasicColmunsGraphType(areBasic) {
    this.logger.log('[TAG-ANALYTICS] - onSelectBasicColmunsGraphType ', areBasic)
    this.chartBasicColumns = areBasic
    this.chartStackedColumns = false;

    // save user preference
    localStorage.setItem(`chartStackedColumns-${this.currentUserId}`, 'false')

    this.logger.log('[TAG-ANALYTICS] - chartBasicColumns ', this.chartBasicColumns)
    this.logger.log('[TAG-ANALYTICS] onSelectBasicColmunsGraphType startDateTemp'  , this.startDateTemp, ' endDateTemp ' ,  this.endDateTemp)
    // this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
   
    if (this.startDateTemp && this.endDateTemp) {
      this.getTagDataAndBuildGraph(this.startDateTemp, this.endDateTemp, this.chartStackedColumns)
    } else {
      this.calculateDateRange(this.lastdays)
    }
  }

  daysSelect(value) {

    this.selectedDaysId = value;//--> value to pass throw for graph method
    this.logger.log('[TAG-ANALYTICS] daysSelect this.selectedDaysId ', this.selectedDaysId)
    if (this.selectedDaysId) {
      this.clearDateRange()
    }
    //check value for label in htlm
    if (value <= 30) {
      this.lastdays = value;
      this.calculateDateRange(this.lastdays)
    } else if ((value === 90)) {
      this.lastdays = value;
      this.logger.log('lastdays use case 90 or 180 lastdays', this.lastdays)
      this.calculateDateRange(this.lastdays)
    } else if ((value === 180)) {

      this.lastdays = value;
      this.calculateDateRange(this.lastdays)
    } else if (value === 360) {
      this.lastdays = value;
      this.calculateDateRange(this.lastdays)
    }
    // this.barChart.destroy();
    // this.subscription.unsubscribe();
    // this.avgTimeResponseCHART(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
    this.logger.log('[TAG-ANALYTICS] daysSelect:', value, 'selectedDaysId ', this.selectedDaysId)



    // this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
    // this.getTagDataAndBuildGraph(this.lastdays, this.chartStackedColumns)
  }
  
  calculateDateRange(days: number) {
    this.logger.log('calculateDateRange days ', days)
    const today = moment(); // Current date
    const _startDate = today.clone().subtract(days - 1, 'days'); // Subtract (days - 1) for a full range
    const _endDate = today;
    const startDate = _startDate.format('DD/MM/YYYY')
    const endDate = _endDate.format('DD/MM/YYYY')
    this.logger.log('[TAG-ANALYTICS] --> calculateDateRange:', startDate, 'startDate ', ' endDate ', endDate)

    this.getTagDataAndBuildGraph(startDate, endDate, this.chartStackedColumns)
   
  }

  // getTagDataAndBuildGraph(lastdays, chartStackedColumns) { // old
  // console.log('getTagDataAndBuildGraph lastdays ', lastdays)
  getTagDataAndBuildGraph(startDate: string, endDate: string, chartStackedColumns: boolean) {
    

    // --------------------------------------------------------------------------------------
    // Generate all dates from a number (e.g. 7 when the user select last seven days)
    // --------------------------------------------------------------------------------------
    // const fullDateRange = []
    // for (let i = 0; i < lastdays; i++) {
    //   // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
    //   fullDateRange.push(moment().subtract(i, 'd').format('DD/MM/YYYY'));
    //   // fullDateRange.push( moment().subtract(i, 'd').format('YYYY-MM-DD'));
    // }
    // fullDateRange.reverse()

    // --------------------------------------------------------------------------------------------
    // Generate a date range from a number (e.g. 7 when the user select last seven days) - improved
    // --------------------------------------------------------------------------------------------
    // const getLastDays = (lastdays: number): string[] => {
    //   return Array.from({ length: lastdays }, (_, index) =>
    //     moment().subtract(index, 'days').format('DD/MM/YYYY')
    //   ).reverse();
    // };

    // const fullDateRange = getLastDays(lastdays); // Generate the last 7 days
    // console.log('Generated Date Range:', fullDateRange);


    this.logger.log('[TAG-ANALYTICS] GET TAG DATA AND BUILD GRAPH  startDate ', startDate, 'endDate ', endDate, 'chartStackedColumns ', chartStackedColumns)

    // --------------------------------------------------------------------------------------
    // Generate a date range from a start and an end date (new)
    // --------------------------------------------------------------------------------------
    const createDateRange = (startDate: string, endDate: string): string[] => {
      const dateArray: string[] = [];
      let currentDate = moment(startDate, 'DD/MM/YYYY'); // Start date
      const end = moment(endDate, 'DD/MM/YYYY'); // End date

      while (currentDate <= end) {
        dateArray.push(currentDate.format('DD/MM/YYYY'));
        currentDate = currentDate.add(1, 'day'); // Move to the next day
      }

      return dateArray;
    }

    const fullDateRange = createDateRange(startDate, endDate)
    this.logger.log('[TAG-ANALYTICS] Generated Date Range ----> fullDateRange 2:', fullDateRange);


    // this.initDay = fullDateRange[0]
    // this.endDay = fullDateRange[this.lastdays - 1];
    this.initDay = startDate
    this.endDay = endDate;

    // const _initDay = moment(fullDateRange[0]).format('MM/DD/YYYY');
    // const _endDay =  moment(fullDateRange[this.lastdays - 1]).format('MM/DD/YYYY');
    // this.logger.log("[TAG-ANALYTICS] fullDateRange[0]", fullDateRange[0]);
    // this.logger.log("[TAG-ANALYTICS] filter start day x query", _initDay, "filter end day x query", _endDay);

    this.logger.log("[TAG-ANALYTICS] filter start day", this.initDay, "filter end day ", this.endDay);

    this.logger.log("[TAG-ANALYTICS] filter start day x query", moment(this.initDay, 'DD/MM/YYYY').format('MM/DD/YYYY'), "filter end day x query", moment(this.endDay, 'DD/MM/YYYY').format('MM/DD/YYYY'));
    const initDayForQuery = moment(this.initDay, 'DD/MM/YYYY').format('MM/DD/YYYY')
    const endDayForQuery = moment(this.endDay, 'DD/MM/YYYY').format('MM/DD/YYYY')

    // REST CALL
    this.tagsService.geTagsForGraph('conversation-tag', initDayForQuery, endDayForQuery).subscribe((res: any) => {

      this.logger.log('[TAG-ANALYTICS] ---> GET GRAPH TAGS RES ', res)

      // ---------------------------------------------
      // Map series with filled values
      // ---------------------------------------------
      const filledSeries = res.series.map(serie => {
        this.logger.log('filledSeries serie ', serie)
        const valuesMap = Object.fromEntries(
          res.dates.map((date, index) => [date, serie.values[index]])
        );
        this.logger.log('filledSeriesvaluesMap', valuesMap)
        this.logger.log('filledSeries fullDateRange', fullDateRange)

        const filledValues = fullDateRange.map(date => valuesMap[date] || 0); // Riempie i valori mancanti con 0

        return { name: serie.name, data: filledValues };
      });

      // Final output with updated dates and filled series
      const finalData = {
        dates: fullDateRange,
        series: filledSeries
      };
      
      // --------------------------
      // Build Graph
      // --------------------------
      this.buildGraph(finalData, chartStackedColumns)

      this.logger.log('finalData', finalData);
      // this.logger.log('finalData',  JSON.stringify(finalData));
      // this.logger.log('finalData series',  finalData.series);
      // this.logger.log('finalData series',  JSON.stringify(finalData.series));

    }, error => {
      this.logger.error('[TAG-ANALYTICS] - GET GRAPH TAGS - ERROR: ', error);
    }, () => {
      this.logger.log('[TAG-ANALYTICS] - GET GRAPH TAGS * COMPLETE *');

    });

  }

  buildGraph(finalData, chartStackedColumns) {
    this.isLoading = true;
    setTimeout(() => { // Simulate async operation
      this.chartOptions = {
        series: finalData.series,
        // series: [
        // {
        //   name: "tag-ex-12",
        //   data: [0, 0, 0, 2, 0, 0, 0]
        // },
        // {
        //   name: "sales",
        //   data: [0, 0, 0, 0, 1, 0, 0]
        // },
        // {
        //   name: "support",
        //   data: [0, 0, 0, 0, 2, 0, 0]
        // },
        // {
        //   name: "info",
        //   data: [0, 0, 0, 0, 1, 0, 0]
        // }
        // {
        //   name: "Marine Sprite",
        //   data: [44, 55, 41, 37, 22, 43, 21]
        // },
        // {
        //   name: "Striking Calf",
        //   data: [53, 32, 33, 52, 13, 43, 32]
        // },
        // {
        //   name: "Tank Picture",
        //   data: [12, 17, 11, 9, 15, 11, 20]
        // },
        // {
        //   name: "Bucket Slope",
        //   data: [9, 7, 5, 8, 6, 9, 4]
        // },
        // {
        //   name: "Reborn Kid",
        //   data: [25, 12, 19, 32, 25, 24, 10]
        // }
        // ],
        chart: {
          type: "bar",
          height: 350,
          stacked: chartStackedColumns
        },
        plotOptions: {
          bar: {
            horizontal: false,
            // columnWidth: "55%",
            // borderRadius: 8
          }
        },
        stroke: {
          width: 1,
          colors: ["#fff"]
        },
        // title: {
        //   text: "Fiction Books Sales"
        // },
        xaxis: {
          categories: finalData.dates, // [2008, 2009, 2010, 2011, 2012, 2013, 2014], //  finalData.dates,

          labels: {
            formatter: function (val) {
              return val; // + "K";
            }
          }
        },
        yaxis: {
          // max: 5,
          title: {
            text: undefined
          }
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "";
            }
          }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: "bottom",
          horizontalAlign: "center",
          offsetX: 40
        }
      };

      this.isLoading = false; // Hide loading indicator
    }, 1000); // Simulated delay (e.g., fetching or processing data)
    //  this.logger.log('[TAG-ANALYTICS] chartOptions ', this.chartOptions )
    // this.chart = new ApexCharts(document.querySelector("#chart"), this.chartOptions);  
    // chart.render(); 
  }



}
