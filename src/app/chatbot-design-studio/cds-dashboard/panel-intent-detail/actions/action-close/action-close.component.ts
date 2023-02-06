import { Component, Input, OnInit } from '@angular/core';
import { ActionClose } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-close',
  templateUrl: './action-close.component.html',
  styleUrls: ['./action-close.component.scss']
})
export class ActionCloseComponent implements OnInit {

  @Input() action: ActionClose;
  
  constructor() { }

  ngOnInit(): void {
  }

}
