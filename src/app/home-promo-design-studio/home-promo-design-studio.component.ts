import { User } from './../models/user-model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'appdashboard-home-promo-design-studio',
  templateUrl: './home-promo-design-studio.component.html',
  styleUrls: ['./home-promo-design-studio.component.scss']
})
export class HomePromoDesignStudioComponent implements OnInit {

  @Input() user: User;
  
  url: SafeResourceUrl = null;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/SgDGwvVoqWE')
  }

  goToSite(){
    window.open('https://www.youtube.com/watch?v=b0laljUl85E', '_blank')
  }

}
