import { ActionIntentConnected } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './cds-action-intent.component.html',
  styleUrls: ['./cds-action-intent.component.scss']
})
export class CdsActionIntentComponent implements OnInit {

  @Input() IDintentSelected: string;
  @Input() action: ActionIntentConnected;

  idAction: string;

  constructor(
    private logger: LoggerService,
    ) { }

  ngOnInit(): void {
    console.log("[ACTION-INTENT] elementSelected: ", this.action);
    this.initialize();
  }

  ngOnChanges() {
    if(this.action && this.action.intentName) {
    }
  }

  ngAfterViewInit(){
    console.log('ngAfterViewInit -------------> ');

    // document.addEventListener(
    //   "scaled",
    //   (e:CustomEvent) => {
    //     console.log("event:", e);
    //     this.tiledeskConnectors.scale = e.detail.scale;
    //     console.log("changing connectors scale:", this.tiledeskConnectors.scale);
    //   },
    //   false
    // );
  }

  private initialize() {
    this.idAction = this.IDintentSelected+'/'+this.action._tdActionId;
  }



  

  // onChangeSelect(event: {name: string, value: string}){
  //   this.action.intentName = event.value
  //   if(!this.action._tdActionTitle){
  //     // this.action._tdActionTitle = this.intents.find(intent => intent.value === event.value).name
  //   }
  // }

  // mi sottoscrivo all'evento drag dei connettori e aggiorno ...

}
