import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'cds-connector',
  templateUrl: './cds-connector.component.html',
  styleUrls: ['./cds-connector.component.scss']
})
export class CdsConnectorComponent implements OnInit {
  @Input() idAction: string;
  @Input() isConnected: boolean;

  constructor() { }

  ngOnInit(): void {
    
  }

}
