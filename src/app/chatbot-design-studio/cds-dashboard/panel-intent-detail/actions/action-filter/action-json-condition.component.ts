import { TYPE_OPERATOR } from './../../../../utils';
import { Expression, Operator } from './../../../../../models/intent-model';
import { ActionJsonCondition } from '../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'cds-action-json-condition',
  templateUrl: './action-json-condition.component.html',
  styleUrls: ['./action-json-condition.component.scss']
})
export class ActionJsonConditionComponent implements OnInit {

  @Input() action: ActionJsonCondition;

  actionJsonConditionFormGroup: FormGroup


  variableListMock: Array<{name: string, value: string}> = [
    { name: 'variabile1', value: 'val1'},
    { name: 'variabile2', value: 'val2'},
    { name: 'variabile3', value: 'val3'},
    { name: 'variabile4', value: 'val4'},
    { name: 'variabile5', value: 'val5'},
  ]

  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.initialize();
    console.log('[ACTION-JSON-CONDITION] actionnn-->', this.action)
    // if (this.action && this.action.variableName) {
    //   this.setFormValue();
    // }
  }

  private initialize() {
    this.actionJsonConditionFormGroup = this.buildForm();
    this.actionJsonConditionFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-JSON-CONDITION] form valueChanges-->', form)
    })
  }

  buildForm(): FormGroup{
    return this.formBuilder.group({
      groups: this.formBuilder.array([
        this.createExpressionGroup(),
        this.createOperatorGroup()
      ]) 
    })
  }

  createExpressionGroup(): FormGroup{
    return this.formBuilder.group({
      type:["expression", Validators.required],
      conditions: this.formBuilder.array([
        this.createConditionGroup(), this.createOperatorGroup()
      ])
    })
  }

  createConditionGroup(): FormGroup{
    return this.formBuilder.group({
      type: ["condition", Validators.required],
      operand1 : [ '', Validators.required],
      operator: ['', Validators.required, OperatorValidator],
      operand2: ['', Validators.required]
    })
  }

  createOperatorGroup(): FormGroup{
    return this.formBuilder.group({
      type: ["operator", Validators.required],
      operator: [ '', Validators.required]
    })
  }


  onClickAddGroup(){
    this.action.groups.push(new Operator())
    this.action.groups.push(new Expression())
    console.log('onClickAddGroup-->', this.action)
    let groups = this.actionJsonConditionFormGroup.get('groups') as FormArray
    groups.push(this.createOperatorGroup())
    groups.push(this.createExpressionGroup())
  }

  onAddControl(event, index: number){
    console.log('onAddControl actionsss', this.action, index)
    let group = (this.actionJsonConditionFormGroup.get('groups') as FormArray).at(index) as FormGroup
    let conditions = group.get('conditions') as FormArray
    console.log('onAddControl groupppp', conditions )
    conditions.push(this.createOperatorGroup())
    conditions.push(this.createConditionGroup())
    // (groups.at(index) as FormGroup).controls['conditions'].push(this.createOperatorGroup())
    // (groups.at(index) as FormGroup).controls['conditions'].push(this.createConditionGroup())
    console.log('onAddControl formmmmmmmm', this.actionJsonConditionFormGroup) 
  }

  onChangeOperator(event, index: number){
    (this.action.groups[index] as Operator).operator= event['type']
    console.log('onChangeOperator actionsss', this.action)
  }
}

export function OperatorValidator( control: AbstractControl ): { [key: string]: boolean } | null {
  if (control.value in TYPE_OPERATOR) {
    return { type: control.value };
  }
  return null;
}
