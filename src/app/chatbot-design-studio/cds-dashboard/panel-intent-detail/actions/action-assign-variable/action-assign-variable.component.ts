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

  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService,) { }

  ngOnInit(): void {
    this.actionAssignFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-ASSIGN-VARIABLE] form valueChanges-->', form)
      if(form && (form.assignTo !== '' || form.expression !==''))
        this.action = Object.assign(this.action, this.actionAssignFormGroup.value);
    })
  }

  ngOnChanges(){
    this.actionAssignFormGroup = this.buildForm();
    if(this.action && this.action.assignTo){
      this.setFormValue()
    }
    
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
