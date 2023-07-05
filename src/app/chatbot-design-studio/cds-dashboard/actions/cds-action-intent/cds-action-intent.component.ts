import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActionIntentConnected, Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './cds-action-intent.component.html',
  styleUrls: ['./cds-action-intent.component.scss']
})
export class CdsActionIntentComponent implements OnInit {

  @Input() intentSelected: Intent;
  @Input() action: ActionIntentConnected;
  @Output() updateAndSaveAction = new EventEmitter();

  idIntentSelected: string;
  idConnector: string;
  isConnected: boolean = false;
  connector: any;

  constructor(
    private logger: LoggerService,
    private intentService: IntentService,
  ) {
    
   }

  ngOnInit(): void {
    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      // console.log('CdsActionIntentComponent isChangedConnector-->', connector);
      this.connector = connector;
      this.updateConnector();
    });
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  private initialize() {
    // this.isConnected = false;
    this.idIntentSelected = this.intentSelected.intent_id;
    this.idConnector = this.idIntentSelected+'/'+this.action._tdActionId;
  }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      if(idAction === this.action._tdActionId){
        if(this.connector.deleted){
          // DELETE 
          // console.log(' deleteConnector :: ', this.connector.id);
          this.action.intentName = null;
          this.isConnected = false;
        } else {
          // ADD / EDIT
          // console.log(' updateConnector :: ', this.connector.toId);
          this.action.intentName = this.connector.toId;
          this.isConnected = true;
        }
        this.updateAndSaveAction.emit();
      }
    } catch (error) {
      console.log('error: ', error);
    }
  }
  
}
