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
@Component({
  selector: 'appdashboard-tags-analytics',
  templateUrl: './tags-analytics.component.html',
  styleUrls: ['./tags-analytics.component.scss']
})
export class TagsAnalyticsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  lastdays = 7;
  initDay: string;
  endDay: string;
  selectedDaysId = 7  //  ?? evaluate whether to use it

  constructor(
    private tagsService: TagsService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.getTagDataAndBuildGraph(this.lastdays)
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
    // this.barChart.destroy();
    // this.subscription.unsubscribe();
    // this.avgTimeResponseCHART(value, this.selectedDeptId, this.selectedAgentId, this.selectedChannelId);
   console.log('[TAG-ANALYTICS] daysSelect:', value,  'selectedDaysId ', this.selectedDaysId)

   this.getTagDataAndBuildGraph(this.lastdays)
  }

  getTagDataAndBuildGraph(lastdays) {
    this.tagsService.geTagsForGraph().subscribe((res: any) => {

      console.log('[TAG-ANALYTICS] - GET GRAPH TAGS RES ', res)

     const fullDateRange = []
      for (let i = 0; i < lastdays; i++) {
        // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
        fullDateRange.push( moment().subtract(i, 'd').format('D/M/YYYY'));
      }
      fullDateRange.reverse()
      
      console.log('[TAG-ANALYTICS] fullDateRange ', fullDateRange)

      this.initDay = fullDateRange[0];
      this.endDay = fullDateRange[this.lastdays - 1];
      console.log("[TAG-ANALYTICS] filter start day", this.initDay, "filter end day ", this.endDay);
      // Generare tutte le date nell'intervallo specificato
      // const generateDateRange = (startDate, endDate) => {
      //   const dates = [];
      //   // let currentDate = new Date(startDate);
      //   // console.log('currentDate', currentDate)
      //   // const stopDate = new Date(endDate);
      //   // console.log('stopDate', stopDate)
      //   while (startDate <= endDate) {
      //     // dates.push(startDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
      //     // startDate.setDate(startDate.getDate() + 1); // Increment day
      //     // dates.push( moment().add(1, 'd'))
      //   }
      //   console.log('dates', dates)
      //   return dates;
      // };

      // // Intervallo desiderato dall'utente
      // const endDate =  moment().format('D/M/YYYY');
      // const startDate = moment().subtract(6, 'd').format('D/M/YYYY');
      // console.log('startDate x', startDate)
      // console.log('endDate x', endDate)
     

      // const fullDateRange = generateDateRange(startDate, endDate);
      // console.log('startDate',startDate) 
      // console.log('endDate',endDate) 
      // console.log('fullDateRange',fullDateRange) 
      

      // // Mappare le serie con i valori riempiti
      const filledSeries = res.series.map(serie => {
        const valuesMap = Object.fromEntries(
          res.dates.map((date, index) => [date, serie.values[index]])
        );
        console.log('valuesMap' ,valuesMap) 
        console.log('fullDateRange' ,fullDateRange) 

        const filledValues = fullDateRange.map(date => valuesMap[date] || 0); // Riempie i valori mancanti con 0
      
        return { name: serie.name, data: filledValues };
      });

      // // Output finale con le date aggiornate e le serie riempite
       const finalData = {
        dates: fullDateRange,
        series: filledSeries
      };
      this.buildGraph(finalData)

      console.log('finalData', finalData);
      // console.log('finalData',  JSON.stringify(finalData));
      // console.log('finalData series',  finalData.series);
      // console.log('finalData series',  JSON.stringify(finalData.series));

    }, error => {
      console.error('[TAG-ANALYTICS] - GET GRAPH TAGS - ERROR: ', error);
    }, () => {
      console.log('[TAG-ANALYTICS] - GET GRAPH TAGS * COMPLETE *');

    });
   
  }

  buildGraph(finalData) {
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
      stacked: true
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
 
}

  

}
