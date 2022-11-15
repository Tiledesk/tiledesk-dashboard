
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
  selectedObjectId: number;
  
  // add edit form
  selectedField: any;
  displayAddEditForm = false;
  displayBoxNewForm = false;
  displaySettingForm = false;

  displayNewFormButton = true;
  displayCancelButton = false;
  displaySettingsButton = false;
  // intentForm: any;

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
      // console.log('this.intentForm:::: ', this.intentForm);
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
    console.log('this.intentForm:: ', this.intentForm);
    this.passJsonIntentForm.emit(this.intentForm);
  }

  /** */
  // removeField(i: number) {
  //   this.fields.splice(i, 1);
  //   console.log('removeField:: ', this.fields.length);
  //   if(this.fields.length === 0){
  //     this.intentForm = null;
  //   }
  //   this.jsonGenerator();
  // }

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
  openDeleteFieldModal(index:number) {
    this.displayMODAL = true;
    this.translateMap["nameField"] =this.fields[index].name; 
    this.selectedObjectId = index;
  }

  /** Event modal confirm delete field */
  confirmDeleteModal(i:number){
    this.fields.splice(i, 1);
    
    this.displayMODAL = false;
    if(this.fields.length === 0){
      this.intentForm = null;
      this.displayNewFormButton = true;
      this.displaySettingsButton = false;
    }
    console.log('confirmDeleteModal:: ', this.fields);
    this.jsonGenerator();
  }

  /** Event modal close delete field */
  closeDeleteModal(i:number){
    // console.log('closeDeleteModal: ',i);
    this.displayMODAL = false;
  }

  /** Event add field */
  eventAddField(){
    this.selectedField = null;
    this.displayAddEditForm = true;
  }

  /** Event edit field */
  eventEditField(i:number){
    this.selectedField = this.fields[i];
    this.displayAddEditForm = true;
  }

  /** Event close add/edit form accordion */
  closeAddEditForm(){
    this.displayAddEditForm = false;
  }

  /** Event SAVE field */
  saveAddEditForm(event:any){
    const objIndex =  this.fields.findIndex(obj => obj.name === event.name);
    if (objIndex === -1) {
      this.fields.push(event);
    } else {
      this.fields.splice(objIndex, 1, event);
    }
    this.displayAddEditForm = false;
    this.jsonGenerator();
  }
}