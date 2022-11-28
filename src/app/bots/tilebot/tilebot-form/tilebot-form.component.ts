
import { Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from "@angular/common/http";


export interface ModalDeleteModel {
  deleteField?: string;
  nameField?: string;
  confirmDeleteField?: string; 
  cancel?:string;
} 

// export interface IntentFormModel {
//   id?: string;
//   name?: string;
//   description_key?: string; 
//   fields?:string;
// } 

@Component({
  selector: 'appdashboard-tilebot-form',
  templateUrl: './tilebot-form.component.html',
  styleUrls: ['./tilebot-form.component.scss']
})


export class TilebotFormComponent implements OnInit {
  @Output() passJsonIntentForm = new EventEmitter();
  @Input() intentForm: any;
  langBot: string; 
  fields: any[] = [];

  // modal
  displayMODAL = false;
  translateMap: ModalDeleteModel;
  translations: any;

  selectedObjectId: string;
  
  // add edit form
  selectedField: any;
  displayTilebotAddEditForm = true;
  displayAddForm = false;
  displayEditForm = false
  displayBoxNewForm = false;
  displaySettingForm = false;
  displayNewFormButton = true;
  displayCancelButton = false;
  displaySettingsButton = false;

  idForm: string = "id-form-000";
  selectedForm: any;
  selectedFormId: number;
  modelsOfForm: any[] = [];
  cancelCommands: string[] = [];
  cancelCommandsString: string;
  cancelReply: string;

  translateparam = { selectedFormName: "", description_key: ""};
 
  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    this.langBot = this.route.snapshot.params['botlang'];
    if(!this.langBot || this.langBot === undefined){
      this.langBot = 'en';
    }
  }


  ngOnInit(): void {
    this.getCurrentTranslation();
    this.getModelsForm();
    this.translateMap = {};
    this.translations = {};
    if(this.intentForm && this.intentForm.fields){
      this.displayNewFormButton = false;
      this.displaySettingsButton = true;
      this.fields = structuredClone(this.intentForm.fields);
    }
  }
  



  // FUNCTIONS //

  /** */
  getFieldFromId(idForm:number){
    this.selectedForm = this.modelsOfForm.find(({ id }) => id === idForm);
    this.translateparam = { selectedFormName: this.selectedForm.name, description_key: this.selectedForm.description_key};
  }

  /** */
  generateJsonIntentForm(){
    if(this.selectedFormId && !this.selectedForm){
      this.getFieldFromId(this.selectedFormId);
    }

    // console.log("generateJsonIntentForm", this.selectedFormId, this.selectedForm);
    if(this.selectedForm){  
      this.intentForm = {};
      this.intentForm.cancelCommands = this.cancelCommands;
      this.intentForm.cancelReply = this.cancelReply;
      // this.selectedForm = this.modelsOfForm[this.selectedFormId];
      if(this.selectedForm.id){
        this.intentForm.id = this.selectedForm.id;
      }
      if(this.selectedForm.name){
        this.intentForm.name = this.selectedForm.name;
      }
      if(this.selectedForm.fields){
        this.intentForm.fields = this.selectedForm.fields;
        this.fields = structuredClone(this.selectedForm.fields);
      }
      // console.log('generateForm:  ', this.intentForm);
    }
    this.displayCancelButton = false;
    this.displaySettingsButton = true;
    
    // se sto creando un form custom che non ha campi
    if(this.fields.length === 0){
      this.displayEditForm = false;
      this.displayAddForm = true;
      this.openAddEditForm();
    }
    this.jsonGenerator();
  }


  /** */
  getCurrentTranslation() {   
    let jsonWidgetLangURL = 'assets/i18n/'+this.langBot+'.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data =>{
      this.translations = data['AddIntentPage'];
      let cancel = this.translations['Cancel']? this.translations['Cancel']: 'cancel';
      this.cancelCommands.push(cancel);
      this.cancelReply = this.translations['CancelReply']?this.translations['CancelReply']:'';
      this.translateMap.cancel = cancel;

      // console.log('this.translations:::: ', this.translations);
    })
  }

  /**
   * !!! this function is temporary and will be replaced with a function 
   * that calls an external service by passing the bot language !!!
   */
  getModelsForm(){
    let tilebotModelFormURL = 'assets/bots/tilebot/modelsForm.json';
    let jsonModel: any;
    this.httpClient.get(tilebotModelFormURL).subscribe(data => {
      if(data){
        jsonModel = data;
        jsonModel.forEach(element => {
          let item = {"id": "", "name": "", "description_key": "", "fields": ""};
          if(element.id){item.id = element.id};
          if(element.name){item.name = element.name};
          if(element.description_key){item.description_key = element.description_key};
          if(element.fields){item.fields = element.fields};
          this.modelsOfForm.push(item);
        });
      }
      let item = {"id": "999", "name": "Custom", "description_key": "", "fields": ""};
      this.modelsOfForm.push(item);
      //console.log("modelsOfForm : ",this.modelsOfForm);
      this.selectedForm = this.modelsOfForm[0];
      this.selectedFormId = this.modelsOfForm[0].id;
      this.translateparam = { selectedFormName: this.selectedForm.name, description_key: this.selectedForm.description_key};
    }); 
  }

  /** */
  jsonGenerator(){
    // console.log('this.intentForm:: ', this.intentForm);
    this.passJsonIntentForm.emit(this.intentForm);
  }

  /** */

  // EVENTS //
  

  openSettingsForm(){
    this.displaySettingsButton = false;
    this.displayCancelButton = true;
    this.displaySettingForm = true;
    this.cancelCommandsString = this.cancelCommands.toString();
  }

  closeSettingsForm(){
    this.displaySettingsButton = true;
    this.displayCancelButton = false;
    this.displaySettingForm = false;
    this.cancelCommandsString = this.cancelCommands.toString();
  }

  closeGeneral(){
    if(this.intentForm){
      this.displaySettingForm = false;
      this.displaySettingsButton = true;
    } else {
      this.displayBoxNewForm = false;
      this.displayNewFormButton = true;
    }
    this.displayCancelButton = false;
  }

  /** Event modal open delete field */
  openDeleteFieldModal(index:string) {
    // console.log('this.translations:::: ', this.translations);
    let i: number = +index;
    this.displayMODAL = true;
    this.translateMap.deleteField = this.translations['DeleteField']?this.translations['DeleteField']:'';
    this.translateMap.confirmDeleteField = this.translations['ConfirmDeleteField']?this.translations['ConfirmDeleteField']:'';
    this.translateMap.nameField = this.fields[i].name; 
    this.selectedObjectId = index;
  }

  /** Event modal confirm delete field */
  confirmDeleteModal(index:string){
    if(index === this.idForm){
      this.deleteForm();
    } else {
      this.displayAddForm = false;
      this.displayEditForm = false;
      let i: number = +index;
      this.fields.splice(i, 1);
      // console.log('this.fields.length::: 1', this.fields.length);
      if(this.fields.length === 0){
        this.deleteForm();
      }
      // console.log('this.fields.length::: 2');
    }
    this.jsonGenerator();
    this.displayMODAL = false;
  }


  openBoxNewFormForm(){
    this.intentForm = null;
    this.fields = [];
    this.displayBoxNewForm = true;
    this.displayTilebotAddEditForm = true;
    this.displayCancelButton = true;
    this.displayNewFormButton = false;
    this.displaySettingsButton = false;
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displaySettingForm = false;
    // console.log('openBoxNewFormForm:: ', this.displayBoxNewForm, this.intentForm);
  }

  private deleteForm(){
    // console.log('deleteForm:: ');
    this.displayTilebotAddEditForm = false;
    this.displayNewFormButton = true;
    this.displayBoxNewForm = true;
    this.displaySettingForm = false;
    this.displayAddForm = false;
    this.displayEditForm = false
    this.displayCancelButton = false;
    this.displaySettingsButton = false;
    this.intentForm = null;
    this.fields = [];
  }


  private resetForm(){
    this.intentForm = {};
    this.fields = [];
    this.displayNewFormButton = false;
    this.displaySettingsButton = true;
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = false;
  }

  /** Event modal close delete field */
  closeDeleteModal(i:number){
    this.displayMODAL = false;
  }

  /** Event add field */
  eventAddField(){
    this.displayEditForm = false;
    this.selectedField = null;
    this.displayAddForm = true;
    this.openAddEditForm();
  }

  /** Event edit field */
  eventEditField(i:number){
    this.closeAddEditForm();
    setTimeout(() => {
      this.selectedField = this.fields[i];
      this.displayAddForm = false;
      this.displayEditForm = true;
      this.openAddEditForm();
    }, 300);
  }

  eventDropField(fields){
    this.intentForm.fields = fields;
    this.fields = fields;
    this.closeAddEditForm();
    this.selectedField = null;
  }
  

  /** Event close add/edit form accordion */
  closeAddEditForm(){
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = true;
  }

  /** Event SAVE field */
  saveAddEditForm(event:any){
    const objIndex =  this.fields.findIndex(obj => obj.name === event.name);
    if (objIndex === -1) {
      this.fields.push(event);
    } else {
      this.fields.splice(objIndex, 1, event);
    }
    if(this.intentForm){
      this.intentForm.fields = this.fields;
    }
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = true;
    this.jsonGenerator();
  }

  openAddEditForm(){
    this.displayTilebotAddEditForm = false;
    setTimeout(() => {
      this.displayTilebotAddEditForm = true;
    }, 300);
  }

  /** */
  openDeleteForm(){
    // console.log('this.translations:::: ', this.translations);
    this.translateMap.deleteField = this.translations['DeleteForm']?this.translations['DeleteForm']:'';
    this.translateMap.confirmDeleteField = this.translations['ConfirmDeleteForm']?this.translations['ConfirmDeleteForm']:'';
    this.displayMODAL = true;
    this.selectedObjectId = this.idForm;
  }
}