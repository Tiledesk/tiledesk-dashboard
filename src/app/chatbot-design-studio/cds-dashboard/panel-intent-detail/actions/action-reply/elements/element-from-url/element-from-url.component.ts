import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { Metadata } from '../../../../../../../models/intent-model';

@Component({
  selector: 'appdashboard-element-from-url',
  templateUrl: './element-from-url.component.html',
  styleUrls: ['./element-from-url.component.scss']
})
export class ElementFromUrlComponent implements OnInit {
  @ViewChild('imageUploaded', { static: false }) myIdentifier: ElementRef;
  @Output() loadPathElement = new EventEmitter();
  @Input() metadata: Metadata;

  showAddImage = false;
  pathElement: string;
  pathElementUrl: any;
  widthElement: string;
  heightElement: string;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if(this.metadata.src == ''){
      this.showAddImage = true;
    }
    // this.pathElement = "https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=0";
    // this.sanitizer.bypassSecurityTrustResourceUrl(this.pathElement);
  }


  // private setElementSize(){
  //   setTimeout(() => {
  //     try {
  //       var width = this.myIdentifier.nativeElement.offsetWidth;
  //       var height = this.myIdentifier.nativeElement.offsetHeight;
  //       this.myIdentifier.nativeElement.setAttribute("width", width);
  //       this.myIdentifier.nativeElement.setAttribute("height", height);
  //       // this.metadata.src = this.previewImage;
  //       // this.metadata.width = width;
  //       // this.metadata.height = height;
  //     } catch (error) {
  //       console.log('myIdentifier:' + error);
  //     }
  //   }, 0);
  // }

  onCloseImagePanel(){
    this.showAddImage = false;
  }

  onRemoveImage(){
    
  }

  onLoadPathElement(){
    //this.pathElement = "https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=0";
    this.metadata.width = this.widthElement;
    this.metadata.height = this.heightElement;
    this.metadata.src = this.pathElement;
    //console.log(this.pathElementUrl);
    this.showAddImage = false;
    this.loadPathElement.emit();
  }
}
