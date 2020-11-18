import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';


@Component({
  selector: 'appdashboard-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.scss']
})
export class VisitorsComponent implements OnInit {

  lang: string;

  constructor(private translate: TranslateService,) {
    this.lang = this.translate.getBrowserLang();
    console.log('LANGUAGE ', this.lang);
  }

  ngOnInit() {

  }

}
