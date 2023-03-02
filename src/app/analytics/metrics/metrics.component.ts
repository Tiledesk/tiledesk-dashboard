import { Component, OnInit, Input } from '@angular/core';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
@Component({
  selector: 'appdashboard-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.scss']
})
export class MetricsComponent implements OnInit {
  @Input()  autoselected
 
  selected='richieste'
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor() {}

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
