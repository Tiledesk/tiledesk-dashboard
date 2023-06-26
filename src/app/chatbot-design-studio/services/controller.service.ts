import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


import { Button} from '../../models/intent-model';

@Injectable({
  providedIn: 'root'
})
export class ControllerService {

  isOpenButtonPanel: boolean = false;
  buttonSelected: Button;

  private buttonSource = new Subject<Button>();
  public isOpenButtonPanel$ = this.buttonSource.asObservable();

  constructor() { }



  public openButtonPanel(button){
    // this.isOpenButtonPanel = isOpenButtonPanel;
    console.log('openButtonPanel:: ', button);
    this.buttonSource.next(button);
  }

  public closeButtonPanel(){
    // this.isOpenButtonPanel = isOpenButtonPanel;
    console.log('closeButtonPanel:: ');
    this.buttonSource.next();
  }
}
