import { ContactsService } from './../../services/contacts.service';
import { BasetriggerComponent } from './../basetrigger/basetrigger.component';
import { Trigger } from './../../models/trigger-model';
import { NotifyService } from 'app/core/notify.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// USED FOR go back last page
import { Location } from '@angular/common';

import { TriggerService } from 'app/services/trigger.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DepartmentService } from './../../services/mongodb-department.service';


@Component({
  selector: 'appdashboard-trigger-edit',
  templateUrl: './trigger-edit.component.html',
  styleUrls: ['./trigger-edit.component.scss']
})
export class TriggerEditComponent extends BasetriggerComponent implements OnInit {

  showSpinner = true;

  triggeriD: string;

  // condition: any;           --> get from BaseTriggerComponent
  // options: any;             --> get from BaseTriggerComponent
  // action: any;              --> get from BaseTriggerComponent
  // departments = new Array;  --> get from BaseTriggerComponent

  conditionType = 'conditions.all';
  temp_cond: any;
  temp_act: any;
  // operator: any;           --> get from BaseTriggerComponent

  triggerForm: FormGroup;
  conditions: FormArray;
  any: FormArray;
  all: FormArray;
  actions: FormArray;

  displayMODAL_Window = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  SHOW_ERROR_CROSS = false;
  IS_VALID: boolean;
  errorMESSAGE: boolean;
  errorMESSAGE_server: boolean;
  submitted = false;

  // messageCondition: string;    --> get from BaseTriggerComponent
  // messageAction: string;       --> get from BaseTriggerComponent
  // messageServerError: string;  --> get from BaseTriggerComponent

  constructor(private route: ActivatedRoute,
    private _location: Location,
    private formBuilder: FormBuilder,
    private triggerService: TriggerService,
    public departmentService: DepartmentService,
    private notify: NotifyService,
    public translate: TranslateService) {
      super(translate, departmentService)
  }

  ngOnInit() {

    this.triggerForm = this.formBuilder.group({
      _id: '',
      name: ['', Validators.required],
      description: ['', Validators.required],
      trigger: this.formBuilder.group({
        key: [''],
        name: ['']
      }),
      conditionALL_ANY: '',
      conditions: this.formBuilder.group({
        any: this.formBuilder.array([this.createCondition()]),
        all: this.formBuilder.array([this.createCondition()]),
      }),
      actions: this.formBuilder.array([this.createAction()]),
      enabled: true
    });

    this.triggeriD = this.route.snapshot.params['triggerId'];
    this.triggerService.getTriggerById(this.triggeriD).subscribe((triggerDetail: any) => {
      console.log('trigger DETAIL RESPONSE', triggerDetail);

      this.setFormValue(triggerDetail)

    }, (error) => {
      console.log('»» !!! TRIGGER -  GET TRIGGER DETAIL REQUESTS  - ERROR ', error);
      this.notify.showNotification(this.messageServerError, 4, 'report_problem')
      this.showSpinner = false;
    }, () => {
      console.log('»» !!! TRIGGER -  GET TRIGGER DETAIL REQUESTS  - COMPLETED ');
      this.showSpinner = false
    });

    this.temp_act = this.action
    console.log('form', this.triggerForm.value)

  }

  setFormValue(trigger: Trigger): void {
    console.log('TRIGGER_detail', trigger);

    // check whitch array of conditions exist
    if (Array.isArray(trigger.conditions.all) && trigger.conditions.all.length) {
      console.log('all conditions exist')
      this.triggerForm.patchValue({ conditionALL_ANY: 'all' })
      this.conditionType = 'conditions.all'
    } else {
      this.triggerForm.patchValue({ conditionALL_ANY: 'any' })
      this.conditionType = 'conditions.any'
    }

    // set the value of trigger selected
    this.triggerForm.patchValue({
      _id: trigger._id,
      name: trigger.name,
      description: trigger.description,
      trigger: {
        key: trigger.trigger.key,
        name: trigger.trigger.name
      },
      conditionALL_ANY: this.conditionType.split('.')[1],
      conditions: {},
      actions: [],
      enabled: trigger.enabled
    });

    // check if trigger has no condition array element
    // if it hasn't at least one element, add empty one with createCondition() method
    // ( i don't need to check same info for action array because user must perform at least one action)
    if (trigger.conditions[this.conditionType.split('.')[1]].length !== 0) {
      // add conditions to formValue depending on conditionAll_ANY value:
      // -conditionsGROUP is all the condition.any/all array taken from trigger service value.
      //  next is added the type field for each array to build the html input/dropdown depending on this value type
      // -conditions_array is a new formbuilder array with the value of conditionsGROUP
      // -cond_triggerFormNewArray is a variable that help to add controls (see line after) to
      //  triggerForm with che value of conditions_array
      const conditionsGROUP = trigger.conditions[this.conditionType.split('.')[1]]
        .map(cond => this.formBuilder.group({
          fact: cond.fact,
          operator: cond.operator,
          path: cond.path,
          value: cond.value,
          key: cond.key,
          type: this.condition.filter(b => b.triggerType === trigger.trigger.key).filter(c => c.key === cond.key)[0].type
        }))

      console.log('condition.filter', this.condition.filter(b => b.triggerType === trigger.trigger.key))
      console.log('aaaaaaaaaaaaa', this.condition.filter(a => a.triggerType === trigger.trigger.key).filter(b => b.key === trigger.conditions[this.conditionType.split('.')[1]][0].key));
      const conditions_array = this.formBuilder.array(conditionsGROUP)
      const cond_triggerFormNewArray = this.triggerForm.get('conditions') as FormGroup
      cond_triggerFormNewArray.setControl(this.conditionType.split('.')[1], conditions_array)
    } else {
      this.createCondition()
    }

    // (same as conditions) After mapping trigger.condition to custom formBuilder group,
    // and create a fromBuilder array of actionsGroup, this array is added to triggerForm
    // with a new Control (setControl() )
    const actionsGROUP = trigger.actions.map(act => this.formBuilder.group({
      key: act.key,
      parameters: this.formBuilder.group({
        fullName: act.parameters.fullName,
        text: act.parameters.text
      }),
      type: this.action.filter(b => b.key === act.key)[0].type,
      placeholder: this.action.filter(b => b.key === act.key)[0].placeholder
    }))
    const actions_array = this.formBuilder.array(actionsGROUP)
    this.triggerForm.setControl('actions', actions_array)

    this.temp_cond = this.condition.filter(b => b.triggerType === trigger.trigger.key);

  }

  createCondition(): FormGroup {

    return this.formBuilder.group({
      fact: 'fact',
      path: [undefined, Validators.required],
      operator: [undefined, Validators.required],
      value: [undefined, Validators.required],
      type: undefined,
      key: undefined,
      placeholder: undefined
    })

  }

  createAction(): FormGroup {

    return this.formBuilder.group({
      key: [undefined, Validators.required],
      parameters: this.formBuilder.group({
        fullName: [undefined, Validators.required],
        text: [undefined, Validators.required]
      }),
      type: undefined, // change value to undefined if added multiple actions next
      placeholder: undefined
    })
  }

  addConditions(): void {
    console.log('Add NEW CONDITIONS ARRAY');
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;
    this.conditions.push(this.createCondition());
  }
  removeCondition(rowIndex: number): void {
    console.log('Remove CONDITION ARRAY with index:', rowIndex);
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;
    if (this.conditions.length === 1 && rowIndex === 0) {
      this.notify.showNotification(this.messageCondition, 4, 'report_problem');
    } else {
      this.conditions.removeAt(rowIndex);
    }

  }

  addActions(): void {
    console.log('Add NEW CONDITIONS ARRAY');
    this.actions = this.triggerForm.get('actions') as FormArray;
    this.actions.push(this.createAction());
  }
  removeAction(rowIndex: number): void {
    console.log('Remove CONDITION ARRAY with index:', rowIndex);
    this.actions = this.triggerForm.get('actions') as FormArray;
    // check if exist at least 1 action to do for trigger
    if (this.actions.length === 1 && rowIndex === 0) {
      this.notify.showNotification(this.messageAction, 4, 'report_problem');
    } else {
      this.actions.removeAt(rowIndex);
    }

  }

  onEnableDisable(status: boolean) {
    console.log('trigger status:', status)
    this.triggerForm.controls['enabled'].setValue(status);
  }
  swithOnOff($event) {
    console.log('trigger status', $event.target.checked)
    this.triggerForm.controls['enabled'].setValue($event.target.checked);
  }

  // get dropdown ANY/ALL condition value
  conditionTriggerValue(value) {

    // this.temp_cond = this.condition;
    // this.temp_act = this.action;
    this.conditionType = 'conditions.' + value;
    console.log('Cond-value', this.conditionType);

    // reset condition formArray value: delete all the index from 1  to conditions.length and
    // finally clear the value of first index array
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;

    if (this.conditions.length !== null) {
      for (let i = 1; i < this.conditions.length; i++) {
        this.conditions.removeAt(i);
      }
      this.conditions.reset();
    } else {
      this.conditions.reset();
    }
  }

  onTriggerKey(value) {

    // reset condition formArray value: delete all the index from 1  to conditions.length and
    // finally clear the value of first index array
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;

    if (this.conditions.length !== null) {
      for (let i = 1; i < this.conditions.length; i++) {
        this.conditions.removeAt(i);
      }
      this.conditions.reset();
    } else {
      this.conditions.reset();
    }

    console.log('Trigger key:', value);
    if (value) {
      this.temp_cond = this.condition.filter(b => b.triggerType === value);
    } else {
      this.temp_cond = this.condition.filter(b => b.triggerType === 'message.received');
    }
    console.log('temp_cond', this.temp_cond);
  }


  onSelectedCondition($event: any, condition: FormGroup) {
    this.submitted = false; // allow to reset errorMsg on screen
    console.log('VALUE', $event);

    console.log('condition before', condition)
    // set current value of selectedCondition filtering condition array by unique key : key
    // set conditionFormArray by using selectedCondition value:
    // - type , operator, key, placeholder
    const selectedCondition = this.condition.filter(b => b.key === $event.key)[0]
    condition.patchValue({
      'type': selectedCondition.type,
      'operator': this.options[selectedCondition.type + 'Opt'][0].id,
      'value': undefined,
      'key': selectedCondition.key,
      'placeholder': selectedCondition.placeholder
    });
    console.log('condition after', condition);

  }

  onSelectedAction(event, action) {
    console.log('VALUE', event)

    console.log('action before', action);
    // set value of second and third dropdown action section and set it's placeholder value for selected action
    action.patchValue({
      'type': this.action.filter(b => b.key === event)[0].type,
      'placeholder': this.action.filter(b => b.key === event)[0].placeholder,
      'parameters': {
        'fullName': undefined,
        'text': ' '
      }
    });
    console.log('action after', action);
  }

  get form() { return this.triggerForm.controls }

  onSubmit() {

    console.log('get form', this.form);

    this.displayMODAL_Window = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;
    this.errorMESSAGE = false;
    this.errorMESSAGE_server = false;

    this.submitted = true;

    // delete the not choice conditionType array in triggerForm.conditions
    if (this.conditionType.split('conditions.')[1] === 'all') {
      delete this.triggerForm.value.conditions.any
    } else {
      delete this.triggerForm.value.conditions.all
    }
    // set value of all conditons.any/all.fact to 'json'
    // for ( let i = 0; i < this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]].length; i++) {
    //   this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i].fact = 'json'
    // }

    // control validator for conditions.all/any elements
    const conditionsGROUP = this.triggerForm.get(this.conditionType) as FormGroup


    // controls name validation
    if (this.triggerForm.controls['name'].invalid) {

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

      // check at least one action is selected
    } else if (this.triggerForm.controls['actions'].invalid) {
      console.log('action validator', this.triggerForm.controls['actions']);

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

      // check condition validation and if first dropdawn has value than other ones has a valid value
    } else if (conditionsGROUP.invalid && conditionsGROUP.controls[0].value['path'] !== null) {

      console.log('User selected only some dropdown condition but not all. SUMBIT KO')

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

    } else {
      // ALL FIELD IS CORRECTLY ADDED

      // add trigger.name value
      if (this.triggerForm.value.trigger.key === 'message.received') {
        this.triggerForm.value.trigger.name = 'message create event';
      } else if (this.triggerForm.value.trigger.key === 'request.create') {
        this.triggerForm.value.trigger.name = 'request create event';
      }
      else if (this.triggerForm.value.trigger.key === 'user.login') {
        this.triggerForm.value.trigger.name = 'user.login event';
      }
      else if (this.triggerForm.value.trigger.key === 'event.emit') {
        this.triggerForm.value.trigger.name = 'event emit';
      
      }else {
        this.triggerForm.value.trigger.name = '';
      }


      // add empty condition array for required server field request
      // if contidion[any/all].path is null
      if (conditionsGROUP.controls[0].value['path'] === null) {
        this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]] = [];
      }

      this.triggerService.updateTrigger(this.triggerForm.value).subscribe(res => {
        console.log('UPDATE trigger...', res);
      }, (error) => {
        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false
          this.SHOW_ERROR_CROSS = true;
          this.errorMESSAGE_server = true;
        }, 1000);
        console.log('»» !!! TRIGGER -  UPDATE TRIGGER REQUESTS  - ERROR ', error);

      }, () => {
        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false;
          this.SHOW_ERROR_CROSS = false;
        }, 1000);
        console.log('»» !!! TRIGGER -  UPDATE NEW TRIGGER REQUESTS * COMPLETE *');

      });
    }

    console.log('TRIGGER', this.triggerForm.value);
  }

  // modal button CONTINUE
  onCloseModalHandled() {
    console.log('CONTINUE PRESSED ');

    if (this.errorMESSAGE || this.errorMESSAGE_server) {

      console.log('Error occured. Return to current page')

    } else { this._location.back(); }
    this.displayMODAL_Window = 'none';

  }

  // modal icon X
  onCloseModal() {
    this.displayMODAL_Window = 'none';
  }

  goBack() {
    this._location.back();
  }



}
