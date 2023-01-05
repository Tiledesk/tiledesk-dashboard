import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'

@Component({
  selector: 'appdashboard-element-from-url',
  templateUrl: './element-from-url.component.html',
  styleUrls: ['./element-from-url.component.scss']
})
export class ElementFromUrlComponent implements OnInit {

  showAddImage = true;
  pathElement: string;
  widthElement: string;
  heightElement: string;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.pathElement = "https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=0";
    this.sanitizer.bypassSecurityTrustResourceUrl(this.pathElement);
  }


  onCloseImagePanel(){
    this.showAddImage = false;
  }

  onRemoveImage(){
    
  }
}
