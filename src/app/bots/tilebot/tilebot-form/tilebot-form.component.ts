
import { Component, OnInit, Output, Input, EventEmitter} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from "@angular/common/http";

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
  translateMap: any;
  selectedObjectId: string;
  
  // add edit form
  selectedField: any;
  // displayAddEditForm = false;
  displayTilebotAddEditForm = false;
  displayAddForm = false;
  displayEditForm = false
  displayBoxNewForm = false;
  displaySettingForm = false;

  displayNewFormButton = true;
  displayCancelButton = false;
  displaySettingsButton = false;
  // intentForm: any;

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

    this.translateMap = {
      "deleteField": "Elimina campo",
      "confirmDeleteField": "sei sicuro di voler eliminare il campo",
      "cancel": "annulla"
    }
    if(this.intentForm && this.intentForm.fields){
      this.displayNewFormButton = false;
      this.displaySettingsButton = true;
      this.fields = this.intentForm.fields;
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
        this.fields = this.selectedForm.fields;
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
      this.cancelCommands.push(data['Cancel']);
      this.cancelReply = data['CancelReply'];
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
  openBoxNewFormForm(){
    this.displayBoxNewForm = true;
    this.displayCancelButton = true;
    this.displayNewFormButton = false;
    this.displaySettingsButton = false;
  }

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
    let i: number = +index;
    this.displayMODAL = true;
    this.translateMap["nameField"] =this.fields[i].name; 
    this.selectedObjectId = index;
  }

  /** Event modal confirm delete field */
  confirmDeleteModal(index:string){
    if(index === this.idForm){
      this.resetForm();
    } else {
      let i: number = +index;
      this.fields.splice(i, 1);
      if(this.fields.length === 0){
        this.resetForm();
      }
    }
    this.jsonGenerator();
    this.displayMODAL = false;
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
    this.selectedField = this.fields[i];
    this.displayAddForm = false;
    this.displayEditForm = true;
    this.openAddEditForm();
  }

  /** Event close add/edit form accordion */
  closeAddEditForm(){
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = false;
  }

  /** Event SAVE field */
  saveAddEditForm(event:any){
    const objIndex =  this.fields.findIndex(obj => obj.name === event.name);
    if (objIndex === -1) {
      this.fields.push(event);
    } else {
      this.fields.splice(objIndex, 1, event);
    }
    this.intentForm.fields = this.fields;
    this.displayAddForm = false;
    this.displayEditForm = false;
    this.displayTilebotAddEditForm = false;
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
    this.translateMap = {
      "deleteField": "Elimina il form",
      "confirmDeleteField": "sei sicuro di voler eliminare il form",
      "nameField": '',
      "cancel": "annulla"
    }
    this.displayMODAL = true;
    this.selectedObjectId = this.idForm;
  }
}