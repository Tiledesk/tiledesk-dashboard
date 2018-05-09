// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
import * as Chartist from 'chartist';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  constructor(
    private auth: AuthService
  ) {
    this.auth.checkRole();
  }

  startAnimationForLineChart(chart) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  };
  startAnimationForBarChart(chart) {
    let seq2: any, delays2: any, durations2: any;

    seq2 = 0;
    delays2 = 80;
    durations2 = 500;
    chart.on('draw', function (data) {
      if (data.type === 'bar') {
        seq2++;
        data.element.animate({
          opacity: {
            begin: seq2 * delays2,
            dur: durations2,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq2 = 0;
  };
  ngOnInit() {

    /* ----------==========    NUMBER OF REQUEST for DEPARTMENT ** PIE CHART ** ==========---------- */

    //   const data = {
    //     series: [35.03, 32.12, 19.99, 6.24, 5.41, 0.82, 0.23, 0.15, 0.012, 0]
    //   };

    //   const sum = function (a, b) { return a + b };

    //  const requstForDept = new Chartist.Pie('.ct-chart', data, {
    //     labelInterpolationFnc: function (value) {
    //       return Math.round(value / data.series.reduce(sum) * 100) + '%';
    //     }
    //   });

    const dataPreferences = {
      labels: ['35.03%', '32.12%', '19.99%', '6.24%'],
      series: [35.03, 32.12, 19.99, 6.24]
    };

    const optionsPreferences = {
      height: '230px'
    };

    // tslint:disable-next-line:no-unused-expression
    new Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);


    /* ----------==========    NUMBER OF REQUEST   ==========---------- */

    const dataDailySalesChart: any = {
      // labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      labels: ['L', 'M', 'M', 'G', 'V', 'S', 'D'],
      series: [
        [12, 17, 7, 17, 23, 18, 38]
      ]
    };

    const optionsDailySalesChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0
      }),
      low: 0,
      high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    }

    var dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

    this.startAnimationForLineChart(dailySalesChart);


    /* ----------==========     Users satisfaction    ==========---------- */

    const dataCompletedTasksChart: any = {
      // labels: ['12am', '3pm', '6pm', '9pm', '12pm', '3am', '6am', '9am'],
      labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
      series: [
        [50, 60, 100, 45, 40, 65, 70, 91, 70, 75, 95, 98]
      ]
    };

    const optionsCompletedTasksChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0
      }),
      low: 0,
      high: 150, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 }
    }

    var completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

    // start animation for the Completed Tasks Chart - Line Chart
    this.startAnimationForLineChart(completedTasksChart);



    /* ----------==========    Chat average duration    ==========---------- */

    var dataEmailsSubscriptionChart = {
      // labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
      series: [
        [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 360]

      ]
    };
    var optionsEmailsSubscriptionChart = {
      axisX: {
        showGrid: false
      },
      low: 0,
      high: 1000,
      chartPadding: { top: 0, right: 5, bottom: 0, left: 0 }
    };
    var responsiveOptions: any[] = [
      ['screen and (max-width: 640px)', {
        seriesBarDistance: 5,
        axisX: {
          labelInterpolationFnc: function (value) {
            return value[0];
          }
        }
      }]
    ];
    var emailsSubscriptionChart = new Chartist.Bar('#emailsSubscriptionChart', dataEmailsSubscriptionChart, optionsEmailsSubscriptionChart, responsiveOptions);

    //s tart animation for the Emails Subscription Chart
    this.startAnimationForBarChart(emailsSubscriptionChart);
  }

}