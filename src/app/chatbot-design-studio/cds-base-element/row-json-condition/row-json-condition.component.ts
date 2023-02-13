import { FormControl, FormGroup } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { Condition } from 'app/models/intent-model';

@Component({
  selector: 'cds-row-json-condition',
  templateUrl: './row-json-condition.component.html',
  styleUrls: ['./row-json-condition.component.scss']
})
export class RowJsonConditionComponent implements OnInit {

  @Input() condition: Condition
  @Input() operators: Array<{}> = []
  @Input() control: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    console.log('[ROW-JSON-CONDITION] conditionsssss ', this.condition, this.operators,this.control)
    if(this.control){
      console.log('controlllll', this.control.controls)
    }
  }

  onChangeOperand(text, type){
    if(type === 'operand1'){
      this.condition.operand1 = text
    }else if (type === 'operand2'){
      this.condition.operand2 = text
    }
    console.log('change text ', this.condition)
  }

  onChangeOperator(event){
    console.log('change selectttt', event, this.condition)
    this.condition.operator= event['type']
  }
}
