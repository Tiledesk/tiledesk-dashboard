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

  setDrawer(){
    this.tiledeskStage.setDrawer();
  }

  centerStageOnPosition(pos){
    let intervalId = setInterval(async () => {
      const result = await this.tiledeskStage.centerStageOnPosition(pos);
      if (result === true) {
        clearInterval(intervalId);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 1000);
  }

  centerStageOnTopPosition(pos){
    let intervalId = setInterval(async () => {
      const result = await this.tiledeskStage.centerStageOnTopPosition(pos);
      if (result === true) {
        clearInterval(intervalId);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 1000);
  }

  centerStageOnHorizontalPosition(pos){
    let intervalId = setInterval(async () => {
      const result = await this.tiledeskStage.centerStageOnHorizontalPosition(pos);
      if (result === true) {
        clearInterval(intervalId);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(intervalId);
    }, 1000);
  }


  setDragElement(elementId:string) {
    const element = document.getElementById(elementId);
    console.log("[STAGE SERVICE] imposto il drag sull'elemento ", elementId, element);
    if(element)this.tiledeskStage.setDragElement(element);
  }
  

  physicPointCorrector(point){
    return this.tiledeskStage.physicPointCorrector(point);
  }
  

  // getScale(){
  //   return this.tiledeskStage.scale;
  // }
}
