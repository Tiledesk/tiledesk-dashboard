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
  variables: Array<string>= []

  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService,) { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    this.initialize()
    if(this.action && this.action.assignTo){
      this.setFormValue()
    }
    
  }

  private initialize(){
    this.actionAssignFormGroup = this.buildForm();
    this.actionAssignFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-ASSIGN-VARIABLE] form valueChanges-->', form)
      if(form && (form.assignTo !== '' || form.expression !==''))
        this.action = Object.assign(this.action, this.actionAssignFormGroup.value);
    })
  }
  
  buildForm(): FormGroup{
    return this.formBuilder.group({
      expression: ['', Validators.required],
      assignTo: ['', Validators.required]
    })
  }

  setFormValue(){
    this.actionAssignFormGroup.patchValue({
      expression: this.action.expression,
      assignTo: this.action.assignTo
    })
  }

}
