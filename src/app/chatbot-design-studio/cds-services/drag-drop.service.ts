import { Injectable, ElementRef } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
@Injectable({
  providedIn: 'root'
})
export class DragDropService {
    
  private _connectedLists: CdkDropList[] = [];
  private _connectedIDLists: string[] = [];

  get connectedLists(): CdkDropList[] {
    return this._connectedLists;
  }

  get connectedIDLists(): string[] {
    return this._connectedIDLists;
  }

  addConnectedList(list: CdkDropList) {
    this._connectedLists.push(list);
  }
  addConnectedIDList(list: string) {
    this._connectedIDLists.push(list);
  }

  removeConnectedList(list: CdkDropList) {
    const index = this._connectedLists.indexOf(list);
    if (index > -1) {
      this._connectedLists.splice(index, 1);
    }
  }


  positionElementOnStage(dropPoint:any, receiverElementsDroppedOnStageReference:ElementRef, drawerOfItemsToZoomAndDragReference:ElementRef){
    let pos = {'x': 0,'y': 0};
    let point = {'x':0, 'y':0};
    const dropElement = receiverElementsDroppedOnStageReference.nativeElement;
    const posDropElement = dropElement.getBoundingClientRect();
    // console.log('drop X:', posDropElement.left);
    // console.log('drop Y:', posDropElement.top);
    point.x = dropPoint.x-posDropElement.left;
    point.y = dropPoint.y-posDropElement.top;
    // console.log('point:', point.x, point.y);
    const drawerElement = drawerOfItemsToZoomAndDragReference.nativeElement;
    const rectDrawerElement = drawerElement.getBoundingClientRect();
    // console.log('drawer X:', rectDrawerElement.left);
    // console.log('drawer Y:', rectDrawerElement.top);
    let scaleValue = 1;
    try {
      const transform = drawerElement.style.transform; 
      const scaleMatch = transform.match(/scale\((.*?)\)/);
      if (scaleMatch) {
        scaleValue = scaleMatch[1];
        // console.log('Scala di trasformazione:', scaleValue);
      }
    } catch (error) {
      console.error('ERROR: ', error);
    }
    let diffX = (rectDrawerElement.left - posDropElement.left);
    let diffY = (rectDrawerElement.top - posDropElement.top);
    // console.log('diff X:', diffX);
    // console.log('diff Y:', diffY);
    pos.x = (point.x - diffX)/scaleValue;
    pos.y = (point.y - diffY)/scaleValue;
    console.log('new pos:', pos.x, pos.y);
    return pos;
  }

}