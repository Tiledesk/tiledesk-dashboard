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



  private buttonSource = new Subject<Button>();
  public isOpenButtonPanel$ = this.buttonSource.asObservable();

  constructor() {
    
  }


  public openButtonPanel(button){
    console.log('openButtonPanel:: ', button);
    this.buttonSource.next(button);
  }

  public closeButtonPanel(){
    console.log('closeButtonPanel:: ');
    this.buttonSource.next();
  }



}
