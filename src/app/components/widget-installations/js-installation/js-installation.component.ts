import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import {
  URL_install_tiledesk_on_website
} from 'app/utils/util';

@Component({
  selector: 'appdashboard-js-installation',
  templateUrl: './js-installation.component.html',
  styleUrls: ['./js-installation.component.scss']
})
export class JsInstallationComponent implements OnInit {
  URL_install_tiledesk_on_website = URL_install_tiledesk_on_website;
  public hideHelpLink: boolean;
  constructor(
    public brandService: BrandService
  ) { 
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
  }
  
  ngOnInit() {
  }

}
