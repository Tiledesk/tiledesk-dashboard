import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'integration-header',
  templateUrl: './integration-header.component.html',
  styleUrls: ['./integration-header.component.scss']
})
export class IntegrationHeaderComponent implements OnInit {

  @Input() integrationModel: any;

  constructor() { }

  ngOnInit(): void {
    // console.log("header laoded: ", this.integrationModel);
  }

}
