import { ContactsService } from './../../services/contacts.service';
import { BasetriggerComponent } from './../basetrigger/basetrigger.component';
import { Trigger } from './../../models/trigger-model';
import { NotifyService } from 'app/core/notify.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// USED FOR go back last page
import { Location } from '@angular/common';

import { TriggerService } from 'app/services/trigger.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DepartmentService } from '../../services/department.service';
import { UsersService } from '../../services/users.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { LoggerService } from '../../services/logger/logger.service';
import { browserRefresh } from './../../app.component';
import { AuthService } from 'app/core/auth.service';

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

  actionsGROUP: any;
  selectedConditions: any;
  loadingActions: boolean;

  IS_PRE_BUILT_TRIGGER = false;
  PRE_BUILT_TRIGGER_CODE: string;
  resetSettingModal = 'none'
  HAS_CLICKED_RESET_SETTINGS: boolean;
  RESET_SETTINGS_HAS_ERROR = false;
  RESET_SETTINGS_COMPLETED = false;
  action_clone: any
  public browserRefresh: boolean;
  isChromeVerGreaterThan100: boolean;
  // messageCondition: string;    --> get from BaseTriggerComponent
  // messageAction: string;       --> get from BaseTriggerComponent
  // messageServerError: string;  --> get from BaseTriggerComponent

  constructor(
    private route: ActivatedRoute,
    private _location: Location,
    private formBuilder: FormBuilder,
    private triggerService: TriggerService,
    public departmentService: DepartmentService,
    private notify: NotifyService,
    public translate: TranslateService,
    public usersService: UsersService,
    public faqKbService: FaqKbService,
    public logger: LoggerService,
    private auth: AuthService
  ) {
    super(translate, departmentService, usersService, faqKbService, logger)
  }

  ngOnInit() {
    super.ngOnInit()
    this.detectBrowserRefresh();
    this.selectedConditions = "request.statusRequestStatus"
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

    // -------------------------------------------------------------------
    // Get trigger by id
    // -------------------------------------------------------------------
    this.triggerService.getTriggerById(this.triggeriD).subscribe((triggerDetail: any) => {
      this.logger.log('[TRIGGER-EDIT] >>> ON INIT GET TRIGGER BY ID RES ', triggerDetail);

      if (this.action) {
        this.action_clone = JSON.parse(JSON.stringify(this.action))
        this.logger.log('[TRIGGER-EDIT] >>> ON INIT action_clone ', this.action_clone);
      }

      // ---------------------------------------------------------------------------------------------------------------------
      // the filter that excludes "Launch bot" from the selectable actions is applied only for the "keys" of 
      // the trigger other than "request.create" as the trigger selected for the modification could have 
      // as "key" "request.create" and action " Launch bot"
      // ---------------------------------------------------------------------------------------------------------------------
      if (triggerDetail.trigger.key !== 'request.create') {
        if (this.action) {
          var filtered = this.action.filter((actoinObjct) => {
            // console.log('[TRIGGER-EDIT] .action.filter actoinObjct', actoinObjct)
            return actoinObjct.key !== 'request.bot.launch';
          });
        }
        this.action = filtered;
        this.temp_act = this.action
        // console.log('[TRIGGER-EDIT] >>> ON INIT filtered action ', this.action)
      }

      // -------------------------------------------------------------------
      // If exist the property 'code' display the button 'reset to defaults'
      // -------------------------------------------------------------------
      if (triggerDetail.code) {
        this.IS_PRE_BUILT_TRIGGER = true;
        this.PRE_BUILT_TRIGGER_CODE = triggerDetail.code;
      }

      this.setFormValue(triggerDetail)

    }, (error) => {
      this.logger.error('[TRIGGER-EDIT] -  GET TRIGGER DETAIL REQUESTS  - ERROR ', error);
      this.notify.showNotification(this.messageServerError, 4, 'report_problem')
      this.showSpinner = false;
    }, () => {
      this.logger.log('[TRIGGER-EDIT] GET TRIGGER DETAIL REQUESTS  - COMPLETED ');
      this.showSpinner = false
    });

    this.temp_act = this.action
    this.logger.log('[TRIGGER-EDIT] GET TRIGGER DETAIL temp_act ', this.temp_act);
    this.logger.log('form', this.triggerForm.value)
    this.getBrowserVersion()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }

  detectBrowserRefresh() {
    this.logger.log('[TRIGGER-EDIT] - CALLING browserRefresh')
    this.browserRefresh = browserRefresh;

    if (this.browserRefresh) {
      this._location.back();
    }
  }

  openModalConfirmResetSettings() {
    this.HAS_CLICKED_RESET_SETTINGS = null;
    this.RESET_SETTINGS_COMPLETED = false;
    this.resetSettingModal = 'block'
  }

  closeResetSettingsModal() {
    this.resetSettingModal = 'none'
  }

  resetSettings() {
    this.HAS_CLICKED_RESET_SETTINGS = true;
    this.triggerService.resetPreBuiltTriggerToDefault(this.PRE_BUILT_TRIGGER_CODE).subscribe((defaulttrigger: any) => {
      this.logger.log('[TRIGGER-EDIT] ->>>>> RESET TRIGGER RES ', defaulttrigger);

      this.setFormValue(defaulttrigger);

    }, (error) => {
      this.logger.error('[TRIGGER-EDIT] - RESET TRIGGER  - ERROR ', error);
      this.RESET_SETTINGS_HAS_ERROR = true;
      this.RESET_SETTINGS_COMPLETED = true;

    }, () => {
      this.logger.log('[TRIGGER-EDIT] -  RESET TRIGGER  - COMPLETED ');
      this.RESET_SETTINGS_HAS_ERROR = false;
      this.RESET_SETTINGS_COMPLETED = true;

    });

  }

  // -------------------------------------------------------------
  // SET FORM VALUE
  // -------------------------------------------------------------
  setFormValue(trigger: Trigger): void {
    this.logger.log('[TRIGGER-EDIT] - setFormValue TRIGGER', trigger);

    // check whitch array of conditions exist
    if (Array.isArray(trigger.conditions.all) && trigger.conditions.all.length) {
      this.logger.log('[TRIGGER-EDIT] setFormValue all conditions exist')
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
      const conditionsGROUP = trigger.conditions[this.conditionType.split('.')[1]]
        .map(cond => {
          this.logger.log("***** COND: ", cond.value);

          this.default_dept_id = cond.value;

          return this.formBuilder.group({
            fact: cond.fact,
            operator: cond.operator,
            path: cond.path,
            value: cond.value,
            key: cond.key,
            type: this.condition.filter(b => b.triggerType === trigger.trigger.key).filter(c => c.key === cond.key)[0].type
          })
        })

      this.logger.log('[TRIGGER-EDIT] - setFormValue - conditionsGROUP', conditionsGROUP)
      this.logger.log('[TRIGGER-EDIT] - setFormValue - All condition array (condition.filter)', this.condition.filter(b => b.triggerType === trigger.trigger.key))
      this.logger.log('[TRIGGER-EDIT] - setFormValue - Found condition', this.condition.filter(a => a.triggerType === trigger.trigger.key).filter(b => b.key === trigger.conditions[this.conditionType.split('.')[1]][0].key));

      const conditions_array = this.formBuilder.array(conditionsGROUP);

      const cond_triggerFormNewArray = this.triggerForm.get('conditions') as FormGroup

      cond_triggerFormNewArray.setControl(this.conditionType.split('.')[1], conditions_array)
      this.logger.log('[TRIGGER-EDIT] - setFormValue - cond_triggerFormNewArray', cond_triggerFormNewArray)

    } else {
      this.createCondition()
    }

    this.logger.log('[TRIGGER-EDIT] - setFormValue - TRIGGER-FORM ', this.triggerForm);
    this.logger.log('[TRIGGER-EDIT] - setFormValue - CONDITIONS: ', trigger.conditions);
    this.logger.log('[TRIGGER-EDIT] - setFormValue - ACTIONS: ', trigger.actions);


    this.actionsGROUP = trigger.actions
      .map(act => this.formBuilder.group({
        key: act.key,
        parameters: this.formBuilder.group({
          fullName: [this.doFullNameValue(act), Validators.required],
          text: [act.parameters === undefined ? ' ' : act.parameters.text, Validators.required],
        }),
        type: this.action.filter(b => b.key === act.key)[0].type,
        placeholder: this.action.filter(b => b.key === act.key)[0].placeholder
      }))


    // nk 
    // --------------------------------------------------------------------------------------------------------------------------------------------
    // Clear action parameters validators if the event is:
    // - request.department.route.self (i.e. 'Reassign to the same department')
    // - request.close (i.e. 'Close request')
    // - request.reopen (i.e. 'Reopen request') 
    // - request.participants.leave (i.e. 'Participant leave request')
    // - request.department.route
    // - request.status.update
    // - request.department.bot.launch
    // --------------------------------------------------------------------------------------------------------------------------------------------
    this.actionsGROUP.forEach(actions => {
      this.logger.log('[TRIGGER-EDIT] - setFormValue ->>>>> actionsGROUP actions value : ', actions.value);
      const parameters = actions.get('parameters')
      this.logger.log('[TRIGGER-EDIT] - setFormValue ->>>>> actionsGROUP actions parameters : ', parameters);
      if (
        (actions.value.key === 'request.department.route.self') ||
        (actions.value.key === 'request.close') ||
        (actions.value.key === 'request.reopen') ||
        (actions.value.key === 'request.participants.join') ||
        (actions.value.key === 'request.participants.leave') ||
        (actions.value.key === 'request.department.route') ||
        (actions.value.key === 'request.status.update') ||
        (actions.value.key === 'request.tags.add') ||
        (actions.value.key === 'request.department.bot.launch' ||
        (actions.value.key === 'request.bot.launch')
        )
      ) {
        for (const key in parameters.controls) {
          this.logger.log('[TRIGGER-EDIT] - setFormValue ->>>>> onSelectedAction - parameters.controls key: ', key);
          parameters.get(key).clearValidators();
          parameters.get(key).updateValueAndValidity();
        }
      }
    });
    this.logger.log('[TRIGGER-EDIT] - setFormValue - actionsGROUP: ', this.actionsGROUP);
    const actions_array = this.formBuilder.array(this.actionsGROUP)
    this.triggerForm.setControl('actions', actions_array)

    this.temp_cond = this.condition.filter(b => b.triggerType === trigger.trigger.key);
    this.logger.log('[TRIGGER-EDIT] - setFormValue - temp_cond: ', this.temp_cond);
  }



  doFullNameValue(act) {
    this.logger.log('[TRIGGER-EDIT] - setFormValue > doFullNameValue act: ', act);

    let fullNameValue = ''

    if (act.parameters) {
      // -------------------------------------------------
      // Parameters has the key fullName
      // -------------------------------------------------
      if (act.parameters.fullName) {
        return fullNameValue = act.parameters.fullName;
      }

      // --------------------------------------------------
      // Parameters has the key member instead of fullname 
      // --------------------------------------------------
      if (act.parameters.member) {
        if (act.parameters['member'].indexOf('bot_') === -1) {
          // console.log('[TRIGGER-EDIT] - setFormValue > use case Parameters has the key member instead act' )  
          return fullNameValue = act.parameters['member']
        }

        // if the value of member has the prefix 'bot_'
        if (act.parameters['member'].indexOf('bot_') !== -1) {
          // console.log('[TRIGGER-EDIT] - setFormValue > use case value of member has the prefix bot_' )  
          return fullNameValue = act.parameters['member'].slice(4)
        }
      }

      // --------------------------------------------------
      // Parameters has the key sender instead of fullname
      // --------------------------------------------------
      if (act.parameters.sender) {
        this.logger.log('[TRIGGER-EDIT] - setFormValue > doFullNameValue - action has parameter sender:', act.parameters.sender)

        if (act.parameters['sender'].indexOf('bot_') === -1) {
          return fullNameValue = act.parameters['sender']
        }

        // if the value of member has the prefix 'bot_'
        if (act.parameters['sender'].indexOf('bot_') !== -1) {
          return fullNameValue = act.parameters['sender'].slice(4)
        }
      }

      // -------------------------------------------------------
      // Parameters has the key departmentid instead of fullname 
      // -------------------------------------------------------
      if (act.parameters.departmentid) {
        return fullNameValue = act.parameters['departmentid']
      }

      // -------------------------------------------------------
      // Parameters has the key status instead of fullname 
      // -------------------------------------------------------
      if (act.parameters.status) {
        return fullNameValue = act.parameters['status']
      }


      // -------------------------------------------------------
      // Parameters has the key tag instead of fullname 
      // -------------------------------------------------------
      if (act.parameters.tag) {
        return fullNameValue = act.parameters['tag']
      }
    }


  }

  createCondition(): FormGroup {
    return this.formBuilder.group({
      fact: 'fact',
      path: [undefined, Validators.required],
      operator: [undefined, Validators.required],
      value: [undefined, Validators.required], //
      type: undefined,
      key: undefined,
      placeholder: undefined
    })
  }


  createAction(): FormGroup {
    return this.formBuilder.group({
      key: [undefined, Validators.required],
      parameters: this.formBuilder.group({
        fullName: [undefined, [Validators.required, Validators.minLength(1)]],
        text: [undefined, [Validators.required]]
      }),
      type: undefined, // change value to undefined if added multiple actions next
      placeholder: undefined
    })
  }

  addConditions(): void {
    this.logger.log('[TRIGGER-EDIT] - ADD NEW CONDITIONS ARRAY');
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;
    this.conditions.push(this.createCondition());
  }

  removeCondition(rowIndex: number): void {
    this.logger.log('[TRIGGER-EDIT] - REMOVE CONDITION ARRAY BY index:', rowIndex);
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;
    if (this.conditions.length === 1 && rowIndex === 0) {
      this.notify.showNotification(this.messageCondition, 4, 'report_problem');
    } else {
      this.conditions.removeAt(rowIndex);
    }
  }

  addActions(): void {
    this.logger.log('[TRIGGER-EDIT] - ADD NEW ACTION ARRAY');
    this.actions = this.triggerForm.get('actions') as FormArray;
    this.actions.push(this.createAction());
    // this.cleanForm()
  }

  removeAction(rowIndex: number): void {
    this.logger.log('[TRIGGER-EDIT] - REMOVE ACTION ARRAY BY index:', rowIndex);
    this.actions = this.triggerForm.get('actions') as FormArray;
    // check if exist at least 1 action to do for trigger
    if (this.actions.length === 1 && rowIndex === 0) {
      this.notify.showNotification(this.messageAction, 4, 'report_problem');
    } else {
      this.actions.removeAt(rowIndex);
    }
  }

  onEnableDisable(status: boolean) {
    this.logger.log('[TRIGGER-EDIT] - onEnableDisable - trigger status:', status)
    this.triggerForm.controls['enabled'].setValue(status);
  }

  swithOnOff($event) {
    this.logger.log('[TRIGGER-EDIT] - swithOnOff - trigger status', $event.target.checked)
    this.triggerForm.controls['enabled'].setValue($event.target.checked);
  }

  // get dropdown ANY/ALL condition value
  conditionTriggerValue(value) {
    this.conditionType = 'conditions.' + value;
    this.logger.log('[TRIGGER-EDIT] - CONDITION TYPE ', this.conditionType);

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

    this.logger.log('[TRIGGER-EDIT] - onTriggerKey - value:', value);
    if (value) {
      this.temp_cond = this.condition.filter(b => b.triggerType === value);
    } else {
      //this.temp_cond = this.condition.filter(b => b.triggerType === 'message.received');
      this.temp_cond = this.condition.filter(b => b.triggerType === 'message.create.from.requester');
    }

    // ---------------------------------------------------------------------------------------------------------------------
    // the action Launch bot is available for selection in the action combo box only for the trigger with key request.create
    // (displayed label in the "Run trigger" field: "When a visitor request a chat" )
    // ---------------------------------------------------------------------------------------------------------------------
    if (value !== 'request.create') {

      // console.log('[TRIGGER-ADD] value !== "request.create" action ', this.action)
      if (this.action) {
        var filtered = this.action.filter((actoinObjct) => {
          // console.log('[TRIGGER-ADD] .action.filter actoinObjct', actoinObjct)
          return actoinObjct.key !== 'request.bot.launch';
        });
        this.action = filtered
        // console.log('[TRIGGER-ADD] this.action filtered', this.action)
      }


      // ------------------------------------------------------------------------------
      // Set "message.send" as the default action when selecting another trigger 
      // in the "Run trigger" combo box if the trigger being edited has "request.create" 
      // as key and "request.bot.launch" as action
      // ------------------------------------------------------------------------------
      this.actions = this.triggerForm.get('actions') as FormArray;
      this.logger.log('[TRIGGER-EDIT] - onTriggerKey actions', this.actions);
      this.logger.log('[TRIGGER-EDIT] - onTriggerKey actions > this.actions.value[0].key', this.actions.value[0].key);

      if (this.actions.value[0].key === "request.bot.launch") {
        const init_act = this.triggerForm.get('actions') as FormArray
        init_act.patchValue([{
          'key': this.action[0].key,
          'type': this.action[0].type,
          'placeholder': this.action[0].placeholder
        }]);
        this.cleanFullnameControl();

        // for (let w = 0; w < this.triggerForm.value.actions.length; w++) { 
        //   this.logger.log('[TRIGGER-EDIT] - onTriggerKey actions > triggerForm.value.actions[w]', this.triggerForm.value.actions[w]);
        //   this.actions.removeAt(w);
        // }
      }

    } else if (value === "request.create") {
     
      // console.log('[TRIGGER-EDIT] action_clone', this.action_clone)
      this.action = this.action_clone;
    }


    // ------------------------------------------------------------------------------------
    // if user select NEW EVENT in run trigger the only action available is request.create
    // ------------------------------------------------------------------------------------
    if (value === 'event.emit') {
      this.actions = this.triggerForm.get('actions') as FormArray;
      this.logger.log('[TRIGGER-EDIT] - onTriggerKey actions', this.actions);

      if (this.actions.length !== null) {
        for (let i = 1; i < this.actions.length; i++) {
          this.actions.removeAt(i);
        }
        this.actions.reset();
      } else {
        this.actions.reset();
      }

      this.loadingActions = true;
      this.temp_act = this.action.filter(a => a.key === 'request.create');

      setTimeout(() => {
        this.loadingActions = false;
      }, 500);

    } else {
      this.temp_act = this.action
    }
    this.logger.log('[TRIGGER-EDIT] - onTriggerKey temp_cond', this.temp_cond);
  }

  cleanFullnameControl() {
    let action_controls = this.triggerForm.get('actions')['controls'][0]
    this.logger.log('[TRIGGER-EDIT] - onTriggerKey action_controls after patch', action_controls);
    let parameters_fullname_value = action_controls.controls['parameters'].value.fullName;
    this.logger.log('[TRIGGER-EDIT] - onTriggerKey action_controls > parameters_fullname_value after patch', parameters_fullname_value);
    action_controls.get('parameters')
    const action_parameters_fullname_control = action_controls.get('parameters.fullName')
    this.logger.log('[TRIGGER-EDIT] - onTriggerKey > action_parameters_fullname_control: ', action_parameters_fullname_control);
    action_parameters_fullname_control.setValue(null)
  }

  onSelectedCondition($event: any, condition: FormGroup) {
    // SEE COMMENT IN onSelectedAction in trigger.add.comp
    if (
      ($event.key === 'request.lead.attributes.departmentId') ||
      ($event.key === "request.department.name") ||
      ($event.key === 'message.attributes.departmentId')
    ) {
      this.getDepartments();
    }

    // to fix bug Expression has changed after it was checked. Previous value: 'ng-valid: false'. Current value: 'ng-valid: true'.
    // which occurs when I pass the id of the default department to ngModel
    // I removed a value required in createCondition () and put it on everyone else
    if ($event.key !== 'request.lead.attributes.departmentId' || $event.key !== "request.department.name") {
      // resolve bug Expression has changed after it was checked. Previous value: 'ng-valid: false'. Current value: 'ng-valid: true'.
      const value = condition.get('value')

      Validators.required(value)
      value.updateValueAndValidity();
    }

    this.submitted = false; // allow to reset errorMsg on screen
    this.logger.log('[TRIGGER-EDIT] - onSelectedCondition VALUE ($event) ', $event);
    this.logger.log('[TRIGGER-EDIT] - onSelectedCondition - condition before', condition)

    // set current value of selectedCondition filtering condition array by unique key : key
    // set conditionFormArray by using selectedCondition value:
    // - type , operator, key, placeholder
    const selectedCondition = this.condition.filter(b => b.key === $event.key)[0];
    this.logger.log('[TRIGGER-EDIT] - onSelectedCondition - selected Condition', selectedCondition)
    condition.patchValue({
      'path': selectedCondition.id, // nk added
      'type': selectedCondition.type,
      'operator': this.options[selectedCondition.type + 'Opt'][0].id,
      // value: undefined permette di visualizzare il placeholder della terza select
      // 'value': (selectedCondition.key.includes('department')) ? this.operator[selectedCondition.key][0].id: undefined, 
      'value': (selectedCondition.key === "message.request.department.name") ? this.operator[selectedCondition.key][0].id : undefined,
      'key': selectedCondition.key,
      'placeholder': selectedCondition.placeholder
    });
    this.logger.log('[TRIGGER-EDIT] onSelectedCondition - condition after', condition);

  }

  onSelectedAction(event, action) {
    this.logger.log('[TRIGGER-EDIT] - onSelectedAction ->>>>> EVENT', event)
    this.logger.log('[TRIGGER-EDIT] - onSelectedAction ->>>>> action before', action);

    // SEE COMMENT IN onSelectedAction in trigger.add.comp
    if ((event === 'request.create') || (event === 'request.department.route')) {
      this.getDepartments();
    }

    // nk 
    // --------------------------------------------------------------------------------------------------------------------------------------------
    // Clear action parameters validators if the event is:
    // - request.department.route.self (i.e. 'Reassign to the same department')
    // - request.close (i.e. 'Close request')
    // - request.reopen (i.e. 'Reopen request') 
    // - request.participants.join (i.e. Participant join request)
    // - request.participants.leave (i.e. 'Participant leave request')
    // - request.department.route
    // - request.status.update
    // - request.department.bot.launch
    // --------------------------------------------------------------------------------------------------------------------------------------------
    if (
      (event === 'request.department.route.self') ||
      (event === 'request.close') ||
      (event === 'request.reopen') ||
      (event === 'request.participants.join') ||
      (event === 'request.participants.leave') ||
      (event === 'request.department.route') ||
      (event === 'request.status.update') ||
      (event === 'request.tags.add') ||
      (event === 'request.department.bot.launch')
    ) {
      const parameters = action.get('parameters');
      this.logger.log('[TRIGGER-EDIT] - onSelectedAction - ACTIONS PARAMETER: ', parameters);

      for (const key in parameters.controls) {
        this.logger.log('[TRIGGER-EDIT] - onSelectedActionn  parameters.controls key: ', key);
        parameters.get(key).clearValidators();
        parameters.get(key).updateValueAndValidity();
      }
    } else {
      const parameters = action.get('parameters');
      for (const key in parameters.controls) {
        this.logger.log('[TRIGGER-EDIT] - onSelectedAction parameters.controls key: ', key);
        parameters.get(key).setValidators([Validators.required]);
        parameters.get(key).updateValueAndValidity();
      }
    }

    this.logger.log('[TRIGGER-EDIT] - onSelectedAction action before', action);
    // set value of second and third dropdown action section and set it's placeholder value for selected action
    action.patchValue({
      'type': this.action.filter(b => b.key === event)[0].type,
      'placeholder': this.action.filter(b => b.key === event)[0].placeholder,
      'parameters': {
        'fullName': (action.value.key === 'request.create' || action.value.key === 'request.department.route') ? this.operator[action.value.key][0].id : undefined,
        'text': event === 'request.create' || event === 'message.send' || event === 'email.send' ? '' : ' '
      }
    });
    this.logger.log('[TRIGGER-EDIT] - onSelectedAction ->>>>> action after', action);
    this.logger.log('[TRIGGER-EDIT] - onSelectedAction ->>>>> event', event);
    // if (event === 'request.create') {
    //   this.cleanForm()
    // }
  }

  public cleanForm() {
    this.logger.log('[TRIGGER-EDIT] - cleanForm ->>>>> HERE YES ');
    //  let actions =  this.triggerForm.get('actions');
    let action_controls = this.triggerForm.get('actions')['controls'][0]
    this.logger.log('[TRIGGER-EDIT] - cleanForm - TRIGGER FORM > ACTIONS CONTROLS: ', action_controls);
    let parameters_text_value = action_controls.controls['parameters'].value.text;
    action_controls.get('parameters')

    const action_parameters_text_control = action_controls.get('parameters.text')
    this.logger.log('[TRIGGER-EDIT] - cleanForm - TRIGGER FORM > action_parameters_text_control: ', action_parameters_text_control);

    action_parameters_text_control.setValue(parameters_text_value.trim())
  }


  get form() { return this.triggerForm.controls }

  onSubmit() {
    this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit - get form', this.form);

    this.displayMODAL_Window = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;
    this.errorMESSAGE = false;
    this.errorMESSAGE_server = false;
    this.submitted = true;


    for (let w = 0; w < this.triggerForm.value.actions.length; w++) {
      this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit triggerForm.value.actions[w].key: ', this.triggerForm.value.actions[w].key);

      // nk 
      // --------------------------------------------------------------------------------------------------------------------------------------------
      // Delete the object parameters from actions if the action key is:
      // - request.department.route.self (i.e. 'Reassign to the same department')
      // - request.close (i.e. 'Close request') 
      // - request.reopen (i.e. 'Reopen request') 
      // - request.department.bot.launch (i.e. 'Launch department bot') 
      // --------------------------------------------------------------------------------------------------------------------------------------------
      if (
        (this.triggerForm.value.actions[w].key === "request.department.route.self") ||
        (this.triggerForm.value.actions[w].key === 'request.close') ||
        (this.triggerForm.value.actions[w].key === 'request.reopen') ||
        (this.triggerForm.value.actions[w].key === 'request.department.bot.launch')
      ) {
        delete this.triggerForm.value.actions[w].parameters
      }

      // nk 
      // --------------------------------------------------------------------------------------------------------------------------------------------
      // Rename the parameters key 'fullName' in 'member', delete parameter control 'text' and add the string 'bot_' if the select agent is a bot
      // Actions key for which it is made:
      // - request.participants.join (i.e. 'Participant join request')
      // - request.participants.leave (i.e. 'Participant leave request')
      // - request.bot.launch (i.e. 'Launch bot') - note: this action is avilable only for the trigger key "request.create" (i.e. When a visitor request a chat)
      // --------------------------------------------------------------------------------------------------------------------------------------------
      if (
        (this.triggerForm.value.actions[w].key === 'request.participants.join') ||
        (this.triggerForm.value.actions[w].key === 'request.participants.leave') ||
        (this.triggerForm.value.actions[w].key === 'request.bot.launch')
      ) {
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit action key is: ', this.triggerForm.value.actions[w].key);

        // ----------------------------------------------------------------
        // search the id of the selected agent (fullnameValue) in 
        // the bots array and, if it is found, add the string 'bot_' to it
        // ----------------------------------------------------------------
        const fullnameValue = this.triggerForm.value.actions[w].parameters.fullName
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit parameters fullname value ', fullnameValue);

        let foundBot = this.bots.find(bot => bot._id === fullnameValue);
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit foundBot ', foundBot);

        if (foundBot !== undefined) {
          this.triggerForm.value.actions[w].parameters.fullName = 'bot_' + fullnameValue
        }

        // -------------------------------------------------------
        // delete the field 'text'
        // -------------------------------------------------------
        delete this.triggerForm.value.actions[w].parameters.text

        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit parameters: ', this.triggerForm.value.actions[w].parameters);
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit bots: ', this.bots);

        // -------------------------------------------------------
        // Rename the key fullName in member
        // -------------------------------------------------------
        if (this.triggerForm.value.actions[w].parameters.hasOwnProperty("fullName")) {
          this.renameKey(this.triggerForm.value.actions[w].parameters, 'fullName', 'member');
        }
      }

      // nk 
      // --------------------------------------------------------------------------------------------------------------------------------------------
      // Rename the parameters key 'fullName' in 'sender', and add the string 'bot_' if the select agent is a bot
      // Actions key for which it is made:
      // - 'message.send' (i.e. 'Send message to visitor')
      // --------------------------------------------------------------------------------------------------------------------------------------------
      if (
        (this.triggerForm.value.actions[w].key === 'message.send' || this.triggerForm.value.actions[w].key === 'email.send')
      ) {
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit action key is: ', this.triggerForm.value.actions[w].key);

        // ----------------------------------------------------------------
        // search the id of the selected agent (fullnameValue) in 
        // the bots array and, if it is found, add the string 'bot_' to it
        // ----------------------------------------------------------------
        const fullnameValue = this.triggerForm.value.actions[w].parameters.fullName
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit parameters fullname value ', fullnameValue);

        let foundBot = this.bots.find(bot => bot._id === fullnameValue);
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit foundBot ', foundBot);

        if (foundBot !== undefined) {
          this.triggerForm.value.actions[w].parameters.fullName = 'bot_' + fullnameValue
        }

        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit parameters: ', this.triggerForm.value.actions[w].parameters);
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit bots: ', this.bots);

        // -------------------------------------------------------
        // Rename the key fullName in sender
        // -------------------------------------------------------
        if (this.triggerForm.value.actions[w].parameters.hasOwnProperty("fullName")) {
          this.renameKey(this.triggerForm.value.actions[w].parameters, 'fullName', 'sender');
        }
      }

      // nk 
      // --------------------------------------------------------------------------------------------------------------------------------------------
      // Rename the parameters key 'fullName' in 'departmentid' if the Actions key is 
      // - request.department.route (i.e. 'Assign to department')
      // Rename the parameters key 'fullName' in 'status' if the Actions key is  
      // - request.status.update (i.e. 'Change request status')
      // Rename the parameters key 'fullName' in 'tag' and delete parameter control 'text' if the Actions key is  
      // - request.tags.add (i.e. 'Assign Label')
      // --------------------------------------------------------------------------------------------------------------------------------------------

      if (
        (this.triggerForm.value.actions[w].key === 'request.department.route') ||
        (this.triggerForm.value.actions[w].key === 'request.status.update') ||
        (this.triggerForm.value.actions[w].key === 'request.tags.add')
      ) {
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit action key is: ', this.triggerForm.value.actions[w].key);

        // -------------------------------------------------------
        // delete the field 'text'
        // -------------------------------------------------------
        delete this.triggerForm.value.actions[w].parameters.text

        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit parameters: ', this.triggerForm.value.actions[w].parameters);

        // -------------------------------------------------------
        // Rename 
        // -------------------------------------------------------
        if (this.triggerForm.value.actions[w].parameters.hasOwnProperty("fullName")) {

          // -------------------------------------------------------
          // in departmentid if key is request.department.route
          // -------------------------------------------------------
          if (this.triggerForm.value.actions[w].key === 'request.department.route') {
            this.renameKey(this.triggerForm.value.actions[w].parameters, 'fullName', 'departmentid');
          }

          // -------------------------------------------------------
          // in status if key is request.status.update
          // -------------------------------------------------------
          if (this.triggerForm.value.actions[w].key === 'request.status.update') {
            this.renameKey(this.triggerForm.value.actions[w].parameters, 'fullName', 'status');
          }

          // -------------------------------------------------------
          // in tag if key is request.tags.add
          // -------------------------------------------------------
          if (this.triggerForm.value.actions[w].key === 'request.tags.add') {
            this.renameKey(this.triggerForm.value.actions[w].parameters, 'fullName', 'tag');
          }
        }
      }

      // nk 
      // --------------------------------------------------------------------------------------------------------------------------------------------
      // Rename the parameters key 'fullName' in 'departmentid' if the Actions key is 
      // - request.create (i.e. 'Create a request')
      // --------------------------------------------------------------------------------------------------------------------------------------------
      if (this.triggerForm.value.actions[w].key === 'request.create') {
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit action key is: ', this.triggerForm.value.actions[w].key);
        // -------------------------------------------------------
        // Rename the key fullName in departmentid
        // -------------------------------------------------------
        if (this.triggerForm.value.actions[w].parameters.hasOwnProperty("fullName")) {
          this.renameKey(this.triggerForm.value.actions[w].parameters, 'fullName', 'departmentid');
        }
      }

    }

    // delete the not choice conditionType array in triggerForm.conditions
    if (this.conditionType.split('conditions.')[1] === 'all') {
      delete this.triggerForm.value.conditions.any
    } else {
      delete this.triggerForm.value.conditions.all
    }
    // set value of all conditons.any/all.fact to 'json'

    // nk 
    // --------------------------------------------------------------------------------------------------------------------------------------------
    //  uncommented to resolve the: for the new condition added in the edit the property fact is = to 'json' instead of to 'json'
    // --------------------------------------------------------------------------------------------------------------------------------------------
    for (let i = 0; i < this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]].length; i++) {
      const condition = this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i]
      this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit condition ', condition);

      this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i].fact = 'json';


      // nk
      // --------------------------------------------------------------------------------------------------------------------------------------------
      // If the condition type is 'int' convert the condition value from string to number
      // --------------------------------------------------------------------------------------------------------------------------------------------
      if (this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i].type === 'int') {
        const conditionValue = this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i].value;
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit conditionValue ', conditionValue);
        this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i].value = parseInt(conditionValue, 10);
      }
    }

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
      this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit action validator', this.triggerForm.controls['actions']);

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

      // check condition validation and if first dropdown has value than other ones has a valid value
    } else if (conditionsGROUP.invalid && conditionsGROUP.controls[0].value['path'] !== null) {

      this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit - User selected only some dropdown condition but not all. SUMBIT KO')

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

    } else {
      // ALL FIELD IS CORRECTLY ADDED

      // add trigger.name value
      // if (this.triggerForm.value.trigger.key === 'message.received') {
      if (this.triggerForm.value.trigger.key === 'message.create.from.requester') {
        this.triggerForm.value.trigger.name = 'message create event';

      } else if (this.triggerForm.value.trigger.key === 'message.received') {
        this.triggerForm.value.trigger.name = 'message received event';
      

      } else if (this.triggerForm.value.trigger.key === 'request.create') {
        this.triggerForm.value.trigger.name = 'request create event';
      }
      else if (this.triggerForm.value.trigger.key === 'user.login') {
        this.triggerForm.value.trigger.name = 'user.login event';
      }
      else if (this.triggerForm.value.trigger.key === 'event.emit') {
        this.triggerForm.value.trigger.name = 'event emit';

      } else {
        this.triggerForm.value.trigger.name = '';
      }


      // add empty condition array for required server field request
      // if contidion[any/all].path is null
      if (conditionsGROUP.controls[0].value['path'] === null) {
        this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]] = [];
      }

      this.triggerService.updateTrigger(this.triggerForm.value).subscribe(res => {
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit UPDATE trigger RES', res);

      }, (error) => {
        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false
          this.SHOW_ERROR_CROSS = true;
          this.errorMESSAGE_server = true;
        }, 1000);
        this.logger.error('[TRIGGER-EDIT] ->>>>> onSubmit - UPDATE TRIGGER - ERROR ', error);

      }, () => {
        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false;
          this.SHOW_ERROR_CROSS = false;
        }, 1000);
        this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit - UPDATE TRIGGER * COMPLETE *');

      });
    }
    this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit TRIGGER FORM VALUE', this.triggerForm.value);
  }

  renameKey(obj, old_key, new_key) {
    this.logger.log('[TRIGGER-EDIT] ->>>>> onSubmit - renameKey obj: ', obj, ' - old_key: ', old_key, ' - new_key: ', new_key);
    // check if old key = new key   
    if (old_key !== new_key) {
      Object.defineProperty(obj, new_key, // modify old key 
        Object.getOwnPropertyDescriptor(obj, old_key));  // fetch description from object 
      delete obj[old_key]; // delete old key 
    }
  }


  // modal button CONTINUE
  onCloseModalHandled() {
    this.logger.log('[TRIGGER-EDIT] - CONTINUE PRESSED ');

    if (this.errorMESSAGE || this.errorMESSAGE_server) {

      this.logger.error('[TRIGGER-EDIT] - Error occured. Return to current page')

    } else {
      // this._location.back();
    }
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
