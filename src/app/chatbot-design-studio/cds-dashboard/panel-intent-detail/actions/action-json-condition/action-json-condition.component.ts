import { OperatorValidator } from '../../../../utils';
import { Expression, Operator, Condition } from '../../../../../models/intent-model';
import { ActionJsonCondition } from '../../../../../models/intent-model';
import { Component, Host, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SatPopover } from '@ncstate/sat-popover';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'cds-action-json-condition',
  templateUrl: './action-json-condition.component.html',
  styleUrls: ['./action-json-condition.component.scss']
})
export class ActionJsonConditionComponent implements OnInit {

  @ViewChild("addFilter", {static: false}) myPopover : SatPopover;
  
  @Input() action: ActionJsonCondition;
  @Input() listOfActions: Array<{name: string, value: string, icon?:string}>;

  actionJsonConditionFormGroup: FormGroup

  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.initialize();
    this.logger.log('[ACTION-JSON-CONDITION] actionnn-->', this.action)
    if (this.action) {
      this.setFormValue()
    }
  }

  private initialize() {
    this.actionJsonConditionFormGroup = this.buildForm();
    this.actionJsonConditionFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-JSON-CONDITION] form valueChanges-->', form)
      if(form && (form.trueIntent !== '' || form.falseIntent !== '' ||  form.stopOnConditionMet !== '')){
        this.action.trueIntent = this.actionJsonConditionFormGroup.value.trueIntent
        this.action.falseIntent = this.actionJsonConditionFormGroup.value.falseIntent
        this.action.stopOnConditionMet = this.actionJsonConditionFormGroup.value.stopOnConditionMet
        // this.action = Object.assign(this.action, this.actionJsonConditionFormGroup.value)
      }
    })
  }

  private setFormValue(){
    this.actionJsonConditionFormGroup.patchValue({
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent,
      stopOnConditionMet: this.action.stopOnConditionMet,
      // groups: this.action.groups,
    })
  }

  buildForm(): FormGroup{
    return this.formBuilder.group({
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required],
      stopOnConditionMet: [false, Validators.required],
      // groups: this.formBuilder.array([
      //   this.createExpressionGroup(),
      //   // this.createOperatorGroup()
      // ]) 
    })
  }

  createExpressionGroup(): FormGroup{
    return this.formBuilder.group({
      type:["expression", Validators.required],
      conditions: this.formBuilder.array([
        // this.createConditionGroup(), this.createOperatorGroup()
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

    this.logger.log('onClickAddGroup-->', this.action)
    // let groups = this.actionJsonConditionFormGroup.get('groups') as FormArray
    // groups.push(this.createOperatorGroup(), {emitEvent: false})
    // groups.push(this.createExpressionGroup(), {emitEvent: false})
  }

  onDeleteGroup(index: number, last: boolean){
    this.logger.log('onDeleteGroup', index, last, this.action.groups)
    if(!last){
      this.action.groups.splice(index, 2)
    }else if(last){
      this.action.groups.splice(index-1, 2)
    }
    

    if(this.action.groups.length === 0){
      this.action.groups.push(new Expression())
      // let groups = this.actionJsonConditionFormGroup.get('groups') as FormArray
      // groups.push(this.createExpressionGroup(), {emitEvent: false})
    }
  }

  onChangeOperator(event, index: number){
    (this.action.groups[index] as Operator).operator= event['type']
    this.logger.log('onChangeOperator actionsss', this.action, this.actionJsonConditionFormGroup)
  }

  onChangeForm(event:{name: string, value: string}, type){
    this.action[type]=event.value
  }

}
