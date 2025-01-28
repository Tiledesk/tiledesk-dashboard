import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'integration-header',
  templateUrl: './integration-header.component.html',
  styleUrls: ['./integration-header.component.scss']
})
export class IntegrationHeaderComponent implements OnInit, OnChanges{

  @Input() integrationModel: any;

  constructor() { }

  ngOnInit(): void {
    // this.logger.log("header laoded: ", this.integrationModel);
  }

  ngOnChanges(changes: SimpleChanges): void {
  //  this.logger.log("[INTEGRATION-HEADER] integrationModel: ", this.integrationModel);
  }

}
