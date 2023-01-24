import { ActionOnlineAgent } from './../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-online-agents',
  templateUrl: './action-online-agents.component.html',
  styleUrls: ['./action-online-agents.component.scss']
})
export class ActionOnlineAgentsComponent implements OnInit {

  @Input() listOfActions: string[];
  @Input() action: ActionOnlineAgent;

  actionOnlineAgentsFormGroup: FormGroup
  
  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService,) { }

  ngOnInit(): void {
    this.actionOnlineAgentsFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-ONLINE-AGENT] form valueChanges-->', form)
      if(form && (form.trueIntent !==''))
        this.action = Object.assign(this.action, this.actionOnlineAgentsFormGroup.value);
    })
  }

  ngOnChanges(){
    this.actionOnlineAgentsFormGroup = this.buildForm();
    if(this.action && this.action.trueIntent){
      this.setFormValue();
      this.ngOnInit();
    }
    
  }


  buildForm(): FormGroup{
    return this.formBuilder.group({
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required]
    })
  }

  setFormValue(){
    this.actionOnlineAgentsFormGroup.patchValue({
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent
    })
  }

}
