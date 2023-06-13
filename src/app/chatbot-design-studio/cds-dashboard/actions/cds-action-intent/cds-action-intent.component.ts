import { ActionIntentConnected } from 'app/models/intent-model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './cds-action-intent.component.html',
  styleUrls: ['./cds-action-intent.component.scss']
})
export class CdsActionIntentComponent implements OnInit {

  @Input() IDintentSelected: string;
  @Input() action: ActionIntentConnected;
  @Input() connector: any;
  @Output() editAction = new EventEmitter();

  idAction: string;

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
    this.idAction = this.IDintentSelected+'/'+this.action._tdActionId;
  }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      if(idAction === this.action._tdActionId){
        console.log(' updateConnector :: ', this.connector.toId);
        this.action.intentName = this.connector.toId;
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
