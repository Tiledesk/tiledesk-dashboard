import { Component, OnInit, Output, EventEmitter } from '@angular/core';


export enum TYPE_PLATFORM {
  JS= "js",
  PRESTASHOP = "prestashop",
  JOOMLA = "joomla",
  WORDPRESS = "wordprest",
  GTM = "google tag manager",
  SHOPIFY = 'shopify'
}

@Component({
  selector: 'cnp-widget-installation',
  templateUrl: './cnp-widget-installation.component.html',
  styleUrls: ['./cnp-widget-installation.component.scss']
})
export class CnpWidgetInstallationComponent implements OnInit {
  @Output() prevPage = new EventEmitter();
  @Output() nextPage = new EventEmitter();

  IS_OPEN_SETTINGS_SIDEBAR = false;
  isChromeVerGreaterThan100 = true;
  tparams: any;
  options: any[] = [];


  typePlatform = TYPE_PLATFORM;
  selectedPlatform: string;
  LABEL_PLACEHOLDER: string = 'Please choose...';

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }


  private initialize(){
    this.options = [
      {label: 'JavaScript', value:TYPE_PLATFORM.JS, image:'assets/img/integrations_apps/javascript.svg'},
      {label: 'Google Tag Manager', value:TYPE_PLATFORM.GTM, image:'assets/img/integrations_apps/googletagmanager.svg'},
      {label: 'Shopify', value:TYPE_PLATFORM.SHOPIFY, image:'assets/img/integrations_apps/shopify.svg'},
      {label: 'Wordpress', value:TYPE_PLATFORM.WORDPRESS, image:'assets/img/integrations_apps/wordpress.svg'},
      {label: 'Prestashop', value:TYPE_PLATFORM.PRESTASHOP, image:'assets/img/integrations_apps/prestashop.svg'},
      {label: 'Joomla', value:TYPE_PLATFORM.JOOMLA, image:'assets/img/integrations_apps/joomla.svg'}
    ]
    this.selectedPlatform = this.options[0].value;
  }

  onSelected($event){
    // console.log('onSelected:::: ',$event);
    this.selectedPlatform = $event;
  }

  goToPrevStep(){
    this.prevPage.emit();
  }

  goToNextStep(){
    this.nextPage.emit();
  }


}
