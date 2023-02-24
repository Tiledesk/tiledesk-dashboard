import { ActionAssignVariable } from './../../../../../models/intent-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-assign-variable',
  templateUrl: './action-assign-variable.component.html',
  styleUrls: ['./action-assign-variable.component.scss']
})
export class ActionAssignVariableComponent implements OnInit {

  @Input() action: ActionAssignVariable;

  actionAssignFormGroup: FormGroup;
  variables: Array<string> = []
  hasSelectedVariable: boolean = false

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.initialize()
    if (this.action && this.action.assignTo) {
      this.setFormValue()
      this.hasSelectedVariable = true
    }

  }

  private initialize() {
    this.actionAssignFormGroup = this.buildForm();
    this.actionAssignFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-ASSIGN-VARIABLE] form valueChanges-->', form)
      if (form && (form.assignTo !== '' || form.expression !== ''))
        this.action = Object.assign(this.action, this.actionAssignFormGroup.value);
    })
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      expression: ['', Validators.required],
      assignTo: ['', [Validators.required, Validators.pattern(new RegExp(/^[a-zA-Z_]*[a-zA-Z_]+[a-zA-Z0-9_]*$/gm))]]
    })
  }

  setFormValue() {
    this.actionAssignFormGroup.patchValue({
      expression: this.action.expression,
      assignTo: this.action.assignTo
    })
  }

  clearInput(){
    this.actionAssignFormGroup.get('assignTo').reset()
    this.hasSelectedVariable = false
  }


  onVariableSelected(variableSelected: {name: string, value: string}, step: number){
    this.logger.log('onVariableSelected-->', step, this.actionAssignFormGroup, variableSelected)
    this.hasSelectedVariable = true
    this.actionAssignFormGroup.patchValue({ assignTo: variableSelected.value})// if(step === 0){
    //   this.conditionForm.patchValue({ operand1: variableSelected.value}, {emitEvent: false})
    //   this.step +=1
    // }else if (step == 1){
    //   // this.conditionForm.patchValue({ operand2: {type: 'var', name: variableSelected.name}}, {emitEvent: false})
    //   // this.logger.log('formmmmm', this.conditionForm)
    // }
  }

}
