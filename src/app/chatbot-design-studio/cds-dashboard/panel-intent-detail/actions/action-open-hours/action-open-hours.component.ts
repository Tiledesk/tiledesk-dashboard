import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionOpenHours } from './../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-open-hours',
  templateUrl: './action-open-hours.component.html',
  styleUrls: ['./action-open-hours.component.scss']
})
export class ActionOpenHoursComponent implements OnInit {

  @Input() listOfActions: string[];
  @Input() action: ActionOpenHours;

  actionOpenHoursFormGroup: FormGroup
  
  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService,) { }

  ngOnInit(): void {
    this.actionOpenHoursFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-OPEN-HOURS] form valueChanges-->', form)
      if(form && (form.trueIntent !==''))
        this.action = Object.assign(this.action, this.actionOpenHoursFormGroup.value);
    })
  }

  ngOnChanges(){
    this.actionOpenHoursFormGroup = this.buildForm();
    if(this.action && this.action.trueIntent){
      this.setFormValue()
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
    this.actionOpenHoursFormGroup.patchValue({
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent
    })
  }

}
