import { ActionCondition } from './../../../../../models/intent-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Console } from 'console';
import { LoggerService } from 'app/services/logger/logger.service';
import { throwDialogContentAlreadyAttachedError } from '@angular/cdk/dialog';

@Component({
  selector: 'cds-action-condition',
  templateUrl: './action-condition.component.html',
  styleUrls: ['./action-condition.component.scss']
})
export class ActionConditionComponent implements OnInit {
  
  @Input() listOfActions: string[];
  @Input() action: ActionCondition;

  actionConditionFormGroup: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private logger: LoggerService,) { }

  ngOnInit(): void {  
  }

  ngOnChanges(){
    this.initialize()
    if(this.action && this.action.condition){
      this.setFormValue()
    }
  }

  ngOnDestroy(){
    console.log('component destroyeddddd')
  }

  private initialize(){
    this.actionConditionFormGroup = this.buildForm();
    this.actionConditionFormGroup.valueChanges.subscribe(form => {
      console.log('[ACTION-CONDITION] form valueChanges-->', form)
      if(form && (form.condition !== '' || form.trueIntent !==''))
        this.action = Object.assign(this.action, this.actionConditionFormGroup.value);
    })
  }


  buildForm(): FormGroup{
    return this.formBuilder.group({
      condition: ['', Validators.required],
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required]
    })
  }

  setFormValue(){
    this.actionConditionFormGroup.patchValue({
      condition: this.action.condition,
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent
    })
  }


}
