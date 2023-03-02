import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionOpenHours } from './../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'cds-action-open-hours',
  templateUrl: './action-open-hours.component.html',
  styleUrls: ['./action-open-hours.component.scss']
})
export class ActionOpenHoursComponent implements OnInit {

  @Input() listOfActions: Array<{name: string, value: string, icon?:string}>;
  @Input() action: ActionOpenHours;

  actionOpenHoursFormGroup: FormGroup

  private logger: LoggerService = LoggerInstance.getInstance();
  
  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.initialize()
    if (this.action && this.action.trueIntent) {
      this.setFormValue()
    }
  }

  private initialize() {
    this.actionOpenHoursFormGroup = this.buildForm();
    this.actionOpenHoursFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-OPEN-HOURS] form valueChanges-->', form)
      if (form && (form.trueIntent !== ''))
        this.action = Object.assign(this.action, this.actionOpenHoursFormGroup.value);
    })
  }


  buildForm(): FormGroup {
    return this.formBuilder.group({
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required]
    })
  }

  setFormValue() {
    this.actionOpenHoursFormGroup.patchValue({
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent
    })
  }

  onChangeSelect(event:{name: string, value: string}, type){
    this.action[type]=event.value
  }

}
