import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'gsheets-integration',
  templateUrl: './gsheets-integration.component.html',
  styleUrls: ['./gsheets-integration.component.scss']
})
export class GsheetsIntegrationComponent implements OnInit {

  @Input() integration_name: string;
  @Input() integration: any;
  @Output() onUpdateIntegration = new EventEmitter;
  @Output() onDeleteIntegration = new EventEmitter;

  constructor() { }

  ngOnInit(): void {
    // console.log("gsheets loaded")
    // console.log("gsheet integration: ", this.integration)
  }

  

}
