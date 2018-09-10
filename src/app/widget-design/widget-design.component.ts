import { Component, OnInit } from '@angular/core';
import { slideInOutAnimation } from './slide-in-out.animation';
@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss'],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})


export class WidgetDesignComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    
  }

}
