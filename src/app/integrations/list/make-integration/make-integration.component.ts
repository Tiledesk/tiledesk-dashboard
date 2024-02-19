import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'make-integration',
  templateUrl: './make-integration.component.html',
  styleUrls: ['./make-integration.component.scss']
})
export class MakeIntegrationComponent implements OnInit, OnChanges{

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  
 translateparams: any;

  constructor(
    private logger: LoggerService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-Make] integration (oninit)", this.integration);
    this.translateparams = { intname: 'Make' };
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.logger.log("[INT-Make] integration (onchanges) changes", changes);
    this.logger.log("[INT-Make] integration (onchanges) integration", this.integration);

  }

}
