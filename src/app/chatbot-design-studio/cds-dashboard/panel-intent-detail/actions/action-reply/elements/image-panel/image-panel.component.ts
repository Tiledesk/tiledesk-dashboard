import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Metadata } from '../../../../../../../models/intent-model';
import { MESSAGE_METADTA_WIDTH, MESSAGE_METADTA_HEIGHT } from '../../../../../../utils';

@Component({
  selector: 'appdashboard-image-panel',
  templateUrl: './image-panel.component.html',
  styleUrls: ['./image-panel.component.scss']
})
export class ImagePanelComponent implements OnInit {
  @Output() closeImagePanel = new EventEmitter();
  @Input() metadata: Metadata;
  
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;
  showAddImage: boolean;

  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.showAddImage = true;
    this.imageUrl = this.metadata.src;
    this.imageWidth = this.metadata.width;
    this.imageHeight = this.metadata.height;
    if(this.imageUrl && this.imageUrl.length>0){
      this.showAddImage = false;
    }
  }

  // EVENT FUNCTIONS //
  /** */
  onCloseImagePanel(){
    let image = {
      url: this.imageUrl,
      width: this.imageWidth,
      height: this.imageHeight,
    }
    if(this.imageUrl){
      this.showAddImage = false;
    } else {
      this.showAddImage = true;
    }
    console.log('onCloseImagePanel:: ', image, this.imageUrl);
    this.closeImagePanel.emit(image);
  }

  onRemoveImage(){
    this.imageUrl = null;
    this.imageWidth = MESSAGE_METADTA_WIDTH;
    this.imageHeight = MESSAGE_METADTA_HEIGHT;
    this.onCloseImagePanel();
  }
}
