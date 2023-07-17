import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cds-action-controls',
  templateUrl: './cds-action-controls.component.html',
  styleUrls: ['./cds-action-controls.component.scss']
})
export class CdsActionControlsComponent implements OnInit {
  @Input() action: any
  constructor() { }

  ngOnInit(): void {
  }

}
