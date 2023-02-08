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
  constructor() { }

  ngOnInit(): void {
  
  }

  goToSite(){
    window.open('https://youtu.be/USVKeiiFZ7o', '_blank')
  }

}
