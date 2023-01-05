import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-element-from-url',
  templateUrl: './element-from-url.component.html',
  styleUrls: ['./element-from-url.component.scss']
})
export class ElementFromUrlComponent implements OnInit {

  showAddImage = false;
  imageUrl: string;
  imageWidth: string;
  imageHeight: string;

  constructor() { }

  ngOnInit(): void {
  }


  onCloseImagePanel(){

  }

  onRemoveImage(){
    
  }
}
