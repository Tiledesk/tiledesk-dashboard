import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cnp-widget-installation',
  templateUrl: './cnp-widget-installation.component.html',
  styleUrls: ['./cnp-widget-installation.component.scss']
})
export class CnpWidgetInstallationComponent implements OnInit {

  IS_OPEN_SETTINGS_SIDEBAR = false;
  isChromeVerGreaterThan100 = true;
  tparams: any;

  options: any[] = [];

  constructor() { }

  ngOnInit(): void {
    this.initialize();
  }


  private initialize(){
    this.options = [
      {label: 'JavaScript', value:'vavascript', image:'assets/img/integration_app/javascript.svg'},
      {label: 'Google Tag Manager', value:'google_tag_manager', image:'./assets/img/integration_app/googletagmanager.svg'},
      {label: 'Shopify', value:'shopify', image:'assets/img/integration_app/shopify.svg'},
      {label: 'Wordpress', value:'wordpress', image:'assets/img/integration_app/wordpress.svg'},
      {label: 'Prestashop', value:'prestashop', image:'assets/img/integration_app/prestashop.svg'},
      {label: 'Joomla', value:'joomla', image:'assets/img/integration_app/joomla.svg'}
    ]
  }

  onSelected($event){
    console.log('onSelected:::: ',$event);

  }
}
