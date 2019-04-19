import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as Chartist from 'chartist';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'appdashboard-analytics-static',
  templateUrl: './analytics-static.component.html',
  styleUrls: ['./analytics-static.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnalyticsStaticComponent implements OnInit {
  date: Date;
  global_activeRequestsCount: number;
  global_servedRequestsCount: number;
  global_unservedRequestsCount: number;
  lastMonthrequestsCount: number;
  monthNames: any;
  chartLabelsArray: any;
  displayUpgradePlanModal: any;
  IMAGES: any;
  
  projectId: string;
  constructor(
    private translate: TranslateService,
    public auth: AuthService,
    private router: Router
    
  ) { }

  ngOnInit() {
    this.date = new Date();
    this.global_activeRequestsCount = 38
    this.global_servedRequestsCount = 24
    this.global_unservedRequestsCount = 14
    this.lastMonthrequestsCount = 86

    this.getBrowserLangAndSwitchMonthName();

    this.generateChartLabels()
    this.buildChart()

    this.IMAGES = [
      { 'title': 'We are covered 1', 'url': 'assets/img/no_image_user.png' },
      { 'title': 'We are covered 2', 'url': 'assets/img/no_image_user.png' },
      { 'title': 'We are covered 3', 'url': 'assets/img/no_image_user.png' },
      { 'title': 'We are covered 4', 'url': 'assets/img/no_image_user.png' },
      { 'title': 'We are covered 5', 'url': 'assets/img/no_image_user.png' },
    ];

    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! ANALYTICS STATIC - project ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }

  getBrowserLangAndSwitchMonthName() {
    const browserLang = this.translate.getBrowserLang();
    console.log('!!! ANALYTICS STATIC - BROWSER LANG ', browserLang)
    if (browserLang) {
      if (browserLang === 'it') {
        // tslint:disable-next-line:max-line-length
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        // tslint:disable-next-line:max-line-length
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }

  generateChartLabels() {
    this.chartLabelsArray = []
    for (let i = 0; i <= 6; i++) {
      const dateFrom = moment().subtract(i, 'd').format('YYYY-M-DD');
      // console.log('dateFrom ', dateFrom);
      const splittedDate = dateFrom.split('-');
      // console.log('splittedDate ', splittedDate);
      this.chartLabelsArray.push(splittedDate[2] + ' ' +  this.monthNames[splittedDate[1]])
     
    }
    console.log('chartLabelsArray ', this.chartLabelsArray);
    
  }

  buildChart() {
    const dataRequestsByDayChart: any = {
      // `${id}`
      labels: this.chartLabelsArray.reverse(),
      series: [
        [96, 85, 88, 95, 91, 87, 101]
      ]
    };


    const optionsRequestsByDayChart: any = {
      lineSmooth: Chartist.Interpolation.cardinal({
        tension: 0
      }),
      low: 83,
      high: 100 + 2, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
      // scaleMinSpace: 6,
      chartPadding: { top: 0, right: 15, bottom: 0, left: 15 },
      axisY: {
        // onlyInteger: true,
        offset: 20
      },
      height: '240px'
    }

    const requestsByDayChart = new Chartist.Line('#requestsByDayChart', dataRequestsByDayChart, optionsRequestsByDayChart);

    this.startAnimationForLineChart(requestsByDayChart);

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

  closeUpgradePlanModal() {
    // this.displayUpgradePlanModal = 'none'
  }

  goToPricing() {
    console.log('goToPricing projectId ', this.projectId);
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }

}
