import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Action, Button} from '../../models/intent-model';

/** CLASSE DI SERVICES PER GESTIRE GLI STATI (OPEN/CLOSE) TRA GLI ELEMENTI DELLA DASHBOARD COME I PANNELLI **/

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  isOpenButtonPanel: boolean = false;
  buttonSelected: Button;

  private buttonSource = new Subject<Button>();
  public isOpenButtonPanel$ = this.buttonSource.asObservable();

  private actionSource = new Subject<Action>();
  public isOpenActionDetailPanel$ = this.actionSource.asObservable();

  constructor() {
    
  }


  public openButtonPanel(button){
    console.log('openButtonPanel:: ', button);
    this.buttonSource.next(button);
  }

  public openActionDetailPanel(action: Action){
    console.log('openButtonPanel:: ', action);
    this.actionSource.next(action);
  }

  public closeButtonPanel(){
    console.log('closeButtonPanel:: ');
    this.buttonSource.next();
  }

  public closeActionDetailPanel(){
    console.log('closeActionDetailPanel:: ');
    this.actionSource.next();
  }



}
