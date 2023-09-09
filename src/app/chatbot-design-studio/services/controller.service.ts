import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Action, Button, Form} from '../../models/intent-model';
import { TYPE_INTENT_ELEMENT } from '../utils';

/** CLASSE DI SERVICES PER GESTIRE GLI STATI (OPEN/CLOSE) TRA GLI ELEMENTI DELLA DASHBOARD COME I PANNELLI **/

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  isOpenButtonPanel: boolean = false;
  buttonSelected: Button;

  private buttonSource = new Subject<Button>();
  public isOpenButtonPanel$ = this.buttonSource.asObservable();

  private actionSource = new Subject<{type: TYPE_INTENT_ELEMENT, element: Action | string | Form}>();
  public isOpenActionDetailPanel$ = this.actionSource.asObservable();

  constructor() {
    
  }


  // Buttons s
  public openButtonPanel(button){
    console.log('openButtonPanel:: ', button);
    this.buttonSource.next(button);
  }

  public closeButtonPanel(){
    console.log('closeButtonPanel:: ');
    this.buttonSource.next();
  }

  // action detail panel
  public openActionDetailPanel(type: TYPE_INTENT_ELEMENT, element: Action | string | Form){
    console.log('openButtonPanel:: ', type, element);
    this.actionSource.next({type, element});
  }

  public closeActionDetailPanel(){
    console.log('closeActionDetailPanel:: ');
    this.actionSource.next({type: null, element: null});
  }



}
