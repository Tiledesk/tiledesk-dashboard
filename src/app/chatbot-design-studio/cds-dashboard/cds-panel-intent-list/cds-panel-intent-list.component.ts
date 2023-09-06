import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { Intent } from 'app/models/intent-model';

@Component({
  selector: 'cds-panel-intent-list',
  templateUrl: './cds-panel-intent-list.component.html',
  styleUrls: ['./cds-panel-intent-list.component.scss']
})

export class CdsPanelIntentListComponent implements OnInit, OnChanges {

  @Input() IS_OPEN: boolean;
  @Input() listOfIntents: Intent[];
  @Input() intent_id: string;
  @Input() updatePanelIntentList: boolean;
  @Output() selectIntent = new EventEmitter();
  @Output() deleteIntent = new EventEmitter();
 
  internalIntents: Intent[] = [];
  defaultIntents: Intent[] = [];
  filteredIntents: Intent[] = [];
  
  idSelectedIntent: string;
  selectedIntent: Intent;

  TOPIC_INTERNAL = 'internal';
  DISPLAY_NAME_START = "start";
  DISPLAY_NAME_DEFAULT_FALLBACK = "defaultFallback";
  ICON_DEFAULT = 'label_important_outline';
  ICON_ROCKET = 'rocket_launch';
  ICON_UNDO = 'undo';

  constructor(
    private logger: LoggerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    // console.log('ngOnInit:: ');
  }


  // ngOnChanges funziona con gli @input bindati in html
  ngOnChanges(changes: SimpleChanges) {
    console.log('[CdsPanelIntentListComponent] ngOnChanges::', this.listOfIntents);
    // console.log(changes);
    setTimeout(() => {
      this.initialize();
    },0);
  }

  private initialize(){
    // console.log('initialize:: ');
    if(this.listOfIntents && this.listOfIntents.length>0){
      this.selectedIntent = null;
      this.preselectIntent();
      this.setDefaultIntents();
    }
  }

  private setDefaultIntents(){
    this.internalIntents = this.listOfIntents.filter(obj => ( obj.intent_display_name.trim() === this.DISPLAY_NAME_START || obj.intent_display_name.trim() === this.DISPLAY_NAME_DEFAULT_FALLBACK));
    this.defaultIntents = this.listOfIntents.filter(obj => ( obj.intent_display_name.trim() !== this.DISPLAY_NAME_START && obj.intent_display_name.trim() !== this.DISPLAY_NAME_DEFAULT_FALLBACK));
    this.internalIntents = this.moveItemToPosition(this.internalIntents, this.DISPLAY_NAME_START, 0);
    this.internalIntents = this.moveItemToPosition(this.internalIntents, this.DISPLAY_NAME_DEFAULT_FALLBACK, 1);
    this.filteredIntents = this.defaultIntents;
    
  }

  private moveItemToPosition(array, DISPLAY_NAME, position) {
    if (position < 0 || position >= array.length) {
      return array;
    }
    const startIndex = array.findIndex(item => item.intent_display_name.trim() === DISPLAY_NAME);
    if (startIndex === -1 || startIndex === position) {
      return array;
    }
    const itemToMove = array[startIndex];
    array.splice(startIndex, 1);
    array.splice(position, 0, itemToMove);
    return array;
  }


  private preselectIntent() {
    if (this.intent_id != '0') {
      let index = this.filteredIntents.indexOf(this.filteredIntents.find(o => o.id === this.intent_id));
      if (index == -1) {
        if (this.defaultIntents.indexOf(this.defaultIntents.find(o => o.id === this.intent_id)) === 1) {
          this.selectedIntent = this.defaultIntents.find(o => o.id == this.intent_id);
          index = -2;
        } else {
          this.selectedIntent = this.defaultIntents.find(o => o.id == this.intent_id);
        }
      } else {
        this.selectedIntent = this.filteredIntents.find(o => o.id == this.intent_id);
      }
    }
  }




  


  /** EVENTS  */

  onGetIconForName(name){
    let icon = this.ICON_DEFAULT;
    if (name.trim() === this.DISPLAY_NAME_START) {
      icon = this.ICON_ROCKET;
    } else if (name.trim() === this.DISPLAY_NAME_DEFAULT_FALLBACK) {
      icon = this.ICON_UNDO;
    }
    return icon;
  }

  /** Search a block... */
  onLivesearch(text: string) {
    // console.log("onLivesearch: ", text);
    this.filteredIntents = this.defaultIntents.filter(element => element.intent_display_name.toLowerCase().includes(text.toLowerCase()));
  }

  onSelectIntent(intent: Intent, index: string) {
    this.idSelectedIntent = index;
    this.selectedIntent = intent;
    this.selectIntent.emit(intent);
  }


  onDeleteButtonClicked(intent) {
    this.deleteIntent.emit(intent);
  }


}
