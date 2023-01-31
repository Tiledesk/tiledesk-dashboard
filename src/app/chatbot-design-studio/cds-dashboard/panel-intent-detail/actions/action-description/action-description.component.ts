import { ACTIONS_LIST } from './../../../../utils';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cds-action-description',
  templateUrl: './action-description.component.html',
  styleUrls: ['./action-description.component.scss']
})
export class ActionDescriptionComponent implements OnInit {

  @Input() actionType: string;
  constructor() { }

  action = ACTIONS_LIST
  
  ngOnInit(): void {
    
  }

}
