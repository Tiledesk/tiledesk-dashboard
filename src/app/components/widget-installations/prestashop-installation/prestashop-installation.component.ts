import { Component, OnInit } from '@angular/core';
import { BrandService } from 'app/services/brand.service';
import {
  URL_install_tiledesk_on_prestashop
} from 'app/utils/util';
@Component({
  selector: 'appdashboard-prestashop-installation',
  templateUrl: './prestashop-installation.component.html',
  styleUrls: ['./prestashop-installation.component.scss']
})
export class PrestashopInstallationComponent implements OnInit {
  URL_install_tiledesk_on_prestashop = URL_install_tiledesk_on_prestashop;
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
