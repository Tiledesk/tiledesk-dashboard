import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'appdashboard-action-condition',
  templateUrl: './action-condition.component.html',
  styleUrls: ['./action-condition.component.scss']
})
export class ActionConditionComponent implements OnInit {
  
  @Input() listOfActions: Array<any>;

  constructor() { }

  ngOnInit(): void {
  }


}
