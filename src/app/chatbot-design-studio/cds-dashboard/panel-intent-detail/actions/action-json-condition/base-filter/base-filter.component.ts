import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, HostListener, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { Condition, Expression, Operator } from 'app/models/intent-model';
import { OperatorValidator, variableList, OPERATORS_LIST } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'base-filter',
  templateUrl: './base-filter.component.html',
  styleUrls: ['./base-filter.component.scss']
})
export class BaseFilterComponent implements OnInit {
  
  @ViewChild("addConditionFilter") addConditionFilter : SatPopover;

  @Input() expression: Expression
  @Input() booleanOperators: {}
  @Output() onDeleteGroup = new EventEmitter()

  selectedCondition: Condition;
  selectedIndex: number;

  OPERATORS_LIST = OPERATORS_LIST
  
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    console.log('[BASE_FILTER] expression selected-->', this.expression)
  }

  onOpenConditionDetail(index: number){
    this.selectedCondition = this.expression.conditions[index] as Condition
    this.selectedIndex = index
  }

  onDeleteCondition(index: number, last: boolean){
    if(!last){
      this.expression.conditions.splice(index, 2)
    }else if(last){
      this.expression.conditions.splice(index-1, 2)
    }
    console.log('expressionnn', this.expression)
  }

  onRemoveGroup(){
    this.onDeleteGroup.emit()
  }

  onChangeOperator(event, index: number){
    (this.expression.conditions[index] as Operator).operator= event['type']
    console.log('onChangeOperator expressionn', this.expression)
  }


  onDismiss(condition: Condition){
    if(condition){
      console.log('onDismiss popover condition', condition)
      //if condition already exist --> do not push new condition
      //else push new operaor and condition  
      if(this.selectedCondition){
        this.expression.conditions[this.selectedIndex]= condition
      }else {

        if(this.expression.conditions.length === 0){
          this.expression.conditions.push(condition)
        }else{
          this.expression.conditions.push(new Operator())
          this.expression.conditions.push(condition)
        }

      }
      
    }
    this.addConditionFilter.close()
    
  }

}
