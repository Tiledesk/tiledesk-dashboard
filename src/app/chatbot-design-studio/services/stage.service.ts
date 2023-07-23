import { Injectable } from '@angular/core';
import { TiledeskStage } from 'assets/cds/js/tiledesk-stage.js';

@Injectable({
  providedIn: 'root'
})
export class StageService {

  tiledeskStage: any;

  constructor() { }


  initializeStage(){
    this.tiledeskStage = new TiledeskStage('tds_container', 'tds_drawer', 'tds_draggable');
  }


  centerStageOnPosition(pos){
    this.tiledeskStage.centerStageOnPosition(pos);
  }


  // getScale(){
  //   return this.tiledeskStage.scale;
  // }
}
