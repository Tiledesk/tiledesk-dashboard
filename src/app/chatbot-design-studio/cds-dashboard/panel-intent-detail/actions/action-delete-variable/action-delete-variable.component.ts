import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { variableList } from 'app/chatbot-design-studio/utils';
import { ActionDeleteVariable } from 'app/models/intent-model';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'cds-action-delete-variable',
  templateUrl: './action-delete-variable.component.html',
  styleUrls: ['./action-delete-variable.component.scss']
})
export class ActionDeleteVariableComponent implements OnInit {

  @Input() action: ActionDeleteVariable;

  actionDeleteFormGroup: FormGroup;
  variableListUserDefined: Array<{name: string, value: string}> = variableList.userDefined 
  
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.initialize();
    if (this.action && this.action.variableName) {
      this.setFormValue();
    }
  }

  private initialize() {
    this.actionDeleteFormGroup = this.buildForm();
    this.actionDeleteFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-DELETE-VARIABLE] form valueChanges-->', form)
      if (form && ( form.variableName !== ''))
        this.action = Object.assign(this.action, this.actionDeleteFormGroup.value);
    })
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      variableName: ['', Validators.required]
    })
  }

  setFormValue() {
    this.actionDeleteFormGroup.patchValue({
      variableName: this.action.variableName,
    })
  }

  onChangeSelect(variableSelected: {name: string, value: string}){
    this.logger.log('changeeeeee', variableSelected)
    this.actionDeleteFormGroup.patchValue({variableName: variableSelected.value})
  }

}
