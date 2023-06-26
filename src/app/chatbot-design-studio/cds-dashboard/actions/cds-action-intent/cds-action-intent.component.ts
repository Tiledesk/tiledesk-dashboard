import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActionIntentConnected, Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './cds-action-intent.component.html',
  styleUrls: ['./cds-action-intent.component.scss']
})
export class CdsActionIntentComponent implements OnInit {

  @Input() intentSelected: Intent;
  @Input() action: ActionIntentConnected;
  @Input() connector: any;
  @Output() editAction = new EventEmitter();

  idIntentSelected: string;
  idAction: string;
  isConnected: boolean = false;

  constructor(
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    console.log("[ACTION-INTENT] elementSelected: ", this.action);
    this.initialize();
  }

  ngOnChanges() {
    console.log('CdsActionIntentComponent ngOnChanges:: ', this.connector);
    this.updateConnector();
  }


  private initialize() {
    this.idIntentSelected = this.intentSelected.id;
    this.idAction = this.idIntentSelected+'/'+this.action._tdActionId;
  }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      if(idAction === this.action._tdActionId){
        if(this.connector.deleted){
          // DELETE 
          console.log(' deleteConnector :: ', this.connector.id);
          this.action.intentName = null;
          this.isConnected = false;
        } else {
          // ADD / EDIT
          console.log(' updateConnector :: ', this.connector.toId);
          this.action.intentName = this.connector.toId;
          this.isConnected = true;
        }
        this.editAction.emit();
      }
    } catch (error) {
      console.log('error: ', error);
    }
  }
  




  

  // onChangeSelect(event: {name: string, value: string}){
  //   this.action.intentName = event.value
  //   if(!this.action._tdActionTitle){
  //     // this.action._tdActionTitle = this.intents.find(intent => intent.value === event.value).name
  //   }
  // }

  // mi sottoscrivo all'evento drag dei connettori e aggiorno ...

}
