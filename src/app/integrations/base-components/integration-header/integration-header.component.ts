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
    // console.log("header laoded: ", this.integrationModel);
  }

  ngOnChanges(changes: SimpleChanges): void {
  //  console.log("[INTEGRATION-HEADER] integrationModel: ", this.integrationModel);
  }

}
