import { Component, OnInit, Input } from '@angular/core';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-metriche',
  templateUrl: './metriche.component.html',
  styleUrls: ['./metriche.component.scss']
})
export class MetricheComponent implements OnInit {
  @Input()  autoselected
 
  selected='richieste'
 
  constructor(
    private logger: LoggerService

  ) {
   }

  ngOnInit() {

    this.logger.log("[ANALYTICS - METRICS] - autoselected", this.autoselected)

    if (this.autoselected === 'visitors') {
      this.selected='visitors';
    } 

    if (this.autoselected === 'messages') {
      this.selected='messages';
    } 
  }

  goTo(component){
    this.selected=component;
    this.logger.log("[ANALYTICS - METRICS] Move to:",component)
  }
}
