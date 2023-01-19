import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { Field, Form, Intent } from 'app/models/intent-model';

import { FormModelsFactory } from './form-models-factory';

// import { URL_more_info_chatbot_forms } from 'app/utils/util';


export interface ModalDeleteModel {
  deleteField?: string;
  nameField?: string;
  confirmDeleteField?: string;
  cancel?: string;
}

@Component({
  selector: 'appdashboard-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnChanges {
  @Output() passJsonIntentForm = new EventEmitter();
  @Input() intentForm: Form;
  @Input() intentSelected: Intent;
  langBot: string;
  fields = new Array() as Field[];;
  // URL_to_form_more_info = URL_more_info_chatbot_forms;
  URL_to_form_more_info = "https://gethelp.tiledesk.com/articles/tiledesk-chatbot-forms/";

  // modal
  displayMODAL = false;
  translateMap: ModalDeleteModel;
  translations: any;

  selectedObjectId: string;

  // add edit form
  selectedField: Field;
  displayTilebotAddEditForm = true;
  displayAddForm = false;
  displayEditForm = false
  displayBoxNewForm = false;
  displaySettingForm = false;
  displayNewFormButton = true;
  displayCancelButton = false;
  displaySettingsButton = false;

  idForm: string = "id-form-000";
  selectedForm: Form;
  selectedFormId: number;
  modelsOfForm: Form[] = [];
  cancelCommands: string[] = [];
  cancelCommandsString: string;
  cancelReply: string;
  intentFormSize: number


  translateparam = { selectedFormName: "", description_key: "" };

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {

    this.langBot = this.route.snapshot.params['botlang'];
    if (!this.langBot || this.langBot === undefined) {
      this.langBot = 'en';
    }
  }

  ngOnInit(): void {
    let modelsFactory = new FormModelsFactory()

    this.modelsOfForm = modelsFactory.getModels();
    console.log('[FORM-COMP] (OnInit) modelsOfForm ', this.modelsOfForm)

    this.selectedForm = this.modelsOfForm[0];
    console.log('[FORM-COMP] (OnInit) selectedForm ', this.selectedForm)

    this.selectedFormId = this.modelsOfForm[0].id ? this.modelsOfForm[0].id : null;
    console.log('[FORM-COMP] (OnInit) selectedFormId ', this.selectedFormId)
  

    // this.selectedForm = new Form()
    //   this.selectedForm.to_JSON()
    //   console.log('[FORM-COMP] (OnInit) this.selectedForm.to_JSON() ',this.selectedForm.to_JSON())
    // this.selectedForm = modelsFactory.getModels()[0];
    // console.log('[FORM-COMP] (OnInit) selectedForm ', this.selectedForm)
    // this.modelsOfForm = modelsFactory.getModels();
    // //this.modelsOfForm.push(modelsFactory.getModels());
    // console.log('[FORM-COMP] (OnInit) modelsOfForm ', this.modelsOfForm)
    // this.selectedForm = this.modelsOfForm[0];
    // console.log('[FORM-COMP] (OnInit) selectedForm 2 ', this.selectedForm)
    // this.selectedFormId = this.modelsOfForm[0].id ? this.modelsOfForm[0].id : null;
    // console.log('[FORM-COMP] (OnInit) selectedFormId ', this.selectedFormId)

    this.getCurrentTranslation();
    // this.getModelsForm();
    this.translateMap = {};
    this.translations = {};
    this.intentFormSize = Object.keys(this.intentForm).length;
    console.log('[FORM-COMP] (OnInit) intentFormSize ', this.intentFormSize)
    // if (this.intentForm ) {
    if (this.intentFormSize > 0) {
      this.displayNewFormButton = false;
      this.displaySettingsButton = true;
      if (this.intentForm && this.intentForm.fields) {
        this.fields = JSON.parse(JSON.stringify(this.intentForm.fields));
        console.log('[FORM-COMP] OnInit intentForm.fields ', this.fields)
      }
      this.cancelCommands = this.intentForm.cancelCommands;
      this.cancelReply = this.intentForm.cancelReply;
      this.cancelCommandsString = this.cancelCommands.toString();

      console.log('[FORM-COMP] cancelCommands ', this.cancelCommands)
      console.log('[FORM-COMP] cancelReply ', this.cancelReply)
      console.log('[FORM-COMP] cancelCommandsString ', this.cancelCommandsString)
    }
    // else {
    //   // this.displayNewFormButton = true;
    //   this.openBoxNewFormForm()
    // }
  }

  ngOnChanges() {
    console.log('[FORM-COMP] (OnChanges) intentForm ', this.intentForm)
    console.log('[FORM-COMP] (OnChanges) intentSelected ', this.intentSelected)
  }

  getFieldFromId(idForm: number) {
    console.log('[FORM-COMP] getFieldFromId idForm ', idForm)
    // this.selectedForm = new FormModelsFactory().getModels()[0]

    this.selectedForm = new FormModelsFactory().getModels().find(({ id }) => id === idForm);
    console.log('[FORM-COMP] getFieldFromId selectedForm ', this.selectedForm)
    
    // this.translateparam = { selectedFormName: this.selectedForm.name, description_key: this.selectedForm.description_key };
  }

  generateJsonIntentForm() {
    console.log('[FORM-COMP] generateJsonIntentForm')
    if (this.selectedFormId && !this.selectedForm) {
      this.getFieldFromId(this.selectedFormId);
    }

    console.log('[FORM-COMP] selectedForm ', this.selectedForm)

    if (this.selectedForm) {
      // this.selectedForm = new Form()
      this.selectedForm.to_JSON()
      this.intentForm = this.selectedForm;
      this.intentForm.cancelCommands = this.cancelCommands;
      this.intentForm.cancelReply = this.cancelReply;
      this.intentForm.to_JSON()
      // this.fields = JSON.parse(JSON.stringify(this.selectedForm.fields));
      this.fields = this.selectedForm.fields;
      this.intentFormSize = Object.keys(this.intentForm).length;
      console.log('[FORM-COMP] generateJsonIntentForm ', this.intentForm)
    }

    this.displayCancelButton = false;
    this.displaySettingsButton = true;
    console.log('[FORM-COMP] generateJsonIntentForm displaySettingsButton:', this.displaySettingsButton, ' displayCancelButton', this.displayCancelButton)

    // se sto creando un form custom che non ha campi
    if (this.fields.length === 0) {
      this.displayEditForm = false;
      this.displayAddForm = true;
      this.openAddEditForm();
    }
    this.jsonGenerator();
  }


  getCurrentTranslation() {
    let jsonWidgetLangURL = 'assets/i18n/' + this.langBot + '.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data => {
      this.translations = data['AddIntentPage'];
      let cancel = this.translations['Cancel'] ? this.translations['Cancel'] : 'cancel';
      this.translateMap.cancel = cancel;
      console.log('[FORM-COMP]  getCurrentTranslation intentForm 1', this.intentForm);
      this.intentFormSize = Object.keys(this.intentForm).length;
      if (this.intentFormSize === 0) {
        console.log('[FORM-COMP] getCurrentTranslation intentForm 2', this.intentForm)
        this.cancelCommands.push(cancel);
        this.cancelReply = this.translations['CancelReply'] ? this.translations['CancelReply'] : '';
      }
      console.log('[FORM-COMP] getCurrentTranslation this.cancelReply::', this.cancelReply);
      console.log('[FORM-COMP] getCurrentTranslation cancel::', cancel);
      console.log('[FORM-COMP] getCurrentTranslation cancelCommands::', this.cancelCommands);
    })
  }


  setCancelCommands() {
    //this.cancelCommandsString.split(",");
    this.intentForm.cancelCommands = this.cancelCommandsString
      .split(',')
      .map(element => element.trim())
      .filter(element => element !== '');
    this.jsonGenerator();
  }

  setCancelReplay() {
    this.intentForm.cancelReply = this.cancelReply;
    console.log('[FORM-COM]  setCancelReplay this.intentForm.cancelReply', this.intentForm.cancelReply)
    this.jsonGenerator();
  }

  jsonGenerator() {
    // this.intentForm = new Form();
    // this.intentForm = this.selectedForm
    // this.intentForm.to_JSON()
    console.log('this.intentForm:: ', this.intentForm);
    this.passJsonIntentForm.emit(this.intentForm);
    // this.intentForm.push(this.intentForm)
    this.intentSelected.form = this.intentForm
  }

  openSettingsForm() {
    this.displaySettingsButton = false;
    this.displayCancelButton = true;
    this.displaySettingForm = true;
    this.cancelCommands = this.intentForm.cancelCommands;
    this.cancelReply = this.intentForm.cancelReply;
    this.cancelCommandsString = this.cancelCommands.toString();

    console.log('[FORM-COMP] cancelCommands ', this.cancelCommands)
    console.log('[FORM-COMP] cancelReply ', this.cancelReply)
    console.log('[FORM-COMP] cancelCommandsString ', this.cancelCommandsString)

    // this.cancelCommandsString = this.cancelCommands.toString(); // this was commented - not commented in v 3.2.8
    console.log('[FORM-COM]  openSettingsForm displaySettingsButton', this.displaySettingsButton)
    console.log('[FORM-COM]  openSettingsForm displayCancelButton', this.displayCancelButton)
    console.log('[FORM-COM]  openSettingsForm displaySettingForm', this.displaySettingForm)
    console.log('[FORM-COM]  openSettingsForm cancelCommandsString', this.cancelCommandsString)
  }

  closeSettingsForm() {
    this.displaySettingsButton = true;
    this.displayCancelButton = false;
    this.displaySettingForm = false;
    this.cancelCommandsString = this.cancelCommands.toString(); // this was commented - not commented in v 3.2.8
    console.log('[FORM-COM]  closeSettingsForm displaySettingsButton', this.displaySettingsButton)
    console.log('[FORM-COM]  closeSettingsForm displayCancelButton', this.displayCancelButton)
    console.log('[FORM-COM]  closeSettingsForm displaySettingForm', this.displaySettingForm)
    console.log('[FORM-COM]  closeSettingsForm cancelCommandsString', this.cancelCommandsString)

  }

  closeGeneral() {
    // if (this.intentForm) {
    if (this.intentFormSize > 0) {
      this.displaySettingForm = false;
      this.displaySettingsButton = true;
    } else {
      this.displayBoxNewForm = false;
      this.displayNewFormButton = true;
    }
    this.displayCancelButton = false;
  }

  openDeleteFieldModal(index: string) {
    // console.log('this.translations:::: ', this.translations);
    let i: number = +index;
    this.displayMODAL = true;
    this.translateMap.deleteField = this.translations['DeleteField'] ? this.translations['DeleteField'] : '';
    this.translateMap.confirmDeleteField = this.translations['ConfirmDeleteField'] ? this.translations['ConfirmDeleteField'] : '';
    this.translateMap.nameField = this.fields[i].name;
    this.selectedObjectId = index;
  }

  /** Event modal confirm delete field */
  confirmDeleteModal(index: string) {
    if (index === this.idForm) {
      this.deleteForm();
    } else {
      this.displayAddForm = false;
      this.displayEditForm = false;
      let i: number = +index;
      this.fields.splice(i, 1);
      if (this.fields.length === 0) {
        this.deleteForm();
      }
      this.intentForm.fields = this.fields;
      // console.log('confirmDeleteModal::: ', this.intentForm, this.fields);
    }
    this.jsonGenerator();
    this.displayMODAL = false;
  }


  openBoxNewFormForm() {
    // this.intentForm = null;
    // this.intentForm = new Form();
    this.fields = [];
    this.displayBoxNewForm = true;
    this.displayTilebotAddEditForm = true;
    this.displayCancelButton = true;
    this.displayNewFormButton = false;
    this.displaySettingsButton = false;
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displaySettingForm = false;
    this.intentFormSize = 0
    console.log('[FORM-COM] openBoxNewFormForm - displayBoxNewForm ', this.displayBoxNewForm, 'intentForm', this.intentForm);
  }

  private deleteForm() {
    this.displayTilebotAddEditForm = false;
    this.displayNewFormButton = true;
    this.displayBoxNewForm = false;
    this.displaySettingForm = false;
    this.displayAddForm = false;
    this.displayEditForm = false
    this.displayCancelButton = false;
    this.displaySettingsButton = false;
    //this.intentForm = new Form();
    this.fields = [];
    this.intentFormSize = 0;
    console.log('[FORM-COM] deleteForm - displayBoxNewForm ', this.displayBoxNewForm, 'intentForm', this.intentForm);
  }


  private resetForm() {
    this.intentForm = new Form();
    this.fields = [];
    this.displayNewFormButton = false;
    this.displaySettingsButton = true;
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = false;
  }

  // -------------------------------------
  // Form Field 
  // -------------------------------------
  /** Event modal close delete field */
  closeDeleteModal(i: number) {
    this.displayMODAL = false;
  }

  /** Event add field */
  eventAddField() {
    this.displayEditForm = false;
    this.selectedField = null;
    this.displayAddForm = true;
    this.openAddEditForm();
    console.log('[FORM-COMP] eventAddField displayEditForm ', this.displayEditForm)
    console.log('[FORM-COMP] eventAddField selectedField ', this.selectedField)
    console.log('[FORM-COMP] eventAddField displayAddForm ', this.displayAddForm)
  }

  /** Event edit field */
  eventEditField(i: number) {
    this.closeAddEditForm();
    setTimeout(() => {
      this.selectedField = this.fields[i];
      this.displayAddForm = false;
      this.displayEditForm = true;
      this.openAddEditForm();
    }, 300);
    console.log('[FORM-COMP] eventEditField selectedField ', this.selectedField)
    console.log('[FORM-COMP] eventEditField displayAddForm ', this.displayAddForm)
    console.log('[FORM-COMP] eventEditField displayEditForm ', this.displayEditForm)
  }

  eventDropField(fields) {
    this.intentForm.fields = fields;
    this.fields = fields;
    this.closeAddEditForm();
    this.selectedField = null;
  }


  /** Event close add/edit form accordion */
  closeAddEditForm() {
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = true;
    console.log('[FORM-COMP] closeAddEditForm displayAddForm ', this.displayAddForm)
    console.log('[FORM-COMP] closeAddEditForm displayEditForm ', this.displayEditForm)
    console.log('[FORM-COMP] closeAddEditForm displayEditForm ', this.displayTilebotAddEditForm)
  }

  /** Event SAVE field */
  saveAddEditForm(event: any) {
    const objIndex = this.fields.findIndex(obj => obj.name === event.name);
    if (objIndex === -1) {
      this.fields.push(event);
    } else {
      this.fields.splice(objIndex, 1, event);
    }
    if (this.intentForm) {
      this.intentForm.fields = this.fields;
      console.log('[FORM-COMP] saveAddEditForm intentForm ', this.intentForm)
    }
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = true;
    this.jsonGenerator();
  }

  openAddEditForm() {
    this.displayTilebotAddEditForm = false;
    setTimeout(() => {
      this.displayTilebotAddEditForm = true;
    }, 300);
  }

  /** */
  openDeleteForm() {
    console.log('[FORM-COMP] openDeleteForm this.translations:::: ', this.translations);
    this.translateMap.deleteField = this.translations['DeleteForm'] ? this.translations['DeleteForm'] : '';
    this.translateMap.confirmDeleteField = this.translations['ConfirmDeleteForm'] ? this.translations['ConfirmDeleteForm'] : '';
    this.displayMODAL = true;
    this.selectedObjectId = this.idForm;
    console.log('[FORM-COMP] openDeleteForm displayMODAL', this.displayMODAL)
    console.log('[FORM-COMP openDeleteForm selectedObjectId', this.selectedObjectId)
  }

  goToFormMoreInfo() {
    const url = this.URL_to_form_more_info;
    window.open(url, '_blank');
  }


}
