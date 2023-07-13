import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Button} from '../../models/intent-model';

/** CLASSE DI SERVICES PER GESTIRE GLI STATI (OPEN/CLOSE) TRA GLI ELEMENTI DELLA DASHBOARD COME I PANNELLI **/

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  isOpenButtonPanel: boolean = false;
  buttonSelected: Button;

  // Actions
  private actionType = new Subject<Button>();
  public isOpenActionPanel$ = this.actionType.asObservable();

  // Buttons 
  private buttonSource = new Subject<Button>();
  public isOpenButtonPanel$ = this.buttonSource.asObservable();



  constructor() { }
 // Actions
  public openActionDetailPanel(actiontype) {
    console.log('[CONTROLLER-SERVICE] openActionDetailPanel:: action type ', actiontype);
    this.actionType.next(actiontype)
  }

  public closeActionDetailPanel(){
    console.log('closeActionDetailPanel:: ');
    this.actionType.next();
  }

   // Buttons 
  public openButtonPanel(button){
    console.log('openButtonPanel:: ', button);
    this.buttonSource.next(button);
  }

  public closeButtonPanel(){
    console.log('closeButtonPanel:: ');
    this.buttonSource.next();
  }



}
