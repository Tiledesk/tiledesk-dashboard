import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'n8n-integration',
  templateUrl: './n8n-integration.component.html',
  styleUrls: ['./n8n-integration.component.scss']
})
export class N8nIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  translateparams: any;

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.logger.log("[INT-n8n] integration (oninit)",  this.integration);
    this.translateparams = { intname: 'n8n' };
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.logger.log("[INT-Make] integration (onchanges) changes", changes);
    this.logger.log("[INT-Make] integration (onchanges) integration", this.integration);
  }

}
