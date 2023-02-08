import { ACTIONS_LIST } from './../../../../utils';
import { Component, Input, OnInit } from '@angular/core';
import { Action } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-description',
  templateUrl: './action-description.component.html',
  styleUrls: ['./action-description.component.scss']
})
export class ActionDescriptionComponent implements OnInit {

  @Input() actionType: string;
  @Input() actionSelected: Action;
  @Input() showTip: boolean = false;
  @Input() tipText: string;
  constructor() { }

  titlePlaceholder: string = 'set a title to your action...'
  action = ACTIONS_LIST
  
  ngOnInit(): void {
    
  }

  ngOnChanges(){
    // if(this.actionSelected && this.actionSelected._tdActionTitle === ''){
    //   this.titlePlaceholder = 'set a title to your action...'
    // }
    // console.log('showtipppp', this.showTip, this.tipText)
  }

  onChangeText(text: string){
   this.actionSelected._tdActionTitle = text
    // this.actionSel._tdActionTitle = text
  }

}
