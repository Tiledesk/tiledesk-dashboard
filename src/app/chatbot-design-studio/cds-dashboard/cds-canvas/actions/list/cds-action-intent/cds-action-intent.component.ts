import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActionIntentConnected, Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './cds-action-intent.component.html',
  styleUrls: ['./cds-action-intent.component.scss']
})
export class CdsActionIntentComponent implements OnInit {

  @Input() intentSelected: Intent;
  @Input() isStart: boolean;
  @Input() action: ActionIntentConnected;
  @Input() previewMode: boolean = true;
  @Output() updateAndSaveAction = new EventEmitter();
  @Output() onCreateUpdateConnector = new EventEmitter<{fromId: string, toId: string}>()

  intents: Array<{name: string, value: string, icon?:string}>
  idIntentSelected: string;
  idConnector: string;
  isConnected: boolean = false;
  connector: any;

  constructor(
    private logger: LoggerService,
    private intentService: IntentService
  ) {
    
  }


  ngOnInit(): void {
    this.logger.log("[CDS-ACTION-INTENT] elementSelected: ", this.action, this.intentSelected)
    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      this.logger.log('[CDS-ACTION-INTENT] - subcribe to isChangedConnector$ >>', connector);
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
    this.intents = this.intentService.getListOfIntents();
    this.logger.log('[CDS-ACTION-INTENT] - initialize - idIntentSelected ', this.idIntentSelected);
    this.logger.log('[CDS-ACTION-INTENT] - initialize - idConnector ', this.idConnector);
    this.logger.log('[CDS-ACTION-INTENT] - initialize - intents ', this.intents);
  }

  private updateConnector(){
    this.logger.log('[CDS-ACTION-INTENT] 1- updateConnector :: ');
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      this.logger.log('[CDS-ACTION-INTENT] 2 - updateConnector :: ', idAction, this.action._tdActionId);
      if(idAction === this.action._tdActionId){
        if(this.connector.deleted){
          // DELETE 
          this.logger.log('[CDS-ACTION-INTENT] deleteConnector :: ', this.connector.id);
          this.action.intentName = null;
          this.isConnected = false;
        } else {
          // ADD / EDIT
          this.logger.log('[CDS-ACTION-INTENT] updateConnector :: ', this.connector.toId);
          this.action.intentName = "#"+this.connector.toId;
          this.isConnected = true;
        }
        this.updateAndSaveAction.emit();
      }
    } catch (error) {
      this.logger.log('error: ', error);
    }
  }


  onChangeSelect(event: {name: string, value: string}){
    this.logger.log('CDS-ACTION-INTENT onChangeSelect-->', event)
    this.action.intentName = event.value
    if(!this.action._tdActionTitle){
      this.action._tdActionTitle = this.intents.find(intent => intent.value === event.value).name
    }
    this.onCreateUpdateConnector.emit({fromId: this.idConnector, toId: this.action.intentName})
    this.updateAndSaveAction.emit();
  }
  
}
