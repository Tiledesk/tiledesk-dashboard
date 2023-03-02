import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { ActionHideMessage } from 'app/models/intent-model';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'cds-action-hide-message',
  templateUrl: './action-hide-message.component.html',
  styleUrls: ['./action-hide-message.component.scss']
})
export class ActionHideMessageComponent implements OnInit {


  @Input() action: ActionHideMessage;
  
  actionHideMessageFormGroup: FormGroup;

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void { 
  }

  ngOnChanges(){
    this.initialize()
    if(this.action && this.action.text){
      this.setFormValue()
    }
  }

  private initialize(){
    this.actionHideMessageFormGroup = this.buildForm();
    this.actionHideMessageFormGroup.valueChanges.subscribe(form => {
      // console.log('[ACTION-HIDE-MESSAGE] form valueChanges-->', form)
      if(form && (form.text !== ''))
        this.action = Object.assign(this.action, this.actionHideMessageFormGroup.value);
    })
  }


  buildForm(): FormGroup{
    return this.formBuilder.group({
      text: ['', Validators.required]
    })
  }

  setFormValue(){
    this.actionHideMessageFormGroup.patchValue({
      text: this.action.text,
    })
  }

}
