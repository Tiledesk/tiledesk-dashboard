import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import {
  URL_install_tiledesk_on_shopify
} from 'app/utils/util';
@Component({
  selector: 'appdashboard-shopify-installation',
  templateUrl: './shopify-installation.component.html',
  styleUrls: ['./shopify-installation.component.scss']
})
export class ShopifyInstallationComponent implements OnInit {
  URL_install_tiledesk_on_shopify = URL_install_tiledesk_on_shopify;
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
