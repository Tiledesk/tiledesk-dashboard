import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { ActionHideMessage } from 'app/models/intent-model';

@Component({
  selector: 'cds-action-hide-message',
  templateUrl: './action-hide-message.component.html',
  styleUrls: ['./action-hide-message.component.scss']
})
export class ActionHideMessageComponent implements OnInit {


  @Input() action: ActionHideMessage;
  
  actionHideMessageFormGroup: FormGroup;
  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService) { }

  ngOnInit(): void {
    this.actionHideMessageFormGroup.valueChanges.subscribe(form => {
      // console.log('[ACTION-HIDE-MESSAGE] form valueChanges-->', form)
      if(form && (form.text !== ''))
        this.action = Object.assign(this.action, this.actionHideMessageFormGroup.value);
    })
  }

  ngOnChanges(){
    this.actionHideMessageFormGroup = this.buildForm();
    if(this.action && this.action.text){
      this.setFormValue()
    }

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
