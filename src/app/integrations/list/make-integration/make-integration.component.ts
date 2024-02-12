import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'make-integration',
  templateUrl: './make-integration.component.html',
  styleUrls: ['./make-integration.component.scss']
})
export class MakeIntegrationComponent implements OnInit {

  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  translateparams: any;

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    console.log("[INT-Make] integration ", this.integration);
    this.translateparams = { intname: 'Make' };
  }

}
