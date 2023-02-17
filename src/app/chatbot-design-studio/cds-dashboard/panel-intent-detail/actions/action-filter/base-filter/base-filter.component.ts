import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, HostListener, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { Condition, Expression, Operator } from 'app/models/intent-model';
import { OperatorValidator } from 'app/chatbot-design-studio/utils';

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
  
  variableListMock: Array<{name: string, value: string}> = [
    { name: 'facebook', value: 'facebook'},
    { name: 'email', value: 'email'},
    { name: 'instagram', value: 'instagram'},
    { name: 'variabile1', value: 'valvariabile14'},
    { name: 'userFullName', value: 'userFullName'},
  ]

  intentVariableListMock: Array<{name: string, value: string}> = [
    { name: 'facebook', value: 'facebook'},
    { name: 'email', value: 'email'},
    { name: 'instagram', value: 'instagram'},
    { name: 'variabile1', value: 'valvariabile14'},
    { name: 'userFullName', value: 'userFullName'},
  ]

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    console.log('[BASE_FILTER] expression selected-->', this.expression)
  }

  onOpenConditionDetail(index: number){
    this.selectedCondition = this.expression.conditions[index] as Condition
  }

  onDeleteCondition(index: number, last: boolean){
    if(!last){
      this.expression.conditions.splice(index, 2)
    }else if(last){
      this.expression.conditions.splice(index, 1)
    }
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
      this.expression.conditions.push(condition)
      this.expression.conditions.push(new Operator())
    }
    this.addConditionFilter.close()
    
  }

}
